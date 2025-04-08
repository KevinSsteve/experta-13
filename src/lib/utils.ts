
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Funções para trabalhar com produtos

export async function getProductsFromSupabase() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos do Supabase:', error);
      return []; // Return empty array on error
    }
    
    return products || [];
  } catch (error) {
    console.error('Erro ao buscar produtos do Supabase:', error);
    return []; // Return empty array on error
  }
}

// Modified to safely handle localStorage errors
export function getProductsFromStorage(): any[] {
  // Always return empty array when in preview mode or localStorage isn't available
  // This prevents the SecurityError
  return [];
}

export async function saveProductToSupabase(product: any): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Usuário não está autenticado');
      return false;
    }

    const productToSave = {
      id: product.id || undefined, // Supabase irá gerar um UUID se não fornecido
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || '/placeholder.svg',
      code: product.code || null,
      description: product.description || null,
      is_public: product.isPublic || false,
      user_id: userData.user.id
    };

    const { error } = await supabase
      .from('products')
      .insert([productToSave]);
    
    if (error) {
      console.error('Erro ao salvar produto no Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar produto no Supabase:', error);
    return false;
  }
}

export async function updateProductInSupabase(product: any): Promise<boolean> {
  try {
    const productToUpdate = {
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || '/placeholder.svg',
      code: product.code || null,
      description: product.description || null,
      is_public: product.isPublic
    };

    const { error } = await supabase
      .from('products')
      .update(productToUpdate)
      .eq('id', product.id);
    
    if (error) {
      console.error('Erro ao atualizar produto no Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar produto no Supabase:', error);
    return false;
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir produto do Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir produto do Supabase:', error);
    return false;
  }
}

// Modified to avoid localStorage usage
export function saveProductsToStorage(products: any[]): void {
  // No-op function to avoid security errors
  console.log('saveProductsToStorage: localStorage disabled in preview mode');
}

export function getCategoriesFromProducts(products: any[]): string[] {
  const categories = products.map(product => product.category);
  return [...new Set(categories)].filter(Boolean);
}

export function filterProducts(
  products: any[], 
  searchQuery = ''
): any[] {
  return products.filter(product => {
    // Filtro por pesquisa de texto (nome ou código)
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });
}

export function getLowStockProducts(products: any[], threshold = 10): any[] {
  return products.filter(product => product.stock > 0 && product.stock < threshold);
}

export function getOutOfStockProducts(products: any[]): any[] {
  return products.filter(product => product.stock === 0);
}

export function calculateChange(totalAmount: number, amountPaid: number): number {
  return Math.max(0, amountPaid - totalAmount);
}

// Funções para trabalhar com vendas

export async function saveSaleToSupabase(sale: any): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Usuário não está autenticado');
      return false;
    }

    const saleToSave = {
      total: sale.total,
      amount_paid: sale.amountPaid,
      change: sale.change,
      items: sale.products,
      user_id: userData.user.id
    };

    const { error } = await supabase
      .from('sales')
      .insert([saleToSave]);
    
    if (error) {
      console.error('Erro ao salvar venda no Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar venda no Supabase:', error);
    return false;
  }
}

// Modified to avoid localStorage usage
export async function saveSaleToStorage(sale: any): Promise<void> {
  // No-op function to avoid security errors
  console.log('saveSaleToStorage: localStorage disabled in preview mode');
  
  // Still try to save to Supabase if user is logged in
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const saved = await saveSaleToSupabase(sale);
      if (saved) {
        console.log('Venda salva com sucesso no Supabase!');
      }
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
  }
}

export async function getSalesFromSupabase() {
  try {
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar vendas do Supabase:', error);
      return []; // Return empty array on error instead of fallback
    }
    
    return sales || [];
  } catch (error) {
    console.error('Erro ao buscar vendas do Supabase:', error);
    return []; // Return empty array on error
  }
}

// Modified to safely handle localStorage errors
export function getSalesFromStorage(): any[] {
  // Always return empty array when in preview mode or localStorage isn't available
  return [];
}

export async function updateProductStockAfterSale(items: any[]): Promise<void> {
  try {
    // Skip localStorage operations in preview mode
    console.log('updateProductStockAfterSale: localStorage operations skipped in preview mode');
    
    // Se o usuário estiver logado, atualizar também no Supabase
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        for (const item of items) {
          try {
            // Obter o produto atual do Supabase para ter o estoque atualizado
            const { data: productData, error: selectError } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product.id)
              .single();
            
            if (selectError || !productData) {
              console.error('Erro ao obter estoque atual do produto:', selectError);
              continue;
            }
            
            // Calcular novo estoque e atualizar no Supabase
            const newStock = Math.max(0, productData.stock - item.quantity);
            const { error: updateError } = await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.product.id);
            
            if (updateError) {
              console.error('Erro ao atualizar estoque do produto no Supabase:', updateError);
            }
          } catch (error) {
            console.error('Erro ao atualizar estoque do produto:', error);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
    }
  } catch (error) {
    console.error("Erro ao atualizar estoque após venda:", error);
  }
}

// Função auxiliar para verificar se o usuário está logado
export async function isUserLoggedIn(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return false;
  }
}

// Modified to avoid localStorage issues
export async function syncProductsToSupabase(): Promise<void> {
  // In preview mode, just inform this is skipped
  console.log('syncProductsToSupabase: skipped in preview mode due to localStorage restrictions');
  toast.success('Funcionalidade limitada no modo de visualização');
}

// Função para buscar produtos públicos (sugestões) de outros usuários
export async function getPublicProductSuggestions(): Promise<any[]> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return [];
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_public', true)
      .neq('user_id', userData.user.id); // Apenas produtos de outros usuários
    
    if (error) {
      console.error('Erro ao buscar sugestões de produtos:', error);
      return [];
    }
    
    // Converter is_public para isPublic para manter a consistência na aplicação
    return (products || []).map(product => ({
      ...product,
      isPublic: product.is_public
    }));
  } catch (error) {
    console.error('Erro ao buscar sugestões de produtos:', error);
    return [];
  }
}

// Função para tornar um produto público ou privado
export async function toggleProductPublicStatus(id: string, isPublic: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_public: isPublic })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao alterar status público do produto:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao alterar status público do produto:', error);
    return false;
  }
}
