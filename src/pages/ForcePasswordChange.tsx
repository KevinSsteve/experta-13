
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "A senha atual deve ter pelo menos 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

const ForcePasswordChange = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof passwordChangeSchema>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    try {
      // Verificar credenciais atuais
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: values.currentPassword
      });

      if (authError) {
        toast.error('Senha atual incorreta');
        setIsLoading(false);
        return;
      }

      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // Atualizar o perfil para indicar que a senha foi alterada
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          needs_password_change: false, 
          has_changed_password: true 
        })
        .eq('id', user.id);

      if (profileError) {
        toast.error('Erro ao atualizar perfil');
        setIsLoading(false);
        return;
      }

      toast.success('Senha alterada com sucesso');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Erro ao alterar senha');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Alterar Senha Obrigatória
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Por favor, altere sua senha para continuar usando o sistema.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Insira sua senha atual"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Insira sua nova senha"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirme sua nova senha"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
