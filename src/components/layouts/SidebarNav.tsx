
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  BarChart4,
  ShoppingCart,
  Package,
  Store,
  Settings,
  LogOut,
  Home,
  User,
  Receipt,
} from "lucide-react";

const navItems = [
  {
    title: "Início",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart4,
  },
  {
    title: "Produtos",
    href: "/products",
    icon: Package,
  },
  {
    title: "Checkout",
    href: "/checkout",
    icon: ShoppingCart,
  },
  {
    title: "Inventário",
    href: "/inventory",
    icon: Store,
  },
  {
    title: "Histórico de Vendas",
    href: "/sales-history",
    icon: Receipt,
  },
  {
    title: "Perfil",
    href: "/profile",
    icon: User,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export function SidebarNav() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="group flex h-screen w-full flex-col gap-4 bg-background p-2">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex h-14 items-center justify-center rounded-md bg-primary/10 px-4">
          <img 
            src="/logo.png" 
            alt="Conta Comigo" 
            className={`h-8 ${theme === 'dark' ? 'invert' : ''} transition-all`}
          />
        </div>
        
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <Button
        variant="outline"
        className="flex w-full items-center justify-start gap-3"
        onClick={signOut}
      >
        <LogOut className="h-5 w-5" />
        <span className="text-sm font-medium">Sair</span>
      </Button>
    </div>
  );
}
