/* ==========================================
   DivingClub - Main Application Script
   Orchestrates UI interactions, animations,
   and coordinates with backend modules.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== TOAST NOTIFICATION SYSTEM =====
    window.Toast = {
        container: document.getElementById('toast-container'),

        /**
         * Show a toast notification
         * @param {string} message - The message to display
         * @param {string} type - 'success' | 'error' | 'info'
         * @param {number} duration - Duration in ms (default: 4000)
         */
        show(message, type = 'info', duration = 4000) {
            if (!this.container) return;

            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                info: 'fas fa-info-circle'
            };

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <i class="toast-icon ${icons[type] || icons.info}"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            `;

            this.container.appendChild(toast);

            // Trigger show animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Close button handler
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.dismiss(toast));

            // Auto dismiss
            const timer = setTimeout(() => this.dismiss(toast), duration);
            toast._timer = timer;
        },

        /**
         * Dismiss a toast
         */
        dismiss(toast) {
            if (!toast || toast._dismissed) return;
            toast._dismissed = true;
            clearTimeout(toast._timer);
            toast.classList.remove('show');
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 400);
        }
    };

    // ===== HEADER SCROLL EFFECT =====
    const header = document.getElementById('main-header');

    const handleScroll = () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ===== MOBILE MENU =====
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== ACTIVE NAV LINK ON SCROLL =====
    const sections = document.querySelectorAll('section[id]');

    const updateActiveNav = () => {
        const scrollY = window.scrollY + 150;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinkItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ===== SCROLL REVEAL ANIMATIONS =====
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
            }
        });
    };

    window.scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    document.querySelectorAll('[data-animate]').forEach(el => {
        window.scrollObserver.observe(el);
    });

    // ===== USER DROPDOWN =====
    const navUserDropdown = document.getElementById('nav-user-dropdown');
    const navUserBtn = document.getElementById('nav-user-btn');

    if (navUserBtn && navUserDropdown) {
        navUserBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navUserDropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!navUserDropdown.contains(e.target)) {
                navUserDropdown.classList.remove('open');
            }
        });
    }

    // ===== MODAL MANAGEMENT =====
    window.ModalManager = {
        /**
         * Show a modal by ID
         */
        show(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        /**
         * Hide a modal by ID
         */
        hide(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            modal.classList.remove('active');
            // Only restore scroll if no other modals are open
            const anyOpen = document.querySelector('.modal-overlay.active');
            if (!anyOpen) {
                document.body.style.overflow = '';
            }
        },

        /**
         * Hide all modals
         */
        hideAll() {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    };

    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ModalManager.hideAll();
        }
    });

    // ===== BOOK NOW BUTTONS =====
    document.querySelectorAll('.book-now-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            ModalManager.show('booking-modal');

            // Pre-fill email/name if logged in
            if (typeof Auth !== 'undefined' && Auth.currentUser) {
                const nameInput = document.getElementById('booking-name');
                const emailInput = document.getElementById('booking-email');
                if (nameInput && Auth.currentProfile?.full_name) {
                    nameInput.value = Auth.currentProfile.full_name;
                }
                if (emailInput && Auth.currentUser.email) {
                    emailInput.value = Auth.currentUser.email;
                }
            }
        });
    });

    // ===== CONTACT US BUTTONS =====
    document.querySelectorAll('.contact-us-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            ModalManager.show('booking-modal');

            // Set booking type to general
            const typeSelect = document.getElementById('booking-type');
            if (typeSelect) typeSelect.value = 'general';
        });
    });

    // ===== LOGIN BUTTON =====
    const navLoginBtn = document.getElementById('nav-login-btn');
    if (navLoginBtn) {
        navLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof Auth !== 'undefined') {
                Auth.showAuthModal('login');
            } else {
                ModalManager.show('auth-modal');
            }
        });
    }

    // ===== BOOKING FORM SUBMISSION =====
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('booking-submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');

            // Show loading
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            const formData = {
                name: document.getElementById('booking-name').value.trim(),
                email: document.getElementById('booking-email').value.trim(),
                phone: document.getElementById('booking-phone').value.trim(),
                booking_type: document.getElementById('booking-type').value,
                message: document.getElementById('booking-message').value.trim()
            };

            // Validate
            if (!formData.name || !formData.email) {
                Toast.show('Please fill in all required fields.', 'error');
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
                return;
            }

            if (typeof DataService !== 'undefined') {
                const result = await DataService.submitBooking(formData);
                if (result.success) {
                    bookingForm.reset();
                    ModalManager.hide('booking-modal');
                }
            } else {
                Toast.show('Booking submitted! (Demo mode)', 'success');
                bookingForm.reset();
                ModalManager.hide('booking-modal');
            }

            // Reset button
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        });
    }

    // ===== NEWSLETTER SUBSCRIPTION =====
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email-input');
            const submitBtn = document.getElementById('subscribe-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            const email = emailInput.value.trim();

            if (!email) {
                shakeElement(emailInput);
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                shakeElement(emailInput);
                Toast.show('Please enter a valid email address.', 'error');
                return;
            }

            // Show loading
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            if (typeof DataService !== 'undefined') {
                const result = await DataService.subscribeNewsletter(email);
                if (result.success) {
                    emailInput.value = '';
                }
            } else {
                Toast.show('Subscribed successfully! (Demo mode)', 'success');
                emailInput.value = '';
            }

            // Reset button
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        });
    }

    // ===== PASSWORD TOGGLE =====
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling || btn.parentElement.querySelector('input[type="password"], input[type="text"]');
            if (!input) return;

            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });

    // ===== PASSWORD STRENGTH INDICATOR =====
    const signupPassword = document.getElementById('signup-password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthLabel = document.getElementById('strength-label');

    if (signupPassword && strengthFill && strengthLabel) {
        signupPassword.addEventListener('input', () => {
            const password = signupPassword.value;
            const strength = calculatePasswordStrength(password);

            // Remove all strength classes
            strengthFill.className = 'strength-fill';
            strengthLabel.className = 'strength-label';

            if (password.length === 0) {
                strengthLabel.textContent = '';
                return;
            }

            strengthFill.classList.add(strength.level);
            strengthLabel.classList.add(strength.level);
            strengthLabel.textContent = strength.label;
        });
    }

    function calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return { level: 'weak', label: 'Weak' };
        if (score <= 2) return { level: 'fair', label: 'Fair' };
        if (score <= 3) return { level: 'good', label: 'Good' };
        return { level: 'strong', label: 'Strong' };
    }

    // ===== AUTH TAB SWITCHING =====
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchAuthTab(tab);
        });
    });

    document.querySelectorAll('[data-switch-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.switchTab;
            switchAuthTab(tab);
        });
    });

    function switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.auth-tab-btn[data-tab="${tab}"]`)?.classList.add('active');

        // Update tab content
        document.querySelectorAll('.auth-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`auth-${tab}-tab`)?.classList.add('active');
    }

    // ===== BLOG NAVIGATION =====
    const blogPrev = document.getElementById('blog-prev-btn');
    const blogNext = document.getElementById('blog-next-btn');
    const blogGrid = document.getElementById('blog-grid');

    if (blogPrev && blogNext && blogGrid) {
        blogNext.addEventListener('click', () => {
            animateGridCards(blogGrid);
        });

        blogPrev.addEventListener('click', () => {
            animateGridCards(blogGrid);
        });
    }

    // ===== MOMENTS CAROUSEL =====
    const momentsNext = document.getElementById('moments-next-btn');
    const momentsCarousel = document.getElementById('moments-carousel');

    if (momentsNext && momentsCarousel) {
        momentsNext.addEventListener('click', () => {
            animateGridCards(momentsCarousel);
        });
    }

    function animateGridCards(container) {
        const cards = container.querySelectorAll('.blog-card, .moment-card');
        cards.forEach(card => {
            card.style.transition = 'all 0.4s ease';
            card.style.transform = 'translateY(10px)';
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.style.transform = '';
                card.style.opacity = '';
            }, 400);
        });
    }

    // ===== CAROUSEL DOTS INTERACTION =====
    document.querySelectorAll('.carousel-dots').forEach(group => {
        const dots = group.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                dots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    });

    // ===== PARALLAX EFFECTS =====
    const heroImg = document.querySelector('.hero-bg-img');

    const handleParallax = () => {
        const scrollY = window.scrollY;
        if (heroImg && scrollY < window.innerHeight) {
            heroImg.style.transform = `scale(${1.05 + scrollY * 0.0002}) translateY(${scrollY * 0.15}px)`;
        }
    };

    window.addEventListener('scroll', handleParallax, { passive: true });

    // ===== HERO TEXT REVEAL =====
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, index) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(20px)';
        line.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + index * 0.15}s`;

        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 100);
    });

    // ===== WATERMARK PARALLAX =====
    const watermark = document.querySelector('.watermark-text');
    if (watermark) {
        window.addEventListener('scroll', () => {
            const section = watermark.parentElement;
            const rect = section.getBoundingClientRect();
            const scrollPercent = -rect.top / window.innerHeight;
            watermark.style.transform = `translate(-50%, -50%) translateX(${scrollPercent * 50}px)`;
        }, { passive: true });
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            // Don't prevent default if it's a trigger button
            if (this.classList.contains('book-now-trigger') ||
                this.classList.contains('contact-us-trigger')) return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = header.offsetHeight;
                window.scrollTo({
                    top: target.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== UTILITY FUNCTIONS =====
    function shakeElement(el) {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = 'shake 0.5s ease';
        el.style.borderColor = '#ef4444';

        setTimeout(() => {
            el.style.borderColor = '';
            el.style.animation = '';
        }, 1500);
    }

    // Add shake keyframes dynamically
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    console.log('🤿 DivingClub application initialized successfully!');
});
