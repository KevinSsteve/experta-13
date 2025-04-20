import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart, Bell, Moon, Sun, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  toggleSidebar: () => void;
}

export function TopBar({ toggleSidebar }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { openCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [alertCount] = useState(1);

  return (
    <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border overflow-x-hidden">
      <div className="px-2 sm:px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden mr-2" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Contascom" 
              className={`h-8 ${theme === 'dark' ? 'invert' : ''} transition-all`}
            />
            <div className="hidden sm:flex flex-col ml-2">
              <span className="text-sm font-medium">Contascom</span>
              <span className="text-xs text-muted-foreground">v1.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {alertCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-sm">Aguardando certificação AGT</span>
                  <span className="text-xs text-muted-foreground">Requisito para conformidade</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={openCart}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
          <div className="ml-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">CC</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
