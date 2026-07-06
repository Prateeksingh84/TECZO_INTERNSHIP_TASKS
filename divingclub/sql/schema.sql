-- ============================================================================
-- DivingClub — Supabase Database Schema
-- Production-Level Schema with RLS, Functions, Triggers & Seed Data
-- Generated: 2025
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable UUID generation (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 profiles — User profiles linked to Supabase Auth
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    avatar_url  TEXT,
    phone       TEXT,
    bio         TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Public user profiles, one-to-one with auth.users.';

-- ----------------------------------------------------------------------------
-- 2.2 blog_posts — Blog / news articles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blog_posts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT NOT NULL,
    excerpt      TEXT,
    content      TEXT,
    image_url    TEXT,
    author_name  TEXT,
    read_time    INT DEFAULT 5,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE blog_posts IS 'Blog articles displayed on the public site.';

-- ----------------------------------------------------------------------------
-- 2.3 activities — Diving activities / programs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    image_url   TEXT,
    category    TEXT,
    description TEXT,
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE activities IS 'Diving activity cards shown on the homepage.';

-- ----------------------------------------------------------------------------
-- 2.4 moments — Featured diving experiences / packages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS moments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT NOT NULL,
    description  TEXT,
    image_url    TEXT,
    price        DECIMAL(10,2),
    rating       DECIMAL(3,1) DEFAULT 0,
    review_count INT DEFAULT 0,
    is_featured  BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE moments IS 'Diving experience packages with pricing and ratings.';

-- ----------------------------------------------------------------------------
-- 2.5 subscribers — Newsletter email list
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscribers (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active     BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE subscribers IS 'Newsletter subscribers. Insert-only for public users.';

-- ----------------------------------------------------------------------------
-- 2.6 bookings — Booking / enquiry requests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name         TEXT NOT NULL,
    email        TEXT NOT NULL,
    phone        TEXT,
    message      TEXT,
    booking_type TEXT DEFAULT 'general'
                 CHECK (booking_type IN ('general', 'course', 'diving', 'event')),
    status       TEXT DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE bookings IS 'Customer booking requests and enquiries.';

-- ----------------------------------------------------------------------------
-- 2.7 site_stats — Key-value counters for site statistics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_stats (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_key   TEXT UNIQUE NOT NULL,
    stat_value INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE site_stats IS 'Global site statistics displayed on the homepage.';


-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on every table
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats  ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 profiles
-- ----------------------------------------------------------------------------

-- Anyone can read profiles
CREATE POLICY "profiles: public read"
    ON profiles FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles: insert own"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles: update own"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles: delete own"
    ON profiles FOR DELETE
    USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 4.2 blog_posts — Public read-only
-- ----------------------------------------------------------------------------

CREATE POLICY "blog_posts: public read"
    ON blog_posts FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 4.3 activities — Public read, only active items
-- ----------------------------------------------------------------------------

CREATE POLICY "activities: public read active"
    ON activities FOR SELECT
    USING (is_active = true);

-- ----------------------------------------------------------------------------
-- 4.4 moments — Public read-only
-- ----------------------------------------------------------------------------

CREATE POLICY "moments: public read"
    ON moments FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 4.5 subscribers — Insert for anon/authenticated, read restricted
-- ----------------------------------------------------------------------------

-- Anyone (anonymous or authenticated) can subscribe
CREATE POLICY "subscribers: public insert"
    ON subscribers FOR INSERT
    WITH CHECK (true);

-- Only service_role can read subscribers (enforced by RLS; service_role
-- bypasses RLS by default, so no explicit SELECT policy is needed for it.
-- Omitting a SELECT policy means no regular user can read.)

-- ----------------------------------------------------------------------------
-- 4.6 bookings — Insert for anyone, read/update own only
-- ----------------------------------------------------------------------------

-- Anyone can create a booking
CREATE POLICY "bookings: public insert"
    ON bookings FOR INSERT
    WITH CHECK (true);

-- Authenticated users can view their own bookings
CREATE POLICY "bookings: select own"
    ON bookings FOR SELECT
    USING (auth.uid() = user_id);

-- Authenticated users can update their own bookings
CREATE POLICY "bookings: update own"
    ON bookings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4.7 site_stats — Public read-only
-- ----------------------------------------------------------------------------

CREATE POLICY "site_stats: public read"
    ON site_stats FOR SELECT
    USING (true);


-- ============================================================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 handle_new_user()
--     Automatically creates a profile row when a new user signs up.
--     Extracts full_name from auth.users.raw_user_meta_data.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
    );
    RETURN NEW;
END;
$$;

-- Trigger: fire after a new row is inserted into auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5.2 handle_updated_at()
--     Automatically sets updated_at = NOW() on row update.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger: auto-update updated_at on profiles
CREATE OR REPLACE TRIGGER on_profiles_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: auto-update updated_at on site_stats
CREATE OR REPLACE TRIGGER on_site_stats_updated
    BEFORE UPDATE ON site_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5.3 increment_stat(stat_key TEXT)
--     Increments a stat_value by 1. Creates the row if it doesn't exist.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_stat(target_key TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.site_stats (stat_key, stat_value)
    VALUES (target_key, 1)
    ON CONFLICT (stat_key)
    DO UPDATE SET
        stat_value = site_stats.stat_value + 1,
        updated_at = NOW();
END;
$$;


-- ============================================================================
-- 6. INDEXES (Performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_sort_order   ON activities (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_activities_is_active     ON activities (is_active);
CREATE INDEX IF NOT EXISTS idx_moments_is_featured      ON moments (is_featured);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id         ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status          ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email        ON subscribers (email);
CREATE INDEX IF NOT EXISTS idx_site_stats_stat_key      ON site_stats (stat_key);


-- ============================================================================
-- 7. SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 Blog Posts
-- ----------------------------------------------------------------------------
INSERT INTO blog_posts (title, excerpt, content, image_url, author_name, read_time, published_at) VALUES
(
    'Improve Your Lung Capacity',
    'Discover proven breathing techniques that will help you stay longer and more comfortable underwater. Master the art of efficient air consumption.',
    'Breathing efficiently underwater is one of the most critical skills for any diver. In this article we cover diaphragmatic breathing, skip breathing, and relaxation techniques that dramatically improve your bottom time.',
    'images/blog_1.jpg',
    'DivingClub Team',
    5,
    '2025-02-13T00:00:00Z'
),
(
    'Divingclub Just The Essential Tips To Start Your Journey',
    'Starting your diving journey can feel overwhelming. Here are the essential tips every beginner needs to know before taking the plunge.',
    'From choosing the right certification agency to selecting your first set of gear, this guide walks you through everything you need to embark on your diving adventure with confidence.',
    'images/blog_2.jpg',
    'DivingClub Team',
    5,
    '2025-02-13T00:00:00Z'
),
(
    'Why It''s More Than Just A Sport The Benefits Of Divingclub',
    'Diving isn''t just an adrenaline rush — it improves mental health, builds community, and connects you with nature in a way no other activity can.',
    'Beyond the thrill of exploring the underwater world, diving offers tangible health benefits including stress reduction, improved cardiovascular fitness, and a profound sense of mindfulness that carries over into daily life.',
    'images/blog_3.jpg',
    'DivingClub Team',
    5,
    '2025-02-15T00:00:00Z'
);

-- ----------------------------------------------------------------------------
-- 7.2 Activities
-- ----------------------------------------------------------------------------
INSERT INTO activities (title, image_url, category, description, sort_order) VALUES
(
    'LEARN TO DIVING',
    'images/diving_activity_1.jpg',
    'beginner',
    'Perfect for first-timers. Learn the fundamentals of scuba diving in a safe and supportive environment.',
    1
),
(
    'COURSES FOR DIVERS',
    'images/diving_activity_2.jpg',
    'intermediate',
    'Take your skills to the next level with our intermediate certification courses and guided dives.',
    2
),
(
    'LEARN TO DIVE',
    'images/diving_activity_3.jpg',
    'advanced',
    'Master advanced diving techniques including deep dives, wreck exploration, and night diving.',
    3
);

-- ----------------------------------------------------------------------------
-- 7.3 Moments (Experiences / Packages)
-- ----------------------------------------------------------------------------
INSERT INTO moments (title, description, image_url, price, rating, review_count) VALUES
(
    'Discover Scuba Diving',
    'Take Your First Breaths Under Water',
    'images/moment_1.jpg',
    180.00,
    4.5,
    4
),
(
    'Advanced Open Water',
    'Explore Deeper Underwater Worlds',
    'images/moment_2.jpg',
    250.00,
    5.0,
    8
),
(
    'Night Diving Experience',
    'Discover The Ocean After Dark',
    'images/moment_3.jpg',
    320.00,
    4.8,
    12
);

-- ----------------------------------------------------------------------------
-- 7.4 Site Statistics
-- ----------------------------------------------------------------------------
INSERT INTO site_stats (stat_key, stat_value) VALUES
    ('members_count',    500),
    ('dives_completed', 2500),
    ('courses_offered',   15);


-- ============================================================================
-- 8. REALTIME
-- ============================================================================

-- Enable Supabase Realtime for selected tables
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts, activities, moments, subscribers, site_stats, profiles;


-- ============================================================================
-- 9. STORAGE (Manual Setup Required)
-- ============================================================================

-- NOTE: Supabase Storage buckets cannot be created via SQL.
-- You must create them manually in the Supabase Dashboard:
--
--   1. Go to Storage in your Supabase project dashboard.
--   2. Click "New Bucket" and name it: avatars
--   3. Enable "Public bucket" so avatar URLs are publicly accessible.
--   4. Under bucket settings, set:
--        • Max file size:      2 MB  (2097152 bytes)
--        • Allowed MIME types: image/jpeg, image/png, image/webp
--   5. Optionally add a storage policy:
--        - Allow authenticated users to upload to their own folder:
--          INSERT policy with check: (bucket_id = 'avatars') AND (auth.uid()::text = (storage.foldername(name))[1])
--        - Allow public read:
--          SELECT policy with check: (bucket_id = 'avatars')
--
-- ============================================================================

-- End of schema
