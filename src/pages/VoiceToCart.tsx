
import { MainLayout } from "@/components/layouts/MainLayout";
import { VoiceToCartCreator } from "@/components/voice-orders/VoiceToCartCreator";
import { ShoppingCart } from "@/components/shop/ShoppingCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart as CartIcon, History, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";

export default function VoiceToCart() {
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
            <h1 className="text-xl sm:text-2xl font-bold">Pedido por Voz</h1>
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
        
        <ResponsiveWrapper>
          <VoiceToCartCreator />
        </ResponsiveWrapper>
      </div>
    </MainLayout>
  );
}
