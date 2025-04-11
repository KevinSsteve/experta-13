
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Sale, CustomerInfo } from '@/lib/sales/types';
import { CartItem } from '@/contexts/CartContext';
import { ExtendedProfile } from '@/types/profile';

// Configuração das dimensões para impressora térmica móvel (geralmente 80mm de largura)
const THERMAL_CONFIG = {
  width: 80, // 80mm
  format: [80, 297], // Formato personalizado em mm
  margin: {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  },
  fontSize: {
    header: 13,    // Aumentado de 10
    title: 11,     // Aumentado de 8
    body: 10,      // Aumentado de 7
    small: 8       // Aumentado de 6
  }
};

// Informações padrão da empresa para SAFT de Angola
const DEFAULT_COMPANY_INFO = {
  name: "Moloja Supermercados",
  nif: "5417623490", // NIF da empresa
  address: "Luanda, Angola",
  phone: "+244 922 123 456",
  website: "www.moloja.ao",
  taxRegime: "Normal", // Regime de tributação
  currency: "AKZ" // Moeda local
};

export const generateReceiptPDF = (sale: Sale, companyProfile?: ExtendedProfile): jsPDF => {
  // Usar informações customizadas da empresa se fornecidas, senão usar as padrões
  const COMPANY_INFO = {
    name: companyProfile?.name || DEFAULT_COMPANY_INFO.name,
    nif: companyProfile?.taxId || DEFAULT_COMPANY_INFO.nif,
    address: companyProfile?.address || DEFAULT_COMPANY_INFO.address,
    phone: companyProfile?.phone || DEFAULT_COMPANY_INFO.phone,
    website: DEFAULT_COMPANY_INFO.website, // Manter site padrão se não existir no perfil
    taxRegime: DEFAULT_COMPANY_INFO.taxRegime, // Manter regime padrão
    currency: companyProfile?.currency || DEFAULT_COMPANY_INFO.currency,
    receiptMessage: companyProfile?.receiptMessage || "Obrigado pela sua preferência!" // Mensagem customizada
  };
  
  // Criar uma nova instância de PDF no tamanho para impressora térmica
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: THERMAL_CONFIG.format
  });
  
  const pageWidth = THERMAL_CONFIG.width;
  const margin = THERMAL_CONFIG.margin;
  const contentWidth = pageWidth - margin.left - margin.right;
  
  let yPos = margin.top;
  
  // Funções auxiliares
  const centerText = (text: string, y: number, fontSize: number) => {
    doc.setFontSize(fontSize);
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    return fontSize * 0.35 + 1; // Retorna o espaço vertical usado
  };
  
  const addLine = (text: string, y: number, fontSize: number = THERMAL_CONFIG.fontSize.body) => {
    doc.setFontSize(fontSize);
    doc.text(text, margin.left, y);
    return fontSize * 0.35 + 1; // Retorna o espaço vertical usado
  };
  
  const addWrappedText = (text: string, y: number, fontSize: number = THERMAL_CONFIG.fontSize.body) => {
    doc.setFontSize(fontSize);
    const textLines = doc.splitTextToSize(text, contentWidth);
    doc.text(textLines, margin.left, y);
    return (fontSize * 0.35 + 1) * textLines.length; // Retorna o espaço vertical usado
  };
  
  const addSeparator = (y: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(margin.left, y, pageWidth - margin.right, y);
    return 2; // Retorna o espaço vertical usado
  };
  
  // Adicionar cabeçalho
  yPos += centerText(COMPANY_INFO.name, yPos, THERMAL_CONFIG.fontSize.header);
  yPos += 2;
  yPos += centerText(COMPANY_INFO.address, yPos, THERMAL_CONFIG.fontSize.small);
  yPos += centerText(`Tel: ${COMPANY_INFO.phone}`, yPos, THERMAL_CONFIG.fontSize.small);
  yPos += centerText(`NIF: ${COMPANY_INFO.nif}`, yPos, THERMAL_CONFIG.fontSize.small);
  yPos += centerText(COMPANY_INFO.website, yPos, THERMAL_CONFIG.fontSize.small);
  
  yPos += 3;
  yPos += addSeparator(yPos);
  yPos += 3;
  
  // Título do recibo
  yPos += centerText('RECIBO DE VENDA', yPos, THERMAL_CONFIG.fontSize.title);
  yPos += 2;
  
  // Informações da venda
  yPos += addLine(`Data: ${formatDate(sale.date)}`, yPos);
  
  // Verificar se o ID da venda existe antes de usar slice
  const saleId = sale.id ? sale.id.slice(0, 8) : 'N/A';
  yPos += addLine(`ID Venda: ${saleId}`, yPos);
  
  // Informações do cliente
  if (sale.customer && typeof sale.customer === 'object') {
    const customer = sale.customer as CustomerInfo;
    yPos += addLine(`Cliente: ${customer.name || 'Cliente não identificado'}`, yPos);
    if (customer.phone) yPos += addLine(`Telefone: ${customer.phone}`, yPos);
    if (customer.email) yPos += addLine(`Email: ${customer.email}`, yPos);
    // Adicionar NIF do cliente se disponível (SAFT Angola)
    if (customer.nif) yPos += addLine(`NIF Cliente: ${customer.nif}`, yPos);
  } else if (typeof sale.customer === 'string') {
    yPos += addLine(`Cliente: ${sale.customer || 'Cliente não identificado'}`, yPos);
  } else {
    yPos += addLine(`Cliente: Cliente não identificado`, yPos);
  }
  
  // Método de pagamento
  yPos += addLine(`Método de Pagamento: ${sale.paymentMethod}`, yPos);
  
  yPos += 3;
  yPos += addSeparator(yPos);
  yPos += 3;
  
  // Tabela de itens
  yPos += centerText('ITENS', yPos, THERMAL_CONFIG.fontSize.title);
  yPos += 2;
  
  // Cabeçalho da tabela (removido para evitar sobreposição)
  
  // Itens da venda - novo formato com informações em linhas separadas
  if (Array.isArray(sale.items)) {
    // Se for um array, verificamos se são CartItems ou outro tipo de item
    (sale.items as Array<any>).forEach((item: any) => {
      // Verifica se o item tem estrutura de CartItem
      if (item && typeof item === 'object' && 'product' in item && 'quantity' in item) {
        const cartItem = item as CartItem;
        
        // Adiciona o nome do produto com quebra de linha se necessário
        yPos += addWrappedText(cartItem.product.name, yPos, THERMAL_CONFIG.fontSize.body);
        
        // Informações de preço e quantidade na linha abaixo do nome
        const priceInfo = `${cartItem.quantity} x ${formatCurrency(cartItem.product.price)} = ${formatCurrency(cartItem.product.price * cartItem.quantity)}`;
        yPos += addLine(priceInfo, yPos, THERMAL_CONFIG.fontSize.small);
        
        // Adiciona um pequeno espaço entre os itens
        yPos += 2;
      }
    });
  } else if (typeof sale.products !== 'undefined' && Array.isArray(sale.products)) {
    // Se tivermos products array, usamos ele
    sale.products.forEach((product: any) => {
      // Adiciona o nome do produto com quebra de linha se necessário
      yPos += addWrappedText(product.name, yPos, THERMAL_CONFIG.fontSize.body);
      
      // Quantidade, preço unitário e subtotal na linha abaixo
      const quantity = product.quantity?.toString() || "1";
      const priceInfo = `${quantity} x ${formatCurrency(product.price)} = ${formatCurrency(product.price * (product.quantity || 1))}`;
      yPos += addLine(priceInfo, yPos, THERMAL_CONFIG.fontSize.small);
      
      // Adiciona um pequeno espaço entre os itens
      yPos += 2;
    });
  }
  
  yPos += 1;
  yPos += addSeparator(yPos);
  yPos += 3;
  
  // Totais
  yPos += addLine(`Subtotal: ${formatCurrency(sale.total)}`, yPos);
  yPos += addLine(`Total: ${formatCurrency(sale.total)}`, yPos, THERMAL_CONFIG.fontSize.title);
  
  if (typeof sale.amountPaid === 'number') {
    yPos += addLine(`Valor pago: ${formatCurrency(sale.amountPaid)}`, yPos);
    if (typeof sale.change === 'number') {
      yPos += addLine(`Troco: ${formatCurrency(sale.change)}`, yPos);
    } else {
      yPos += addLine(`Troco: ${formatCurrency(sale.amountPaid - sale.total)}`, yPos);
    }
  }
  
  yPos += 3;
  yPos += addSeparator(yPos);
  yPos += 3;
  
  // Observações (notas)
  if (sale.notes) {
    yPos += addLine('Observações:', yPos);
    yPos += addWrappedText(sale.notes, yPos, THERMAL_CONFIG.fontSize.small);
    yPos += 3;
  }
  
  // Informações de SAFT para Angola
  yPos += addSeparator(yPos);
  yPos += 3;
  yPos += addLine('INFORMAÇÕES FISCAIS', yPos, THERMAL_CONFIG.fontSize.title);
  yPos += 2;
  yPos += addLine(`NIF Emissor: ${COMPANY_INFO.nif}`, yPos, THERMAL_CONFIG.fontSize.small);
  yPos += addLine(`Regime: ${COMPANY_INFO.taxRegime}`, yPos, THERMAL_CONFIG.fontSize.small);
  
  // Código de verificação fiscal (simulado)
  const fiscalVerificationCode = sale.id ? sale.id.slice(0, 6).toUpperCase() : 'N/A';
  yPos += addLine(`Código de Verificação: ${fiscalVerificationCode}`, yPos, THERMAL_CONFIG.fontSize.small);

  yPos += 3;
  
  // Rodapé
  yPos += addSeparator(yPos);
  yPos += 3;
  yPos += centerText(COMPANY_INFO.receiptMessage, yPos, THERMAL_CONFIG.fontSize.small);
  yPos += 3;
  yPos += centerText('www.moloja.co.ao', yPos, THERMAL_CONFIG.fontSize.small);
  
  return doc;
};

