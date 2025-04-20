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
  taxExemptionReason?: string; // Motivo de isenção de imposto
  
  // Configurações extras
  showLogo?: boolean;
  showSignature?: boolean;
  showBarcode?: boolean;
  additionalInfo?: string;
  systemInfo?: string; // Nome e certificação do software
  certificateNumber?: string; // Número de certificação AGT
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
  receiptTitle: 'FACTURA RECIBO',
  thankYouMessage: 'Obrigado pela preferência!',
  footerText: 'Os bens/serviços prestados foram colocados à disposição',
  showTaxInfo: true,
  currency: 'AOA',
  showLogo: false,
  showSignature: false,
  showBarcode: false,
  systemInfo: 'Contascom - Sistema de Gestão',
  certificateNumber: 'Aguardando certificação AGT',
  taxExemptionReason: 'Artigo 12.º, n.º 1, alínea c) do CIVA'
};

/**
 * Formata a data no formato DD-MM-AAAA HH:MM:SS
 */
const formatDateTimeForReceipt = (date: string | Date): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear(); // Formato completo de ano: AAAA
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Quebra texto longo em múltiplas linhas com limite de caracteres
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
 * Gera um texto formatado para impressoras térmicas
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 * @returns String formatada para impressão térmica
 */
const generateThermalReceipt = (sale: Sale, config?: ExtendedProfile): string => {
  const width = 32; // Largura padrão para impressoras térmicas (32 caracteres)
  let output = '';
  
  // Função helper para centralizar texto
  const center = (text: string): string => {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(spaces) + text + '\n';
  };
  
  // Função helper para criar linhas
  const line = () => '-'.repeat(width) + '\n';
  
  // Função helper para alinhar texto à direita
  const alignRight = (text: string): string => {
    const spaces = Math.max(0, width - text.length);
    return ' '.repeat(spaces) + text + '\n';
  };
  
  // Função helper para formatar item
  const formatItem = (name: string, qty: number, price: number, total: number): string => {
    let result = name + '\n';
    result += `${qty}x ${formatCurrency(price)} = ${formatCurrency(total)}\n`;
    return result;
  };
  
  // Cabeçalho
  output += center(config?.name || 'MOLOJA');
  output += '\n';
  
  if (config?.tax_id) {
    output += center(`NIF: ${config.tax_id}`);
  }
  
  if (config?.address) {
    output += center(config.address);
  }
  
  if (config?.company_neighborhood) {
    output += center(config.company_neighborhood);
  }
  
  if (config?.company_city) {
    output += center(config.company_city);
  }
  
  if (config?.phone) {
    output += center(`Tel: ${config.phone}`);
  }
  
  // Linha divisória
  output += line();
  
  // Informações do documento
  output += 'DOCUMENTO:\n';
  output += 'Original: FT\n';
  output += `Data Emissão: ${formatDateTimeForReceipt(sale.date)}\n`;
  output += `Data Entrega: ${formatDateTimeForReceipt(sale.date)}\n\n`;
  
  output += 'FACTURA RECIBO:\n';
  output += `FT MOLOJA/${sale.id?.substring(0, 8) || 'N/A'}\n\n`;
  
  // Informações do cliente
  output += 'CLIENTE:\n';
  let customerName = 'Cliente não identificado';
  if (sale.customer) {
    if (typeof sale.customer === 'object') {
      customerName = (sale.customer as any).name || 'Cliente não identificado';
    } else if (typeof sale.customer === 'string') {
      customerName = sale.customer;
    }
  }
  output += `${customerName}\n`;
  
  if (typeof sale.customer === 'object' && sale.customer && (sale.customer as any).nif) {
    output += `NIF: ${(sale.customer as any).nif}\n`;
  } else {
    output += 'NIF: Consumidor final\n';
  }
  
  output += line();
  
  // Itens
  output += 'ITEMS:\n';
  output += line();
  
  let itemsList = [];
  if (sale.items) {
    if (Array.isArray(sale.items)) {
      itemsList = sale.items;
    } else if (typeof sale.items === 'object' && sale.items !== null) {
      const productsObj = sale.items as any;
      if ('products' in productsObj && Array.isArray(productsObj.products)) {
        itemsList = productsObj.products;
      }
    }
  }
  
  itemsList.forEach((item: any) => {
    let itemName = 'Produto sem nome';
    let quantity = 1;
    let price = 0;
    
    if (item.product) {
      itemName = item.product.name || 'Produto sem nome';
      price = parseFloat(item.product.price) || 0;
      quantity = parseInt(item.quantity) || 1;
    } else if (item.productName) {
      itemName = item.productName || 'Produto sem nome';
      price = parseFloat(item.price) || 0;
      quantity = parseInt(item.quantity) || 1;
    }
    
    const total = price * quantity;
    output += formatItem(itemName, quantity, price, total);
  });
  
  output += line();
  
  // Total e pagamento
  const total = parseFloat(String(sale.total)) || 0;
  output += alignRight(`TOTAL: ${formatCurrency(total)}`);
  output += `Pagamento: ${sale.paymentMethod || 'Dinheiro'}\n`;
  
  // Isenção
  const taxExemptionReason = config?.receipt_additional_info || 'Artigo 12.º, n.º 1, alínea c) do CIVA';
  output += `\nMotivo de Isenção:\n${taxExemptionReason}\n`;
  
  // Mensagem de agradecimento
  output += '\n' + center(config?.receipt_message || 'Obrigado pela preferência!');
  
  // Rodapé
  const entregaData = formatDateTimeForReceipt(sale.date).split(' ')[0];
  const footerText = (config?.receipt_footer_text || 'Os bens/serviços prestados foram colocados à disposição') + 
    ` do adquirente/prestados em ${entregaData}.`;
  
  output += '\n' + footerText + '\n\n';
  
  // Informação do sistema
  output += center('Contascom - Sistema de Gestão');
  output += center('Aguardando certificação AGT');
  
  return output;
};

