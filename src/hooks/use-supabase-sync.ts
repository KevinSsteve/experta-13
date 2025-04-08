
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { syncProductsToSupabase } from '@/lib/utils';
import { refreshSalesData } from '@/lib/sales-data';
import { toast } from 'sonner';

/**
 * Hook para sincronização de dados com o Supabase
 * Monitora mudanças no estado de autenticação e sincroniza dados locais com o Supabase quando necessário
 */
export function useSupabaseSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Monitorar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Quando o usuário faz login, sincronizar os dados locais
        if (event === 'SIGNED_IN' && session) {
          await syncDataToSupabase();
        }
      }
    );

    // Verificar se há uma sessão ativa ao montar o componente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        syncDataToSupabase();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const syncDataToSupabase = async () => {
    try {
      setIsSyncing(true);
      toast.info('Sincronizando dados com o servidor...', { duration: 2000 });

      // Sincronizar produtos
      await syncProductsToSupabase();
      
      // Atualizar dados de vendas
      await refreshSalesData();
      
      setLastSyncTime(new Date());
      toast.success('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast.error('Erro ao sincronizar dados com o servidor');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSyncTime,
    syncDataToSupabase
  };
}
