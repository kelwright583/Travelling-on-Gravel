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
      adventures: {
        Row: {
          body: Json | null
          country: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: Json | null
          gallery: string[] | null
          id: string
          lat: number | null
          lng: number | null
          location: string | null
          published: boolean | null
          published_at: string | null
          slug: string
          sort_order: number | null
          tag: string | null
          title: Json
          updated_at: string | null
        }
        Insert: {
          body?: Json | null
          country?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: Json | null
          gallery?: string[] | null
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          published?: boolean | null
          published_at?: string | null
          slug: string
          sort_order?: number | null
          tag?: string | null
          title: Json
          updated_at?: string | null
        }
        Update: {
          body?: Json | null
          country?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: Json | null
          gallery?: string[] | null
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          published?: boolean | null
          published_at?: string | null
          slug?: string
          sort_order?: number | null
          tag?: string | null
          title?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: Json
          slug: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          name: Json
          slug: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          name?: Json
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      films: {
        Row: {
          created_at: string | null
          description: Json | null
          duration: string | null
          id: string
          published: boolean | null
          sort_order: number | null
          thumbnail: string | null
          title: Json
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string | null
          description?: Json | null
          duration?: string | null
          id?: string
          published?: boolean | null
          sort_order?: number | null
          thumbnail?: string | null
          title: Json
          youtube_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string | null
          description?: Json | null
          duration?: string | null
          id?: string
          published?: boolean | null
          sort_order?: number | null
          thumbnail?: string | null
          title?: Json
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      map_pins: {
        Row: {
          category: string | null
          country: string | null
          created_at: string | null
          id: string
          label: string
          lat: number
          lng: number
          note: Json | null
          related_post_id: string | null
        }
        Insert: {
          category?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          label: string
          lat: number
          lng: number
          note?: Json | null
          related_post_id?: string | null
        }
        Update: {
          category?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          label?: string
          lat?: number
          lng?: number
          note?: Json | null
          related_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_pins_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: Json | null
          caption: Json | null
          created_at: string | null
          height: number | null
          id: string
          storage_path: string
          tags: string[] | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: Json | null
          caption?: Json | null
          created_at?: string | null
          height?: number | null
          id?: string
          storage_path: string
          tags?: string[] | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: Json | null
          caption?: Json | null
          created_at?: string | null
          height?: number | null
          id?: string
          storage_path?: string
          tags?: string[] | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          body: Json | null
          category_id: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: Json | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          title: Json
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          body?: Json | null
          category_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: Json | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          title: Json
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          body?: Json | null
          category_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: Json | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          role?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          ai_notes: Json | null
          ai_reviewed: boolean | null
          author_id: string | null
          cook_method: string | null
          cook_minutes: number | null
          cover_image: string | null
          created_at: string | null
          difficulty: string | null
          equipment: Json | null
          gallery: string[] | null
          id: string
          ingredients: Json
          intro: Json | null
          prep_minutes: number | null
          published: boolean | null
          published_at: string | null
          servings: number | null
          slug: string
          sort_order: number | null
          steps: Json
          subtitle: Json | null
          tags: string[] | null
          tips: Json | null
          title: Json
          total_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          ai_notes?: Json | null
          ai_reviewed?: boolean | null
          author_id?: string | null
          cook_method?: string | null
          cook_minutes?: number | null
          cover_image?: string | null
          created_at?: string | null
          difficulty?: string | null
          equipment?: Json | null
          gallery?: string[] | null
          id?: string
          ingredients?: Json
          intro?: Json | null
          prep_minutes?: number | null
          published?: boolean | null
          published_at?: string | null
          servings?: number | null
          slug: string
          sort_order?: number | null
          steps?: Json
          subtitle?: Json | null
          tags?: string[] | null
          tips?: Json | null
          title: Json
          total_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_notes?: Json | null
          ai_reviewed?: boolean | null
          author_id?: string | null
          cook_method?: string | null
          cook_minutes?: number | null
          cover_image?: string | null
          created_at?: string | null
          difficulty?: string | null
          equipment?: Json | null
          gallery?: string[] | null
          id?: string
          ingredients?: Json
          intro?: Json | null
          prep_minutes?: number | null
          published?: boolean | null
          published_at?: string | null
          servings?: number | null
          slug?: string
          sort_order?: number | null
          steps?: Json
          subtitle?: Json | null
          tags?: string[] | null
          tips?: Json | null
          title?: Json
          total_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          fonts: Json
          hero_coords: string | null
          hero_image: string | null
          hero_line1: Json
          hero_line2: Json
          hero_location: string | null
          hero_subtitle: Json
          id: boolean
          socials: Json
          stats: Json
          theme: Json
          updated_at: string | null
        }
        Insert: {
          fonts?: Json
          hero_coords?: string | null
          hero_image?: string | null
          hero_line1?: Json
          hero_line2?: Json
          hero_location?: string | null
          hero_subtitle?: Json
          id?: boolean
          socials?: Json
          stats?: Json
          theme?: Json
          updated_at?: string | null
        }
        Update: {
          fonts?: Json
          hero_coords?: string | null
          hero_image?: string | null
          hero_line1?: Json
          hero_line2?: Json
          hero_location?: string | null
          hero_subtitle?: Json
          id?: boolean
          socials?: Json
          stats?: Json
          theme?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          confirm_token: string | null
          consent_at: string | null
          created_at: string | null
          email: string
          id: string
          locale: string | null
          source: string | null
          status: string
        }
        Insert: {
          confirm_token?: string | null
          consent_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          locale?: string | null
          source?: string | null
          status?: string
        }
        Update: {
          confirm_token?: string | null
          consent_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          locale?: string | null
          source?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
