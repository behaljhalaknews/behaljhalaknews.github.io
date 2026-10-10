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
    s.src="./ads-data.js?v=20261010-mid-ad-fix-01";
    s.onload=function(){
      var d=document.createElement("script");
      d.src="./direct-ads.js?v=20261010-mid-ad-fix-02";
      document.body.appendChild(d);
    };
    document.head.appendChild(s);
  }

  function ensureCompactShare() {
    const actions = document.querySelector(".article-actions");
    if (!actions) return;
    let panel = document.querySelector(".social-share-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "social-share-panel";
      panel.innerHTML = '<div class="social-share-title">सोशल मीडिया पर शेयर करें</div><div class="social-share-buttons"><a class="social-share-btn facebook-share" target="_blank" rel="noopener noreferrer">Facebook</a><a class="social-share-btn whatsapp-share" target="_blank" rel="noopener noreferrer">WhatsApp</a></div>';
      actions.insertAdjacentElement("afterend", panel);
    }
    if (panel.dataset.bjCompactReady === "1") return;

    let shareButton = actions.querySelector(".share-button");
    if (!shareButton) {
      shareButton = document.createElement("button");
      shareButton.type = "button";
      shareButton.className = "share-button";
      actions.appendChild(shareButton);
    }
    shareButton.removeAttribute("onclick");
    shareButton.textContent = "↗ शेयर करें";
    shareButton.setAttribute("aria-expanded", "false");
    shareButton.setAttribute("aria-controls", "bj-article-share-options");
    panel.id = "bj-article-share-options";
    panel.hidden = true;
    if (!document.getElementById("bj-compact-share-styles")) {
      const style = document.createElement("style");
      style.id = "bj-compact-share-styles";
      style.textContent = ".article-actions .share-button{display:inline-flex!important;align-items:center;justify-content:center;width:auto!important;min-width:0!important;padding:5px 9px!important;margin:5px 0!important;border:0!important;border-radius:5px!important;font-size:12px!important;line-height:1.25!important;font-weight:700!important;cursor:pointer;box-shadow:none!important}.bj-compact-share-panel[hidden]{display:none!important}.bj-compact-share-panel{margin:5px 0 10px!important;padding:8px!important;border:1px solid #e2e6ea!important;border-radius:8px!important;background:#fff!important}.bj-compact-share-panel .social-share-buttons{display:flex!important;flex-wrap:wrap!important;gap:7px!important}.bj-compact-share-panel .social-share-btn{display:inline-flex!important;align-items:center;justify-content:center;min-height:30px;padding:6px 10px!important;border:0;border-radius:6px;color:#fff!important;font-size:12px;font-weight:700;text-decoration:none;cursor:pointer}.bj-compact-share-panel .instagram-share{background:#c13584!important}.bj-compact-share-panel .copy-share{background:#0b2545!important}@media(max-width:768px){.article-actions .share-button{padding:5px 8px!important;font-size:11px!important}.bj-compact-share-panel .social-share-buttons{grid-template-columns:none!important}.bj-compact-share-panel .social-share-btn{font-size:11px;padding:6px 8px!important}}";
      document.head.appendChild(style);
    }
    panel.classList.add("bj-compact-share-panel");
    panel.querySelector(".social-share-title")?.remove();

    const buttons = panel.querySelector(".social-share-buttons") || panel;
    const oldNative = buttons.querySelector("#native-share");
    if (oldNative) oldNative.remove();

    const articleUrl = window.location.href;
    const articleTitle = document.querySelector("h1")?.textContent?.trim() || document.title;
    const whatsapp = buttons.querySelector(".whatsapp-share");
    const facebook = buttons.querySelector(".facebook-share");
    if (whatsapp) {
      whatsapp.href = "https://api.whatsapp.com/send?text=" + encodeURIComponent(articleTitle + " — " + articleUrl);
      whatsapp.textContent = "WhatsApp";
      whatsapp.setAttribute("aria-label", "WhatsApp पर खबर शेयर करें");
    }
    if (facebook) {
      facebook.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(articleUrl);
      facebook.textContent = "Facebook";
      facebook.setAttribute("aria-label", "Facebook पर खबर शेयर करें");
    }

    if (!buttons.querySelector(".instagram-share")) {
      const instagram = document.createElement("a");
      instagram.className = "social-share-btn instagram-share";
      instagram.href = "https://www.instagram.com/";
      instagram.target = "_blank";
      instagram.rel = "noopener noreferrer";
      instagram.textContent = "Instagram";
      instagram.setAttribute("aria-label", "Instagram खोलें; खबर का लिंक पहले कॉपी होगा");
      instagram.addEventListener("click", function () {
        copyCurrentArticleLink();
      });
      buttons.appendChild(instagram);
    }
    if (!buttons.querySelector(".copy-share")) {
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "social-share-btn copy-share";
      copy.textContent = "कॉपी लिंक";
      copy.addEventListener("click", async function () {
        const old = copy.textContent;
        try {
          await navigator.clipboard.writeText(window.location.href);
          copy.textContent = "✓ लिंक कॉपी";
        } catch (e) {
          window.prompt("इस खबर का लिंक कॉपी करें:", window.location.href);
        }
        window.setTimeout(function () { copy.textContent = old; }, 1800);
      });
      buttons.appendChild(copy);
    }

    function copyCurrentArticleLink() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).catch(function () {});
      }
    }

    shareButton.addEventListener("click", function () {
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      shareButton.setAttribute("aria-expanded", String(!isOpen));
    });
    panel.dataset.bjCompactReady = "1";
  }

  function loadNewsDownload() {
    if (window.__bahalJhalakNewsDownloadLoading || window.BAHAL_JHALAK_DOWNLOAD_NEWS) return;
    window.__bahalJhalakNewsDownloadLoading = true;
    const script = document.createElement("script");
    script.src = "./news-download.js?v=20261010-download-01";
    script.onload = function () { window.__bahalJhalakNewsDownloadLoading = false; };
    script.onerror = function () { window.__bahalJhalakNewsDownloadLoading = false; };
    document.body.appendChild(script);
  }

  function init() {
    // Download support is independent of ad rendering; failures do not affect ads.
    try { loadNewsDownload(); } catch (e) { console.error("News download setup failed:", e); }
    // Sharing must work even if any advertising helper fails.
    try { ensureCompactShare(); } catch (e) { console.error("Bahal Jhalak share setup failed:", e); }
    try { loadDirectAdData(); } catch (e) { console.error("Direct ad data failed:", e); }
    try { placeMidArticleAd(); } catch (e) { console.error("Mid-article ad setup failed:", e); }
    try { ensurePermanentBottomAd(); } catch (e) { console.error("Bottom ad setup failed:", e); }
  }

  function start() {
    try { ensureAnalytics(); } catch (e) { console.error("Analytics setup failed:", e); }
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