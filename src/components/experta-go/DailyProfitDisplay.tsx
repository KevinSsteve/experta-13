import { useDailyProfit } from '@/hooks/useDailyProfit';
import { TrendingUp, Eye, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const DailyProfitDisplay = () => {
  const { totalSales, estimatedProfit, profitRate, transactionCount, isLoading } = useDailyProfit();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className="h-4 w-4 text-green-500" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Lucro Estimado - Sempre visível */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/20">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <span className="font-medium text-green-700">
          {estimatedProfit.toLocaleString('pt-AO', {
            style: 'currency',
            currency: 'AOA',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </span>
      </div>

      {/* Informações extras - Apenas em dispositivos maiores */}
      <div className="hidden sm:flex items-center gap-4">
        {/* Vendas Totais */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span className="text-xs">
            {totalSales.toLocaleString('pt-AO', {
              style: 'currency',
              currency: 'AOA',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        {/* Taxa de Lucro */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="h-3 w-3" />
          <span className="text-xs">{profitRate}%</span>
        </div>

        {/* Contador de Transações */}
        {transactionCount > 0 && (
          <div className="text-xs text-muted-foreground">
            {transactionCount} venda{transactionCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};