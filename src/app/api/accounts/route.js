import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ accounts: getCache().accounts });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('accounts', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    name: body.name,
    type: body.type || 'cash',
    balance: parseFloat(body.balance) || 0,
    updated_at: new Date().toISOString(),
  };
  await saveRecord('accounts', record);
  return NextResponse.json({ account: record });
}
