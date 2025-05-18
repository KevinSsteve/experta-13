
import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';
import { getPhoneticCode } from '@/utils/productMatchUtils';

/**
 * Busca produtos similares com base em um termo de pesquisa
 * @param searchTerm Termo para buscar produtos similares
 * @param limit Número máximo de resultados a retornar
 * @param userId ID do usuário para filtrar produtos (opcional)
 */
export const searchSimilarProducts = async (
  searchTerm: string,
  limit: number = 10,
  userId?: string
): Promise<Product[]> => {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }
    
    console.log(`Buscando produtos similares para: "${searchTerm}", limite: ${limit}`);
    
    // Criar a consulta básica
    let query = supabase
      .from('products')
      .select('*')
      .order('name')
      .limit(limit);
    
    // Adicionar filtro de usuário se fornecido
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Adicionar filtro de busca por nome usando ilike (case insensitive)
    query = query.ilike('name', `%${searchTerm}%`);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro na busca de produtos similares:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} produtos similares para "${searchTerm}"`);
    
    if (!data || data.length === 0) {
      // Tentar busca fonética se não houver resultados
      const phoneticCode = getPhoneticCode(searchTerm);
      console.log(`Tentando busca fonética com código: ${phoneticCode}`);
      
      // Buscar todos os produtos e filtrar localmente por correspondência fonética
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*')
        .order('name')
        .limit(50);
        
      if (allError || !allProducts) {
        return [];
      }
      
      // Filtrar por correspondência fonética
      const phoneticMatches = allProducts.filter(product => {
        const productPhoneticCode = getPhoneticCode(product.name);
        return productPhoneticCode.includes(phoneticCode) || 
               phoneticCode.includes(productPhoneticCode);
      }).slice(0, limit);
      
      console.log(`Encontrados ${phoneticMatches.length} produtos com correspondência fonética`);
      return phoneticMatches as Product[];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Erro ao buscar produtos similares:', error);
    return [];
  }
};
