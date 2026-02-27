import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { card_ids } = body;

  if (!Array.isArray(card_ids) || card_ids.length === 0) {
    return NextResponse.json({ error: 'card_ids array is required' }, { status: 400 });
  }

  const ids = card_ids.slice(0, 50);
  const rows = ids.map((card_id: string) => ({ user_id: userId, card_id }));

  const { error } = await supabase
    .from('card_views')
    .upsert(rows, { onConflict: 'user_id,card_id', ignoreDuplicates: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to record views' }, { status: 500 });
  }

  return NextResponse.json({ recorded: ids.length });
}
