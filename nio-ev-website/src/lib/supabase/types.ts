export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      car_models: {
        Row: {
          id: string;
          name: string;
          category: string;
          tagline: string;
          range_km: number;
          top_speed_kmh: number;
          acceleration_0_100: number;
          battery_kwh: number;
          hero_image_url: string;
          side_image_url: string;
          price_usd: number;
          is_featured: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['car_models']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['car_models']['Insert']>;
      };
      features: {
        Row: {
          id: string;
          number: string;
          title: string;
          description: string;
          icon_url: string;
          display_order: number;
        };
        Insert: Omit<Database['public']['Tables']['features']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['features']['Insert']>;
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          image_url: string;
          likes_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['community_posts']['Row'], 'id' | 'created_at' | 'likes_count'>;
        Update: Partial<Database['public']['Tables']['community_posts']['Insert']>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          is_active: boolean;
        };
        Insert: { email: string };
        Update: { is_active?: boolean };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contact_submissions']['Row'], 'id' | 'created_at' | 'status'>;
        Update: { status?: string };
      };
      site_content: {
        Row: {
          id: string;
          section_key: string;
          title: string;
          subtitle: string;
          body: string;
          image_url: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['site_content']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['site_content']['Insert']>;
      };
    };
  };
}
