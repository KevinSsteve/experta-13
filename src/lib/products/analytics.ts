
import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';
import hardcodedProducts from './fallback';
import { fetchProductsFromSupabase } from './adapters';

export async function getTopSellingProducts(limit: number = 5, userId?: string): Promise<Product[]> {
  try {
    // Em uma implementação real, você buscaria os produtos mais vendidos
    // com base nos dados de vendas do usuário atual
    const products = await fetchProductsFromSupabase(userId);
    
    if (products.length === 0) {
      return [...hardcodedProducts].sort(() => Math.random() - 0.5).slice(0, limit);
    }
    
    // Simulando produtos mais vendidos (ordenando aleatoriamente)
    return [...products].sort(() => Math.random() - 0.5).slice(0, limit);
  } catch (error) {
    console.error('Erro ao obter produtos mais vendidos:', error);
    return [...hardcodedProducts].sort(() => Math.random() - 0.5).slice(0, limit);
  }
}

export async function getLowStockProducts(threshold: number = 10, userId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .lte('stock', threshold)
      .order('stock');
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Product[] || [];
  } catch (error) {
    console.error('Erro ao obter produtos com estoque baixo:', error);
    return hardcodedProducts.filter((product) => product.stock > 0 && product.stock <= threshold);
  }
}

export async function getProductsInStock(userId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('name');
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Product[] || [];
  } catch (error) {
    console.error('Erro ao obter produtos em estoque:', error);
    return hardcodedProducts.filter((product) => product.stock > 0);
  }
}

export async function getOutOfStockProducts(userId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('stock', 0)
      .order('name');
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Product[] || [];
  } catch (error) {
    console.error('Erro ao obter produtos fora de estoque:', error);
    return hardcodedProducts.filter((product) => product.stock === 0);
  }
}
