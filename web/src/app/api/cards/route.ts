import { NextRequest, NextResponse } from 'next/server';
import { getCards } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get('cursor') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const source = searchParams.get('source') ?? undefined;
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);

  try {
    const cards = await getCards({ cursor, limit, category, source });
    return NextResponse.json({ cards, hasMore: cards.length === limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}
