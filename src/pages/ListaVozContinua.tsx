
import { MainLayout } from "@/components/layouts/MainLayout";
import { VozContinuaCreator } from "@/components/voice-orders/VozContinuaCreator";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Mic, LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceOrdersList } from "@/components/voice-orders/VoiceOrdersList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Define the OrderList interface directly in this file
export interface OrderList {
  id: string;
  createdAt: string;
  products: string[];
  status: 'enviado' | 'aberto';
}

export default function ListaVozContinua() {
  const { user, isLoading: authLoading } = useAuth();
  const [lists, setLists] = useState<OrderList[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLoading(false);
      setLists([]);
      return;
    }
    
    setLoading(true);
    supabase
      .from("voice_order_lists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao carregar listas:", error);
          toast({
            title: "Erro ao carregar listas",
            description: "Não foi possível carregar suas listas: " + error.message,
            variant: "destructive"
          });
          setLists([]);
        } else if (data) {
          setLists(
            data.map((row) => ({
              id: row.id,
              createdAt: row.created_at,
              products: row.products,
              status: row.status === "enviado" ? "enviado" : "aberto",
            }))
          );
        }
        setLoading(false);
      });
  }, [user, authLoading, toast]);

  const addList = async (products: string[]) => {
    if (!user) {
      toast({
        title: "Necessário fazer login",
        description: "Você precisa estar logado para criar uma lista.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se a lista de produtos está vazia
    if (!products || products.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Não foi possível salvar uma lista sem produtos.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const processedProducts = products.map(product => {
        try {
          if (typeof product === 'object') {
            return JSON.stringify(product);
          }
          return product;
        } catch (e) {
          console.error("Erro ao processar produto:", e);
          return product;
        }
      });
      
      const newList = {
        products: processedProducts,
        status: "aberto",
        user_id: user.id,
      };
      
      console.log("Enviando para o Supabase:", newList);
      
      const { data, error } = await supabase
        .from("voice_order_lists")
        .insert([newList])
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao salvar lista:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a lista no banco de dados: " + error.message,
          variant: "destructive"
        });
      } else if (data) {
        console.log("Lista salva com sucesso:", data);
        setLists((prev) => [
          {
            id: data.id,
            createdAt: data.created_at,
            products: data.products,
            status: data.status === "enviado" ? "enviado" : "aberto",
          },
          ...prev,
        ]);
        toast({
          title: "Lista criada!",
          description: "Sua lista foi salva com sucesso.",
        });
      }
    } catch (err) {
      console.error("Exceção ao salvar lista:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar salvar sua lista.",
        variant: "destructive"
      });
    }
  };

  const removeList = async (id: string) => {
    const { error } = await supabase
      .from("voice_order_lists")
      .delete()
      .eq("id", id);
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a lista.",
        variant: "destructive"
      });
      return;
    }
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  const clearLists = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("voice_order_lists")
      .delete()
      .eq("user_id", user.id);
    if (error) {
      toast({
        title: "Erro ao limpar listas",
        description: "Não foi possível limpar as listas.",
        variant: "destructive"
      });
      return;
    }
    setLists([]);
  };

  const setToCheckout = async (id: string) => {
    const { data, error } = await supabase
      .from("voice_order_lists")
      .update({ status: "enviado" })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar como enviado.",
        variant: "destructive"
      });
      return;
    }
    if (data) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: "enviado",
              }
            : l
        )
      );
    }
  };

  const editProductInList = async (
    listId: string,
    itemIndex: number,
    newValue: string
  ) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const updatedProducts = [...list.products];
    
    let currentItem = updatedProducts[itemIndex];
    try {
      if (typeof currentItem === 'string' && (currentItem.startsWith('{') || currentItem.startsWith('['))) {
        const parsedItem = JSON.parse(currentItem);
        if (parsedItem && typeof parsedItem === 'object' && parsedItem.name) {
          const updatedItem = {
            ...parsedItem,
            name: newValue
          };
          updatedProducts[itemIndex] = JSON.stringify(updatedItem);
        } else {
          updatedProducts[itemIndex] = newValue;
        }
      } else {
        updatedProducts[itemIndex] = newValue;
      }
    } catch (e) {
      updatedProducts[itemIndex] = newValue;
    }
    
    const { data, error } = await supabase
      .from("voice_order_lists")
      .update({ products: updatedProducts })
      .eq("id", listId)
      .select()
      .single();
      
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível editar o item.",
        variant: "destructive"
      });
      return;
    }
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              products: updatedProducts,
            }
          : l
      )
    );
  };

  const removeItemFromList = async (listId: string, itemIndex: number) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const updatedProducts = [...list.products];
    updatedProducts.splice(itemIndex, 1);
    
    const { error } = await supabase
      .from("voice_order_lists")
      .update({ products: updatedProducts })
      .eq("id", listId);
      
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item.",
        variant: "destructive"
      });
      return;
    }
    
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              products: updatedProducts,
            }
          : l
      )
    );
  };

  return (
    <MainLayout>
      <div className={`mx-auto py-6 px-3 ${isMobile ? 'w-full' : 'max-w-2xl'} space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Lista por Voz</h1>
          </div>
        </div>
        
        {!user && !authLoading && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-700">Necessário fazer login</AlertTitle>
            <AlertDescription className="text-yellow-600">
              Você precisa estar logado para criar e gerenciar suas listas de voz.
              <div className="mt-2">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  size="sm"
                  className="bg-white border-yellow-300"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Fazer login
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {user && (
          <>
            <Alert className="bg-muted/50 border-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Função de Lista por Voz</AlertTitle>
              <AlertDescription>
                Agora você pode ditar múltiplos itens para sua lista com gravação contínua. 
                Fale cada item e faça uma pausa de 3 segundos entre eles. 
                A gravação só será interrompida quando você pressionar o botão novamente.
              </AlertDescription>
            </Alert>
            
            <VozContinuaCreator onListCreated={addList} />
            
            {loading ? (
              <div className="text-center text-muted-foreground">Carregando listas...</div>
            ) : (
              <VoiceOrdersList
                lists={lists}
                onRemove={removeList}
                onClear={clearLists}
                onToCheckout={setToCheckout}
                onEditItem={editProductInList}
                onRemoveItem={removeItemFromList}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
