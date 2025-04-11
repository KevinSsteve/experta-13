
import { formatCurrency } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface SalesSummaryProps {
  salesData: any[] | undefined;
}

export const SalesSummary = ({ salesData }: SalesSummaryProps) => {
  // Log para depuração
  console.log('Dados recebidos em SalesSummary:', salesData);
  
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

  try {
    // Calcular métricas com proteção contra dados inválidos
    const totalSales = salesData.reduce((acc, day) => acc + (typeof day.total === 'number' ? day.total : 0), 0);
    const totalTransactions = salesData.reduce((acc, day) => acc + (typeof day.count === 'number' ? day.count : 1), 0);
    const averageDaily = salesData.length > 0 ? totalSales / salesData.length : 0;

    console.log('Métricas calculadas:', { totalSales, totalTransactions, averageDaily });

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
  } catch (error) {
    console.error('Erro ao calcular resumo de vendas:', error);
    return (
      <div className="mt-4 p-4 bg-red-50 rounded-md">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="font-medium text-red-700">Erro ao processar dados de venda</p>
        </div>
        <p className="text-sm text-red-600 ml-7 mt-1">
          Ocorreu um erro ao calcular o resumo das vendas. Por favor, tente novamente mais tarde.
        </p>
      </div>
    );
  }
};
