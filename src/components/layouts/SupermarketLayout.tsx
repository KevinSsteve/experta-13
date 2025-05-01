
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Store, ShoppingCart, Package, DollarSign, History, Settings, BarChart2, Tag, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SupermarketLayoutProps {
  children: React.ReactNode;
}

export const SupermarketLayout = ({ children }: SupermarketLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        variant: "destructive",
        title: "Erro ao desconectar",
        description: "Ocorreu um erro ao tentar encerrar sua sessão.",
      });
    }
  };

  const navigation = [
    { name: "Dashboard", icon: BarChart2, href: "/supermarket/dashboard" },
    { name: "Produtos", icon: Package, href: "/supermarket/products" },
    { name: "Vendas", icon: ShoppingCart, href: "/supermarket/sales" },
    { name: "Promoções", icon: Tag, href: "/supermarket/promotions" },
    { name: "Estoque", icon: Package, href: "/supermarket/inventory" },
    { name: "Financeiro", icon: DollarSign, href: "/supermarket/finances" },
    { name: "Histórico", icon: History, href: "/supermarket/history" },
    { name: "Configurações", icon: Settings, href: "/supermarket/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar para desktop */}
      <aside className={cn(
        "bg-card fixed inset-y-0 z-50 flex w-72 flex-col border-r transition-all duration-300 ease-in-out",
        isMobile ? (isSidebarOpen ? "left-0" : "left-[-100%]") : "left-0"
      )}>
        <div className="flex h-16 items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Supermercado Digital</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={location.pathname === item.href ? "default" : "ghost"}
                className={cn(
                  "justify-start",
                  location.pathname === item.href
                    ? "bg-primary-foreground text-primary"
                    : ""
                )}
                onClick={() => {
                  navigate(item.href);
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {user?.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Supermercado Digital
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500" 
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Navbar */}
      {isMobile && (
        <div className="fixed inset-x-0 top-0 h-16 z-30 bg-card border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Supermercado</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="sr-only">Menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/80 transition-opacity",
            isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div
        className={cn(
          "flex-1",
          isMobile ? "pt-16" : "pl-72"
        )}
      >
        <main className="container py-6">
          {children}
        </main>
      </div>
    </div>
  );
};
