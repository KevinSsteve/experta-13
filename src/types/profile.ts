
export interface ExtendedProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
  // Receipt customization fields - all optional
  taxId?: string;
  currency?: string;
  taxRate?: number;
  receiptMessage?: string;
  receiptLogo?: string;
  receiptTitle?: string;
  receiptShowLogo?: boolean;
  receiptShowSignature?: boolean;
  receiptFooterText?: string;
  receiptAdditionalInfo?: string;
}
