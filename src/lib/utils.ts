
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
      return getProductsFromStorage(); // Fallback para localStorage
    }
    
    return products || [];
  } catch (error) {
    console.error('Erro ao buscar produtos do Supabase:', error);
    return getProductsFromStorage(); // Fallback para localStorage
  }
}

export function getProductsFromStorage(): any[] {
  try {
    const savedProducts = localStorage.getItem("products");
    return savedProducts ? JSON.parse(savedProducts) : [];
  } catch (error) {
    console.error("Erro ao acessar localStorage:", error);
    return []; // Return empty array if localStorage isn't available
  }
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
      .insert(productToSave);
    
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

export function saveProductsToStorage(products: any[]): void {
  try {
    localStorage.setItem("products", JSON.stringify(products));
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error);
  }
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
      .insert(saleToSave);
    
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

export async function saveSaleToStorage(sale: any): Promise<void> {
  try {
    const savedSales = getSalesFromStorage();
    savedSales.push({
      ...sale,
      id: generateId(),
      date: new Date().toISOString(),
    });
    localStorage.setItem("sales", JSON.stringify(savedSales));
    
    // Tentar salvar no Supabase se o usuário estiver logado
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
    
    // Importamos dinamicamente para evitar dependências circulares
    try {
      import('./sales-data').then(module => {
        // Atualize os dados de vendas para refletir no dashboard
        module.refreshSalesData();
      }).catch(error => {
        console.error("Erro ao atualizar dados de vendas:", error);
      });
    } catch (error) {
      console.error("Erro ao importar módulo:", error);
    }
  } catch (error) {
    console.error("Erro ao salvar venda no localStorage:", error);
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
      return getSalesFromStorage(); // Fallback para localStorage
    }
    
    return sales || [];
  } catch (error) {
    console.error('Erro ao buscar vendas do Supabase:', error);
    return getSalesFromStorage(); // Fallback para localStorage
  }
}

export function getSalesFromStorage(): any[] {
  try {
    const savedSales = localStorage.getItem("sales");
    return savedSales ? JSON.parse(savedSales) : [];
  } catch (error) {
    console.error("Erro ao acessar localStorage:", error);
    return []; // Return empty array if localStorage isn't available
  }
}

export async function updateProductStockAfterSale(items: any[]): Promise<void> {
  try {
    const products = getProductsFromStorage();
    
    // Update stock for each sold item
    items.forEach(item => {
      const productIndex = products.findIndex(p => p.id === item.product.id);
      if (productIndex !== -1) {
        products[productIndex].stock = Math.max(0, products[productIndex].stock - item.quantity);
      }
    });
    
    // Save updated products back to storage
    saveProductsToStorage(products);
    
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

// Função para sincronizar produtos do localStorage para o Supabase
export async function syncProductsToSupabase(): Promise<void> {
  try {
    const localProducts = getProductsFromStorage();
    
    const { data } = await supabase.auth.getSession();
    if (!data.session || localProducts.length === 0) {
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Usuário não está autenticado');
      return;
    }
    
    // Primeiro, buscamos os produtos já existentes no Supabase para o usuário
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id');
    
    if (fetchError) {
      console.error('Erro ao buscar produtos existentes:', fetchError);
      return;
    }
    
    const existingIds = new Set(existingProducts?.map(p => p.id) || []);
    
    // Para cada produto local, verificamos se já existe no Supabase
    for (const product of localProducts) {
      try {
        if (existingIds.has(product.id)) {
          // Se já existe, atualiza
          await updateProductInSupabase(product);
        } else {
          // Se não existe, insere com o user_id
          const productWithUserId = {
            ...product,
            user_id: userData.user.id
          };
          await saveProductToSupabase(productWithUserId);
        }
      } catch (error) {
        console.error('Erro ao sincronizar produto:', error);
      }
    }
    
    toast.success('Produtos sincronizados com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar produtos:', error);
    toast.error('Erro ao sincronizar produtos com o Supabase');
  }
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
