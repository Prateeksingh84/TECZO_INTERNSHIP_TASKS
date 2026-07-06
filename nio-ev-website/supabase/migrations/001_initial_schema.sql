-- ============================================
-- NIO EV Website - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CAR MODELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.car_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('EC', 'ET', 'ES')),
  tagline TEXT NOT NULL DEFAULT '',
  range_km INTEGER NOT NULL DEFAULT 0,
  top_speed_kmh INTEGER NOT NULL DEFAULT 0,
  acceleration_0_100 DECIMAL(4,1) NOT NULL DEFAULT 0,
  battery_kwh INTEGER NOT NULL DEFAULT 0,
  hero_image_url TEXT NOT NULL DEFAULT '',
  side_image_url TEXT NOT NULL DEFAULT '',
  price_usd INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_car_models_category ON public.car_models(category);
CREATE INDEX idx_car_models_featured ON public.car_models(is_featured);
CREATE INDEX idx_car_models_order ON public.car_models(display_order);

-- ============================================
-- FEATURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_features_order ON public.features(display_order);

-- ============================================
-- COMMUNITY POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_posts_user ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);

-- ============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);

-- ============================================
-- CONTACT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'responded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_created ON public.contact_submissions(created_at DESC);

-- ============================================
-- SITE CONTENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_content_key ON public.site_content(section_key);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Car Models: Public read, admin write
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Car models are viewable by everyone" ON public.car_models
  FOR SELECT USING (true);
CREATE POLICY "Car models are editable by authenticated users" ON public.car_models
  FOR ALL USING (auth.role() = 'authenticated');

-- Features: Public read, admin write
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Features are viewable by everyone" ON public.features
  FOR SELECT USING (true);
CREATE POLICY "Features are editable by authenticated users" ON public.features
  FOR ALL USING (auth.role() = 'authenticated');

-- Community Posts: Public read, authenticated create
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts
  FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Newsletter: Insert only, admin read
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Newsletter list viewable by authenticated users" ON public.newsletter_subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Contact Submissions: Insert only, admin read
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Contact submissions viewable by authenticated users" ON public.contact_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Site Content: Public read, admin write
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content is viewable by everyone" ON public.site_content
  FOR SELECT USING (true);
CREATE POLICY "Site content is editable by authenticated users" ON public.site_content
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_car_models_updated_at
  BEFORE UPDATE ON public.car_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.car_models;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
