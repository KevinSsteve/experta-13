
import { supabase } from '@/integrations/supabase/client';
import { Sale } from './types';
import { Json } from '@/integrations/supabase/types';

// Função para adaptar os dados de venda do Supabase para o tipo Sale
export function adaptSupabaseSale(supabaseSale: any): Sale {
  return {
    id: supabaseSale.id,
    date: supabaseSale.date,
    customer: supabaseSale.customer || {
      name: 'Cliente não identificado',
      email: ''
    },
    items: Array.isArray(supabaseSale.items) 
      ? supabaseSale.items 
      : (typeof supabaseSale.items === 'object' 
          ? [supabaseSale.items] 
          : []),
    total: supabaseSale.total,
    paymentMethod: supabaseSale.payment_method || 'Dinheiro',
    status: supabaseSale.status || 'Concluída',
    notes: supabaseSale.notes || '',
    seller: supabaseSale.seller || {
      name: 'Vendedor não identificado',
      id: ''
    },
    user_id: supabaseSale.user_id
  };
}

// Função para buscar vendas do Supabase
export async function fetchSalesFromSupabase(userId?: string): Promise<Sale[]> {
  try {
    let query = supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false });
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar vendas do Supabase:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Converter os dados do Supabase para o tipo Sale
    return data.map(sale => adaptSupabaseSale(sale));
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return [];
  }
}
