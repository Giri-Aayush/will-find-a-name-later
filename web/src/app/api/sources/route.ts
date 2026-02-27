import { NextResponse } from 'next/server';
import { getSources } from '@/lib/queries';

export async function GET() {
  try {
    const sources = await getSources();
    return NextResponse.json({ sources });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}
