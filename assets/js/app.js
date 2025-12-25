(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Smooth scroll for anchor links
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Hero CTA: copy address into form + scroll to form
  (function heroAddressFlow() {
    const heroInput = $("#heroAddress");
    const heroBtn = $("#heroCtaBtn");
    const formAddress = $("#address");
    const formWrap = $("#form");
    if (!heroBtn || !heroInput || !formAddress || !formWrap) return;

    function goToForm() {
      const val = (heroInput.value || "").trim();
      if (val) formAddress.value = val;
      formWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const name = $("#name");
        if (name) name.focus({ preventScroll: true });
      }, 350);
    }

    heroBtn.addEventListener("click", goToForm);
    heroInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goToForm();
      }
    });
  })();

  // Capture UTM + GCLID params into hidden inputs if present
  (function captureAttribution() {
    const form = $('form[data-lead-form]');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","gbraid","wbraid"];

    keys.forEach((k) => {
      const v = params.get(k);
      if (!v) return;

      // prevent duplicates if script runs twice
      if (form.querySelector(`input[name="${k}"]`)) return;

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
  })();

  // Demo submit handler (replace with GHL endpoint/webhook)
  (function handleSubmit() {
    const form = $('form[data-lead-form]');
    if (!form) return;

    form.addEventListener("submit", (e) => {
      if (form.getAttribute("data-demo") === "true") {
        e.preventDefault();
        window.location.href = "/thank-you.html";
      }
    });
  })();

   // Testimonials carousel (dots + swipe/scroll, no arrows)
(function testimonialsCarousel() {
  const track = document.getElementById("tTrack");
  const dotsWrap = document.getElementById("tDots");
  const viewport = document.querySelector(".t-viewport");
  if (!track || !dotsWrap) return;

  const getGap = () => {
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap || styles.columnGap || "14");
    return Number.isFinite(gap) ? gap : 14;
  };

  const pageSize = () => (window.matchMedia("(min-width: 900px)").matches ? 3 : 1);

  const getStep = () => {
    const card = track.querySelector(".t-card");
    if (!card) return 0;
    return card.getBoundingClientRect().width + getGap();
  };

  const getPageIndex = () => {
    const step = getStep() || 1;
    const ps = pageSize();
    return Math.round(track.scrollLeft / (step * ps));
  };

  const goToPage = (idx) => {
    const step = getStep();
    if (!step) return;
    const ps = pageSize();
    track.scrollTo({ left: step * ps * idx, behavior: "smooth" });
  };

  let dots = [];
  let lastPageSize = pageSize();

  const buildDots = () => {
    const cards = Array.from(track.querySelectorAll(".t-card"));
    const count = Math.max(1, Math.ceil(cards.length / pageSize()));

    dotsWrap.innerHTML = "";
    dots = Array.from({ length: count }).map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "t-dot";
      b.setAttribute("aria-label", `Go to testimonials ${i + 1}`);
      b.addEventListener("click", () => goToPage(i));
      dotsWrap.appendChild(b);
      return b;
    });

    setActiveDot();
  };

  const setActiveDot = () => {
    if (!dots.length) return;
    const idx = getPageIndex();
    const clamped = Math.max(0, Math.min(idx, dots.length - 1));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === clamped));
  };

  // Update dot on scroll
  track.addEventListener("scroll", () => window.requestAnimationFrame(setActiveDot));

  // Rebuild dots if page size changes (mobile <-> desktop)
  window.addEventListener("resize", () => {
    const ps = pageSize();
    if (ps !== lastPageSize) {
      lastPageSize = ps;
      buildDots();
    } else {
      setActiveDot();
    }
  });

  // Keyboard support (optional)
  (viewport || track).addEventListener("keydown", (e) => {
    if (!dots.length) return;
    if (e.key === "ArrowRight") goToPage(Math.min(getPageIndex() + 1, dots.length - 1));
    if (e.key === "ArrowLeft") goToPage(Math.max(getPageIndex() - 1, 0));
  });

  buildDots();
})();
