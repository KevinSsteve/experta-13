
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface InventoryFiltersProps {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

export const InventoryFilters = ({
  searchQuery,
  onSearch,
  category,
  onCategoryChange,
  categories
}: InventoryFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-3 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar produtos..."
              className="pl-10 h-9 text-sm"
              value={searchQuery}
              onChange={onSearch}
            />
          </div>
          
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
