/* ==========================================
   DivingClub - Data Service Module
   Fetches & renders all dynamic content from Supabase
   ========================================== */

const DataService = {
    // Cache for loaded data
    cache: {
        blogPosts: [],
        activities: [],
        moments: [],
        stats: {}
    },

    // Loading state tracking
    loading: {
        blog: false,
        activities: false,
        moments: false,
        stats: false
    },

    /**
     * Initialize all data loading
     */
    async init() {
        if (!isSupabaseConfigured()) {
            console.warn('[DataService] Supabase not configured. Loading fallback content.');
            this.loadFallbackContent();
            return;
        }

        try {
            // Load all data in parallel for performance
            await Promise.allSettled([
                this.loadBlogPosts(),
                this.loadActivities(),
                this.loadMoments(),
                this.loadStats()
            ]);

            console.log('[DataService] All data loaded successfully.');
        } catch (error) {
            console.error('[DataService] Initialization error:', error);
        }
    },

    // ===== BLOG POSTS =====

    /**
     * Fetch blog posts from Supabase and render them
     */
    async loadBlogPosts() {
        if (this.loading.blog) return;
        this.loading.blog = true;

        const container = document.getElementById('blog-grid');
        if (!container) {
            this.loading.blog = false;
            return;
        }

        try {
            // Show skeleton loading
            this.showSkeletonLoading(container, 'blog', 3);

            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('published_at', { ascending: false })
                .limit(6);

            if (error) throw error;

            this.cache.blogPosts = data || [];
            this.renderBlogPosts(container, this.cache.blogPosts);
        } catch (error) {
            console.error('[DataService] Error loading blog posts:', error);
            this.showErrorState(container, 'blog posts');
        } finally {
            this.loading.blog = false;
        }
    },

    /**
     * Render blog post cards into the container
     */
    renderBlogPosts(container, posts) {
        if (!container || !posts.length) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-newspaper"></i>
                        <p>No blog posts yet. Check back soon!</p>
                    </div>`;
            }
            return;
        }

        container.innerHTML = posts.map((post, index) => {
            const publishedDate = post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recently';

            return `
                <article class="blog-card ${index === 0 ? 'blog-card-featured' : ''}" 
                         data-animate="fade-up" data-delay="${index * 150}"
                         data-id="${post.id}">
                    <div class="blog-image">
                        <img src="${this.sanitizeUrl(post.image_url) || 'images/blog_1.jpg'}" 
                             alt="${this.escapeHtml(post.title)}" 
                             loading="lazy"
                             onerror="this.src='images/blog_1.jpg'">
                    </div>
                    <div class="blog-info">
                        <div class="blog-meta">
                            <span><i class="far fa-calendar"></i> ${publishedDate}</span>
                            <span><i class="far fa-clock"></i> ${post.read_time || 5} min read</span>
                        </div>
                        <h3>${this.escapeHtml(post.title)}</h3>
                        <p>${this.escapeHtml(post.excerpt || '')}</p>
                    </div>
                </article>`;
        }).join('');

        // Re-observe for scroll animations
        this.reObserveAnimations(container);
    },

    // ===== ACTIVITIES =====

    /**
     * Fetch activities from Supabase and render them
     */
    async loadActivities() {
        if (this.loading.activities) return;
        this.loading.activities = true;

        const container = document.getElementById('activities-grid');
        if (!container) {
            this.loading.activities = false;
            return;
        }

        try {
            this.showSkeletonLoading(container, 'activity', 3);

            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) throw error;

            this.cache.activities = data || [];
            this.renderActivities(container, this.cache.activities);
        } catch (error) {
            console.error('[DataService] Error loading activities:', error);
            this.showErrorState(container, 'activities');
        } finally {
            this.loading.activities = false;
        }
    },

    /**
     * Render activity cards
     */
    renderActivities(container, activities) {
        if (!container || !activities.length) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-water"></i>
                        <p>No activities available right now.</p>
                    </div>`;
            }
            return;
        }

        container.innerHTML = activities.map((activity, index) => `
            <div class="activity-card" data-animate="fade-up" data-delay="${index * 200}" data-id="${activity.id}">
                <div class="activity-image">
                    <img src="${this.sanitizeUrl(activity.image_url) || 'images/diving_activity_1.jpg'}" 
                         alt="${this.escapeHtml(activity.title)}" 
                         loading="lazy"
                         onerror="this.src='images/diving_activity_1.jpg'">
                    <div class="activity-overlay"></div>
                </div>
                <div class="activity-label">
                    <span>${this.escapeHtml(activity.title)}</span>
                </div>
            </div>
        `).join('');

        this.reObserveAnimations(container);
        this.initTiltEffect(container);
    },

    // ===== MOMENTS =====

    /**
     * Fetch diving moments from Supabase and render them
     */
    async loadMoments() {
        if (this.loading.moments) return;
        this.loading.moments = true;

        const container = document.getElementById('moments-carousel');
        if (!container) {
            this.loading.moments = false;
            return;
        }

        try {
            this.showSkeletonLoading(container, 'moment', 3);

            const { data, error } = await supabase
                .from('moments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.cache.moments = data || [];
            this.renderMoments(container, this.cache.moments);
        } catch (error) {
            console.error('[DataService] Error loading moments:', error);
            this.showErrorState(container, 'moments');
        } finally {
            this.loading.moments = false;
        }
    },

    /**
     * Render moment cards
     */
    renderMoments(container, moments) {
        if (!container || !moments.length) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-camera"></i>
                        <p>No diving moments to show yet.</p>
                    </div>`;
            }
            return;
        }

        container.innerHTML = moments.map((moment, index) => {
            const fullStars = Math.floor(moment.rating || 0);
            const hasHalf = (moment.rating || 0) % 1 >= 0.3;
            let starsHtml = '';
            for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
            if (hasHalf) starsHtml += '<i class="fas fa-star-half-alt"></i>';
            for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) starsHtml += '<i class="far fa-star"></i>';

            return `
                <div class="moment-card" data-animate="fade-up" data-delay="${index * 200}" data-id="${moment.id}">
                    <div class="moment-image">
                        <img src="${this.sanitizeUrl(moment.image_url) || 'images/moment_1.jpg'}" 
                             alt="${this.escapeHtml(moment.title)}" 
                             loading="lazy"
                             onerror="this.src='images/moment_1.jpg'">
                    </div>
                    <div class="moment-info">
                        <h4>${this.escapeHtml(moment.title)}</h4>
                        <p>${this.escapeHtml(moment.description || '')}</p>
                        <div class="moment-details">
                            <span class="price">From $${Number(moment.price || 0).toFixed(0)}</span>
                            <div class="moment-rating">
                                ${starsHtml}
                                <span>${Number(moment.rating || 0).toFixed(1)}(${moment.review_count || 0})</span>
                            </div>
                        </div>
                        <a href="#" class="see-more" data-moment-id="${moment.id}">See More →</a>
                    </div>
                </div>`;
        }).join('');

        this.reObserveAnimations(container);
    },

    // ===== SITE STATS =====

    /**
     * Fetch site statistics and update counters
     */
    async loadStats() {
        if (this.loading.stats) return;
        this.loading.stats = true;

        try {
            const { data, error } = await supabase
                .from('site_stats')
                .select('*');

            if (error) throw error;

            if (data) {
                data.forEach(stat => {
                    this.cache.stats[stat.stat_key] = stat.stat_value;
                });
                this.renderStats();
            }
        } catch (error) {
            console.error('[DataService] Error loading stats:', error);
        } finally {
            this.loading.stats = false;
        }
    },

    /**
     * Render stat counters on the page
     */
    renderStats() {
        const membersEl = document.getElementById('stat-members');
        if (membersEl) {
            const count = this.cache.stats.members_count || 500;
            this.animateCounter(membersEl, 0, count, 2000);
        }
    },

    // ===== NEWSLETTER SUBSCRIPTION =====

    /**
     * Subscribe email to newsletter
     */
    async subscribeNewsletter(email) {
        if (!isSupabaseConfigured()) {
            Toast.show('Demo mode: Subscription simulated!', 'info');
            return { success: true };
        }

        try {
            // Validate email format
            if (!this.isValidEmail(email)) {
                Toast.show('Please enter a valid email address.', 'error');
                return { success: false };
            }

            const { data, error } = await supabase
                .from('subscribers')
                .insert([{ email: email.toLowerCase().trim() }])
                .select();

            if (error) {
                if (error.code === '23505') {
                    Toast.show('You\'re already subscribed! 🎉', 'info');
                    return { success: true };
                }
                throw error;
            }

            Toast.show('Successfully subscribed! Welcome aboard! 🤿', 'success');
            return { success: true, data };
        } catch (error) {
            console.error('[DataService] Subscription error:', error);
            Toast.show('Subscription failed. Please try again.', 'error');
            return { success: false, error };
        }
    },

    // ===== BOOKING SUBMISSION =====

    /**
     * Submit a booking/contact request
     */
    async submitBooking(bookingData) {
        if (!isSupabaseConfigured()) {
            Toast.show('Demo mode: Booking simulated!', 'info');
            return { success: true };
        }

        try {
            // Validate required fields
            if (!bookingData.name || !bookingData.email) {
                Toast.show('Please fill in all required fields.', 'error');
                return { success: false };
            }

            // Attach current user ID if logged in
            if (Auth.currentUser) {
                bookingData.user_id = Auth.currentUser.id;
            }

            const { data, error } = await supabase
                .from('bookings')
                .insert([bookingData])
                .select();

            if (error) throw error;

            Toast.show('Booking submitted successfully! We\'ll contact you soon. 🎉', 'success');
            return { success: true, data };
        } catch (error) {
            console.error('[DataService] Booking error:', error);
            Toast.show('Booking failed. Please try again.', 'error');
            return { success: false, error };
        }
    },

    // ===== UTILITY METHODS =====

    /**
     * Show skeleton loading placeholders
     */
    showSkeletonLoading(container, type, count) {
        if (!container) return;

        let skeletonHtml = '';
        for (let i = 0; i < count; i++) {
            if (type === 'blog') {
                skeletonHtml += `
                    <div class="skeleton-card blog-skeleton">
                        <div class="skeleton-image shimmer"></div>
                        <div class="skeleton-info">
                            <div class="skeleton-meta shimmer"></div>
                            <div class="skeleton-title shimmer"></div>
                            <div class="skeleton-text shimmer"></div>
                            <div class="skeleton-text short shimmer"></div>
                        </div>
                    </div>`;
            } else if (type === 'activity') {
                skeletonHtml += `
                    <div class="skeleton-card activity-skeleton">
                        <div class="skeleton-image tall shimmer"></div>
                    </div>`;
            } else if (type === 'moment') {
                skeletonHtml += `
                    <div class="skeleton-card moment-skeleton">
                        <div class="skeleton-image shimmer"></div>
                        <div class="skeleton-info">
                            <div class="skeleton-title shimmer"></div>
                            <div class="skeleton-text shimmer"></div>
                            <div class="skeleton-meta shimmer"></div>
                        </div>
                    </div>`;
            }
        }
        container.innerHTML = skeletonHtml;
    },

    /**
     * Show error state in a container
     */
    showErrorState(container, contentType) {
        if (!container) return;
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to load ${contentType}. Please try again later.</p>
                <button class="btn btn-primary btn-sm" onclick="DataService.init()">Retry</button>
            </div>`;
    },

    /**
     * Re-observe elements for scroll animations after dynamic rendering
     */
    reObserveAnimations(container) {
        if (!container || !window.scrollObserver) return;

        container.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.remove('visible');
            window.scrollObserver.observe(el);
        });
    },

    /**
     * Re-init tilt effect on activity cards
     */
    initTiltEffect(container) {
        if (!container) return;

        container.querySelectorAll('.activity-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    },

    /**
     * Animate a counter from start to end
     */
    animateCounter(element, start, end, duration) {
        if (!element) return;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(start + (end - start) * easeOut);
            element.textContent = value + '+';
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sanitize URL to prevent XSS
     */
    sanitizeUrl(url) {
        if (!url) return '';
        // Allow relative paths and https URLs
        if (url.startsWith('images/') || url.startsWith('https://') || url.startsWith('http://')) {
            return url;
        }
        return '';
    },

    /**
     * Load fallback/demo content when Supabase is not configured.
     * Uses local images and hardcoded demo data so the site looks complete.
     */
    loadFallbackContent() {
        // ── Fallback Blog Posts ──
        const fallbackBlogs = [
            {
                id: 'demo-1',
                title: 'Improve Your Lung Capacity',
                excerpt: 'Diving allows you to explore the underwater world with every breath. But the key to extending your dive time is improving your lung capacity through proper breathing techniques.',
                image_url: 'images/blog_1.jpg',
                read_time: 5,
                published_at: '2025-02-13'
            },
            {
                id: 'demo-2',
                title: 'Divingclub Just The Essential Tips To Start Your Journey',
                excerpt: "If you've always been captivated by the serenity of the underwater world, diving might be the perfect way to explore it. Unlike other sports, diving requires specific preparation.",
                image_url: 'images/blog_2.jpg',
                read_time: 5,
                published_at: '2025-02-13'
            },
            {
                id: 'demo-3',
                title: "Why It's More Than Just A Sport The Benefits Of Divingclub",
                excerpt: "Diving is often celebrated for its thrilling and meditative qualities, but it's more than just a way to explore underwater worlds. It offers numerous health benefits.",
                image_url: 'images/blog_3.jpg',
                read_time: 5,
                published_at: '2025-02-15'
            }
        ];

        const blogGrid = document.getElementById('blog-grid');
        if (blogGrid) {
            this.cache.blogPosts = fallbackBlogs;
            this.renderBlogPosts(blogGrid, fallbackBlogs);
        }

        // ── Fallback Activities ──
        const fallbackActivities = [
            { id: 'demo-a1', title: 'LEARN TO DIVING', image_url: 'images/diving_activity_1.jpg', category: 'beginner' },
            { id: 'demo-a2', title: 'COURSES FOR DIVERS', image_url: 'images/diving_activity_2.jpg', category: 'intermediate' },
            { id: 'demo-a3', title: 'LEARN TO DIVE', image_url: 'images/diving_activity_3.jpg', category: 'advanced' }
        ];

        const activitiesGrid = document.getElementById('activities-grid');
        if (activitiesGrid) {
            this.cache.activities = fallbackActivities;
            this.renderActivities(activitiesGrid, fallbackActivities);
        }

        // ── Fallback Moments ──
        const fallbackMoments = [
            { id: 'demo-m1', title: 'Discover Scuba Diving', description: 'Take Your First Breaths Under Water', image_url: 'images/moment_1.jpg', price: 180, rating: 4.5, review_count: 4 },
            { id: 'demo-m2', title: 'Advanced Open Water', description: 'Explore Deeper Underwater Worlds', image_url: 'images/moment_2.jpg', price: 250, rating: 5.0, review_count: 8 },
            { id: 'demo-m3', title: 'Night Diving Experience', description: 'Discover The Ocean After Dark', image_url: 'images/moment_3.jpg', price: 320, rating: 4.8, review_count: 12 }
        ];

        const momentsCarousel = document.getElementById('moments-carousel');
        if (momentsCarousel) {
            this.cache.moments = fallbackMoments;
            this.renderMoments(momentsCarousel, fallbackMoments);
        }

        // ── Fallback Stats ──
        this.cache.stats = { members_count: 500, dives_completed: 2500, courses_offered: 15 };
        this.renderStats();

        console.log('[DataService] Fallback content rendered successfully.');
    }
};

// Initialize data loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Slight delay to ensure Supabase client is initialized
    setTimeout(() => {
        DataService.init();
    }, 100);
});
