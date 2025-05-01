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
import Expenses from "./pages/Expenses";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import Suggestions from "./pages/Suggestions";
import ModuleSelection from "./pages/ModuleSelection";

// Butcher Module Pages
import ButcherDashboard from "./pages/butcher/Dashboard";
import ButcherProducts from "./pages/butcher/Products";
import ButcherSales from "./pages/butcher/Sales";

const App = () => {
  const ModuleRouter = () => {
    const { isLoading } = useAuth();
    const selectedModule = localStorage.getItem("userModule");

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // If no module is selected, go to module selection
    if (!selectedModule) {
      return <Navigate to="/select-module" replace />;
    }

    // Otherwise, go to the appropriate dashboard based on the module
    if (selectedModule === 'butcher') {
      return <Navigate to="/butcher/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  };

  const PasswordChangeRoute = () => {
    const { mustChangePassword, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    return mustChangePassword ? (
      <ForcePasswordChange />
    ) : (
      <Navigate to="/dashboard" replace />
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

                  {/* Nova rota para seleção de módulo */}
                  <Route path="/select-module" element={<ModuleSelection />} />
                  
                  {/* Root - redireciona para o módulo apropriado */}
                  <Route path="/" element={<ModuleRouter />} />
                  
                  {/* Rotas protegidas - Módulo de Supermercado */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/suggestions" element={<Suggestions />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/sales-history" element={<SalesHistory />} />
                    <Route path="/sales-history/:id" element={<SaleDetails />} />
                    <Route path="/credit-notes" element={<CreditNotes />} />
                    <Route path="/scan" element={<ScanProducts />} />
                    <Route path="/listas-voz" element={<ListaVozContinua />} />
                    <Route path="/pedido-voz" element={<VoiceToCart />} />
                    <Route path="/expenses" element={<Expenses />} />
                  </Route>

                  {/* Rotas protegidas - Módulo de Talho */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/butcher/dashboard" element={<ButcherDashboard />} />
                    <Route path="/butcher/products" element={<ButcherProducts />} />
                    <Route path="/butcher/sales" element={<ButcherSales />} />
                    <Route path="/butcher/inventory" element={<ButcherDashboard />} /> {/* Placeholder */}
                    <Route path="/butcher/recipes" element={<ButcherDashboard />} /> {/* Placeholder */}
                    <Route path="/butcher/finances" element={<ButcherDashboard />} /> {/* Placeholder */}
                    <Route path="/butcher/history" element={<ButcherDashboard />} /> {/* Placeholder */}
                    <Route path="/butcher/settings" element={<Settings />} />
                  </Route>
                  
                  {/* Rota para página não encontrada */}
                  <Route path="*" element={<NotFound />} />
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
