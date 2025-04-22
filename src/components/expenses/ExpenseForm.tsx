
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const PAYMENT_METHODS = [
  { label: 'Dinheiro', value: 'cash' },
  { label: 'Cartão de Débito', value: 'debit' },
  { label: 'Cartão de Crédito', value: 'credit' },
  { label: 'PIX', value: 'pix' },
  { label: 'Transferência', value: 'transfer' },
];

const EXPENSE_CATEGORIES = [
  { label: 'Aluguel', value: 'rent' },
  { label: 'Energia', value: 'electricity' },
  { label: 'Água', value: 'water' },
  { label: 'Internet', value: 'internet' },
  { label: 'Telefone', value: 'phone' },
  { label: 'Salários', value: 'salaries' },
  { label: 'Manutenção', value: 'maintenance' },
  { label: 'Limpeza', value: 'cleaning' },
  { label: 'Material de Escritório', value: 'office_supplies' },
  { label: 'Impostos', value: 'taxes' },
  { label: 'Outros', value: 'others' },
];

interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  payment_method: string;
  date: string;
  notes?: string;
}

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  isLoading?: boolean;
}

export const ExpenseForm = ({ onSubmit, isLoading }: ExpenseFormProps) => {
  const form = useForm<ExpenseFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Conta de luz" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método de pagamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Observações adicionais (opcional)" />
              </FormControl>
              <FormDescription>
                Adicione qualquer informação relevante sobre a despesa
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Registrar Despesa'}
        </Button>
      </form>
    </Form>
  );
};
