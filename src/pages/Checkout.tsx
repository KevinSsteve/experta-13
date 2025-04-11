
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Check, Trash2, Calculator, Printer, Download, Share2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, generateSalesReport } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ExtendedProfile } from '@/types/profile';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';

const checkoutSchema = z.object({
  customerName: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  customerPhone: z.string().optional(),
  amountPaid: z.coerce.number().min(0, { 
    message: "O valor pago deve ser positivo" 
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [change, setChange] = useState(0);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<ExtendedProfile | undefined>(undefined);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      amountPaid: 0,
    },
  });
  
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
        email: '',
        nif: '',
      },
      total: getTotalPrice(),
      amountPaid: data.amountPaid,
      change: change,
      notes: '',
      items: state.items,
      paymentMethod: 'Dinheiro',
    };
    
    try {
      saveSaleToStorage(saleData);
      
      if (user?.id) {
        await saveToSupabase(saleData, user.id);
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData.session?.user;
        
        if (sessionUser) {
          await saveToSupabase(saleData, sessionUser.id);
        } else {
          toast.warning('Usuário não autenticado. Venda salva apenas localmente.');
        }
      }
      
      await updateProductStockAfterSale(state.items);
      
      toast.success('Venda finalizada com sucesso!');
      
      setCompletedSale(saleData);
      
    } catch (error) {
      console.error('Erro ao finalizar a venda:', error);
      toast.error('Erro ao finalizar a venda. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  };
  
  const saveToSupabase = async (saleData: any, userId: string) => {
    try {
      const simplifiedItems = saleData.items.map((item: any) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: item.product.category
      }));
      
      const supabaseSaleData = {
        user_id: userId,
        total: saleData.total,
        amount_paid: saleData.amountPaid,
        change: saleData.change,
        date: new Date().toISOString(),
        customer: saleData.customer.name,
        payment_method: saleData.paymentMethod,
        notes: saleData.notes,
        items: {
          customer: saleData.customer,
          paymentMethod: saleData.paymentMethod,
          notes: saleData.notes,
          products: simplifiedItems
        }
      };
      
      const { data: insertedData, error } = await supabase
        .from('sales')
        .insert(supabaseSaleData)
        .select();
        
      if (error) {
        throw error;
      }
      
      toast.success('Venda salva com sucesso no banco de dados!');
      
      try {
        await generateSalesReport(userId, 30);
      } catch (reportError) {
        console.error('Erro ao gerar relatório financeiro:', reportError);
      }
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      toast.error('Erro ao salvar venda no banco de dados. Os dados foram salvos localmente.');
      throw error;
    }
  };
  
  const handlePrintReceipt = () => {
    if (!completedSale) return;
    try {
      printReceipt(completedSale, companyProfile);
      toast.success('Recibo enviado para impressão');
    } catch (error) {
      toast.error('Erro ao imprimir recibo');
    }
  };
  
  const handleDownloadReceipt = () => {
    if (!completedSale) return;
    try {
      downloadReceipt(completedSale, companyProfile);
      toast.success('Recibo baixado com sucesso');
    } catch (error) {
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
      <div className="container mx-auto px-2 pb-20">
        <div className="flex flex-col space-y-4">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold">Finalizar Venda</h1>
            <p className="text-sm text-muted-foreground">Revise e complete a venda</p>
          </div>
          
          {completedSale ? (
            <Card className="mx-auto max-w-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-center">Venda Finalizada</CardTitle>
                <CardDescription className="text-center">
                  Venda concluída com sucesso
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-center mb-2">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <h3 className="font-medium text-green-800 dark:text-green-300">
                        {formatCurrency(completedSale.total)}
                      </h3>
                    </div>
                    <p className="text-sm text-center text-green-700 dark:text-green-300 mb-2">
                      Pagamento concluído
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handlePrintReceipt}
                        size="sm"
                        className="w-full"
                      >
                        <Printer className="mr-1 h-4 w-4" />
                        Recibo
                      </Button>
                      <Button
                        onClick={handleShareReceipt}
                        size="sm"
                        className="w-full"
                      >
                        <Share2 className="mr-1 h-4 w-4" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="default" 
                    onClick={() => finishAndNavigate('/dashboard')}
                    className="w-full"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* Resumo do Carrinho */}
              <Card className="mx-auto max-w-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-center">Carrinho</CardTitle>
                  <CardDescription className="text-center">
                    {state.items.length} {state.items.length === 1 ? 'item' : 'itens'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {state.items.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">O carrinho está vazio</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {state.items.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="overflow-hidden">
                              <h3 className="truncate font-medium text-sm">{item.product.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.product.price)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <p className="font-medium text-sm mr-2">
                              {formatCurrency(item.product.price * item.quantity)}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-col pt-0">
                  <Separator className="my-2" />
                  <div className="w-full flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Formulário Simplificado */}
              <Card className="mx-auto max-w-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-center">Dados da Venda</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Cliente</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Digite o nome" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Digite o número" type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center">
                          <Calculator className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">Pagamento</span>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="amountPaid"
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
                          <span className="text-sm">Troco:</span>
                          <span className="font-medium">{formatCurrency(change)}</span>
                        </div>
                      </div>
                      
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
