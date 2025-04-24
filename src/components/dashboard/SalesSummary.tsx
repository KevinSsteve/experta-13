
import { formatCurrency } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';

interface SalesSummaryProps {
  salesData: any[] | undefined;
}

export const SalesSummary = ({ salesData }: SalesSummaryProps) => {
  if (!salesData || salesData.length === 0) {
    return (
      <div className="mt-4 p-4 bg-muted rounded-md">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <p className="font-medium">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  try {
    const totalSales = salesData.reduce((acc, day) => acc + (day.total || 0), 0);
    const totalProfit = salesData.reduce((acc, day) => acc + (day.profit || 0), 0);
    const totalTransactions = salesData.reduce((acc, day) => acc + (day.count || 0), 0);
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Resumo do Período</h4>
        <ResponsiveWrapper
          className="grid gap-4"
          mobileClassName="grid-cols-2"
          desktopClassName="grid-cols-5"
        >
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground">Vendas</p>
            <p className="font-semibold">{formatCurrency(totalSales)}</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground">Lucro</p>
            <p className="font-semibold">{formatCurrency(totalProfit)}</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground">Margem</p>
            <p className="font-semibold">{profitMargin.toFixed(1)}%</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground">Transações</p>
            <p className="font-semibold">{totalTransactions}</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
            <p className="font-semibold">{formatCurrency(averageTicket)}</p>
          </div>
        </ResponsiveWrapper>
      </div>
    );
  } catch (error) {
    console.error('Erro ao calcular resumo:', error);
    return (
      <div className="mt-4 p-4 bg-red-50 rounded-md">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="font-medium text-red-700">Erro ao processar dados</p>
        </div>
      </div>
    );
  }
};
