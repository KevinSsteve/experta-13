
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart, Bell, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  toggleSidebar: () => void;
}

export function TopBar({ toggleSidebar }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { openCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur border-b border-border overflow-x-hidden">
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
          <div className="lg:hidden flex items-center">
            <img 
              src="/logo.png" 
              alt="Conta Comigo" 
              className={`h-8 ${theme === 'dark' ? 'invert' : ''} transition-all`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
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
