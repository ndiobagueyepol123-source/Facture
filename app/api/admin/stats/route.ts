import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 1. Vérification du token Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    // 2. Vérification rôle administrateur
    const adminCheck = await pool.query(
      'SELECT role FROM public.admin_users WHERE user_id = $1 LIMIT 1',
      [user.id]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return NextResponse.json({ error: "Accès refusé. Privilèges administrateur requis." }, { status: 403 });
    }

    // 3. Récupération des KPIs utilisateurs
    const usersCountRes = await pool.query('SELECT COUNT(*) AS total FROM auth.users');
    const todayUsersRes = await pool.query("SELECT COUNT(*) AS today FROM auth.users WHERE created_at >= CURRENT_DATE");
    const weekUsersRes = await pool.query("SELECT COUNT(*) AS week FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days'");
    const monthUsersRes = await pool.query("SELECT COUNT(*) AS month FROM auth.users WHERE created_at >= NOW() - INTERVAL '30 days'");
    const activeUsersRes = await pool.query("SELECT COUNT(*) AS active FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '30 days'");

    const totalUsers = parseInt(usersCountRes.rows[0].total, 10) || 0;
    const newToday = parseInt(todayUsersRes.rows[0].today, 10) || 0;
    const newWeek = parseInt(weekUsersRes.rows[0].week, 10) || 0;
    const newMonth = parseInt(monthUsersRes.rows[0].month, 10) || 0;
    const activeUsers = parseInt(activeUsersRes.rows[0].active, 10) || 0;
    const inactiveUsers = Math.max(0, totalUsers - activeUsers);

    // 4. Récupération des KPIs Business (Ventes, Produits, Clients)
    const invoicesRes = await pool.query('SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue FROM public.invoices');
    const productsRes = await pool.query('SELECT COUNT(*) AS count FROM public.products');
    const clientsRes = await pool.query('SELECT COUNT(*) AS count FROM public.clients');

    const totalSales = parseInt(invoicesRes.rows[0].count, 10) || 0;
    const totalRevenue = parseFloat(invoicesRes.rows[0].revenue) || 0;
    const totalProducts = parseInt(productsRes.rows[0].count, 10) || 0;
    const totalClients = parseInt(clientsRes.rows[0].count, 10) || 0;

    // 5. Évolution des inscriptions sur les 14 derniers jours
    const signupsTimelineRes = await pool.query(`
      SELECT 
        TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
        TO_CHAR(d.day, 'DD/MM') AS label,
        COUNT(u.id) AS count
      FROM (
        SELECT generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day'::interval)::date AS day
      ) d
      LEFT JOIN auth.users u ON u.created_at::date = d.day
      GROUP BY d.day
      ORDER BY d.day ASC;
    `);

    // 6. Événements récents analytics
    const recentEventsRes = await pool.query(`
      SELECT 
        e.id,
        e.event_type,
        e.metadata,
        e.created_at,
        u.email AS user_email
      FROM public.analytics_events e
      LEFT JOIN auth.users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
      LIMIT 25;
    `);

    // 7. Liste détaillée des utilisateurs
    const usersListRes = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.created_at,
        u.last_sign_in_at,
        COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS name,
        EXISTS(SELECT 1 FROM public.admin_users a WHERE a.user_id = u.id) AS is_admin,
        (SELECT COUNT(*) FROM public.invoices i WHERE i.user_id = u.id) AS sales_count,
        (SELECT COALESCE(SUM(i.total), 0) FROM public.invoices i WHERE i.user_id = u.id) AS total_sales_amount
      FROM auth.users u
      ORDER BY u.created_at DESC;
    `);

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          newToday,
          newWeek,
          newMonth,
          active: activeUsers,
          inactive: inactiveUsers,
        },
        business: {
          totalSales,
          totalRevenue,
          totalProducts,
          totalClients,
        },
        timeline: signupsTimelineRes.rows.map(r => ({
          date: r.date,
          label: r.label,
          count: parseInt(r.count, 10) || 0,
        })),
        recentEvents: recentEventsRes.rows,
        usersList: usersListRes.rows.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at,
          isAdmin: u.is_admin,
          salesCount: parseInt(u.sales_count, 10) || 0,
          totalSalesAmount: parseFloat(u.total_sales_amount) || 0,
        })),
      },
    });

  } catch (error) {
    console.error("Erreur stats admin:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la récupération des données" }, { status: 500 });
  }
}
