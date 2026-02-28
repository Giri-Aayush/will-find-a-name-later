import { NextRequest, NextResponse } from 'next/server';
import { getCardById } from '@/lib/queries';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }
  try {
    const card = await getCardById(id);
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    return NextResponse.json(card);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 });
  }
}
