
import { Loader2 } from 'lucide-react';

export const ChartSkeleton = () => (
  <div className="h-80 w-full flex items-center justify-center bg-muted/20 rounded-md">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);
