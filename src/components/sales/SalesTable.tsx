
import React from 'react';
import { Sale } from '@/lib/sales/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SalesTableProps {
  sales: Sale[];
  onViewSaleDetails: (sale: Sale) => void;
  onPrintReceipt: (sale: Sale, event: React.MouseEvent) => void;
}

export function SalesTable({ sales, onViewSaleDetails, onPrintReceipt }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma venda encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>ID da Venda</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Método de Pagamento</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow 
              key={sale.id} 
              className="cursor-pointer"
              onClick={() => onViewSaleDetails(sale)}
            >
              <TableCell>{formatDate(sale.date)}</TableCell>
              <TableCell className="font-mono text-xs">
                {sale.id.slice(0, 8)}...
              </TableCell>
              <TableCell>
                {typeof sale.customer === 'string' 
                  ? sale.customer 
                  : 'Cliente não identificado'}
              </TableCell>
              <TableCell>
                {typeof sale.items === 'number' 
                  ? sale.items 
                  : Array.isArray(sale.items) 
                    ? sale.items.length
                    : 0}
              </TableCell>
              <TableCell>{sale.paymentMethod}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(sale.total)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewSaleDetails(sale);
                    }}
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => onPrintReceipt(sale, e)}
                    title="Gerar recibo PDF"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
