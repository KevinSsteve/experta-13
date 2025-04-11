import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Sale } from "./sales-data";
import { Product } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    currencyDisplay: 'narrowSymbol',
  }).format(amount).replace('AOA', 'AKZ');
};

export const calculateChange = (total: number, amountPaid: number) => {
  return parseFloat((amountPaid - total).toFixed(2));
};

export const saveSaleToStorage = (sale: any) => {
  try {
    const existingSales = localStorage.getItem('sales');
    const salesArray = existingSales ? JSON.parse(existingSales) : [];
    salesArray.push({
      ...sale,
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
    });
    localStorage.setItem('sales', JSON.stringify(salesArray));
  } catch (error) {
    console.error('Error saving sale to localStorage:', error);
  }
};

export const getSalesFromStorage = (): Sale[] => {
  try {
    const sales = localStorage.getItem('sales');
    return sales ? JSON.parse(sales) : [];
  } catch (error) {
    console.error('Error getting sales from localStorage:', error);
    return [];
  }
};

export const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return dateString;
  }
};

export const formatShortDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'dd/MM');
  } catch (error) {
    return dateString;
  }
};

export const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

export const getProductsFromStorage = (): Product[] => {
  try {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error('Error getting products from localStorage:', error);
    return [];
  }
};

export const saveProductsToStorage = (products: Product[]) => {
  try {
    localStorage.setItem('products', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
};

export const getCategoriesFromProducts = (products: Product[]): string[] => {
  const categoriesSet = new Set(products.map(product => product.category));
  return Array.from(categoriesSet);
};

export const getLowStockProducts = (products: Product[], threshold: number = 5): Product[] => {
  return products.filter(product => product.stock > 0 && product.stock <= threshold);
};

export const getOutOfStockProducts = (products: Product[]): Product[] => {
  return products.filter(product => product.stock === 0);
};

export const filterProducts = (products: Product[], query: string) => {
  if (!query) {
    return products;
  }

  const lowerCaseQuery = query.toLowerCase();

  return products.filter(product => {
    const nameMatches = product.name.toLowerCase().includes(lowerCaseQuery);
    const codeMatches = product.code?.toLowerCase().includes(lowerCaseQuery);
    return nameMatches || codeMatches;
  });
};

export async function updateProductStockAfterSale(items: any[]): Promise<void> {
  if (!items || items.length === 0) return;
  
  try {
    for (const item of items) {
      const { product, quantity } = item;
      
      if (!product.id) continue;
      
      const newStock = Math.max(0, product.stock - quantity);
      
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id);
      
      if (error) {
        console.error(`Error updating stock for product ${product.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
}
