
import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sale } from '@/lib/sales';

/**
 * Generates a PDF receipt for a sale
 * @param sale The sale to generate a receipt for
 * @param companyProfile Optional company profile information to include in the receipt
 * @returns The generated PDF document
 */
export const generateReceipt = (sale: Sale, companyProfile?: any): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set up fonts with increased sizes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36); // Dobro do tamanho original (18) para o título
  
  // Add title
  const companyName = companyProfile?.name || 'MOLOJA';
  doc.text(`${companyName} - RECIBO DE VENDA`, 105, 20, { align: 'center' });
  
  // Add receipt information
  doc.setFontSize(18); // Aumentado de 12 para 18
  doc.setFont('helvetica', 'normal');
  
  // Add sale info with increased font size
  doc.text(`Número da Venda: ${sale.id || 'N/A'}`, 20, 40);
  doc.text(`Data: ${formatDate(sale.date)}`, 20, 50);
  
  // Manipular o cliente que pode vir em diferentes formatos
  let customerName = 'Cliente não identificado';
  if (sale.customer) {
    if (typeof sale.customer === 'string') {
      customerName = sale.customer;
    } else if (typeof sale.customer === 'object' && sale.customer !== null) {
      customerName = sale.customer.name || 'Cliente não identificado';
    }
  }
  doc.text(`Cliente: ${customerName}`, 20, 60);
  
  // Método de pagamento
  const paymentMethod = sale.paymentMethod || 'N/A';
  doc.text(`Método de Pagamento: ${paymentMethod}`, 20, 70);
  
  // Add items table with increased font size
  doc.setFontSize(18); // Aumentado de 10 para 18
  doc.text('Item', 20, 90);
  doc.text('Quantidade', 100, 90);
  doc.text('Preço', 140, 90);
  doc.text('Total', 180, 90);
  
  // Draw a line
  doc.line(20, 95, 190, 95);
  
  // Processar items que podem vir em diferentes formatos
  let itemsList = [];
  if (sale.items) {
    if (Array.isArray(sale.items)) {
      itemsList = sale.items;
    } else if (typeof sale.items === 'object' && sale.items !== null) {
      // Verificar se há produtos na propriedade 'products'
      const productsObj = sale.items as any;
      if ('products' in productsObj && Array.isArray(productsObj.products)) {
        itemsList = productsObj.products.map((item: any) => ({
          name: item.productName || 'Produto',
          quantity: item.quantity || 1,
          price: item.price || 0
        }));
      }
    }
  }
  
  // Add items with increased font size
  let y = 105;
  itemsList.forEach((item: any, index: number) => {
    let itemName = 'Produto sem nome';
    let quantity = 1;
    let price = 0;
    
    if (item.product) {
      // Formato onde temos um objeto product
      itemName = item.product.name || 'Produto sem nome';
      price = item.product.price || 0;
      quantity = item.quantity || 1;
    } else {
      // Formato simplificado
      itemName = item.name || item.productName || 'Produto sem nome';
      price = item.price || 0;
      quantity = item.quantity || 1;
    }
    
    const total = price * quantity;
    
    doc.text(itemName, 20, y);
    doc.text(quantity.toString(), 100, y);
    doc.text(formatCurrency(price), 140, y);
    doc.text(formatCurrency(total), 180, y);
    
    y += 10;
  });
  
  // Draw a line
  doc.line(20, y + 5, 190, y + 5);
  
  // Add total with increased font size
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18); // Aumentado para 18
  doc.text('Total:', 140, y + 15);
  doc.text(formatCurrency(sale.total), 180, y + 15);
  
  // Add footer with increased font size
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14); // Aumentado de 8 para 14
  const footerText = companyProfile?.name || 'Moloja - Supermercado Digital';
  const textWidth = doc.getTextWidth(footerText);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(footerText, (pageWidth - textWidth) / 2, 280);
  
  return doc;
};

/**
 * Generates and downloads a PDF receipt for a sale
 * @param sale The sale to generate a receipt for
 * @param companyProfile Optional company profile information
 */
export const downloadReceipt = (sale: Sale, companyProfile?: any): void => {
  const doc = generateReceipt(sale, companyProfile);
  doc.save(`recibo-venda-${sale.id || Date.now()}.pdf`);
};

/**
 * Prints a PDF receipt for a sale
 * @param sale The sale to generate a receipt for
 * @param companyProfile Optional company profile information
 */
export const printReceipt = (sale: Sale, companyProfile?: any): void => {
  const doc = generateReceipt(sale, companyProfile);
  doc.autoPrint();
  doc.output('dataurlnewwindow');
};

/**
 * Shares a PDF receipt for a sale
 * @param sale The sale to generate a receipt for
 * @param companyProfile Optional company profile information
 * @returns Promise<boolean> indicating whether sharing was successful
 */
export const shareReceipt = async (sale: Sale, companyProfile?: any): Promise<boolean> => {
  try {
    // Check if Web Share API is available
    if (navigator.share) {
      const doc = generateReceipt(sale, companyProfile);
      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], `recibo-venda-${sale.id || Date.now()}.pdf`, { type: 'application/pdf' });
      
      await navigator.share({
        title: 'Recibo de Venda',
        text: `Recibo da venda ${sale.id || Date.now()}`,
        files: [pdfFile]
      });
      
      return true;
    } else {
      // Fallback to download if sharing not available
      downloadReceipt(sale, companyProfile);
      return false;
    }
  } catch (error) {
    console.error('Error sharing receipt:', error);
    // Fallback to download on error
    downloadReceipt(sale, companyProfile);
    return false;
  }
};
