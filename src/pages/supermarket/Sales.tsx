
import React from 'react';
import { SupermarketLayout } from '@/components/layouts/SupermarketLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupermarketSales() {
  return (
    <SupermarketLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta página está em desenvolvimento. Em breve você poderá gerenciar as vendas do seu supermercado aqui.</p>
        </CardContent>
      </Card>
    </SupermarketLayout>
  );
}
