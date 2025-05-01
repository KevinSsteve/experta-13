
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, RefreshCcw } from 'lucide-react';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
}

export const BarcodeScanner = ({ onDetected }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startScanner = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      
      const videoElement = document.getElementById('scanner') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.setAttribute('playsinline', 'true');
        videoElement.play();
        
        // In a real implementation, we would use a barcode scanning library
        // like quagga.js or zxing to detect barcodes from the video stream
        
        // For now, we'll simulate a barcode detection after a delay
        setTimeout(() => {
          const mockBarcode = '5901234123457'; // Sample EAN-13 barcode
          onDetected(mockBarcode);
          stopScanner();
        }, 3000);
      }
      
      setHasPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      setIsScanning(false);
      toast.error('Não foi possível acessar a câmera');
    }
  };

  const stopScanner = () => {
    setIsScanning(false);
    const videoElement = document.getElementById('scanner') as HTMLVideoElement;
    if (videoElement && videoElement.srcObject) {
      const tracks = (videoElement.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanner();
      }
    };
  }, [isScanning]);

  if (hasPermission === false) {
    return (
      <Card>
        <CardContent className="pt-4 flex flex-col items-center">
          <p className="text-red-500 mb-2">Não foi possível acessar a câmera</p>
          <Button variant="outline" onClick={() => setHasPermission(null)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        {isScanning ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-sm h-48 bg-black mb-2 rounded overflow-hidden">
              <video
                id="scanner"
                className="absolute inset-0 w-full h-full object-cover"
              ></video>
              <div className="absolute inset-0 border-2 border-red-500 opacity-50 z-10"></div>
            </div>
            <Button variant="outline" onClick={stopScanner}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button onClick={startScanner}>
              <Camera className="h-4 w-4 mr-2" />
              Escanear código de barras
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
