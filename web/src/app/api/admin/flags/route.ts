import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { supabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  const { admin } = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Get all unresolved flags with card details
  const { data, error } = await supabase
    .from('flags')
    .select('id, card_id, user_id, reason, created_at, resolved, cards(id, headline, summary, category, canonical_url, source_id, is_suspended)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 });
  return NextResponse.json({ flags: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const { admin } = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { flag_id, action } = body as { flag_id?: string; action?: string };
  if (!flag_id || !action) {
    return NextResponse.json({ error: 'flag_id and action required' }, { status: 400 });
  }

  if (!UUID_RE.test(flag_id)) {
    return NextResponse.json({ error: 'Invalid flag_id format' }, { status: 400 });
  }

  if (action === 'resolve') {
    // Mark flag as resolved (dismiss — card stays)
    const { error } = await supabase
      .from('flags')
      .update({ resolved: true })
      .eq('id', flag_id);
    if (error) return NextResponse.json({ error: 'Failed to resolve flag' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'suspend') {
    // Resolve flag AND suspend the card
    const { data: flag } = await supabase
      .from('flags')
      .select('card_id')
      .eq('id', flag_id)
      .single();

    if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 });

    await supabase.from('flags').update({ resolved: true }).eq('id', flag_id);
    await supabase.from('cards').update({ is_suspended: true }).eq('id', flag.card_id);

    return NextResponse.json({ success: true, suspended: flag.card_id });
  }

  return NextResponse.json({ error: 'Invalid action (resolve | suspend)' }, { status: 400 });
}
