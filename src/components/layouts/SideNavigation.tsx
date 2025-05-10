
import {
  Home,
  LayoutDashboard,
  Menu,
  ShoppingCart,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Database,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SideNavigationProps {
  isOpen: boolean;
}

export function SideNavigation({ isOpen }: SideNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(isOpen);

  useEffect(() => {
    setIsMenuOpen(isOpen);
  }, [isOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <aside
      className={`bg-secondary border-r h-screen fixed top-0 left-0 z-50 transition-transform ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      } ${isMobile ? "w-screen" : "w-64"}
       dark:bg-gray-900 dark:border-gray-800`}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="p-4">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="font-bold text-2xl">MiniComércio</span>
            </Link>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Navegação
            </h2>
            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                  location.pathname === "/" ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/inventory"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                  location.pathname === "/inventory"
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Inventário</span>
              </Link>
              <Link
                to="/products"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                  location.pathname === "/products"
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Produtos</span>
              </Link>
              <Link
                to="/customers"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                  location.pathname === "/customers"
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Clientes</span>
              </Link>
              <Link
                to="/suggestions"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                  location.pathname === "/suggestions"
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <Menu className="h-4 w-4" />
                <span>Sugestões</span>
              </Link>
            </div>
          </div>

          {/* Administração/Configuração - verificar se o usuário é admin */}
          {user?.email === "admin@example.com" && (
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Administração
              </h2>
              <div className="space-y-1">
                <Link
                  to="/meat-import"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  <Database className="h-4 w-4" />
                  <span>Importar Carnes</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium leading-none">
                    {profile?.name || user?.email?.split('@')[0] || "Usuário"}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {user?.email || ""}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuItem>
                <Link to="/settings" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                  navigate("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
