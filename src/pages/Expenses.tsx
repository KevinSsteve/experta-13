
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpensesTable } from '@/components/expenses/ExpensesTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

const Expenses = () => {
  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add new expense
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: any) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Despesa registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao registrar despesa:', error);
      toast.error('Erro ao registrar despesa. Tente novamente.');
    },
  });

  const handleSubmit = async (data: any) => {
    addExpenseMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Controle de Despesas</h1>
            <p className="text-muted-foreground">
              Gerencie as despesas da sua mercearia
            </p>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Lista de Despesas</TabsTrigger>
            <TabsTrigger value="new">Nova Despesa</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Despesas</CardTitle>
                <CardDescription>
                  Visualize e gerencie todas as despesas registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensesTable expenses={expenses || []} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nova Despesa</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo para registrar uma nova despesa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseForm
                  onSubmit={handleSubmit}
                  isLoading={addExpenseMutation.isPending}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Expenses;
