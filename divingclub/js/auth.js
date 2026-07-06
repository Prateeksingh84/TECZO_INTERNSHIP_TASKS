/**
 * Auth Module – DivingClub
 * ─────────────────────────────────────────────────────────────
 * Production-level authentication layer built on top of the
 * global `supabase` client initialised in supabase-config.js.
 *
 * Exposes a single global `Auth` object with methods for
 * sign-up, sign-in, sign-out, account deletion, profile
 * fetching, and UI synchronisation.
 *
 * Dependencies (loaded before this file):
 *   • supabase-config.js  → `supabase`, `isSupabaseConfigured()`
 *   • toast.js (or inline) → `Toast.show(message, type)`
 * ─────────────────────────────────────────────────────────────
 */

/* ================================================================
   Auth – Public API
   ================================================================ */
const Auth = {
  /** @type {import('@supabase/supabase-js').User | null} */
  currentUser: null,

  /** @type {Object | null} – Row from the `profiles` table */
  currentProfile: null,

  /* ──────────────────────────────────────────────────────────
     init()
     Check for an existing session, hydrate state, bind the
     realtime auth listener, and wire up DOM event handlers.
     ────────────────────────────────────────────────────────── */
  async init() {
    try {
      // Guard: if Supabase is not configured fall back to demo mode.
      if (!isSupabaseConfigured()) {
        console.warn(
          '[Auth] Supabase is not configured – running in demo / offline mode. ' +
          'Set SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js to enable authentication.'
        );
        this.updateAuthUI(null);
        this._bindDOMEvents();
        return;
      }

      // Attempt to recover an existing session from localStorage.
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[Auth] Failed to retrieve session:', error.message);
      }

      if (session?.user) {
        this.currentUser = session.user;
        this.currentProfile = await this.fetchProfile(session.user.id);
        this.updateAuthUI(session.user);
      } else {
        this.updateAuthUI(null);
      }

      // ── Realtime auth state listener ───────────────────────
      supabase.auth.onAuthStateChange(async (event, session) => {
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED': {
            const user = session?.user ?? null;
            this.currentUser = user;
            if (user) {
              this.currentProfile = await this.fetchProfile(user.id);
            }
            this.updateAuthUI(user);
            break;
          }

          case 'SIGNED_OUT': {
            this.currentUser = null;
            this.currentProfile = null;
            this.updateAuthUI(null);
            break;
          }

          default:
            break;
        }
      });

      // Bind DOM events (forms, buttons, tabs).
      this._bindDOMEvents();
    } catch (err) {
      console.error('[Auth] Initialisation error:', err);
    }
  },

  /* ──────────────────────────────────────────────────────────
     signUp(email, password, fullName)
     Register a new user with email + password.
     `fullName` is stored in user_metadata so a database trigger
     can copy it into the `profiles` table automatically.
     ────────────────────────────────────────────────────────── */
  async signUp(email, password, fullName) {
    try {
      if (!isSupabaseConfigured()) {
        Toast.show('Authentication is not available in demo mode.', 'error');
        return { user: null, error: new Error('Supabase not configured') };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        Toast.show(error.message, 'error');
        return { user: null, error };
      }

      // Supabase may require email confirmation – let the user know.
      if (data.user && !data.session) {
        Toast.show(
          'Account created! Please check your email to confirm your address.',
          'success'
        );
      } else {
        Toast.show('Welcome to DivingClub! 🤿', 'success');
        this.hideAuthModal();
      }

      return { user: data.user, error: null };
    } catch (err) {
      console.error('[Auth] signUp error:', err);
      Toast.show('An unexpected error occurred during sign-up.', 'error');
      return { user: null, error: err };
    }
  },

  /* ──────────────────────────────────────────────────────────
     signIn(email, password)
     Authenticate with email + password.
     ────────────────────────────────────────────────────────── */
  async signIn(email, password) {
    try {
      if (!isSupabaseConfigured()) {
        Toast.show('Authentication is not available in demo mode.', 'error');
        return { user: null, error: new Error('Supabase not configured') };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        Toast.show(error.message, 'error');
        return { user: null, error };
      }

      Toast.show('Signed in successfully. Welcome back!', 'success');
      this.hideAuthModal();
      return { user: data.user, error: null };
    } catch (err) {
      console.error('[Auth] signIn error:', err);
      Toast.show('An unexpected error occurred during sign-in.', 'error');
      return { user: null, error: err };
    }
  },

  /* ──────────────────────────────────────────────────────────
     signOut()
     End the current session and reset client-side state.
     ────────────────────────────────────────────────────────── */
  async signOut() {
    try {
      if (!isSupabaseConfigured()) {
        Toast.show('Authentication is not available in demo mode.', 'error');
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[Auth] signOut error:', error.message);
        Toast.show('Failed to sign out. Please try again.', 'error');
        return;
      }

      this.currentUser = null;
      this.currentProfile = null;
      this.updateAuthUI(null);
      Toast.show('You have been signed out.', 'info');
    } catch (err) {
      console.error('[Auth] signOut error:', err);
      Toast.show('An unexpected error occurred while signing out.', 'error');
    }
  },

  /* ──────────────────────────────────────────────────────────
     deleteAccount()
     Soft-delete workflow:
       1. Remove the user's avatar from the 'avatars' storage bucket.
       2. Delete the profile row (RLS policy: auth.uid() = id).
       3. Sign the user out.

     NOTE: The Supabase client SDK does **not** expose
     `auth.admin.deleteUser()` — that requires the service_role
     key which must never be used client-side.  In production
     you would invoke a Supabase Edge Function (or server-side
     endpoint) with the service_role key to permanently remove
     the row from `auth.users`.
     ────────────────────────────────────────────────────────── */
  async deleteAccount() {
    try {
      if (!isSupabaseConfigured()) {
        Toast.show('Authentication is not available in demo mode.', 'error');
        return;
      }

      if (!this.currentUser) {
        Toast.show('No user is currently signed in.', 'error');
        return;
      }

      const userId = this.currentUser.id;

      // 1. Delete avatar from storage (if one exists).
      if (this.currentProfile?.avatar_url) {
        try {
          // avatar_url is typically stored as the storage path,
          // e.g. "avatars/<userId>/photo.jpg".  Extract the path
          // relative to the bucket root.
          const avatarPath = this.currentProfile.avatar_url;
          const { error: storageError } = await supabase
            .storage
            .from('avatars')
            .remove([avatarPath]);

          if (storageError) {
            console.warn('[Auth] Could not delete avatar:', storageError.message);
            // Non-fatal – continue with account deletion.
          }
        } catch (storageErr) {
          console.warn('[Auth] Avatar deletion threw:', storageErr);
        }
      }

      // 2. Delete the profile row.
      //    RLS should permit this because the policy is:
      //    `auth.uid() = id`
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('[Auth] Profile deletion failed:', profileError.message);
        Toast.show('Could not delete your profile. Please contact support.', 'error');
        return;
      }

      // 3. Sign the user out.
      await supabase.auth.signOut();

      this.currentUser = null;
      this.currentProfile = null;
      this.updateAuthUI(null);

      // In production, call an Edge Function here:
      // await supabase.functions.invoke('delete-user', { body: { userId } });
      Toast.show(
        'Your account has been scheduled for deletion. An admin will finalise the process shortly.',
        'info'
      );
    } catch (err) {
      console.error('[Auth] deleteAccount error:', err);
      Toast.show('An unexpected error occurred while deleting your account.', 'error');
    }
  },

  /* ──────────────────────────────────────────────────────────
     fetchProfile(userId)
     Retrieve a single row from the `profiles` table.
     Returns the profile object or null.
     ────────────────────────────────────────────────────────── */
  async fetchProfile(userId) {
    try {
      if (!isSupabaseConfigured()) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] fetchProfile error:', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[Auth] fetchProfile error:', err);
      return null;
    }
  },

  /* ──────────────────────────────────────────────────────────
     updateAuthUI(user)
     Synchronise the navigation bar with the current auth state.

     Expected DOM contract:
       #auth-logged-in   – container shown when authenticated
       #auth-logged-out  – container shown when anonymous
       #nav-user-avatar  – <img> for the user's avatar
       #nav-user-name    – element whose textContent = display name
     ────────────────────────────────────────────────────────── */
  updateAuthUI(user) {
    const loggedInEl  = document.getElementById('auth-logged-in');
    const loggedOutEl = document.getElementById('auth-logged-out');
    const avatarEl    = document.getElementById('nav-user-avatar');
    const nameEl      = document.getElementById('nav-user-name');

    if (user) {
      // ── Authenticated state ──
      if (loggedInEl)  loggedInEl.classList.remove('hidden');
      if (loggedOutEl) loggedOutEl.classList.add('hidden');

      // Prefer profile data; fall back to user_metadata.
      const displayName =
        this.currentProfile?.full_name ||
        user.user_metadata?.full_name ||
        user.email;

      const avatarUrl =
        this.currentProfile?.avatar_url ||
        user.user_metadata?.avatar_url ||
        null;

      if (nameEl) nameEl.textContent = displayName;

      if (avatarEl) {
        if (avatarUrl) {
          avatarEl.src = avatarUrl;
          avatarEl.alt = `${displayName}'s avatar`;
        } else {
          // Fallback: first-letter placeholder via UI Avatars.
          avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
          avatarEl.alt = `${displayName}'s avatar`;
        }
      }
    } else {
      // ── Anonymous state ──
      if (loggedInEl)  loggedInEl.classList.add('hidden');
      if (loggedOutEl) loggedOutEl.classList.remove('hidden');

      if (nameEl)   nameEl.textContent = '';
      if (avatarEl) avatarEl.src = '';
    }
  },

  /* ──────────────────────────────────────────────────────────
     showAuthModal(tab)
     Display the authentication modal and activate the requested
     tab ('login' or 'signup').
     ────────────────────────────────────────────────────────── */
  showAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) {
      console.warn('[Auth] #auth-modal not found in DOM.');
      return;
    }

    modal.classList.remove('hidden');
    modal.classList.add('active');
    this._switchTab(tab);
  },

  /* ──────────────────────────────────────────────────────────
     hideAuthModal()
     ────────────────────────────────────────────────────────── */
  hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    modal.classList.remove('active');
  },

  /* ================================================================
     Private helpers
     ================================================================ */

  /**
   * Switch between login / signup tabs inside the auth modal.
   * @param {'login'|'signup'} tab
   * @private
   */
  _switchTab(tab) {
    const loginTab  = document.getElementById('auth-login-tab');
    const signupTab = document.getElementById('auth-signup-tab');
    const tabBtns   = document.querySelectorAll('.auth-tab-btn');

    if (loginTab && signupTab) {
      if (tab === 'signup') {
        loginTab.classList.add('hidden');
        loginTab.classList.remove('active');
        signupTab.classList.remove('hidden');
        signupTab.classList.add('active');
      } else {
        signupTab.classList.add('hidden');
        signupTab.classList.remove('active');
        loginTab.classList.remove('hidden');
        loginTab.classList.add('active');
      }
    }

    // Highlight the active tab button.
    tabBtns.forEach((btn) => {
      const btnTab = btn.dataset.tab; // e.g. data-tab="login"
      if (btnTab === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  /**
   * Bind all DOM event listeners for authentication forms,
   * buttons, and tab controls.  Idempotent – safe to call
   * more than once (listeners are only attached if elements exist).
   * @private
   */
  _bindDOMEvents() {
    // ── Login form ──
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = loginForm.querySelector('[name="email"]')?.value.trim();
        const password = loginForm.querySelector('[name="password"]')?.value;

        if (!email || !password) {
          Toast.show('Please fill in all fields.', 'error');
          return;
        }

        // Disable the submit button to prevent double-clicks.
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        await this.signIn(email, password);

        if (submitBtn) submitBtn.disabled = false;
      });
    }

    // ── Signup form ──
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = signupForm.querySelector('[name="full_name"]')?.value.trim();
        const email    = signupForm.querySelector('[name="email"]')?.value.trim();
        const password = signupForm.querySelector('[name="password"]')?.value;

        if (!email || !password || !fullName) {
          Toast.show('Please fill in all fields.', 'error');
          return;
        }

        const submitBtn = signupForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        await this.signUp(email, password, fullName);

        if (submitBtn) submitBtn.disabled = false;
      });
    }

    // ── Logout button ──
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.signOut();
      });
    }

    // ── Tab switching buttons ──
    const tabBtns = document.querySelectorAll('.auth-tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab || 'login';
        this._switchTab(tab);
      });
    });

    // ── Close modal on backdrop click ──
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        // Only close if the click is directly on the backdrop overlay,
        // not on the modal content itself.
        if (e.target === modal) {
          this.hideAuthModal();
        }
      });
    }
  }
};

/* ================================================================
   Bootstrap
   ================================================================ */
// Wait for the DOM to be ready, then initialise authentication.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
  // DOM already parsed (script loaded with `defer` or at end of body).
  Auth.init();
}
