
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
      credit_notes: {
        Row: {
          id: string
          status: string
          observations: string | null
          reason: string
          customer: Json | null
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
          customer?: Json | null
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
          customer?: Json | null
          user_id?: string
          items?: Json
          original_sale_id?: string
          date?: string
          total?: number
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
      financial_metrics: {
        Row: {
          id: string
          metric_type: string
          metric_name: string
          report_id: string
          metadata: Json | null
          updated_at: string
          percentage_change: number | null
          comparison_value: number | null
          value: number
          created_at: string
        }
        Insert: {
          id?: string
          metric_type: string
          metric_name: string
          report_id: string
          metadata?: Json | null
          updated_at?: string
          percentage_change?: number | null
          comparison_value?: number | null
          value: number
          created_at?: string
        }
        Update: {
          id?: string
          metric_type?: string
          metric_name?: string
          report_id?: string
          metadata?: Json | null
          updated_at?: string
          percentage_change?: number | null
          comparison_value?: number | null
          value?: number
          created_at?: string
        }
      }
      financial_reports: {
        Row: {
          id: string
          user_id: string
          period_start: string
          period_end: string
          total_revenue: number
          total_cost: number
          total_profit: number
          metrics: Json | null
          description: string | null
          title: string
          report_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          period_start: string
          period_end: string
          total_revenue?: number
          total_cost?: number
          total_profit?: number
          metrics?: Json | null
          description?: string | null
          title: string
          report_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          period_start?: string
          period_end?: string
          total_revenue?: number
          total_cost?: number
          total_profit?: number
          metrics?: Json | null
          description?: string | null
          title?: string
          report_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      meat_cuts: {
        Row: {
          id: string
          animal_type: string
          description: string | null
          name: string
          barcode: string | null
          price_per_kg: number
          cost_per_kg: number
          stock_weight: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          animal_type: string
          description?: string | null
          name: string
          barcode?: string | null
          price_per_kg: number
          cost_per_kg: number
          stock_weight?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          animal_type?: string
          description?: string | null
          name?: string
          barcode?: string | null
          price_per_kg?: number
          cost_per_kg?: number
          stock_weight?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
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
      storage_objects: {
        Row: {
          id: string
          name: string
          bucket_id: string
          updated_at: string | null
          created_at: string | null
          owner: string | null
          last_accessed_at: string | null
        }
        Insert: {
          id?: string
          name: string
          bucket_id: string
          updated_at?: string | null
          created_at?: string | null
          owner?: string | null
          last_accessed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          bucket_id?: string
          updated_at?: string | null
          created_at?: string | null
          owner?: string | null
          last_accessed_at?: string | null
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
      }
      flow_state: {
        Row: {
          auth_code: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at: string | null
          id: string
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string
          code_challenge?: string
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id?: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          identity_id: string
          last_sign_in_at: string | null
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          identity_data: Json
          identity_id: string
          last_sign_in_at?: string | null
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          identity_id?: string
          last_sign_in_at?: string | null
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: string
          verified_at: string | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: string
          verified_at?: string | null
        }
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_id: string
          factor_type: string
          friendly_name: string | null
          id: string
          secret: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at: string
          factor_id: string
          factor_type: string
          friendly_name?: string | null
          id: string
          secret?: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          factor_id?: string
          factor_type?: string
          friendly_name?: string | null
          id?: string
          secret?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
      }
      refresh_tokens: {
        Row: {
          created_at: string
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          for_email: string | null
          from_ip_address: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          for_email?: string | null
          from_ip_address?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          for_email?: string | null
          from_ip_address?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
      }
      sessions: {
        Row: {
          aal: string | null
          created_at: string
          id: string
          ip: string | null
          not_after: string | null
          refreshed_at: string | null
          updated_at: string | null
          user_id: string
          factor_id: string | null
          user_agent: string | null
        }
        Insert: {
          aal?: string | null
          created_at?: string
          id: string
          ip?: string | null
          not_after?: string | null
          refreshed_at?: string | null
          updated_at?: string | null
          user_id: string
          factor_id?: string | null
          user_agent?: string | null
        }
        Update: {
          aal?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          not_after?: string | null
          refreshed_at?: string | null
          updated_at?: string | null
          user_id?: string
          factor_id?: string | null
          user_agent?: string | null
        }
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
      }
      sso_providers: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          recovery_sent_at: string | null
          recovery_token: string | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          role?: string | null
          updated_at?: string | null
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
      code_challenge_method: "s256" | "plain"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
