/* बहल झलक — public live player */
(function(){
  "use strict";
  var section=document.getElementById("bjLiveSection");
  var player=document.getElementById("bjLivePlayer");
  var title=document.getElementById("bjLiveTitle");
  var subtitle=document.getElementById("bjLiveSubtitle");
  var badge=document.getElementById("bjLiveBadge");
  if(!section||!player||!title||!subtitle||!badge)return;
  function safeText(value){return String(value||"").replace(/[&<>"']/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
  function render(config){
    var isLive=config&&config.isLive===true;
    var id=String(config&&config.videoId||"").trim();
    var heading=String(config&&config.title||"बहल झलक LIVE").trim()||"बहल झलक LIVE";
    title.textContent=heading;
    if(isLive&&/^[A-Za-z0-9_-]{6,20}$/.test(id)){
      badge.style.display="inline-flex";
      subtitle.textContent="बहल झलक का सीधा प्रसारण — वीडियो चलाने के लिए Play दबाएँ।";
      player.innerHTML='<div class="bj-live-frame"><iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?rel=0" title="'+safeText(heading)+'" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';
    }else{
      badge.style.display="none";
      subtitle.textContent="अभी कोई लाइव प्रसारण चालू नहीं है। लाइव शुरू होने पर वीडियो इसी जगह दिखाई देगा।";
      player.innerHTML='<div class="bj-live-off">🔴 <strong>बहल झलक LIVE अभी बंद है</strong><br>अगले सीधे प्रसारण के लिए वेबसाइट पर फिर आएँ।</div>';
    }
  }
  fetch("./live-data.json?t="+Date.now(),{cache:"no-store"})
    .then(function(response){if(!response.ok)throw new Error("Live config unavailable");return response.json();})
    .then(render)
    .catch(function(){render({isLive:false,title:"बहल झलक LIVE"});});
})();
