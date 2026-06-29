import { getAll, upsert, softDelete, initDB } from './db.js';

const cache = {
  commissions: [],
  policies: [],
  life_os: [],
  initialized: false,
};

export async function initStore() {
  if (cache.initialized) return cache;
  try {
    await initDB();
    cache.commissions = await getAll('commissions');
    cache.policies = await getAll('policies');
    cache.life_os = await getAll('life_os');
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

export async function saveCommission(data) {
  await upsert('commissions', data.id, data);
  cache.commissions = cache.commissions.filter((c) => c.id !== data.id);
  cache.commissions.unshift(data);
  return data;
}

export async function deleteCommission(id) {
  await softDelete('commissions', id);
  cache.commissions = cache.commissions.filter((c) => c.id !== id);
}

export async function savePolicy(data) {
  await upsert('policies', data.id, data);
  cache.policies = cache.policies.filter((p) => p.id !== data.id);
  cache.policies.unshift(data);
  return data;
}

export async function deletePolicy(id) {
  await softDelete('policies', id);
  cache.policies = cache.policies.filter((p) => p.id !== id);
}

export async function saveLifeOS(data) {
  await upsert('life_os', data.id, data);
  cache.life_os = cache.life_os.filter((item) => item.id !== data.id);
  cache.life_os.unshift(data);
  return data;
}

export async function deleteLifeOS(id) {
  await softDelete('life_os', id);
  cache.life_os = cache.life_os.filter((item) => item.id !== id);
}
