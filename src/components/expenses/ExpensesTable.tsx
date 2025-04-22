
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string;
  notes?: string;
};

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading?: boolean;
}

export const ExpensesTable = ({ expenses, isLoading }: ExpensesTableProps) => {
  if (isLoading) {
    return <div>Carregando despesas...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Método de Pagamento</TableHead>
          <TableHead>Observações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
            <TableCell>{expense.description}</TableCell>
            <TableCell>{expense.category}</TableCell>
            <TableCell>{formatCurrency(expense.amount)}</TableCell>
            <TableCell>{expense.payment_method}</TableCell>
            <TableCell>{expense.notes || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
