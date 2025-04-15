
import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sale } from '@/lib/sales';

/**
 * Estrutura de configuração para personalizar o recibo
 */
export interface ReceiptConfig {
  // Informações básicas da empresa
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  taxId?: string; // NIF (Número de Identificação Fiscal)
  
  // Estilo do recibo
  fontSize?: {
    title?: number;     // Título do recibo
    header?: number;    // Cabeçalhos de seção
    normal?: number;    // Texto normal
    table?: number;     // Tabela de produtos
    footer?: number;    // Rodapé
  };
  
  // Textos personalizados
  receiptTitle?: string;
  thankYouMessage?: string;
  footerText?: string;
  
  // Configurações fiscais
  showTaxInfo?: boolean;
  taxRate?: number;
  currency?: string;
  
  // Configurações extras
  showLogo?: boolean;
  showSignature?: boolean;
  showBarcode?: boolean;
  additionalInfo?: string;
}

// Configuração padrão para o recibo
const defaultReceiptConfig: ReceiptConfig = {
  companyName: 'MOLOJA',
  fontSize: {
    title: 36,
    header: 36,
    normal: 30,
    table: 30,
    footer: 24
  },
  receiptTitle: 'RECIBO DE VENDA',
  thankYouMessage: 'Obrigado pela preferência!',
  footerText: 'Moloja - Supermercado Digital',
  showTaxInfo: true,
  currency: 'AOA',
  showLogo: false,
  showSignature: false,
  showBarcode: false
};

/**
 * Gera um PDF de recibo para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 * @returns O documento PDF gerado
 */
