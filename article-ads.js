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

    let ad = body.parentElement.querySelector(".ad-slot-article");
    if (!ad) ad = createAdSlot();

    ad.classList.add("ad-slot-animated");

    const existing = body.parentElement.querySelectorAll(".ad-slot-article");
    existing.forEach(function (item) {
      if (item !== ad) item.remove();
    });

    const children = Array.from(body.children);
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

  // Works both for static article pages and article.html where the news body
  // is rendered asynchronously by script.js.
  function start() {
    init();
    let tries = 0;
    const timer = setInterval(function () {
      init();
      tries++;
      if (tries >= 20 || document.querySelector(".ad-slot-article")) {
        clearInterval(timer);
      }
    }, 250);

    const observer = new MutationObserver(function () {
      init();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 6000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();