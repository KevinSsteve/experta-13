
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { formatCurrency } from '@/lib/utils';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Check, Trash2 } from 'lucide-react';

interface CheckoutFormValues {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod: 'credit' | 'debit' | 'cash' | 'pix';
  notes?: string;
}

const Checkout = () => {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form definition
  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      paymentMethod: 'credit',
      notes: '',
    },
  });
  
  // Submit handler
  const onSubmit = (data: CheckoutFormValues) => {
    if (state.items.length === 0) {
      toast.error('O carrinho está vazio. Adicione produtos para finalizar a compra.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulating an API call
    setTimeout(() => {
      console.log('Checkout data:', {
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
        },
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        items: state.items,
        total: getTotalPrice(),
      });
      
      // Show success message
      toast.success('Venda finalizada com sucesso!');
      
      // Clear the cart and reset the form
      clearCart();
      form.reset();
      
      setIsSubmitting(false);
    }, 1500);
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
                      rules={{ required: 'Nome do cliente é obrigatório' }}
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
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      rules={{ required: 'Forma de pagamento é obrigatória' }}
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Forma de Pagamento</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="credit" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Cartão de Crédito
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="debit" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Cartão de Débito
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="pix" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  PIX
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="cash" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Dinheiro
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
