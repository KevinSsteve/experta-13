
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beef, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ModuleSelection() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleModuleSelect = (module: string) => {
    setSelectedModule(module === selectedModule ? null : module);
  };

  const handleContinue = () => {
    if (!selectedModule) {
      toast({
        title: "Selecione um módulo",
        description: "Por favor, selecione um módulo para continuar",
        variant: "destructive"
      });
      return;
    }

    // Salvar seleção no localStorage
    localStorage.setItem('userModule', selectedModule);

    // Redirecionar para o dashboard do módulo selecionado
    if (selectedModule === 'butcher') {
      navigate('/butcher/dashboard');
    } else if (selectedModule === 'supermarket') {
      navigate('/supermarket/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container max-w-6xl flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Selecione o Módulo</CardTitle>
            <CardDescription>
              Escolha o módulo que melhor atende às suas necessidades
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Card 
              className={cn(
                "cursor-pointer border-2 transition-all hover:shadow-md",
                selectedModule === "butcher" ? "border-primary" : "border-transparent"
              )}
              onClick={() => handleModuleSelect("butcher")}
            >
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Beef className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Talho Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Gestão de cortes de carne
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Controle de pesagem
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Vendas por peso
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Etiquetas especiais
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card 
              className={cn(
                "cursor-pointer border-2 transition-all hover:shadow-md",
                selectedModule === "supermarket" ? "border-primary" : "border-transparent"
              )}
              onClick={() => handleModuleSelect("supermarket")}
            >
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Store className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Supermercado</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Gestão multi-categorias
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Sistema de promoções
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Controle de validade
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Gestão de fornecedores
                  </li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <Button size="lg" onClick={handleContinue} className="w-full md:w-auto">
              Continuar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
