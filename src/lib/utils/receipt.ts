
import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sale } from '@/lib/sales';

/**
 * Generates a PDF receipt for a sale
 * @param sale The sale to generate a receipt for
 * @returns The generated PDF document
 */
export const generateReceipt = (sale: Sale): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set up fonts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  
  // Add title
  doc.text('MOLOJA - RECIBO DE VENDA', 105, 20, { align: 'center' });
  
  // Add receipt information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Add sale info
  doc.text(`Número da Venda: ${sale.id || 'N/A'}`, 20, 40);
  doc.text(`Data: ${formatDate(sale.date)}`, 20, 50);
  doc.text(`Cliente: ${sale.customer || 'N/A'}`, 20, 60);
  doc.text(`Método de Pagamento: ${sale.paymentMethod || 'N/A'}`, 20, 70);
  
  // Add items table
  doc.setFontSize(10);
  doc.text('Item', 20, 90);
  doc.text('Quantidade', 100, 90);
  doc.text('Preço', 140, 90);
  doc.text('Total', 180, 90);
  
  // Draw a line
  doc.line(20, 95, 190, 95);
  
  // Add items
  let y = 105;
  if (Array.isArray(sale.items)) {
    sale.items.forEach((item: any, index: number) => {
      const itemName = item.name || 'Produto sem nome';
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      const total = price * quantity;
      
      doc.text(itemName, 20, y);
      doc.text(quantity.toString(), 100, y);
      doc.text(formatCurrency(price), 140, y);
      doc.text(formatCurrency(total), 180, y);
      
      y += 10;
    });
  }
  
  // Draw a line
  doc.line(20, y + 5, 190, y + 5);
  
  // Add total
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, y + 15);
  doc.text(formatCurrency(sale.total), 180, y + 15);
  
  // Add footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const footerText = 'Moloja - Supermercado Digital';
  const textWidth = doc.getTextWidth(footerText);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(footerText, (pageWidth - textWidth) / 2, 280);
  
  return doc;
};

/**
 * Generates and downloads a PDF receipt for a sale
 * @param sale The sale to generate a receipt for
 */
export const downloadReceipt = (sale: Sale): void => {
  const doc = generateReceipt(sale);
  doc.save(`recibo-venda-${sale.id || Date.now()}.pdf`);
};
