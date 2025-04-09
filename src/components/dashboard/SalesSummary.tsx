
import { formatCurrency } from '@/lib/utils';

interface SalesSummaryProps {
  salesData: any[] | undefined;
}

export const SalesSummary = ({ salesData }: SalesSummaryProps) => {
  if (!salesData || salesData.length === 0) {
    return null;
  }

  const totalSales = salesData.reduce((acc, day) => acc + day.total, 0);
  const totalTransactions = salesData.reduce((acc, day) => acc + day.count, 0);
  const averageDaily = totalSales / salesData.length;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Sumário</h4>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="bg-muted rounded-md p-3">
          <p className="text-xs text-muted-foreground">Total de Vendas</p>
          <p className="font-semibold">
            {formatCurrency(totalSales)}
          </p>
        </div>
        <div className="bg-muted rounded-md p-3">
          <p className="text-xs text-muted-foreground">Qtd. Transações</p>
          <p className="font-semibold">
            {totalTransactions}
          </p>
        </div>
        <div className="bg-muted rounded-md p-3">
          <p className="text-xs text-muted-foreground">Média Diária</p>
          <p className="font-semibold">
            {formatCurrency(averageDaily)}
          </p>
        </div>
      </div>
    </div>
  );
};
