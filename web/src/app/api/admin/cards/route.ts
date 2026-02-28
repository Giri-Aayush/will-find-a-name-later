import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { supabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const { admin } = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('q') ?? '').slice(0, 100);
  const suspended = searchParams.get('suspended') === 'true';
  const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100));

  let query = supabase
    .from('cards')
    .select('id, headline, summary, category, source_id, canonical_url, published_at, quality_score, flag_count, is_suspended')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (suspended) {
    query = query.eq('is_suspended', true);
  }

  if (search) {
    const safeSearch = search.replace(/[%_]/g, '\\$&');
    query = query.ilike('headline', `%${safeSearch}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  return NextResponse.json({ cards: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const { admin } = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { card_id, action } = body as { card_id?: string; action?: string };
  if (!card_id || !action) {
    return NextResponse.json({ error: 'card_id and action required' }, { status: 400 });
  }

  if (!UUID_RE.test(card_id)) {
    return NextResponse.json({ error: 'Invalid card_id format' }, { status: 400 });
  }

  if (action === 'suspend') {
    const { error } = await supabase
      .from('cards')
      .update({ is_suspended: true })
      .eq('id', card_id);
    if (error) return NextResponse.json({ error: 'Failed to suspend card' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'unsuspend') {
    const { error } = await supabase
      .from('cards')
      .update({ is_suspended: false })
      .eq('id', card_id);
    if (error) return NextResponse.json({ error: 'Failed to unsuspend card' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'delete') {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', card_id);
    if (error) return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action (suspend | unsuspend | delete)' }, { status: 400 });
}
