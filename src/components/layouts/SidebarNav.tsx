
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, ShoppingBasket, Package, ShoppingCart, 
  BarChart3, Settings, LogOut 
} from "lucide-react";

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Produtos", href: "/products", icon: ShoppingBasket },
  { name: "Estoque", href: "/inventory", icon: Package },
  { name: "Checkout", href: "/checkout", icon: ShoppingCart },
];

const bottomNavigation = [
  { name: "Configurações", href: "/settings", icon: Settings },
  { name: "Sair", href: "#", icon: LogOut },
];

export function SidebarNav() {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-full pb-4 pt-5">
      <div className="px-4 pb-4 mb-6">
        <Link to="/" className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-semibold text-xl">M</span>
          </div>
          <span className="ml-3 text-xl font-semibold text-sidebar-foreground">Moloja</span>
        </Link>
      </div>
      
      <div className="flex flex-col flex-1 px-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== "/" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto px-2 pt-2 border-t border-sidebar-border">
        {bottomNavigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center px-3 py-2 mt-1 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <item.icon className="h-5 w-5 shrink-0 mr-3" />
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
