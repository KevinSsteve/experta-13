
import { Card, CardContent } from '@/components/ui/card';

interface SimpleDashboardKPIProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

export const SimpleDashboardKPI = ({ title, value, icon, isLoading = false }: SimpleDashboardKPIProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-7 w-20 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
