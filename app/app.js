// app.js — entry point for the Leonida Trophy Guide.
// Loads app/data/trophies.json (a file of this app, never the network) and
// hands the data to the guide renderer. If the data cannot load, the page
// says so instead of showing an empty list.
import { createGuideApp } from './guide.js';

const listEl = document.getElementById('trophyList');
const countEl = document.getElementById('listCount');

async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json failed to load (${response.status})`);
  return response.json();
}

try {
  const data = await loadTrophyData();
  if (!data || !Array.isArray(data.trophies) || data.trophies.length === 0) {
    throw new Error('trophies.json holds no trophies');
  }
  createGuideApp(data);
} catch (error) {
  countEl.textContent = 'The trophy data could not be loaded. Check that app/data/trophies.json is present, then reload.';
  const item = document.createElement('li');
  item.className = 'trophy';
  item.textContent = String(error?.message || error);
  listEl.replaceChildren(item);
}
