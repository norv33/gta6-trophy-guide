// guide.js — rendering for the Leonida Trophy Guide: the checklist, the
// platinum roadmap, the missable warnings, and the spoiler masking.
// Data comes from data/trophies.json; nothing here is copied from a kit file.
import { loadEarned, saveEarned, seedDemoIfRequested, exportProgress, importProgressFile } from './tracker.js';

const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = { story: 'Story', missable: 'Missable', collectible: 'Collectible', activity: 'Activity', completion: 'Completion' };

export const ROADMAP_STAGES = [
  {
    title: 'Stage 0 — Before you start',
    text: 'Set the run up right: turn cheats off (they disable trophies and saving), and make a manual save at the start of Chapter 1. Repeat that save at the start of every chapter and once more before the final mission — there is no mission replay, so those saves are your only way back.',
    trophyIds: [],
  },
  {
    title: 'Stage 1 — Play the story (Chapters 1–4 + finale)',
    text: 'Play straight through the story. All 12 story trophies land here. In Chapter 1, meditate at Lucia’s balcony spot before the chapter ends — it is the one missable. Both protagonists become playable in Chapter 2, which opens up most side activities.',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: 'Stage 2 — Side strands & character arcs',
    text: 'Between and after story missions, clear the side strands: the 8 stranger strands across Leonida, the five character finales (Andy, Kenton, Billy, Randy, Tyrone), and Bret’s hunt. Doing them as they appear beats hunting for a forgotten strand later.',
    trophyIds: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    title: 'Stage 3 — Collectibles & exploration',
    text: 'Explore all 52 areas, scan 100 locations with the WAiNK app, pick up cards toward 3 full sets, discover 100 vehicles, meditate at all 18 spots, buy all 8 garages, and register 10 vehicles in the Scooter Bros app. Scan everything as you travel — the WAiNK count and the vehicle count climb together.',
    trophyIds: [28, 30, 31, 35, 42, 54, 55],
  },
  {
    title: 'Stage 4 — Activities, combat & crime',
    text: 'The long middle: 250 stunts, gold in all 42 Shooting Range challenges, drone and street races, fishing, arcade, bowling, 50 challenges, the robbery set (jewelry store, 5 bank vaults, armored trucks, one illegal operation per gang), wanted-level escapes, and the economy trophies (launder $250,000, spend $100,000). Leave the unconfirmed ones for last and check a current guide before grinding them.',
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 32, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
  },
  {
    title: 'Stage 5 — Cleanup, 100%, platinum',
    text: 'Check the in-game completion stats for what is left, finish it to 100% for the gold A Long Road, and the platinum Vice Got a Price! pops right after. Estimated total: around 200 hours.',
    trophyIds: [14, 1],
  },
];

/** A trophy counts as story-spoiler when it reveals a chapter, mission or ending. */
export function isSpoilerTrophy(trophy) {
  return trophy.spoiler === true;
}

/** True when the trophy's name/description/guide must stay hidden right now. */
export function isHiddenNow(trophy, earned, spoilersOn) {
  return spoilersOn && isSpoilerTrophy(trophy) && !earned.has(trophy.id);
}

/** Kind filter match: "missable" means flagged missable or possibly missable. */
export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true || trophy.missable === 'possible';
  return trophy.kind === kind;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeBadge(trophy) {
  return el('span', `badge ${trophy.grade}`, GRADE_LABEL[trophy.grade]);
}

function sourceLink(source) {
  const li = el('li');
  const a = el('a', undefined, source.name);
  a.href = source.url;
  a.target = '_blank';
  a.rel = 'noopener';
  li.append(a, ` — ${source.what}`);
  return li;
}

function trophyGuideBlock(trophy, data) {
  const wrap = el('div', 'guide');
  wrap.hidden = true;
  wrap.append(el('h4', undefined, 'How to get it'));
  wrap.append(el('p', undefined, trophy.guide));
  const unconfirmed = /no confirmed|unconfirmed|Treat .* as unconfirmed/i.test(trophy.guide);
  if (unconfirmed) {
    const note = el('p', undefined, '⚠ Method unconfirmed at launch — check a current community guide before grinding for this one.');
    note.style.color = 'var(--amber)';
    wrap.append(note);
  }
  wrap.append(el('h4', undefined, 'Sources'));
  const list = el('ul', 'sources');
  for (const key of trophy.src || []) {
    const source = data.sources[key];
    if (source) list.append(sourceLink(source));
  }
  if (!list.children.length) list.append(el('li', undefined, 'Official trophy list — PlayStation (see Sources & honesty).'));
  wrap.append(list);
  return wrap;
}

