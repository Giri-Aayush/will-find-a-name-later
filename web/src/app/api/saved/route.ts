import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('saved_cards')
    .select('card_id, saved_at, cards(*)')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch saved cards' }, { status: 500 });
  }

  return NextResponse.json({ saved: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { card_id } = body;

  if (!card_id || typeof card_id !== 'string') {
    return NextResponse.json({ error: 'card_id is required' }, { status: 400 });
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_cards')
    .select('card_id')
    .eq('user_id', userId)
    .eq('card_id', card_id)
    .maybeSingle();

  if (existing) {
    // Unsave
    await supabase
      .from('saved_cards')
      .delete()
      .eq('user_id', userId)
      .eq('card_id', card_id);

    return NextResponse.json({ saved: false });
  }

  // Save
  const { error } = await supabase
    .from('saved_cards')
    .insert({ user_id: userId, card_id });

  if (error) {
    return NextResponse.json({ error: 'Failed to save card' }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
