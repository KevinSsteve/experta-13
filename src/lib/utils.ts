
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
  }).format(amount);
};

export const calculateChange = (total: number, amountPaid: number) => {
  return parseFloat((amountPaid - total).toFixed(2));
};

export const saveSaleToStorage = (sale: any) => {
  try {
    // Get existing sales from localStorage
    const existingSales = localStorage.getItem('sales');
    
    // Parse existing sales or initialize an empty array
    const salesArray = existingSales ? JSON.parse(existingSales) : [];
    
    // Add the new sale to the array
    salesArray.push({
      ...sale,
      id: `sale-${Date.now()}`, // Generate a unique ID
      date: new Date().toISOString(), // Add current date
    });
    
    // Save the updated array back to localStorage
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

// Format date to a more readable format
export const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return dateString;
  }
};

// Format date to a shorter format for charts
export const formatShortDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'dd/MM');
  } catch (error) {
    return dateString;
  }
};

// Debounce function to limit how often a function is called
export const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Get products from localStorage
export const getProductsFromStorage = (): Product[] => {
  try {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error('Error getting products from localStorage:', error);
    return [];
  }
};

// Save products to localStorage
export const saveProductsToStorage = (products: Product[]) => {
  try {
    localStorage.setItem('products', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
};

// Get unique categories from a list of products
export const getCategoriesFromProducts = (products: Product[]): string[] => {
  const categoriesSet = new Set(products.map(product => product.category));
  return Array.from(categoriesSet);
};

// Get products with low stock (less than specified threshold)
export const getLowStockProducts = (products: Product[], threshold: number = 5): Product[] => {
  return products.filter(product => product.stock > 0 && product.stock <= threshold);
};

// Get products that are out of stock
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

// Update product stock after a sale
export async function updateProductStockAfterSale(items: any[]): Promise<void> {
  if (!items || items.length === 0) return;
  
  try {
    // For each item in the cart, update its stock in Supabase
    for (const item of items) {
      const { product, quantity } = item;
      
      // Skip if product has no id
      if (!product.id) continue;
      
      // Calculate new stock value
      const newStock = Math.max(0, product.stock - quantity);
      
      // Update the product stock in Supabase
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
