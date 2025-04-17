
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart, Bell, Moon, Sun, AlertTriangle, LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  toggleSidebar: () => void;
}

export function TopBar({ toggleSidebar }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { openCart, getTotalItems } = useCart();
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const totalItems = getTotalItems();
  const [alertCount] = useState(2); // Aumentado para refletir novas alertas

  // Verifica se é necessário trocar a senha (primeiro acesso)
  const needsPasswordChange = profile?.needs_password_change;

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

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
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Contascom" 
              className={`h-8 ${theme === 'dark' ? 'invert' : ''} transition-all`}
            />
            <div className="hidden sm:flex flex-col ml-2">
              <span className="text-sm font-medium">Contascom</span>
              <span className="text-xs text-muted-foreground">Certificado AGT #00345</span>
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
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-sm">Aguardando certificação AGT</span>
                  <span className="text-xs text-muted-foreground">Requisito para conformidade</span>
                </div>
              </DropdownMenuItem>
              
              {needsPasswordChange && (
                <DropdownMenuItem className="flex items-center cursor-pointer" onClick={handleProfileClick}>
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Troca de senha obrigatória</span>
                    <span className="text-xs text-muted-foreground">Requisito de segurança AGT</span>
                  </div>
                </DropdownMenuItem>
              )}
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
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="rounded-full bg-primary/10 flex items-center justify-center h-full w-full">
                    <span className="text-primary font-medium text-sm">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{profile?.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email || user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                  {needsPasswordChange && (
                    <Badge variant="destructive" className="ml-auto">
                      !
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {needsPasswordChange && (
        <div className="bg-destructive/15 p-2 text-center">
          <span className="text-sm font-semibold text-destructive">
            Atenção: Troca de senha obrigatória para conformidade AGT. 
            <Button 
              variant="link" 
              className="text-destructive font-semibold p-0 h-auto ml-1" 
              onClick={handleProfileClick}
            >
              Atualizar agora
            </Button>
          </span>
        </div>
      )}
    </header>
  );
}
