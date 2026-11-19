// tracker.js — saved progress for the Leonida Trophy Guide.
// Progress lives only in this browser (localStorage) and in files the reader
// exports. Nothing is sent anywhere: the app makes no network requests.
export const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';

// A small fixed demo set used only when the page is opened with ?demo=1,
// so a screenshot can show a partly-filled tracker. Never used otherwise.
export const DEMO_EARNED_IDS = [2, 3, 4, 8, 15, 16, 20, 21, 35, 42, 46, 53];

/** Load the earned set (trophy ids) from localStorage. Tolerates bad data. */
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

/** Persist the earned set (trophy ids) to localStorage. */
export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable (private mode): progress just won't persist.
  }
}

/** Seed the demo set when ?demo=1 is present and nothing is saved yet. */
export function seedDemoIfRequested() {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') !== '1') return loadEarned();
  const current = loadEarned();
  if (current.size > 0) return current;
  const demo = new Set(DEMO_EARNED_IDS);
  saveEarned(demo);
  return demo;
}

/** Build the export document: version, date, and the earned trophy ids. */
export function buildExportDocument(earned) {
  return {
    app: 'gta6-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
}

/** Download the export document as a JSON file. */
export function exportProgress(earned) {
  const doc = buildExportDocument(earned);
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return doc;
}

/**
 * Parse an imported file's text into an earned set.
 * Accepts our export format ({earned: [...]}) and a bare array of ids.
 * Returns { earned } or { error }.
 */
export function parseImport(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'That file is not valid JSON.' };
  }
  const ids = Array.isArray(parsed) ? parsed : parsed?.earned;
  if (!Array.isArray(ids)) {
    return { error: 'That file has no earned-trophy list in it.' };
  }
  const earned = new Set(ids.filter((n) => Number.isInteger(n)));
  return { earned };
}

/** Read a File object as text, then parse it with parseImport. */
export async function importProgressFile(file) {
  const text = await file.text();
  return parseImport(text);
}
