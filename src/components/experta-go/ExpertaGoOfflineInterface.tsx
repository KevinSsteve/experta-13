import { useState } from "react";
import { VoiceRecorderOffline } from "./VoiceRecorderOffline";
import { VoiceRecorderWithWhisper } from "./VoiceRecorderWithWhisper";
import { ExpertaGoOfflineStats } from "./ExpertaGoOfflineStats";
import { OfflinePendingSync } from "./OfflinePendingSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShoppingCart, CreditCard, BarChart3, CloudOff, Brain } from "lucide-react";

export function ExpertaGoOfflineInterface() {
  const [activeRecording, setActiveRecording] = useState<'sale' | 'expense' | null>(null);
  const [useWhisper, setUseWhisper] = useState(false);

  return (
    <div className="space-y-6">
      {/* Toggle para Whisper */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <Label htmlFor="whisper-mode" className="font-medium">
                Usar Whisper Local (IA Offline)
              </Label>
            </div>
            <Switch
              id="whisper-mode"
              checked={useWhisper}
              onCheckedChange={setUseWhisper}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {useWhisper 
              ? "Transcrição com IA local - maior precisão, funciona offline"
              : "Transcrição nativa do navegador - mais rápido"
            }
          </p>
        </CardContent>
      </Card>

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
            {useWhisper ? (
              <VoiceRecorderWithWhisper 
                type="sale" 
                isActive={activeRecording === 'sale'}
                onActiveChange={(active) => setActiveRecording(active ? 'sale' : null)}
              />
            ) : (
              <VoiceRecorderOffline 
                type="sale" 
                isActive={activeRecording === 'sale'}
                onActiveChange={(active) => setActiveRecording(active ? 'sale' : null)}
              />
            )}
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
            {useWhisper ? (
              <VoiceRecorderWithWhisper 
                type="expense" 
                isActive={activeRecording === 'expense'}
                onActiveChange={(active) => setActiveRecording(active ? 'expense' : null)}
              />
            ) : (
              <VoiceRecorderOffline 
                type="expense" 
                isActive={activeRecording === 'expense'}
                onActiveChange={(active) => setActiveRecording(active ? 'expense' : null)}
              />
            )}
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