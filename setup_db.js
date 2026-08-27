const { Client } = require('pg');

const connectionString = 'postgresql://postgres.npbjbcmtekhkyfrebced:tWhllVizRyepszSt@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
});

const sql = `
-- Création de la table clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    total_invoiced NUMERIC DEFAULT 0,
    invoice_count INTEGER DEFAULT 0,
    notes TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'Actif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    vat_rate NUMERIC DEFAULT 18,
    description TEXT,
    stock TEXT,
    category TEXT,
    type TEXT,
    sku TEXT,
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table settings
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    tagline TEXT,
    logo_url TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    phone TEXT,
    phone2 TEXT,
    email TEXT,
    website TEXT,
    currency TEXT DEFAULT 'FCFA',
    default_vat_rate NUMERIC DEFAULT 18,
    default_terms TEXT,
    signature_url TEXT,
    primary_color TEXT,
    invoice_prefix TEXT DEFAULT 'FACT-',
    next_invoice_number INTEGER DEFAULT 1,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    bank_iban TEXT,
    mobile_money_provider TEXT,
    mobile_money_number TEXT,
    mobile_money_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    subtotal NUMERIC DEFAULT 0,
    vat_rate NUMERIC DEFAULT 0,
    vat_amount NUMERIC DEFAULT 0,
    discount_rate NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    amount_due NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Brouillon',
    notes TEXT,
    terms TEXT,
    signature_url TEXT,
    payment_method TEXT,
    payment_details TEXT,
    currency TEXT DEFAULT 'FCFA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table invoice_items
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    vat_rate NUMERIC DEFAULT 0,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

async function setup() {
  try {
    console.log("Connexion à la base de données Supabase...");
    await client.connect();
    
    console.log("Exécution du script de création des tables...");
    await client.query(sql);
    
    console.log("SUCCESS: Toutes les tables ont été créées avec succès !");
  } catch (err) {
    console.error("ERROR: Impossible de créer les tables. Erreur complète :");
    console.error(err);
  } finally {
    await client.end();
  }
}

setup();
