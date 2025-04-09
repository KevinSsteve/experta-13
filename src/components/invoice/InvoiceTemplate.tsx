
import React from 'react';
import { Sale } from '@/lib/sales/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface InvoiceTemplateProps {
  sale: Sale;
  onClose: () => void;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ sale, onClose }) => {
  const { user } = useAuth();
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow-sm">
      {/* Botões de ação - escondidos durante impressão */}
      <div className="print:hidden flex justify-between mb-6">
        <Button variant="outline" onClick={onClose}>
          Voltar
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
      </div>
      
      {/* Conteúdo da fatura */}
      <div id="invoice-content" className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">FATURA</h1>
            <p className="text-sm text-muted-foreground">Nº {sale.id.slice(0, 8)}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{user?.name || 'Loja POS'}</p>
            <p className="text-sm">{user?.email || ''}</p>
            <p className="text-sm">Data: {formatDate(sale.date)}</p>
          </div>
        </div>
        
        {/* Dados do Cliente */}
        <div className="space-y-2">
          <h2 className="font-semibold">Cliente</h2>
          <div className="border p-3 rounded">
            <p>{typeof sale.customer === 'string' ? sale.customer : sale.customer?.name || 'Cliente não identificado'}</p>
            {sale.customer && typeof sale.customer !== 'string' && (
              <>
                {sale.customer.phone && <p>Tel: {sale.customer.phone}</p>}
                {sale.customer.email && <p>Email: {sale.customer.email}</p>}
              </>
            )}
          </div>
        </div>
        
        {/* Itens */}
        <div className="space-y-2">
          <h2 className="font-semibold">Itens</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Produto</th>
                <th className="py-2 text-right">Preço</th>
                <th className="py-2 text-right">Qtd</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.products && sale.products.map((product, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{product.name || product.productName}</td>
                  <td className="py-2 text-right">{formatCurrency(product.price)}</td>
                  <td className="py-2 text-right">{product.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(product.price * product.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Resumo */}
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          
          {sale.amountPaid && (
            <>
              <div className="flex justify-between mt-2">
                <span>Valor Pago</span>
                <span>{formatCurrency(sale.amountPaid)}</span>
              </div>
              {sale.change && (
                <div className="flex justify-between">
                  <span>Troco</span>
                  <span>{formatCurrency(sale.change)}</span>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Rodapé */}
        <div className="border-t pt-4 text-center text-sm text-muted-foreground">
          <p>Obrigado pela sua compra!</p>
          <p>Este documento serve como comprovativo de compra.</p>
        </div>
      </div>
    </div>
  );
};
