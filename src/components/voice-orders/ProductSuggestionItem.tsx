
import { Button } from "@/components/ui/button";
import { Product } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface ProductSuggestionItemProps {
  product: Product;
  similarity: number;
  onSelect: (product: Product) => void;
  isSelected?: boolean;
}

export function ProductSuggestionItem({
  product,
  similarity,
  onSelect,
  isSelected
}: ProductSuggestionItemProps) {
  const confidenceColor = 
    similarity > 0.8 ? "bg-green-100" :
    similarity > 0.6 ? "bg-yellow-100" : "bg-red-100";

  return (
    <div className={`p-3 rounded-lg border ${isSelected ? 'border-primary' : 'border-border'} ${confidenceColor}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-medium">{product.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{product.category}</Badge>
            <Badge variant="secondary">
              {Math.round(similarity * 100)}% match
            </Badge>
          </div>
        </div>
        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          onClick={() => onSelect(product)}
          className="shrink-0"
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Selected
            </>
          ) : (
            "Select"
          )}
        </Button>
      </div>
    </div>
  );
}
