
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phone: z.string().min(9, {
    message: "Número de telefone deve ter pelo menos 9 dígitos.",
  }),
  address: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres.",
  }),
  taxId: z.string().min(9, {
    message: "NIF deve ter pelo menos 9 caracteres.",
  }),
  currency: z.string(),
  taxRate: z.coerce.number().min(0).max(100),
  profitRate: z.coerce.number().min(0).max(100),
  receiptMessage: z.string(),
  receiptShowLogo: z.boolean().optional(),
  receiptShowSignature: z.boolean().optional(),
  receiptFooterText: z.string().optional(),
  companyNeighborhood: z.string().optional(),
  companyCity: z.string().optional(),
  companySocialSecurity: z.string().optional(), // Alterado de companySocialMedia para companySocialSecurity
});

type FormValues = z.infer<typeof formSchema>;

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newSales: true,
    promotions: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Moloja Supermercados',
      email: 'contato@moloja.com',
      phone: '922 123 456',
      address: 'Rua das Mercearias, 123, Luanda',
      taxId: '5417623490',
      currency: 'AOA',
      taxRate: 14,
      profitRate: 5,
      receiptMessage: 'Obrigado pela preferência!',
      receiptShowLogo: false,
      receiptShowSignature: false,
      receiptFooterText: '',
      companyNeighborhood: '',
      companyCity: '',
      companySocialSecurity: '', // Alterado de companySocialMedia para companySocialSecurity
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || 'Moloja Supermercados',
        email: profile.email,
        phone: profile.phone || '922 123 456',
        address: profile.address || 'Rua das Mercearias, 123, Luanda',
        taxId: profile.tax_id || '5417623490', // Garantindo que está usando o campo tax_id do perfil
        currency: profile.currency || 'AOA',
        taxRate: profile.tax_rate || 14,
        profitRate: profile.profit_rate || 5,
        receiptMessage: profile.receipt_message || 'Obrigado pela preferência!',
        receiptShowLogo: profile.receipt_show_logo || false,
        receiptShowSignature: profile.receipt_show_signature || false,
        receiptFooterText: profile.receipt_footer_text || '',
        companyNeighborhood: profile.company_neighborhood || '',
        companyCity: profile.company_city || '',
        companySocialSecurity: profile.company_social_media || '', // Usamos o mesmo campo do banco, mas mudamos o nome na interface
      });
    }
  }, [profile, form]);

  const handleSaveSettings = async (values: FormValues) => {
    if (!profile) {
      toast.error('Você precisa estar autenticado para salvar configurações');
      return;
    }

    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          phone: values.phone,
          address: values.address,
          tax_id: values.taxId, // Garantindo que o NIF seja armazenado no campo tax_id
          currency: values.currency,
          tax_rate: values.taxRate,
          profit_rate: values.profitRate,
          receipt_message: values.receiptMessage,
          receipt_show_logo: values.receiptShowLogo,
          receipt_show_signature: values.receiptShowSignature,
          receipt_footer_text: values.receiptFooterText,
          company_neighborhood: values.companyNeighborhood,
          company_city: values.companyCity,
          company_social_media: values.companySocialSecurity, // Armazenando INSS no mesmo campo, mas com significado diferente
        })
        .eq('id', profile.id);
      
      if (error) {
        throw error;
      }
      
      await refreshProfile();
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error(`Erro ao salvar: ${error.message || 'Tente novamente mais tarde'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações da Loja</CardTitle>
                      <CardDescription>
                        Gerencie as informações básicas da sua loja
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Loja</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="922 123 456" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações Fiscais</CardTitle>
                      <CardDescription>
                        Gerencie as configurações fiscais e de moeda para Angola
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="taxId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NIF (Número de Identificação Fiscal)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="5417623490" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Moeda</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a moeda" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AOA">Kwanza (AKZ)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="taxRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alíquota de IVA (%)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" />
                              </FormControl>
                              <FormDescription>
                                Taxa padrão de IVA em Angola: 14%
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                         <FormField
                           control={form.control}
                           name="profitRate"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Taxa de Lucro (%)</FormLabel>
                               <FormControl>
                                 <Input {...field} type="number" step="0.1" min="0" max="100" />
                               </FormControl>
                               <FormDescription>
                                 Taxa percentual aplicada sobre vendas para calcular lucro estimado
                               </FormDescription>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                       </div>
                       
                       <div className="grid grid-cols-1 gap-4">
                         <FormField
                           control={form.control}
                           name="receiptMessage"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Mensagem do Recibo</FormLabel>
                               <FormControl>
                                 <Input {...field} placeholder="Mensagem personalizada para recibos" />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações da Loja na Fatura</CardTitle>
                      <CardDescription>
                        Adicione informações detalhadas para aparecer no cabeçalho da fatura
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyNeighborhood"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Nome do bairro" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="companyCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Município</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Nome do município" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="companySocialSecurity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>INSS (Instituto Nacional de Segurança Social)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Número do INSS" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aparência</CardTitle>
                      <CardDescription>
                        Personalize a aparência do sistema
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dark-mode">Tema Escuro</Label>
                          <p className="text-sm text-muted-foreground">
                            Alterar entre tema claro e escuro
                          </p>
                        </div>
                        <Switch
                          id="dark-mode"
                          checked={theme === 'dark'}
                          onCheckedChange={toggleTheme}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Notificações</CardTitle>
                      <CardDescription>
                        Configure os alertas e notificações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="low-stock">Alertas de Estoque Baixo</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas quando produtos estiverem com estoque baixo
                          </p>
                        </div>
                        <Switch
                          id="low-stock"
                          checked={notifications.lowStock}
                          onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="new-sales">Novas Vendas</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas sobre novas vendas
                          </p>
                        </div>
                        <Switch
                          id="new-sales"
                          checked={notifications.newSales}
                          onCheckedChange={(checked) => setNotifications({...notifications, newSales: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="promotions">Promoções</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas sobre promoções e ofertas
                          </p>
                        </div>
                        <Switch
                          id="promotions"
                          checked={notifications.promotions}
                          onCheckedChange={(checked) => setNotifications({...notifications, promotions: checked})}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Versão</p>
                        <p className="text-sm text-muted-foreground">1.0.0</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Última Atualização</p>
                        <p className="text-sm text-muted-foreground">12/04/2025</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">País</p>
                        <p className="text-sm text-muted-foreground">Angola</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Button type="submit" disabled={isSaving} className="flex gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
