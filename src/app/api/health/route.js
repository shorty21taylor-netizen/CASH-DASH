import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';
import { localToday } from '../../../lib/constants.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ logs: getCache().health_logs });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('health_logs', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    date: body.date || localToday(),
    weight: parseFloat(body.weight) || null,
    sleep_hours: parseFloat(body.sleep_hours) || null,
    workout: !!body.workout,
    calories: parseInt(body.calories) || null,
    notes: body.notes || '',
  };
  await saveRecord('health_logs', record);
  return NextResponse.json({ log: record });
}
