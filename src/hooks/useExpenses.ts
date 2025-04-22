
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string;
  notes?: string;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar despesas:', error);
      setExpenses([]);
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  const addExpense = async (expense: Expense) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expense,
        user_id: user.id,
        date: new Date(expense.date).toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar despesa:', error);
      return null;
    }

    fetchExpenses();
    return data;
  };

  const deleteExpense = async (expenseId: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      console.error('Erro ao remover despesa:', error);
      return false;
    }

    fetchExpenses();
    return true;
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return { 
    expenses, 
    loading, 
    addExpense, 
    deleteExpense,
    fetchExpenses 
  };
};
