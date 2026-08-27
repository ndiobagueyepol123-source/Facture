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

      // 5. Supprimer les événements analytics de cet utilisateur
      await client.query('DELETE FROM public.analytics_events WHERE user_id = $1', [user.id]);

      // 6. Réinitialiser le compteur de facture dans settings
      await client.query(
        `UPDATE public.settings 
         SET next_invoice_number = 1, updated_at = NOW() 
         WHERE user_id = $1`,
        [user.id]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: "Toutes vos données (factures, clients, produits, statistiques) ont été réinitialisées à zéro avec succès."
      });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      console.error("Erreur réinitialisation données:", dbErr);
      return NextResponse.json({ error: "Erreur lors de la réinitialisation des données." }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Erreur serveur reset-data:", err);
    return NextResponse.json({ error: err?.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
