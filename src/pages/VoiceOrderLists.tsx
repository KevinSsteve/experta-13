
import { MainLayout } from "@/components/layouts/MainLayout";
import { VoiceOrdersCreator } from "@/components/voice-orders/VoiceOrdersCreator";
import { VoiceOrdersList } from "@/components/voice-orders/VoiceOrdersList";
import { useState, useEffect } from "react";

export interface OrderList {
  id: string;
  createdAt: string;
  products: string[];
  status: "aberto" | "enviado";
}

const VOICE_ORDERS_KEY = "voice_order_lists";

export default function VoiceOrderLists() {
  const [lists, setLists] = useState<OrderList[]>([]);

  useEffect(() => {
    // Carrega listas do localStorage ao montar
    const saved = localStorage.getItem(VOICE_ORDERS_KEY);
    if (saved) {
      setLists(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Salva listas local
    localStorage.setItem(VOICE_ORDERS_KEY, JSON.stringify(lists));
  }, [lists]);

  const addList = (products: string[]) => {
    const newList: OrderList = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      products,
      status: "aberto",
    };
    setLists([newList, ...lists]);
  };

  const removeList = (id: string) => {
    setLists(lists.filter(l => l.id !== id));
  };

  const clearLists = () => {
    setLists([]);
  };

  const setToCheckout = (id: string) => {
    setLists(lists.map(l => l.id === id ? { ...l, status: "enviado" } : l));
  };

  // NEW: Edit individual product in a list
  const editProductInList = (listId: string, itemIndex: number, newValue: string) => {
    setLists(lists =>
      lists.map(list => {
        if (list.id !== listId) return list;
        const updatedProducts = [...list.products];
        updatedProducts[itemIndex] = newValue;
        return { ...list, products: updatedProducts };
      })
    );
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Criar Listas de Pedidos por Voz</h1>
        <VoiceOrdersCreator onListCreated={addList} />
        <VoiceOrdersList
          lists={lists}
          onRemove={removeList}
          onClear={clearLists}
          onToCheckout={setToCheckout}
          onEditItem={editProductInList}
        />
      </div>
    </MainLayout>
  );
}

