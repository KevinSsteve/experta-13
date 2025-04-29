
import { SalesKPIs } from '@/lib/sales';
import { formatCurrency } from '@/lib/utils';
import { KPICard } from './KPICard';
import { KPICardSkeleton } from './KPICardSkeleton';
import { DollarSign, TrendingUp, CirclePercent, CircleDollarSign, ShoppingBag, Package } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardKPIsProps {
  data: SalesKPIs | undefined;
  isLoading: boolean;
}

export const DashboardKPIs = ({ data, isLoading }: DashboardKPIsProps) => {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <ResponsiveWrapper
        className="grid gap-4"
        mobileClassName="grid-cols-2"
        desktopClassName="grid-cols-4"
      >
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </ResponsiveWrapper>
    );
  }

  if (!data) {
    return (
      <div className="col-span-full text-center py-6 text-muted-foreground">
        <p className="text-xs sm:text-sm">Não foi possível carregar os dados de KPIs</p>
      </div>
    );
  }

  const profit = data.totalRevenue - data.totalCost;
  const profitMargin = data.totalRevenue > 0 ? (profit / data.totalRevenue) * 100 : 0;

  return (
    <TooltipProvider delayDuration={300}>
      <ResponsiveWrapper
        className="grid gap-4"
        mobileClassName="grid-cols-2"
        desktopClassName="grid-cols-4"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <KPICard
                title="Receita Total"
                value={formatCurrency(data.totalRevenue)}
                icon={<DollarSign className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />}
                change={data.revenueChange}
                subtitle="vs período anterior"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total de receita gerada no período atual</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <KPICard
                title="Lucro"
                value={formatCurrency(profit)}
                icon={<CircleDollarSign className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />}
                change={data.profitChange}
                subtitle="vs período anterior"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Lucro calculado (receita menos custos)</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <KPICard
                title="Margem de Lucro"
                value={`${profitMargin.toFixed(1)}%`}
                icon={<CirclePercent className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />}
                change={data.marginChange}
                subtitle="vs período anterior"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Percentual do lucro em relação à receita</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <KPICard
                title="Vendas"
                value={data.totalSales.toString()}
                icon={<ShoppingBag className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />}
                change={data.salesChange}
                subtitle="vs período anterior"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Número total de transações de venda</p>
          </TooltipContent>
        </Tooltip>
      </ResponsiveWrapper>
    </TooltipProvider>
  );
};
