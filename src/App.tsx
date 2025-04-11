
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
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
import Demonstracoes from "./pages/Demonstracoes";
import NotFound from "./pages/NotFound";

const App = () => (
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
                
                {/* Rotas protegidas */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/sales-history" element={<SalesHistory />} />
                  <Route path="/sales-history/:id" element={<SaleDetails />} />
                  <Route path="/demonstracoes" element={<Demonstracoes />} />
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

export default App;
