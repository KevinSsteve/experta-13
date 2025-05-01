
import { useState, ReactNode } from "react";
import SidebarNav from "./SidebarNav";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { ShoppingCart } from "@/components/shop/ShoppingCart";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar para desktop */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full pt-16"> {/* Adicionado pt-16 para compensar o header */}
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="absolute top-4 right-4 p-1 text-sidebar-foreground hover:bg-sidebar-accent rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <SidebarNav />
        </div>
      </aside>
      
      {/* Overlay para fechar o sidebar em dispositivos móveis */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm" 
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <TopBar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-y-auto overflow-x-hidden pb-20 lg:pb-6 pt-16"> {/* Adicionado pt-16 */}
          {children}
        </main>
        
        {isMobile && <MobileNav />}
      </div>
      
      {/* Carrinho de compras */}
      <ShoppingCart />
    </div>
  );
}
