export interface ExtendedProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
  
  // Campos personalizados para as faturas (apenas em snake_case)
  tax_id: string | null;
  currency: string | null;
  tax_rate: number | null;
  profit_rate: number | null;
  receipt_message: string | null;
  receipt_logo: string | null;
  receipt_title: string | null;
  receipt_show_logo: boolean | null;
  receipt_show_signature: boolean | null;
  receipt_footer_text: string | null;
  receipt_additional_info: string | null;
  company_neighborhood: string | null;
  company_city: string | null;
  company_social_media: string | null;

  needs_password_change?: boolean | null;
  has_changed_password?: boolean | null;
}
