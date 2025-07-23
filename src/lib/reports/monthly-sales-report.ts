import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface DailySalesSummary {
  date: Date;
  totalSales: number;
  totalRevenue: number;
  transactionCount: number;
}

interface MonthlySalesData {
  dailySales: DailySalesSummary[];
  totalRevenue: number;
  totalTransactions: number;
  averageDailyRevenue: number;
  bestDay: DailySalesSummary | null;
  worstDay: DailySalesSummary | null;
}

export const generateMonthlySalesReport = async (
  data: MonthlySalesData,
  selectedMonth: Date
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Configurações de cores
  const primaryColor: [number, number, number] = [34, 197, 94]; // green-500
  const secondaryColor: [number, number, number] = [71, 85, 105]; // slate-600
  
  // Cabeçalho
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Mensal de Vendas', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const monthYear = format(selectedMonth, 'MMMM yyyy');
  doc.text(`Período: ${monthYear}`, pageWidth / 2, 35, { align: 'center' });
  
  // Reset cor do texto
  doc.setTextColor(0, 0, 0);
  
  let yPosition = 60;
  
  // Resumo Executivo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Resumo Executivo', 20, yPosition);
  yPosition += 20;
  
  // KPIs principais
  const kpis = [
    ['Receita Total do Mês', data.totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })],
    ['Total de Transações', data.totalTransactions.toString()],
    ['Receita Média Diária', data.averageDailyRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })],
    ['Ticket Médio', data.totalTransactions > 0 ? (data.totalRevenue / data.totalTransactions).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) : 'N/A'],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: kpis,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 80, halign: 'right' }
    }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  // Insights e Análises
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Insights e Análises', 20, yPosition);
  yPosition += 15;
  
  // Calcular insights
  const workingDays = data.dailySales.filter(day => day.transactionCount > 0).length;
  const totalDaysInMonth = data.dailySales.length;
  const salesFrequency = (workingDays / totalDaysInMonth) * 100;
  
  const insights = [];
  
  // Frequência de vendas
  if (salesFrequency >= 80) {
    insights.push('✓ Excelente consistência: vendas registradas em mais de 80% dos dias do mês.');
  } else if (salesFrequency >= 50) {
    insights.push('⚡ Boa frequência: vendas registradas em mais de 50% dos dias do mês.');
  } else {
    insights.push('⚠️ Oportunidade de melhoria: vendas registradas em menos de 50% dos dias.');
  }
  
  // Análise do melhor e pior dia
  if (data.bestDay && data.worstDay) {
    const dayOfWeekBest = format(data.bestDay.date, 'EEEE');
    const dayOfWeekWorst = format(data.worstDay.date, 'EEEE');
    
    insights.push(`🏆 Melhor dia: ${format(data.bestDay.date, 'dd/MM')} (${dayOfWeekBest}) com ${data.bestDay.totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`);
    
    if (data.bestDay.date !== data.worstDay.date) {
      insights.push(`📉 Menor dia: ${format(data.worstDay.date, 'dd/MM')} (${dayOfWeekWorst}) com ${data.worstDay.totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`);
    }
  }
  
  // Análise de tendência semanal
  const weeklyAverages = [];
  for (let week = 0; week < 4; week++) {
    const weekStart = week * 7;
    const weekEnd = Math.min(weekStart + 7, data.dailySales.length);
    const weekSales = data.dailySales.slice(weekStart, weekEnd);
    const weekRevenue = weekSales.reduce((sum, day) => sum + day.totalRevenue, 0);
    weeklyAverages.push(weekRevenue / weekSales.length);
  }
  
  const trend = weeklyAverages[weeklyAverages.length - 1] - weeklyAverages[0];
  if (trend > 0) {
    insights.push(`📈 Tendência positiva: crescimento de ${((trend / weeklyAverages[0]) * 100).toFixed(1)}% entre a primeira e última semana.`);
  } else if (trend < 0) {
    insights.push(`📉 Tendência de declínio: redução de ${((Math.abs(trend) / weeklyAverages[0]) * 100).toFixed(1)}% entre a primeira e última semana.`);
  } else {
    insights.push('➡️ Vendas estáveis ao longo do mês.');
  }
  
  // Adicionar insights ao PDF
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  insights.forEach(insight => {
    const lines = doc.splitTextToSize(insight, pageWidth - 40);
    lines.forEach((line: string) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 4;
  });
  
  yPosition += 10;
  
  // Tabela detalhada de vendas diárias
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Vendas Diárias Detalhadas', 20, yPosition);
  yPosition += 10;
  
  // Preparar dados da tabela
  const salesDays = data.dailySales
    .filter(day => day.transactionCount > 0)
    .map(day => [
      format(day.date, 'dd/MM/yyyy'),
      format(day.date, 'EEEE'),
      day.transactionCount.toString(),
      day.totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }),
      `${((day.totalRevenue / data.averageDailyRevenue) * 100).toFixed(0)}%`
    ]);
  
  if (salesDays.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Data', 'Dia da Semana', 'Transações', 'Receita', '% da Média']],
      body: salesDays,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'center', cellWidth: 25 }
      }
    });
  }
  
  // Rodapé
  const pageCount = (doc as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Salvar o PDF
  const fileName = `relatorio-vendas-${format(selectedMonth, 'yyyy-MM')}.pdf`;
  doc.save(fileName);
};