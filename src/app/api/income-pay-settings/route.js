import { NextResponse } from 'next/server';
import { initStore, getCache, saveRecord } from '../../../lib/store.js';

const DEFAULT_INCOME_PAY = {
  id: 'income_pay_settings',
  base_pay: {
    enabled: false,
    amount: 0,
    frequency: 'bi-weekly',
    start_date: '',
  },
  retainers: {
    i2i: { enabled: false, amount: 0 },
    bnb: { enabled: false, amount: 0 },
  },
  additional_income: [],
  bonus_tiers: {
    enabled: false,
    threshold_type: 'revenue',
    tiers: [],
  },
};

export async function GET() {
  await initStore();
  const all = getCache().accounts;
  const stored = all.find((a) => a.id === 'income_pay_settings');
  const settings = deepMerge(DEFAULT_INCOME_PAY, stored || {});
  settings.id = 'income_pay_settings';
  return NextResponse.json({ settings });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  const record = deepMerge(DEFAULT_INCOME_PAY, { ...body, id: 'income_pay_settings' });
  await saveRecord('accounts', record);
  return NextResponse.json({ settings: record });
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}
