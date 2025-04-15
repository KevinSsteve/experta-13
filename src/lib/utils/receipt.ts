import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sale } from '@/lib/sales';
import { ExtendedProfile } from '@/types/profile';

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
  companyNeighborhood?: string; // Bairro
  companyCity?: string; // Município
  companySocialMedia?: string; // Conta social
  
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
  footerText: 'Os bens/serviços prestados foram colocados à disposição',
  showTaxInfo: true,
  currency: 'AOA',
  showLogo: false,
  showSignature: false,
  showBarcode: false
};

/**
 * Formata a data no formato DD-MM-AAAA HH:MM:SS
 */
const formatDateTimeForReceipt = (date: string | Date): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().slice(2);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Gera um PDF de recibo para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 * @returns O documento PDF gerado
 */
export const generateReceipt = (sale: Sale, config?: ExtendedProfile): jsPDF => {
  // Mescla a configuração padrão com a configuração fornecida
  const receiptConfig: ReceiptConfig = { 
    ...defaultReceiptConfig,
    companyName: config?.name || defaultReceiptConfig.companyName,
    companyAddress: config?.address || '',
    companyPhone: config?.phone || '',
    companyEmail: config?.email || '',
    taxId: config?.taxId || '',
    currency: config?.currency || defaultReceiptConfig.currency,
    taxRate: config?.taxRate || 0,
    thankYouMessage: config?.receiptMessage || defaultReceiptConfig.thankYouMessage,
    showLogo: config?.receiptShowLogo || defaultReceiptConfig.showLogo,
    showSignature: config?.receiptShowSignature || defaultReceiptConfig.showSignature,
    footerText: config?.receiptFooterText || defaultReceiptConfig.footerText,
    additionalInfo: config?.receiptAdditionalInfo || ''
  };
  
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
  
  // Adicionar cabeçalho com informações da empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(titleSize);
  
  // Título do recibo: Nome da empresa - Endereço
  const addressParts = receiptConfig.companyAddress ? receiptConfig.companyAddress.split(',') : [];
  const street = addressParts.length > 0 ? addressParts[0].trim() : '';
  
  const title = `${receiptConfig.companyName} - ${street}`;
  doc.text(title, 105, 15, { align: 'center' });
  
  // Adicionar informações da empresa centralizadas
  doc.setFontSize(normalSize - 6);
  doc.setFont('helvetica', 'normal');
  
  let currentYPos = 22;
  const lineSpacing = 6;
  
  // Bairro (neighborhood)
  const neighborhood = addressParts.length > 1 ? addressParts[1].trim() : '';
  doc.text(neighborhood, 105, currentYPos, { align: 'center' });
  currentYPos += lineSpacing;
  
  // Telefone
  if (receiptConfig.companyPhone) {
    doc.text(receiptConfig.companyPhone, 105, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Email
  if (receiptConfig.companyEmail) {
    doc.text(receiptConfig.companyEmail, 105, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Nome da empresa (repetir para destaque)
  doc.text(receiptConfig.companyName || '', 105, currentYPos, { align: 'center' });
  currentYPos += lineSpacing;
  
  // Município
  const city = addressParts.length > 2 ? addressParts[2].trim() : '';
  doc.text(city, 105, currentYPos, { align: 'center' });
  currentYPos += lineSpacing;
  
  // NIF
  if (receiptConfig.taxId) {
    doc.text(`NIF: ${receiptConfig.taxId}`, 105, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Conta social
  if (receiptConfig.companySocialMedia) {
    doc.text(receiptConfig.companySocialMedia, 105, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Linha divisória após informações da empresa
  currentYPos += 2;
  doc.line(20, currentYPos, 190, currentYPos);
  currentYPos += 6;
  
  // Informações da fatura alinhadas à esquerda
  doc.setFontSize(normalSize - 8);
  
  // Original
  doc.text("Original:", 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  // F (valor fixo para Original)
  doc.text("F", 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  // Documento (Data e hora)
  doc.text("Documento:", 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  // Data e hora formatadas
  doc.text(formatDateTimeForReceipt(sale.date), 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  // Fatura Recibo
  doc.text("FACTURA RECIBO:", 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  // Código da fatura
  doc.text(sale.id || 'N/A', 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  // Cliente
  doc.text("Cliente:", 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  // Nome do cliente
  let customerName = 'Cliente não identificado';
  if (sale.customer) {
    if (typeof sale.customer === 'string') {
      customerName = sale.customer;
    } else if (typeof sale.customer === 'object' && sale.customer !== null) {
      customerName = sale.customer.name || 'Cliente não identificado';
    }
  }
  doc.text(`${customerName} NIF: NULL`, 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  // Endereço (baseado na localização da loja)
  doc.text("Endereço:", 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo;
  
  doc.text(receiptConfig.companyAddress || 'N/A', 20, currentYPos);
  currentYPos += lineSpacingInvoiceInfo * 1.5; // Espaçamento extra antes dos itens
  
  // Cabeçalho da tabela de itens
  doc.setFontSize(tableSize - 10);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 20, currentYPos);
  doc.text('Preço', 100, currentYPos);
  doc.text('Qtd', 130, currentYPos);
  doc.text('IVA', 145, currentYPos);
  doc.text('Total', 165, currentYPos);
  
  // Desenhar uma linha
  currentYPos += 2;
  doc.line(20, currentYPos, 190, currentYPos);
  currentYPos += 6;
  
  // Resetar fonte
  doc.setFont('helvetica', 'normal');
  
  // Processar itens
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
  
  // Definir variáveis de espaçamento fora do loop de itens
  const itemSpacing = 20; 
  const lineSpacingItems = 7; // Declarada uma única vez
  
  // Adicionar itens
  itemsList.forEach((item: any) => {
    let itemName = 'Produto sem nome';
    let quantity = 1;
    let price = 0;
    
    if (item.product) {
      itemName = item.product.name || 'Produto sem nome';
      price = item.product.price || 0;
      quantity = item.quantity || 1;
    } else {
      itemName = item.name || item.productName || 'Produto sem nome';
      price = item.price || 0;
      quantity = item.quantity || 1;
    }
    
    const total = price * quantity;
    const taxRate = receiptConfig.taxRate || 0;
    const taxValue = (total * taxRate) / 100;
    
    // Truncar nome do item se for muito longo
    const maxNameLength = 25;
    if (itemName.length > maxNameLength) {
      itemName = itemName.substring(0, maxNameLength - 3) + '...';
    }
    
    // Nome do produto
    doc.text(itemName, 20, currentYPos);
    currentYPos += lineSpacingItems;
    
    // Adicionar informações em linhas separadas com mais espaço
    doc.text(`Preço unitário: ${formatCurrency(price)}`, 20, currentYPos);
    currentYPos += lineSpacingItems;
    
    doc.text(`Quantidade: ${quantity}`, 20, currentYPos);
    currentYPos += lineSpacingItems;
    
    doc.text(`IVA: ${taxRate}%`, 20, currentYPos);
    currentYPos += lineSpacingItems;
    
    doc.text(`Total: ${formatCurrency(total)}`, 20, currentYPos);
    
    currentYPos += itemSpacing; // Espaço entre os itens
    
    // Verificar se precisamos de uma nova página
    if (currentYPos > 270) {
      doc.addPage();
      currentYPos = 20;
    }
  });
  
  // Desenhar uma linha
  doc.line(20, currentYPos, 190, currentYPos);
  currentYPos += 6;
  
  // Adicionar total e forma de pagamento
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 130, currentYPos);
  doc.text(formatCurrency(sale.total), 165, currentYPos);
  currentYPos += lineSpacingItems;
  
  // Forma de pagamento
  doc.text('Forma de Pagamento:', 100, currentYPos);
  doc.text(sale.paymentMethod || 'Dinheiro', 165, currentYPos);
  
  // Adicionar rodapé
  const footerYPos = 280; // Moved up from previous position
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(footerSize);
  const footerText = receiptConfig.footerText || 'Os bens/serviços prestados foram colocados à disposição';
  doc.text(footerText, 105, footerYPos, { align: 'center' });
  
  return doc;
};

/**
 * Gera e baixa um PDF de recibo para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 */
export const downloadReceipt = (sale: Sale, config?: ExtendedProfile): void => {
  const doc = generateReceipt(sale, config);
  doc.save(`recibo-venda-${sale.id || Date.now()}.pdf`);
};

/**
 * Imprime um PDF de recibo para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 */
export const printReceipt = (sale: Sale, config?: ExtendedProfile): void => {
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
export const shareReceipt = async (sale: Sale, config?: ExtendedProfile): Promise<boolean> => {
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
