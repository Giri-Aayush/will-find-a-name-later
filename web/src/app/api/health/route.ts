import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'fail'> = {};

  // Check Supabase connectivity
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { error } = await supabase.from('cards').select('id').limit(1);
    checks.database = error ? 'fail' : 'ok';
  } catch {
    checks.database = 'fail';
  }

  const healthy = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
