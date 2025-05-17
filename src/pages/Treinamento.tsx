
import { useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceToCartCreator } from '@/components/voice-orders/VoiceToCartCreator';
import { ExpertaAIAssistant } from '@/components/voice-orders/ExpertaAIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { ensureTestProductExists } from '@/utils/productUtils';

export default function Treinamento() {
  const { user } = useAuth();

  // Create test product when page loads
  useEffect(() => {
    if (user?.id) {
      ensureTestProductExists(user.id)
        .then(product => {
          if (product) {
            console.log('Yummy Bolacha product is ready for testing:', product.id);
          }
        })
        .catch(err => {
          console.error('Error ensuring test product exists:', err);
        });
    }
  }, [user?.id]);

  return (
    <MainLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4">
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Treinamento de Voz</h1>
            <p className="text-sm text-muted-foreground">
              Treine o assistente de voz a reconhecer seus produtos e comandos
            </p>
          </div>
          
          <Tabs defaultValue="voice-orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="voice-orders">Adição por Voz</TabsTrigger>
              <TabsTrigger value="expert-ai">Inteligência de Negócios</TabsTrigger>
            </TabsList>
            
            <TabsContent value="voice-orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Treinamento de Reconhecimento de Voz</CardTitle>
                  <CardDescription>
                    Use o reconhecimento de voz para adicionar produtos ao carrinho e treine o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VoiceToCartCreator />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expert-ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Experta AI - Assistente Inteligente</CardTitle>
                  <CardDescription>
                    Use o assistente de voz para gerenciar pedidos, clientes e vendas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpertaAIAssistant />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
