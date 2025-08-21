import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Páginas principais
import Auth from "./pages/Auth";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import ExpertaGo from "./pages/ExpertaGo";
import ExpertaGoDashboard from "./pages/ExpertaGoDashboard";
import ExpertaGoInventory from "./pages/ExpertaGoInventory";

// Páginas públicas
import Landing from "./pages/Landing";
import ComoFunciona from "./pages/ComoFunciona";
import Beneficios from "./pages/Beneficios";
import Tecnologia from "./pages/Tecnologia";
import ParaQuem from "./pages/ParaQuem";
import Equipa from "./pages/Equipa";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import LegalNotice from "./pages/LegalNotice";

// Rota para alteração de senha forçada
const PasswordChangeRoute = () => {
  const { mustChangePassword, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return mustChangePassword ? (
    <ForcePasswordChange />
  ) : (
    <Navigate to="/experta-go" replace />
  );
};

// Rota inicial dinâmica (decide onde cair ao abrir o site)
const AuthRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 👉 Logado → experta-go | Não logado → como-funciona
  return user ? <Navigate to="/experta-go" replace /> : <ComoFunciona />;
};

const App = () => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CartProvider>
                <Routes>
                  {/* Rota pública de autenticação */}
                  <Route path="/auth" element={<Auth />} />

                  {/* Alteração obrigatória de senha */}
                  <Route path="/change-password" element={<PasswordChangeRoute />} />

                  {/* Página inicial dinâmica */}
                  <Route path="/" element={<AuthRedirect />} />

                  {/* Outras páginas públicas */}
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/como-funciona" element={<ComoFunciona />} />
                  <Route path="/beneficios" element={<Beneficios />} />
                  <Route path="/tecnologia" element={<Tecnologia />} />
                  <Route path="/para-quem" element={<ParaQuem />} />
                  <Route path="/equipa" element={<Equipa />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/legal-notice" element={<LegalNotice />} />

                  {/* Rotas protegidas */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/experta-go" element={<ExpertaGo />} />
                    <Route path="/experta-go/dashboard" element={<ExpertaGoDashboard />} />
                    <Route path="/experta-go/inventory" element={<ExpertaGoInventory />} />
                  </Route>

                  {/* Fallback para qualquer rota inválida */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </CartProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;
