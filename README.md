# Leonida Trophy Guide — GTA VI (PS5)

[![GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/norv33/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/norv33/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5 — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

Open `app/index.html` in desktop Chrome (or run `node serve.ts` and open http://localhost:8080). It works with the network off: every file it loads is a file under `app/`.

- **All 55 trophies** with their official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze). No online trophies.
- **Tracker**: tick trophies off; progress is saved in your browser (localStorage), with export to a JSON file and import back.
- **Filters**: search, grade, kind (story / missable / collectibles / activities / completion), and earned status.
- **Spoiler setting** (on by default): story trophies stay hidden — name, description and guide — until you earn them or turn the setting off. It hides them in the roadmap too.
- **Platinum roadmap**: five stages in the order to play them, with the trophies each stage covers.
- **Missable warnings**: the one trophy the sources flag as missable, plus the rules that protect a run (manual saves, no cheats).
- **A cited guide for every trophy**, in our own words, with its sources named beside it.

## How to run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

To hand it in (what `main.ts` does): copy `app/` and `screenshots/` to the output folder and write `dossier.json` with the vendored library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

Four screenshots of the app, in `screenshots/` (see `shots.json` for the exact view each was taken of):

1. `1-guide.jpg` — the checklist with the platinum guide open, progress 12/55, filters and the spoiler setting visible.
2. `2-roadmap.jpg` — the platinum roadmap, stages 0–1, with trophy chips; story trophies masked by the spoiler setting.
3. `3-detail.jpg` — a trophy guide open with its sources: The Shootist (silver, 42 Shooting Range challenges).
4. `4-spoiler.jpg` — the spoiler setting at work: 13 un-earned story trophies shown as hidden.

## Deep links

The app reads its starting state from the URL, so a link can open a specific view: `?view=roadmap`, `?view=missable`, `?view=about`, `?grade=silver`, `?kind=story`, `?status=todo`, `?q=shootist`, `?open=17` (open a trophy's guide), `?spoiler=off`, and `?demo=1` (seeds a sample 12/55 progress in an empty browser, for trying the tracker). None of these change the shipped files — they only set the starting state in the browser that opens the link.

## Where the facts come from — and what is not verified yet

The names, descriptions and grades are the official PlayStation 5 list as reported 18 Nov 2026 — Exophase and PSNProfiles agree on every entry (see the Sources & honesty tab in the app for the full list of sources). The counts PlayStation tracks (42 Shooting Range challenges, 14 drone race locations, 18 meditation spots, 52 areas, 9 gangs, 8 garages) come from that same list data.

The game released 19 Nov 2026, so step-by-step methods for a few trophies had no confirmed source at launch — *In The Beginning…*, *Capital Offense*, *Bad Luck, I Guess*, *The Truth Is Out There*, *Ten Pin*, *Challenging Tank*, *Personal Best* and *Actions Speak Louder*. Their guides say so plainly instead of inventing a method. Only one trophy is flagged missable by the sources (Positive Mental Attitude); whether any other trophy can be missed is still unconfirmed, so the guide tells you to keep chapter-start saves rather than promise that nothing else can be missed.

Guide text is written in our own words for this entry. It draws on the sources listed in the app and cites them per trophy; it never copies another guide's text. No Rockstar logo, artwork, or game screenshots are used.

## Files

- `app/` — the guide itself: `index.html`, `style.css`, `app.js`, `tracker.js`, `guide.js`, `data/trophies.json`
- `vendor/makefun-frontend.ts` — vendored make.fun library, unchanged
- `main.ts` — builds `/output` (app + screenshots + dossier.json)
- `serve.ts` — tiny local server for trying the guide
- `screenshots/` — 4 screenshots of the app (checklist, roadmap, a guide with its sources, the spoiler setting)
- `shots.json` — which view each screenshot was taken of
- `LICENSE` — MIT

Unofficial fan guide. Not affiliated with Rockstar Games, Take-Two Interactive, Sony Interactive Entertainment, or PlayStation.
