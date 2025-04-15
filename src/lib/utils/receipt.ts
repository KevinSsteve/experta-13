
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
    additionalInfo: config?.receiptAdditionalInfo || '',
    companyNeighborhood: config?.companyNeighborhood || '',
    companyCity: config?.companyCity || '',
    companySocialMedia: config?.companySocialMedia || ''
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
  
  // Definir margens e espaçamentos para evitar sobreposições
  const marginLeft = 20;
  const marginRight = 190;
  const pageWidth = marginRight - marginLeft;
  const pageCenter = marginLeft + pageWidth / 2;
  
  // Adicionar cabeçalho com informações da empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(titleSize);
  
  // Título do recibo: Nome da empresa
  doc.text(receiptConfig.companyName || 'MOLOJA', pageCenter, 15, { align: 'center' });
  
  // Adicionar informações da empresa centralizadas
  doc.setFontSize(normalSize - 6);
  doc.setFont('helvetica', 'normal');
  
  let currentYPos = 22;
  const lineSpacing = 7; // Aumentado para evitar sobreposições
  
  // Endereço da empresa com melhor formatação
  if (receiptConfig.companyAddress) {
    doc.text(receiptConfig.companyAddress, pageCenter, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Bairro 
  if (receiptConfig.companyNeighborhood) {
    doc.text(receiptConfig.companyNeighborhood, pageCenter, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Município
  if (receiptConfig.companyCity) {
    doc.text(receiptConfig.companyCity, pageCenter, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Telefone
  if (receiptConfig.companyPhone) {
    doc.text(`Tel: ${receiptConfig.companyPhone}`, pageCenter, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Email
  if (receiptConfig.companyEmail) {
    doc.text(`Email: ${receiptConfig.companyEmail}`, pageCenter, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // NIF - Destaque importante
  if (receiptConfig.taxId) {
    doc.setFont('helvetica', 'bold');
    doc.text(`NIF: ${receiptConfig.taxId}`, pageCenter, currentYPos, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    currentYPos += lineSpacing;
  }
  
  // Conta social
  if (receiptConfig.companySocialMedia) {
    doc.text(receiptConfig.companySocialMedia, pageCenter, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Linha divisória após informações da empresa
  currentYPos += 2;
  doc.line(marginLeft, currentYPos, marginRight, currentYPos);
  currentYPos += 8; // Espaçamento maior após a linha
  
  // Informações da fatura com melhor alinhamento
  doc.setFontSize(normalSize - 8);
  
  // Seção de detalhes do documento com layout em duas colunas
  const leftColumn = marginLeft;
  const rightColumn = marginLeft + 85; // Reajustado para melhor distribuição horizontal
  
  // Coluna esquerda
  doc.setFont('helvetica', 'bold');
  doc.text("DOCUMENTO:", leftColumn, currentYPos);
  doc.setFont('helvetica', 'normal');
  currentYPos += lineSpacing;
  
  doc.text("Original: F", leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
  doc.text(`Data: ${formatDateTimeForReceipt(sale.date)}`, leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
  doc.setFont('helvetica', 'bold');
  doc.text("FACTURA RECIBO:", leftColumn, currentYPos);
  doc.setFont('helvetica', 'normal');
  currentYPos += lineSpacing;
  
  // Verificar se o ID é muito longo e quebrá-lo em múltiplas linhas se necessário
  const saleIdText = sale.id || 'N/A';
  if (saleIdText.length > 20) {
    const parts = [
      saleIdText.substring(0, 20),
      saleIdText.substring(20)
    ];
    doc.text(parts[0], leftColumn, currentYPos);
    currentYPos += lineSpacing - 2; // Espaçamento menor entre linhas do mesmo campo
    doc.text(parts[1], leftColumn, currentYPos);
  } else {
    doc.text(saleIdText, leftColumn, currentYPos);
  }
  
  // Determinar o ponto Y mais baixo na coluna esquerda para continuar a partir dele mais tarde
  const leftColumnEndY = currentYPos;
  
  // Resetar posição Y para coluna direita - com mais espaço para não sobrepor "Original: F"
  currentYPos = currentYPos - (lineSpacing * 4) + 4; // Ajustado para iniciar após a linha "Original: F"
  
  // Coluna direita
  doc.setFont('helvetica', 'bold');
  doc.text("CLIENTE:", rightColumn, currentYPos);
  doc.setFont('helvetica', 'normal');
  currentYPos += lineSpacing;
  
  // Nome do cliente
  let customerName = 'Cliente não identificado';
  if (sale.customer) {
    if (typeof sale.customer === 'string') {
      customerName = sale.customer;
    } else if (typeof sale.customer === 'object' && sale.customer !== null) {
      customerName = sale.customer.name || 'Cliente não identificado';
    }
  }
  
  // Verificar se o nome do cliente é muito longo e quebrá-lo em múltiplas linhas
  if (customerName.length > 25) {
    const parts = [
      customerName.substring(0, 25),
      customerName.substring(25)
    ];
    doc.text(parts[0], rightColumn, currentYPos);
    currentYPos += lineSpacing - 2;
    doc.text(parts[1], rightColumn, currentYPos);
    currentYPos += lineSpacing;
  } else {
    doc.text(customerName, rightColumn, currentYPos);
    currentYPos += lineSpacing;
  }
  
  if (typeof sale.customer === 'object' && sale.customer && (sale.customer as any).nif) {
    doc.text(`NIF: ${(sale.customer as any).nif}`, rightColumn, currentYPos);
  } else {
    doc.text("NIF: Não fornecido", rightColumn, currentYPos);
  }
  currentYPos += lineSpacing;
  
  if (typeof sale.customer === 'object' && sale.customer && (sale.customer as any).address) {
    const address = (sale.customer as any).address;
    // Verificar se o endereço é muito longo e quebrá-lo em múltiplas linhas
    if (address.length > 30) {
      doc.text(`Endereço:`, rightColumn, currentYPos);
      currentYPos += lineSpacing - 2;
      doc.text(address, rightColumn, currentYPos);
    } else {
      doc.text(`Endereço: ${address}`, rightColumn, currentYPos);
    }
  }
  
  // Determinar o ponto Y mais baixo entre as duas colunas para continuar
  const rightColumnEndY = currentYPos;
  currentYPos = Math.max(leftColumnEndY, rightColumnEndY) + lineSpacing;
  
  // Cabeçalho da tabela de itens - reestruturado para evitar sobreposição
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(tableSize - 6);
  
  // Nova organização do cabeçalho da tabela em 2 linhas para evitar sobreposição
  doc.text('Item', marginLeft, currentYPos);
  currentYPos += lineSpacing;
  
  // Segunda linha de cabeçalho com colunas numéricas
  const colPrice = marginLeft + 5;
  const colQty = colPrice + 40;
  const colTax = colQty + 25;
  const colTotal = colTax + 30;
  
  doc.text('Preço', colPrice, currentYPos);
  doc.text('Qtd', colQty, currentYPos);
  doc.text('IVA', colTax, currentYPos);
  doc.text('Total', colTotal, currentYPos);
  
  // Desenhar uma linha
  currentYPos += 2;
  doc.line(marginLeft, currentYPos, marginRight, currentYPos);
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
  
  // Melhor formatação para itens com tratamento para textos longos
  const maxNameLength = 30; // Número máximo de caracteres antes de truncar ou quebrar
  
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
    
    // Verificar se precisamos de uma nova página
    if (currentYPos > 270) {
      doc.addPage();
      currentYPos = 20;
    }
    
    // Tratar nomes longos de produtos quebrando em múltiplas linhas
    if (itemName.length > maxNameLength) {
      const firstLine = itemName.substring(0, maxNameLength);
      const secondLine = "  " + itemName.substring(maxNameLength); // Indentação para a segunda linha
      
      // Nome do produto (primeira linha)
      doc.text(firstLine, marginLeft, currentYPos);
      currentYPos += lineSpacing - 2; // Espaçamento reduzido para a continuação do nome
      
      // Segunda linha do nome do produto
      doc.text(secondLine, marginLeft, currentYPos);
      currentYPos += lineSpacing - 2;
    } else {
      // Nome do produto (cabe em uma linha)
      doc.text(itemName, marginLeft, currentYPos);
      currentYPos += lineSpacing - 2;
    }
    
    // Informações numéricas em uma linha separada, alinhadas de acordo com o cabeçalho
    doc.text(formatCurrency(price), colPrice, currentYPos);
    doc.text(quantity.toString(), colQty, currentYPos);
    doc.text(`${taxRate}%`, colTax, currentYPos);
    doc.text(formatCurrency(total), colTotal, currentYPos);
    
    currentYPos += lineSpacing;
  });
  
  // Verificar se precisamos de uma nova página para o resumo final
  if (currentYPos > 250) {
    doc.addPage();
    currentYPos = 20;
  }
  
  // Desenhar uma linha
  doc.line(marginLeft, currentYPos, marginRight, currentYPos);
  currentYPos += 8; // Espaçamento maior após a linha
  
  // Adicionar total e forma de pagamento com destaque
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', marginLeft + 110, currentYPos);
  doc.text(formatCurrency(sale.total), marginLeft + 155, currentYPos);
  currentYPos += lineSpacing;
  
  // Forma de pagamento
  doc.text('Forma de Pagamento:', marginLeft + 110, currentYPos - 2);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.paymentMethod || 'Dinheiro', marginLeft + 155, currentYPos - 2);
  
  // Adicionar rodapé
  const footerYPos = 280;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(footerSize);
  
  // Verificar se o texto do rodapé é muito longo e quebrá-lo em múltiplas linhas
  const footerText = receiptConfig.footerText || 'Os bens/serviços prestados foram colocados à disposição';
  if (footerText.length > 50) {
    const parts = [
      footerText.substring(0, 50),
      footerText.substring(50)
    ];
    doc.text(parts[0], pageCenter, footerYPos - 10, { align: 'center' });
    doc.text(parts[1], pageCenter, footerYPos, { align: 'center' });
  } else {
    doc.text(footerText, pageCenter, footerYPos, { align: 'center' });
  }
  
  // Adicionar mensagem de agradecimento
  if (receiptConfig.thankYouMessage) {
    doc.text(receiptConfig.thankYouMessage, pageCenter, footerYPos - 15, { align: 'center' });
  }
  
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
