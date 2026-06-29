import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveCommission, deleteCommission } from '../../../lib/store.js';

export async function GET(request) {
  await initStore();
  const { searchParams } = new URL(request.url);
  const stream = searchParams.get('stream');
  const status = searchParams.get('status');

  let commissions = getCache().commissions;
  if (stream) commissions = commissions.filter((c) => c.stream === stream);
  if (status) commissions = commissions.filter((c) => c.status === status);

  return NextResponse.json({ commissions });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();

  if (body._action === 'delete') {
    await deleteCommission(body.id);
    return NextResponse.json({ success: true });
  }

  const commission = {
    id: body.id || uuid(),
    stream: body.stream,
    client_name: body.client_name,
    amount: body.amount,
    rate: body.rate,
    status: body.status || 'pending',
    date: body.date || new Date().toISOString().split('T')[0],
  };

  await saveCommission(commission);
  return NextResponse.json({ commission });
}
