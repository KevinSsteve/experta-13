
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Beef, ShoppingCart } from 'lucide-react';

interface ModuleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
}

export default function ModuleSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string>("supermarket");
  const [isLoading, setIsLoading] = useState(false);

  const modules: ModuleOption[] = [
    {
      id: "supermarket",
      name: "Supermercado",
      description: "Gestão de produtos, vendas e estoque para supermercados e minimercados.",
      icon: <ShoppingCart className="h-8 w-8 text-primary" />,
      route: "/dashboard"
    },
    {
      id: "butcher",
      name: "Talho",
      description: "Gestão especializada para talhos, com controle de carnes, cortes e validade.",
      icon: <Beef className="h-8 w-8 text-primary" />,
      route: "/butcher/dashboard"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar autenticado para selecionar um módulo");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would update the user's profile with the selected module
      // For now, we'll just use localStorage to simulate this
      localStorage.setItem("userModule", selectedModule);
      
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Módulo selecionado com sucesso!");
      
      // Navigate to the appropriate dashboard
      const selectedModuleOption = modules.find(m => m.id === selectedModule);
      navigate(selectedModuleOption?.route || "/dashboard");
      
    } catch (error) {
      console.error("Erro ao selecionar módulo:", error);
      toast.error("Ocorreu um erro ao selecionar o módulo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Bem-vindo ao ContasCom</CardTitle>
          <CardDescription>
            Selecione o módulo que você deseja utilizar. Essa configuração pode ser alterada posteriormente.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <RadioGroup value={selectedModule} onValueChange={setSelectedModule} className="space-y-4">
              {modules.map((module) => (
                <div key={module.id}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={module.id} id={module.id} />
                    <Label htmlFor={module.id} className="flex items-center">
                      <div className="ml-2 flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {module.icon}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{module.name}</p>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Configurando..." : "Continuar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
