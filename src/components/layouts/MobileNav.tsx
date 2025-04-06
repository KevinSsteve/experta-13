
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, ShoppingBasket, Package, ShoppingCart, BarChart3 } from "lucide-react";

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Produtos", href: "/products", icon: ShoppingBasket },
  { name: "Estoque", href: "/inventory", icon: Package },
  { name: "Checkout", href: "/checkout", icon: ShoppingCart },
];

export function MobileNav() {
  const location = useLocation();
  
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t border-border">
      <nav className="flex">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== "/" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-3",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
