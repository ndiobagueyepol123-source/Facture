import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!token) {
      return NextResponse.json(
        { isAdmin: false, error: "Jeton d'authentification manquant." },
        { status: 401 }
      );
    }

    // 1. Vérification du jeton avec Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { isAdmin: false, error: "Session invalide ou expirée." },
        { status: 401 }
      );
    }

    // 2. Vérification stricte du rôle administrateur dans PostgreSQL
    const adminRes = await pool.query(
      'SELECT role, created_at FROM public.admin_users WHERE user_id = $1 LIMIT 1',
      [user.id]
    );

    if (adminRes.rows.length === 0 || adminRes.rows[0].role !== 'admin') {
      return NextResponse.json(
        { isAdmin: false, error: "Accès refusé. Ce compte ne dispose pas des privilèges administrateur." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        role: adminRes.rows[0].role,
      },
    });

  } catch (error) {
    console.error("Erreur vérification admin:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Erreur serveur lors de la vérification des droits." },
      { status: 500 }
    );
  }
}
