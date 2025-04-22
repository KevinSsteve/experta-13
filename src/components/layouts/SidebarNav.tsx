
import { NavLink } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  ClipboardList,
  Receipt,
  Settings,
  ScanLine,
  FileText,
  List,
  BadgeDollarSign,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Vender",
    href: "/checkout",
    icon: <ShoppingCart className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Produtos",
    href: "/products",
    icon: <Package className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Inventário",
    href: "/inventory",
    icon: <BarChart3 className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Histórico de Vendas",
    href: "/sales-history",
    icon: <Receipt className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Despesas",
    href: "/expenses",
    icon: <BadgeDollarSign className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Notas de Crédito",
    href: "/credit-notes",
    icon: <FileText className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Scanner",
    href: "/scan",
    icon: <ScanLine className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
    variant: "ghost" as const,
  },
  {
    title: "Listas por Voz",
    href: "/listas-voz",
    icon: <List className="h-5 w-5" />,
    variant: "ghost" as const,
  },
];

export function SidebarNav() {
  return (
    <div className="h-screen border-r pt-16">
      <div className="h-full flex-col flex">
        <div className="flex-1">
          <ScrollArea className="h-full">
            <div className="py-2">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-4 py-2",
                      isActive ? "bg-muted" : "hover:bg-muted/50"
                    )
                  }
                >
                  {({ isActive }) => (
                    <Button
                      variant={item.variant}
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        isActive
                          ? "bg-secondary font-medium text-secondary-foreground hover:bg-secondary/80"
                          : ""
                      )}
                    >
                      {item.icon}
                      {item.title}
                    </Button>
                  )}
                </NavLink>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
