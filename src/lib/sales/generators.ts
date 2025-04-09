
import { Sale } from './types';

// Função para gerar dados aleatórios de vendas dos últimos 30 dias
export function generateSalesData(): Sale[] {
  const sales: Sale[] = [];
  const paymentMethods = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix'];
  
  // Data atual
  const now = new Date();
  
  // Gerar vendas para os últimos 30 dias
  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    const items = Math.floor(Math.random() * 10) + 1;
    const total = parseFloat((Math.random() * 500 + 10).toFixed(2));
    const amountPaid = parseFloat((total + Math.random() * 50).toFixed(2));
    
    sales.push({
      id: `sale-${i + 1}`,
      date: date.toISOString(),
      total,
      amountPaid,
      change: amountPaid - total,
      items,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      customer: Math.random() > 0.3 ? `Cliente ${Math.floor(Math.random() * 100) + 1}` : undefined,
    });
  }
  
  // Ordenar por data (mais recente primeiro)
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
