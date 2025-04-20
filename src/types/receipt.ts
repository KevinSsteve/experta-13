
export interface ReceiptConfig {
  // Informações básicas da empresa
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  taxId: string; // NIF (Número de Identificação Fiscal)
  companyNeighborhood?: string; // Bairro
  companyCity?: string; // Município
  companySocialMedia?: string; // Conta social

  // Estilo do recibo
  fontSize?: {
    title?: number;
    header?: number;
    normal?: number;
    table?: number;
    footer?: number;
  };

  // Textos personalizados
  receiptTitle: string;
  thankYouMessage?: string;
  footerText?: string;

  // Configurações fiscais
  showTaxInfo: boolean;
  taxRate?: number;
  currency: string;
  taxExemptionReason: string; // Motivo de isenção de imposto

  // Configurações extras
  showLogo?: boolean;
  showSignature?: boolean;
  showBarcode?: boolean;
  additionalInfo?: string;
  systemInfo: string; // Nome e certificação do software
  certificateNumber: string; // Número de certificação AGT
}

export interface ReceiptItem {
  product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  };
  quantity: number;
}

export interface ReceiptData {
  id: string;
  date: string;
  items: ReceiptItem[];
  customer: {
    name: string;
    email?: string;
    phone?: string;
    nif?: string;
  };
  total: number;
  paymentMethod: string;
  amountPaid?: number;
  change?: number;
  notes?: string;
}
