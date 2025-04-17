import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Export receipt functions from the receipt module
export * from "./utils/receipt";

// Function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format currency in AKZ (Kwanzas)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AKZ',
    currencyDisplay: 'symbol'
  }).format(value);
}

// Function to format date
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

// Function to format short date
export function formatShortDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  return format(dateObj, "dd/MM", { locale: ptBR });
}

// Utility function to calculate change
export function calculateChange(total: number, amountPaid: number): number {
  return Math.max(0, amountPaid - total);
}

// Utility function to save sale to storage
export function saveSaleToStorage(saleData: any): void {
  try {
    // Get existing sales
    const existingSales = localStorage.getItem('sales');
    let sales = existingSales ? JSON.parse(existingSales) : [];
    
    // Add timestamp and ID if not present
    const newSale = {
      ...saleData,
      id: saleData.id || `sale-${Date.now()}`,
      date: saleData.date || new Date().toISOString()
    };
    
    // Add to beginning of array
    sales = [newSale, ...sales];
    
    // Save back to storage
    localStorage.setItem('sales', JSON.stringify(sales));
  } catch (error) {
    console.error('Error saving sale to storage:', error);
  }
}

// Utility function to get sales from storage
export function getSalesFromStorage(): any[] {
  try {
    const salesJson = localStorage.getItem('sales');
    return salesJson ? JSON.parse(salesJson) : [];
  } catch (error) {
    console.error('Error getting sales from storage:', error);
    return [];
  }
}

// Utility function to update product stock after sale
export function updateProductStockAfterSale(items: any[]): Promise<void> {
  // This would normally update a database, but for now just log
  console.log('Updating stock for items:', items);
  return Promise.resolve();
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
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

// Function to filter products based on search query
export const filterProducts = (products: any[], query: string): any[] => {
  if (!query || query.trim() === '') {
    return products;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  console.log(`Filtrando produtos com query normalizada: "${normalizedQuery}"`);
  
  return products.filter(product => {
    // Verificar nome do produto
    const nameMatch = product.name?.toLowerCase().includes(normalizedQuery);
    
    // Verificar código do produto (se existir)
    const codeMatch = product.code?.toLowerCase().includes(normalizedQuery);
    
    // Verificar categoria (se existir)
    const categoryMatch = product.category?.toLowerCase().includes(normalizedQuery);
    
    return nameMatch || codeMatch || categoryMatch;
  });
};
