export interface CarModel {
  id: string;
  name: string;
  category: 'EC' | 'ET' | 'ES';
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
}

export interface Feature {
  id: string;
  number: string;
  title: string;
  description: string;
  icon_url: string;
  display_order: number;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string;
  likes_count: number;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'reviewed' | 'responded';
  created_at: string;
}

export interface SiteContent {
  id: string;
  section_key: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  updated_at: string;
}