export const generateReceipt = (sale: Sale, config?: ReceiptConfig): jsPDF => {
  // Mescla a configuração padrão com a configuração fornecida
  const receiptConfig = { ...defaultReceiptConfig, ...config };
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Configurar fontes e tamanhos
  const titleSize = receiptConfig.fontSize?.title || 36;
  const headerSize = receiptConfig.fontSize?.header || 36;
  const normalSize = receiptConfig.fontSize?.normal || 30;
  const tableSize = receiptConfig.fontSize?.table || 30;
  const footerSize = receiptConfig.fontSize?.footer || 24;
  
  // Adicionar título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(titleSize);
  
  const title = `${receiptConfig.companyName} - ${receiptConfig.receiptTitle}`;
  doc.text(title, 105, 20, { align: 'center' });
  
  // Adicionar informações do recibo
  doc.setFontSize(headerSize);
  doc.setFont('helvetica', 'normal');
  
  // Ajustar espaçamento vertical
  let yPos = 45;
  const lineSpacing = 15;
  
  // Adicionar informações da venda
  doc.text(`Número da Venda: ${sale.id || 'N/A'}`, 20, yPos);
  yPos += lineSpacing;
  
  doc.text(`Data: ${formatDate(sale.date)}`, 20, yPos);
  yPos += lineSpacing;
  
  // Manipular o cliente que pode vir em diferentes formatos
  let customerName = 'Cliente não identificado';
  if (sale.customer) {
    if (typeof sale.customer === 'string') {
      customerName = sale.customer;
    } else if (typeof sale.customer === 'object' && sale.customer !== null) {
      customerName = sale.customer.name || 'Cliente não identificado';
    }
  }
  doc.text(`Cliente: ${customerName}`, 20, yPos);
  yPos += lineSpacing;
  
  // Adicionar NIF se configurado para mostrar informações fiscais
  if (receiptConfig.showTaxInfo && receiptConfig.taxId) {
    doc.text(`NIF: ${receiptConfig.taxId}`, 20, yPos);
    yPos += lineSpacing;
  }
  
  // Método de pagamento
  const paymentMethod = sale.paymentMethod || 'N/A';
  doc.text(`Método de Pagamento: ${paymentMethod}`, 20, yPos);
  yPos += lineSpacing * 1.5; // Espaçamento extra antes da tabela
  
  // Adicionar tabela de itens
  doc.setFontSize(tableSize);
  doc.text('Item', 20, yPos);
  doc.text('Preço', 145, yPos);
  doc.text('Total', 180, yPos);
  
  // Desenhar uma linha
  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Processar itens que podem vir em diferentes formatos
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
  
  // Adicionar itens com tamanho de fonte aumentado e espaçamento ajustado
  const itemSpacing = 36; // Espaçamento aumentado entre itens para acomodar 3 linhas de informação
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
    
    // Truncar nome do item se for muito longo para caber na página
    const maxNameLength = 25;
    if (itemName.length > maxNameLength) {
      itemName = itemName.substring(0, maxNameLength - 3) + '...';
    }
    
    // Nome do produto na primeira linha
    doc.text(itemName, 20, yPos);
    doc.text(formatCurrency(total), 180, yPos);
    
    // Quantidade e preço unitário na segunda linha
    yPos += 12;
    doc.setFontSize(normalSize - 6); // Tamanho um pouco menor para informações secundárias
    doc.text(`Qtd: ${quantity} x Preço: ${formatCurrency(price)}`, 30, yPos);
    doc.setFontSize(tableSize); // Restaurar tamanho da fonte
    
    yPos += itemSpacing - 12; // Ajustar para o próximo item
    
    // Verificar se precisamos de uma nova página
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Desenhar uma linha
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Adicionar total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(headerSize);
  doc.text('Total:', 120, yPos);
  doc.text(formatCurrency(sale.total), 180, yPos);
  
  // Adicionar mensagem de agradecimento se configurado
  if (receiptConfig.thankYouMessage) {
    yPos += lineSpacing * 1.5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(normalSize - 6);
    doc.text(receiptConfig.thankYouMessage, 105, yPos, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  }
  
  // Adicionar informações adicionais se configurado
  if (receiptConfig.additionalInfo) {
    yPos += lineSpacing;
    doc.setFontSize(normalSize - 10);
    doc.text(receiptConfig.additionalInfo, 105, yPos, { align: 'center' });
  }
  
  // Adicionar rodapé
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(footerSize);
  const footerText = receiptConfig.footerText || 'Moloja - Supermercado Digital';
  const textWidth = doc.getTextWidth(footerText);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(footerText, (pageWidth - textWidth) / 2, 280);
  
  return doc;
};

/**
 * Gera e baixa um PDF de recibo para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 */
export const downloadReceipt = (sale: Sale, config?: ReceiptConfig): void => {
  const doc = generateReceipt(sale, config);
  doc.save(`recibo-venda-${sale.id || Date.now()}.pdf`);
};

/**
 * Imprime um PDF de recibo para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 */
export const printReceipt = (sale: Sale, config?: ReceiptConfig): void => {
  const doc = generateReceipt(sale, config);
  doc.autoPrint();
  doc.output('dataurlnewwindow');
};

/**
 * Compartilha um PDF de recibo para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 * @returns Promise<boolean> indicando se o compartilhamento foi bem-sucedido
 */
export const shareReceipt = async (sale: Sale, config?: ReceiptConfig): Promise<boolean> => {
  try {
    // Verificar se a Web Share API está disponível
    if (navigator.share) {
      const doc = generateReceipt(sale, config);
      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], `recibo-venda-${sale.id || Date.now()}.pdf`, { type: 'application/pdf' });
      
      await navigator.share({
        title: 'Recibo de Venda',
        text: `Recibo da venda ${sale.id || Date.now()}`,
        files: [pdfFile]
      });
      
      return true;
    } else {
      // Fallback para download se o compartilhamento não estiver disponível
      downloadReceipt(sale, config);
      return false;
    }
  } catch (error) {
    console.error('Error sharing receipt:', error);
    // Fallback para download em caso de erro
    downloadReceipt(sale, config);
    return false;
  }
};
