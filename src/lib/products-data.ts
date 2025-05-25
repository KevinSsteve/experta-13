
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/products/types';

// Função para buscar produtos públicos do backup
export const getBackupProducts = async (limit?: number): Promise<Product[]> => {
  try {
    console.log('Fetching all products from Supabase...');
    
    let query = supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    // Garantir que todos os produtos tenham purchase_price obrigatório
    const productsWithPurchasePrice = (data || []).map(product => ({
      ...product,
      purchase_price: product.purchase_price || product.price * 0.7,
    })) as Product[];
    
    console.log(`Successfully fetched ${productsWithPurchasePrice.length} products`);
    return productsWithPurchasePrice;
  } catch (error) {
    console.error('Error in getBackupProducts:', error);
    return [];
  }
};

// Função para buscar todos os produtos (privados do usuário + públicos)
export const getAllAvailableProducts = async (userId?: string): Promise<Product[]> => {
  try {
    console.log(`Fetching all available products for user: ${userId || 'none'}`);
    
    // Buscar todos os produtos disponíveis
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    // Garantir que todos os produtos tenham purchase_price
    const productsWithPurchasePrice = (data || []).map(product => ({
      ...product,
      purchase_price: product.purchase_price || product.price * 0.7,
    })) as Product[];
    
    console.log(`Found ${productsWithPurchasePrice.length} products total`);
    return productsWithPurchasePrice;
  } catch (error) {
    console.error('Error in getAllAvailableProducts:', error);
    return [];
  }
};

// Função para buscar produtos mais vendidos (simulação baseada no estoque)
export const getTopSellingProducts = async (userId?: string, limit?: number): Promise<Product[]> => {
  try {
    console.log(`Fetching top selling products for user: ${userId || 'none'}`);
    
    let query = supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: false }); // Produtos com mais estoque (simulando vendas)
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching top selling products:', error);
      throw error;
    }
    
    // Garantir que todos os produtos tenham purchase_price
    const productsWithPurchasePrice = (data || []).map(product => ({
      ...product,
      purchase_price: product.purchase_price || product.price * 0.7,
    })) as Product[];
    
    console.log(`Successfully fetched ${productsWithPurchasePrice.length} top selling products`);
    return productsWithPurchasePrice;
  } catch (error) {
    console.error('Error in getTopSellingProducts:', error);
    return [];
  }
};
