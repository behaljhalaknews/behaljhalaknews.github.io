(function () {
  "use strict";

  function createAdSlot() {
    const ad = document.createElement("div");
    ad.className = "ad-slot ad-slot-article ad-slot-animated";
    ad.setAttribute("aria-label", "विज्ञापन");
    ad.innerHTML = '<span>ADVERTISEMENT</span>';
    return ad;
  }

  function placeMidArticleAd() {
    const body = document.querySelector(".article-body");
    if (!body) return;

    let ad = document.querySelector(".ad-slot-article");
    if (!ad) ad = createAdSlot();

    ad.classList.add("ad-slot-animated");

    // Keep one mid-article slot only.
    const existing = body.parentElement ? body.parentElement.querySelectorAll(".ad-slot-article") : [];
    existing.forEach(function (item) {
      if (item !== ad) item.remove();
    });

    const children = Array.from(body.children);
    if (!children.length) {
      body.parentNode.insertBefore(ad, body);
      return;
    }

    const middleIndex = Math.max(1, Math.ceil(children.length / 2));
    body.insertBefore(ad, children[middleIndex] || null);
  }

  function ensurePermanentBottomAd() {
    const article = document.querySelector(".article-card");
    if (!article) return;

    if (!article.querySelector(".ad-slot-article-end")) {
      const ad = document.createElement("div");
      ad.className = "ad-slot ad-slot-article-end";
      ad.setAttribute("aria-label", "विज्ञापन");
      ad.innerHTML = "<span>ADVERTISEMENT</span>";
      article.appendChild(ad);
    }
  }

  function init() {
    placeMidArticleAd();
    ensurePermanentBottomAd();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();