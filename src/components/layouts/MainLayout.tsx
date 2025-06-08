
import { useState, ReactNode } from "react";
import SidebarNav from "./SidebarNav";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

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
    <div className="flex min-h-screen w-full overflow-x-hidden bg-black">
      {/* Sidebar para desktop */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-black border-r border-white/10 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full pt-16">
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-xl transition-all duration-300"
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
          className="fixed inset-0 z-20 bg-black/80 backdrop-blur-sm" 
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 overflow-x-hidden bg-black">
        <TopBar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
