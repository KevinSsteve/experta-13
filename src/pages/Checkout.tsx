
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { 
  formatCurrency, 
  calculateChange, 
  saveSaleToStorage, 
  updateProductStockAfterSale,
  saveSaleToSupabase,
  isUserLoggedIn
} from '@/lib/utils';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Check, Trash2, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutFormValues {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  amountPaid: number;
}

const Checkout = () => {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [change, setChange] = useState(0);
  const navigate = useNavigate();
  
  // Form definition
  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
      amountPaid: 0,
    },
  });
  
  // Calculate change when amount paid changes
  const handleAmountPaidChange = (value: string) => {
    const amountPaid = parseFloat(value) || 0;
    const total = getTotalPrice();
    setChange(calculateChange(total, amountPaid));
    form.setValue('amountPaid', amountPaid);
  };
  
  // Submit handler
  const onSubmit = async (data: CheckoutFormValues) => {
    if (state.items.length === 0) {
      toast.error('O carrinho está vazio. Adicione produtos para finalizar a compra.');
      return;
    }
    
    if (data.amountPaid < getTotalPrice()) {
      toast.error('O valor pago é insuficiente para cobrir o total da compra.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Create sale record
    const saleData = {
      customer: {
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail,
      },
      total: getTotalPrice(),
      amountPaid: data.amountPaid,
      change: change,
      notes: data.notes,
      items: state.items.length,
      products: state.items,
      paymentMethod: 'Dinheiro',
    };
    
    try {
      // Salvar venda no localStorage
      saveSaleToStorage(saleData);
      
      // Salvar venda no Supabase se o usuário estiver logado
      const userLoggedIn = await isUserLoggedIn();
      if (userLoggedIn) {
        const savedToSupabase = await saveSaleToSupabase(saleData);
        if (savedToSupabase) {
          console.log('Venda salva com sucesso no Supabase!');
        }
      }
      
      // Update product stock
      await updateProductStockAfterSale(state.items);
      
      // Show success message
      toast.success('Venda finalizada com sucesso!');
      
      // Clear the cart and reset the form
      clearCart();
      form.reset();
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      toast.error('Erro ao finalizar a venda. Por favor, tente novamente.');
      console.error('Error saving sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Finalizar Venda</h1>
            <p className="text-muted-foreground">Revise o carrinho e complete a venda.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
                <CardDescription>
                  {state.items.length} {state.items.length === 1 ? 'item' : 'itens'} no carrinho
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {state.items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-lg font-medium">O carrinho está vazio</p>
                    <p className="text-muted-foreground mt-1">
                      Adicione produtos antes de finalizar a venda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.product.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.product.price * item.quantity)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number"
                              min="1"
                              max={item.product.stock}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(
                                item.product.id,
                                parseInt(e.target.value) || 1
                              )}
                              className="w-16 h-8 text-center"
                            />
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <Separator className="my-4" />
                
                <div className="space-y-1.5 w-full">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            {/* Checkout form */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da Venda</CardTitle>
                <CardDescription>
                  Complete as informações para finalizar a venda
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Cliente</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Digite o nome do cliente" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone (opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="(XX) XXXXX-XXXX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="email@exemplo.com" type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Pagamento e troco */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium flex items-center">
                        <Calculator className="mr-2 h-4 w-4" />
                        Pagamento
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="amountPaid"
                        rules={{ 
                          required: 'Valor pago é obrigatório',
                          min: {
                            value: getTotalPrice(),
                            message: 'O valor pago deve ser maior ou igual ao total',
                          }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Pago</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={getTotalPrice()} 
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => handleAmountPaidChange(e.target.value)}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>Troco:</span>
                        <span className="font-medium text-lg">{formatCurrency(change)}</span>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Digite observações sobre o pedido"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting || state.items.length === 0}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            Processando...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Check className="mr-2 h-4 w-4" />
                            Finalizar Venda
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
