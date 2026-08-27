const { Client } = require('pg');

const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
});

const sql = `
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items DISABLE ROW LEVEL SECURITY;
`;

async function disableRls() {
  try {
    console.log("Connexion à la base de données Supabase...");
    await client.connect();
    
    console.log("Désactivation de la sécurité RLS...");
    await client.query(sql);
    
    console.log("SUCCESS: RLS désactivée !");
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.end();
  }
}

disableRls();
