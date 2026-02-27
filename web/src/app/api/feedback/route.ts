import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { message, page_url } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  if (message.length > 500) {
    return NextResponse.json({ error: 'message too long (500 char max)' }, { status: 400 });
  }

  const { error } = await supabase
    .from('feedback')
    .insert({
      user_id: userId,
      message: message.trim(),
      page_url: page_url ?? null,
    });

  if (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
