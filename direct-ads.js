/* बहल झलक — Direct Advertisement Renderer */
(function(){
  "use strict";
  var ads=Array.isArray(window.BAHAL_DIRECT_ADS)?window.BAHAL_DIRECT_ADS:[];
  var now=new Date();
  function active(a){
    if(!a||a.active!==true)return false;
    var s=a.startAt?new Date(a.startAt):null,e=a.endAt?new Date(a.endAt):null;
    if(s&&isNaN(s.getTime()))return false;
    if(e&&isNaN(e.getTime()))return false;
    if(s&&now<s)return false;
    if(e&&now>e)return false;
    return !!a.imageUrl;
  }
  function articleId(){
    var p=location.pathname.split("/").pop()||"";
    return p.replace(/\.html$/,"");
  }
  function eligible(a,kind,id){
    if(!active(a))return false;
    if(kind==="top")return a.placement==="TOP";
    if(kind==="article"){
      if(a.placement==="ALL_NEWS")return true;
      if(a.placement==="SELECTED_NEWS")return Array.isArray(a.selectedArticleIds)&&a.selectedArticleIds.indexOf(id)>=0;
    }
    return false;
  }
  function make(a){
    var wrap=document.createElement("div");
    wrap.className="direct-ad direct-ad-"+String(a.displayType||"STATIC").toLowerCase();
    wrap.setAttribute("data-ad-id",a.id||"");
    wrap.setAttribute("aria-label","विज्ञापन");
    var label=document.createElement("div");
    label.className="direct-ad-label";
    label.textContent="विज्ञापन";
    var img=document.createElement("img");
    img.src=a.imageUrl;
    img.alt=a.name||"विज्ञापन";
    img.loading="lazy";
    var content=a.clickUrl?document.createElement("a"):document.createElement("div");
    if(a.clickUrl){
      content.href=a.clickUrl;
      content.target="_blank";
      content.rel="sponsored noopener";
    }
    content.className="direct-ad-link";
    content.appendChild(img);
    wrap.appendChild(label);
    wrap.appendChild(content);
    return wrap;
  }
  function render(selector,kind,id){
    var host=document.querySelector(selector);
    if(!host)return;
    var list=ads.filter(function(a){return eligible(a,kind,id);});
    host.innerHTML="";
    if(!list.length){host.style.display="none";return;}
    host.style.display="";
    list.forEach(function(a){host.appendChild(make(a));});
  }
  function init(){
    render(".ad-slot-header","top","");
    var id=articleId();
    if(document.body.classList.contains("direct-ad-article")||document.querySelector(".article-page")){
      var mid=document.querySelector(".ad-slot-article");
      var end=document.querySelector(".ad-slot-article-end");
      if(mid)renderInto(mid,"article",id);
      if(end)renderInto(end,"article",id);
    }
  }
  function renderInto(host,kind,id){
    var list=ads.filter(function(a){return eligible(a,kind,id);});
    host.innerHTML="";
    if(!list.length){host.style.display="none";return;}
    host.style.display="";
    list.forEach(function(a){host.appendChild(make(a));});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
