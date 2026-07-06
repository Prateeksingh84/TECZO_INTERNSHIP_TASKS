(function () {
    "use strict";

    let assets = [];
    let renderCount = 0;
    let observerRunning = false;

    function log() {
        console.log.apply(console, ["[LocalDynamicRenderer]"].concat(Array.from(arguments)));
    }

    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = String(value ?? "");
        return div.innerHTML;
    }

    function titleFromName(name) {
        return String(name || "")
            .replace(/\.[^.]+$/, "")
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    function getAssets(type) {
        return assets.filter(item => item.type === type && item.path);
    }

    function assetTitle(asset) {
        return asset.title || titleFromName(asset.name || asset.path);
    }

    function fallbackImage(img, type) {
        const list = getAssets(type);
        const currentIndex = Number(img.dataset.index || 0);
        const next = list[(currentIndex + 1) % Math.max(list.length, 1)];

        if (!next || img.dataset.fallbackUsed === "1") {
            img.style.display = "none";
            return;
        }

        img.dataset.fallbackUsed = "1";
        img.src = next.path;
    }

    window.DivingClubImageFallback = fallbackImage;

    async function loadManifest() {
        const response = await fetch("js/assets-manifest.json?v=" + Date.now(), {
            cache: "no-store"
        });

        const data = await response.json();
        assets = Array.isArray(data) ? data : [data];

        log("manifest loaded", assets);
    }

    function forceVisible(container) {
        if (!container) return;

        container.querySelectorAll("*").forEach(node => {
            node.style.visibility = "visible";
        });

        container.querySelectorAll("[data-animate]").forEach(node => {
            node.classList.add("visible");
            node.style.opacity = "1";
            node.style.transform = "none";
        });

        container.querySelectorAll("img").forEach(img => {
            img.style.opacity = "1";
            img.style.visibility = "visible";
            img.style.display = "block";
        });
    }

    function renderGallery() {
        const container = document.getElementById("activities-grid");
        const items = getAssets("activity");

        if (!container || !items.length) return;

        container.innerHTML = items.map((item, index) => {
            const title = assetTitle(item);

            return `
                <div class="activity-card visible local-rendered-card" data-animate="fade-up" data-delay="${index * 120}">
                    <div class="activity-image">
                        <img src="${escapeHtml(item.path)}"
                             alt="${escapeHtml(title)}"
                             loading="eager"
                             data-index="${index}"
                             onerror="window.DivingClubImageFallback(this, 'activity')">
                        <div class="activity-overlay"></div>
                        <div class="activity-label">
                            <span>${escapeHtml(title)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        forceVisible(container);
    }

    function renderEvents() {
        const container = document.getElementById("moments-carousel");
        const items = getAssets("moment");

        if (!container || !items.length) return;

        container.innerHTML = items.map((item, index) => {
            const title = assetTitle(item);
            const price = 180 + index * 50;
            const rating = (4.5 + (index * 0.1)).toFixed(1);
            const reviews = 4 + index * 4;

            return `
                <div class="moment-card visible local-rendered-card" data-animate="fade-up" data-delay="${index * 120}">
                    <div class="moment-image">
                        <img src="${escapeHtml(item.path)}"
                             alt="${escapeHtml(title)}"
                             loading="eager"
                             data-index="${index}"
                             onerror="window.DivingClubImageFallback(this, 'moment')">
                    </div>
                    <div class="moment-info">
                        <h4>${escapeHtml(title)}</h4>
                        <p>Explore this diving experience with DivingClub.</p>
                        <div class="moment-details">
                            <span class="price">From $${price}</span>
                            <div class="moment-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                                <span>${rating}(${reviews})</span>
                            </div>
                        </div>
                        <a href="#" class="see-more">See More →</a>
                    </div>
                </div>
            `;
        }).join("");

        forceVisible(container);
    }

    function renderBlogs() {
        const container = document.getElementById("blog-grid");
        const items = getAssets("blog");

        if (!container || !items.length) return;

        container.innerHTML = items.map((item, index) => {
            const title = assetTitle(item);
            const today = new Date();
            today.setDate(today.getDate() - index);

            const publishedDate = today.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });

            return `
                <article class="blog-card visible local-rendered-card" data-animate="fade-up" data-delay="${index * 120}">
                    <div class="blog-image">
                        <img src="${escapeHtml(item.path)}"
                             alt="${escapeHtml(title)}"
                             loading="eager"
                             data-index="${index}"
                             onerror="window.DivingClubImageFallback(this, 'blog')">
                    </div>
                    <div class="blog-info">
                        <div class="blog-meta">
                            <span><i class="far fa-calendar"></i> ${escapeHtml(publishedDate)}</span>
                            <span><i class="far fa-clock"></i> 5 min read</span>
                        </div>
                        <h3>${escapeHtml(title)}</h3>
                        <p>Discover useful diving tips, underwater experiences, and safety guidance from DivingClub.</p>
                    </div>
                </article>
            `;
        }).join("");

        forceVisible(container);
    }

    function fixLogoEncoding() {
        document.querySelectorAll(".logo-icon").forEach(icon => {
            icon.innerHTML = '<i class="fas fa-mask-snorkel"></i>';
        });
    }

    function renderAll() {
        if (!assets.length) return;

        renderCount += 1;

        renderGallery();
        renderEvents();
        renderBlogs();
        fixLogoEncoding();

        document.body.classList.add("local-dynamic-content-ready");

        log("render complete", renderCount);
    }

    function patchDataService() {
        if (!window.DataService) return;

        window.DataService.loadActivities = async function () {
            renderGallery();
        };

        window.DataService.loadMoments = async function () {
            renderEvents();
        };

        window.DataService.loadBlogPosts = async function () {
            renderBlogs();
        };

        window.DataService.loadFallbackContent = function () {
            renderAll();
        };

        window.DataService.showErrorState = function () {
            renderAll();
        };

        const originalInit = window.DataService.init;

        window.DataService.init = async function () {
            renderAll();

            try {
                if (typeof originalInit === "function") {
                    setTimeout(renderAll, 250);
                    setTimeout(renderAll, 700);
                }
            } catch (error) {
                console.warn("[LocalDynamicRenderer] blocked old DataService init error", error);
            }
        };

        log("DataService patched");
    }

    function observeSkeletonReturn() {
        if (observerRunning) return;
        observerRunning = true;

        const observer = new MutationObserver(() => {
            const skeletonExists =
                document.querySelector("#activities-grid .skeleton-card") ||
                document.querySelector("#moments-carousel .skeleton-card") ||
                document.querySelector("#blog-grid .skeleton-card");

            if (skeletonExists && assets.length) {
                setTimeout(renderAll, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    async function boot() {
        try {
            await loadManifest();
            patchDataService();
            renderAll();
            observeSkeletonReturn();

            setTimeout(renderAll, 200);
            setTimeout(renderAll, 700);
            setTimeout(renderAll, 1500);
            setTimeout(renderAll, 3000);
        } catch (error) {
            console.error("[LocalDynamicRenderer] failed", error);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    window.addEventListener("load", () => {
        setTimeout(renderAll, 100);
        setTimeout(renderAll, 800);
    });
})();
