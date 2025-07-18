import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function OfflinePendingSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Dados simulados de sincronização pendente
  const pendingItems = [
    {
      id: '1',
      type: 'sale',
      description: '3 garrafas de água por 500 kwanzas cada',
      timestamp: '2024-01-20 14:30',
      amount: 1500
    },
    {
      id: '2',
      type: 'expense',
      description: 'Combustível para entrega',
      timestamp: '2024-01-20 15:45',
      amount: 2000
    },
    {
      id: '3',
      type: 'sale',
      description: '2 refrigerantes por 300 kwanzas cada',
      timestamp: '2024-01-20 16:15',
      amount: 600
    }
  ];

  const handleSyncAll = async () => {
    setIsSyncing(true);
    
    try {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Todos os dados foram sincronizados!");
      
    } catch (error) {
      toast.error("Erro durante a sincronização");
    } finally {
      setIsSyncing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'sale' ? '💰' : '💸';
  };

  const getTypeBadge = (type: string) => {
    return type === 'sale' ? (
      <Badge variant="outline" className="text-green-600 border-green-600/20">
        Venda
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-600/20">
        Despesa
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de sincronização */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Dados Pendentes</h3>
          <p className="text-sm text-muted-foreground">
            {pendingItems.length} itens aguardando sincronização
          </p>
        </div>
        
        <Button 
          onClick={handleSyncAll}
          disabled={isSyncing || pendingItems.length === 0}
          className="flex items-center gap-2"
        >
          <CloudUpload className="h-4 w-4" />
          {isSyncing ? "Sincronizando..." : "Sincronizar Tudo"}
        </Button>
      </div>

      {/* Status da conexão */}
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-600">Modo Offline</h4>
              <p className="text-sm text-orange-600/80">
                Os dados estão sendo salvos localmente. Quando a conexão for restabelecida, 
                eles serão automaticamente sincronizados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de itens pendentes */}
      {pendingItems.length > 0 ? (
        <div className="space-y-3">
          {pendingItems.map((item) => (
            <Card key={item.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(item.type)}
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">
                      {item.amount.toLocaleString()} AOA
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="font-medium mb-2">Tudo Sincronizado!</h4>
            <p className="text-sm text-muted-foreground">
              Não há dados pendentes para sincronização.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre sincronização automática */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CloudUpload className="h-4 w-4" />
            Sincronização Automática
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-blue-600/80">
            Quando a conexão for restabelecida, todos os dados serão automaticamente 
            sincronizados em segundo plano. Você não precisa fazer nada!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}