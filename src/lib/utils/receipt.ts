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
 * Quebra texto longo em múltiplas linhas com limite de caracteres
 * @param text Texto a ser quebrado
 * @param maxLength Comprimento máximo por linha
 * @returns Array de linhas de texto
 */
const wrapText = (text: string, maxLength: number = 38): string[] => {
  if (!text || text.length <= maxLength) {
    return [text];
  }

  const lines: string[] = [];
  let currentLine = '';
  const words = text.split(' ');

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      
      if (word.length > maxLength) {
        let remainingWord = word;
        while (remainingWord.length > 0) {
          const part = remainingWord.substring(0, maxLength);
          lines.push(part);
          remainingWord = remainingWord.substring(maxLength);
        }
        currentLine = '';
      } else {
        currentLine = word;
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
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
  
  // Espaçamento entre linhas aumentado para 9 conforme solicitado
  const lineSpacing = 9;
  
  // Adicionar cabeçalho com informações da empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(titleSize);
  
  // Título do recibo: Nome da empresa
  doc.text(receiptConfig.companyName || 'MOLOJA', pageCenter, 15, { align: 'center' });
  
  // Adicionar informações da empresa centralizadas
  doc.setFontSize(normalSize - 6);
  doc.setFont('helvetica', 'normal');
  
  let currentYPos = 24; // Aumentado para dar mais espaço após o título
  
  // Endereço da empresa com melhor formatação
  if (receiptConfig.companyAddress) {
    const addressLines = wrapText(receiptConfig.companyAddress);
    for (const line of addressLines) {
      doc.text(line, pageCenter, currentYPos, { align: 'center' });
      currentYPos += lineSpacing;
    }
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
    const emailLines = wrapText(`Email: ${receiptConfig.companyEmail}`);
    for (const line of emailLines) {
      doc.text(line, pageCenter, currentYPos, { align: 'center' });
      currentYPos += lineSpacing;
    }
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
    const socialLines = wrapText(receiptConfig.companySocialMedia);
    for (const line of socialLines) {
      doc.text(line, pageCenter, currentYPos, { align: 'center' });
      currentYPos += lineSpacing;
    }
  }
  
  // Linha divisória após informações da empresa
  currentYPos += 2;
  doc.line(marginLeft, currentYPos, marginRight, currentYPos);
  currentYPos += lineSpacing; // Espaçamento maior após a linha
  
  // Informações da fatura com melhor alinhamento
  doc.setFontSize(normalSize - 8);
  
  // Seção de detalhes do documento com layout em duas colunas
  const leftColumn = marginLeft;
  const rightColumn = marginLeft + 90; // Aumentado para melhor separação das colunas
  
  // Coluna esquerda
  doc.setFont('helvetica', 'bold');
  doc.text("DOCUMENTO:", leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
  doc.setFont('helvetica', 'normal');
  doc.text("Original: F", leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
  doc.text(`Data: ${formatDateTimeForReceipt(sale.date)}`, leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
  doc.setFont('helvetica', 'bold');
  doc.text("FACTURA RECIBO:", leftColumn, currentYPos);
  doc.setFont('helvetica', 'normal');
  currentYPos += lineSpacing;
  
  // Verificar se o ID é muito longo e quebrá-lo em múltiplas linhas
  const saleIdText = sale.id || 'N/A';
  const saleIdLines = wrapText(saleIdText, 30);
  for (const line of saleIdLines) {
    doc.text(line, leftColumn, currentYPos);
    currentYPos += lineSpacing;
  }
  
  // Salvar o ponto Y da coluna esquerda para posterior comparação
  const leftColumnEndY = currentYPos;
  
  // Resetar para a coluna direita com posição Y adequada para evitar sobreposições
  let rightColumnY = currentYPos - (saleIdLines.length + 4) * lineSpacing;
  
  // Coluna direita - garantindo que sempre tenha espaço suficiente
  doc.setFont('helvetica', 'bold');
  doc.text("CLIENTE:", rightColumn, rightColumnY);
  rightColumnY += lineSpacing;
  
  doc.setFont('helvetica', 'normal');
  
  // Nome do cliente
  let customerName = 'Cliente não identificado';
  if (sale.customer) {
    if (typeof sale.customer === 'string') {
      customerName = sale.customer;
    } else if (typeof sale.customer === 'object' && sale.customer !== null) {
      customerName = sale.customer.name || 'Cliente não identificado';
    }
  }
  
  // Quebrar o nome do cliente em múltiplas linhas se necessário
  const customerNameLines = wrapText(customerName);
  for (const line of customerNameLines) {
    doc.text(line, rightColumn, rightColumnY);
    rightColumnY += lineSpacing;
  }
  
  // NIF do cliente
  if (typeof sale.customer === 'object' && sale.customer && (sale.customer as any).nif) {
    doc.text(`NIF: ${(sale.customer as any).nif}`, rightColumn, rightColumnY);
  } else {
    doc.text("NIF: Não fornecido", rightColumn, rightColumnY);
  }
  rightColumnY += lineSpacing;
  
  // Endereço do cliente
  if (typeof sale.customer === 'object' && sale.customer && (sale.customer as any).address) {
    const address = (sale.customer as any).address;
    const addressLines = wrapText(`Endereço: ${address}`, 30);
    for (const line of addressLines) {
      doc.text(line, rightColumn, rightColumnY);
      rightColumnY += lineSpacing;
    }
  }
  
  // Determinar o ponto Y mais baixo entre as duas colunas para continuar
  currentYPos = Math.max(leftColumnEndY, rightColumnY) + lineSpacing;
  
  // Cabeçalho da tabela de itens - reestruturado completamente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(tableSize - 6);
  
  // Título da coluna Item na primeira linha
  doc.text('Item', marginLeft, currentYPos);
  currentYPos += lineSpacing;
  
  // Colunas numéricas em layout mais espaçado horizontalmente
  const colPrice = marginLeft + 10;
  const colQty = colPrice + 45;
  const colTax = colQty + 25;
  const colTotal = colTax + 25;
  
  // Cabeçalhos das colunas numéricas em linha separada
  doc.text('Preço', colPrice, currentYPos);
  doc.text('Qtd', colQty, currentYPos);
  doc.text('IVA', colTax, currentYPos);
  doc.text('Total', colTotal, currentYPos);
  
  // Linha divisória após cabeçalho
  currentYPos += 2;
  doc.line(marginLeft, currentYPos, marginRight, currentYPos);
  currentYPos += lineSpacing;
  
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
  const maxNameLength = 38; // Comprimento máximo por linha conforme solicitado
  
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
    
    // Quebrar nome do produto em múltiplas linhas se necessário
    const productNameLines = wrapText(itemName, maxNameLength);
    
    // Nome do produto (possivelmente múltiplas linhas)
    for (let i = 0; i < productNameLines.length; i++) {
      doc.text(productNameLines[i], marginLeft, currentYPos);
      
      if (i < productNameLines.length - 1) {
        currentYPos += lineSpacing;
      }
    }
    
    // Avançar para a linha onde colocaremos as informações numéricas
    currentYPos += lineSpacing;
    
    // Informações numéricas em uma linha separada, alinhadas de acordo com o cabeçalho
    doc.text(formatCurrency(price), colPrice, currentYPos);
    doc.text(quantity.toString(), colQty, currentYPos);
    doc.text(`${taxRate}%`, colTax, currentYPos);
    doc.text(formatCurrency(total), colTotal, currentYPos);
    
    // Espaçamento extra após cada item
    currentYPos += lineSpacing;
  });
  
  // Verificar se precisamos de uma nova página para o resumo final
  if (currentYPos > 250) {
    doc.addPage();
    currentYPos = 20;
  }
  
  // Desenhar uma linha
  doc.line(marginLeft, currentYPos, marginRight, currentYPos);
  currentYPos += lineSpacing; // Espaçamento após a linha
  
  // Adicionar total e forma de pagamento com destaque
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', marginLeft + 110, currentYPos);
  doc.text(formatCurrency(sale.total), marginLeft + 155, currentYPos);
  currentYPos += lineSpacing;
  
  // Forma de pagamento
  doc.text('Forma de Pagamento:', marginLeft + 85, currentYPos);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.paymentMethod || 'Dinheiro', marginLeft + 155, currentYPos);
  
  // Adicionar rodapé
  const footerYPos = 280;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(footerSize);
  
  // Quebrar texto do rodapé em múltiplas linhas se necessário
  const footerText = receiptConfig.footerText || 'Os bens/serviços prestados foram colocados à disposição';
  const footerLines = wrapText(footerText);
  
  let footerY = footerYPos - ((footerLines.length - 1) * lineSpacing);
  
  // Adicionar mensagem de agradecimento acima do rodapé
  if (receiptConfig.thankYouMessage) {
    doc.text(receiptConfig.thankYouMessage, pageCenter, footerY - lineSpacing, { align: 'center' });
  }
  
  // Escrever as linhas do rodapé
  for (const line of footerLines) {
    doc.text(line, pageCenter, footerY, { align: 'center' });
    footerY += lineSpacing;
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
