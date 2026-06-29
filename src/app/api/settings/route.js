import { NextResponse } from 'next/server';
import { initStore, getCache, saveRecord } from '../../../lib/store.js';

const DEFAULT_SETTINGS = {
  id: 'app-settings',
  rates: { htA: 0.10, htB: 0.15, life: 0.50, summit: 0.10 },
  theme: 'dark',
};

export async function GET() {
  await initStore();
  const all = getCache().accounts;
  const settings = all.find((a) => a.id === 'app-settings');
  return NextResponse.json({ settings: settings || DEFAULT_SETTINGS });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  const record = { ...DEFAULT_SETTINGS, ...body, id: 'app-settings' };
  await saveRecord('accounts', record);
  return NextResponse.json({ settings: record });
}
