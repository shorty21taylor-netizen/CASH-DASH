import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ reps: getCache().reps });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('reps', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    name: body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    role: body.role || '',
    status: body.status || 'active',
    streams: body.streams || [],
    base_pay: parseFloat(body.base_pay) || 0,
    pay_frequency: body.pay_frequency || 'bi-weekly',
    commission_split: parseFloat(body.commission_split) || 0,
    override_rates: body.override_rates || {},
    start_date: body.start_date || '',
    notes: body.notes || '',
  };
  await saveRecord('reps', record);
  return NextResponse.json({ rep: record });
}
