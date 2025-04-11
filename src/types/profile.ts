
export interface ExtendedProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
  // Campos fiscais
  taxId?: string;
  currency?: string;
  taxRate?: number;
  receiptMessage?: string;
}
