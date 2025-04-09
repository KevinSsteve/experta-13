
import React from 'react';
import { Sale } from '@/lib/sales/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye, Printer, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SalesCardListProps {
  sales: Sale[];
  onViewSaleDetails: (sale: Sale) => void;
  onPrintReceipt: (sale: Sale, event: React.MouseEvent) => void;
}

export function SalesCardList({ sales, onViewSaleDetails, onPrintReceipt }: SalesCardListProps) {
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
    <div className="grid gap-3">
      {sales.map((sale) => (
        <Card 
          key={sale.id} 
          className="overflow-hidden hover:bg-muted/30 transition-colors"
          onClick={() => onViewSaleDetails(sale)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">{formatDate(sale.date)}</div>
              <div className="font-medium">{formatCurrency(sale.total)}</div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {typeof sale.customer === 'string' 
                    ? sale.customer 
                    : 'Cliente não identificado'}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="font-mono">{sale.id.slice(0, 8)}...</span>
                  •
                  <span>{sale.paymentMethod}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintReceipt(sale, e);
                  }}
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
