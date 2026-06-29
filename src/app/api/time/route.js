import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ logs: getCache().time_logs });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('time_logs', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    date: body.date || new Date().toISOString().split('T')[0],
    category: body.category || 'other',
    hours: parseFloat(body.hours) || 0,
    notes: body.notes || '',
  };
  await saveRecord('time_logs', record);
  return NextResponse.json({ log: record });
}
