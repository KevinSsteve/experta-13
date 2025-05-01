
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export const ResponsiveWrapper = ({ 
  children, 
  className, 
  mobileClassName, 
  desktopClassName 
}: ResponsiveWrapperProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </div>
  );
};
