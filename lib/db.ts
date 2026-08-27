import { Pool } from 'pg';

const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

// Singleton Pool pour réutiliser les connexions et éviter les timeouts
declare global {
  var _pgPool: Pool | undefined;
}

export const pool = globalThis._pgPool || new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool;
}