/**
 * Gera um PDF de recibo para uma venda com altura dinâmica
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
    taxId: config?.tax_id || '', 
    currency: config?.currency || defaultReceiptConfig.currency,
    taxRate: config?.tax_rate || 0,
    thankYouMessage: config?.receipt_message || defaultReceiptConfig.thankYouMessage,
    showLogo: config?.receipt_show_logo || defaultReceiptConfig.showLogo,
    showSignature: config?.receipt_show_signature || defaultReceiptConfig.showSignature,
    footerText: config?.receipt_footer_text || defaultReceiptConfig.footerText,
    additionalInfo: config?.receipt_additional_info || '',
    companyNeighborhood: config?.company_neighborhood || '',
    companyCity: config?.company_city || '',
    companySocialMedia: config?.company_social_media || '',
    systemInfo: 'Contascom - Sistema de Gestão de Faturação v1.0',
    certificateNumber: 'Aguardando certificação AGT',
    taxExemptionReason: 'Artigo 12.º, n.º 1, alínea c) do CIVA'
  };
  
  // Configurar margens e espaçamentos para evitar sobreposições
  const marginLeft = 20;
  const marginRight = 190;
  const pageWidth = marginRight - marginLeft;
  const pageCenter = marginLeft + pageWidth / 2;
  
  // Espaçamento entre linhas aumentado para 9 conforme solicitado
  const lineSpacing = 9;
  
  // Inicializar a posição Y atual para seguir o fluxo do conteúdo
  let currentYPos = 15;
  
  // Calcular a altura total necessária para o conteúdo (estimativa inicial)
  const estimatedHeight = estimateContentHeight(sale, receiptConfig, lineSpacing);
  
  // Criar um documento PDF com altura dinâmica
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, Math.max(297, estimatedHeight + 50)] // Largura fixa (A4), altura dinâmica
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
  
  // Título do recibo: Nome da empresa
  doc.text(receiptConfig.companyName || 'MOLOJA', pageCenter, currentYPos, { align: 'center' });
  
  // Adicionar informações da empresa centralizadas
  doc.setFontSize(normalSize - 6);
  doc.setFont('helvetica', 'normal');
  
  currentYPos += 9; // Aumentado para dar mais espaço após o título
  
  // NIF - Exibe o NIF personalizado pelo usuário 
  if (receiptConfig.taxId) {
    doc.setFont('helvetica', 'bold');
    doc.text(`NIF: ${receiptConfig.taxId}`, pageCenter, currentYPos, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    currentYPos += lineSpacing;
  }

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
  
  // INSS / Conta social
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
  
  // Seção de detalhes do documento com layout de apenas uma coluna
  const leftColumn = marginLeft;
  
  // Detalhes do documento
  doc.setFont('helvetica', 'bold');
  doc.text("DOCUMENTO:", leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
  doc.setFont('helvetica', 'normal');
  doc.text("Original: FT", leftColumn, currentYPos); 
  currentYPos += lineSpacing;
  
  // Data de emissão
  doc.text(`Data Emissão: ${formatDateTimeForReceipt(sale.date)}`, leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
  // Adicionar data que os bens/serviços foram disponibilizados (mesma da venda)
  doc.text(`Data Entrega: ${formatDateTimeForReceipt(sale.date)}`, leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
  doc.setFont('helvetica', 'bold');
  doc.text("FACTURA RECIBO:", leftColumn, currentYPos);
  doc.setFont('helvetica', 'normal');
  currentYPos += lineSpacing;
  
  // Número da factura seguindo o formato FT SÉRIE/NÚMERO
  const invoiceNumber = `FT MOLOJA/${sale.id?.substring(0, 8) || 'N/A'}`;
  doc.text(invoiceNumber, leftColumn, currentYPos);
  currentYPos += lineSpacing * 2; // Extra space for client info
  
  // Cliente information - apenas uma vez, sem duplicação
  doc.setFont('helvetica', 'bold');
  doc.text("CLIENTE:", leftColumn, currentYPos);
  currentYPos += lineSpacing;
  
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
    doc.text(line, leftColumn, currentYPos);
    currentYPos += lineSpacing;
  }
  
  // NIF do cliente
  if (typeof sale.customer === 'object' && sale.customer && (sale.customer as any).nif) {
    doc.text(`NIF: ${(sale.customer as any).nif}`, leftColumn, currentYPos);
  } else {
    doc.text("NIF: Consumidor final", leftColumn, currentYPos); // Default para AGT
  }
  currentYPos += lineSpacing * 2; // Espaço extra após informações do cliente
  
  // Cabeçalho da tabela de itens - reestruturado para evitar quebra de margem
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(tableSize - 6);
  
  // Título da coluna Item na primeira linha
  doc.text('Item', marginLeft, currentYPos);
  currentYPos += lineSpacing;
  
  // Colocando as outras colunas na linha seguinte com espaço adequado entre elas
  // Aumentando o espaço para três caracteres entre elementos de preço e quantidade
  doc.text('Preço', marginLeft, currentYPos);
  doc.text('Qtd', marginLeft + 60, currentYPos);  // Aumentado para 60 para ter espaço de três caracteres
  doc.text('IVA', marginLeft + 90, currentYPos);  // Aumentado proporcionalmente 
  doc.text('Total', marginLeft + 120, currentYPos); // Aumentado proporcionalmente
  
  // Linha divisória após cabeçalho
  currentYPos += 2;
  doc.line(marginLeft, currentYPos, marginRight, currentYPos);
  currentYPos += lineSpacing;
  
  // Resetar fonte
  doc.setFont('helvetica', 'normal');
  
  // Processar itens - Corrigido para tratar melhor as diferentes estruturas de dados
  let itemsList = [];
  if (sale.items) {
    if (Array.isArray(sale.items)) {
      itemsList = sale.items;
    } else if (typeof sale.items === 'object' && sale.items !== null) {
      // Verificar se há produtos na propriedade 'products'
      const productsObj = sale.items as any;
      if ('products' in productsObj && Array.isArray(productsObj.products)) {
        itemsList = productsObj.products;
      }
    }
  }
  
  // Melhor formatação para itens com tratamento para textos longos
  const maxNameLength = 38; // Comprimento máximo por linha conforme solicitado
  
  itemsList.forEach((item: any) => {
    // Determinando os valores corretos independente da estrutura do objeto
    let itemName = 'Produto sem nome';
    let quantity = 1;
    let price = 0;
    
    if (item.product) {
      // Formato usando estrutura com objeto product
      itemName = item.product.name || 'Produto sem nome';
      price = parseFloat(item.product.price) || 0;
      quantity = parseInt(item.quantity) || 1;
    } else if (item.productName) {
      // Formato usando propriedades diretas dos produtos vindos do Supabase
      itemName = item.productName || 'Produto sem nome';
      price = parseFloat(item.price) || 0;
      quantity = parseInt(item.quantity) || 1;
    } else {
      // Formato possível alternativo
      itemName = item.name || 'Produto sem nome';
      price = parseFloat(item.price) || 0;
      quantity = parseInt(item.quantity) || 1;
    }
    
    // Garantir que preço e quantidade são números para evitar undefined
    price = isNaN(price) ? 0 : price;
    quantity = isNaN(quantity) ? 1 : quantity;
    
    const total = price * quantity;
    const taxRate = receiptConfig.taxRate || 0;
    const taxValue = (total * taxRate) / 100;
    
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
    
    // Informações numéricas em uma linha separada, com espaço adequado entre moeda e valor
    const priceFormatted = price.toFixed(2).replace('.', ',');
    const totalFormatted = total.toFixed(2).replace('.', ',');
    
    // Ajustando o espaçamento para corresponder ao cabeçalho
    doc.text(`${receiptConfig.currency} ${priceFormatted}`, marginLeft, currentYPos);
    doc.text(quantity.toString(), marginLeft + 60, currentYPos);  // Aumentado para 60
    doc.text(`${taxRate}%`, marginLeft + 90, currentYPos);        // Aumentado para 90
    doc.text(`${receiptConfig.currency} ${totalFormatted}`, marginLeft + 120, currentYPos);  // Aumentado para 120
    
    // Espaçamento extra após cada item
    currentYPos += lineSpacing * 1.5;
  });
  
  // Desenhar uma linha
  doc.line(marginLeft, currentYPos, marginRight, currentYPos);
  currentYPos += lineSpacing; // Espaçamento após a linha
  
  // Adicionar total e forma de pagamento com destaque (corrigindo quebra de margem)
  doc.setFont('helvetica', 'bold');
  // Ajustando posição para evitar quebra de margem
  doc.text('Total:', marginLeft, currentYPos);
  
  // Garantir que o total é um número para evitar undefined
  const totalSale = parseFloat(String(sale.total)) || 0;
  const totalFormatted = totalSale.toFixed(2).replace('.', ',');
  
  // Usando receiptConfig.currency para formatação consistente
  doc.text(`${receiptConfig.currency} ${totalFormatted}`, marginLeft + 100, currentYPos); // Aumentado para corresponder ao novo layout
  currentYPos += lineSpacing;
  
  // Alterando "Forma de Pagamento" para apenas "Pagamento"
  doc.text('Pagamento:', marginLeft, currentYPos);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.paymentMethod || 'Dinheiro', marginLeft + 100, currentYPos); // Aumentado para corresponder ao novo layout
  
  // Adicionar motivo de isenção de imposto (novo)
  currentYPos += lineSpacing * 1.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Motivo de Isenção:', marginLeft, currentYPos);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptConfig.taxExemptionReason || 'N/A', marginLeft + 100, currentYPos);
  
  // Adicionar mensagem de agradecimento 
  currentYPos += lineSpacing * 2;
  if (receiptConfig.thankYouMessage) {
    doc.text(receiptConfig.thankYouMessage, pageCenter, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Adicionar rodapé
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(footerSize);
  
  // Quebrar texto do rodapé em múltiplas linhas se necessário
  const entregaData = formatDateTimeForReceipt(sale.date).split(' ')[0]; // Pega apenas a parte da data
  const footerText = (receiptConfig.footerText || 'Os bens/serviços prestados foram colocados à disposição') + ` do adquirente/prestados em ${entregaData}.`;
  const footerLines = wrapText(footerText);
  
  // Escrever as linhas do rodapé
  for (const line of footerLines) {
    doc.text(line, pageCenter, currentYPos, { align: 'center' });
    currentYPos += lineSpacing;
  }
  
  // Adicionar informação do sistema (novo)
  currentYPos += lineSpacing;
  doc.text(receiptConfig.systemInfo || 'Sistema de Faturação', pageCenter, currentYPos, { align: 'center' });
  currentYPos += lineSpacing;
  
  // Adicionar hash de segurança no rodapé (formatado para não exceder 38 caracteres)
  // Quebrar a linha de certificação em partes menores para evitar estouro da margem
  doc.setFontSize(footerSize - 4);
  doc.setFont('helvetica', 'italic');
  
  // Linhas da certificação
  currentYPos += lineSpacing; // Add space between footer text and certification
  const certLine1 = "ABC1-Processado por programa validado";
  doc.text(certLine1, pageCenter, currentYPos, { align: 'center' });
  
  // Segunda linha da certificação com número de certificado
  currentYPos += lineSpacing;
  const certLine2 = `nº ${receiptConfig.certificateNumber || "xxxx/AGT/2025"}`;
  doc.text(certLine2, pageCenter, currentYPos, { align: 'center' });
  
  return doc;
};

/**
 * Estima a altura do conteúdo baseado nos itens da venda e outras informações
 * para criar um PDF com altura dinâmica
 */
