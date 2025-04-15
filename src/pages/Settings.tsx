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

// Definindo schema de validação para o formulário
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
  receiptMessage: z.string(),
  // Add new receipt customization fields
  receiptShowLogo: z.boolean().optional(),
  receiptShowSignature: z.boolean().optional(),
  receiptFooterText: z.string().optional(),
  // Novos campos para personalização adicional
  companyNeighborhood: z.string().optional(),
  companyCity: z.string().optional(),
  companySocialMedia: z.string().optional(),
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

  // Inicializando formulário
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
      receiptMessage: 'Obrigado pela preferência!',
      receiptShowLogo: false,
      receiptShowSignature: false,
      receiptFooterText: '',
      companyNeighborhood: '',
      companyCity: '',
      companySocialMedia: '',
    },
  });

  // Carregando dados do perfil quando disponível
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || 'Moloja Supermercados',
        email: profile.email,
        phone: profile.phone || '922 123 456',
        address: profile.address || 'Rua das Mercearias, 123, Luanda',
        taxId: profile.taxId || '5417623490',
        currency: profile.currency || 'AOA',
        taxRate: profile.taxRate || 14,
        receiptMessage: profile.receiptMessage || 'Obrigado pela preferência!',
        receiptShowLogo: profile.receiptShowLogo || false,
        receiptShowSignature: profile.receiptShowSignature || false,
        receiptFooterText: profile.receiptFooterText || '',
        companyNeighborhood: profile.companyNeighborhood || '',
        companyCity: profile.companyCity || '',
        companySocialMedia: profile.companySocialMedia || '',
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
          taxId: values.taxId,
          currency: values.currency,
          taxRate: values.taxRate,
          receiptMessage: values.receiptMessage,
          receiptShowLogo: values.receiptShowLogo,
          receiptShowSignature: values.receiptShowSignature,
          receiptFooterText: values.receiptFooterText,
          companyNeighborhood: values.companyNeighborhood,
          companyCity: values.companyCity,
          companySocialMedia: values.companySocialMedia,
        })
        .eq('id', profile.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizando o perfil do usuário no contexto
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
                  {/* Store Information */}
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
                  
                  {/* Fiscal Settings */}
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
                  
                  {/* Informações da Loja na Fatura */}
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
                        name="companySocialMedia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conta Social</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Instagram, Facebook ou outra rede social" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  {/* Appearance */}
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
                  
                  {/* Notifications */}
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
                  
                  {/* System Info */}
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
