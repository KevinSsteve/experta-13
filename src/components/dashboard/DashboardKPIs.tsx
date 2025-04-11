
import { SalesKPIs } from '@/lib/sales';
import { formatCurrency } from '@/lib/utils';
import { KPICard } from './KPICard';
import { KPICardSkeleton } from './KPICardSkeleton';
import { DollarSign, ShoppingBag, CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardKPIsProps {
  data: SalesKPIs | undefined;
  isLoading: boolean;
}

export const DashboardKPIs = ({ data, isLoading }: DashboardKPIsProps) => {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <>
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </>
    );
  }

  if (!data) {
    return (
      <div className="col-span-3 text-center py-6 text-muted-foreground">
        <p className="text-xs sm:text-sm">Não foi possível carregar os dados de KPIs</p>
      </div>
    );
  }

  return (
    <>
      <KPICard
        title="Receita Total"
        value={formatCurrency(data.totalRevenue)}
        icon={<DollarSign className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />}
        change={data.revenueChange}
        subtitle="Comparado ao período anterior"
      />
      
      <KPICard
        title="Número de Vendas"
        value={data.totalSales}
        icon={<ShoppingBag className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />}
        change={data.salesChange}
        subtitle="Comparado ao período anterior"
      />
      
      <KPICard
        title="Ticket Médio"
        value={formatCurrency(data.averageTicket)}
        icon={<CreditCard className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />}
        change={data.ticketChange}
        subtitle="Comparado ao período anterior"
      />
    </>
  );
};
