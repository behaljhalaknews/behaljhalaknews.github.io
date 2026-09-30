/* बहल झलक — dynamic article photos
   Admin में फोटो बदलने पर public article page भी Supabase से नई फोटो पढ़ेगा। */
(function(){
  if(!window.BAHAL_SUPABASE_URL||!window.BAHAL_SUPABASE_PUBLISHABLE_KEY||!window.supabase)return;
  const articleId=location.pathname.split("/").pop().replace(/\.html$/,"");
  if(!articleId)return;
  const boot=async()=>{
    try{
      const sb=window.supabase.createClient(window.BAHAL_SUPABASE_URL,window.BAHAL_SUPABASE_PUBLISHABLE_KEY);
      const r=await sb.from("article_images").select("image_url").eq("article_id",articleId).maybeSingle();
      if(r.error||!r.data||!r.data.image_url)return;
      let images=[];
      try{const x=JSON.parse(r.data.image_url);images=Array.isArray(x)?x.filter(Boolean):[];}catch(e){images=[r.data.image_url].filter(Boolean);}
      if(!images.length)return;
      const body=document.querySelector(".article-body"); if(!body)return;
      const box=document.createElement("div"); box.id="dynamic-article-photos";
      box.style.cssText="margin:0 0 22px;padding:10px 0;";
      images.forEach((url,i)=>{
        const img=document.createElement("img");
        img.src=url+(url.includes("?")?"&":"?")+"v="+Date.now();
        img.alt="खबर की फोटो "+(i+1); img.loading=i===0?"eager":"lazy"; img.decoding="async";
        img.style.cssText="display:block;width:100%;height:auto;max-height:620px;object-fit:contain;border-radius:10px;background:#f2f4f7;margin:0 auto 14px;";
        box.appendChild(img);
      });
      body.parentNode.insertBefore(box,body);
    }catch(e){console.warn("Dynamic article photo:",e);}
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();