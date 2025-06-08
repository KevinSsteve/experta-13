
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Settings } from "lucide-react";
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
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const goToHome = () => {
    navigate('/experta-go');
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/10 overflow-x-hidden">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden mr-3 text-white hover:bg-white/10" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <span 
              className="text-2xl font-bold tracking-ultra text-white cursor-pointer hover:text-white/80 transition-colors"
              onClick={goToHome}
            >
              experta
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-[10px] flex items-center justify-center transition-all duration-300 hover:bg-white/20">
                  <span className="text-white font-light text-sm tracking-wide">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-xl border border-white/10">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer text-white hover:bg-white/10">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer text-white hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:bg-red-500/10">
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
