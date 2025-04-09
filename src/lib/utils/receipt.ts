
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Sale, CustomerInfo } from '@/lib/sales/types';

export const generateReceiptPDF = (sale: Sale): jsPDF => {
  // Criar uma nova instância de PDF (portrait, mm, A4)
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Adicionar cabeçalho
  doc.setFontSize(20);
  doc.text('RECIBO DE VENDA', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Moloja', pageWidth / 2, 30, { align: 'center' });
  
  // Informações da venda
  doc.setFontSize(10);
  doc.text(`ID da Venda: ${sale.id}`, 15, 45);
  doc.text(`Data: ${formatDate(sale.date)}`, 15, 50);
  
  // Informações do cliente
  if (sale.customer && typeof sale.customer === 'object') {
    const customer = sale.customer as CustomerInfo;
    doc.text(`Cliente: ${customer.name || 'Cliente não identificado'}`, 15, 55);
    if (customer.phone) doc.text(`Telefone: ${customer.phone}`, 15, 60);
    if (customer.email) doc.text(`Email: ${customer.email}`, 15, 65);
  } else if (typeof sale.customer === 'string') {
    doc.text(`Cliente: ${sale.customer || 'Cliente não identificado'}`, 15, 55);
  } else {
    doc.text(`Cliente: Cliente não identificado`, 15, 55);
  }
  
  // Método de pagamento
  doc.text(`Método de Pagamento: ${sale.paymentMethod}`, 15, 70);
  
  // Itens da venda
  const tableData = [];
  if (Array.isArray(sale.items)) {
    sale.items.forEach((item) => {
      tableData.push([
        item.product.name, 
        item.quantity.toString(), 
        formatCurrency(item.product.price), 
        formatCurrency(item.product.price * item.quantity)
      ]);
    });
  }
  
  autoTable(doc, {
    head: [['Produto', 'Quantidade', 'Preço Unit.', 'Total']],
    body: tableData,
    startY: 80,
    theme: 'striped',
    headStyles: { fillColor: [80, 80, 80] },
  });
  
  // Calcular a posição Y após a tabela
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totais
  doc.text(`Subtotal: ${formatCurrency(sale.total)}`, pageWidth - 60, finalY);
  doc.text(`Total: ${formatCurrency(sale.total)}`, pageWidth - 60, finalY + 5);
  if (typeof sale.amountPaid === 'number') {
    doc.text(`Valor pago: ${formatCurrency(sale.amountPaid)}`, pageWidth - 60, finalY + 10);
    doc.text(`Troco: ${formatCurrency(sale.amountPaid - sale.total)}`, pageWidth - 60, finalY + 15);
  }
  
  // Observações (notas)
  if (sale.notes) {
    doc.text(`Observações: ${sale.notes}`, 15, finalY + 20);
  }
  
  // Rodapé
  doc.setFontSize(8);
  doc.text('Obrigado pela sua preferência!', pageWidth / 2, finalY + 30, { align: 'center' });
  
  return doc;
};

export const downloadReceipt = (sale: Sale) => {
  const doc = generateReceiptPDF(sale);
  
  // Nome do arquivo: recibo-ID-DATA.pdf
  const filename = `recibo-${sale.id.slice(0, 8)}-${new Date(sale.date).toISOString().split('T')[0]}.pdf`;
  
  // Download do arquivo
  doc.save(filename);
};

export const printReceipt = (sale: Sale) => {
  const doc = generateReceiptPDF(sale);
  doc.autoPrint();
  doc.output('dataurlnewwindow');
};

export const shareReceipt = async (sale: Sale) => {
  try {
    const doc = generateReceiptPDF(sale);
    const blob = doc.output('blob');
    
    // Nome do arquivo: recibo-ID-DATA.pdf
    const filename = `recibo-${sale.id.slice(0, 8)}-${new Date(sale.date).toISOString().split('T')[0]}.pdf`;
    
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
      downloadReceipt(sale);
      return false;
    }
  } catch (error) {
    console.error('Erro ao compartilhar recibo:', error);
    return false;
  }
};
