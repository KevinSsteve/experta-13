
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Edit, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import type { OrderList } from "@/pages/VoiceOrderLists";
import { Input } from "@/components/ui/input";
import { ProductSuggestions } from "./ProductSuggestions";
import { useAuth } from "@/contexts/AuthContext";

interface VoiceOrdersListProps {
  lists: OrderList[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onToCheckout: (id: string) => void;
  onEditItem: (listId: string, itemIndex: number, newValue: string) => void;
}

export function VoiceOrdersList({
  lists,
  onRemove,
  onClear,
  onToCheckout,
  onEditItem,
}: VoiceOrdersListProps) {
  const { user } = useAuth();
  // Track which item is being edited: { [listId_itemIndex]: true }
  const [editing, setEditing] = useState<{ [k: string]: boolean }>({});
  // Track new value for editing
  const [editValue, setEditValue] = useState<{ [k: string]: string }>({});
  // Track expanded state for product suggestions
  const [expandedItems, setExpandedItems] = useState<{ [k: string]: boolean }>({});

  if (lists.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        Nenhuma lista criada ainda.
      </div>
    );
  }

  const getKey = (listId: string, idx: number) => `${listId}_${idx}`;
  
  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Minhas listas salvas</h2>
        <Button onClick={onClear} size="sm" variant="destructive">
          <Trash2 className="w-4 h-4 mr-1" /> Limpar todas
        </Button>
      </div>
      {lists.map((l) => (
        <div
          key={l.id}
          className="border rounded-lg p-3 flex flex-col gap-2 relative bg-card"
        >
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Criada em: {new Date(l.createdAt).toLocaleString()}
            </span>
            <div className="flex gap-2">
              <Button
                onClick={() => onToCheckout(l.id)}
                size="sm"
                variant={l.status === "enviado" ? "secondary" : "default"}
                disabled={l.status === "enviado"}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />{" "}
                {l.status === "enviado" ? "Enviado" : "Enviar p/ Checkout"}
              </Button>
              <Button
                onClick={() => onRemove(l.id)}
                size="sm"
                variant="outline"
              >
                <Trash2 className="w-4 h-4" /> Remover
              </Button>
            </div>
          </div>
          <ul className="list-disc px-4 text-primary space-y-2">
            {l.products.map((prod, idx) => {
              const key = getKey(l.id, idx);
              const isEditing = editing[key] === true;
              const isExpanded = expandedItems[key] === true;
              
              return (
                <li key={idx} className="relative group">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Input
                          value={editValue[key] ?? prod}
                          onChange={e =>
                            setEditValue(v => ({ ...v, [key]: e.target.value }))
                          }
                          className="h-7 px-2 text-sm"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7"
                          onClick={() => {
                            onEditItem(l.id, idx, editValue[key] ?? prod);
                            setEditing(ed => ({ ...ed, [key]: false }));
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setEditing(ed => ({ ...ed, [key]: false }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span>{prod}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditing(ed => ({ ...ed, [key]: true }));
                              setEditValue(v => ({ ...v, [key]: prod }));
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => toggleExpanded(key)}
                            title={isExpanded ? "Esconder sugestões" : "Mostrar sugestões"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Sugestões de produtos */}
                  {!isEditing && isExpanded && (
                    <div className="mt-1 ml-5">
                      <ProductSuggestions 
                        productName={prod} 
                        userId={user?.id}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
