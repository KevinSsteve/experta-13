
export interface ExtendedProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
  
  // Receipt customization fields with both database names (snake_case) and JavaScript names (camelCase)
  // Database column names (snake_case)
  tax_id?: string | null;
  currency?: string | null;
  tax_rate?: number | null;
  receipt_message?: string | null;
  receipt_logo?: string | null;
  receipt_title?: string | null;
  receipt_show_logo?: boolean | null;
  receipt_show_signature?: boolean | null;
  receipt_footer_text?: string | null;
  receipt_additional_info?: string | null;
  company_neighborhood?: string | null;
  company_city?: string | null;
  company_social_media?: string | null;
  
  // JavaScript property names (camelCase) for backward compatibility
  taxId?: string | null;
  taxRate?: number | null;
  receiptMessage?: string | null;
  receiptLogo?: string | null;
  receiptTitle?: string | null;
  receiptShowLogo?: boolean | null;
  receiptShowSignature?: boolean | null;
  receiptFooterText?: string | null;
  receiptAdditionalInfo?: string | null;
  companyNeighborhood?: string | null;
  companyCity?: string | null;
  companySocialMedia?: string | null;
}
