
import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';

// Função para buscar produtos do Supabase para o usuário atual
export async function fetchProductsFromSupabase(userId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('name');
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar produtos do Supabase:', error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}
