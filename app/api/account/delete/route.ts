import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!token) {
      return NextResponse.json({ error: "Session non autorisée." }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Session invalide ou expirée." }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Supprimer les éléments de facture
      await client.query(
        `DELETE FROM public.invoice_items 
         WHERE user_id = $1 
            OR invoice_id IN (SELECT id FROM public.invoices WHERE user_id = $1)`,
        [user.id]
      );

      // 2. Supprimer les factures
      await client.query('DELETE FROM public.invoices WHERE user_id = $1', [user.id]);

      // 3. Supprimer les produits
      await client.query('DELETE FROM public.products WHERE user_id = $1', [user.id]);

      // 4. Supprimer les clients
      await client.query('DELETE FROM public.clients WHERE user_id = $1', [user.id]);

      // 5. Supprimer les paramètres boutique
      await client.query('DELETE FROM public.settings WHERE user_id = $1', [user.id]);

      // 6. Supprimer les rôles admin éventuels
      await client.query('DELETE FROM public.admin_users WHERE user_id = $1', [user.id]);

      // 7. Supprimer les événements analytics
      await client.query('DELETE FROM public.analytics_events WHERE user_id = $1', [user.id]);

      // 8. Supprimer le compte utilisateur Supabase auth
      await client.query('DELETE FROM auth.users WHERE id = $1', [user.id]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: "Votre compte et l'ensemble de vos données ont été définitivement supprimés."
      });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      console.error("Erreur suppression compte:", dbErr);
      return NextResponse.json({ error: "Erreur lors de la suppression du compte." }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Erreur serveur delete account:", err);
    return NextResponse.json({ error: err?.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
