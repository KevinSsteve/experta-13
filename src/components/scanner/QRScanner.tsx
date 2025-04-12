
import React, { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, CameraOff } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onProductFound?: (productCode: string) => void;
}

export const QRScanner = ({ onProductFound }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  
  // Prevenir escaneamentos duplicados muito próximos
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lastScanned) {
      timer = setTimeout(() => {
        setLastScanned(null);
      }, 3000); // Aguarda 3 segundos antes de permitir novo escaneamento
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [lastScanned]);
  
  const handleScan = (data: { text: string } | null) => {
    if (data && data.text && !lastScanned) {
      const scannedCode = data.text;
      setLastScanned(scannedCode);
      
      // Notificar o código escaneado
      toast.success('Código QR detectado!');
      
      // Chamar a função de callback se fornecida
      if (onProductFound) {
        onProductFound(scannedCode);
      }
    }
  };
  
  const handleError = (err: Error) => {
    console.error('Erro no scanner:', err);
    setError('Erro ao acessar a câmera. Verifique suas permissões.');
    setScanning(false);
  };
  
  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };
  
  const toggleScanner = () => {
    if (scanning) {
      setScanning(false);
    } else {
      setError(null);
      setScanning(true);
    }
  };
  
  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {scanning ? (
            <div className="relative">
              <QrScanner
                constraints={{
                  video: {
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  }
                }}
                onScan={handleScan}
                onError={handleError}
                style={{ width: '100%', height: 'auto' }}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={toggleCamera}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={toggleScanner}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <CameraOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              {error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button 
                onClick={toggleScanner} 
                className="flex items-center gap-2"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Parar Scanner
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Iniciar Scanner
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {lastScanned && (
        <div className="mt-4 p-3 bg-primary-foreground border rounded-md">
          <p className="text-sm font-medium">Último código escaneado:</p>
          <p className="text-xs text-muted-foreground truncate">{lastScanned}</p>
        </div>
      )}
    </div>
  );
};
