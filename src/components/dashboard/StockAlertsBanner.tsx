
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductFromSupabase } from '@/lib/products/types';
import { useAuth } from '@/contexts/AuthContext';

export const StockAlertsBanner = () => {
  const [lowStockProducts, setLowStockProducts] = useState<ProductFromSupabase[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const STOCK_THRESHOLD = 10; // Limiar para considerar estoque baixo

  useEffect(() => {
    // Se não houver usuário autenticado, não buscar produtos
    if (!user) return;
    
    const fetchLowStockProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id) // Filtrar apenas produtos do usuário atual
          .gt('stock', 0)  // Produtos com estoque maior que zero
          .lt('stock', STOCK_THRESHOLD) // Mas menor que o limiar
          .limit(5); // Limitar a 5 produtos para notificação
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setLowStockProducts(data);
          
          // Mostrar toast de alerta
          if (data.length === 1) {
            toast({
              title: "Alerta de estoque",
              description: `${data[0].name} está com estoque baixo (${data[0].stock} unidades)`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Alerta de estoque",
              description: `${data.length} produtos estão com estoque baixo`,
              variant: "destructive",
            });
          }
        } else {
          // Se não houver produtos com estoque baixo, limpar o estado
          setLowStockProducts([]);
        }
      } catch (error) {
        console.error('Erro ao buscar produtos com estoque baixo:', error);
        setLowStockProducts([]);
      }
    };

    fetchLowStockProducts();
    
    // Configurar canal de tempo real para atualizações de estoque do usuário atual
    const channel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id} AND stock=lt.${STOCK_THRESHOLD}`,
        },
        (payload) => {
          // Atualizar a lista quando houver alterações
          fetchLowStockProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, user]);

  // Se não há produtos com estoque baixo ou o banner não é visível, não renderizar nada
  if (lowStockProducts.length === 0 || !isVisible) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
      <div className="flex items-start justify-between">
        <div className="flex">
          <Bell className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Alerta de estoque baixo
            </p>
            <ul className="mt-1 text-sm text-amber-700">
              {lowStockProducts.map((product) => (
                <li key={product.id}>
                  {product.name}: <strong>{product.stock} unidades</strong> disponíveis
                </li>
              ))}
            </ul>
            {lowStockProducts.length === 5 && (
              <p className="mt-1 text-xs text-amber-600">
                E possivelmente outros produtos...
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-amber-500 hover:text-amber-700"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </button>
      </div>
    </div>
  );
};
