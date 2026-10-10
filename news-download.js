/* Bahal Jhalak — photo-inclusive news download.
   Used by the homepage download box and each published article page.
   Does not change ad slots, publishing workflows, or Admin Manager. */
(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function absoluteUrl(src) {
    try { return new URL(src, window.location.href).href; } catch (_) { return ""; }
  }

  function safeFilePart(value) {
    return String(value || "bahal-jhalak-news")
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "bahal-jhalak-news";
  }

  async function imageAsDataUrl(src) {
    if (!src) return "";
    try {
      const response = await fetch(absoluteUrl(src), { mode: "cors", cache: "force-cache" });
      if (!response.ok) throw new Error("image unavailable");
      const blob = await response.blob();
      if (!/^image\//i.test(blob.type)) throw new Error("not an image");
      return await new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(String(reader.result || "")); };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (_) {
      // Keep the public image URL as a fallback if the host disallows embedding.
      return absoluteUrl(src);
    }
  }

  function makeDocument(title, category, date, location, bodyHtml, imageUrls, canonicalUrl) {
    return (async function () {
      const images = [];
      for (const src of imageUrls.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)) {
        images.push(await imageAsDataUrl(src));
      }
      const photoMarkup = images.map(function (src, i) {
        return '<img class="news-photo" src="' + esc(src) + '" alt="' + esc(title) + ' — फोटो ' + (i + 1) + '">';
      }).join("");
      const html = '<!doctype html><html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
        esc(title) + ' | बहल झलक</title><style>body{font-family:Arial,"Noto Sans Devanagari",sans-serif;max-width:850px;margin:0 auto;padding:18px;color:#172033;line-height:1.8}header{border-bottom:4px solid #c62828;padding-bottom:12px;margin-bottom:18px}.brand{font-weight:900;color:#c62828;font-size:20px}h1{font-size:25px;line-height:1.45;margin:12px 0} .meta{font-size:13px;color:#596579}.news-photo{display:block;width:100%;height:auto;max-height:none;object-fit:contain;margin:14px auto;border-radius:8px}article{font-size:17px}a{color:#b71c1c;overflow-wrap:anywhere}.credit{border-top:1px solid #ddd;margin-top:24px;padding-top:10px;font-size:12px;color:#64748b}@media(max-width:600px){body{padding:12px}h1{font-size:21px}article{font-size:16px}}</style></head><body><header><div class="brand">बहल झलक <span style="font-size:11px;color:#64748b">LIVE NEWS</span></div><h1>' +
        esc(title) + '</h1><div class="meta">' + esc(category || "समाचार") + ' · ' + esc(location || "बहल झलक") + ' · ' + esc(date || "") + '</div></header>' +
        photoMarkup + '<article>' + bodyHtml + '</article><div class="credit">स्रोत: बहल झलक · खबर आपकी, नज़र हमारी<br>मूल खबर: <a href="' + esc(canonicalUrl || window.location.href) + '">' + esc(canonicalUrl || window.location.href) + '</a></div></body></html>';
      const blob = new Blob(["\ufeff", html], { type: "text/html;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = safeFilePart(title) + "-bahal-jhalak.html";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 1500);
    })();
  }

  function downloadDataNews(item) {
    if (!item) return;
    const paragraphs = Array.isArray(item.content) ? item.content : [item.content || item.excerpt || ""];
    const body = paragraphs.filter(Boolean).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    const imageUrls = [];
    if (item.image) imageUrls.push(item.image);
    if (Array.isArray(item.images)) imageUrls.push.apply(imageUrls, item.images);
    if (!imageUrls.length && item.videoUrl) imageUrls.push("./images/behal-jhalak-logo.svg");
    return makeDocument(item.title || "बहल झलक खबर", item.category, item.date, item.location, body, imageUrls, absoluteUrl(item.page || ("./article.html?id=" + encodeURIComponent(item.id || ""))));
  }

  function articlePageDownload() {
    const actions = document.querySelector(".article-actions");
    const heading = document.querySelector(".article-header h1, #article-title");
    if (!actions || !heading || actions.querySelector("[data-bj-download-article]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bj-news-download-button";
    button.setAttribute("data-bj-download-article", "1");
    button.textContent = "⬇️ फोटो सहित न्यूज़ डाउनलोड करें";
    button.addEventListener("click", async function () {
      const oldText = button.textContent;
      button.disabled = true;
      button.textContent = "डाउनलोड तैयार हो रहा है…";
      try {
        const title = (heading.textContent || document.title).trim();
        const category = document.querySelector(".article-header .category-tag, #article-category")?.textContent?.trim() || "समाचार";
        const date = document.querySelector(".article-meta")?.innerText?.replace(/\s*•\s*/g, " · ").trim() || "";
        const bodyEl = document.querySelector(".article-body");
        const clone = bodyEl ? bodyEl.cloneNode(true) : document.createElement("div");
        clone.querySelectorAll(".ad-slot, script, style, .bj-news-download-button").forEach(function (el) { el.remove(); });
        const imageUrls = Array.from(document.querySelectorAll(".article-gallery img, .article-card > .article-image, #article-image"))
          .filter(function (img) { return img.getAttribute("src") && img.style.display !== "none"; })
          .map(function (img) { return img.getAttribute("src"); });
        const location = document.querySelector(".article-meta span")?.textContent?.trim() || "बहल झलक";
        await makeDocument(title, category, date, location, clone.innerHTML || "<p>पूरी खबर बहल झलक वेबसाइट पर पढ़ें।</p>", imageUrls, window.location.href);
      } catch (error) {
        alert("न्यूज़ डाउनलोड नहीं हो पाया। कृपया दोबारा कोशिश करें।");
      } finally {
        button.disabled = false;
        button.textContent = oldText;
      }
    });
    actions.appendChild(button);
  }

  function initHomepageBox() {
    const box = document.getElementById("bjNewsDownloadBox");
    const select = document.getElementById("bjNewsDownloadSelect");
    const button = document.getElementById("bjNewsDownloadButton");
    const status = document.getElementById("bjNewsDownloadStatus");
    const list = Array.isArray(window.BAHAL_JHALAK_NEWS) ? window.BAHAL_JHALAK_NEWS : [];
    if (!box || !select || !button || !list.length || box.dataset.ready === "1") return;
    box.dataset.ready = "1";
    select.innerHTML = '<option value="">खबर चुनें…</option>' + list.map(function (item, index) {
      return '<option value="' + index + '">' + esc(item.title || "समाचार") + '</option>';
    }).join("");
    button.addEventListener("click", async function () {
      const item = list[Number(select.value)];
      if (!item) {
        if (status) status.textContent = "पहले सूची में से खबर चुनें।";
        select.focus();
        return;
      }
      button.disabled = true;
      button.textContent = "डाउनलोड तैयार हो रहा है…";
      if (status) status.textContent = "खबर और फोटो तैयार की जा रही है।";
      try {
        await downloadDataNews(item);
        if (status) status.textContent = "खबर डाउनलोड हो गई। फ़ाइल खोलने के लिए अपने डाउनलोड फ़ोल्डर में जाएँ।";
      } catch (_) {
        if (status) status.textContent = "डाउनलोड नहीं हो पाया। कृपया दोबारा कोशिश करें।";
      } finally {
        button.disabled = false;
        button.textContent = "⬇️ फोटो सहित न्यूज़ डाउनलोड करें";
      }
    });
  }

  function ensureStyles() {
    if (document.getElementById("bj-news-download-styles")) return;
    const style = document.createElement("style");
    style.id = "bj-news-download-styles";
    style.textContent = `
      .bj-news-download-box{box-sizing:border-box;margin:12px auto 18px;padding:14px;width:100%;border:1px solid #f0b8b8;border-top:4px solid #c62828;border-radius:10px;background:#fff;box-shadow:0 3px 12px rgba(11,37,69,.07);color:#172033}
      .bj-news-download-heading{display:flex;align-items:center;gap:10px;margin-bottom:12px}
      .bj-news-download-icon{display:flex;align-items:center;justify-content:center;width:42px;height:42px;flex:0 0 42px;border-radius:9px;background:#fff0f0;font-size:23px}
      .bj-news-download-heading strong{display:block;font-size:17px;font-weight:900;color:#0b2545;line-height:1.35}
      .bj-news-download-heading small{display:block;margin-top:3px;font-size:12px;color:#64748b;line-height:1.45}
      .bj-news-download-label{display:block;margin:0 0 5px;font-size:12px;font-weight:800;color:#334155}
      #bjNewsDownloadSelect{display:block;width:100%;min-width:0;box-sizing:border-box;margin:0 0 9px;padding:10px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;color:#172033;font:inherit;font-size:13px}
      .bj-news-download-button{display:inline-flex;align-items:center;justify-content:center;gap:6px;max-width:100%;box-sizing:border-box;padding:10px 13px;border:0;border-radius:7px;background:#c62828;color:#fff;font-size:13px;font-weight:850;line-height:1.4;cursor:pointer}
      .bj-news-download-button:disabled{opacity:.65;cursor:wait}
      .bj-news-download-status{min-height:0;margin:7px 0 0;color:#64748b;font-size:11px;line-height:1.5}
      .article-actions .bj-news-download-button{margin:5px 0}
      @media(max-width:600px){.bj-news-download-box{padding:11px;margin:10px auto 15px}.bj-news-download-heading strong{font-size:16px}.bj-news-download-button{width:100%;font-size:12px}.article-actions .bj-news-download-button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    ensureStyles();
    initHomepageBox();
    articlePageDownload();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
  // Expose a small API for future safe reuse, without altering the News Manager.
  window.BAHAL_JHALAK_DOWNLOAD_NEWS = downloadDataNews;
})();