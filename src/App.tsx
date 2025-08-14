import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Inventory from "./pages/Inventory";
import Checkout from "./pages/Checkout";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import SalesHistory from "./pages/SalesHistory";
import SaleDetails from "./pages/SaleDetails";
import CreditNotes from "./pages/CreditNotes";
import ScanProducts from "./pages/ScanProducts";
import NotFound from "./pages/NotFound";
import ListaVozContinua from "./pages/ListaVozContinua";
import VoiceToCart from "./pages/VoiceToCart";
import ExpertaAI from "./pages/ExpertaAI";
import Expenses from "./pages/Expenses";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import Suggestions from "./pages/Suggestions";
import MeatImport from "./pages/MeatImport";
import Treinamento from "./pages/Treinamento";
import ExpertaGo from "./pages/ExpertaGo";

import ExpertaGoDashboard from "./pages/ExpertaGoDashboard";
import ExpertaGoInventory from "./pages/ExpertaGoInventory";
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

const App = () => {
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
                  {/* Rota pública */}
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Nova rota para alteração de senha */}
                  <Route path="/change-password" element={<PasswordChangeRoute />} />
                  
                  <Route path="/" element={<Landing />} />
                  <Route path="/como-funciona" element={<ComoFunciona />} />
                  <Route path="/beneficios" element={<Beneficios />} />
                  <Route path="/tecnologia" element={<Tecnologia />} />
                  <Route path="/para-quem" element={<ParaQuem />} />
                  <Route path="/equipa" element={<Equipa />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/legal-notice" element={<LegalNotice />} />
                  
                  {/* Rotas protegidas - apenas Experta Go */}
                  <Route element={<ProtectedRoute />}>
                    
                    <Route path="/experta-go" element={<ExpertaGo />} />
                    
                    <Route path="/experta-go/dashboard" element={<ExpertaGoDashboard />} />
                    <Route path="/experta-go/inventory" element={<ExpertaGoInventory />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  
                  {/* Rota para página não encontrada */}
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
