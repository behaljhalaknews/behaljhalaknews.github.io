(function () {
  "use strict";


  function ensureAnalytics() {
    if (window.__bahalJhalakAnalyticsLoaded) return;
    window.__bahalJhalakAnalyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-G2EC83JEL3");

    if (!document.querySelector('script[data-bahal-analytics="true"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-G2EC83JEL3";
      script.setAttribute("data-bahal-analytics", "true");
      document.head.appendChild(script);
    }
  }

  function createAdSlot() {
    const ad = document.createElement("div");
    ad.className = "ad-slot ad-slot-article ad-slot-animated";
    ad.setAttribute("aria-label", "विज्ञापन");
    ad.innerHTML = "<span>ADVERTISEMENT</span>";
    return ad;
  }

  function placeMidArticleAd() {
    const body = document.querySelector(".article-body");
    if (!body) return false;

    let ad = body.querySelector(":scope > .ad-slot-article");
    if (!ad) {
      ad = createAdSlot();
    } else {
      ad.classList.add("ad-slot-animated");
    }

    // Remove any duplicate mid-article slots from this article.
    Array.from(body.querySelectorAll(":scope > .ad-slot-article")).forEach(function (item) {
      if (item !== ad) item.remove();
    });

    const children = Array.from(body.children).filter(function (item) {
      return !item.classList.contains("ad-slot-article");
    });

    if (!children.length) {
      body.appendChild(ad);
      return true;
    }

    const middleIndex = Math.max(1, Math.ceil(children.length / 2));
    body.insertBefore(ad, children[middleIndex] || null);
    return true;
  }

  function ensurePermanentBottomAd() {
    const article = document.querySelector(".article-card");
    if (!article) return false;

    if (!article.querySelector(".ad-slot-article-end")) {
      const ad = document.createElement("div");
      ad.className = "ad-slot ad-slot-article-end";
      ad.setAttribute("aria-label", "विज्ञापन");
      ad.innerHTML = "<span>ADVERTISEMENT</span>";
      article.appendChild(ad);
    }
    return true;
  }

  function init() {
    placeMidArticleAd();
    ensurePermanentBottomAd();
  }

  function start() {
    ensureAnalytics();
    init();

    let tries = 0;
    const timer = setInterval(function () {
      init();
      tries++;
      if (tries >= 24) clearInterval(timer);
    }, 250);

    const observer = new MutationObserver(function () {
      if (placeMidArticleAd()) ensurePermanentBottomAd();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 7000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();