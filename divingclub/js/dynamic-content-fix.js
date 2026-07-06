/**
 * DivingClub Dynamic Content Fix
 * - No manual card hardcoding
 * - Uses actual images from images/ via generated assets-manifest.js
 * - Uses Supabase data when available
 * - Falls back to local asset manifest when Supabase is empty/error
 * - Fixes invisible cards caused by animation observer issues
 */

(function () {
    "use strict";

    function manifest() {
        return Array.isArray(window.DIVINGCLUB_ASSET_MANIFEST)
            ? window.DIVINGCLUB_ASSET_MANIFEST
            : [];
    }

    function isConfigured() {
        return typeof window.isSupabaseConfigured === "function" &&
            window.isSupabaseConfigured() &&
            typeof window.supabase !== "undefined";
    }

    function byType(type) {
        return manifest().filter(item => item.type === type);
    }

    function titleFromFileName(value) {
        return String(value || "")
            .split("/")
            .pop()
            .replace(/\.[^.]+$/, "")
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = String(text ?? "");
        return div.innerHTML;
    }

    function pickAsset(type, index) {
        const assets = byType(type);
        if (!assets.length) return null;
        return assets[Math.abs(index || 0) % assets.length];
    }

    function resolveImageUrl(url, type, index) {
        const assets = manifest();
        let clean = String(url || "").trim().replace(/\\/g, "/");

        if (/^https?:\/\//i.test(clean)) {
            return clean;
        }

        clean = clean.replace(/^\.?\//, "");

        if (clean) {
            if (!clean.startsWith("images/")) {
                const filename = clean.split("/").pop().toLowerCase();
                const matched = assets.find(item => item.name.toLowerCase() === filename);
                if (matched) return matched.path;
            }

            const exact = assets.find(item => item.path.toLowerCase() === clean.toLowerCase());
            if (exact) return exact.path;
        }

        const fallback = pickAsset(type, index);
        return fallback ? fallback.path : "";
    }

    window.DivingClubImages = {
        fallback(img, type) {
            const index = Number(img.dataset.index || 0);
            const fallback = pickAsset(type, index + 1) || pickAsset(type, 0);

            if (!fallback) {
                img.style.display = "none";
                return;
            }

            if (img.dataset.fallbackUsed === "1") {
                img.style.display = "none";
                return;
            }

            img.dataset.fallbackUsed = "1";
            img.src = fallback.path;
        }
    };

    function localRows(type) {
        return byType(type).map((asset, index) => {
            const title = asset.title || titleFromFileName(asset.name);

            if (type === "blog") {
                return {
                    id: `local-blog-${index + 1}`,
                    title,
                    excerpt: `Read the latest diving story from ${title}.`,
                    image_url: asset.path,
                    read_time: 5,
                    published_at: new Date().toISOString()
                };
            }

            if (type === "activity") {
                return {
                    id: `local-activity-${index + 1}`,
                    title,
                    image_url: asset.path,
                    category: "diving"
                };
            }

            if (type === "moment") {
                return {
                    id: `local-moment-${index + 1}`,
                    title,
                    description: `Explore ${title} with DivingClub.`,
                    image_url: asset.path,
                    price: 180 + index * 50,
                    rating: 4.5,
                    review_count: 10 + index
                };
            }

            return {
                id: `local-${type}-${index + 1}`,
                title,
                image_url: asset.path
            };
        });
    }

    function normalizeRows(rows, type) {
        const safeRows = Array.isArray(rows) ? rows : [];

        const normalized = safeRows.map((row, index) => {
            const asset = pickAsset(type, index);

            if (type === "blog") {
                return {
                    id: row.id || `blog-${index + 1}`,
                    title: row.title || row.name || asset?.title || `Blog ${index + 1}`,
                    excerpt: row.excerpt || row.description || row.content || "",
                    image_url: resolveImageUrl(
                        row.image_url || row.image || row.photo_url || row.thumbnail_url || row.cover_image,
                        "blog",
                        index
                    ),
                    read_time: row.read_time || row.reading_time || 5,
                    published_at: row.published_at || row.created_at || new Date().toISOString()
                };
            }

            if (type === "activity") {
                return {
                    id: row.id || `activity-${index + 1}`,
                    title: row.title || row.name || asset?.title || `Activity ${index + 1}`,
                    image_url: resolveImageUrl(
                        row.image_url || row.image || row.photo_url || row.thumbnail_url,
                        "activity",
                        index
                    ),
                    category: row.category || "diving"
                };
            }

            if (type === "moment") {
                return {
                    id: row.id || `moment-${index + 1}`,
                    title: row.title || row.name || asset?.title || `Moment ${index + 1}`,
                    description: row.description || row.excerpt || "",
                    image_url: resolveImageUrl(
                        row.image_url || row.image || row.photo_url || row.thumbnail_url,
                        "moment",
                        index
                    ),
                    price: Number(row.price || 180 + index * 50),
                    rating: Number(row.rating || 4.5),
                    review_count: Number(row.review_count || row.reviews || 10)
                };
            }

            return row;
        });

        return normalized.length ? normalized : localRows(type);
    }

    async function getTableRows(tableName, queryBuilder) {
        if (!isConfigured()) return [];

        try {
            let query = window.supabase.from(tableName).select("*");
            query = queryBuilder ? queryBuilder(query) : query;

            const { data, error } = await query;

            if (error) {
                console.warn(`[DynamicContentFix] Supabase ${tableName} failed. Using local manifest.`, error);
                return [];
            }

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.warn(`[DynamicContentFix] Supabase ${tableName} exception. Using local manifest.`, error);
            return [];
        }
    }

    function makeVisible(container) {
        if (!container) return;

        container.querySelectorAll("[data-animate]").forEach(el => {
            el.classList.add("visible");
            el.style.opacity = "1";
            el.style.transform = "none";
            el.style.visibility = "visible";
        });

        container.querySelectorAll("img").forEach(img => {
            img.style.opacity = "1";
            img.style.visibility = "visible";
            img.style.display = "block";
        });
    }

    function renderBlogPosts(container, posts) {
        const rows = normalizeRows(posts, "blog");

        if (!container || !rows.length) return;

        container.innerHTML = rows.map((post, index) => {
            const publishedDate = post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                })
                : "Recently";

            return `
                <article class="blog-card visible" data-animate="fade-up" data-delay="${index * 150}" data-id="${escapeHtml(post.id)}">
                    <div class="blog-image">
                        <img src="${escapeHtml(post.image_url)}"
                             alt="${escapeHtml(post.title)}"
                             loading="lazy"
                             data-index="${index}"
                             onerror="window.DivingClubImages.fallback(this, 'blog')">
                    </div>
                    <div class="blog-info">
                        <div class="blog-meta">
                            <span><i class="far fa-calendar"></i> ${escapeHtml(publishedDate)}</span>
                            <span><i class="far fa-clock"></i> ${escapeHtml(post.read_time || 5)} min read</span>
                        </div>
                        <h3>${escapeHtml(post.title)}</h3>
                        <p>${escapeHtml(post.excerpt || "")}</p>
                    </div>
                </article>
            `;
        }).join("");

        makeVisible(container);
    }

    function renderActivities(container, activities) {
        const rows = normalizeRows(activities, "activity");

        if (!container || !rows.length) return;

        container.innerHTML = rows.map((activity, index) => `
            <div class="activity-card visible" data-animate="fade-up" data-delay="${index * 200}" data-id="${escapeHtml(activity.id)}">
                <div class="activity-image">
                    <img src="${escapeHtml(activity.image_url)}"
                         alt="${escapeHtml(activity.title)}"
                         loading="lazy"
                         data-index="${index}"
                         onerror="window.DivingClubImages.fallback(this, 'activity')">
                    <div class="activity-overlay"></div>
                    <div class="activity-label">
                        <span>${escapeHtml(activity.title)}</span>
                    </div>
                </div>
            </div>
        `).join("");

        makeVisible(container);

        if (window.DataService && typeof window.DataService.initTiltEffect === "function") {
            window.DataService.initTiltEffect(container);
        }
    }

    function renderMoments(container, moments) {
        const rows = normalizeRows(moments, "moment");

        if (!container || !rows.length) return;

        container.innerHTML = rows.map((moment, index) => {
            const rating = Number(moment.rating || 0);
            const fullStars = Math.floor(rating);
            const hasHalf = rating % 1 >= 0.3;

            let starsHtml = "";
            for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
            if (hasHalf) starsHtml += '<i class="fas fa-star-half-alt"></i>';
            for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) starsHtml += '<i class="far fa-star"></i>';

            return `
                <div class="moment-card visible" data-animate="fade-up" data-delay="${index * 200}" data-id="${escapeHtml(moment.id)}">
                    <div class="moment-image">
                        <img src="${escapeHtml(moment.image_url)}"
                             alt="${escapeHtml(moment.title)}"
                             loading="lazy"
                             data-index="${index}"
                             onerror="window.DivingClubImages.fallback(this, 'moment')">
                    </div>
                    <div class="moment-info">
                        <h4>${escapeHtml(moment.title)}</h4>
                        <p>${escapeHtml(moment.description || "")}</p>
                        <div class="moment-details">
                            <span class="price">From $${Number(moment.price || 0).toFixed(0)}</span>
                            <div class="moment-rating">
                                ${starsHtml}
                                <span>${Number(moment.rating || 0).toFixed(1)}(${Number(moment.review_count || 0)})</span>
                            </div>
                        </div>
                        <a href="#" class="see-more" data-moment-id="${escapeHtml(moment.id)}">See More →</a>
                    </div>
                </div>
            `;
        }).join("");

        makeVisible(container);
    }

    function showSkeleton(container, type, count) {
        if (window.DataService && typeof window.DataService.showSkeletonLoading === "function") {
            window.DataService.showSkeletonLoading(container, type, count);
        }
    }

    function patchDataService() {
        if (!window.DataService) {
            console.warn("[DynamicContentFix] DataService not found.");
            return;
        }

        window.DataService.sanitizeUrl = function (url) {
            return resolveImageUrl(url, "other", 0);
        };

        window.DataService.renderBlogPosts = renderBlogPosts;
        window.DataService.renderActivities = renderActivities;
        window.DataService.renderMoments = renderMoments;

        window.DataService.loadBlogPosts = async function () {
            const container = document.getElementById("blog-grid");
            if (!container) return;

            showSkeleton(container, "blog", 3);

            const rows = await getTableRows("blog_posts", query =>
                query.order("published_at", { ascending: false }).limit(6)
            );

            const finalRows = normalizeRows(rows, "blog");
            this.cache.blogPosts = finalRows;
            renderBlogPosts(container, finalRows);
        };

        window.DataService.loadActivities = async function () {
            const container = document.getElementById("activities-grid");
            if (!container) return;

            showSkeleton(container, "activity", 3);

            const rows = await getTableRows("activities", query =>
                query.eq("is_active", true).order("sort_order", { ascending: true })
            );

            const finalRows = normalizeRows(rows, "activity");
            this.cache.activities = finalRows;
            renderActivities(container, finalRows);
        };

        window.DataService.loadMoments = async function () {
            const container = document.getElementById("moments-carousel");
            if (!container) return;

            showSkeleton(container, "moment", 3);

            const rows = await getTableRows("moments", query =>
                query.eq("is_active", true).order("sort_order", { ascending: true })
            );

            const finalRows = normalizeRows(rows, "moment");
            this.cache.moments = finalRows;
            renderMoments(container, finalRows);
        };

        window.DataService.showErrorState = function (container, contentType) {
            const type = String(contentType || "").toLowerCase();

            if (type.includes("blog")) {
                renderBlogPosts(container, localRows("blog"));
                return;
            }

            if (type.includes("activit") || type.includes("gallery")) {
                renderActivities(container, localRows("activity"));
                return;
            }

            if (type.includes("moment") || type.includes("event")) {
                renderMoments(container, localRows("moment"));
                return;
            }

            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-water"></i>
                        <p>No content available.</p>
                    </div>
                `;
            }
        };

        window.DataService.loadFallbackContent = function () {
            const blogGrid = document.getElementById("blog-grid");
            const activitiesGrid = document.getElementById("activities-grid");
            const momentsCarousel = document.getElementById("moments-carousel");

            const blogs = localRows("blog");
            const activities = localRows("activity");
            const moments = localRows("moment");

            this.cache.blogPosts = blogs;
            this.cache.activities = activities;
            this.cache.moments = moments;

            renderBlogPosts(blogGrid, blogs);
            renderActivities(activitiesGrid, activities);
            renderMoments(momentsCarousel, moments);

            if (typeof this.renderStats === "function") {
                this.cache.stats = this.cache.stats || {};
                this.cache.stats.members_count = this.cache.stats.members_count || 500;
                this.renderStats();
            }

            console.log("[DynamicContentFix] Local manifest fallback rendered.");
        };

        window.DataService.init = async function () {
            await Promise.allSettled([
                this.loadBlogPosts(),
                this.loadActivities(),
                this.loadMoments(),
                typeof this.loadStats === "function" ? this.loadStats() : Promise.resolve()
            ]);

            document.body.classList.add("dynamic-content-ready");
            console.log("[DynamicContentFix] Dynamic content initialized.");
        };

        console.log("[DynamicContentFix] DataService patched successfully.");
    }

    patchDataService();
})();
