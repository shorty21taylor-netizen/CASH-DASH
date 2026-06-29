import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ habits: getCache().habits });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('habits', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    name: body.name,
    cadence: body.cadence || 'daily',
    streak: parseInt(body.streak) || 0,
    history: body.history || {},
  };
  await saveRecord('habits', record);
  return NextResponse.json({ habit: record });
}
