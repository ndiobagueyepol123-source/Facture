import { createClient } from '../supabase/client';
import { Invoice, InvoiceItem } from '@/types';

// Fonction pour mapper les données brutes de Supabase (snake_case) vers notre type Invoice (camelCase)
const mapInvoiceItemFromDB = (item: any): InvoiceItem => ({
  id: item.id,
  description: item.description,
  quantity: Number(item.quantity) || 1,
  unitPrice: Number(item.unit_price) || 0,
  vatRate: Number(item.vat_rate) || 0,
  amount: Number(item.amount) || 0,
});

const mapInvoiceFromDB = (data: any): Invoice => {
  const exactTime = data.created_at || data.issue_date;
  
  return {
    id: data.id,
    number: data.number,
    createdAt: data.created_at,
    issueDate: exactTime,
    dueDate: data.due_date,
    clientId: data.client_id,
    client: data.client,
    items: data.items ? data.items.map(mapInvoiceItemFromDB) : [],
    subtotal: Number(data.subtotal) || 0,
    vatRate: Number(data.vat_rate) || 0,
    vatAmount: Number(data.vat_amount) || 0,
    discountRate: Number(data.discount_rate) || 0,
    discountAmount: Number(data.discount_amount) || 0,
    total: Number(data.total) || 0,
    amountPaid: Number(data.amount_paid) || 0,
    amountDue: Number(data.amount_due) || 0,
    status: data.status,
    notes: data.notes,
    terms: data.terms,
    signatureUrl: data.signature_url,
    paymentMethod: data.payment_method,
    paymentDetails: data.payment_details,
    currency: data.currency || 'FCFA',
  };
};

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(*),
      items:invoice_items(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return [];
  }

  return data ? data.map(mapInvoiceFromDB) : [];
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(*),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    return null;
  }

  return data ? mapInvoiceFromDB(data) : null;
}

export async function createInvoice(invoice: Partial<Invoice>): Promise<Invoice | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("Impossible de créer une facture sans utilisateur authentifié");
    return null;
  }
  
  // 1. Insert the invoice with user_id
  const { items, client, companySettings, ...invoiceData } = invoice as any;
  
  const mappedInvoiceData = {
    user_id: user.id,
    number: invoiceData.number,
    issue_date: invoiceData.issueDate ? invoiceData.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
    due_date: invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : new Date().toISOString().split('T')[0],
    client_id: invoiceData.clientId && invoiceData.clientId !== "cli-divers" ? invoiceData.clientId : null,
    subtotal: Number(invoiceData.subtotal) || 0,
    vat_rate: Number(invoiceData.vatRate) || 0,
    vat_amount: Number(invoiceData.vatAmount) || 0,
    discount_rate: Number(invoiceData.discountRate) || 0,
    discount_amount: Number(invoiceData.discountAmount) || 0,
    total: Number(invoiceData.total) || 0,
    amount_paid: Number(invoiceData.amountPaid) || 0,
    amount_due: Number(invoiceData.amountDue) || 0,
    status: invoiceData.status || 'Payée',
    notes: invoiceData.notes || null,
    terms: invoiceData.terms || null,
    signature_url: invoiceData.signatureUrl || null,
    payment_method: invoiceData.paymentMethod || null,
    payment_details: invoiceData.paymentDetails || null,
    currency: invoiceData.currency || 'FCFA'
  };
  
  const { data: newInvoice, error: invError } = await supabase
    .from('invoices')
    .insert([mappedInvoiceData])
    .select()
    .single();

  if (invError) {
    console.error('Erreur création facture:', invError);
    return null;
  }

  // 2. Insert items if any
  if (items && items.length > 0) {
    const itemsData = items.map((item: any) => ({
      user_id: user.id,
      invoice_id: newInvoice.id,
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unitPrice) || 0,
      vat_rate: Number(item.vatRate) || 0,
      amount: Number(item.amount) || 0,
    }));
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsData);
      
    if (itemsError) {
      console.error('Erreur création lignes facture:', itemsError);
    }
  }

  return getInvoiceById(newInvoice.id);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Erreur suppression facture:', error);
    return false;
  }
  return true;
}

export async function deleteInvoices(ids: string[]): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { error } = await supabase
    .from('invoices')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id);

  if (error) {
    console.error('Erreur suppression factures multiples:', error);
    return false;
  }
  return true;
}
