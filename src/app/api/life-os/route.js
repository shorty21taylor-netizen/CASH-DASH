import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { initStore, getCache, saveLifeOS, deleteLifeOS } from '../../../lib/store.js';

export async function GET(request) {
  await initStore();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let items = getCache().life_os;
  if (type) items = items.filter((i) => i.type === type);

  return NextResponse.json({ items });
}

export async function POST(request) {
  await initStore();
  const body = await request.json();

  if (body._action === 'delete') {
    await deleteLifeOS(body.id);
    return NextResponse.json({ success: true });
  }

  const item = {
    id: body.id || uuid(),
    type: body.type,
    title: body.title,
    content: body.content || '',
    completed: body.completed || false,
    priority: body.priority || 'medium',
    due_date: body.due_date || null,
  };

  await saveLifeOS(item);
  return NextResponse.json({ item });
}
