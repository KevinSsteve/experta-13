
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { clearAllSales, clearLocalSales } from '@/lib/utils/database-cleanup';
import { useQueryClient } from '@tanstack/react-query';

interface SalesCleanupButtonProps {
  userId?: string;
  onCleanupComplete?: () => void;
}

export function SalesCleanupButton({ userId, onCleanupComplete }: SalesCleanupButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCleanup = async () => {
    setIsLoading(true);
    
    try {
      // Primeiro, tenta limpar as vendas no banco de dados
      const dbResult = userId ? await clearAllSales(userId) : { success: false, message: "Usuário não autenticado" };
      
      // Também limpa as vendas locais
      const localResult = clearLocalSales();
      
      if (dbResult.success || localResult.success) {
        // Exibe o toast de sucesso
        toast.success(
          "Registros de vendas removidos", 
          { description: `${dbResult.count || 0} vendas da base de dados e ${localResult.count || 0} vendas locais foram removidas.` }
        );
        
        // Invalida as queries relacionadas a vendas para forçar recarregamento
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        queryClient.invalidateQueries({ queryKey: ['salesReport'] });
        queryClient.invalidateQueries({ queryKey: ['recentSales'] });
        queryClient.invalidateQueries({ queryKey: ['salesSummary'] });
        
        // Executa callback se fornecido
        if (onCleanupComplete) {
          onCleanupComplete();
        }
      } else {
        toast.error(
          "Erro ao limpar registros", 
          { description: dbResult.message || "Não foi possível limpar os registros de vendas." }
        );
      }
    } catch (error) {
      console.error("Erro durante a limpeza de vendas:", error);
      toast.error(
        "Erro inesperado", 
        { description: "Ocorreu um erro ao tentar limpar os registros de vendas." }
      );
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        title="Limpar todos os registros de vendas"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Limpar Histórico
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar histórico de vendas</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover permanentemente todos os registros de vendas da base de dados e do armazenamento local.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleCleanup();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sim, limpar tudo
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
