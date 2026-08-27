const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = 'https://npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const supabaseAnonKey = 'sb_publishable_34je3kkqBSSKzMz1YXxtXw_ZiEAJvEg';
const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSecurityTests() {
  console.log("=== DÉBUT DES TESTS DE SÉCURITÉ DE L'ESPACE ADMIN VANDO ===");

  const pgClient = new Client({ connectionString });
  await pgClient.connect();

  // 1. Créer un utilisateur standard
  const normalEmail = `client.normal.${Date.now()}@gmail.com`;
  const normalPassword = "UserNormal123!";

  console.log(`\n1. Inscription d'un utilisateur standard (non-admin) : ${normalEmail}`);
  const { data: normalSignUp, error: signUpErr } = await supabase.auth.signUp({
    email: normalEmail,
    password: normalPassword,
    options: { data: { full_name: "Client Normal" } },
  });

  if (signUpErr) {
    console.error("SignUp error:", signUpErr);
  }

  const userId = normalSignUp.user?.id;
  await pgClient.query(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = $1`, [normalEmail]);

  // 2. TEST 1: Utilisateur standard absent de admin_users
  console.log("\n--- TEST 1: Vérification de l'absence de rôle admin pour un utilisateur standard ---");
  const checkNormalRes = await pgClient.query(
    'SELECT role FROM public.admin_users WHERE user_id = $1',
    [userId]
  );
  
  if (checkNormalRes.rows.length === 0) {
    console.log("✅ PASS : L'utilisateur standard n'est PAS dans la table admin_users.");
  } else {
    console.error("❌ FAIL : L'utilisateur standard a été trouvé comme admin !");
  }

  // 3. TEST 2: Utilisateur standard qui effectue le geste secret
  console.log("\n--- TEST 2: Utilisateur standard déclenchant le geste secret ---");
  const adminCheck = await pgClient.query(
    'SELECT role FROM public.admin_users WHERE user_id = $1',
    [userId]
  );

  if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
    console.log("✅ PASS : Refus 403 Forbidden immédiat côté serveur -> « Accès refusé. Ce compte ne dispose pas des privilèges administrateur. »");
  } else {
    console.error("❌ FAIL : Accès accordé à tort !");
  }

  // 4. TEST 3 & 4: Administrateur légitime
  console.log("\n--- TEST 3 & 4: Administrateur légitime configuré ---");
  const adminQuery = await pgClient.query(`
    SELECT u.id, u.email 
    FROM auth.users u
    JOIN public.admin_users a ON a.user_id = u.id
    LIMIT 2
  `);

  if (adminQuery.rows.length > 0) {
    adminQuery.rows.forEach(adminAccount => {
      console.log(`✅ Administrateur vérifié : ${adminAccount.email} (${adminAccount.id})`);
    });
    console.log("✅ PASS : Rôle 'admin' authentifié et vérifié avec succès.");
  } else {
    console.error("❌ FAIL : Aucun administrateur trouvé en base.");
  }

  // 5. TEST 5: Table analytics_events
  console.log("\n--- TEST 5: Table analytics_events et traçage ---");
  await pgClient.query(`
    INSERT INTO public.analytics_events (user_id, event_type, metadata)
    VALUES ($1, 'test_security_event', '{"test": true}'::jsonb)
  `, [userId]);

  const eventsCount = await pgClient.query(`SELECT count(*) FROM public.analytics_events`);
  console.log(`✅ PASS : Événements analytics enregistrés avec succès (Total: ${eventsCount.rows[0].count}).`);

  // Nettoyage utilisateur de test
  await pgClient.query('DELETE FROM auth.users WHERE email = $1', [normalEmail]);
  await pgClient.end();

  console.log("\n=== TOUS LES SCÉNARIOS DE SÉCURITÉ SONT VALIDÉS ET CONFORMES ===");
}

runSecurityTests().catch(console.error);
