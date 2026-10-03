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
    // Static article pages already contain their complete content.
    // Skip homepage/news-data/Supabase rendering runtime on article pages.
    if (document.querySelector(".article-page") && !document.getElementById("featured-news")) {
        return;
    }
    // MOBILE BOTTOM NAV:
    // फोन पर समाचार साइट के लिए स्थायी, साफ और एक-जैसा bottom menu।
    // यह किसी बाहरी icon library पर निर्भर नहीं है।
    function installMobileBottomNav() {
        if (document.querySelector(".mobile-bottom-nav")) return;

        const nav = document.createElement("nav");
        nav.className = "mobile-bottom-nav";
        nav.setAttribute("aria-label", "मोबाइल मुख्य मेनू");
        nav.innerHTML =
            '<a class="mobile-bottom-item active" href="./index.html" aria-label="होम"><span class="mobile-bottom-icon">⌂</span><span>होम</span></a>' +
            '<a class="mobile-bottom-item" href="./index.html#video-news" aria-label="वीडियो"><span class="mobile-bottom-icon">▶</span><span>वीडियो</span></a>' +
            '<a class="mobile-bottom-item" href="./index.html#latest-news" aria-label="ताज़ा खबरें"><span class="mobile-bottom-icon">●</span><span>ताज़ा</span></a>' +
            '<a class="mobile-bottom-item" href="./index.html#latest-news" aria-label="न्यूज़"><span class="mobile-bottom-icon">▤</span><span>न्यूज़</span></a>' +
            '<button class="mobile-bottom-item mobile-bottom-menu" type="button" aria-expanded="false" aria-controls="mobile-bottom-drawer" aria-label="मेन्यू"><span class="mobile-bottom-icon">☰</span><span>मेनू</span></button>';

        const drawer = document.createElement("div");
        drawer.className = "mobile-bottom-drawer";
        drawer.id = "mobile-bottom-drawer";
        drawer.innerHTML =
            '<div class="mobile-drawer-backdrop" data-mobile-menu-close></div>' +
            '<div class="mobile-drawer-panel" role="dialog" aria-modal="true" aria-label="बहल झलक मेन्यू">' +
                '<div class="mobile-drawer-head"><strong>बहल झलक मेन्यू</strong><button type="button" class="mobile-drawer-close" data-mobile-menu-close aria-label="मेन्यू बंद करें">×</button></div>' +
                '<div class="mobile-drawer-links">' +
                    '<a href="./index.html">🏠 मुख्य पृष्ठ</a>' +
                    '<a href="./index.html#latest-news">📰 ताज़ा खबरें</a>' +
                    '<a href="./index.html#bahal-news">📍 बहल</a>' +
                    '<a href="./index.html#bhiwani-news">🏙️ भिवानी</a>' +
                    '<a href="./index.html#haryana-news">🇮🇳 हरियाणा</a>' +
                    '<a href="./index.html#national-news">🌐 राष्ट्रीय</a>' +
                    '<a href="./index.html#politics-news">⚖️ राजनीति</a>' +
                    '<a href="./index.html#crime-news">🚨 अपराध</a>' +
                    '<a href="./index.html#sports-news">🏆 खेल</a>' +
                    '<a href="./index.html#video-news">▶️ वीडियो न्यूज़</a>' +
                    '<a href="./index.html#contact">📞 संपर्क करें</a>' +
                '</div>' +
            '</div>';

        document.body.appendChild(nav);
        document.body.appendChild(drawer);

        const bottomMenu = nav.querySelector(".mobile-bottom-menu");
        const closeButtons = drawer.querySelectorAll("[data-mobile-menu-close]");

        function closeBottomMenu() {
            drawer.classList.remove("is-open");
            bottomMenu.setAttribute("aria-expanded", "false");
            document.body.classList.remove("mobile-menu-open");
        }

        bottomMenu.addEventListener("click", function () {
            const open = drawer.classList.toggle("is-open");
            bottomMenu.setAttribute("aria-expanded", String(open));
            document.body.classList.toggle("mobile-menu-open", open);
        });

        closeButtons.forEach(function (button) {
            button.addEventListener("click", closeBottomMenu);
        });

        drawer.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeBottomMenu);
        });
    }

    // Article pages use a dedicated article layout; do not inject the homepage mobile bottom nav/drawer there.
    // This prevents article-page scroll/runtime interference while preserving the homepage navigation.
    if (!document.querySelector(".article-page")) {
        installMobileBottomNav();
    }

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

    // Fallback: if news-data.js was blocked or served from an old cache,
    // load the same local data file directly and parse only its JSON array.
    if (!news.length) {
        try {
            const dataResponse = await fetch("./news-data.js?fallback=20260929-01", { cache: "no-store" });
            if (dataResponse.ok) {
                const rawData = await dataResponse.text();
                const marker = "window.BAHAL_JHALAK_NEWS =";
                const markerIndex = rawData.indexOf(marker);
                if (markerIndex !== -1) {
                    let jsonText = rawData.slice(markerIndex + marker.length).trim();
                    if (jsonText.endsWith(";")) jsonText = jsonText.slice(0, -1).trim();
                    const fallbackNews = JSON.parse(jsonText);
                    if (Array.isArray(fallbackNews)) news = fallbackNews.slice().reverse();
                }
            }
        } catch (error) {
            console.error("News data fallback failed:", error);
        }
    }

    // CENTRAL IMAGE SOURCE:
    // सभी प्रकाशित खबरों की live photos Supabase article_images से एक ही बार पढ़ी जाती हैं।
    // Homepage और article page दोनों इसी merged news data को इस्तेमाल करते हैं।
    try {
        const supabaseUrl = window.BAHAL_SUPABASE_URL || "https://exkoxaxbmspxsqdokdcg.supabase.co";
        const publishableKey = window.BAHAL_SUPABASE_PUBLISHABLE_KEY || "";
        if (supabaseUrl && publishableKey) {
            const response = await fetch(
                supabaseUrl + "/rest/v1/article_images?select=article_id,image_url",
                {
                    headers: {
                        apikey: publishableKey,
                        Authorization: "Bearer " + publishableKey
                    },
                    cache: "no-store"
                }
            );
            if (response.ok) {
                const overrides = await response.json();
                if (Array.isArray(overrides)) {
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
                    news = news.map(function (item) {
                        return imageMap[item.id]
                            ? Object.assign({}, item, { image: imageMap[item.id] })
                            : item;
                    });
                }
            } else {
                console.warn("Supabase image request failed:", response.status);
            }
        }
    } catch (error) {
        console.warn("Supabase image overrides unavailable; using local news images.", error);
    }

    // AUTO TICKER: show the 10 newest published stories from news-data.js.
    // Each headline links directly to its article page.
    function renderBreakingTicker() {
        const breakingTicker = document.getElementById("breaking-news-ticker");
        if (!breakingTicker) return;

        const latestTickerNews = news.slice(0, 10).filter(function (item) {
            return item && item.title;
        });

        if (!latestTickerNews.length) {
            breakingTicker.textContent = "अभी कोई ताज़ा खबर उपलब्ध नहीं है";
            return;
        }

        breakingTicker.innerHTML = latestTickerNews.map(function (item) {
            const href = item.page || ("./article.html?id=" + encodeURIComponent(item.id));
            return '<a href="' + esc(href) + '" class="breaking-news-link">' +
                esc(item.title) + '</a>';
        }).join('<span class="breaking-news-separator" aria-hidden="true"> • </span>');
    }

    function esc(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[char];
        });
    }

    function card(item, small) {
        const cls = small ? "small-news-card" : "news-card";
        const contentCls = small ? "small-news-content" : "news-card-content";
        return '<article class="' + cls + '">' +
            (item.image ? '<a href="' + esc(item.page || ("./article.html?id=" + encodeURIComponent(item.id))) + '" class="news-card-image-link"><img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" loading="lazy"></a>' : '') +
            '<div class="' + contentCls + '">' +
            '<span class="category-tag' + (item.category === "हरियाणा" || item.category === "राज्य अपडेट" ? " dark" : "") + '">' + esc(item.category) + '</span>' +
            '<h3><a href="' + esc(item.page || ("./article.html?id=" + encodeURIComponent(item.id))) + '">' + esc(item.title) + '</a></h3>' +
            '<p>' + esc(item.excerpt) + '</p>' +
            (item.videoUrl ? '<a class="news-video-link" href="' + esc(item.page || ("./article.html?id=" + encodeURIComponent(item.id))) + '">▶️ वीडियो देखें</a>' : '') +
            '<div class="news-meta"><span>' + esc(item.location || "बहल झलक") + '</span><span>•</span><span>' + esc(item.date) + '</span></div>' +
            '</div></article>';
    }

    function renderHomepage() {
        if (!document.getElementById("featured-news") || !news.length) return;
        const featured = news.find(item => item.featured) || news[0];
        const latest = news.filter(item => item.id !== featured.id).slice(0, 2);

        const featuredImage = featured.image || "";
        document.getElementById("featured-news").innerHTML =
            '<article class="featured-news-card" data-article-id="' + esc(featured.id) + '">' +
            (featuredImage ? '<a href="' + esc(featured.page || ("./article.html?id=" + encodeURIComponent(featured.id))) + '" class="news-card-image-link"><img src="' + esc(featuredImage) + '" alt="' + esc(featured.title) + '" loading="lazy"></a>' : '') +
            '<div class="featured-news-content"><span class="category-tag">' + esc(featured.category) + '</span>' +
            '<h2><a href="' + esc(featured.page || ("./article.html?id=" + encodeURIComponent(featured.id))) + '">' + esc(featured.title) + '</a></h2>' +
            '<p>' + esc(featured.excerpt) + '</p><div class="news-meta"><span>' + esc(featured.location || "बहल झलक") + '</span><span>•</span><span>' + esc(featured.date) + '</span></div></div></article>';

        document.getElementById("latest-news-grid").innerHTML = latest.map(item => card(item, true)).join("");
        const groups = {
            "bahal-news-grid": ["बहल"],
            "bhiwani-news-grid": ["भिवानी"],
            "haryana-news-grid": ["हरियाणा", "राज्य अपडेट"],
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

    renderHomepage();
    renderArticle();
    renderBreakingTicker();
});