
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/contexts/CartContext";

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

export async function getProductsFromStorage(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProductsFromStorage:', error);
    return [];
  }
}

export async function saveProductsToStorage(products: Product[]): Promise<void> {
  // This function is now deprecated as we're using Supabase
  // Each product should be individually inserted/updated in the database
  console.warn('saveProductsToStorage is deprecated. Use Supabase CRUD operations instead.');
}

export async function addOrUpdateProduct(product: Product): Promise<boolean> {
  try {
    const { id, ...productData } = product;
    
    // If the product has an ID, update it; otherwise, insert a new product
    const { data, error } = await supabase
      .from('products')
      .upsert([{ id, ...productData }])
      .select();
    
    if (error) {
      console.error('Error saving product:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in addOrUpdateProduct:', error);
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return false;
  }
}

export function getCategoriesFromProducts(products: Product[]): string[] {
  const categories = products.map(product => product.category);
  return [...new Set(categories)].filter(Boolean);
}

export function filterProducts(
  products: Product[], 
  searchQuery = ''
): Product[] {
  return products.filter(product => {
    // Filtro por pesquisa de texto (nome ou código)
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });
}

export function getLowStockProducts(products: Product[], threshold = 10): Product[] {
  return products.filter(product => product.stock > 0 && product.stock < threshold);
}

export function getOutOfStockProducts(products: Product[]): Product[] {
  return products.filter(product => product.stock === 0);
}

export function calculateChange(totalAmount: number, amountPaid: number): number {
  return Math.max(0, amountPaid - totalAmount);
}

export async function saveSaleToStorage(sale: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .insert([{
        id: generateId(),
        date: new Date().toISOString(),
        total: sale.total,
        amount_paid: sale.amountPaid || sale.total,
        change: sale.change || 0,
        items: sale.items || [],
      }]);
    
    if (error) {
      console.error('Error saving sale:', error);
      return false;
    }
    
    await updateProductStockAfterSale(sale.products);
    return true;
  } catch (error) {
    console.error('Error in saveSaleToStorage:', error);
    return false;
  }
}

export async function getSalesFromStorage(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSalesFromStorage:', error);
    return [];
  }
}

export async function updateProductStockAfterSale(items: any[]): Promise<void> {
  if (!items || items.length === 0) return;

  try {
    // For each item sold, update the stock in the database
    for (const item of items) {
      if (!item.product || !item.product.id) continue;
      
      // Get current product stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single();
      
      if (fetchError || !product) {
        console.error('Error fetching product for stock update:', fetchError);
        continue;
      }
      
      // Update stock
      const newStock = Math.max(0, product.stock - item.quantity);
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.product.id);
      
      if (updateError) {
        console.error('Error updating product stock:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in updateProductStockAfterSale:', error);
  }
}
