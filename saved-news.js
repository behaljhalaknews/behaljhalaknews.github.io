/* बहल झलक — local saved-news feature; stores only on this browser */
(function () {
  "use strict";
  var KEY = "bj_saved_news_v1";
  function readSaved() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? value.filter(function (item) { return item && item.url && item.title; }) : [];
    } catch (e) { return []; }
  }
  function writeSaved(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); return true; }
    catch (e) { alert("खबर सेव नहीं हो सकी। कृपया ब्राउज़र की स्टोरेज सेटिंग जाँचें।"); return false; }
  }
  function cleanUrl(value) {
    try {
      var u = new URL(value || "./", window.location.href);
      return u.origin === window.location.origin ? u.pathname + u.search + u.hash : "";
    } catch (e) { return ""; }
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[c];
    });
  }
  function updateButtons() {
    var saved = readSaved();
    document.querySelectorAll("[data-save-news='1']").forEach(function (button) {
      var url = cleanUrl(button.getAttribute("data-url"));
      var exists = saved.some(function (item) { return cleanUrl(item.url) === url; });
      button.classList.toggle("is-saved", exists);
      button.setAttribute("aria-pressed", exists ? "true" : "false");
      button.textContent = exists ? "✓ सेव हो गई" : "🔖 खबर सेव करें";
    });
  }
  function renderList() {
    var root = document.getElementById("bjSavedNewsList");
    if (!root) return;
    var saved = readSaved();
    if (!saved.length) {
      root.innerHTML = '<div class="bj-saved-news-empty"><strong>अभी कोई खबर सेव नहीं है।</strong><p>मुख्य पृष्ठ पर किसी खबर के नीचे “🔖 खबर सेव करें” दबाएँ।</p><a href="./index.html">← खबरों पर वापस जाएँ</a></div>';
      return;
    }
    root.innerHTML = saved.map(function (item) {
      var url = cleanUrl(item.url);
      if (!url) return "";
      var image = item.image ? '<img src="' + escapeHtml(item.image) + '" alt="" loading="lazy">' : '<div aria-hidden="true"></div>';
      var date = item.savedAt ? '<p class="bj-saved-news-date">सेव की गई: ' + escapeHtml(item.savedAt) + '</p>' : "";
      return '<article class="bj-saved-news-item">' + image + '<div><h2><a href="' + escapeHtml(url) + '">' + escapeHtml(item.title) + '</a></h2>' + date + '<div class="bj-saved-news-item-actions"><a href="' + escapeHtml(url) + '">खबर पढ़ें</a><button type="button" class="bj-saved-news-remove" data-remove-saved="' + escapeHtml(url) + '">हटाएँ</button></div></div></article>';
    }).join("");
  }
  document.addEventListener("click", function (event) {
    var button = event.target.closest ? event.target.closest("[data-save-news='1']") : null;
    if (button) {
      event.preventDefault();
      var url = cleanUrl(button.getAttribute("data-url"));
      var title = button.getAttribute("data-title") || "बहल झलक खबर";
      var image = button.getAttribute("data-image") || "";
      if (!url) { alert("इस खबर का लिंक सेव नहीं हो सका।"); return; }
      var saved = readSaved();
      var index = saved.findIndex(function (item) { return cleanUrl(item.url) === url; });
      if (index >= 0) saved.splice(index, 1);
      else saved.unshift({ url: url, title: title, image: image, savedAt: new Date().toLocaleDateString("hi-IN") });
      if (writeSaved(saved)) { updateButtons(); renderList(); }
      return;
    }
    var remove = event.target.closest ? event.target.closest("[data-remove-saved]") : null;
    if (remove) {
      var targetUrl = cleanUrl(remove.getAttribute("data-remove-saved"));
      var remaining = readSaved().filter(function (item) { return cleanUrl(item.url) !== targetUrl; });
      if (writeSaved(remaining)) { renderList(); updateButtons(); }
    }
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { updateButtons(); renderList(); });
  else { updateButtons(); renderList(); }
  if (window.MutationObserver && document.body) {
    new MutationObserver(function () { updateButtons(); }).observe(document.body, { childList: true, subtree: true });
  }
})();
