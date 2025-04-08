import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Sale } from "./sales-data";
import { Product } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
 
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
