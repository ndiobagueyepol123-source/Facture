import { createClient as getSupabase } from '../supabase/client';
import { Client } from '@/types';

export async function getClients(): Promise<Client[]> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    company: c.company || '',
    email: c.email || '',
    phone: c.phone || '',
    address: c.address || '',
    city: c.city || '',
    country: c.country || '',
    totalInvoiced: Number(c.total_invoiced) || 0,
    invoiceCount: Number(c.invoice_count) || 0,
    notes: c.notes || '',
    avatar: c.avatar || '',
    status: c.status || 'Actif',
    createdAt: c.created_at,
  }));
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Erreur lors de la récupération du client:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    company: data.company || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    city: data.city || '',
    country: data.country || '',
    totalInvoiced: Number(data.total_invoiced) || 0,
    invoiceCount: Number(data.invoice_count) || 0,
    notes: data.notes || '',
    avatar: data.avatar || '',
    status: data.status || 'Actif',
    createdAt: data.created_at,
  };
}

export async function createClient(client: Partial<Client>): Promise<Client | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Utilisateur non connecté pour créer un client');
    return null;
  }
  
  const clientData = {
    user_id: user.id,
    name: client.name,
    company: client.company || null,
    email: client.email || null,
    phone: client.phone || null,
    address: client.address || null,
    city: client.city || null,
    country: client.country || null,
    notes: client.notes || null,
    avatar: client.avatar || null,
    status: client.status || 'Actif',
    total_invoiced: Number(client.totalInvoiced) || 0,
    invoice_count: Number(client.invoiceCount) || 0,
  };
  
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single();

  if (error || !data) {
    console.error('Erreur création client:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    company: data.company || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    city: data.city || '',
    country: data.country || '',
    totalInvoiced: Number(data.total_invoiced) || 0,
    invoiceCount: Number(data.invoice_count) || 0,
    notes: data.notes || '',
    avatar: data.avatar || '',
    status: data.status || 'Actif',
    createdAt: data.created_at,
  };
}
