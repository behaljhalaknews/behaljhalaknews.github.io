/* Bahal Jhalak — seamless auto-scrolling news thumbnail strip.
   Separate enhancement: does not replace news rendering, ad slots, or admin tools. */
(function () {
  "use strict";
  function init() {
    var anchor = document.querySelector(".ad-slot-header");
    var data = Array.isArray(window.BAHAL_JHALAK_NEWS) ? window.BAHAL_JHALAK_NEWS.slice() : [];
    if (!anchor || !data.length || document.getElementById("bj-news-thumbnail-strip")) return;

    var stories = data.map(function (item) {
      var page = item.page || (item.id ? "./" + item.id + ".html" : "./index.html");
      var image = item.image || "";
      if (!image) {
        var links = document.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
          if (links[i].getAttribute("href") === page) {
            var found = links[i].querySelector("img");
            if (found && found.getAttribute("src")) { image = found.getAttribute("src"); break; }
          }
        }
      }
      return { title: item.title || "बहल झलक की खबर", category: item.category || "समाचार", page: page, image: image };
    }).filter(function (item) { return !!item.image && !!item.page; }).slice(0, 24);

    if (stories.length < 2) return;
    var section = document.createElement("section");
    section.id = "bj-news-thumbnail-strip";
    section.className = "bj-news-thumbnail-strip";
    section.setAttribute("aria-label", "ताज़ा खबरों की चलती थंबनेल पट्टी");
    section.innerHTML = '<div class="bj-news-strip-heading"><span>ताज़ा खबरें</span><small>चलती खबरें</small></div><div class="bj-news-strip-viewport"><div class="bj-news-strip-track"></div></div>';
    var track = section.querySelector(".bj-news-strip-track");

    function addStory(item, duplicate) {
      var card = document.createElement("a");
      card.className = "bj-news-strip-card" + (duplicate ? " bj-news-strip-copy" : "");
      card.href = item.page;
      card.setAttribute("aria-label", item.title);
      if (duplicate) card.setAttribute("aria-hidden", "true");
      var img = document.createElement("img");
      img.src = item.image;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      var text = document.createElement("span");
      var cat = document.createElement("small");
      cat.textContent = item.category;
      var title = document.createElement("strong");
      title.textContent = item.title;
      text.appendChild(cat); text.appendChild(title);
      card.appendChild(img); card.appendChild(text); track.appendChild(card);
    }
    stories.forEach(function (item) { addStory(item, false); });
    stories.forEach(function (item) { addStory(item, true); });

    var viewport = section.querySelector(".bj-news-strip-viewport");
    viewport.addEventListener("mouseenter", function () { track.style.animationPlayState = "paused"; });
    viewport.addEventListener("mouseleave", function () { track.style.animationPlayState = "running"; });
    viewport.addEventListener("focusin", function () { track.style.animationPlayState = "paused"; });
    viewport.addEventListener("focusout", function () { track.style.animationPlayState = "running"; });
    anchor.insertAdjacentElement("afterend", section);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();