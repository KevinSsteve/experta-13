
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

// Function to format currency in BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
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
