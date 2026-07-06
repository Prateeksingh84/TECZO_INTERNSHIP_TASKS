/**
 * Supabase Configuration
 * ─────────────────────────────────────────────────────────────
 * Initializes the Supabase client for the DivingClub application.
 *
 * Prerequisites:
 *   The Supabase JS v2 library must be loaded via CDN before this file:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *
 * Usage:
 *   The initialized `supabase` client is available globally and consumed
 *   by every other module (auth.js, profiles, realtime, storage, etc.).
 * ─────────────────────────────────────────────────────────────
 */

// ── Project Credentials ──────────────────────────────────────
// Replace these placeholders with your actual Supabase project URL
// and anonymous (public) API key from the Supabase dashboard.
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// ── Client Initialization (safe – handles missing CDN) ───────
let supabase = null;

try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  } else {
    console.warn('[Supabase] CDN library not loaded. Running in demo mode.');
  }
} catch (err) {
  console.warn('[Supabase] Client initialization failed:', err.message);
}

// ── Helper ───────────────────────────────────────────────────
/**
 * Returns `true` when real Supabase credentials have been supplied
 * AND the client was successfully initialized.
 *
 * @returns {boolean}
 */
function isSupabaseConfigured() {
  return (
    supabase !== null &&
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
  );
}
