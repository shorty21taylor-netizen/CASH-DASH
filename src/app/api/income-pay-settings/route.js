import { NextResponse } from 'next/server';
import { initStore, getCache, saveRecord } from '../../../lib/store.js';

const DEFAULT_INCOME_PAY = {
  id: 'income_pay_settings',
  base_pays: [],
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
  updated_at: null,
};

function migrateIncomePay(stored) {
  if (!stored) return { ...DEFAULT_INCOME_PAY };
  const result = { ...DEFAULT_INCOME_PAY, ...stored, id: 'income_pay_settings' };
  if (result.retainers) {
    result.retainers = {
      i2i: { enabled: false, amount: 0, ...(stored.retainers?.i2i || {}) },
      bnb: { enabled: false, amount: 0, ...(stored.retainers?.bnb || {}) },
    };
  }
  if (stored.base_pay && !stored.base_pays) {
    const bp = stored.base_pay;
    if (bp.enabled && (bp.amount > 0 || bp.label)) {
      result.base_pays = [{
        id: 'migrated_1',
        label: bp.label || 'Base Pay',
        amount: Number(bp.amount) || 0,
        frequency: bp.frequency || 'bi-weekly',
        start_date: bp.start_date || '',
      }];
    } else {
      result.base_pays = [];
    }
    delete result.base_pay;
  }
  if (!Array.isArray(result.base_pays)) result.base_pays = [];
  if (!Array.isArray(result.additional_income)) result.additional_income = [];
  if (!result.bonus_tiers) result.bonus_tiers = { enabled: false, threshold_type: 'revenue', tiers: [] };
  if (!Array.isArray(result.bonus_tiers.tiers)) result.bonus_tiers.tiers = [];
  return result;
}

export async function GET() {
  await initStore();
  const all = getCache().accounts;
  const stored = all.find((a) => a.id === 'income_pay_settings');
  const settings = migrateIncomePay(stored);
  console.log('[income-pay GET] returning:', JSON.stringify(settings));
  return NextResponse.json({ settings });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  const record = {
    ...body,
    id: 'income_pay_settings',
    updated_at: new Date().toISOString(),
  };
  if (!Array.isArray(record.base_pays)) record.base_pays = [];
  if (!Array.isArray(record.additional_income)) record.additional_income = [];
  if (!record.retainers) record.retainers = { i2i: { enabled: false, amount: 0 }, bnb: { enabled: false, amount: 0 } };
  if (!record.bonus_tiers) record.bonus_tiers = { enabled: false, threshold_type: 'revenue', tiers: [] };
  delete record.base_pay;
  console.log('[income-pay POST] saving:', JSON.stringify(record));
  await saveRecord('accounts', record);
  console.log('[income-pay POST] saved successfully');
  return NextResponse.json({ settings: record });
}
