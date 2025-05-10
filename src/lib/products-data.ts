
import { supabase } from "@/integrations/supabase/client";
import { Product } from './products/types';

export async function getCategories(userId?: string): Promise<string[]> {
  try {
    let query = supabase.from('products').select('category');
    
    // Se um user ID foi fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
    
    // Se não houver dados, retornar categorias padrão
    if (!data || data.length === 0) {
      return ["Alimentos Básicos", "Laticínios", "Hortifruti", "Carnes", "Padaria", 
              "Bebidas", "Limpeza", "Higiene", "Pet Shop", "Outros"];
    }
    
    // Extrair categorias únicas do resultado
    const categories = Array.from(new Set(data.map((row) => row.category)));
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    // Retornar categorias padrão em caso de erro
    return ["Alimentos Básicos", "Laticínios", "Hortifruti", "Carnes", "Padaria", 
            "Bebidas", "Limpeza", "Higiene", "Pet Shop", "Outros"];
  }
}

// Adicionando função para listar produtos com melhor venda
export async function getTopSellingProducts(userId?: string, limit: number = 10): Promise<Product[]> {
  try {
    if (!userId) {
      console.warn('getTopSellingProducts: Nenhum ID de usuário fornecido');
      return [];
    }

    // Buscamos produtos com base em dois critérios:
    // 1. Produtos com estoque baixo (prioridade alta)
    // 2. Produtos com preço mais alto (maior valor)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('stock', { ascending: true }) // Primeiro por estoque baixo
      .order('price', { ascending: false }) // Depois por preço mais alto
      .limit(limit);
    
    if (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      throw error;
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Erro ao obter produtos mais vendidos:', error);
    return [];
  }
}

// Nova função para obter produtos de backup (cópias de segurança)
export async function getBackupProducts(limit: number = 100): Promise<Product[]> {
  try {
    console.log('Buscando produtos de backup para sugestões');
    
    const { data, error } = await supabase
      .from('product_backups')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name')
      .limit(limit);
    
    if (error) {
      console.error('Erro ao buscar produtos de backup:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} produtos de backup`);
    return data as Product[];
  } catch (error) {
    console.error('Erro ao obter produtos de backup:', error);
    return [];
  }
}

// Re-export the Product type from the products module for backward compatibility
export type { Product } from './products/types';
