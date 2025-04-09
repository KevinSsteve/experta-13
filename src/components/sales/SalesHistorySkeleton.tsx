
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

export function SalesHistorySkeleton() {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          // Mobile version - card skeletons
          <div className="space-y-4">
            {Array(3).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          // Desktop version - table row skeletons
          <div>
            <div className="grid grid-cols-5 gap-4 mb-4">
              {Array(5).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
            <div className="space-y-4">
              {Array(5).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
