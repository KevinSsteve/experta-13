
import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'react-qr-scanner';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, CameraOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface QRScannerProps {
  onProductFound?: (productCode: string) => void;
}

export const QRScanner = ({ onProductFound }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const scannedCodesRef = useRef<Set<string>>(new Set());
  const scanCooldownRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Iniciar o scanner automaticamente quando o componente montar
    const timer = setTimeout(() => {
      setScanning(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleScan = (data: { text: string } | null) => {
    if (data && data.text && !scanCooldownRef.current) {
      const scannedCode = data.text;
      
      // Verificar se este código já foi escaneado anteriormente
      if (scannedCodesRef.current.has(scannedCode)) {
        toast.warning('Este produto já foi escaneado!');
        return;
      }
      
      console.log("Código QR escaneado:", scannedCode);
      
      // Adicionar à lista de códigos escaneados
      scannedCodesRef.current.add(scannedCode);
      setLastScanned(scannedCode);
      toast.success('Código QR detectado!');
      
      if (onProductFound) {
        onProductFound(scannedCode);
      }
      
      // Configurar cooldown para evitar múltiplos scans do mesmo código
      scanCooldownRef.current = true;
      setTimeout(() => {
        scanCooldownRef.current = false;
        setLastScanned(null);
      }, 1500);
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
  
  const refreshCamera = () => {
    // Simulando o fechamento e reabertura da câmera
    setScanning(false);
    scannedCodesRef.current.clear(); // Limpar códigos escaneados
    
    setTimeout(() => {
      setError(null);
      setScanning(true);
      toast.success('Câmera reiniciada');
    }, 500);
  };
  
  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {scanning ? (
            <AspectRatio ratio={1}>
              <div className="relative w-full h-full">
                <QrScanner
                  constraints={{
                    video: {
                      facingMode,
                      width: { ideal: 1280 },
                      height: { ideal: 1280 }
                    }
                  }}
                  onScan={handleScan}
                  onError={handleError}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  delay={300}
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
            </AspectRatio>
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
      
      {/* Substituindo o input de busca manual por um botão de atualizar câmera */}
      <div className="mt-4">
        <Button 
          onClick={refreshCamera} 
          className="w-full flex items-center justify-center gap-2"
          variant="secondary"
        >
          <RefreshCw className="h-4 w-4" />
          Reiniciar Câmera
        </Button>
      </div>
      
      {lastScanned && (
        <div className="mt-4">
          <div className="p-3 bg-primary-foreground border rounded-md">
            <p className="text-sm font-medium">Último código escaneado:</p>
            <p className="text-xs text-muted-foreground truncate">{lastScanned}</p>
          </div>
        </div>
      )}
    </div>
  );
};
