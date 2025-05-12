
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart, Bell, Moon, Sun, AlertTriangle, User, LogOut, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  toggleSidebar: () => void;
}

export function TopBar({ toggleSidebar }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { openCart, getTotalItems } = useCart();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const totalItems = getTotalItems();
  const [alertCount] = useState(1);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-[#094d91] text-white backdrop-blur border-b border-border overflow-x-hidden">
      <div className="px-2 sm:px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden mr-2 text-white hover:bg-[#094d91]/80" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className="flex flex-col items-start ml-2">
              <span className="text-xl font-bold font-poppins tracking-wide bg-gradient-to-r from-white to-[#28c7c0] bg-clip-text text-transparent">
                Experta
              </span>
              <span className="text-xs text-white/80">v1.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-[#094d91]/80">
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#28c7c0] text-white">
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
            className="text-white hover:bg-[#094d91]/80"
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
              className="relative text-white hover:bg-[#094d91]/80"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#28c7c0]">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="ml-2 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
