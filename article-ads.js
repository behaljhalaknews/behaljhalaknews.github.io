(function () {
  "use strict";

  function ensureAnalytics() {
    if (window.__bahalJhalakAnalyticsLoaded) return;
    const directAnalytics = document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-G2EC83JEL3"]');
    if (directAnalytics) {
      window.__bahalJhalakAnalyticsLoaded = true;
      return;
    }

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

  function createAdSlot(className) {
    const ad = document.createElement("div");
    ad.className = "ad-slot " + className;
    ad.setAttribute("aria-label", "विज्ञापन");
    ad.innerHTML = "<span>ADVERTISEMENT</span>";
    return ad;
  }

  function placeMidArticleAd() {
    const body = document.querySelector(".article-body");
    if (!body) return false;

    let ad = body.querySelector(":scope > .ad-slot-article");
    if (!ad) {
      ad = createAdSlot("ad-slot-article ad-slot-animated");
    } else {
      ad.classList.add("ad-slot-animated");
    }

    const children = Array.from(body.children).filter(function (item) {
      return !item.classList.contains("ad-slot-article");
    });

    if (!children.length) {
      if (ad.parentNode !== body) body.appendChild(ad);
      return true;
    }

    const middleIndex = Math.max(1, Math.ceil(children.length / 2));
    const target = children[middleIndex] || null;
    const alreadyCorrect = ad.parentNode === body &&
      (target ? ad.nextElementSibling === target : ad === body.lastElementChild);

    if (!alreadyCorrect) {
      body.insertBefore(ad, target);
    }
    return true;
  }

  function ensurePermanentBottomAd() {
    const article = document.querySelector(".article-card");
    if (!article) return false;

    if (!article.querySelector(".ad-slot-article-end")) {
      article.appendChild(createAdSlot("ad-slot-article-end"));
    }
    return true;
  }

  function loadDirectAdData(){
    if(window.BAHAL_DIRECT_ADS)return;
    var s=document.createElement("script");
    s.src="./ads-data.js?v=20261004-01";
    s.onload=function(){
      var d=document.createElement("script");
      d.src="./direct-ads.js?v=20261004-01";
      document.body.appendChild(d);
    };
    document.head.appendChild(s);
  }

  function init() {
    loadDirectAdData();
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
      init();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(function () {
      observer.disconnect();
      clearInterval(timer);
    }, 7000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();