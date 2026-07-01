import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveRecord, deleteRecord } from '../../../lib/store.js';
import { localToday } from '../../../lib/constants.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ policies: getCache().policies });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();
  if (body._action === 'delete') {
    await deleteRecord('policies', body.id);
    return NextResponse.json({ success: true });
  }
  const record = {
    id: body.id || uuid(),
    client_name: body.client_name,
    premium: parseFloat(body.premium) || 0,
    commission_rate: parseFloat(body.commission_rate) || 0,
    first_year_amount: parseFloat(body.first_year_amount) || 0,
    renewal_rate: parseFloat(body.renewal_rate) || 0,
    renewal_months: body.renewal_months || [],
    status: body.status || 'active',
    sold_date: body.sold_date || localToday(),
  };
  await saveRecord('policies', record);
  return NextResponse.json({ policy: record });
}
