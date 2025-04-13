
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { X, Trash, Plus, Minus, ShoppingBag, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { downloadReceipt, printReceipt, shareReceipt } from '@/lib/utils/receipt';

export function ShoppingCart() {
  const { state, closeCart, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [mounted, setMounted] = useState(false);
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handlePrintReceipt = () => {
    if (!lastSale) return;
    
    try {
      printReceipt(lastSale);
      toast.success('Recibo enviado para impressão');
    } catch (error) {
      console.error('Erro ao imprimir recibo:', error);
      toast.error('Erro ao imprimir recibo');
    }
  };

  const handleShareReceipt = async () => {
    if (!lastSale) return;
    
    try {
      const shared = await shareReceipt(lastSale);
      if (shared) {
        toast.success('Recibo compartilhado com sucesso');
      } else {
        toast.info('O recibo foi baixado porque o compartilhamento não está disponível');
      }
    } catch (error) {
      console.error('Erro ao compartilhar recibo:', error);
      toast.error('Erro ao compartilhar recibo');
    }
  };

  const handleDownloadReceipt = () => {
    if (!lastSale) return;
    
    try {
      downloadReceipt(lastSale);
      toast.success('Recibo baixado com sucesso');
    } catch (error) {
      console.error('Erro ao baixar recibo:', error);
      toast.error('Erro ao baixar recibo');
    }
  };

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

  useEffect(() => {
    const checkLastSale = () => {
      try {
        const storedSales = localStorage.getItem('sales');
        if (storedSales) {
          const sales = JSON.parse(storedSales);
          if (Array.isArray(sales) && sales.length > 0) {
            const lastSaleData = sales[sales.length - 1];
            const saleTime = new Date(lastSaleData.date).getTime();
            const currentTime = new Date().getTime();
            const timeDiff = (currentTime - saleTime) / 1000 / 60;
            
            if (timeDiff < 5) { // Aumentamos para 5 minutos
              setLastSale(lastSaleData);
              setShowReceiptOptions(true);
            } else {
              setShowReceiptOptions(false);
              setLastSale(null);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar última venda:', error);
      }
    };
    
    if (state.isOpen) {
      checkLastSale();
    }
  }, [state.isOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {state.isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={closeCart}
        />
      )}
      
      <div 
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${
          state.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <h2 className="text-lg font-medium">Carrinho de Compras</h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-8rem)] overflow-y-auto p-4">
          {showReceiptOptions && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Sua compra foi finalizada com sucesso!
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs" 
                  onClick={handlePrintReceipt}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Imprimir
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs" 
                  onClick={handleDownloadReceipt}
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-2 text-xs" 
                onClick={handleShareReceipt}
              >
                <Share2 className="h-3 w-3 mr-1" />
                Compartilhar
              </Button>
            </div>
          )}

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
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
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
        
        <div className="border-t border-border p-4">
          {state.items.length > 0 ? (
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
          ) : (
            <Button className="w-full" onClick={closeCart}>
              Continuar comprando
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
