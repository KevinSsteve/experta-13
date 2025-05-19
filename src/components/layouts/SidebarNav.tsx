
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  LayoutDashboard,
  Package,
  Settings,
  User,
  ListChecks,
  Receipt,
  Barcode,
  Headphones,
  Coins,
  Sparkles,
  Mic,
  Brain,
  Book
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const SidebarNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      title: "Início",
      href: "/",
      icon: Home,
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Produtos",
      href: "/products",
      icon: Package,
    },
    {
      title: "Sugestões",
      href: "/suggestions",
      icon: Sparkles,
    },
    {
      title: "Estoque",
      href: "/inventory",
      icon: ListChecks,
    },
    {
      title: "Vendas",
      href: "/sales-history",
      icon: Receipt,
    },
    {
      title: "Notas de Crédito",
      href: "/credit-notes",
      icon: Coins,
    },
    {
      title: "Scanear Produtos",
      href: "/scan",
      icon: Barcode,
    },
    {
      title: "Lista por Voz",
      href: "/listas-voz",
      icon: Headphones,
    },
    {
      title: "Pedido por Voz",
      href: "/pedido-voz",
      icon: Mic,
    },
    {
      title: "Experta AI",
      href: "/experta-ai",
      icon: Brain,
    },
    {
      title: "Treinamento",
      href: "/treinamento",
      icon: Book,
    },
    {
      title: "Despesas",
      href: "/expenses",
      icon: Coins,
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "Perfil",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <div className="flex flex-col h-full px-3 py-4 border-r bg-background">
      <div className="mb-6 px-3">
        <span className="text-2xl font-bold font-poppins tracking-wide bg-gradient-to-r from-[#094d91] to-experta-secondary bg-clip-text text-transparent">
          Experta
        </span>
      </div>
      
      <nav className="flex flex-col flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-[#094d91]/10 hover:text-[#094d91] ${
              location.pathname === item.href
                ? "bg-[#094d91]/10 text-[#094d91]"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.title}
          </Link>
        ))}
        <Separator className="my-3" />
        {user && user.email === "admin@example.com" && (
          <a
            href="https://supabase.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-[#094d91]/10 hover:text-[#094d91]"
          >
            <LayoutDashboard className="w-4 h-4" />
            Supabase
          </a>
        )}
      </nav>
    </div>
  );
}

export default SidebarNav;
