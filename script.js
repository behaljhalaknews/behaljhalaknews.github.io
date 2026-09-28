/* बहल झलक — Mobile Navigation + News Rendering */

document.addEventListener("DOMContentLoaded", function () {
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

    const news = Array.isArray(window.BAHAL_JHALAK_NEWS) ? window.BAHAL_JHALAK_NEWS : [];

    function esc(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[char];
        });
    }

    function card(item, small) {
        const cls = small ? "small-news-card" : "news-card";
        const contentCls = small ? "small-news-content" : "news-card-content";
        return '<article class="' + cls + '">' +
            '<a href="./article.html?id=' + encodeURIComponent(item.id) + '" class="news-card-image-link">' +
            '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" loading="lazy"></a>' +
            '<div class="' + contentCls + '">' +
            '<span class="category-tag' + (item.category === "हरियाणा" || item.category === "राज्य अपडेट" ? " dark" : "") + '">' + esc(item.category) + '</span>' +
            '<h3><a href="./article.html?id=' + encodeURIComponent(item.id) + '">' + esc(item.title) + '</a></h3>' +
            '<p>' + esc(item.excerpt) + '</p>' +
            '<div class="news-meta"><span>' + esc(item.location || "बहल झलक") + '</span><span>•</span><span>' + esc(item.date) + '</span></div>' +
            '</div></article>';
    }

    function renderHomepage() {
        if (!document.getElementById("featured-news") || !news.length) return;
        const featured = news.find(item => item.featured) || news[0];
        const latest = news.filter(item => item.id !== featured.id).slice(0, 2);

        document.getElementById("featured-news").innerHTML =
            '<article class="featured-news-card">' +
            '<a href="./article.html?id=' + encodeURIComponent(featured.id) + '" class="news-card-image-link">' +
            '<img src="' + esc(featured.image) + '" alt="' + esc(featured.title) + '"></a>' +
            '<div class="featured-news-content"><span class="category-tag">' + esc(featured.category) + '</span>' +
            '<h2><a href="./article.html?id=' + encodeURIComponent(featured.id) + '">' + esc(featured.title) + '</a></h2>' +
            '<p>' + esc(featured.excerpt) + '</p><div class="news-meta"><span>' + esc(featured.location || "बहल झलक") + '</span><span>•</span><span>' + esc(featured.date) + '</span></div></div></article>';

        document.getElementById("latest-news-grid").innerHTML = latest.map(item => card(item, true)).join("");
        const groups = {
            "bahal-news-grid": ["बहल"],
            "bhiwani-news-grid": ["भिवानी"],
            "haryana-news-grid": ["हरियाणा", "राज्य अपडेट"],
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
            '<li><a href="./article.html?id=' + encodeURIComponent(item.id) + '"><span>' + (i + 1) + '</span>' + esc(item.title) + '</a></li>'
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
        const shareButton = document.getElementById("share-button");
        if (shareButton) shareButton.addEventListener("click", async function () {
            const shareData = { title: data.title, text: data.title, url: window.location.href };
            try {
                if (navigator.share) await navigator.share(shareData);
                else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(window.location.href);
                    shareButton.textContent = "✓ लिंक कॉपी हो गया";
                } else window.prompt("इस लिंक को कॉपी करें:", window.location.href);
            } catch (error) {
                if (error.name !== "AbortError") shareButton.textContent = "शेयर नहीं हो सका";
            }
        });
    }

    renderHomepage();
    renderArticle();
});