/**
 * ============================================================================
 * Realtime Module — DivingClub
 * ============================================================================
 *
 * Manages Supabase Realtime subscriptions for live data synchronisation.
 *
 * Each database table of interest gets its own dedicated channel so that
 * subscriptions can be managed (and torn down) independently.
 *
 * Dependencies:
 *   - Global `supabase` client  (initialised elsewhere)
 *   - Global `isSupabaseConfigured` helper
 *   - Global `DataService` object (data-service.js) — for re-rendering data
 *   - Global `Auth` object        (auth.js)         — for current user context
 *   - Global `Toast` object       (toast.js)        — for notifications
 *
 * All public methods live on the `Realtime` global.
 * ============================================================================
 */

const Realtime = {

  /* ── State ─────────────────────────────────────────────────────────────── */

  /** @type {import('@supabase/supabase-js').RealtimeChannel[]} Active channel refs */
  channels: [],

  /* ── Public API ────────────────────────────────────────────────────────── */

  /**
   * Bootstrap all Realtime subscriptions.
   * Only runs when Supabase is properly configured.
   */
  init() {
    if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured()) {
      console.warn('[Realtime] Supabase is not configured — skipping subscriptions.');
      return;
    }

    this.subscribeToBlogPosts();
    this.subscribeToActivities();
    this.subscribeToMoments();
    this.subscribeToSubscribers();
    this.subscribeToStats();
    this.subscribeToProfile();

    console.log('[Realtime] All channels subscribed.');
  },

  /* ── Blog Posts ─────────────────────────────────────────────────────────── */

  /**
   * Subscribe to INSERT, UPDATE, and DELETE events on the `blog_posts` table.
   * Re-renders the blog post list on any change.
   */
  subscribeToBlogPosts() {
    const channel = supabase
      .channel('realtime-blog-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'blog_posts' },
        (payload) => {
          console.log('[Realtime] blog_posts INSERT:', payload);
          this._safeCall(() => DataService.loadBlogPosts());
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blog_posts' },
        (payload) => {
          console.log('[Realtime] blog_posts UPDATE:', payload);
          this._safeCall(() => DataService.loadBlogPosts());
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'blog_posts' },
        (payload) => {
          console.log('[Realtime] blog_posts DELETE:', payload);
          this._safeCall(() => DataService.loadBlogPosts());
        },
      )
      .subscribe((status) => {
        this._logChannelStatus('blog_posts', status);
      });

    this.channels.push(channel);
  },

  /* ── Activities ────────────────────────────────────────────────────────── */

  /**
   * Subscribe to changes on the `activities` table.
   */
  subscribeToActivities() {
    const channel = supabase
      .channel('realtime-activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload) => {
          console.log('[Realtime] activities change:', payload.eventType);
          this._safeCall(() => DataService.loadActivities());
        },
      )
      .subscribe((status) => {
        this._logChannelStatus('activities', status);
      });

    this.channels.push(channel);
  },

  /* ── Moments ───────────────────────────────────────────────────────────── */

  /**
   * Subscribe to changes on the `moments` table.
   */
  subscribeToMoments() {
    const channel = supabase
      .channel('realtime-moments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'moments' },
        (payload) => {
          console.log('[Realtime] moments change:', payload.eventType);
          this._safeCall(() => DataService.loadMoments());
        },
      )
      .subscribe((status) => {
        this._logChannelStatus('moments', status);
      });

    this.channels.push(channel);
  },

  /* ── Subscribers ───────────────────────────────────────────────────────── */

  /**
   * Subscribe to INSERT events on the `subscribers` table.
   * Displays a subtle notification when a new subscriber joins.
   */
  subscribeToSubscribers() {
    const channel = supabase
      .channel('realtime-subscribers')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'subscribers' },
        (payload) => {
          console.log('[Realtime] subscribers INSERT:', payload);

          // Subtle celebration toast
          if (typeof Toast !== 'undefined') {
            Toast.show('🎉 Someone just subscribed!', 'success');
          }

          // If there is a subscriber count element, bump it
          const countEl = document.getElementById('subscriber-count');
          if (countEl) {
            const current = parseInt(countEl.textContent, 10) || 0;
            countEl.textContent = current + 1;
            // Quick pulse animation
            countEl.classList.add('pulse');
            setTimeout(() => countEl.classList.remove('pulse'), 600);
          }
        },
      )
      .subscribe((status) => {
        this._logChannelStatus('subscribers', status);
      });

    this.channels.push(channel);
  },

  /* ── Site Stats ────────────────────────────────────────────────────────── */

  /**
   * Subscribe to UPDATE events on the `site_stats` table.
   * Refreshes stat counter elements on the page.
   */
  subscribeToStats() {
    const channel = supabase
      .channel('realtime-site-stats')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_stats' },
        (payload) => {
          console.log('[Realtime] site_stats UPDATE:', payload);
          const newRecord = payload.new;

          if (newRecord) {
            // Attempt to update known stat counter elements
            this._updateStatElement('stat-members',    newRecord.total_members);
            this._updateStatElement('stat-dives',      newRecord.total_dives);
            this._updateStatElement('stat-activities',  newRecord.total_activities);
            this._updateStatElement('stat-locations',   newRecord.total_locations);
          }
        },
      )
      .subscribe((status) => {
        this._logChannelStatus('site_stats', status);
      });

    this.channels.push(channel);
  },

  /* ── Profile (current user) ────────────────────────────────────────────── */

  /**
   * Subscribe to UPDATE events on the current user's row in `profiles`.
   * Refreshes cached profile data when changed externally.
   */
  subscribeToProfile() {
    // Determine the current user id synchronously from cached Auth data
    const userId = this._getCurrentUserId();
    if (!userId) {
      console.warn('[Realtime] No user id available — skipping profile subscription.');
      return;
    }

    const channel = supabase
      .channel('realtime-profile')
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] profile UPDATE:', payload);

          const updated = payload.new;

          // Sync cached profile on Auth
          if (typeof Auth !== 'undefined' && Auth.currentProfile) {
            Object.assign(Auth.currentProfile, updated);
          }

          // Refresh avatar UI if Profile module is loaded
          if (typeof Profile !== 'undefined' && typeof Profile.updateAvatarUI === 'function') {
            Profile.updateAvatarUI(updated.avatar_url || null);
          }
        },
      )
      .subscribe((status) => {
        this._logChannelStatus('profile', status);
      });

    this.channels.push(channel);
  },

  /* ── Cleanup ───────────────────────────────────────────────────────────── */

  /**
   * Unsubscribe from all active channels.
   * Should be called on user sign-out to free resources.
   */
  cleanup() {
    this.channels.forEach((channel) => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('[Realtime] Error removing channel:', err);
      }
    });

    this.channels = [];
    console.log('[Realtime] All channels unsubscribed.');
  },

  /* ── Internal helpers ──────────────────────────────────────────────────── */

  /**
   * Safely call a callback, catching and logging any errors.
   *
   * @param {Function} fn
   * @private
   */
  _safeCall(fn) {
    try {
      const result = fn();
      // Handle promise rejections if the callback is async
      if (result && typeof result.catch === 'function') {
        result.catch((err) => {
          console.error('[Realtime] Async callback error:', err);
        });
      }
    } catch (err) {
      console.error('[Realtime] Callback error:', err);
    }
  },

  /**
   * Log a channel's subscription status.
   *
   * @param {string} name   – human-readable channel name
   * @param {string} status – Supabase channel status string
   * @private
   */
  _logChannelStatus(name, status) {
    if (status === 'SUBSCRIBED') {
      console.log(`[Realtime] ✔ ${name} channel subscribed.`);
    } else if (status === 'CHANNEL_ERROR') {
      console.error(`[Realtime] ✖ ${name} channel error.`);
    } else if (status === 'TIMED_OUT') {
      console.warn(`[Realtime] ⏱ ${name} channel timed out.`);
    } else {
      console.log(`[Realtime] ${name} status: ${status}`);
    }
  },

  /**
   * Attempt to resolve the current user's ID from cached Auth data.
   *
   * @returns {string|null}
   * @private
   */
  _getCurrentUserId() {
    if (typeof Auth !== 'undefined' && Auth.currentProfile && Auth.currentProfile.id) {
      return Auth.currentProfile.id;
    }

    // Fallback: try to read from the Supabase session synchronously
    try {
      const sessionData = supabase.auth.session && supabase.auth.session();
      if (sessionData && sessionData.user) {
        return sessionData.user.id;
      }
    } catch (_) {
      // Ignored — session() may not exist in newer client versions
    }

    return null;
  },

  /**
   * Update a stat counter element's text content.
   *
   * @param {string}          elementId – DOM id of the stat element
   * @param {number|undefined} value    – new value to display
   * @private
   */
  _updateStatElement(elementId, value) {
    if (value === undefined || value === null) return;

    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = Number(value).toLocaleString();
      // Brief highlight animation
      el.classList.add('stat-updated');
      setTimeout(() => el.classList.remove('stat-updated'), 800);
    }
  },
};

/* ── Bootstrap ─────────────────────────────────────────────────────────────── */

Realtime.init();
