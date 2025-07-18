
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  Package,
  Settings,
  User,
} from "lucide-react";

const SidebarNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/experta-go');
  };

  const menuItems = [
    {
      title: "experta",
      href: "/experta-go",
      icon: TrendingUp,
    },
    {
      title: "experta offline",
      href: "/experta-go/offline",
      icon: TrendingUp,
    },
    {
      title: "Dashboard",
      href: "/experta-go/dashboard", 
      icon: TrendingUp,
    },
    {
      title: "Produtos",
      href: "/experta-go/inventory",
      icon: Package,
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
    <div className="flex flex-col h-full px-4 py-6 bg-background border-r border-border">
      <div className="mb-8 px-2">
        <span 
          className="text-3xl font-bold tracking-ultra text-foreground cursor-pointer hover:text-foreground/80 transition-colors"
          onClick={goToHome}
        >
          experta
        </span>
      </div>
      
      <nav className="flex flex-col flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-light tracking-wide rounded-xl transition-all duration-300 hover:bg-secondary hover:-translate-y-0.5 ${
              location.pathname === item.href
                ? "bg-secondary text-primary border border-primary/30"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default SidebarNav;
