
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          is_public: boolean | null
          purchase_price: number
          profit_margin: number | null
          category: string
          price: number
          image: string | null
          stock: number
          name: string
          code: string | null
          description: string | null
          created_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_public?: boolean | null
          purchase_price?: number
          profit_margin?: number | null
          category: string
          price: number
          image?: string | null
          stock?: number
          name: string
          code?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_public?: boolean | null
          purchase_price?: number
          profit_margin?: number | null
          category?: string
          price?: number
          image?: string | null
          stock?: number
          name?: string
          code?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
      voice_order_lists: {
        Row: {
          id: string
          user_id: string
          status: string
          products: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          products: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          products?: string[]
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          receipt_title: string | null
          created_at: string | null
          updated_at: string | null
          tax_rate: number | null
          receipt_show_logo: boolean | null
          receipt_show_signature: boolean | null
          role: string
          needs_password_change: boolean | null
          has_changed_password: boolean | null
          email: string
          name: string | null
          avatar_url: string | null
          phone: string | null
          address: string | null
          position: string | null
          company_neighborhood: string | null
          company_city: string | null
          company_social_media: string | null
          tax_id: string | null
          currency: string | null
          receipt_message: string | null
          receipt_logo: string | null
          receipt_footer_text: string | null
          receipt_additional_info: string | null
          selected_module: string | null
        }
        Insert: {
          id: string
          receipt_title?: string | null
          created_at?: string | null
          updated_at?: string | null
          tax_rate?: number | null
          receipt_show_logo?: boolean | null
          receipt_show_signature?: boolean | null
          role?: string
          needs_password_change?: boolean | null
          has_changed_password?: boolean | null
          email: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          position?: string | null
          company_neighborhood?: string | null
          company_city?: string | null
          company_social_media?: string | null
          tax_id?: string | null
          currency?: string | null
          receipt_message?: string | null
          receipt_logo?: string | null
          receipt_footer_text?: string | null
          receipt_additional_info?: string | null
          selected_module?: string | null
        }
        Update: {
          id?: string
          receipt_title?: string | null
          created_at?: string | null
          updated_at?: string | null
          tax_rate?: number | null
          receipt_show_logo?: boolean | null
          receipt_show_signature?: boolean | null
          role?: string
          needs_password_change?: boolean | null
          has_changed_password?: boolean | null
          email?: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          position?: string | null
          company_neighborhood?: string | null
          company_city?: string | null
          company_social_media?: string | null
          tax_id?: string | null
          currency?: string | null
          receipt_message?: string | null
          receipt_logo?: string | null
          receipt_footer_text?: string | null
          receipt_additional_info?: string | null
          selected_module?: string | null
        }
      }
      sales: {
        Row: {
          id: string
          change: number
          amount_paid: number
          total: number
          items: Json
          payment_method: string | null
          customer: string | null
          notes: string | null
          user_id: string
          date: string | null
        }
        Insert: {
          id?: string
          change: number
          amount_paid: number
          total: number
          items: Json
          payment_method?: string | null
          customer?: string | null
          notes?: string | null
          user_id: string
          date?: string | null
        }
        Update: {
          id?: string
          change?: number
          amount_paid?: number
          total?: number
          items?: Json
          payment_method?: string | null
          customer?: string | null
          notes?: string | null
          user_id?: string
          date?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          date: string
          created_at: string
          description: string
          category: string
          payment_method: string
          notes: string | null
          updated_at: string
          user_id: string
          amount: number
        }
        Insert: {
          id?: string
          date?: string
          created_at?: string
          description: string
          category: string
          payment_method?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          amount: number
        }
        Update: {
          id?: string
          date?: string
          created_at?: string
          description?: string
          category?: string
          payment_method?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          amount?: number
        }
      }
      credit_notes: {
        Row: {
          id: string
          status: string
          observations: string | null
          reason: string
          customer: Json
          user_id: string
          items: Json
          original_sale_id: string
          date: string
          total: number
        }
        Insert: {
          id?: string
          status?: string
          observations?: string | null
          reason: string
          customer: Json
          user_id: string
          items: Json
          original_sale_id: string
          date?: string
          total: number
        }
        Update: {
          id?: string
          status?: string
          observations?: string | null
          reason?: string
          customer?: Json
          user_id?: string
          items?: Json
          original_sale_id?: string
          date?: string
          total?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "gerente" | "vendedor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
