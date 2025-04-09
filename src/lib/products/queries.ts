
import { Product } from './types';
import { fetchProductsFromSupabase } from './adapters';
import hardcodedProducts from './fallback';

// Função para obter produtos
export async function getProducts(search = '', category = '', minPrice = 0, maxPrice = Infinity, inStock = false, userId?: string): Promise<Product[]> {
  try {
    // Buscar produtos do Supabase para o usuário atual
    let products = await fetchProductsFromSupabase(userId);
    
    // Se não encontrar produtos no Supabase, use os dados hardcoded
    if (products.length === 0) {
      products = hardcodedProducts;
    }
    
    // Filtrar produtos
    let filteredProducts = [...products];
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) => 
          product.name.toLowerCase().includes(searchLower) || 
          (product.code && product.code.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrar por categoria
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }
    
    // Filtrar por preço
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );
    
    // Filtrar por estoque
    if (inStock) {
      filteredProducts = filteredProducts.filter(
        (product) => product.stock > 0
      );
    }
    
    return filteredProducts;
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    return [];
  }
}

export async function getProduct(id: string, userId?: string): Promise<Product | undefined> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('id', id);
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      throw error;
    }
    
    return data as Product;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    // Fallback para dados hardcoded
    return hardcodedProducts.find((product) => product.id === id);
  }
}

export async function getCategories(userId?: string): Promise<string[]> {
  try {
    const products = await fetchProductsFromSupabase(userId);
    return Array.from(new Set(products.map((product) => product.category)));
  } catch (error) {
    console.error('Erro ao obter categorias:', error);
    return Array.from(new Set(hardcodedProducts.map((product) => product.category)));
  }
}