function estimateContentHeight(sale: Sale, config: ReceiptConfig, lineSpacing: number): number {
  let height = 150; // Altura base para cabeçalho, informações da empresa, etc.
  
  // Estimar altura para itens
  let itemsList = [];
  if (sale.items) {
    if (Array.isArray(sale.items)) {
      itemsList = sale.items;
    } else if (typeof sale.items === 'object' && sale.items !== null) {
      const productsObj = sale.items as any;
      if ('products' in productsObj && Array.isArray(productsObj.products)) {
        itemsList = productsObj.products;
      }
    }
  }
  
  // Adicionar altura para cada item (com espaço extra para nomes de produtos longos)
  itemsList.forEach((item: any) => {
    let itemName = '';
    if (item.product) {
      itemName = item.product.name || '';
    } else if (item.productName) {
      itemName = item.productName || '';
    } else {
      itemName = item.name || '';
    }
    
    // Calcular linhas adicionais para nomes longos (38 caracteres por linha)
    const additionalLines = Math.ceil(itemName.length / 38) - 1;
    height += (2 + additionalLines) * lineSpacing + 10; // 2 linhas padrão + linhas adicionais + margem
  });
  
  // Adicionar altura para rodapé, total, pagamento e outros elementos
  height += 100;
  
  // Adicionar espaço extra para informações da empresa, se presentes
  if (config.companyAddress) height += (Math.ceil(config.companyAddress.length / 38) * lineSpacing);
  if (config.companyEmail) height += lineSpacing;
  if (config.companyPhone) height += lineSpacing;
  if (config.companyNeighborhood) height += lineSpacing;
  if (config.companyCity) height += lineSpacing;
  if (config.companySocialMedia) height += lineSpacing;
  
  return height;
}

