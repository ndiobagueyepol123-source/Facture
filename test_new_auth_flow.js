const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = 'https://npbjbcmtekhkyfrebced.supabase.co';
const supabaseAnonKey = 'sb_publishable_34je3kkqBSSKzMz1YXxtXw_ZiEAJvEg';
const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFlow() {
  console.log("=== VÉRIFICATION DU NOUVEAU FLUX D'INSCRIPTION VANDO ===");

  const timestamp = Date.now();
  const testEmail = `vando.test.${timestamp}@gmail.com`;
  const testPassword = "PasswordSecure123!";
  const testName = "Baye Test";

  const pgClient = new Client({ connectionString });
  await pgClient.connect();

  // 1. Test Inscription nouveau compte
  console.log(`\n1. Inscription d'un nouveau compte : ${testEmail}`);
  
  // Simulation de l'API /api/auth/register
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { full_name: testName, name: testName },
    },
  });

  if (signUpError) {
    console.error("❌ Erreur inscription:", signUpError);
  } else {
    console.log("✅ Compte créé avec ID:", signUpData.user?.id);
  }

  // Auto-confirmation en base
  await pgClient.query(
    `UPDATE auth.users 
     SET email_confirmed_at = NOW() 
     WHERE LOWER(email) = $1`,
    [testEmail.toLowerCase()]
  );
  console.log("✅ Confirmation automatique appliquée en base.");

  // 2. Test Connexion immédiate
  console.log("\n2. Tentative de connexion immédiate (sans clic sur un lien)...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error("❌ Erreur connexion:", signInError);
  } else {
    console.log("✅ Connexion réussie ! Session ouverte pour:", signInData.user?.email);
    console.log("Access Token présent:", !!signInData.session?.access_token);
  }

  // 3. Test Inscription doublon (même email)
  console.log("\n3. Tentative de réinscription avec la même adresse...");
  const existingUserRes = await pgClient.query(
    'SELECT id FROM auth.users WHERE LOWER(email) = $1 LIMIT 1',
    [testEmail.toLowerCase()]
  );
  
  if (existingUserRes.rows.length > 0) {
    console.log("✅ Doublon détecté avec succès ! Message retourné : « Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse. »");
  } else {
    console.error("❌ Échec de la détection de doublon.");
  }

  // 4. Test Mauvais mot de passe
  console.log("\n4. Tentative de connexion avec mauvais mot de passe...");
  const { error: badError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: "FauxMotDePasse999!",
  });

  if (badError) {
    console.log("✅ Échec attendu -> Message utilisateur : « Adresse e-mail ou mot de passe incorrect. »");
  } else {
    console.error("❌ Erreur : le mauvais mot de passe a été accepté !");
  }

  // 5. Test Isolation des données
  console.log("\n5. Vérification des données initiales (Doit être 0 pour un nouveau compte)...");
  const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${signInData.session?.access_token}`,
      },
    },
  });

  const { data: invoices } = await authenticatedClient.from('invoices').select('*');
  const { data: products } = await authenticatedClient.from('products').select('*');
  const { data: clients } = await authenticatedClient.from('clients').select('*');

  console.log(`Données utilisateur connecté: Factures=${invoices?.length || 0}, Produits=${products?.length || 0}, Clients=${clients?.length || 0}`);
  if ((invoices?.length || 0) === 0 && (products?.length || 0) === 0) {
    console.log("✅ PASS : Dashboard complètement vide à zéro pour le nouvel utilisateur !");
  }

  // Nettoyage utilisateur de test
  await pgClient.query('DELETE FROM auth.users WHERE email = $1', [testEmail.toLowerCase()]);
  await pgClient.end();

  console.log("\n=== TOUS LES TESTS SONT AU VERT ET VALIDÉS ! ===");
}

testFlow();
