import { NextResponse } from 'next/server';
import { initStore, getStreams } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  return NextResponse.json({ streams: getStreams() });
}
