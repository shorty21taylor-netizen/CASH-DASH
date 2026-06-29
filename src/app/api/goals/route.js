import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ goals: getCache().goals });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('goals', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    title: body.title,
    target: parseFloat(body.target) || 0,
    current: parseFloat(body.current) || 0,
    unit: body.unit || '$',
    deadline: body.deadline || '',
    category: body.category || 'business',
  };
  await saveRecord('goals', record);
  return NextResponse.json({ goal: record });
}
