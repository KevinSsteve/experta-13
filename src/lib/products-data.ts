
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
              "Bebidas", "Limpeza", "Higiene", "Outros"];
    }
    
    // Extrair categorias únicas do resultado
    const categories = Array.from(new Set(data.map((row) => row.category)));
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    // Retornar categorias padrão em caso de erro
    return ["Alimentos Básicos", "Laticínios", "Hortifruti", "Carnes", "Padaria", 
            "Bebidas", "Limpeza", "Higiene", "Outros"];
  }
}

// Re-export the Product type from the products module for backward compatibility
export type { Product } from './products/types';
