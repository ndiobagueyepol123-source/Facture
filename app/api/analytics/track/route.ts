import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

export async function POST(request: Request) {
  let pgClient: Client | null = null;

  try {
    const { event_type, metadata } = await request.json();

    if (!event_type) {
      return NextResponse.json({ error: "event_type requis" }, { status: 400 });
    }

    let userId: string | null = null;
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (token) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    pgClient = new Client({ connectionString });
    await pgClient.connect();

    await pgClient.query(
      `INSERT INTO public.analytics_events (user_id, event_type, metadata)
       VALUES ($1, $2, $3)`,
      [userId, event_type, JSON.stringify(metadata || {})]
    );

    await pgClient.end();
    pgClient = null;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (pgClient) {
      try { await pgClient.end(); } catch (e) {}
    }
    console.error("Erreur enregistrement analytics event:", error);
    return NextResponse.json({ error: "Erreur enregistrement analytics" }, { status: 500 });
  }
}
