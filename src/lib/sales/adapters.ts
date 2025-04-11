
import { supabase } from '@/integrations/supabase/client';
import { Sale } from './types';

export const adaptSupabaseSale = (sale: any): Sale => {
  try {
    console.log('[adaptSupabaseSale] Convertendo venda do Supabase:', sale);
    
    // Extrair cliente dos dados JSON, se disponível
    let customer = sale.customer || 'Cliente não identificado';
    if (typeof customer !== 'string' && sale.items && sale.items.customer) {
      customer = sale.items.customer.name || 'Cliente não identificado';
    }

    // Extrair método de pagamento se disponível
    let paymentMethod = sale.payment_method || 'Dinheiro';
    if (!paymentMethod && sale.items && sale.items.paymentMethod) {
      paymentMethod = sale.items.paymentMethod;
    }

    // Contar itens se disponível
    let items = [];
    if (sale.items && sale.items.products && Array.isArray(sale.items.products)) {
      items = sale.items.products;
    } else {
      items = [];
    }

    // Converter para o formato Sale
    return {
      id: sale.id,
      date: sale.date || new Date().toISOString(),
      customer: customer,
      total: sale.total,
      items: items,
      paymentMethod: paymentMethod,
      amountPaid: sale.amount_paid || sale.total,
      change: sale.change || 0,
      user_id: sale.user_id
    };
  } catch (error) {
    console.error('Erro ao adaptar venda do Supabase:', error);
    // Retornar objeto com valores padrão em caso de erro
    return {
      id: sale.id || 'unknown-id',
      date: sale.date || new Date().toISOString(),
      customer: 'Erro ao carregar cliente',
      total: sale.total || 0,
      items: [],
      paymentMethod: 'Desconhecido',
      amountPaid: sale.amount_paid || 0,
      change: sale.change || 0,
      user_id: sale.user_id
    };
  }
};

export const fetchSalesFromSupabase = async (userId?: string): Promise<Sale[]> => {
  try {
    console.log(`[fetchSalesFromSupabase] Buscando vendas para o usuário: ${userId || 'anônimo'}`);

    // Verificar se há um usuário logado para filtrar
    if (!userId) {
      console.warn('[fetchSalesFromSupabase] Tentativa de buscar vendas sem ID de usuário');
      return [];
    }

    // Criar a consulta base
    let query = supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false });

    // Adicionar filtro por usuário se fornecido
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Executar a consulta
    const { data, error } = await query;

    if (error) {
      console.error('[fetchSalesFromSupabase] Erro ao buscar vendas:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`[fetchSalesFromSupabase] Nenhuma venda encontrada para o usuário ${userId}`);
      return [];
    }

    console.log(`[fetchSalesFromSupabase] Encontradas ${data.length} vendas para o usuário ${userId}:`, data);
    
    // Converter os dados para o formato Sale
    const sales = data.map(sale => adaptSupabaseSale(sale));
    return sales;
  } catch (error) {
    console.error('[fetchSalesFromSupabase] Erro ao buscar vendas:', error);
    return [];
  }
};
