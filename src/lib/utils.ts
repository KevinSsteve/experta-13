
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function getProductsFromStorage(): any[] {
  const savedProducts = localStorage.getItem("products");
  return savedProducts ? JSON.parse(savedProducts) : [];
}

export function saveProductsToStorage(products: any[]): void {
  localStorage.setItem("products", JSON.stringify(products));
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
