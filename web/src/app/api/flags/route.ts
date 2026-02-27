import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { card_id, reason } = body;

  if (!card_id || typeof card_id !== 'string') {
    return NextResponse.json({ error: 'card_id is required' }, { status: 400 });
  }

  // Verify card exists
  const { data: card } = await supabase
    .from('cards')
    .select('id, flag_count')
    .eq('id', card_id)
    .maybeSingle();

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // Insert flag
  const { error: flagError } = await supabase
    .from('flags')
    .insert({ card_id, reason: reason ?? null });

  if (flagError) {
    return NextResponse.json({ error: 'Failed to submit flag' }, { status: 500 });
  }

  // Increment flag_count on the card
  await supabase
    .from('cards')
    .update({ flag_count: card.flag_count + 1 })
    .eq('id', card_id);

  return NextResponse.json({ success: true }, { status: 201 });
}
