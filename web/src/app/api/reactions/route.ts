import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/reactions?card_ids=id1,id2,id3 — get user's reactions + counts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cardIds = searchParams.get('card_ids')?.split(',').filter(Boolean) ?? [];

  if (cardIds.length === 0) {
    return NextResponse.json({ reactions: {}, userReactions: {} });
  }

  // Get aggregate counts
  const { data: cards } = await supabase
    .from('cards')
    .select('id, reaction_up_count, reaction_down_count')
    .in('id', cardIds);

  const reactions: Record<string, { up: number; down: number }> = {};
  for (const card of cards ?? []) {
    reactions[card.id] = {
      up: card.reaction_up_count ?? 0,
      down: card.reaction_down_count ?? 0,
    };
  }

  // Get user's own reactions (if signed in)
  const userReactions: Record<string, string> = {};
  const { userId } = await auth();
  if (userId) {
    const { data: userRx } = await supabase
      .from('reactions')
      .select('card_id, reaction')
      .eq('user_id', userId)
      .in('card_id', cardIds);

    for (const r of userRx ?? []) {
      userReactions[r.card_id] = r.reaction;
    }
  }

  return NextResponse.json({ reactions, userReactions });
}

async function getCardCounts(cardId: string) {
  const { data } = await supabase
    .from('cards')
    .select('reaction_up_count, reaction_down_count')
    .eq('id', cardId)
    .single();
  return {
    up: (data?.reaction_up_count as number) ?? 0,
    down: (data?.reaction_down_count as number) ?? 0,
  };
}

// POST /api/reactions — toggle reaction
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { card_id, reaction } = body;

  if (!card_id || typeof card_id !== 'string') {
    return NextResponse.json({ error: 'card_id is required' }, { status: 400 });
  }
  if (!reaction || !['up', 'down'].includes(reaction)) {
    return NextResponse.json({ error: 'reaction must be "up" or "down"' }, { status: 400 });
  }

  // Check existing reaction
  const { data: existing } = await supabase
    .from('reactions')
    .select('id, reaction')
    .eq('user_id', userId)
    .eq('card_id', card_id)
    .maybeSingle();

  if (existing) {
    if (existing.reaction === reaction) {
      // Same reaction — remove it (toggle off)
      await supabase.from('reactions').delete().eq('id', existing.id);

      const counts = await getCardCounts(card_id);
      await supabase
        .from('cards')
        .update(
          reaction === 'up'
            ? { reaction_up_count: Math.max(0, counts.up - 1) }
            : { reaction_down_count: Math.max(0, counts.down - 1) }
        )
        .eq('id', card_id);

      return NextResponse.json({ reaction: null });
    } else {
      // Different reaction — switch
      await supabase
        .from('reactions')
        .update({ reaction })
        .eq('id', existing.id);

      const counts = await getCardCounts(card_id);
      const updates =
        reaction === 'up'
          ? {
              reaction_up_count: counts.up + 1,
              reaction_down_count: Math.max(0, counts.down - 1),
            }
          : {
              reaction_up_count: Math.max(0, counts.up - 1),
              reaction_down_count: counts.down + 1,
            };

      await supabase.from('cards').update(updates).eq('id', card_id);

      return NextResponse.json({ reaction });
    }
  }

  // No existing reaction — insert new
  const { error } = await supabase
    .from('reactions')
    .insert({ card_id, user_id: userId, reaction });

  if (error) {
    return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 });
  }

  const counts = await getCardCounts(card_id);
  await supabase
    .from('cards')
    .update(
      reaction === 'up'
        ? { reaction_up_count: counts.up + 1 }
        : { reaction_down_count: counts.down + 1 }
    )
    .eq('id', card_id);

  return NextResponse.json({ reaction });
}