function renderTrophyItem(trophy, data, earned, spoilersOn, onToggle) {
  const li = el('li', 'trophy');
  if (earned.has(trophy.id)) li.classList.add('earned');
  const head = el('div', 'trophy-head');
  const box = el('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => onToggle(trophy.id, box.checked));
  const main = el('div', 'trophy-main');
  const hidden = isHiddenNow(trophy, earned, spoilersOn);
  if (hidden) {
    main.append(el('h3', 'trophy-name', '🔒 Hidden story trophy — earn it, or turn spoilers off to see it'));
    main.append(el('p', 'trophy-desc', 'Name and description hidden by the spoiler setting.'));
  } else {
    main.append(el('h3', 'trophy-name', trophy.name));
    main.append(el('p', 'trophy-desc', trophy.description));
  }
  const badges = el('div', 'badge-row');
  badges.append(gradeBadge(trophy));
  badges.append(el('span', 'badge kind', KIND_LABEL[trophy.kind] || trophy.kind));
  if (trophy.missable === true) badges.append(el('span', 'badge missable', 'Missable'));
  if (trophy.missable === 'possible') badges.append(el('span', 'badge possible', 'Possibly missable'));
  if (Number.isInteger(trophy.count)) badges.append(el('span', 'badge count', `Count: ${trophy.count}`));
  main.append(badges);
  const btn = el('button', 'guide-btn', 'Guide');
  btn.type = 'button';
  const guide = trophyGuideBlock(trophy, data);
  btn.addEventListener('click', () => {
    guide.hidden = !guide.hidden;
    btn.textContent = guide.hidden ? 'Guide' : 'Hide guide';
  });
  head.append(box, main, btn);
  li.append(head, guide);
  return { li, guide, btn };
}

function trophyMatches(trophy, filters, earned) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (!matchesKind(trophy, filters.kind)) return false;
  if (filters.status === 'earned' && !earned.has(trophy.id)) return false;
  if (filters.status === 'todo' && earned.has(trophy.id)) return false;
  if (filters.search) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(filters.search)) return false;
  }
  return true;
}

