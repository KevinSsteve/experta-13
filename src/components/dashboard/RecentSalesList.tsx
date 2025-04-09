
import { Sale } from '@/lib/sales';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentSalesListProps {
  data: Sale[] | undefined;
  isLoading: boolean;
}

export const RecentSalesList = ({ data, isLoading }: RecentSalesListProps) => {
  // Helper function to safely display customer information
  const renderCustomerName = (customer: any): string => {
    if (!customer) return 'Cliente não identificado';
    
    if (typeof customer === 'object') {
      return customer.name || 'Cliente não identificado';
    }
    
    return String(customer);
  };
  
  // Helper function to safely count items
  const countItems = (items: any): string => {
    if (!items) return '0 itens';
    
    if (typeof items === 'number') {
      return `${items} ${items === 1 ? "item" : "itens"}`;
    }
    
    if (Array.isArray(items)) {
      return `${items.length} ${items.length === 1 ? "item" : "itens"}`;
    }
    
    return '0 itens';
  };
  
  // Helper function to safely render payment method
  const renderPaymentMethod = (method: any): string => {
    return typeof method === 'string' ? method : 'Método de pagamento não especificado';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((sale) => (
              <div key={sale.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {renderCustomerName(sale.customer)}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(sale.date)} · {renderPaymentMethod(sale.paymentMethod)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(sale.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {countItems(sale.items)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhuma venda recente encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
};
