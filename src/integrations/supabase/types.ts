export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_documents: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          source: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          source?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          source?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          id: string
          scheduled_at: string | null
          service: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          scheduled_at?: string | null
          service?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          scheduled_at?: string | null
          service?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_contacts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          phone_number: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      instances: {
        Row: {
          automation_paused: boolean
          automation_paused_until: string | null
          connection_state: string | null
          created_at: string
          evolution_state: string | null
          id: string
          instance_name: string
          last_connected_at: string | null
          phone: string | null
          phone_number: string | null
          qr_code: string | null
          status: Database["public"]["Enums"]["instance_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          automation_paused?: boolean
          automation_paused_until?: string | null
          connection_state?: string | null
          created_at?: string
          evolution_state?: string | null
          id?: string
          instance_name: string
          last_connected_at?: string | null
          phone?: string | null
          phone_number?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["instance_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          automation_paused?: boolean
          automation_paused_until?: string | null
          connection_state?: string | null
          created_at?: string
          evolution_state?: string | null
          id?: string
          instance_name?: string
          last_connected_at?: string | null
          phone?: string | null
          phone_number?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["instance_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_queue: {
        Row: {
          attempts: number
          created_at: string
          external_message_id: string | null
          id: string
          instance_name: string
          last_error: string | null
          payload: Json
          remote_jid: string
          scheduled_for: string
          status: Database["public"]["Enums"]["queue_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          external_message_id?: string | null
          id?: string
          instance_name: string
          last_error?: string | null
          payload: Json
          remote_jid: string
          scheduled_for?: string
          status?: Database["public"]["Enums"]["queue_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          external_message_id?: string | null
          id?: string
          instance_name?: string
          last_error?: string | null
          payload?: Json
          remote_jid?: string
          scheduled_for?: string
          status?: Database["public"]["Enums"]["queue_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          ai_responded: boolean
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          external_id: string | null
          id: string
          kind: Database["public"]["Enums"]["message_kind"]
          media_url: string | null
          message_text: string | null
          phone_number: string
          user_id: string
          whatsapp_instance_id: string | null
        }
        Insert: {
          ai_responded?: boolean
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          external_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["message_kind"]
          media_url?: string | null
          message_text?: string | null
          phone_number: string
          user_id: string
          whatsapp_instance_id?: string | null
        }
        Update: {
          ai_responded?: boolean
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          external_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["message_kind"]
          media_url?: string | null
          message_text?: string | null
          phone_number?: string
          user_id?: string
          whatsapp_instance_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          reviewer_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          reviewer_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          reviewer_name?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          category_ids: string[] | null
          created_at: string
          description: string | null
          discount_price: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_sold_out: boolean
          name: string
          price: number
          rating_avg: number
          rating_count: number
          stock: number
          store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          category_ids?: string[] | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_sold_out?: boolean
          name: string
          price?: number
          rating_avg?: number
          rating_count?: number
          stock?: number
          store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          category_ids?: string[] | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_sold_out?: boolean
          name?: string
          price?: number
          rating_avg?: number
          rating_count?: number
          stock?: number
          store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_name: string | null
          ai_rules: string | null
          avatar_url: string | null
          business_description: string | null
          transfer_phone: string | null
          business_hours: Json | null
          business_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          free_messages_granted: boolean
          full_name: string | null
          id: string
          is_suspended: boolean
          message_limit: number
          messages_received: number
          onboarding_completed: boolean
          phone: string | null
          transfer_phone?: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_name?: string | null
          ai_rules?: string | null
          avatar_url?: string | null
          business_description?: string | null
          business_hours?: Json | null
          business_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          free_messages_granted?: boolean
          full_name?: string | null
          id?: string
          is_suspended?: boolean
          message_limit?: number
          messages_received?: number
          onboarding_completed?: boolean
          phone?: string | null
          transfer_phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_name?: string | null
          ai_rules?: string | null
          avatar_url?: string | null
          business_description?: string | null
          business_hours?: Json | null
          business_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          free_messages_granted?: boolean
          full_name?: string | null
          id?: string
          is_suspended?: boolean
          message_limit?: number
          messages_received?: number
          onboarding_completed?: boolean
          phone?: string | null
          transfer_phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_carousel_slides: {
        Row: {
          bg_color: string | null
          created_at: string
          id: string
          image_url: string | null
          link_url: string | null
          position: number
          store_id: string
          subtitle: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          position?: number
          store_id: string
          subtitle?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          position?: number
          store_id?: string
          subtitle?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      store_orders: {
        Row: {
          created_at: string
          customer_location: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          items: Json
          notes: string | null
          status: string
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_location?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_location?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          checkout_whatsapp: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          header_color: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          theme_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkout_whatsapp?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          header_color?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          theme_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkout_whatsapp?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          header_color?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          theme_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      top_up_packages: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          messages: number
          name: string
          position: number
          price_kz: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          messages: number
          name: string
          position?: number
          price_kz: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          messages?: number
          name?: string
          position?: number
          price_kz?: number
        }
        Relationships: []
      }
      top_up_requests: {
        Row: {
          amount_kz: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          messages: number
          package_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_kz: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          messages: number
          package_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_kz?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          messages?: number
          package_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "top_up_requests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "top_up_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          created_at: string
          id: string
          instance_name: string | null
          last_message_at: string | null
          name: string | null
          phone_number: string
          should_respond: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instance_name?: string | null
          last_message_at?: string | null
          name?: string | null
          phone_number: string
          should_respond?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instance_name?: string | null
          last_message_at?: string | null
          name?: string | null
          phone_number?: string
          should_respond?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      match_ai_documents: {
        Args: { _limit?: number; _query: string; _user_id: string }
        Returns: {
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "sub_admin" | "client"
      instance_status: "pending" | "connecting" | "connected" | "disconnected"
      message_direction: "inbound" | "outbound"
      message_kind:
        | "text"
        | "audio"
        | "image"
        | "video"
        | "document"
        | "sticker"
        | "location"
        | "contact"
        | "other"
      queue_status: "pending" | "processing" | "sent" | "failed" | "delivered"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "sub_admin", "client"],
      instance_status: ["pending", "connecting", "connected", "disconnected"],
      message_direction: ["inbound", "outbound"],
      message_kind: [
        "text",
        "audio",
        "image",
        "video",
        "document",
        "sticker",
        "location",
        "contact",
        "other",
      ],
      queue_status: ["pending", "processing", "sent", "failed", "delivered"],
    },
  },
} as const