export function renderProgress(data, earned) {
  const total = data.trophies.length;
  const done = earned.size;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${Math.round((done / total) * 100)}%`;
  document.getElementById('progressFill').style.width = `${(done / total) * 100}%`;
  const chips = document.getElementById('gradeChips');
  chips.replaceChildren();
  for (const grade of GRADE_ORDER) {
    const have = data.trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    const all = data.trophies.filter((t) => t.grade === grade).length;
    chips.append(el('span', `chip ${grade}`, `${GRADE_LABEL[grade]} ${have}/${all}`));
  }
}

export function renderRoadmap(data, earned, spoilersOn) {
  const list = document.getElementById('roadmapStages');
  list.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const item = el('li', 'stage');
    item.append(el('h3', undefined, stage.title));
    item.append(el('p', undefined, stage.text));
    if (stage.trophyIds.length) {
      const chips = el('ul', 'stage-trophies');
      for (const id of stage.trophyIds) {
        const trophy = data.trophies.find((t) => t.id === id);
        if (!trophy) continue;
        const chip = el('li', undefined, isHiddenNow(trophy, earned, spoilersOn) ? 'Hidden story trophy' : trophy.name);
        if (isHiddenNow(trophy, earned, spoilersOn)) chip.classList.add('hidden-t');
        if (earned.has(id)) chip.classList.add('done');
        chips.append(chip);
      }
      item.append(chips);
    }
    list.append(item);
  }
}

export function renderMissables(data) {
  const list = document.getElementById('missableList');
  list.replaceChildren();
  const flagged = data.trophies.filter((t) => t.missable === true || t.missable === 'possible');
  for (const trophy of flagged) {
    const card = el('div', 'missable-card' + (trophy.missable === 'possible' ? ' possible' : ''));
    card.append(el('h3', undefined, (trophy.missable === true ? '⚠ Missable: ' : '⚠ Possibly missable: ') + trophy.name));
    card.append(el('p', undefined, trophy.guide));
    list.append(card);
  }
  const none = el('p', 'lede', 'Every other trophy can be earned after the story: nothing else in the list is flagged missable by the sources, and there are no online or difficulty trophies.');
  list.append(none);
}

export function renderSources(data) {
  const list = document.getElementById('sourcesList');
  list.replaceChildren();
  for (const [key, source] of Object.entries(data.sources)) {
    const li = el('li');
    const a = el('a', undefined, source.name);
    a.href = source.url;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a, ` [${key}] — ${source.what}`);
    list.append(li);
  }
}

export function createGuideApp(data) {
  const params = new URLSearchParams(location.search);
  let earned = seedDemoIfRequested();
  let spoilersOn = params.get('spoiler') !== 'off';
  const openId = Number(params.get('open')) || null;
  let activeView = ['checklist', 'roadmap', 'missable', 'about'].includes(params.get('view')) ? params.get('view') : 'checklist';

  const listEl = document.getElementById('trophyList');
  const countEl = document.getElementById('listCount');
  const emptyEl = document.getElementById('emptyNote');
  const spoilerToggle = document.getElementById('spoilerToggle');
  spoilerToggle.checked = spoilersOn;

  function currentFilters() {
    return {
      search: document.getElementById('search').value.trim().toLowerCase(),
      grade: document.getElementById('gradeFilter').value,
      kind: document.getElementById('kindFilter').value,
      status: document.getElementById('statusFilter').value,
    };
  }

  function renderList() {
    const filters = currentFilters();
    const shown = data.trophies.filter((t) => trophyMatches(t, filters, earned));
    listEl.replaceChildren();
    for (const trophy of shown) {
      const { li, guide, btn } = renderTrophyItem(trophy, data, earned, spoilersOn, (id, checked) => {
        if (checked) earned.add(id); else earned.delete(id);
        saveEarned(earned);
        renderAll();
      });
      if (openId === trophy.id) {
        guide.hidden = false;
        btn.textContent = 'Hide guide';
      }
      listEl.append(li);
    }
    countEl.textContent = `Showing ${shown.length} of ${data.trophies.length} trophies` +
      (spoilersOn ? ' — story spoilers hidden until earned.' : ' — spoilers shown.');
    emptyEl.hidden = shown.length > 0;
  }

  function renderAll() {
    renderProgress(data, earned);
    renderList();
    renderRoadmap(data, earned, spoilersOn);
  }

  function setView(view) {
    activeView = view;
    for (const name of ['checklist', 'roadmap', 'missable', 'about']) {
      document.getElementById(`view-${name}`).hidden = name !== view;
      document.getElementById(`tab${name[0].toUpperCase()}${name.slice(1)}`).classList.toggle('active', name === view);
    }
  }

  // Tabs.
  for (const name of ['checklist', 'roadmap', 'missable', 'about']) {
    document.getElementById(`tab${name[0].toUpperCase()}${name.slice(1)}`).addEventListener('click', () => setView(name));
  }

  // Filters re-render the list (and nothing else).
  for (const id of ['search', 'gradeFilter', 'kindFilter', 'statusFilter']) {
    document.getElementById(id).addEventListener('input', renderList);
    document.getElementById(id).addEventListener('change', renderList);
  }

  // Spoiler setting re-renders everything (list names and roadmap chips).
  spoilerToggle.addEventListener('change', () => {
    spoilersOn = spoilerToggle.checked;
    renderAll();
  });

  // Export / import / reset.
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(earned));
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = await importProgressFile(file);
    if (result.error) {
      countEl.textContent = `Import failed: ${result.error}`;
      return;
    }
    earned = result.earned;
    saveEarned(earned);
    renderAll();
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear all tracked progress? This cannot be undone. Export first if you want a backup.')) return;
    earned = new Set();
    saveEarned(earned);
    renderAll();
  });

  // Deep-link the filters from the URL (?grade=silver, ?kind=story, …).
  if (params.get('grade')) document.getElementById('gradeFilter').value = params.get('grade');
  if (params.get('kind')) document.getElementById('kindFilter').value = params.get('kind');
  if (params.get('status')) document.getElementById('statusFilter').value = params.get('status');
  if (params.get('q')) document.getElementById('search').value = params.get('q');

  renderMissables(data);
  renderSources(data);
  renderAll();
  setView(activeView);
  return { get earned() { return earned; } };
}
