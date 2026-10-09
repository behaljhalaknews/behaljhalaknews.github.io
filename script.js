/* बहल झलक — Mobile Navigation + News Rendering */

/* BACK/RETURN RECOVERY: clear stale mobile UI state when the homepage is restored from browser history/bfcache. */
window.addEventListener("pageshow", function () {
    if (!document.body) return;
    document.body.classList.remove("mobile-menu-open");
    document.querySelectorAll(".mobile-bottom-drawer.is-open").forEach(function (drawer) {
        drawer.classList.remove("is-open");
    });
    document.querySelectorAll(".main-navigation.is-open").forEach(function (nav) {
        nav.classList.remove("is-open");
    });
    document.querySelectorAll(".mobile-bottom-menu[aria-expanded='true']").forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
    });
});

document.addEventListener("DOMContentLoaded", async function () {
    // Always clear a stale mobile-menu lock when a page is restored from Back/forward cache.
    window.addEventListener("pageshow", function () {
        document.body.classList.remove("mobile-menu-open");
        document.documentElement.classList.remove("mobile-menu-open");
        const drawer = document.querySelector(".mobile-bottom-drawer");
        const bottomMenu = document.querySelector(".mobile-bottom-menu");
        if (drawer) drawer.classList.remove("is-open");
        if (bottomMenu) bottomMenu.setAttribute("aria-expanded", "false");
        const navigation = document.querySelector(".main-navigation");
        const menuButton = document.querySelector(".menu-toggle");
        if (navigation) navigation.classList.remove("is-open");
        if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    });

    // Static article pages already contain their complete content.
    // Skip homepage/news-data/Supabase rendering runtime on article pages.
    if (document.querySelector(".article-page") && !document.getElementById("featured-news")) {
        return;
    }
    // Mobile bottom navigation was intentionally removed.
    // The mobile menu now lives inside the header and is rendered by index.html.

    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".main-navigation");
    const categoryItem = document.querySelector(".has-submenu");
    const categoryButton = document.querySelector(".submenu-toggle");

    function closeMenu() {
        if (!navigation || !menuButton) return;
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "मेन्यू खोलें");
        if (categoryItem) categoryItem.classList.remove("is-open");
        if (categoryButton) categoryButton.setAttribute("aria-expanded", "false");
    }

    if (menuButton && navigation) {
        menuButton.addEventListener("click", function () {
            const isOpen = navigation.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.setAttribute("aria-label", isOpen ? "मेन्यू बंद करें" : "मेन्यू खोलें");
        });
        if (categoryButton && categoryItem) {
            categoryButton.addEventListener("click", function (event) {
                event.preventDefault();
                const isOpen = categoryItem.classList.toggle("is-open");
                categoryButton.setAttribute("aria-expanded", String(isOpen));
            });
        }
        navigation.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                if (window.innerWidth <= 768) closeMenu();
            });
        });
        document.addEventListener("click", function (event) {
            if (window.innerWidth <= 768 && navigation.classList.contains("is-open") &&
                !navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
        });
        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    let news = Array.isArray(window.BAHAL_JHALAK_NEWS) ? window.BAHAL_JHALAK_NEWS.slice().reverse() : [];

    // IMPORTANT: render the homepage immediately from local news data.
    // Do not block the Back -> Homepage transition on Supabase/network requests.
    // This also makes the site usable when Supabase is slow or temporarily unavailable.
    if (!news.length) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const dataResponse = await fetch("./news-data.js?fallback=20261003-01", {
                cache: "no-store",
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (dataResponse.ok) {
                const rawData = await dataResponse.text();
                const marker = "window.BAHAL_JHALAK_NEWS =";
                const markerIndex = rawData.indexOf(marker);
                if (markerIndex !== -1) {
                    let jsonText = rawData.slice(markerIndex + marker.length).trim();
                    if (jsonText.endsWith(";")) jsonText = jsonText.slice(0, -1).trim();
                    // news-data.js is a JavaScript assignment, not strict JSON.
                    // Evaluate only the array expression so the homepage can recover
                    // even if the external data script is temporarily unavailable.
                    const fallbackNews = Function('"use strict"; return (' + jsonText + ');')();
                    if (Array.isArray(fallbackNews)) news = fallbackNews.slice().reverse();
                }
            }
        } catch (error) {
            console.warn("News data fallback failed:", error);
        }
    }

    // Render local news FIRST so navigation/Back never waits for Supabase.
    renderHomepage();
    renderBreakingTicker();
    renderPhotoBreakingNews();

    // CENTRAL IMAGE SOURCE:
    // Supabase photo overrides are now a non-blocking enhancement.
    // A slow/failing image service must never hold the homepage transition.
    (async function loadImageOverrides() {
        try {
            const supabaseUrl = window.BAHAL_SUPABASE_URL || "https://exkoxaxbmspxsqdokdcg.supabase.co";
            const publishableKey = window.BAHAL_SUPABASE_PUBLISHABLE_KEY || "";
            if (!supabaseUrl || !publishableKey) return;

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(
                supabaseUrl + "/rest/v1/article_images?select=article_id,image_url",
                {
                    headers: {
                        apikey: publishableKey,
                        Authorization: "Bearer " + publishableKey
                    },
                    cache: "no-store",
                    signal: controller.signal
                }
            );
            clearTimeout(timeout);
            if (!response.ok) return;

            const overrides = await response.json();
            if (!Array.isArray(overrides)) return;

            const imageMap = {};
            overrides.forEach(function (row) {
                if (row && row.article_id && row.image_url) {
                    let value = row.image_url;
                    try {
                        const parsed = JSON.parse(value);
                        if (Array.isArray(parsed)) value = parsed.find(Boolean) || "";
                    } catch (error) {}
                    if (value) imageMap[row.article_id] = value;
                }
            });

            if (Object.keys(imageMap).length) {
                news = news.map(function (item) {
                    return imageMap[item.id]
                        ? Object.assign({}, item, { image: imageMap[item.id] })
                        : item;
                });
                renderHomepage();
                renderPhotoBreakingNews();
            }
        } catch (error) {
            console.warn("Supabase image overrides unavailable; local images retained.", error);
        }
    })();

    // AUTO TICKER: show the 10 newest published stories from news-data.js.
    // Each headline links directly to its article page.
    function getCleanTickerTitle(item) {
        let title = String((item && item.title) || "").trim();
        // Some older/published records may contain the complete JSON object
        // inside the title field. Extract only its real headline.
        if (title.charAt(0) === "{" && title.charAt(title.length - 1) === "}") {
            try {
                const parsed = JSON.parse(title);
                if (parsed && typeof parsed.title === "string" && parsed.title.trim()) {
                    title = parsed.title.trim();
                }
            } catch (error) {
                // Keep the original title if it is not valid JSON.
            }
        }
        // Remove invisible zero-width characters that can appear in copied headlines.
        return title.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    }

    function renderBreakingTicker() {
        const breakingTicker = document.getElementById("breaking-news-ticker");
        if (!breakingTicker) return;

        const latestTickerNews = news.slice(0, 10).filter(function (item) {
            return item && getCleanTickerTitle(item);
        });

        if (!latestTickerNews.length) {
            breakingTicker.textContent = "अभी कोई ताज़ा खबर उपलब्ध नहीं है";
            return;
        }

        breakingTicker.innerHTML = latestTickerNews.map(function (item) {
            const href = item.page || ("./article.html?id=" + encodeURIComponent(item.id));
            return '<a href="' + esc(href) + '" class="breaking-news-link">' +
                esc(getCleanTickerTitle(item)) + '</a>';
        }).join('<span class="breaking-news-separator" aria-hidden="true"> • </span>');
    }

    // The date-aware popup is managed by the independent fallback in index.html.
    // Keep this function for existing render calls, without starting a second competing carousel.
    function renderPhotoBreakingNews() { return; }

    function esc(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[char];
        });
    }

    function card(item, small) {
        const cls = small ? "small-news-card" : "news-card";
        const contentCls = small ? "small-news-content" : "news-card-content";
        const href = item.page || ("./article.html?id=" + encodeURIComponent(item.id));
        return '<article class="' + cls + '">' +
            (item.image ? '<a href="' + esc(href) + '" class="news-card-image-link"><img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" loading="lazy"></a>' : '') +
            '<div class="' + contentCls + '">' +
            '<span class="category-tag' + (item.category === "हरियाणा" || item.category === "राज्य अपडेट" ? " dark" : "") + '">' + esc(item.category) + '</span>' +
            '<h3><a href="' + esc(href) + '">' + esc(item.title) + '</a></h3>' +
            '<p>' + esc(item.excerpt) + '</p>' +
            (item.videoUrl ? '<a class="news-video-link" href="' + esc(href) + '">▶️ वीडियो देखें</a>' : '') +
            '<div class="news-meta"><span>' + esc(item.location || "बहल झलक") + '</span><span>•</span><span>' + esc(item.date) + '</span></div>' +
            '<button type="button" class="bj-save-news-btn" data-save-news="1" data-url="' + esc(href) + '" data-title="' + esc(item.title) + '" data-image="' + esc(item.image || "") + '" aria-pressed="false">🔖 खबर सेव करें</button>' +
            '</div></article>';
    }

    function renderHomepage() {
        if (!document.getElementById("featured-news") || !news.length) return;
        // Keep the Bhivani electricity-board newborn story inside the Bhivani category, not the permanent main/featured slot.
        const mainExcludedIds = ["bhiwani-electricity-board-colony-newborn-2026-09-28"];
        const isMainExcluded = item => item && mainExcludedIds.includes(item.id);
        const featured = news.find(item => item.featured && !isMainExcluded(item)) ||
            news.find(item => !isMainExcluded(item)) || news[0];
        const latest = news.filter(item => item.id !== featured.id).slice(0, 2);

        const featuredImage = featured.image || "";
        document.getElementById("featured-news").innerHTML =
            '<article class="featured-news-card" data-article-id="' + esc(featured.id) + '">' +
            (featuredImage ? '<a href="' + esc(featured.page || ("./article.html?id=" + encodeURIComponent(featured.id))) + '" class="news-card-image-link"><img src="' + esc(featuredImage) + '" alt="' + esc(featured.title) + '" loading="lazy"></a>' : '') +
            '<div class="featured-news-content"><span class="category-tag">' + esc(featured.category) + '</span>' +
            '<h2><a href="' + esc(featured.page || ("./article.html?id=" + encodeURIComponent(featured.id))) + '">' + esc(featured.title) + '</a></h2>' +
            '<p>' + esc(featured.excerpt) + '</p><div class="news-meta"><span>' + esc(featured.location || "बहल झलक") + '</span><span>•</span><span>' + esc(featured.date) + '</span></div>' +
            '<button type="button" class="bj-save-news-btn" data-save-news="1" data-url="' + esc(featured.page || ("./article.html?id=" + encodeURIComponent(featured.id))) + '" data-title="' + esc(featured.title) + '" data-image="' + esc(featuredImage) + '" aria-pressed="false">🔖 खबर सेव करें</button></div></article>';

        document.getElementById("latest-news-grid").innerHTML = latest.map(item => card(item, true)).join("");
        const groups = {
            "bahal-news-grid": ["बहल"],
            "bhiwani-news-grid": ["भिवानी"],
            "haryana-news-grid": ["हरियाणा", "राज्य अपडेट"],
            "rajasthan-news-grid": ["राजस्थान"],
            "national-news-grid": ["राष्ट्रीय"],
            "politics-news-grid": ["राजनीति"],
            "crime-news-grid": ["अपराध"],
            "sports-news-grid": ["खेल"],
            "video-news-grid": ["वीडियो"]
        };
        Object.keys(groups).forEach(function (target) {
            const el = document.getElementById(target);
            if (!el) return;
            const items = news.filter(item => groups[target].includes(item.category)).slice(0, 6);
            el.innerHTML = items.length ? items.map(item => card(item, false)).join("") :
                '<div class="category-placeholder"><strong>इस सेक्शन में अभी खबर नहीं है</strong><span>नई सत्यापित खबर जोड़ते ही यहाँ अपने आप दिखाई देगी।</span></div>';
        });

        const list = document.getElementById("latest-list");
        if (list) list.innerHTML = news.slice(0, 5).map((item, i) =>
            '<li><a href="' + esc(item.page || ("./article.html?id=" + encodeURIComponent(item.id))) + '"><span>' + (i + 1) + '</span>' + esc(item.title) + '</a></li>'
        ).join("");
    }

    function renderArticle() {
        const titleEl = document.getElementById("article-title");
        if (!titleEl || !news.length) return;
        const id = new URLSearchParams(window.location.search).get("id");
        const data = news.find(item => item.id === id) || news[0];
        document.title = data.title + " | बहल झलक";
        document.getElementById("article-category").textContent = data.category;
        titleEl.textContent = data.title;
        document.getElementById("article-date").textContent = data.date;
        const image = document.getElementById("article-image");
        image.src = data.image;
        image.alt = data.title;
        const body = document.getElementById("article-body");
        const paragraphs = Array.isArray(data.content) ? data.content : [data.content];
        body.innerHTML = paragraphs.map(p => "<p>" + esc(p) + "</p>").join("");
        const pageUrl = window.location.href;
        const encodedUrl = encodeURIComponent(pageUrl);
        const encodedTitle = encodeURIComponent(data.title);
        const shareData = { title: data.title, text: data.title, url: pageUrl };

        const description = data.excerpt || data.title;
        document.getElementById("article-description")?.setAttribute("content", description);
        document.getElementById("og-title")?.setAttribute("content", data.title);
        document.getElementById("og-description")?.setAttribute("content", description);
        document.getElementById("og-image")?.setAttribute("content", new URL(data.image, window.location.href).href);
        document.getElementById("og-url")?.setAttribute("content", pageUrl);

        const facebookShare = document.getElementById("facebook-share");
        const whatsappShare = document.getElementById("whatsapp-share");
        const telegramShare = document.getElementById("telegram-share");
        const copyShare = document.getElementById("copy-share");
        const nativeShare = document.getElementById("native-share");
        if (facebookShare) facebookShare.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl;
        if (whatsappShare) whatsappShare.href = "https://api.whatsapp.com/send?text=" + encodeURIComponent(data.title + " — " + pageUrl);
        if (telegramShare) telegramShare.href = "https://t.me/share/url?url=" + encodedUrl + "&text=" + encodedTitle;

        async function copyNewsLink(button) {
            try {
                await navigator.clipboard.writeText(pageUrl);
                if (button) {
                    const oldText = button.textContent;
                    button.textContent = "✓ लिंक कॉपी हो गया";
                    setTimeout(() => { button.textContent = oldText; }, 1800);
                }
            } catch (error) {
                window.prompt("इस लिंक को कॉपी करें:", pageUrl);
            }
        }

        if (copyShare) copyShare.addEventListener("click", function () { copyNewsLink(copyShare); });

        const nativeShareAction = async function (button) {
            try {
                if (navigator.share) await navigator.share(shareData);
                else await copyNewsLink(button);
            } catch (error) {
                if (error.name !== "AbortError") button.textContent = "शेयर नहीं हो सका";
            }
        };

        const shareButton = document.getElementById("share-button");
        if (shareButton) shareButton.addEventListener("click", function () { nativeShareAction(shareButton); });
        if (nativeShare) nativeShare.addEventListener("click", function () { nativeShareAction(nativeShare); });
    }

    renderArticle();
});