
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/products/types';

// Função para buscar produtos públicos do backup
export const getBackupProducts = async (limit?: number): Promise<Product[]> => {
  try {
    console.log('Fetching all products from Supabase...');
    
    // Buscar produtos da tabela "products"
    let productsQuery = supabase
      .from('products')
      .select('*')
      .order('name');
    
    // Buscar produtos da tabela "New"
    let newProductsQuery = supabase
      .from('New')
      .select('*')
      .order('name');
    
    if (limit) {
      const halfLimit = Math.ceil(limit / 2);
      productsQuery = productsQuery.limit(halfLimit);
      newProductsQuery = newProductsQuery.limit(halfLimit);
    }
    
    const [{ data: productsData, error: productsError }, { data: newProductsData, error: newProductsError }] = await Promise.all([
      productsQuery,
      newProductsQuery
    ]);
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
    }
    
    if (newProductsError) {
      console.error('Error fetching New products:', newProductsError);
    }
    
    // Combinar dados das duas tabelas
    const combinedData = [
      ...(productsData || []),
      ...(newProductsData || [])
    ];
    
    // Aplicar limite se especificado
    const finalData = limit ? combinedData.slice(0, limit) : combinedData;
    
    // Garantir que todos os produtos tenham purchase_price obrigatório
    const productsWithPurchasePrice = finalData.map(product => ({
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
    
    // Buscar produtos da tabela "products"
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    // Buscar produtos da tabela "New"
    const { data: newProductsData, error: newProductsError } = await supabase
      .from('New')
      .select('*')
      .order('name');
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
    }
    
    if (newProductsError) {
      console.error('Error fetching New products:', newProductsError);
    }
    
    // Combinar dados das duas tabelas
    const combinedData = [
      ...(productsData || []),
      ...(newProductsData || [])
    ];
    
    // Garantir que todos os produtos tenham purchase_price
    const productsWithPurchasePrice = combinedData.map(product => ({
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
    
    // Buscar produtos da tabela "products"
    let productsQuery = supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: false });
    
    // Buscar produtos da tabela "New"
    let newProductsQuery = supabase
      .from('New')
      .select('*')
      .order('stock', { ascending: false });
    
    if (limit) {
      const halfLimit = Math.ceil(limit / 2);
      productsQuery = productsQuery.limit(halfLimit);
      newProductsQuery = newProductsQuery.limit(halfLimit);
    }
    
    const [{ data: productsData, error: productsError }, { data: newProductsData, error: newProductsError }] = await Promise.all([
      productsQuery,
      newProductsQuery
    ]);
    
    if (productsError) {
      console.error('Error fetching top selling products:', productsError);
    }
    
    if (newProductsError) {
      console.error('Error fetching top selling New products:', newProductsError);
    }
    
    // Combinar e ordenar por estoque
    const combinedData = [
      ...(productsData || []),
      ...(newProductsData || [])
    ].sort((a, b) => (b.stock || 0) - (a.stock || 0));
    
    // Aplicar limite final se especificado
    const finalData = limit ? combinedData.slice(0, limit) : combinedData;
    
    // Garantir que todos os produtos tenham purchase_price
    const productsWithPurchasePrice = finalData.map(product => ({
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
