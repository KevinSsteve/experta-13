
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, ShoppingBasket, Package, ShoppingCart, 
  BarChart3, AlertCircle 
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Produtos", href: "/products", icon: ShoppingBasket },
  { name: "Estoque", href: "/inventory", icon: Package },
  { name: "Checkout", href: "/checkout", icon: ShoppingCart },
];

export function MobileNav() {
  const location = useLocation();
  const [hasLowStock, setHasLowStock] = useState(false);
  
  // Verificar se há produtos com estoque baixo
  useEffect(() => {
    const checkLowStock = async () => {
      try {
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .gt('stock', 0)
          .lt('stock', 10);
          
        if (error) throw error;
        
        setHasLowStock(count ? count > 0 : false);
      } catch (error) {
        console.error('Erro ao verificar produtos com estoque baixo:', error);
      }
    };

    checkLowStock();
    
    // Atualizar quando houver mudanças no estoque
    const channel = supabase
      .channel('mobile-stock-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          checkLowStock();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t border-border">
      <nav className="flex">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== "/" && location.pathname.startsWith(item.href));
          
          // Adicionar indicador de alerta para Estoque
          const showAlert = item.href === "/inventory" && hasLowStock;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-3 relative",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
              
              {showAlert && (
                <span className="absolute top-2 right-1/4 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
