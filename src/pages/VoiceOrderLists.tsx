
import { MainLayout } from "@/components/layouts/MainLayout";
import { VoiceOrdersCreator } from "@/components/voice-orders/VoiceOrdersCreator";
import { VoiceOrdersList } from "@/components/voice-orders/VoiceOrdersList";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export interface OrderList {
  id: string;
  createdAt: string;
  products: string[];
  status: "aberto" | "enviado";
}

export default function VoiceOrderLists() {
  const { user, isLoading: authLoading } = useAuth();
  const [lists, setLists] = useState<OrderList[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Busca listas no Supabase
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

  // Adiciona lista no Supabase
  const addList = async (products: string[]) => {
    if (!user) return;
    const newList = {
      products,
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

  // Remove lista no Supabase
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

  // Limpa todas as listas do usuário
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

  // Atualiza status para enviado no Supabase
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

  // Edita produto de uma lista específica
  const editProductInList = async (
    listId: string,
    itemIndex: number,
    newValue: string
  ) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const updatedProducts = [...list.products];
    updatedProducts[itemIndex] = newValue;
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Listas de Compras por Voz</h1>
        
        <Alert className="bg-muted/50 border-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nova funcionalidade!</AlertTitle>
          <AlertDescription>
            Agora você pode ver sugestões de produtos do seu inventário para cada item da lista.
            Basta clicar no ícone ▼ ao lado de cada item para expandir as sugestões e adicioná-las diretamente ao carrinho.
          </AlertDescription>
        </Alert>
        
        <VoiceOrdersCreator onListCreated={addList} />
        {loading ? (
          <div className="text-center text-muted-foreground">Carregando listas...</div>
        ) : (
          <VoiceOrdersList
            lists={lists}
            onRemove={removeList}
            onClear={clearLists}
            onToCheckout={setToCheckout}
            onEditItem={editProductInList}
          />
        )}
      </div>
    </MainLayout>
  );
}
