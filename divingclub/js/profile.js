/**
 * ============================================================================
 * Profile Module — DivingClub
 * ============================================================================
 *
 * Handles user profile management including:
 *   • Viewing and editing profile data (full_name, phone, bio)
 *   • Avatar selection, cropping (via Cropper.js), and upload to Supabase Storage
 *   • Avatar removal and account deletion
 *
 * Dependencies:
 *   - Global `supabase` client (initialised elsewhere)
 *   - Global `Auth` object  (auth.js)
 *   - Global `Toast` object (toast.js)
 *   - Global `isSupabaseConfigured` helper
 *   - Cropper.js loaded via CDN in the HTML document
 *
 * All public methods live on the `Profile` global.
 * ============================================================================
 */

const Profile = {

  /* ── State ─────────────────────────────────────────────────────────────── */

  /** @type {Cropper|null} Active Cropper.js instance */
  cropper: null,

  /** Maximum allowed avatar file size in bytes (2 MB) */
  MAX_FILE_SIZE: 2 * 1024 * 1024,

  /** Accepted MIME types for avatar uploads */
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  /** Cropped output dimensions (square) */
  CROP_SIZE: 300,

  /* ── Modal helpers ─────────────────────────────────────────────────────── */

  /**
   * Fetch current profile data from Supabase, populate the profile form,
   * and display the profile modal.
   */
  async showProfileModal() {
    try {
      if (!isSupabaseConfigured()) {
        Toast.show('Supabase is not configured.', 'error');
        return;
      }

      const modal = document.getElementById('profile-modal');
      if (!modal) return;

      // Show the modal immediately so the user sees a loading state
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Toast.show('Unable to fetch user session.', 'error');
        this.hideProfileModal();
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        Toast.show('Failed to load profile data.', 'error');
        console.error('[Profile] Fetch error:', profileError);
        this.hideProfileModal();
        return;
      }

      // Populate form fields
      const nameField  = document.getElementById('profile-full-name');
      const phoneField = document.getElementById('profile-phone');
      const bioField   = document.getElementById('profile-bio');
      const emailField = document.getElementById('profile-email');

      if (nameField)  nameField.value  = profile.full_name || '';
      if (phoneField) phoneField.value  = profile.phone     || '';
      if (bioField)   bioField.value    = profile.bio        || '';
      if (emailField) emailField.value  = user.email         || '';

      // Show current avatar
      this.updateAvatarUI(profile.avatar_url);

      // Make sure crop container is hidden on fresh open
      const cropContainer = document.getElementById('crop-preview-container');
      if (cropContainer) cropContainer.style.display = 'none';

      // Hide delete-confirm dialog if visible
      const deleteDialog = document.getElementById('delete-confirm-dialog');
      if (deleteDialog) deleteDialog.style.display = 'none';

    } catch (err) {
      console.error('[Profile] showProfileModal error:', err);
      Toast.show('Something went wrong while loading your profile.', 'error');
      this.hideProfileModal();
    }
  },

  /**
   * Hide the profile modal and clean up any active cropper.
   */
  hideProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    this.destroyCropper();
  },

  /* ── Profile CRUD ──────────────────────────────────────────────────────── */

  /**
   * Update the `profiles` table with data from the profile form.
   *
   * @param {FormData} formData – Form data containing full_name, phone, bio
   */
  async updateProfile(formData) {
    const submitBtn = document.querySelector('#profile-form button[type="submit"]');
    try {
      if (!isSupabaseConfigured()) {
        Toast.show('Supabase is not configured.', 'error');
        return;
      }

      // Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving…';
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Toast.show('You must be signed in.', 'error');
        return;
      }

      const updates = {
        full_name: formData.get('full_name')  || '',
        phone:     formData.get('phone')      || '',
        bio:       formData.get('bio')        || '',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        Toast.show('Failed to update profile.', 'error');
        console.error('[Profile] Update error:', error);
        return;
      }

      // Sync the cached profile on Auth
      if (typeof Auth !== 'undefined' && Auth.currentProfile) {
        Object.assign(Auth.currentProfile, updates);
      }

      Toast.show('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('[Profile] updateProfile error:', err);
      Toast.show('An unexpected error occurred.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || 'Save';
      }
    }
  },

  /* ── Cropper management ────────────────────────────────────────────────── */

  /**
   * Initialise Cropper.js on a given <img> element.
   *
   * @param {HTMLImageElement} imageElement
   */
  initCropper(imageElement) {
    // Destroy any existing instance first
    this.destroyCropper();

    if (typeof Cropper === 'undefined') {
      Toast.show('Image cropper library is not loaded.', 'error');
      console.error('[Profile] Cropper.js is not available.');
      return;
    }

    this.cropper = new Cropper(imageElement, {
      aspectRatio:       1,
      viewMode:          2,
      dragMode:          'move',
      autoCropArea:      0.8,
      responsive:        true,
      guides:            true,
      background:        true,
      modal:             true,
      highlight:         true,
      cropBoxMovable:    true,
      cropBoxResizable:  true,
    });
  },

  /**
   * Destroy the active Cropper.js instance and release resources.
   */
  destroyCropper() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  },

  /* ── File selection & validation ───────────────────────────────────────── */

  /**
   * Handle the file input change event for avatar selection.
   * Validates the file, reads it, and sets up the cropper.
   *
   * @param {Event} event – change event from #avatar-input
   */
  handleFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // --- Validate MIME type ---
    if (!this.ACCEPTED_TYPES.includes(file.type)) {
      Toast.show('Please select a JPEG, PNG, or WebP image.', 'error');
      event.target.value = '';
      return;
    }

    // --- Validate file size ---
    if (file.size > this.MAX_FILE_SIZE) {
      Toast.show('Image must be smaller than 2 MB.', 'error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const cropContainer = document.getElementById('crop-preview-container');
      const cropImage     = document.getElementById('crop-image');
      const avatarDisplay = document.getElementById('profile-avatar-display');

      if (!cropImage || !cropContainer) {
        console.error('[Profile] Crop preview elements not found in DOM.');
        return;
      }

      // Set the image source to the selected file
      cropImage.src = e.target.result;

      // Show crop container, hide the static avatar display
      cropContainer.style.display = 'block';
      if (avatarDisplay) avatarDisplay.style.display = 'none';

      // Wait for the image to fully load before initialising Cropper
      cropImage.onload = () => {
        this.initCropper(cropImage);
      };
    };

    reader.onerror = () => {
      Toast.show('Failed to read the selected file.', 'error');
    };

    reader.readAsDataURL(file);
  },

  /* ── Avatar upload ─────────────────────────────────────────────────────── */

  /**
   * Crop the selected image and upload it to Supabase Storage.
   *
   * Steps:
   *  1. Get cropped canvas at 300×300
   *  2. Convert to JPEG blob (quality 0.85)
   *  3. Delete any existing avatar for this user
   *  4. Upload new avatar to the `avatars` bucket
   *  5. Retrieve public URL and update the profiles table
   *  6. Refresh avatar UI everywhere on the page
   */
  async uploadCroppedAvatar() {
    const saveBtn = document.getElementById('crop-save-btn');
    try {
      if (!isSupabaseConfigured()) {
        Toast.show('Supabase is not configured.', 'error');
        return;
      }

      if (!this.cropper) {
        Toast.show('No image selected to crop.', 'error');
        return;
      }

      // Loading state
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.dataset.originalText = saveBtn.textContent;
        saveBtn.textContent = 'Uploading…';
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Toast.show('You must be signed in.', 'error');
        return;
      }

      // 1. Get cropped canvas
      const canvas = this.cropper.getCroppedCanvas({
        width:                  this.CROP_SIZE,
        height:                 this.CROP_SIZE,
        imageSmoothingEnabled:  true,
        imageSmoothingQuality:  'high',
      });

      if (!canvas) {
        Toast.show('Failed to generate cropped image.', 'error');
        return;
      }

      // 2. Convert to blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob returned null'))),
          'image/jpeg',
          0.85,
        );
      });

      // 3. Delete old avatar(s) for this user
      await this._deleteExistingAvatars(user.id);

      // 4. Upload new avatar with a cache-busting filename
      const filePath = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        Toast.show('Avatar upload failed.', 'error');
        console.error('[Profile] Upload error:', uploadError);
        return;
      }

      // 5. Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl || null;

      // 6. Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        Toast.show('Avatar saved but profile update failed.', 'error');
        console.error('[Profile] Profile update error:', updateError);
        return;
      }

      // 7. Sync cached profile
      if (typeof Auth !== 'undefined' && Auth.currentProfile) {
        Auth.currentProfile.avatar_url = publicUrl;
      }

      // 8. Refresh all avatar displays
      this.updateAvatarUI(publicUrl);

      // 9. Success feedback
      Toast.show('Avatar updated!', 'success');

      // 10. Clean up cropper and UI
      this.destroyCropper();
      this._resetCropUI();

    } catch (err) {
      console.error('[Profile] uploadCroppedAvatar error:', err);
      Toast.show('An unexpected error occurred during upload.', 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = saveBtn.dataset.originalText || 'Save';
      }
    }
  },

  /* ── Avatar removal ────────────────────────────────────────────────────── */

  /**
   * Remove the current user's avatar from storage and clear the profile URL.
   */
  async removeAvatar() {
    const removeBtn = document.getElementById('remove-avatar-btn');
    try {
      if (!isSupabaseConfigured()) {
        Toast.show('Supabase is not configured.', 'error');
        return;
      }

      if (removeBtn) {
        removeBtn.disabled = true;
        removeBtn.dataset.originalText = removeBtn.textContent;
        removeBtn.textContent = 'Removing…';
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Toast.show('You must be signed in.', 'error');
        return;
      }

      // Delete all avatar files for this user
      await this._deleteExistingAvatars(user.id);

      // Clear avatar_url in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        Toast.show('Failed to remove avatar from profile.', 'error');
        console.error('[Profile] Remove avatar error:', error);
        return;
      }

      // Sync cached profile
      if (typeof Auth !== 'undefined' && Auth.currentProfile) {
        Auth.currentProfile.avatar_url = null;
      }

      // Show default avatar everywhere
      this.updateAvatarUI(null);

      Toast.show('Avatar removed.', 'success');
    } catch (err) {
      console.error('[Profile] removeAvatar error:', err);
      Toast.show('An unexpected error occurred.', 'error');
    } finally {
      if (removeBtn) {
        removeBtn.disabled = false;
        removeBtn.textContent = removeBtn.dataset.originalText || 'Remove';
      }
    }
  },

  /* ── Account deletion ──────────────────────────────────────────────────── */

  /**
   * Show a confirmation dialog before deleting the account.
   */
  confirmDeleteAccount() {
    const dialog = document.getElementById('delete-confirm-dialog');
    if (dialog) {
      dialog.style.display = 'flex';
    }
  },

  /**
   * Hide the account deletion confirmation dialog.
   */
  _hideDeleteDialog() {
    const dialog = document.getElementById('delete-confirm-dialog');
    if (dialog) {
      dialog.style.display = 'none';
    }
  },

  /* ── Avatar UI ─────────────────────────────────────────────────────────── */

  /**
   * Default SVG icon used when no avatar URL is available.
   * @returns {string} Inline SVG markup
   */
  _defaultAvatarSVG() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              width="100%" height="100%" style="color: #94a3b8;">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48
                10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34
                3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5
                0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08
                1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5
                3.22-6 3.22z"/>
            </svg>`;
  },

  /**
   * Update every avatar display element on the page.
   *
   * @param {string|null} avatarUrl – public URL or null for default icon
   */
  updateAvatarUI(avatarUrl) {
    // --- Navbar avatar ---
    const navAvatar = document.querySelector('#nav-user-avatar img');
    const navAvatarContainer = document.getElementById('nav-user-avatar');

    if (avatarUrl) {
      if (navAvatar) {
        navAvatar.src = avatarUrl;
        navAvatar.style.display = '';
      } else if (navAvatarContainer) {
        // If the <img> doesn't exist yet, create one
        navAvatarContainer.innerHTML = `<img src="${avatarUrl}" alt="Avatar"
          style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      }
    } else {
      if (navAvatarContainer) {
        navAvatarContainer.innerHTML = this._defaultAvatarSVG();
      }
    }

    // --- Profile modal avatar ---
    const profileAvatar = document.getElementById('profile-avatar-display');

    if (profileAvatar) {
      if (avatarUrl) {
        profileAvatar.innerHTML = `<img src="${avatarUrl}" alt="Your avatar"
          style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      } else {
        profileAvatar.innerHTML = this._defaultAvatarSVG();
      }
      profileAvatar.style.display = '';
    }
  },

  /* ── Internal helpers ──────────────────────────────────────────────────── */

  /**
   * Delete all existing avatar files for a user from the `avatars` bucket.
   *
   * @param {string} userId
   * @private
   */
  async _deleteExistingAvatars(userId) {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (listError) {
        console.warn('[Profile] Could not list old avatars:', listError);
        return;
      }

      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${f.name}`);
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove(filePaths);

        if (removeError) {
          console.warn('[Profile] Could not remove old avatars:', removeError);
        }
      }
    } catch (err) {
      console.warn('[Profile] _deleteExistingAvatars error:', err);
    }
  },

  /**
   * Reset the crop-related UI back to its default hidden state.
   * @private
   */
  _resetCropUI() {
    const cropContainer = document.getElementById('crop-preview-container');
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const fileInput     = document.getElementById('avatar-input');

    if (cropContainer) cropContainer.style.display = 'none';
    if (avatarDisplay) avatarDisplay.style.display  = '';
    if (fileInput)     fileInput.value               = '';
  },

  /* ── Initialisation ────────────────────────────────────────────────────── */

  /**
   * Attach all DOM event listeners.  Call once after DOMContentLoaded.
   */
  init() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.updateProfile(new FormData(profileForm));
      });
    }

    // Avatar file selection
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // Crop save / cancel
    const cropSaveBtn   = document.getElementById('crop-save-btn');
    const cropCancelBtn = document.getElementById('crop-cancel-btn');

    if (cropSaveBtn) {
      cropSaveBtn.addEventListener('click', () => this.uploadCroppedAvatar());
    }

    if (cropCancelBtn) {
      cropCancelBtn.addEventListener('click', () => {
        this.destroyCropper();
        this._resetCropUI();
      });
    }

    // Avatar removal
    const removeAvatarBtn = document.getElementById('remove-avatar-btn');
    if (removeAvatarBtn) {
      removeAvatarBtn.addEventListener('click', () => this.removeAvatar());
    }

    // Account deletion flow
    const deleteAccountBtn  = document.getElementById('delete-account-btn');
    const confirmDeleteYes  = document.getElementById('confirm-delete-yes');
    const confirmDeleteNo   = document.getElementById('confirm-delete-no');

    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', () => this.confirmDeleteAccount());
    }

    if (confirmDeleteYes) {
      confirmDeleteYes.addEventListener('click', () => {
        if (typeof Auth !== 'undefined' && typeof Auth.deleteAccount === 'function') {
          Auth.deleteAccount();
        } else {
          Toast.show('Account deletion is currently unavailable.', 'error');
        }
      });
    }

    if (confirmDeleteNo) {
      confirmDeleteNo.addEventListener('click', () => this._hideDeleteDialog());
    }

    // Modal open / close
    const profileBtn      = document.getElementById('profile-btn');
    const closeProfileBtn = document.getElementById('close-profile-modal');

    if (profileBtn) {
      profileBtn.addEventListener('click', () => this.showProfileModal());
    }

    if (closeProfileBtn) {
      closeProfileBtn.addEventListener('click', () => this.hideProfileModal());
    }

    console.log('[Profile] Module initialised.');
  },
};

/* ── Bootstrap ─────────────────────────────────────────────────────────────── */

Profile.init();
