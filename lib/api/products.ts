import { createClient } from '../supabase/client';
import { Product } from '@/types';

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price) || 0,
    vatRate: Number(p.vat_rate) || 0,
    description: p.description || '',
    stock: p.stock || undefined,
    category: p.category || '',
    type: (p.type as 'Produit' | 'Service') || 'Service',
    sku: p.sku || '',
    unit: p.unit || 'unité',
  }));
}

export async function createProduct(product: Partial<Product>): Promise<Product | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Utilisateur non connecté pour créer un produit');
    return null;
  }
  
  const productData = {
    user_id: user.id,
    name: product.name,
    price: Number(product.price) || 0,
    vat_rate: Number(product.vatRate) || 0,
    description: product.description || null,
    stock: product.stock ? String(product.stock) : null,
    category: product.category || null,
    type: product.type || 'Service',
    sku: product.sku || null,
    unit: product.unit || 'unité',
  };
  
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error || !data) {
    console.error('Erreur création produit:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    price: Number(data.price) || 0,
    vatRate: Number(data.vat_rate) || 0,
    description: data.description || '',
    stock: data.stock || undefined,
    category: data.category || '',
    type: (data.type as 'Produit' | 'Service') || 'Service',
    sku: data.sku || '',
    unit: data.unit || 'unité',
  };
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Erreur suppression produit:', error);
    return false;
  }
  return true;
}
