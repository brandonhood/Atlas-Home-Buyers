/* assets/js/app.js */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ========= Debug: confirm JS loads =========
  // Remove later once confirmed.
  console.log("[Atlas] app.js loaded");

  // ========= Smooth scroll for anchor links =========
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
  
// ========= Google Places Address Autocomplete + "clear on typing" guard =========
(function initAddressAutocomplete() {
  function boot() {
    if (!window.google || !google.maps || !google.maps.places) return false;

    const input = document.getElementById("address");
    if (!input) return true; // address field not on page (or not loaded yet)

    // If user types anything after selecting a suggestion, invalidate the selection
    input.addEventListener("input", () => {
      input.dataset.formatted = "";
      input.dataset.lat = "";
      input.dataset.lng = "";
    });

    const ac = new google.maps.places.Autocomplete(input, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry", "address_components"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place || !place.formatted_address) return;

      input.value = place.formatted_address;
      input.dataset.formatted = place.formatted_address;
      input.dataset.lat = place.geometry?.location?.lat() || "";
      input.dataset.lng = place.geometry?.location?.lng() || "";
    });

    return true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    // try immediately
    if (boot()) return;

    // if google isn't ready yet, retry a few times
    let tries = 0;
    const t = setInterval(() => {
      tries += 1;
      if (boot() || tries >= 20) clearInterval(t); // ~5s max
    }, 250);
  });
})();
  
  // ========= Hero CTA: copy address into form + scroll =========
  (function heroAddressFlow() {
    const heroInput = $("#heroAddress");
    const heroBtn = $("#heroCtaBtn");
    const formAddress = $("#address");
    const formWrap = $("#form");
    if (!heroBtn || !heroInput || !formAddress || !formWrap) return;

    function goToForm() {
  const val = (heroInput.value || "").trim();
  if (val) {
    formAddress.value = val;
    // Clear any previous selection so we don't accept a typed string
    formAddress.dataset.formatted = "";
    formAddress.dataset.lat = "";
    formAddress.dataset.lng = "";
  }

  formWrap.scrollIntoView({ behavior: "smooth", block: "start" });

  setTimeout(() => {
    // If they came from hero, make them pick the suggestion on the real field
    if (val) formAddress.focus({ preventScroll: true });
    else $("#firstName")?.focus({ preventScroll: true });
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

  // ========= Capture UTM/GCLID into hidden inputs =========
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
      if (form.querySelector(`input[name="${k}"]`)) return;

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
  })();

  // ========= Testimonials carousel dots =========
  (function testimonialsCarouselDots() {
    const track = document.getElementById("tTrack");
    const dotsWrap = document.getElementById("tDots");
    const viewport = document.querySelector(".t-viewport");
    if (!track || !dotsWrap) {
      console.warn("[Atlas] testimonials: missing #tTrack or #tDots");
      return;
    }

    const GROUP = 3;

    dotsWrap.style.display = "flex";
    dotsWrap.style.visibility = "visible";

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

      let idx = getPageIndex();

      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      const atEnd = track.scrollLeft >= (maxScrollLeft - 2);
      if (atEnd) idx = dots.length - 1;

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

      console.log(`[Atlas] testimonials: built ${dots.length} dots`);
      setActiveDot();
    };

    const init = () => {
      buildDots();
      setActiveDot();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
      init();
    }

    let raf = null;
    track.addEventListener("scroll", () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(setActiveDot);
    });

    window.addEventListener("resize", () => {
      buildDots();
      setActiveDot();
    });

    (viewport || track).addEventListener("keydown", (e) => {
      if (!dots.length) return;
      if (e.key === "ArrowRight") goToPage(Math.min(getPageIndex() + 1, dots.length - 1));
      if (e.key === "ArrowLeft") goToPage(Math.max(getPageIndex() - 1, 0));
    });

    const obs = new MutationObserver(() => {
      const cards = track.querySelectorAll(".t-card").length;
      const expected = Math.max(1, Math.ceil(cards / GROUP));
      if (expected !== dots.length) buildDots();
    });

    obs.observe(track, { childList: true, subtree: true });
  })();

  // ========= FAQ accordion: only one <details> open at a time =========
  (function faqAccordion() {
    const root = document.querySelector(".faq");
    if (!root) return;

    const items = Array.from(root.querySelectorAll("details"));

    items.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        items.forEach((other) => {
          if (other !== d) other.open = false;
        });
      });
    });
  })();

  // ========= GHL WEBHOOK SUBMIT =========
  const WEBHOOK_URL =
    "https://services.leadconnectorhq.com/hooks/hiXh5eL05l3CLqIHJsPz/webhook-trigger/d3ee1f72-65ee-4995-8594-27ea6cc048e5";

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function getUtmBundle() {
    return {
      utm_source: getParam("utm_source"),
      utm_medium: getParam("utm_medium"),
      utm_campaign: getParam("utm_campaign"),
      utm_term: getParam("utm_term"),
      utm_content: getParam("utm_content"),
      gclid: getParam("gclid"),
      gbraid: getParam("gbraid"),
      wbraid: getParam("wbraid"),
      page_url: window.location.href,
      referrer: document.referrer || "",
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("leadForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!form.address.dataset.formatted) {
        alert("Please select your address from the suggestions.");
        form.address.focus();
        return;
      }
      const payload = {
        address: form.address.dataset.formatted,
        latitude: form.address.dataset.lat || "",
        longitude: form.address.dataset.lng || "",
        first_name: (form.first_name?.value || "").trim(),
        last_name: (form.last_name?.value || "").trim(),
        phone: (form.phone?.value || "").trim(),
        email: (form.email?.value || "").trim(),
        ...getUtmBundle(),
        source: "Google Ads - Landing Page v 12.25.26",
        tag: "google_ads",
      };

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Webhook failed");

        // redirect to thank-you page
        window.location.href = "thank-you.html";
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again or call (904) 944-9419.");
      }
    });
  });
})();
