
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { importSampleMeatCuts } from '@/lib/butcher/sample-data';
import { createMeatCut } from '@/lib/butcher/api';
import { importSampleSupermarketProducts } from '@/lib/supermarket/sample-data';
import { createSupermarketProduct } from '@/lib/supermarket/api';
import { toast } from 'sonner';

export const useModule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const selectedModule = localStorage.getItem('userModule');

  const selectModule = async (module: string) => {
    localStorage.setItem('userModule', module);
    
    // Importar dados de amostra com base no módulo selecionado
    if (user) {
      if (module === 'butcher') {
        try {
          // Importar dados de amostra para o módulo de talho
          // A função importSampleMeatCuts agora importa os dados diretamente
          await importSampleMeatCuts(user.id);
          
          toast.success('Módulo de Talho selecionado com sucesso!');
        } catch (error) {
          console.error('Erro ao importar dados de amostra para o módulo de talho:', error);
        }
        
        navigate('/butcher/dashboard');
      } 
      else if (module === 'supermarket') {
        try {
          const sampleProducts = importSampleSupermarketProducts(user.id);
          
          // Importar dados de amostra para o módulo de supermercado
          const promises = sampleProducts.map(product => createSupermarketProduct(product));
          
          await Promise.all(promises)
            .catch(error => {
              console.error('Erro ao importar dados de amostra para o módulo de supermercado:', error);
            });
          
          toast.success('Módulo de Supermercado selecionado com sucesso!');
        } catch (error) {
          console.error('Erro ao preparar dados de amostra para o módulo de supermercado:', error);
        }
        
        navigate('/supermarket/dashboard');
      }
      else {
        navigate('/dashboard');
      }
    } else {
      navigate('/auth');
    }
  };

  useEffect(() => {
    // Se não há módulo selecionado, redirecionar para a página de seleção
    if (!selectedModule) {
      navigate('/select-module');
    }
  }, [selectedModule, navigate]);

  return { selectModule, selectedModule };
};
