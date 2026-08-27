const { Client } = require('pg');
const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

async function inspect() {
  const client = new Client({ connectionString });
  await client.connect();

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Public tables:', tables.rows.map(r => r.table_name));

  const users = await client.query(`
    SELECT id, email, created_at, last_sign_in_at 
    FROM auth.users 
    ORDER BY created_at DESC;
  `);
  console.log('Auth Users Count:', users.rows.length);
  console.log('Users sample:', users.rows.map(u => ({ email: u.email, id: u.id })));

  const invoices = await client.query(`SELECT count(*) FROM public.invoices`);
  const clientsCount = await client.query(`SELECT count(*) FROM public.clients`);
  const productsCount = await client.query(`SELECT count(*) FROM public.products`);

  console.log('Stats DB: Invoices =', invoices.rows[0].count, ', Clients =', clientsCount.rows[0].count, ', Products =', productsCount.rows[0].count);

  await client.end();
}

inspect();
