
import { toast } from 'sonner';
import { QueryObserverResult } from '@tanstack/react-query';

export type RefreshFunction = () => Promise<QueryObserverResult>;

export const refreshAllData = async (refreshFunctions: RefreshFunction[]) => {
  try {
    console.log('[useDashboardUtils] Forçando atualização de todos os dados...');
    await Promise.all(refreshFunctions.map(fn => fn()));
    console.log('[useDashboardUtils] Todos os dados foram atualizados');
    toast.success('Dados atualizados com sucesso');
    return true;
  } catch (error) {
    console.error('[useDashboardUtils] Erro ao atualizar dados:', error);
    toast.error('Erro ao atualizar os dados');
    return false;
  }
};
