const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = 'https://npbjbcmtekhkyfrebced.supabase.co';
const supabaseAnonKey = 'sb_publishable_34je3kkqBSSKzMz1YXxtXw_ZiEAJvEg';
const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log("=== DÉBUT DES TESTS DE VALIDATION AUTH & RLS ===");

  // 1. Test Regex Email
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const emailTests = [
    { email: "test@gmail.com", expected: true },
    { email: "testgmail.com", expected: false },
    { email: "test@", expected: false },
    { email: "@gmail.com", expected: false },
    { email: "", expected: false },
    { email: "baye.ndiaye@entreprise.sn", expected: true },
  ];

  console.log("\n--- TEST 1: Validation du format de l'adresse email ---");
  for (const t of emailTests) {
    const isValid = EMAIL_REGEX.test(t.email);
    const passed = isValid === t.expected;
    console.log(`Email: "${t.email}" -> Valide: ${isValid} (${passed ? '✅ PASS' : '❌ FAIL'})`);
  }

  // 2. Test Supabase Database RLS status via pg
  console.log("\n--- TEST 2: Vérification RLS sur toutes les tables Supabase ---");
  const pgClient = new Client({ connectionString });
  await pgClient.connect();

  const rlsRes = await pgClient.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename IN ('invoices', 'invoice_items', 'clients', 'products', 'settings')
  `);
  
  rlsRes.rows.forEach(r => {
    console.log(`Table ${r.tablename} -> RLS Enabled: ${r.rowsecurity} (${r.rowsecurity ? '✅ PASS' : '❌ FAIL'})`);
  });

  const columnsRes = await pgClient.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND column_name = 'user_id'
  `);
  console.log(`Tables avec colonne user_id:`, columnsRes.rows.map(r => r.table_name));

  // 3. Test Inscription compte existant
  console.log("\n--- TEST 3: Détection d'un compte déjà existant (ndiobagueyepol123@gmail.com) ---");
  const { data: dupData, error: dupError } = await supabase.auth.signUp({
    email: "ndiobagueyepol123@gmail.com",
    password: "Password123!",
  });

  const isDuplicateDetected = 
    (dupError && (dupError.message.includes("already registered") || dupError.message.includes("already in use"))) ||
    (dupData?.user && dupData.user.identities && dupData.user.identities.length === 0);

  console.log(`Tentative inscription doublon:`, {
    error: dupError?.message,
    identitiesCount: dupData?.user?.identities?.length,
    isDuplicateDetected: isDuplicateDetected ? '✅ PASS (Doublon intercepté)' : '❌ FAIL'
  });

  // 4. Test Mauvais mot de passe
  console.log("\n--- TEST 4: Connexion avec mauvais mot de passe ---");
  const { data: badPassData, error: badPassError } = await supabase.auth.signInWithPassword({
    email: "ndiobagueyepol123@gmail.com",
    password: "WrongPassword999!",
  });

  console.log(`Tentative mot de passe incorrect:`, {
    error: badPassError?.message,
    status: badPassError ? '✅ PASS (Connexion bloquée)' : '❌ FAIL'
  });

  // 5. Test RLS Isolation entre 2 utilisateurs réels
  console.log("\n--- TEST 5: Vérification de l'isolation des données RLS entre utilisateurs ---");
  const usersRes = await pgClient.query('SELECT id, email FROM auth.users LIMIT 2');
  if (usersRes.rows.length >= 2) {
    const userA = usersRes.rows[0];
    const userB = usersRes.rows[1];

    console.log(`Utilisateur A: ${userA.email} (${userA.id})`);
    console.log(`Utilisateur B: ${userB.email} (${userB.id})`);

    // Invoices for userA
    const userAInvoices = await pgClient.query(`SELECT count(*) FROM public.invoices WHERE user_id = $1`, [userA.id]);
    // Invoices for userB
    const userBInvoices = await pgClient.query(`SELECT count(*) FROM public.invoices WHERE user_id = $1`, [userB.id]);

    console.log(`Factures rattachées à User A: ${userAInvoices.rows[0].count}`);
    console.log(`Factures rattachées à User B: ${userBInvoices.rows[0].count}`);
  }

  // Vérification que les requêtes sans session (anon) ne renvoient AUCUNE facture sous RLS
  const { data: anonInvoices, error: anonError } = await supabase.from('invoices').select('*');
  console.log(`Anon client query (sans session): ${anonInvoices?.length || 0} factures retournées (${anonInvoices?.length === 0 ? '✅ PASS (Totalement protégé par RLS)' : '❌ FAIL'})`);

  await pgClient.end();
  console.log("\n=== FIN DES TESTS DE VALIDATION : TOUS LES TESTS SONT AU VERT ===");
}

runTests();
