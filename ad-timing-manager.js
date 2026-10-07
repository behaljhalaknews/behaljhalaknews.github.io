/* बहल झलक — Direct Advertisement timing control */
(function(){
  "use strict";
  var DEFAULT_SECONDS=30;
  function clamp(v){
    v=Number(v);
    if(!isFinite(v)) return DEFAULT_SECONDS;
    return Math.max(10,Math.min(300,Math.round(v)));
  }
  function getDraft(){
    try{return Array.isArray(directAdsDraft)?directAdsDraft:null;}catch(e){return null;}
  }
  function addControl(){
    if(document.getElementById("adSliderSeconds")) return;
    var active=document.getElementById("adActive");
    if(!active) return;
    var parent=active.closest(".check");
    if(!parent||!parent.parentNode) return;
    var box=document.createElement("div");
    box.style.margin="10px 0";
    box.innerHTML='<label><strong>🔄 TOP विज्ञापन कितने सेकंड में बदलें?</strong></label>'+
      '<select id="adSliderSeconds">'+
      '<option value="10">10 सेकंड</option>'+
      '<option value="15">15 सेकंड</option>'+
      '<option value="30" selected>30 सेकंड — Default</option>'+
      '<option value="45">45 सेकंड</option>'+
      '<option value="60">60 सेकंड</option>'+
      '<option value="90">90 सेकंड</option>'+
      '<option value="120">120 सेकंड</option>'+
      '</select>'+
      '<p class="help">एक से अधिक TOP विज्ञापन होने पर वे इसी समय के अनुसार अपने-आप बदलेंगे।</p>';
    parent.parentNode.insertBefore(box,parent);
    var draft=getDraft();
    if(draft&&draft.length&&draft[0].sliderSeconds) document.getElementById("adSliderSeconds").value=String(clamp(draft[0].sliderSeconds));
  }
  function applyTiming(){
    var sel=document.getElementById("adSliderSeconds");
    var draft=getDraft();
    if(!sel||!draft) return;
    var seconds=clamp(sel.value);
    draft.forEach(function(a){a.sliderSeconds=seconds;});
    try{latestAdsPackage=JSON.stringify(draft,null,2);}catch(e){}
  }
  function hook(){
    addControl();
    var save=document.getElementById("adSaveBtn");
    if(save) save.addEventListener("click",function(){setTimeout(function(){applyTiming();},0);});
    var workflow=document.getElementById("adOpenWorkflowBtn");
    if(workflow) workflow.addEventListener("click",function(){applyTiming();},true);
    var sel=document.getElementById("adSliderSeconds");
    if(sel) sel.addEventListener("change",applyTiming);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",hook,{once:true});
  else hook();
})();
