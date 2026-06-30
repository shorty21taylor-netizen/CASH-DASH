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
  return stored || {
    id: 'income_pay_settings',
    base_pay: { enabled: false, amount: 0, frequency: 'bi-weekly', start_date: '' },
    retainers: { i2i: { enabled: false, amount: 0 }, bnb: { enabled: false, amount: 0 } },
    additional_income: [],
    bonus_tiers: { enabled: false, threshold_type: 'revenue', tiers: [] },
  };
}

export function expandRecurringIncome(incomePaySettings, months) {
  const ips = incomePaySettings || getIncomePaySettings();
  let total = 0;

  if (ips.base_pay?.enabled && ips.base_pay.amount > 0) {
    const freq = ips.base_pay.frequency || 'bi-weekly';
    const perMonth = freq === 'weekly' ? ips.base_pay.amount * 52 / 12
      : freq === 'bi-weekly' ? ips.base_pay.amount * 26 / 12
      : freq === 'semi-monthly' ? ips.base_pay.amount * 2
      : freq === 'monthly' ? ips.base_pay.amount
      : freq === 'annually' ? ips.base_pay.amount / 12
      : ips.base_pay.amount;
    total += perMonth * months;
  }

  if (ips.retainers?.i2i?.enabled) total += (ips.retainers.i2i.amount || 0) * months;
  if (ips.retainers?.bnb?.enabled) total += (ips.retainers.bnb.amount || 0) * months;

  (ips.additional_income || []).forEach((inc) => {
    const amt = inc.amount || 0;
    const freq = inc.frequency || 'monthly';
    const perMonth = freq === 'weekly' ? amt * 52 / 12
      : freq === 'bi-weekly' ? amt * 26 / 12
      : freq === 'semi-monthly' ? amt * 2
      : freq === 'monthly' ? amt
      : freq === 'annually' ? amt / 12
      : amt;
    total += perMonth * months;
  });

  return total;
}
