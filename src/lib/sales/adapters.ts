
import { supabase } from '@/integrations/supabase/client';
import { Sale } from './types';
import { Json } from '@/integrations/supabase/types';

// Função para adaptar os dados de venda do Supabase para o tipo Sale
export function adaptSupabaseSale(supabaseSale: any): Sale {
  return {
    id: supabaseSale.id,
    date: supabaseSale.date,
    customer: supabaseSale.customer || 'Cliente não identificado',
    items: typeof supabaseSale.items === 'number' 
      ? supabaseSale.items 
      : (Array.isArray(supabaseSale.items) 
          ? supabaseSale.items.length 
          : 1),
    total: supabaseSale.total,
    paymentMethod: supabaseSale.payment_method || 'Dinheiro',
    amountPaid: supabaseSale.amount_paid,
    change: supabaseSale.change,
    products: Array.isArray(supabaseSale.items) 
      ? supabaseSale.items 
      : (typeof supabaseSale.items === 'object' 
          ? [supabaseSale.items] 
          : []),
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
