
import { formatCurrency } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface SalesSummaryProps {
  salesData: any[] | undefined;
}

export const SalesSummary = ({ salesData }: SalesSummaryProps) => {
  if (!salesData || salesData.length === 0) {
    return (
      <div className="mt-4 p-4 bg-muted rounded-md">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <p className="font-medium">Nenhum dado de venda para resumir neste período</p>
        </div>
        <p className="text-sm text-muted-foreground ml-7">
          Isso pode acontecer por três motivos:
        </p>
        <ul className="text-sm text-muted-foreground list-disc pl-10 mt-1 space-y-1">
          <li>Você não tem vendas registradas para o período selecionado</li>
          <li>Você não está autenticado no sistema</li>
          <li>Há um problema com o acesso ao banco de dados</li>
        </ul>
        <p className="text-sm text-muted-foreground ml-7 mt-2">
          Tente selecionar um período diferente, verificar sua autenticação ou registrar novas vendas.
        </p>
      </div>
    );
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
