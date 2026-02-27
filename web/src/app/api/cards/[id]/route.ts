import { NextRequest, NextResponse } from 'next/server';
import { getCardById } from '@/lib/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const card = await getCardById(id);
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    return NextResponse.json(card);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 });
  }
}
