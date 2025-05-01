
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

interface WeightInputProps {
  weight: number;
  pricePerKg: number;
  onChange: (weight: number) => void;
  disabled?: boolean;
}

export const WeightInput = ({ weight, pricePerKg, onChange, disabled = false }: WeightInputProps) => {
  const totalPrice = weight * pricePerKg;
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onChange(isNaN(value) ? 0 : value);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.001"
            min="0"
            value={weight || ''}
            onChange={handleWeightChange}
            disabled={disabled}
            className="text-right"
          />
        </div>
        
        <div>
          <Label>Preço total</Label>
          <div className="h-9 px-3 py-1 rounded-md border border-input bg-muted/40 flex items-center justify-end font-medium">
            {formatCurrency(totalPrice)}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground text-right">
        {formatCurrency(pricePerKg)}/kg
      </div>
    </div>
  );
};
