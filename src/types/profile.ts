
export interface ExtendedProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
  // Receipt customization fields with database names
  tax_id?: string;
  taxId?: string; // For backward compatibility
  currency?: string;
  tax_rate?: number;
  taxRate?: number; // For backward compatibility
  receipt_message?: string;
  receiptMessage?: string; // For backward compatibility
  receiptLogo?: string;
  receiptTitle?: string;
  receipt_show_logo?: boolean;
  receiptShowLogo?: boolean; // For backward compatibility
  receipt_show_signature?: boolean;
  receiptShowSignature?: boolean; // For backward compatibility
  receipt_footer_text?: string;
  receiptFooterText?: string; // For backward compatibility
  receiptAdditionalInfo?: string;
  // Company location information
  company_neighborhood?: string;
  companyNeighborhood?: string; // For backward compatibility
  company_city?: string;
  companyCity?: string; // For backward compatibility
  company_social_media?: string;
  companySocialMedia?: string; // For backward compatibility
}
