
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SimpleRecentSalesProps {
  sales: any[] | undefined;
  isLoading: boolean;
}

export const SimpleRecentSales = ({ sales, isLoading }: SimpleRecentSalesProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {sales && sales.length > 0 ? (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">
                    {sale.customer || 'Cliente não identificado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(sale.date)}
                  </p>
                </div>
                <p className="font-medium">
                  {formatCurrency(sale.total)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            Nenhuma venda recente encontrada
          </p>
        )}
      </CardContent>
    </Card>
  );
};
