import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex justify-center">
      <Badge 
        variant={isOnline ? "default" : "secondary"}
        className={`flex items-center gap-2 px-4 py-2 text-sm ${
          isOnline 
            ? "bg-green-500/10 text-green-600 border-green-500/20" 
            : "bg-orange-500/10 text-orange-600 border-orange-500/20"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            Online - Sincronizando
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            Offline - Dados salvos localmente
          </>
        )}
      </Badge>
    </div>
  );
}