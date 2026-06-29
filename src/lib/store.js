import { getAll, upsert, softDelete, initDB } from './db.js';
import { TABLES } from './constants.js';

const cache = {};
TABLES.forEach((t) => { cache[t] = []; });
cache.initialized = false;

export async function initStore() {
  if (cache.initialized) return cache;
  try {
    await initDB();
    for (const table of TABLES) {
      cache[table] = await getAll(table);
    }
    cache.initialized = true;
  } catch (err) {
    console.error('Store init failed (using empty cache):', err.message);
    cache.initialized = true;
  }
  return cache;
}

export function getCache() {
  return cache;
}

export async function saveRecord(table, data) {
  await upsert(table, data.id, data);
  cache[table] = cache[table].filter((r) => r.id !== data.id);
  cache[table].unshift(data);
  return data;
}

export async function deleteRecord(table, id) {
  await softDelete(table, id);
  cache[table] = cache[table].filter((r) => r.id !== id);
}
