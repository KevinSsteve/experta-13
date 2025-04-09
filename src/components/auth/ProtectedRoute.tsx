
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  
  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-2">Verificando autenticação...</p>
      </div>
    );
  }
  
  // Redireciona para a página de login se não estiver autenticado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Renderiza o conteúdo da rota protegida
  return <Outlet />;
}
