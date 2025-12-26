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
    const keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "gbraid",
      "wbraid",
    ];

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
  // Testimonials carousel (4-ish dots everywhere, grouped by 3 cards)
(function testimonialsCarousel() {
  const track = document.getElementById("tTrack");
  const dotsWrap = document.getElementById("tDots");
  const viewport = document.querySelector(".t-viewport");
  if (!track || !dotsWrap) return;

  const GROUP = 3; // keep dots consistent (and match desktop “3 per view”)

  const getGap = () => {
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap || styles.columnGap || "14");
    return Number.isFinite(gap) ? gap : 14;
  };

  const getStep = () => {
    const card = track.querySelector(".t-card");
    if (!card) return 0;
    return card.getBoundingClientRect().width + getGap();
  };

  const getCardIndex = () => {
    const step = getStep() || 1;
    return Math.round(track.scrollLeft / step);
  };

  const getPageIndex = () => Math.floor(getCardIndex() / GROUP);

  const goToPage = (idx) => {
    const step = getStep();
    if (!step) return;
    track.scrollTo({ left: step * GROUP * idx, behavior: "smooth" });
  };

  let dots = [];

  const setActiveDot = () => {
    if (!dots.length) return;
    const idx = getPageIndex();
    const clamped = Math.max(0, Math.min(idx, dots.length - 1));
    dots.forEach((d, i) => {
      const active = i === clamped;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-current", active ? "true" : "false");
    });
  };

  const buildDots = () => {
    const cards = Array.from(track.querySelectorAll(".t-card"));
    const count = Math.max(1, Math.ceil(cards.length / GROUP));

    dotsWrap.innerHTML = "";
    dots = Array.from({ length: count }).map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "t-dot";
      b.setAttribute("aria-label", `Go to testimonial set ${i + 1}`);
      b.addEventListener("click", () => goToPage(i));
      dotsWrap.appendChild(b);
      return b;
    });

    setActiveDot();
  };

  let raf = null;
  track.addEventListener("scroll", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(setActiveDot);
  });

  window.addEventListener("resize", () => setActiveDot());

  (viewport || track).addEventListener("keydown", (e) => {
    if (!dots.length) return;
    if (e.key === "ArrowRight") goToPage(Math.min(getPageIndex() + 1, dots.length - 1));
    if (e.key === "ArrowLeft") goToPage(Math.max(getPageIndex() - 1, 0));
  });

  buildDots();
})();
})();
