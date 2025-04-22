
import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const expenseCategories = [
  'Ingredientes', 
  'Aluguel', 
  'Energia', 
  'Água', 
  'Manutenção', 
  'Outros'
];

export function ExpensesSection() {
  const { expenses, loading, addExpense, deleteExpense } = useExpenses();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'Outros',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash'
  });

  const handleAddExpense = async () => {
    if (!newExpense.description || newExpense.amount <= 0) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos corretamente',
        variant: 'destructive'
      });
      return;
    }

    const result = await addExpense(newExpense);
    if (result) {
      toast({
        title: 'Despesa adicionada',
        description: 'Sua despesa foi registrada com sucesso'
      });
      setIsDialogOpen(false);
      setNewExpense({
        description: '',
        amount: 0,
        category: 'Outros',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash'
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const result = await deleteExpense(id);
    if (result) {
      toast({
        title: 'Despesa removida',
        description: 'A despesa foi excluída com sucesso'
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Despesas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Despesa</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Descrição</Label>
                <Input 
                  className="col-span-3" 
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({
                    ...prev, 
                    description: e.target.value
                  }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Valor</Label>
                <Input 
                  type="number" 
                  className="col-span-3" 
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({
                    ...prev, 
                    amount: parseFloat(e.target.value)
                  }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Categoria</Label>
                <Select 
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense(prev => ({
                    ...prev, 
                    category: value
                  }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddExpense}>
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando despesas...</p>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-2">
            Total de Despesas: {new Intl.NumberFormat('pt-AO', { 
              style: 'currency', 
              currency: 'AOA' 
            }).format(totalExpenses)}
          </div>
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma despesa registrada
            </p>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 5).map((expense) => (
                <div 
                  key={expense.id} 
                  className="flex justify-between items-center bg-background p-2 rounded"
                >
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat('pt-AO', { 
                        style: 'currency', 
                        currency: 'AOA' 
                      }).format(expense.amount)} - {expense.category}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => expense.id && handleDeleteExpense(expense.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
