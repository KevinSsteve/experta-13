
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Edit, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductSuggestions } from "./ProductSuggestions";
import { useAuth } from "@/contexts/AuthContext";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { parseVoiceInput } from "@/utils/voiceUtils";

// Define the OrderList type here to be consistent with the page component
export interface OrderList {
  id: string;
  user_id: string;
  products: string[];
  created_at: string;
  status: string;
  name?: string;
}

interface VoiceOrdersListProps {
  lists: OrderList[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onToCheckout: (id: string) => void;
  onEditItem: (listId: string, itemIndex: number, newValue: string) => void;
  onRemoveItem: (listId: string, itemIndex: number) => void;
}

export function VoiceOrdersList({
  lists,
  onRemove,
  onClear,
  onToCheckout,
  onEditItem,
  onRemoveItem
}: VoiceOrdersListProps) {
  const { user } = useAuth();
  const [editing, setEditing] = useState<{ [k: string]: boolean }>({});
  const [editValue, setEditValue] = useState<{ [k: string]: string }>({});
  const [expandedItems, setExpandedItems] = useState<{ [k: string]: boolean }>({});
  
  // Generate a unique key for each item in the list
  const getKey = (listId: string, itemIndex: number) => {
    return `${listId}-${itemIndex}`;
  };
  
  // Toggle the expanded state of an item
  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Function to format product item display
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

  if (lists.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        Nenhuma lista criada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-2">
        <h2 className="text-lg font-semibold">Minhas listas salvas</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Trash2 className="w-4 h-4 mr-1" /> Limpar todas
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja limpar todas as suas listas? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onClear}>Limpar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {lists.map((l) => (
        <div
          key={l.id}
          className="border rounded-lg p-3 flex flex-col gap-2 relative bg-card"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Criada em: {new Date(l.created_at).toLocaleString()}
            </span>
            <div className="flex flex-wrap gap-2">
              <ResponsiveWrapper
                mobileClassName="w-full"
                desktopClassName="w-auto"
              >
                <Button
                  onClick={() => onToCheckout(l.id)}
                  size="sm"
                  variant={l.status === "enviado" ? "secondary" : "default"}
                  disabled={l.status === "enviado"}
                  className="w-full sm:w-auto"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />{" "}
                  {l.status === "enviado" ? "Enviado" : "Enviar p/ Checkout"}
                </Button>
              </ResponsiveWrapper>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remover
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja remover esta lista? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRemove(l.id)}>Remover</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <ul className="list-disc px-4 text-primary space-y-2">
            {l.products.map((prod, idx) => {
              const key = getKey(l.id, idx);
              const isEditing = editing[key] === true;
              const isExpanded = expandedItems[key] === true;
              const formattedProduct = formatProductItem(prod);
              
              return (
                <li key={idx} className="relative group">
                  <div className="flex flex-wrap items-center gap-2">
                    {isEditing ? (
                      <>
                        <Input
                          value={editValue[key] ?? formattedProduct}
                          onChange={e =>
                            setEditValue(v => ({ ...v, [key]: e.target.value }))
                          }
                          className="h-7 px-2 text-sm flex-1"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7"
                            onClick={() => {
                              onEditItem(l.id, idx, editValue[key] ?? formattedProduct);
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
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="break-words flex-1">{formattedProduct}</span>
                        <div className="flex flex-wrap gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditing(ed => ({ ...ed, [key]: true }));
                              setEditValue(v => ({ ...v, [key]: formattedProduct }));
                            }}
                            aria-label="Editar item"
                          >
                            <Edit className="w-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => onRemoveItem(l.id, idx)}
                            aria-label="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => toggleExpanded(key)}
                            title={isExpanded ? "Esconder sugestões" : "Mostrar sugestões"}
                            aria-label={isExpanded ? "Esconder sugestões" : "Mostrar sugestões"}
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
                    <div className="mt-1 ml-2 sm:ml-5">
                      <ProductSuggestions 
                        productName={formattedProduct} 
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
