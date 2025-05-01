import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBasket,
  Package,
  Settings,
  CreditCard,
  User,
  History,
  FileText,
  ReceiptText,
  Mic,
  ScanLine,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

interface SideNavigationProps {
  className?: string;
  isCollapsed?: boolean;
}

export function SideNavigation({ className, isCollapsed }: SideNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  
  // A função para navegar para a rota especificada
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  // Verificar se um item de navegação está ativo
  const isActive = (route: string) => {
    return location.pathname === route || 
           (route !== '/' && location.pathname.startsWith(route));
  };

  const isManager = profile?.role === 'gerente' || profile?.role === 'admin';

  return (
    <div className={cn("flex flex-col h-full py-2 px-1", className)}>
      <ScrollArea className="flex-1">
        <div className={cn("flex flex-col gap-1", isCollapsed ? "items-center" : "px-1")}>
          <Button
            variant={isActive("/dashboard") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Dashboard</span>}
          </Button>

          {/* Separator */}
          {!isCollapsed && <Separator className="my-1" />}

          {/* Vendas */}
          <Button
            variant={isActive("/checkout") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/checkout")}
          >
            <ShoppingBasket className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Nova Venda</span>}
          </Button>

          <Button
            variant={isActive("/sales-history") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/sales-history")}
          >
            <History className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Histórico</span>}
          </Button>

          <Button
            variant={isActive("/credit-notes") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/credit-notes")}
          >
            <ReceiptText className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Notas de Crédito</span>}
          </Button>

          {/* Separator */}
          {!isCollapsed && <Separator className="my-1" />}

          {/* Produtos */}
          <Button
            variant={isActive("/products") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/products")}
          >
            <Package className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Produtos</span>}
          </Button>

          <Button
            variant={isActive("/inventory") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/inventory")}
          >
            <FileText className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Inventário</span>}
          </Button>

          {/* Separator */}
          {!isCollapsed && <Separator className="my-1" />}

          {/* Ferramentas */}
          <Button
            variant={isActive("/scan") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/scan")}
          >
            <ScanLine className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Scanner</span>}
          </Button>

          <Button
            variant={isActive("/listas-voz") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/listas-voz")}
          >
            <List className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Lista por Voz</span>}
          </Button>

          <Button
            variant={isActive("/pedido-voz") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/pedido-voz")}
          >
            <Mic className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Pedido por Voz</span>}
          </Button>

          {/* Separator for admin-only sections */}
          {isManager && !isCollapsed && <Separator className="my-1" />}

          {/* Admin-only sections */}
          {isManager && (
            <Button
              variant={isActive("/expenses") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-0"
              )}
              onClick={() => handleNavigate("/expenses")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>Despesas</span>}
            </Button>
          )}

          {/* Separator */}
          {!isCollapsed && <Separator className="my-1" />}

          {/* User */}
          <Button
            variant={isActive("/profile") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/profile")}
          >
            <User className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Perfil</span>}
          </Button>

          <Button
            variant={isActive("/settings") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => handleNavigate("/settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Configurações</span>}
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
