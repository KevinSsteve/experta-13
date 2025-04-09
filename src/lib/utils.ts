
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'AOA',
  }).format(value);
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatShortDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return format(date, "dd/MM", { locale: ptBR });
}

export function formatDateISO(date: Date) {
  return date.toISOString();
}

export function getSalesFromStorage() {
  try {
    const storedSales = localStorage.getItem('sales');
    return storedSales ? JSON.parse(storedSales) : null;
  } catch (error) {
    console.error('Erro ao obter vendas do armazenamento local:', error);
    return null;
  }
}

export function startOfPeriod(date: Date, period: 'day' | 'week' | 'month' | 'year') {
  const result = new Date(date);
  
  if (period === 'day') {
    result.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    // Ajusta para o início da semana (domingo)
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
  } else if (period === 'year') {
    result.setMonth(0, 1);
    result.setHours(0, 0, 0, 0);
  }
  
  return result;
}

export function endOfPeriod(date: Date, period: 'day' | 'week' | 'month' | 'year') {
  const result = new Date(date);
  
  if (period === 'day') {
    result.setHours(23, 59, 59, 999);
  } else if (period === 'week') {
    // Ajusta para o fim da semana (sábado)
    const day = result.getDay();
    result.setDate(result.getDate() + (6 - day));
    result.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
  } else if (period === 'year') {
    result.setMonth(11, 31);
    result.setHours(23, 59, 59, 999);
  }
  
  return result;
}
