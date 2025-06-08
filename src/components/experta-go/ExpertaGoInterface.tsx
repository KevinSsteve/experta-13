
import { useState } from "react";
import { VoiceRecorder } from "./VoiceRecorder";
import { ExpertaGoStats } from "./ExpertaGoStats";
import { PendingCorrections } from "./PendingCorrections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, CreditCard, BarChart3, Settings } from "lucide-react";

export function ExpertaGoInterface() {
  const [activeRecording, setActiveRecording] = useState<'sale' | 'expense' | null>(null);

  return (
    <div className="space-y-6">
      {/* Botões principais */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          activeRecording === 'sale' ? 'ring-2 ring-green-500 bg-green-50' : ''
        }`}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-700">
              <ShoppingCart className="h-6 w-6" />
              Registrar Venda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorder 
              type="sale" 
              isActive={activeRecording === 'sale'}
              onActiveChange={(active) => setActiveRecording(active ? 'sale' : null)}
            />
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          activeRecording === 'expense' ? 'ring-2 ring-red-500 bg-red-50' : ''
        }`}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-700">
              <CreditCard className="h-6 w-6" />
              Registrar Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorder 
              type="expense" 
              isActive={activeRecording === 'expense'}
              onActiveChange={(active) => setActiveRecording(active ? 'expense' : null)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs para estatísticas e correções */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="corrections" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Correções Pendentes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <ExpertaGoStats />
        </TabsContent>
        
        <TabsContent value="corrections">
          <PendingCorrections />
        </TabsContent>
      </Tabs>
    </div>
  );
}
