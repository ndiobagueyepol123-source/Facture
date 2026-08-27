const { Client } = require('pg');

const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
});

const migrationSql = `
-- 1. Ajouter la colonne user_id aux tables si elle n'existe pas déjà
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'user_id') THEN
        ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'user_id') THEN
        ALTER TABLE public.products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'user_id') THEN
        ALTER TABLE public.settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'user_id') THEN
        ALTER TABLE public.invoices ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'user_id') THEN
        ALTER TABLE public.invoice_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Assigner les données existantes sans user_id à un utilisateur existant (si présent) pour éviter les orphelins
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    IF first_user_id IS NOT NULL THEN
        UPDATE public.clients SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.products SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.settings SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.invoices SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.invoice_items SET user_id = first_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 3. Activer Row Level Security (RLS) sur toutes les tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- 4. Nettoyer les anciennes politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
DROP POLICY IF EXISTS "Clients policy" ON public.clients;
DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;
DROP POLICY IF EXISTS "Products policy" ON public.products;
DROP POLICY IF EXISTS "Users can manage own products" ON public.products;

DROP POLICY IF EXISTS "Users can view own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.settings;
DROP POLICY IF EXISTS "Settings policy" ON public.settings;
DROP POLICY IF EXISTS "Users can manage own settings" ON public.settings;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Invoices policy" ON public.invoices;
DROP POLICY IF EXISTS "Users can manage own invoices" ON public.invoices;

DROP POLICY IF EXISTS "Users can view own invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert own invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update own invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete own invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Invoice items policy" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can manage own invoice_items" ON public.invoice_items;

-- 5. Créer les politiques RLS sécurisées

-- Table CLIENTS
CREATE POLICY "Users can manage own clients"
ON public.clients
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Table PRODUCTS
CREATE POLICY "Users can manage own products"
ON public.products
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Table SETTINGS
CREATE POLICY "Users can manage own settings"
ON public.settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Table INVOICES
CREATE POLICY "Users can manage own invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Table INVOICE_ITEMS
CREATE POLICY "Users can manage own invoice_items"
ON public.invoice_items
FOR ALL
TO authenticated
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE public.invoices.id = public.invoice_items.invoice_id
        AND public.invoices.user_id = auth.uid()
    )
)
WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE public.invoices.id = public.invoice_items.invoice_id
        AND public.invoices.user_id = auth.uid()
    )
);
`;

async function runMigration() {
  try {
    console.log("Connexion à Supabase PostgreSQL...");
    await client.connect();
    console.log("Exécution de la migration RLS et user_id...");
    await client.query(migrationSql);
    console.log("✅ Migration réussie avec succès !");
  } catch (error) {
    console.error("❌ Erreur pendant la migration :", error);
  } finally {
    await client.end();
  }
}

runMigration();
