
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInventoryReport } from '@/lib/reports';
import { Printer, FileDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export const InventoryReportGenerator = () => {
  const [reportType, setReportType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const { toast } = useToast();

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await getInventoryReport(reportType);
      setReportData(data);
      toast({
        title: 'Relatório gerado com sucesso',
        description: `${data.length} produtos encontrados`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de estoque:', error);
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
    a.download = `relatorio-estoque-${new Date().toISOString().slice(0, 10)}.csv`;
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Tipo de Relatório</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Produtos</SelectItem>
              <SelectItem value="low">Estoque Baixo</SelectItem>
              <SelectItem value="out">Fora de Estoque</SelectItem>
              <SelectItem value="category">Por Categoria</SelectItem>
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
                  <TableHead>Nome do Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.code || '-'}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{formatCurrency(product.price * product.stock)}</TableCell>
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
