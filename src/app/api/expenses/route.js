import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';

export async function GET(request) {
  await initStore();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  let list = getCache().expenses;
  if (category) list = list.filter((e) => e.category === category);
  return NextResponse.json({ expenses: list });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('expenses', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    category: body.category || 'business',
    label: body.label,
    amount: parseFloat(body.amount) || 0,
    recurring: !!body.recurring,
    frequency: body.frequency || 'once',
    date: body.date || new Date().toISOString().split('T')[0],
  };
  await saveRecord('expenses', record);
  return NextResponse.json({ expense: record });
}
