import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ profits: getCache().market_profits });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('market_profits', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    source: body.source || '',
    ticker: body.ticker || '',
    amount: parseFloat(body.amount) || 0,
    type: body.type || 'realized',
    date: body.date || new Date().toISOString().split('T')[0],
    notes: body.notes || '',
  };
  await saveRecord('market_profits', record);
  return NextResponse.json({ profit: record });
}
