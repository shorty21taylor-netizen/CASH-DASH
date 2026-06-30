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

export function getIncomePaySettings() {
  const stored = cache.accounts.find((a) => a.id === 'income_pay_settings');
  if (!stored) return {
    id: 'income_pay_settings',
    base_pays: [],
    retainers: { i2i: { enabled: false, amount: 0 }, bnb: { enabled: false, amount: 0 } },
    additional_income: [],
    bonus_tiers: { enabled: false, threshold_type: 'revenue', tiers: [] },
  };
  const result = { ...stored };
  if (result.base_pay && !result.base_pays) {
    const bp = result.base_pay;
    result.base_pays = (bp.enabled && bp.amount > 0)
      ? [{ id: 'migrated_1', label: 'Base Pay', amount: Number(bp.amount) || 0, frequency: bp.frequency || 'bi-weekly', start_date: bp.start_date || '' }]
      : [];
    delete result.base_pay;
  }
  if (!Array.isArray(result.base_pays)) result.base_pays = [];
  return result;
}

function freqToMonthly(amount, freq) {
  const amt = Number(amount) || 0;
  return freq === 'weekly' ? amt * 52 / 12
    : freq === 'bi-weekly' ? amt * 26 / 12
    : freq === 'semi-monthly' ? amt * 2
    : freq === 'monthly' ? amt
    : freq === 'annually' ? amt / 12
    : freq === 'yearly' ? amt / 12
    : amt;
}

export function expandRecurringIncome(incomePaySettings, months) {
  const ips = incomePaySettings || getIncomePaySettings();
  let total = 0;

  (ips.base_pays || []).forEach((bp) => {
    total += freqToMonthly(bp.amount, bp.frequency || 'bi-weekly') * months;
  });

  if (ips.retainers?.i2i?.enabled) total += (Number(ips.retainers.i2i.amount) || 0) * months;
  if (ips.retainers?.bnb?.enabled) total += (Number(ips.retainers.bnb.amount) || 0) * months;

  (ips.additional_income || []).forEach((inc) => {
    total += freqToMonthly(inc.amount, inc.frequency || 'monthly') * months;
  });

  return total;
}
