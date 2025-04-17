export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      financial_metrics: {
        Row: {
          comparison_value: number | null
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          percentage_change: number | null
          report_id: string
          updated_at: string
          value: number
        }
        Insert: {
          comparison_value?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          percentage_change?: number | null
          report_id: string
          updated_at?: string
          value: number
        }
        Update: {
          comparison_value?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          percentage_change?: number | null
          report_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_metrics_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "financial_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metrics: Json | null
          period_end: string
          period_start: string
          report_type: string
          title: string
          total_cost: number
          total_profit: number
          total_revenue: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metrics?: Json | null
          period_end: string
          period_start: string
          report_type: string
          title: string
          total_cost?: number
          total_profit?: number
          total_revenue?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metrics?: Json | null
          period_end?: string
          period_start?: string
          report_type?: string
          title?: string
          total_cost?: number
          total_profit?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          is_public: boolean | null
          name: string
          price: number
          profit_margin: number | null
          purchase_price: number
          stock: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_public?: boolean | null
          name: string
          price: number
          profit_margin?: number | null
          purchase_price?: number
          stock?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_public?: boolean | null
          name?: string
          price?: number
          profit_margin?: number | null
          purchase_price?: number
          stock?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          company_city: string | null
          company_neighborhood: string | null
          company_social_media: string | null
          created_at: string | null
          currency: string | null
          email: string
          id: string
          name: string | null
          needs_password_change: boolean | null
          phone: string | null
          position: string | null
          receipt_additional_info: string | null
          receipt_footer_text: string | null
          receipt_logo: string | null
          receipt_message: string | null
          receipt_show_logo: boolean | null
          receipt_show_signature: boolean | null
          receipt_title: string | null
          role: Database["public"]["Enums"]["user_role"]
          tax_id: string | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company_city?: string | null
          company_neighborhood?: string | null
          company_social_media?: string | null
          created_at?: string | null
          currency?: string | null
          email: string
          id: string
          name?: string | null
          needs_password_change?: boolean | null
          phone?: string | null
          position?: string | null
          receipt_additional_info?: string | null
          receipt_footer_text?: string | null
          receipt_logo?: string | null
          receipt_message?: string | null
          receipt_show_logo?: boolean | null
          receipt_show_signature?: boolean | null
          receipt_title?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tax_id?: string | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company_city?: string | null
          company_neighborhood?: string | null
          company_social_media?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string
          id?: string
          name?: string | null
          needs_password_change?: boolean | null
          phone?: string | null
          position?: string | null
          receipt_additional_info?: string | null
          receipt_footer_text?: string | null
          receipt_logo?: string | null
          receipt_message?: string | null
          receipt_show_logo?: boolean | null
          receipt_show_signature?: boolean | null
          receipt_title?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tax_id?: string | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount_paid: number
          change: number
          customer: string | null
          date: string | null
          id: string
          items: Json
          notes: string | null
          payment_method: string | null
          total: number
          user_id: string
        }
        Insert: {
          amount_paid: number
          change: number
          customer?: string | null
          date?: string | null
          id?: string
          items: Json
          notes?: string | null
          payment_method?: string | null
          total: number
          user_id: string
        }
        Update: {
          amount_paid?: number
          change?: number
          customer?: string | null
          date?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string | null
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      storage_objects: {
        Row: {
          bucket_id: string
          created_at: string | null
          id: string
          last_accessed_at: string | null
          name: string
          owner: string | null
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          name: string
          owner?: string | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          name?: string
          owner?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "vendedor" | "gerente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "vendedor", "gerente"],
    },
  },
} as const
