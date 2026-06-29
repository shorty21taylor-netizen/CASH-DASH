import { NextResponse } from 'next/server';
import { initStore, getCache, saveRecord } from '../../../lib/store.js';

const DEFAULT_SETTINGS = {
  id: 'app-settings',
  // Commission rates per stream
  rates: { htA: 0.10, htB: 0.15, life: 0.50, summit: 0.10 },
  // Base pay / salary
  base_pay: {
    enabled: false,
    amount: 0,
    frequency: 'bi-weekly',
    start_date: '',
  },
  // Additional fixed income sources
  fixed_income: [],
  // Override rates (per-deal overrides allowed)
  allow_rate_overrides: true,
  // Bonus structure
  bonuses: {
    enabled: false,
    threshold_type: 'revenue',
    tiers: [],
  },
  // Personal profile
  profile: {
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
  },
  // Business details
  business: {
    entity_name: '',
    entity_type: '',
    ein: '',
    fiscal_year_start: 'january',
  },
  // Tax settings
  tax: {
    estimated_rate: 0.30,
    set_aside: true,
  },
  // Display
  theme: 'dark',
  currency: 'USD',
  date_format: 'MM/DD/YYYY',
};

export async function GET() {
  await initStore();
  const all = getCache().accounts;
  const stored = all.find((a) => a.id === 'app-settings');
  const settings = deepMerge(DEFAULT_SETTINGS, stored || {});
  settings.id = 'app-settings';
  return NextResponse.json({ settings });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  const record = deepMerge(DEFAULT_SETTINGS, { ...body, id: 'app-settings' });
  await saveRecord('accounts', record);
  return NextResponse.json({ settings: record });
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}