// Atualizado para aceitar o perfil da empresa como parâmetro opcional
export const downloadReceipt = (sale: Sale, companyProfile?: ExtendedProfile) => {
  const doc = generateReceiptPDF(sale, companyProfile);
  
  // Nome do arquivo: recibo-ID-DATA.pdf
  const saleId = sale.id ? sale.id.slice(0, 8) : 'sem-id';
  const filename = `recibo-${saleId}-${new Date(sale.date).toISOString().split('T')[0]}.pdf`;
  
  // Download do arquivo
  doc.save(filename);
};

// Atualizado para aceitar o perfil da empresa como parâmetro opcional
export const printReceipt = (sale: Sale, companyProfile?: ExtendedProfile) => {
  const doc = generateReceiptPDF(sale, companyProfile);
  doc.autoPrint();
  doc.output('dataurlnewwindow');
};

// Atualizado para aceitar o perfil da empresa como parâmetro opcional
export const shareReceipt = async (sale: Sale, companyProfile?: ExtendedProfile) => {
  try {
    const doc = generateReceiptPDF(sale, companyProfile);
    const blob = doc.output('blob');
    
    // Nome do arquivo: recibo-ID-DATA.pdf
    const saleId = sale.id ? sale.id.slice(0, 8) : 'sem-id';
    const filename = `recibo-${saleId}-${new Date(sale.date).toISOString().split('T')[0]}.pdf`;
    
    // Verificar se a API de compartilhamento está disponível
    if (navigator.share) {
      const file = new File([blob], filename, { type: 'application/pdf' });
      
      await navigator.share({
        title: 'Recibo de Venda',
        files: [file],
      });
      
      return true;
    } else {
      // Fallback para download se o compartilhamento não estiver disponível
      downloadReceipt(sale, companyProfile);
      return false;
    }
  } catch (error) {
    console.error('Erro ao compartilhar recibo:', error);
    return false;
  }
};
