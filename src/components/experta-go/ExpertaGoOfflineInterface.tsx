import { useState } from "react";
import { VoiceRecorderOffline } from "./VoiceRecorderOffline";
import { ExpertaGoOfflineStats } from "./ExpertaGoOfflineStats";
import { OfflinePendingSync } from "./OfflinePendingSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, CreditCard, BarChart3, CloudOff } from "lucide-react";

export function ExpertaGoOfflineInterface() {
  const [activeRecording, setActiveRecording] = useState<'sale' | 'expense' | null>(null);

  return (
    <div className="space-y-6">
      {/* Botões principais */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          activeRecording === 'sale' ? 'ring-2 ring-green-500 bg-green-500/10' : ''
        }`}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <ShoppingCart className="h-6 w-6" />
              Registrar Venda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorderOffline 
              type="sale" 
              isActive={activeRecording === 'sale'}
              onActiveChange={(active) => setActiveRecording(active ? 'sale' : null)}
            />
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          activeRecording === 'expense' ? 'ring-2 ring-red-500 bg-red-500/10' : ''
        }`}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <CreditCard className="h-6 w-6" />
              Registrar Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorderOffline 
              type="expense" 
              isActive={activeRecording === 'expense'}
              onActiveChange={(active) => setActiveRecording(active ? 'expense' : null)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs para estatísticas e sincronização */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <CloudOff className="h-4 w-4" />
            Sincronização
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <ExpertaGoOfflineStats />
        </TabsContent>
        
        <TabsContent value="sync">
          <OfflinePendingSync />
        </TabsContent>
      </Tabs>
    </div>
  );
}