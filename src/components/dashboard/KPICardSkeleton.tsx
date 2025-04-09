
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const KPICardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
      <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2"></div>
      <div className="h-4 w-16 bg-muted animate-pulse rounded mb-1"></div>
      <div className="h-3 w-40 bg-muted animate-pulse rounded"></div>
    </CardContent>
  </Card>
);
