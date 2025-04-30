
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Plus, ShoppingCart, Trash2, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/lib/products/types';
import { useNavigate } from 'react-router-dom';
import { OrderList, VoiceOrdersList } from '@/components/voice-orders/VoiceOrdersList';

const VoiceOrderLists = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<OrderList[]>([]);
  const [newListName, setNewListName] = useState('');
  
  // Limitando a apenas 2 sugestões de produtos para melhorar a acessibilidade
  const maxSuggestions = 2;

  // Carregar listas do usuário
  useEffect(() => {
    if (user?.id) {
      fetchLists();
    }
  }, [user?.id]);

  // Buscar sugestões de produtos baseadas no texto transcrito
  useEffect(() => {
    const getSuggestions = async () => {
      if (!transcript.trim() || !user?.id) return;
      
      try {
        setLoading(true);
        // Busca produtos que correspondam ao texto falado
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .ilike('name', `%${transcript}%`)
          .order('name', { ascending: true })
          .limit(maxSuggestions); // Limitando a apenas 2 sugestões
        
        if (error) throw error;
        
        setSuggestions(data || []);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível buscar sugestões de produtos",
        });
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      getSuggestions();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [transcript, user?.id, toast]);

  const fetchLists = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('voice_order_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setLists(data || []);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar suas listas",
      });
    }
  };

  const startListening = () => {
    setIsListening(true);
    
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        variant: "destructive",
        title: "Não suportado",
        description: "Seu navegador não suporta reconhecimento de voz.",
      });
      setIsListening(false);
      return;
    }
    
    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
        
      setTranscript(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro no reconhecimento de voz: ${event.error}`,
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  const addProductToList = async (listId: string, product: Product) => {
    try {
      // Encontrar a lista pelo ID
      const listIndex = lists.findIndex(list => list.id === listId);
      if (listIndex === -1) return;
      
      // Criar uma cópia da lista
      const updatedLists = [...lists];
      const list = { ...updatedLists[listIndex] };
      
      // Adicionar o produto à lista como string (conforme o tipo definido)
      // Convertendo o objeto em string JSON para manter a compatibilidade
      list.products = [...list.products, JSON.stringify(product)];
      
      // Atualizar lista local
      updatedLists[listIndex] = list;
      setLists(updatedLists);
      
      // Persistir no banco de dados
      const { error } = await supabase
        .from('voice_order_lists')
        .update({
          products: list.products
        })
        .eq('id', listId);
        
      if (error) throw error;
      
      toast({
        title: "Produto adicionado",
        description: `${product.name} adicionado à lista`,
      });
      
      // Limpar transcrição depois de adicionar
      setTranscript('');
      setSuggestions([]);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o produto à lista",
      });
    }
  };
  
  const removeItemFromList = async (listId: string, itemIndex: number) => {
    try {
      // Encontrar a lista pelo ID
      const listIndex = lists.findIndex(list => list.id === listId);
      if (listIndex === -1) return;
      
      // Criar uma cópia da lista
      const updatedLists = [...lists];
      const list = { ...updatedLists[listIndex] };
      
      // Remover o item da lista
      const newProducts = [...list.products];
      newProducts.splice(itemIndex, 1);
      list.products = newProducts;
      
      // Atualizar lista local
      updatedLists[listIndex] = list;
      setLists(updatedLists);
      
      // Persistir no banco de dados
      const { error } = await supabase
        .from('voice_order_lists')
        .update({
          products: list.products
        })
        .eq('id', listId);
        
      if (error) throw error;
      
      toast({
        title: "Item removido",
        description: "Item removido da lista",
      });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o item da lista",
      });
    }
  };
  
  const editItemInList = async (listId: string, itemIndex: number, newValue: string) => {
    try {
      // Encontrar a lista pelo ID
      const listIndex = lists.findIndex(list => list.id === listId);
      if (listIndex === -1) return;
      
      // Criar uma cópia da lista
      const updatedLists = [...lists];
      const list = { ...updatedLists[listIndex] };
      
      // Atualizar o item
      const newProducts = [...list.products];
      newProducts[itemIndex] = newValue;
      list.products = newProducts;
      
      // Atualizar lista local
      updatedLists[listIndex] = list;
      setLists(updatedLists);
      
      // Persistir no banco de dados
      const { error } = await supabase
        .from('voice_order_lists')
        .update({
          products: list.products
        })
        .eq('id', listId);
        
      if (error) throw error;
      
      toast({
        title: "Item atualizado",
        description: "Item atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o item na lista",
      });
    }
  };
  
  const createNewList = async () => {
    if (!newListName.trim() || !user?.id) {
      toast({
        variant: "destructive",
        title: "Nome inválido",
        description: "Digite um nome para a nova lista",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('voice_order_lists')
        .insert({
          user_id: user.id,
          products: [],
          status: 'aberto',
          name: newListName // Store name in a custom field if needed
        })
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Converter para o tipo OrderList
        setLists([data[0], ...lists]);
        setNewListName('');
        
        toast({
          title: "Lista criada",
          description: `Lista "${newListName}" criada com sucesso`,
        });
      }
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a nova lista",
      });
    }
  };
  
  const deleteList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('voice_order_lists')
        .delete()
        .eq('id', listId);
        
      if (error) throw error;
      
      setLists(lists.filter(list => list.id !== listId));
      
      toast({
        title: "Lista excluída",
        description: "Lista excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir a lista",
      });
    }
  };
  
  const clearAllLists = async () => {
    try {
      if (!user?.id || lists.length === 0) return;
      
      const listIds = lists.map(list => list.id);
      
      // Delete all lists for this user
      const { error } = await supabase
        .from('voice_order_lists')
        .delete()
        .in('id', listIds);
        
      if (error) throw error;
      
      setLists([]);
      
      toast({
        title: "Listas excluídas",
        description: "Todas as listas foram excluídas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir listas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir as listas",
      });
    }
  };
  
  const speakList = (list: OrderList) => {
    if (!('speechSynthesis' in window)) {
      toast({
        variant: "destructive",
        title: "Não suportado",
        description: "Seu navegador não suporta síntese de voz.",
      });
      return;
    }
    
    // Parar qualquer fala em andamento
    window.speechSynthesis.cancel();
    
    // Criar texto para síntese
    let text = `Lista de compras: ${list.name || 'Sem nome'}. `;
    
    if (list.products.length === 0) {
      text += "Esta lista está vazia.";
    } else {
      text += "Itens: ";
      list.products.forEach((item, index) => {
        const productName = formatProductItem(item);
        text += `${productName}, `;
      });
    }
    
    // Criar e configurar o objeto de fala
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    
    // Iniciar síntese
    window.speechSynthesis.speak(utterance);
  };
  
  const sendListToCheckout = (listId: string) => {
    // Encontrar a lista pelo ID
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    
    // Armazenar lista no sessionStorage para recuperar no carrinho
    sessionStorage.setItem('shopping_list_to_cart', JSON.stringify(list));
    navigate('/checkout');
  };
  
  // Função para formatar itens de produto (usado tanto na lista como na síntese de voz)
  const formatProductItem = (item: string): string => {
    try {
      // Check if the item is a JSON string
      if (typeof item === 'string' && (item.startsWith('{') || item.startsWith('['))) {
        const parsedItem = JSON.parse(item);
        if (parsedItem && typeof parsedItem === 'object' && parsedItem.name) {
          return parsedItem.name;
        }
      }
      return item;
    } catch (e) {
      // If parsing fails, return the original item
      return item;
    }
  };

  // Create a simple ProductSuggestion component to replace the missing one
  const ProductSuggestion = ({ product, onSelect, lists }: { 
    product: Product;
    onSelect: (listId: string) => void;
    lists: OrderList[];
  }) => {
    return (
      <div className="p-3 border rounded-lg bg-card">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.category} · {product.price} AOA</p>
          </div>
          {lists.length > 0 ? (
            <div className="flex flex-col gap-1">
              {lists.slice(0, 2).map((list) => (
                <Button 
                  key={list.id} 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onSelect(list.id)}
                >
                  + {list.name || `Lista ${list.id.substring(0, 4)}`}
                </Button>
              ))}
            </div>
          ) : (
            <Button 
              variant="secondary" 
              size="sm"
              disabled
            >
              Nenhuma lista
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Listas de Compras por Voz</h1>
        
        {/* Seção de entrada por voz */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Adicionar Produtos por Voz</CardTitle>
            <CardDescription>
              Clique no microfone e diga o nome do produto para buscar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Fale ou digite o nome do produto..."
                className="flex-1"
              />
              <Button 
                variant={isListening ? "destructive" : "default"}
                size="icon"
                onClick={startListening}
                disabled={isListening}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Sugestões de produtos - Limitado a 2 itens para melhorar acessibilidade */}
            {suggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Sugestões:</p>
                <div className="grid grid-cols-1 gap-3">
                  {suggestions.map((product) => (
                    <ProductSuggestion
                      key={product.id}
                      product={product}
                      onSelect={(selectedList) => {
                        addProductToList(selectedList, product);
                      }}
                      lists={lists}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {loading && (
              <p className="text-sm text-muted-foreground mt-2">Buscando sugestões...</p>
            )}
          </CardContent>
        </Card>
        
        {/* Criar nova lista */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Nova Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nome da nova lista..."
                className="flex-1"
              />
              <Button onClick={createNewList}>
                <Plus className="h-4 w-4 mr-2" />
                Criar
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Listas existentes */}
        <VoiceOrdersList
          lists={lists}
          onRemove={deleteList}
          onClear={clearAllLists}
          onToCheckout={sendListToCheckout}
          onEditItem={editItemInList}
          onRemoveItem={removeItemFromList}
        />
      </div>
    </MainLayout>
  );
};

export default VoiceOrderLists;
