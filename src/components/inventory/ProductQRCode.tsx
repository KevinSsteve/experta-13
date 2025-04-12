
import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { QrCode, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product } from '@/lib/products/types';
import { formatCurrency } from '@/lib/utils';

interface ProductQRCodeProps {
  product: Product;
  variant?: 'icon' | 'full';
}

export const ProductQRCode: React.FC<ProductQRCodeProps> = ({ product, variant = 'icon' }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Criar um objeto serializado para o QR code
  const productData = JSON.stringify({
    id: product.id,
    code: product.code || product.id
  });
  
  // Configurar o handler de impressão
  const handlePrint = useReactToPrint({
    content: () => qrCodeRef.current,
    documentTitle: `QRCode-${product.name}`,
    removeAfterPrint: true,
  });
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <QrCode className="h-4 w-4" />
            <span>QR Code</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code do Produto</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4" ref={qrCodeRef}>
          <div className="text-center mb-4">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-muted-foreground">{product.code || product.id}</p>
            <p className="font-medium">{formatCurrency(product.price)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-md">
            <QRCodeSVG 
              value={productData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
