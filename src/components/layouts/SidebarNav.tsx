
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  Store,
  BarChart3
} from "lucide-react";

export function SidebarNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "PDV",
      href: "/",
      icon: Store,
    },
    {
      title: "Checkout",
      href: "/checkout",
      icon: ShoppingBag,
    },
    {
      title: "Produtos",
      href: "/products",
      icon: Package,
    },
    {
      title: "Relatórios",
      href: "/reports",
      icon: BarChart3,
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col h-full px-2 py-8">
      <div className="flex items-center justify-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-sidebar-foreground">SisLoja</h1>
      </div>
      <nav className="space-y-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent",
              pathname === item.href ? "bg-sidebar-accent" : "transparent"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
