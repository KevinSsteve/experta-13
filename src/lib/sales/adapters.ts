
import { supabase } from '@/integrations/supabase/client';
import { Sale } from './types';
import { getSalesFromStorage } from '../utils';

// Improved adapter function to handle Supabase sales data
export function adaptSupabaseSale(supabaseSale: any): Sale {
  // Default values
  let paymentMethod = "Não especificado";
  let customer = undefined;
  let items = 0;
  let products = [];
  
  // Extract data from the items JSON field
  if (supabaseSale.items) {
    // Handle payment method
    if (supabaseSale.items.paymentMethod) {
      paymentMethod = supabaseSale.items.paymentMethod;
    }
    
    // Handle customer
    if (supabaseSale.items.customer && supabaseSale.items.customer.name) {
      // Get customer name as string instead of rendering an object
      customer = typeof supabaseSale.items.customer.name === 'string' 
        ? supabaseSale.items.customer.name 
        : 'Cliente';
    }
    
    // Handle products
    if (supabaseSale.items.products && Array.isArray(supabaseSale.items.products)) {
      products = supabaseSale.items.products;
      items = products.length;
    }
    // Fallback - try to count items if they exist as an array
    else if (Array.isArray(supabaseSale.items)) {
      items = supabaseSale.items.length;
      products = supabaseSale.items;
    }
  }
  
  return {
    id: supabaseSale.id,
    date: supabaseSale.date || new Date().toISOString(),
    total: supabaseSale.total,
    amountPaid: supabaseSale.amount_paid,
    change: supabaseSale.change,
    items: items,
    paymentMethod: paymentMethod,
    customer: customer,
    products: products
  };
}

// Função para obter as vendas do Supabase
export async function fetchSalesFromSupabase() {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar vendas do Supabase:', error);
    return [];
  }
  
  // Converter os dados do Supabase para o formato Sale
  return data.map(sale => adaptSupabaseSale(sale));
}
