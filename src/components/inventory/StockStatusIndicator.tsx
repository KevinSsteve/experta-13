
import React from 'react';

interface StockStatusIndicatorProps {
  stock: number;
  className?: string;
}

export const StockStatusIndicator = ({ stock, className = '' }: StockStatusIndicatorProps) => {
  const statusColor = stock === 0
    ? 'bg-red-500'
    : stock < 10
      ? 'bg-amber-500'
      : 'bg-green-500';

  return (
    <span 
      className={`h-2 w-2 flex-shrink-0 rounded-full ${statusColor} ${className}`}
    />
  );
};