/**
 * Imprime um recibo em formato texto para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 */
export const printThermalReceipt = (sale: Sale, config?: ExtendedProfile): void => {
  const receiptText = generateThermalReceipt(sale, config);
  
  // Criar um iframe invisível para impressão
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  // Escrever o conteúdo do recibo no iframe usando fonte monoespaçada
  iframe.contentDocument?.write(`
    <pre style="font-family: monospace; font-size: 12px; white-space: pre;">
      ${receiptText}
    </pre>
  `);
  
  // Imprimir e remover o iframe
  iframe.contentWindow?.print();
  iframe.onload = () => {
    document.body.removeChild(iframe);
  };
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
  printThermalReceipt(sale, config);
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

/**
 * Baixa um recibo em formato texto para uma venda
 * @param sale A venda para gerar um recibo
 * @param config Configuração opcional para personalizar o recibo
 */
export const downloadThermalReceipt = (sale: Sale, config?: ExtendedProfile): void => {
  const receiptText = generateThermalReceipt(sale, config);
  
  // Create the Blob with proper encoding
  const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
  
  // Create a download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.href = url;
  link.download = `recibo-termico-${sale.id || Date.now()}.txt`;
  
  // Append link to body to ensure it works across browsers
  document.body.appendChild(link);
  
  // Trigger click event
  link.click();
  
  // Clean up
  setTimeout(() => {
    // Remove the link from DOM
    document.body.removeChild(link);
    // Revoke object URL to free memory
    URL.revokeObjectURL(url);
  }, 100);
};
