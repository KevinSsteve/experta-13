
import { MainLayout } from "@/components/layouts/MainLayout";
import { VozContinuaCreator } from "@/components/voice-orders/VozContinuaCreator";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Mic } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceOrdersList } from "@/components/voice-orders/VoiceOrdersList";
import { OrderList } from "@/pages/VoiceOrderLists";

export default function ListaVozContinua() {
  const { user, isLoading: authLoading } = useAuth();
  const [lists, setLists] = useState<OrderList[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user || authLoading) {
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
          toast({
            title: "Erro ao carregar listas",
            description: "Não foi possível carregar suas listas.",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const addList = async (products: string[]) => {
    if (!user) return;
    
    const processedProducts = products.map(product => {
      try {
        if (typeof product === 'object') {
          return JSON.stringify(product);
        }
        return product;
      } catch (e) {
        return product;
      }
    });
    
    const newList = {
      products: processedProducts,
      status: "aberto",
      user_id: user.id,
    };
    
    const { data, error } = await supabase
      .from("voice_order_lists")
      .insert([newList])
      .select()
      .single();
      
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a lista no banco de dados.",
        variant: "destructive"
      });
    } else if (data) {
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
      </div>
    </MainLayout>
  );
}
