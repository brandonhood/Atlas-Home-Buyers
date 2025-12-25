(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Smooth scroll for anchor links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Hero CTA: copy address into form + scroll to form
  (function heroAddressFlow(){
    const heroInput = $('#heroAddress');
    const heroBtn = $('#heroCtaBtn');
    const formAddress = $('#address');
    const formWrap = $('#form');

    if (!heroBtn || !heroInput || !formAddress || !formWrap) return;

    function goToForm(){
      const val = (heroInput.value || '').trim();
      if (val) formAddress.value = val;
      formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const name = $('#name');
        if (name) name.focus({ preventScroll:true });
      }, 350);
    }

    heroBtn.addEventListener('click', goToForm);
    heroInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        goToForm();
      }
    });
  })();

  // Capture UTM + GCLID params into hidden inputs if present
  (function captureAttribution(){
    const params = new URLSearchParams(window.location.search);
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","gbraid","wbraid"];
    keys.forEach(k => {
      const v = params.get(k);
      if (!v) return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = v;
      const form = $('form[data-lead-form]');
      if (form) form.appendChild(input);
    });
  })();

  // Demo submit handler (replace with GHL endpoint/webhook)
  (function handleSubmit(){
    const form = $('form[data-lead-form]');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      // If you wire a real action URL, remove this block.
      if (form.getAttribute('data-demo') === 'true') {
        e.preventDefault();
        window.location.href = '/thank-you.html';
      }
    });
  })();
})();


(() => {
  const track = document.getElementById("tTrack");
  const dotsWrap = document.getElementById("tDots");
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll(".t-card"));
  const prevBtn = document.querySelector(".t-prev");
  const nextBtn = document.querySelector(".t-next");

  const getStep = () => {
    const card = cards[0];
    if (!card) return 0;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "14") || 14;
    return card.getBoundingClientRect().width + gap;
  };

  const pageSize = () => (window.matchMedia("(min-width: 900px)").matches ? 3 : 1);

  const scrollByCards = (dir = 1) => {
    const step = getStep();
    const move = step * pageSize() * dir;
    track.scrollBy({ left: move, behavior: "smooth" });
  };

  // Dots
  const dotCount = Math.max(1, Math.ceil(cards.length / pageSize()));
  dotsWrap.innerHTML = "";
  const dots = Array.from({ length: dotCount }).map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "t-dot";
    b.setAttribute("aria-label", `Go to testimonials ${i + 1}`);
    b.addEventListener("click", () => {
      const step = getStep();
      track.scrollTo({ left: step * pageSize() * i, behavior: "smooth" });
    });
    dotsWrap.appendChild(b);
    return b;
  });

  const setActiveDot = () => {
    const step = getStep() || 1;
    const idx = Math.round(track.scrollLeft / (step * pageSize()));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === Math.max(0, Math.min(idx, dots.length - 1))));
  };

  prevBtn && prevBtn.addEventListener("click", () => scrollByCards(-1));
  nextBtn && nextBtn.addEventListener("click", () => scrollByCards(1));

  track.addEventListener("scroll", () => window.requestAnimationFrame(setActiveDot));
  window.addEventListener("resize", () => {
    // Rebuild dots on breakpoint change
    const newCount = Math.max(1, Math.ceil(cards.length / pageSize()));
    if (newCount !== dots.length) location.reload(); // simple + safe for now
  });

  // Keyboard support
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") scrollByCards(1);
    if (e.key === "ArrowLeft") scrollByCards(-1);
  });

  setActiveDot();
})();
