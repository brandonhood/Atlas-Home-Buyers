(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const params = new URLSearchParams(location.search);

  // Capture UTM + click IDs
  const trackKeys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","gbraid","wbraid"];
  const track = {};
  trackKeys.forEach(k => { if(params.get(k)) track[k] = params.get(k); });
  if(Object.keys(track).length){
    sessionStorage.setItem("atlas_track", JSON.stringify(track));
  }

  const marketKey = document.body.getAttribute("data-market") || "duval-jacksonville";
  const configPath = document.body.getAttribute("data-config") || "./config/markets.json";

  fetch(configPath).then(r => r.json()).then(cfg => {
    const m = cfg[marketKey] || cfg["duval-jacksonville"];
    $$("[data-bind='marketName']").forEach(el => el.textContent = m.marketName);
    $$("[data-bind='h1']").forEach(el => el.textContent = m.h1);
    $$("[data-bind='subhead']").forEach(el => el.textContent = m.subhead);
    $$("[data-bind='areas']").forEach(el => el.textContent = m.areas);
    $$("[data-bind='phone']").forEach(el => el.textContent = m.phone);
    $$("[data-bind='ctaPrimary']").forEach(el => el.textContent = m.ctaPrimary);

    const tWrap = $("#testimonials");
    if(tWrap && m.testimonials && m.testimonials.length){
      tWrap.innerHTML = m.testimonials.slice(0,3).map(t => `
        <div class="card quote">
          <p>“${escapeHtml(t.text)}”</p>
          <div class="who">${escapeHtml(t.name)} <span style="color:#6b7280;font-weight:700;">• ${escapeHtml(t.location)}</span></div>
        </div>
      `).join("");
    }
  }).catch(()=>{});

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  // 2-step form logic
  const step1 = $("#step1");
  const step2 = $("#step2");
  const nextBtn = $("#toStep2");
  const backBtn = $("#backTo1");
  const addrInput = $("#propertyAddress");
  const addr2Input = $("#propertyAddress2");
  const finalForm = $("#leadForm");
  const hiddenTrack = $("#trackingJson");

  function hydrateTracking(){
    const t = sessionStorage.getItem("atlas_track");
    if(t && hiddenTrack) hiddenTrack.value = t;
  }
  hydrateTracking();

  function goStep2(){
    const addr = (addrInput?.value || "").trim();
    if(!addr){
      addrInput?.focus();
      addrInput?.setAttribute("aria-invalid","true");
      return;
    }
    addrInput?.removeAttribute("aria-invalid");
    if(addr2Input) addr2Input.value = addr;
    if(step1) step1.style.display = "none";
    if(step2) step2.style.display = "block";
    $("#fullName")?.focus();
  }

  nextBtn?.addEventListener("click", (e)=>{ e.preventDefault(); goStep2(); });
  addrInput?.addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ e.preventDefault(); goStep2(); }});
  backBtn?.addEventListener("click",(e)=>{
    e.preventDefault();
    if(step2) step2.style.display="none";
    if(step1) step1.style.display="block";
    addrInput?.focus();
  });

  // Submit (demo): redirect to thank you. Replace with your webhook.
  finalForm?.addEventListener("submit",(e)=>{
    e.preventDefault();
    hydrateTracking();
    const data = Object.fromEntries(new FormData(finalForm).entries());
    sessionStorage.setItem("atlas_last_lead", JSON.stringify(data));
    location.href = (finalForm.getAttribute("data-thankyou") || "./thank-you.html");
  });

  // Sticky CTA scroll to form
  $$("#stickyCta, #heroCta").forEach(btn => btn?.addEventListener("click",(e)=>{
    e.preventDefault();
    $("#form")?.scrollIntoView({behavior:"smooth", block:"start"});
    setTimeout(()=> addrInput?.focus(), 350);
  }));
})();
