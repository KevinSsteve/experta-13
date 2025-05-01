
import { MainLayout } from "@/components/layouts/MainLayout";
import { SimpleVoiceOrdersList } from "@/components/voice-orders/SimpleVoiceOrdersList";
import { SimpleVoiceOrdersCreator } from "@/components/voice-orders/SimpleVoiceOrdersCreator";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OrderList } from "@/pages/VoiceOrderLists";
import { AlertCircle, Flame } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function Lista() {
  const { user, isLoading: authLoading } = useAuth();
  const [lists, setLists] = useState<OrderList[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      <div className="container max-w-3xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Lista Simplificada</h1>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie suas listas de compra por voz de maneira simplificada
            </p>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold">
            <Flame className="h-3.5 w-3.5 mr-1 text-amber-500" />
            Novo
          </Badge>
        </div>
        
        <Alert className="bg-muted/50 border-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle>Interface simplificada</AlertTitle>
          <AlertDescription>
            Esta é uma versão simplificada da lista de compras por voz, 
            com limite de 3 sugestões por item e interface mais limpa.
          </AlertDescription>
        </Alert>
        
        <SimpleVoiceOrdersCreator onListCreated={addList} />
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <SimpleVoiceOrdersList
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
