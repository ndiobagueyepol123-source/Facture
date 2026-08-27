const { Client } = require('pg');

const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

async function migrate() {
  console.log("=== DÉBUT DE LA MIGRATION ADMIN & ANALYTICS ===");
  const client = new Client({ connectionString });
  await client.connect();

  // 1. Création de la table admin_users
  console.log("1. Création de la table admin_users...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.admin_users (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;`);

  // Supprimer les anciennes politiques si existantes
  await client.query(`DROP POLICY IF EXISTS "Admin users self read" ON public.admin_users;`);
  await client.query(`
    CREATE POLICY "Admin users self read" 
    ON public.admin_users 
    FOR SELECT 
    USING (auth.uid() = user_id);
  `);

  // 2. Création de la table analytics_events
  console.log("2. Création de la table analytics_events...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.analytics_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;`);

  await client.query(`DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;`);
  await client.query(`DROP POLICY IF EXISTS "Admins can view all events" ON public.analytics_events;`);

  await client.query(`
    CREATE POLICY "Users can insert own events" 
    ON public.analytics_events 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  `);

  await client.query(`
    CREATE POLICY "Admins can view all events" 
    ON public.analytics_events 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()
      )
    );
  `);

  // 3. Attribution du rôle admin au compte propriétaire principal
  console.log("3. Attribution du rôle admin au compte propriétaire...");
  // Récupérons les utilisateurs auth existants
  const usersRes = await client.query(`SELECT id, email FROM auth.users ORDER BY created_at ASC`);
  
  if (usersRes.rows.length > 0) {
    // Assigner admin aux comptes pertinents (ndiobagueyepol123@gmail.com ou premier compte)
    const adminEmails = [
      'ndiobagueyepol123@gmail.com',
      'ndiobagueyepol13@gmail.com',
      'ndioba744@gmail.com',
      'bayendioba123@gmail.com'
    ];

    for (const u of usersRes.rows) {
      if (adminEmails.includes(u.email.toLowerCase())) {
        await client.query(`
          INSERT INTO public.admin_users (user_id, role)
          VALUES ($1, 'admin')
          ON CONFLICT (user_id) DO NOTHING;
        `, [u.id]);
        console.log(`✅ Administrateur enregistré : ${u.email} (${u.id})`);
      }
    }
  }

  // 4. Insertion d'événements analytics initiaux
  console.log("4. Initialisation des événements analytics de démarrage...");
  await client.query(`
    INSERT INTO public.analytics_events (event_type, metadata)
    VALUES 
      ('system_init', '{"message": "Espace administration et analytics configuré avec succès"}'::jsonb)
    ON CONFLICT DO NOTHING;
  `);

  const adminsCount = await client.query(`SELECT count(*) FROM public.admin_users`);
  console.log(`Nombre total d'administrateurs configurés : ${adminsCount.rows[0].count}`);

  await client.end();
  console.log("=== MIGRATION ADMIN & ANALYTICS TERMINÉE AVEC SUCCÈS ===");
}

migrate().catch(console.error);
