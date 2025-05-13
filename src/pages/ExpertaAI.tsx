
import { MainLayout } from "@/components/layouts/MainLayout";
import { ExpertaAIAssistant } from "@/components/voice-orders/ExpertaAIAssistant";
import { ShoppingCart } from "@/components/shop/ShoppingCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart as CartIcon, History, ArrowLeft, Mic } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { Card, CardContent } from "@/components/ui/card";

export default function ExpertaAI() {
  const { user, isLoading: authLoading } = useAuth();
  const { openCart, getTotalItems } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <MainLayout>
      <ShoppingCart />
      <div className={`mx-auto py-6 px-3 ${isMobile ? 'w-full' : 'max-w-2xl'} space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Mic className="h-5 w-5 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold">Experta AI</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/listas-voz")}
            >
              <History className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Listas de voz</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={openCart}
              className="relative"
            >
              <CartIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Carrinho</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm">
              <strong>Experta AI</strong> - Seu assistente de voz inteligente para pequenos comerciantes.
              Use comandos de voz para adicionar produtos, registrar vendas, despesas e verificar estoque.
            </p>
          </CardContent>
        </Card>
        
        <ResponsiveWrapper>
          <ExpertaAIAssistant />
        </ResponsiveWrapper>
      </div>
    </MainLayout>
  );
}
