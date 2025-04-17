
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Pencil, ShieldCheck, Store, UserRound, Loader2, AlertTriangle, LockKeyhole } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Digite um email válido",
  }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória"),
  newPassword: z.string()
    .min(8, "A nova senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

const translateRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'admin': 'Administrador',
    'vendedor': 'Vendedor',
    'seller': 'Vendedor',
    'gerente': 'Gerente'
  };
  return roleMap[role] || role;
};

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  
  // Se o usuário precisar trocar a senha, vamos abrir o diálogo automaticamente
  useEffect(() => {
    if (profile?.needs_password_change && !passwordChanged) {
      setIsPasswordDialogOpen(true);
    }
  }, [profile?.needs_password_change, passwordChanged]);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      position: '',
    },
  });
  
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    if (!user) return;
    
    setIsLoading(true);
    
    if (profile) {
      form.reset({
        name: profile.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        position: profile.position || '',
      });
      setIsLoading(false);
    } else {
      refreshProfile().then(() => {
        setIsLoading(false);
      });
    }
  }, [user, profile, form, refreshProfile]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          phone: values.phone,
          address: values.address,
          position: values.position,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (values: PasswordChangeFormValues) => {
    setIsSaving(true);
    
    try {
      // Primeiro atualize a senha
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });
      
      if (error) throw error;
      
      // Se a atualização da senha for bem-sucedida e o usuário precisava trocar a senha,
      // atualize o perfil para remover a flag needs_password_change
      if (user && profile?.needs_password_change) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            needs_password_change: false
          })
          .eq('id', user.id);
        
        if (profileError) {
          console.error('Erro ao atualizar o status de troca de senha:', profileError);
        }
        
        // Atualiza o perfil do usuário
        await refreshProfile();
      }
      
      toast.success('Senha alterada com sucesso');
      setIsPasswordDialogOpen(false); // Fechar o diálogo após sucesso
      setPasswordChanged(true); // Marca que a senha foi alterada
      
      // Forçar atualização do perfil para garantir que needs_password_change seja atualizado
      setTimeout(() => {
        refreshProfile();
      }, 500);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error(`Erro ao alterar senha: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Visualize e atualize suas informações pessoais
            </p>
          </div>
          
          {profile?.needs_password_change && !passwordChanged && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Troca de senha obrigatória</AlertTitle>
              <AlertDescription>
                Para cumprir os requisitos de segurança da AGT, você deve alterar sua senha no primeiro acesso ao sistema.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Mantenha seus dados pessoais atualizados
                  </CardDescription>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} />
                    <AvatarFallback className="text-lg">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : <UserRound />}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
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
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
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
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Nível de acesso</p>
                          <p className="text-sm text-muted-foreground">
                            {profile?.role ? translateRole(profile.role) : 'Usuário'}
                          </p>
                        </div>
                      </div>
                      
                      <Dialog 
                        open={isPasswordDialogOpen} 
                        onOpenChange={(open) => {
                          // Só permite fechar o diálogo se a troca de senha NÃO for obrigatória
                          // ou se a senha já foi alterada com sucesso
                          if (!open && (profile?.needs_password_change && !passwordChanged)) {
                            return;
                          }
                          setIsPasswordDialogOpen(open);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" type="button">
                            <Pencil className="h-4 w-4 mr-2" />
                            Alterar senha
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {profile?.needs_password_change && !passwordChanged
                                ? "Troca de senha obrigatória" 
                                : "Alterar senha"}
                            </DialogTitle>
                            <DialogDescription>
                              {profile?.needs_password_change && !passwordChanged
                                ? "Para cumprir os requisitos de segurança da AGT, você deve criar uma nova senha no primeiro acesso."
                                : "Criar uma nova senha para sua conta"}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                              {!profile?.needs_password_change && (
                                <FormField
                                  control={passwordForm.control}
                                  name="currentPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Senha atual</FormLabel>
                                      <FormControl>
                                        <Input type="password" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                              
                              <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center justify-between">
                                      <span>Nova senha</span>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        className="h-auto p-0 text-xs text-muted-foreground"
                                        onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                                      >
                                        <LockKeyhole className="h-3 w-3 mr-1" />
                                        Requisitos
                                      </Button>
                                    </FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              {showSecurityInfo && (
                                <Alert className="text-xs">
                                  <AlertTitle>Requisitos de segurança (AGT)</AlertTitle>
                                  <AlertDescription>
                                    <ul className="list-disc pl-5 space-y-1">
                                      <li>Mínimo de 8 caracteres</li>
                                      <li>Pelo menos uma letra maiúscula</li>
                                      <li>Pelo menos um número</li>
                                      <li>Pelo menos um caractere especial</li>
                                    </ul>
                                  </AlertDescription>
                                </Alert>
                              )}
                              
                              <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirmar nova senha</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <DialogFooter>
                                {/* Só mostra o botão de cancelar se a troca de senha NÃO for obrigatória ou se a senha já foi alterada */}
                                {(!profile?.needs_password_change || passwordChanged) && (
                                  <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                    Cancelar
                                  </Button>
                                )}
                                <Button type="submit" disabled={isSaving}>
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Salvando...
                                    </>
                                  ) : (
                                    'Alterar senha'
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <Button type="submit" disabled={isSaving} className="w-full">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar alterações'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informações da Loja</CardTitle>
                <CardDescription>
                  Detalhes sobre a loja e gerenciamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <Store className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Loja Contascom</p>
                      <p className="text-sm text-muted-foreground">
                        Gerenciamento de produtos e vendas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Usuário desde</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Certificação AGT</p>
                      <p className="text-sm text-muted-foreground">
                        Software certificado #00345
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/settings">
                    Ir para configurações da loja
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
