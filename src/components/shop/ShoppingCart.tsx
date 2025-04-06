
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { X, Trash, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function ShoppingCart() {
  const { state, closeCart, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  // Adiciona ou remove a classe que esconde o overflow quando o carrinho está aberto
  useEffect(() => {
    if (mounted) {
      if (state.isOpen) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [state.isOpen, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {state.isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={closeCart}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${
          state.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <h2 className="text-lg font-medium">Carrinho de Compras</h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Body */}
        <div className="flex flex-col h-[calc(100%-8rem)] overflow-y-auto p-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mb-4 opacity-30" />
              <p className="mb-2">Seu carrinho está vazio</p>
              <p className="text-sm">Adicione produtos para continuar suas compras</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex gap-4 py-2">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">{item.product.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0 text-muted-foreground"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="mt-1 text-sm text-muted-foreground">{item.product.category}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 rounded-r-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 rounded-l-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-border p-4">
          {state.items.length > 0 && (
            <>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Subtotal</span>
                <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between mb-4">
                <span>Total</span>
                <span className="font-medium text-lg">{formatCurrency(getTotalPrice())}</span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={clearCart}>
                  Limpar
                </Button>
                <Button className="flex-1" onClick={handleCheckout}>
                  Finalizar
                </Button>
              </div>
            </>
          )}
          
          {state.items.length === 0 && (
            <Button className="w-full" onClick={closeCart}>
              Continuar comprando
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
