
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart } from "lucide-react";
import type { OrderList } from "@/pages/VoiceOrderLists";

interface VoiceOrdersListProps {
  lists: OrderList[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onToCheckout: (id: string) => void;
}

export function VoiceOrdersList({
  lists,
  onRemove,
  onClear,
  onToCheckout,
}: VoiceOrdersListProps) {
  if (lists.length === 0) {
    return (
      <div className="text-center text-muted-foreground">Nenhuma lista criada ainda.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Minhas listas salvas</h2>
        <Button onClick={onClear} size="sm" variant="destructive">
          <Trash2 className="w-4 h-4 mr-1" /> Limpar todas
        </Button>
      </div>
      {lists.map(l => (
        <div key={l.id} className="border rounded-lg p-3 flex flex-col gap-2 relative bg-card">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Criada em: {new Date(l.createdAt).toLocaleString()}
            </span>
            <div className="flex gap-2">
              <Button onClick={() => onToCheckout(l.id)} size="xs" variant={l.status === "enviado" ? "secondary" : "default"} disabled={l.status === "enviado"}>
                <ShoppingCart className="w-4 h-4 mr-1" /> {l.status === "enviado" ? "Enviado" : "Enviar p/ Checkout"}
              </Button>
              <Button onClick={() => onRemove(l.id)} size="xs" variant="outline">
                <Trash2 className="w-4 h-4" /> Remover
              </Button>
            </div>
          </div>
          <ul className="list-disc px-4 text-primary">
            {l.products.map((prod, idx) => (
              <li key={idx}>{prod}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
