(function () {
  "use strict";

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