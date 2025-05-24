import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/products/types';

// Função para buscar produtos públicos do backup
export const getBackupProducts = async (limit?: number): Promise<Product[]> => {
  try {
    console.log('Fetching public backup products from Supabase...');
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_public', true)
      .order('name');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching backup products:', error);
      // Se der erro, tenta buscar todos os produtos da tabela products
      console.log('Trying to fetch all products as fallback...');
      const fallbackQuery = supabase
        .from('products')
        .select('*')
        .order('name')
        .limit(limit || 50);
      
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      
      if (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
      
      console.log(`Successfully fetched ${fallbackData?.length || 0} products (fallback)`);
      return fallbackData as Product[] || [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} public products`);
    return data as Product[] || [];
  } catch (error) {
    console.error('Error in getBackupProducts:', error);
    return [];
  }
};

// Função para buscar todos os produtos (privados do usuário + públicos)
export const getAllAvailableProducts = async (userId?: string): Promise<Product[]> => {
  try {
    console.log(`Fetching all available products for user: ${userId || 'none'}`);
    
    // Buscar produtos do usuário
    let userQuery = supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (userId) {
      userQuery = userQuery.eq('user_id', userId);
    }
    
    // Buscar produtos públicos
    const publicQuery = supabase
      .from('products')
      .select('*')
      .eq('is_public', true)
      .order('name');
    
    const [userResult, publicResult] = await Promise.all([
      userQuery,
      publicQuery
    ]);
    
    if (userResult.error) {
      console.error('Error fetching user products:', userResult.error);
    }
    
    if (publicResult.error) {
      console.error('Error fetching public products:', publicResult.error);
    }
    
    // Combinar resultados
    const userProducts = userResult.data as Product[] || [];
    const publicProducts = publicResult.data as Product[] || [];
    
    // Remover duplicatas baseado em nome e categoria
    const allProducts = [...userProducts, ...publicProducts];
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => 
        p.name.toLowerCase() === product.name.toLowerCase() && 
        p.category.toLowerCase() === product.category.toLowerCase()
      )
    );
    
    console.log(`Found ${uniqueProducts.length} unique products total`);
    return uniqueProducts;
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
    
    if (userId) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else {
      query = query.eq('is_public', true);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching top selling products:', error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} top selling products`);
    return data as Product[] || [];
  } catch (error) {
    console.error('Error in getTopSellingProducts:', error);
    return [];
  }
};
