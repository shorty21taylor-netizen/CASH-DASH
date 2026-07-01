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
      ? [{ id: 'migrated_1', label: 'Base Pay', amount: Number(bp.amount) || 0, frequency: bp.frequency || 'bi-weekly', start_date: bp.start_date || '', stream: 'general' }]
      : [];
    delete result.base_pay;
  }
  if (!Array.isArray(result.base_pays)) result.base_pays = [];
  return result;
}

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function countWholeMonths(startDateStr, rangeStartDate, rangeEndDate) {
  const entryStart = parseDate(startDateStr);
  const effectiveStart = entryStart && entryStart.getTime() > rangeStartDate.getTime()
    ? entryStart : rangeStartDate;
  if (effectiveStart.getTime() > rangeEndDate.getTime()) return 0;
  const startMonth = effectiveStart.getFullYear() * 12 + effectiveStart.getMonth();
  const endMonth = rangeEndDate.getFullYear() * 12 + rangeEndDate.getMonth();
  return Math.max(0, endMonth - startMonth + 1);
}

function countIntervalOccurrences(startDateStr, intervalDays, rangeStartDate, rangeEndDate) {
  const anchor = parseDate(startDateStr);
  if (!anchor) return 0;
  const msPerDay = 86400000;
  const intervalMs = intervalDays * msPerDay;
  const rangeStartMs = rangeStartDate.getTime();
  const rangeEndMs = rangeEndDate.getTime();
  if (anchor.getTime() > rangeEndMs) return 0;
  let first;
  if (anchor.getTime() >= rangeStartMs) {
    first = anchor.getTime();
  } else {
    const gaps = Math.ceil((rangeStartMs - anchor.getTime()) / intervalMs);
    first = anchor.getTime() + gaps * intervalMs;
  }
  if (first > rangeEndMs) return 0;
  return Math.floor((rangeEndMs - first) / intervalMs) + 1;
}

function countOccurrences(startDateStr, freq, rangeStart, rangeEnd) {
  if (freq === 'monthly') return countWholeMonths(startDateStr, rangeStart, rangeEnd);
  if (freq === 'semi-monthly') return countWholeMonths(startDateStr, rangeStart, rangeEnd) * 2;
  if (freq === 'weekly') return countIntervalOccurrences(startDateStr, 7, rangeStart, rangeEnd);
  if (freq === 'bi-weekly') return countIntervalOccurrences(startDateStr, 14, rangeStart, rangeEnd);
  if (freq === 'yearly' || freq === 'annually') {
    const anchor = parseDate(startDateStr);
    if (!anchor) return 0;
    let count = 0;
    for (let y = rangeStart.getFullYear(); y <= rangeEnd.getFullYear(); y++) {
      const anniversary = new Date(y, anchor.getMonth(), anchor.getDate());
      if (anniversary >= rangeStart && anniversary <= rangeEnd) count++;
    }
    return count;
  }
  return countWholeMonths(startDateStr, rangeStart, rangeEnd);
}

export function expandBasePaysByStream(incomePaySettings, rangeStartStr, rangeEndDate) {
  const ips = incomePaySettings || getIncomePaySettings();
  const rangeStart = parseDate(rangeStartStr) || new Date();
  const rangeEnd = rangeEndDate || new Date();
  const result = { htA: 0, htB: 0, life: 0, summit: 0, general: 0 };

  (ips.base_pays || []).forEach((bp) => {
    const amt = Number(bp.amount) || 0;
    if (amt === 0) return;
    const freq = bp.frequency || 'monthly';
    const occurrences = countOccurrences(bp.start_date, freq, rangeStart, rangeEnd);
    if (occurrences <= 0) return;
    const contribution = Math.round(amt * occurrences * 100) / 100;
    console.log('[basepay]', { label: bp.label, amount: amt, frequency: freq, start_date: bp.start_date, stream: bp.stream, occurrences, contribution });
    const stream = bp.stream || 'general';
    if (result[stream] !== undefined) {
      result[stream] += contribution;
    } else {
      result.general += contribution;
    }
  });

  Object.keys(result).forEach((k) => { result[k] = Math.round(result[k] * 100) / 100; });
  return result;
}

export function expandRecurringIncome(incomePaySettings, months, rangeStartStr, rangeEndDate) {
  const ips = incomePaySettings || getIncomePaySettings();
  let total = 0;

  if (rangeStartStr && rangeEndDate) {
    const rangeStart = parseDate(rangeStartStr) || new Date();
    const rangeEnd = rangeEndDate || new Date();
    (ips.base_pays || []).forEach((bp) => {
      const amt = Number(bp.amount) || 0;
      const freq = bp.frequency || 'monthly';
      const occ = countOccurrences(bp.start_date, freq, rangeStart, rangeEnd);
      total += Math.round(amt * occ * 100) / 100;
    });
  } else {
    (ips.base_pays || []).forEach((bp) => {
      total += (Number(bp.amount) || 0) * months;
    });
  }

  if (ips.retainers?.i2i?.enabled) total += (Number(ips.retainers.i2i.amount) || 0) * months;
  if (ips.retainers?.bnb?.enabled) total += (Number(ips.retainers.bnb.amount) || 0) * months;

  (ips.additional_income || []).forEach((inc) => {
    total += (Number(inc.amount) || 0) * months;
  });

  return Math.round(total * 100) / 100;
}
