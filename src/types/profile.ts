
export interface ExtendedProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
  // Campos fiscais e para personalização do recibo
  taxId?: string;
  currency?: string;
  taxRate?: number;
  receiptMessage?: string;
  // Novos campos para personalização do recibo
  receiptLogo?: string;
  receiptTitle?: string;
  receiptShowLogo?: boolean;
  receiptShowSignature?: boolean;
  receiptFooterText?: string;
  receiptAdditionalInfo?: string;
}
