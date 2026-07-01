import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';
import { localToday } from '../../../lib/constants.js';

export async function GET(request) {
  await initStore();
  const { searchParams } = new URL(request.url);
  const stream = searchParams.get('stream');
  const status = searchParams.get('status');
  let list = getCache().commissions;
  if (stream) list = list.filter((c) => c.stream === stream);
  if (status) list = list.filter((c) => c.status === status);
  return NextResponse.json({ commissions: list });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('commissions', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    stream: body.stream,
    client_name: body.client_name,
    amount: parseFloat(body.amount) || 0,
    rate: parseFloat(body.rate) || 0,
    status: body.status || 'pending',
    date: body.date || localToday(),
  };
  await saveRecord('commissions', record);
  return NextResponse.json({ commission: record });
}
