
import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { QrCode, Printer, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product } from '@/lib/products/types';
import { formatCurrency } from '@/lib/utils';

interface ProductQRCodeProps {
  product: Product;
  variant?: 'icon' | 'full';
}

export const ProductQRCode: React.FC<ProductQRCodeProps> = ({ product, variant = 'icon' }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Create a serialized object for the QR code
  const productData = JSON.stringify({
    id: product.id,
    code: product.code || product.id
  });
  
  // Configure the print handler
  const handlePrint = useReactToPrint({
    content: () => qrCodeRef.current,
    documentTitle: `QRCode-${product.name}`,
    removeAfterPrint: true,
  });
  
  // Handle QR code download
  const handleDownload = () => {
    // Create a canvas element from the QR code SVG
    const svg = document.getElementById('product-qrcode') as SVGSVGElement;
    if (!svg) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set appropriate size for the canvas
    canvas.width = 800;
    canvas.height = 400;
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create a temporary image from the SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      // Draw the QR code
      ctx.drawImage(img, 50, 50, 300, 300);
      
      // Add product information
      ctx.fillStyle = 'black';
      ctx.font = 'bold 30px Arial';
      ctx.fillText(product.name, 380, 100);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Código: ${product.code || product.id}`, 380, 150);
      ctx.fillText(`Preço: ${formatCurrency(product.price)}`, 380, 200);
      ctx.fillText(`Estoque: ${product.stock} unidades`, 380, 250);
      
      // Convert to image and trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode-${product.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };
  
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
        
        <div ref={qrCodeRef} className="flex flex-col items-center py-4" style={{ width: '80mm', margin: '0 auto' }}>
          <div className="text-center mb-3">
            <h3 className="font-bold text-xl">{product.name}</h3>
            <p className="text-muted-foreground text-sm">{product.code || product.id}</p>
            <p className="font-medium text-lg">{formatCurrency(product.price)}</p>
            <p className="text-sm">Estoque: {product.stock} un</p>
          </div>
          
          <div className="bg-white p-3 rounded-md">
            <QRCodeSVG 
              id="product-qrcode"
              value={productData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Baixar QR Code
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
