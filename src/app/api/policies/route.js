import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, savePolicy, deletePolicy } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ policies: getCache().policies });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();

  if (body._action === 'delete') {
    await deletePolicy(body.id);
    return NextResponse.json({ success: true });
  }

  const policy = {
    id: body.id || uuid(),
    client_name: body.client_name,
    premium: body.premium,
    commission_rate: body.commission_rate,
    first_year_amount: body.first_year_amount,
    renewal_rate: body.renewal_rate,
    renewal_schedule: body.renewal_schedule,
    status: body.status || 'active',
  };

  await savePolicy(policy);
  return NextResponse.json({ policy });
}
