import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';
import { localToday } from '../../../lib/constants.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ items: getCache().income_other });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('income_other', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    source: body.source,
    amount: parseFloat(body.amount) || 0,
    category: body.category || 'business',
    date: body.date || localToday(),
  };
  await saveRecord('income_other', record);
  return NextResponse.json({ item: record });
}
