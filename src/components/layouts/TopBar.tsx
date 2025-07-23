
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DailyProfitDisplay } from "@/components/experta-go/DailyProfitDisplay";
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
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const goToHome = () => {
    navigate('/experta-go');
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border overflow-x-hidden">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden mr-3 text-foreground hover:bg-secondary" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <span 
              className="text-2xl font-bold tracking-ultra text-foreground cursor-pointer hover:text-foreground/80 transition-colors"
              onClick={goToHome}
            >
              experta
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Exibir lucro diário apenas no Experta Go - visível em todos os dispositivos */}
          {window.location.pathname.includes('/experta-go') && (
            <DailyProfitDisplay />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:bg-secondary"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-secondary border border-border backdrop-blur-[10px] flex items-center justify-center transition-all duration-300 hover:bg-secondary/80">
                  <span className="text-foreground font-light text-sm tracking-wide">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover backdrop-blur-xl border border-border">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer text-popover-foreground hover:bg-accent">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer text-popover-foreground hover:bg-accent">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:bg-destructive/10">
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
