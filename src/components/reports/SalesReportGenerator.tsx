
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSalesReport } from '@/lib/reports';
import { Printer, FileDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

export const SalesReportGenerator = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [groupBy, setGroupBy] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const { toast } = useToast();

  const generateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Selecione um período',
        description: 'Você precisa selecionar um período para gerar o relatório',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await getSalesReport(dateRange.from, dateRange.to, groupBy);
      setReportData(data);
      toast({
        title: 'Relatório gerado com sucesso',
        description: `${data.length} registros encontrados`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Ocorreu um erro ao processar os dados do relatório',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (reportData.length === 0) {
      toast({
        title: 'Sem dados para download',
        description: 'Gere um relatório primeiro antes de fazer o download',
        variant: 'destructive',
      });
      return;
    }

    // Criar CSV
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    // Criar e acionar o download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-vendas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download iniciado',
      description: 'O relatório está sendo baixado',
    });
  };

  const printReport = () => {
    if (reportData.length === 0) {
      toast({
        title: 'Sem dados para impressão',
        description: 'Gere um relatório primeiro antes de imprimir',
        variant: 'destructive',
      });
      return;
    }
    
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Período</label>
          <DateRangePicker 
            value={dateRange} 
            onChange={setDateRange} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Agrupar por</label>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha o agrupamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="category">Categoria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end space-x-2">
          <Button onClick={generateReport} disabled={loading}>
            {loading ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </div>
      </div>

      {reportData.length > 0 && (
        <Card className="mt-6 print:shadow-none">
          <div className="p-4 flex justify-between items-center border-b print:hidden">
            <h3 className="font-medium">Resultados do Relatório</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={printReport}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <FileDown className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {groupBy === 'category' ? (
                    <>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Total Vendas</TableHead>
                      <TableHead>Qtd. Itens</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Período</TableHead>
                      <TableHead>Total Vendas</TableHead>
                      <TableHead>Qtd. Vendas</TableHead>
                      <TableHead>Ticket Médio</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    {groupBy === 'category' ? (
                      <>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{formatCurrency(row.total)}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{formatDate(row.period)}</TableCell>
                        <TableCell>{formatCurrency(row.total)}</TableCell>
                        <TableCell>{row.count}</TableCell>
                        <TableCell>{formatCurrency(row.average)}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};
