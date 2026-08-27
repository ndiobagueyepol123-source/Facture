import { createClient } from '../supabase/client';
import { CompanySettings } from '@/types';

export const defaultCompanySettings: CompanySettings = {
  name: "Ma Boutique",
  tagline: "Gestion simple et rapide pour mon commerce",
  logoUrl: "",
  address: "",
  city: "Dakar",
  country: "SN",
  phone: "",
  phone2: "",
  email: "",
  website: "",
  currency: "FCFA",
  defaultVatRate: 0,
  defaultTerms: "Paiement à réception du reçu.",
  signatureUrl: "",
  primaryColor: "#2563EB",
  invoicePrefix: "FACT-",
  nextInvoiceNumber: 1,
  bankAccountName: "",
  bankAccountNumber: "",
  bankName: "",
  bankIban: "",
  mobileMoneyProvider: "Wave / Orange Money",
  mobileMoneyNumber: "",
  mobileMoneyName: "",
};

export async function getCompanySettings(): Promise<CompanySettings> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return defaultCompanySettings;
  }
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    return defaultCompanySettings;
  }

  return {
    name: data.name || "Ma Boutique",
    tagline: data.tagline || "",
    logoUrl: data.logo_url || "",
    address: data.address || "",
    city: data.city || "",
    country: data.country || "SN",
    phone: data.phone || "",
    phone2: data.phone2 || "",
    email: data.email || user.email || "",
    website: data.website || "",
    currency: data.currency || "FCFA",
    defaultVatRate: Number(data.default_vat_rate) || 0,
    defaultTerms: data.default_terms || "",
    signatureUrl: data.signature_url || "",
    primaryColor: data.primary_color || "#2563EB",
    invoicePrefix: data.invoice_prefix || "FACT-",
    nextInvoiceNumber: Number(data.next_invoice_number) || 1,
    bankAccountName: data.bank_account_name || "",
    bankAccountNumber: data.bank_account_number || "",
    bankName: data.bank_name || "",
    bankIban: data.bank_iban || "",
    mobileMoneyProvider: data.mobile_money_provider || "",
    mobileMoneyNumber: data.mobile_money_number || "",
    mobileMoneyName: data.mobile_money_name || "",
  };
}

export async function saveCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Utilisateur non connecté pour enregistrer les paramètres');
    return null;
  }
  
  const settingsData = {
    user_id: user.id,
    name: settings.name,
    tagline: settings.tagline || null,
    logo_url: settings.logoUrl || null,
    address: settings.address || null,
    city: settings.city || null,
    country: settings.country || 'SN',
    phone: settings.phone || null,
    phone2: settings.phone2 || null,
    email: settings.email || user.email,
    website: settings.website || null,
    currency: settings.currency || 'FCFA',
    default_vat_rate: Number(settings.defaultVatRate) || 0,
    default_terms: settings.defaultTerms || null,
    signature_url: settings.signatureUrl || null,
    primary_color: settings.primaryColor || null,
    invoice_prefix: settings.invoicePrefix || 'FACT-',
    next_invoice_number: Number(settings.nextInvoiceNumber) || 1,
    bank_account_name: settings.bankAccountName || null,
    bank_account_number: settings.bankAccountNumber || null,
    bank_name: settings.bankName || null,
    bank_iban: settings.bankIban || null,
    mobile_money_provider: settings.mobileMoneyProvider || null,
    mobile_money_number: settings.mobileMoneyNumber || null,
    mobile_money_name: settings.mobileMoneyName || null,
    updated_at: new Date().toISOString(),
  };

  // Check if row already exists for this user
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  let error;
  if (existing) {
    const res = await supabase
      .from('settings')
      .update(settingsData)
      .eq('id', existing.id)
      .eq('user_id', user.id);
    error = res.error;
  } else {
    const res = await supabase
      .from('settings')
      .insert([settingsData]);
    error = res.error;
  }

  if (error) {
    console.error('Erreur sauvegarde paramètres:', error);
    return null;
  }

  return getCompanySettings();
}
