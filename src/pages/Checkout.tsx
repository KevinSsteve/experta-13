import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { 
  formatCurrency, 
  calculateChange, 
  saveSaleToStorage, 
  updateProductStockAfterSale 
} from '@/lib/utils';
import { downloadReceipt, printReceipt, shareReceipt } from '@/lib/utils/receipt';
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
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Check, Trash2, Calculator, Printer, Download, Share2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, generateSalesReport } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ExtendedProfile } from '@/types/profile';

const checkoutSchema = z.object({
  customerName: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email({ message: "Email inválido" }).optional(),
  customerNIF: z.string()
    .min(9, { message: "NIF deve ter 9 dígitos" })
    .max(14, { message: "NIF não pode exceder 14 dígitos" })
    .optional(),
  notes: z.string().optional(),
  amountPaid: z.coerce.number().min(0, { 
    message: "O valor pago deve ser positivo" 
  }),
  currency: z.enum(['AKZ', 'USD', 'EUR']).default('AKZ')
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [change, setChange] = useState(0);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<ExtendedProfile | undefined>(undefined);
  const navigate = useNavigate();
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      currency: 'AKZ',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerNIF: '',
      notes: '',
      amountPaid: 0,
    },
  });
  
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (state.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', state.user.id)
          .single();
          
        if (data && !error) {
          setCompanyProfile(data as ExtendedProfile);
        }
      }
    };
    
    fetchCompanyProfile();
  }, [state.user]);
  
  useEffect(() => {
    form.clearErrors('amountPaid');
    const total = getTotalPrice();
    form.setValue('amountPaid', total);
    setChange(0);
  }, [state.items, getTotalPrice, form]);
  
  const handleAmountPaidChange = (value: string) => {
    const amountPaid = parseFloat(value) || 0;
    const total = getTotalPrice();
    setChange(calculateChange(total, amountPaid));
    form.setValue('amountPaid', amountPaid);
  };
  
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
    
    const saleData = {
      customer: {
        name: data.customerName,
        phone: data.customerPhone || '',
        email: data.customerEmail || '',
        nif: data.customerNIF || '',
      },
      total: getTotalPrice(),
      amountPaid: data.amountPaid,
      change: change,
      notes: data.notes || '',
      items: state.items,
      paymentMethod: 'Dinheiro',
    };
    
    try {
      saveSaleToStorage(saleData);
      
      if (state.user) {
        console.log('Salvando venda no Supabase para o usuário:', state.user.id);
        
        const simplifiedItems = state.items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category
        }));
        
        const supabaseSaleData = {
          user_id: state.user.id,
          total: saleData.total,
          amount_paid: saleData.amountPaid,
          change: saleData.change,
          items: {
            customer: {
              name: saleData.customer.name,
              phone: saleData.customer.phone,
              email: saleData.customer.email,
              nif: saleData.customer.nif
            },
            paymentMethod: saleData.paymentMethod,
            notes: saleData.notes,
            products: simplifiedItems
          }
        };
        
        const { error } = await supabase
          .from('sales')
          .insert(supabaseSaleData);
          
        if (error) {
          console.error('Erro ao salvar venda no Supabase:', error);
          toast.error('Erro ao salvar venda. Os dados foram salvos localmente.');
        } else {
          console.log('Venda salva com sucesso no Supabase');
          
          try {
            await generateSalesReport(state.user.id, 30);
            console.log('Relatório financeiro atualizado após a venda');
          } catch (reportError) {
            console.error('Erro ao gerar relatório financeiro:', reportError);
          }
        }
      } else {
        console.warn('Usuário não autenticado, venda salva apenas localmente');
      }
      
      await updateProductStockAfterSale(state.items);
      
      toast.success('Venda finalizada com sucesso!');
      
      setCompletedSale(saleData);
      
    } catch (error) {
      toast.error('Erro ao finalizar a venda. Por favor, tente novamente.');
      console.error('Erro ao salvar venda:', error);
      setIsSubmitting(false);
    }
  };
  
  const handlePrintReceipt = () => {
    if (!completedSale) return;
    
    try {
      printReceipt(completedSale, companyProfile);
      toast.success('Recibo enviado para impressão');
    } catch (error) {
      console.error('Erro ao imprimir recibo:', error);
      toast.error('Erro ao imprimir recibo');
    }
  };
  
  const handleDownloadReceipt = () => {
    if (!completedSale) return;
    
    try {
      downloadReceipt(completedSale, companyProfile);
      toast.success('Recibo baixado com sucesso');
    } catch (error) {
      console.error('Erro ao baixar recibo:', error);
      toast.error('Erro ao baixar recibo');
    }
  };
  
  const handleShareReceipt = async () => {
    if (!completedSale) return;
    
    try {
      const shared = await shareReceipt(completedSale, companyProfile);
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
  
  const finishAndNavigate = (to: string = '/dashboard') => {
    clearCart();
    form.reset();
    navigate(to);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Finalizar Venda</h1>
            <p className="text-muted-foreground">Revise o carrinho e complete a venda.</p>
          </div>
          
          {completedSale ? (
            <Card>
              <CardHeader>
                <CardTitle>Venda Finalizada</CardTitle>
                <CardDescription>
                  A venda foi concluída com sucesso
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center mb-4">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <h3 className="font-medium text-green-800 dark:text-green-300">
                        Pagamento de {formatCurrency(completedSale.total)} concluído!
                      </h3>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                      O seu recibo está pronto. Você pode imprimir, baixar ou compartilhar usando as opções abaixo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handlePrintReceipt}
                        className="flex-1"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir Recibo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownloadReceipt}
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </Button>
                      <Button
                        onClick={handleShareReceipt}
                        className="flex-1"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => finishAndNavigate('/dashboard')}
                      className="flex-1"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Ver Dashboard
                    </Button>
                    <Button 
                      onClick={() => finishAndNavigate('/resultados')}
                      className="flex-1"
                    >
                      Ver Resultados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                              {item.product.image && (
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
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
                        name="customerNIF"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NIF do Cliente (opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Digite o NIF do cliente" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
