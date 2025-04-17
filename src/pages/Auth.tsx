
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LogIn, UserPlus, AlertCircle, LockKeyhole, KeyRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial"),
  taxId: z.string().optional(),
});

export default function Auth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      taxId: "",
    },
  });

  const clearError = () => {
    if (authError) setAuthError(null);
  };

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      clearError();
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Login error:", error.message);
        setAuthError(error.message);
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login bem-sucedido",
        description: "Você será redirecionado para a página inicial.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro de login:", error);
      setAuthError(error?.message || "Ocorreu um erro inesperado. Por favor, tente novamente.");
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      clearError();
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            role: "seller",
            tax_id: values.taxId || null,
            needs_password_change: true // Define que é necessário trocar a senha no primeiro acesso
          }
        }
      });

      if (error) {
        console.error("Signup error:", error.message);
        setAuthError(error.message);
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Signup successful:", data);
      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login com suas credenciais.",
      });

      loginForm.setValue("email", values.email);
      setActiveTab("login");
    } catch (error: any) {
      console.error("Erro de cadastro:", error);
      setAuthError(error?.message || "Ocorreu um erro inesperado. Por favor, tente novamente.");
      toast({
        title: "Erro ao criar conta",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <img src="/logo.png" alt="Contascom" className="h-10" />
          </div>
          <CardTitle className="text-2xl">Contascom</CardTitle>
          <CardDescription>Sistema de Gerenciamento com Certificação AGT</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
        
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              clearError();
              setActiveTab(value as "login" | "signup");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form 
                  onSubmit={loginForm.handleSubmit(handleLogin)} 
                  className="space-y-4 pt-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seu.email@exemplo.com" 
                            type="email" 
                            autoComplete="email"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="******" 
                            type="password" 
                            autoComplete="current-password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signupForm}>
                <form 
                  onSubmit={signupForm.handleSubmit(handleSignup)} 
                  className="space-y-4 pt-4"
                >
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Seu nome" 
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seu.email@exemplo.com" 
                            type="email"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIF (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Seu NIF" 
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          <span>Senha</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="h-auto p-0 text-xs text-muted-foreground"
                            onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                          >
                            <KeyRound className="h-3 w-3 mr-1" />
                            Requisitos de segurança
                          </Button>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="******" 
                            type="password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {showSecurityInfo && (
                    <Alert>
                      <LockKeyhole className="h-4 w-4" />
                      <AlertTitle>Requisitos de segurança (AGT)</AlertTitle>
                      <AlertDescription className="text-xs">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Mínimo de 8 caracteres</li>
                          <li>Pelo menos uma letra maiúscula</li>
                          <li>Pelo menos um número</li>
                          <li>Pelo menos um caractere especial</li>
                          <li>A senha deverá ser alterada no primeiro acesso</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Contascom - Todos os direitos reservados</p>
            <p className="text-xs mt-1">Software certificado para conformidade AGT #00345</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
