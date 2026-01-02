/* assets/js/app.js */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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

  // ========= Google Places Address Autocomplete + structured parsing =========
  (function initAddressAutocomplete() {
    function boot() {
      if (!window.google || !google.maps || !google.maps.places) return false;

      const input = document.getElementById("address");
      if (!input) return true;

      // Clear selection if user edits after choosing
      input.addEventListener("input", () => {
        input.dataset.formatted = "";
        input.dataset.street = "";
        input.dataset.city = "";
        input.dataset.state = "";
        input.dataset.postal = "";
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
        if (!place || !place.address_components) return;

        const components = {};
        place.address_components.forEach((c) => {
          c.types.forEach((t) => (components[t] = c));
        });

        const street =
          (components.street_number?.long_name || "") +
          " " +
          (components.route?.long_name || "");

        input.value = place.formatted_address;

        input.dataset.formatted = place.formatted_address;
        input.dataset.street = street.trim();
        input.dataset.city = components.locality?.long_name || "";
        input.dataset.state =
          components.administrative_area_level_1?.short_name || "";
        input.dataset.postal = components.postal_code?.long_name || "";
        input.dataset.lat = place.geometry?.location?.lat() || "";
        input.dataset.lng = place.geometry?.location?.lng() || "";
      });

      return true;
    }

    document.addEventListener("DOMContentLoaded", () => {
      if (boot()) return;

      let tries = 0;
      const t = setInterval(() => {
        tries += 1;
        if (boot() || tries >= 20) clearInterval(t);
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
    if (!track || !dotsWrap) return;

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

  // ========= FAQ accordion =========
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

  // ========= Attribution helpers =========
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function getAttributionFromUrl() {
    return {
      utm_source: getParam("utm_source"),
      utm_medium: getParam("utm_medium"),
      utm_campaign: getParam("utm_campaign"),
      utm_term: getParam("utm_term"),
      utm_content: getParam("utm_content"),
      gclid: getParam("gclid"),
      gbraid: getParam("gbraid"),
      wbraid: getParam("wbraid"),
    };
  }

  function loadAttribution() {
    const fromUrl = getAttributionFromUrl();
    const hasAny = Object.values(fromUrl).some((v) => v && String(v).trim().length > 0);

    if (hasAny) {
      sessionStorage.setItem("atlas_attribution", JSON.stringify(fromUrl));
      return fromUrl;
    }

    try {
      const stored = sessionStorage.getItem("atlas_attribution");
      return stored ? JSON.parse(stored) : fromUrl;
    } catch {
      return fromUrl;
    }
  }

  function getUtmBundle() {
    const a = loadAttribution();
    return { ...a, page_url: window.location.href, referrer: document.referrer || "" };
  }

  // ========= Webhook submit + redirect =========
// ========= Webhook submit + redirect (HARDENED) =========
const WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/hQAfrsswFluxo23n8S8z/webhook-trigger/ebee092d-0e74-4235-9f67-7d146626ad0e";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  if (!form) return;

  const addressEl = document.getElementById("address");

  // ---- dataLayer events ----
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "form_view", form_id: "leadForm" });

  let started = false;
  ["input", "change"].forEach((evt) => {
    form.addEventListener(
      evt,
      () => {
        if (started) return;
        started = true;
        window.dataLayer.push({ event: "form_start", form_id: "leadForm" });
      },
      { passive: true }
    );
  });

  // ---- address helpers ----
  function hasFullPlacesParts(el) {
    return !!(
      (el?.dataset?.street || "").trim() &&
      (el?.dataset?.city || "").trim() &&
      (el?.dataset?.state || "").trim() &&
      (el?.dataset?.postal || "").trim()
    );
  }

  // Require: "123 Main St, Jacksonville, FL 32256" (ZIP REQUIRED)
  function looksLikeFullAddressString(v) {
    const s = (v || "").trim();
    const hasStreet = /^\d+\s+.+/.test(s);
    const hasCityState = /,\s*[^,]+,\s*[A-Z]{2}\b/.test(s);
    const hasZip = /\b\d{5}(-\d{4})?\b/.test(s);
    return hasStreet && hasCityState && hasZip;
  }

  // ---- submit hardening ----
  const submitBtn = form.querySelector(
    'button[type="submit"], input[type="submit"]'
  );

  let isSubmitting = false;

  function setSubmitting(state) {
    isSubmitting = state;

    if (submitBtn) {
      submitBtn.disabled = state;
      submitBtn.setAttribute("aria-disabled", state ? "true" : "false");

      // Button label swap (works for <button> and <input type="submit">)
      if (!submitBtn.dataset.originalText) {
        submitBtn.dataset.originalText =
          submitBtn.tagName === "INPUT"
            ? (submitBtn.value || "Submit")
            : (submitBtn.textContent || "Submit");
      }

      const nextText = state ? "Submitting..." : submitBtn.dataset.originalText;

      if (submitBtn.tagName === "INPUT") submitBtn.value = nextText;
      else submitBtn.textContent = nextText;
    }

    // Lock inputs while sending (but keep hidden inputs enabled)
    Array.from(form.elements).forEach((el) => {
      if (!el) return;
      if (el === submitBtn) return;
      if (el.type === "hidden") return;
      el.disabled = state;
    });
  }

  // Prevent Enter key from re-submitting while locked
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && isSubmitting) e.preventDefault();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // HARD STOP for double-submit / button mashing
    if (isSubmitting) return;
    setSubmitting(true);

    try {
      if (!form.checkValidity()) {
        form.reportValidity();
        setSubmitting(false);
        return;
      }

      const rawAddress = (addressEl?.value || "").trim();

      // Case 1: user selected from Google Places
      const usedPlaces = !!(
        addressEl?.dataset?.formatted && addressEl.dataset.formatted.trim()
      );
      const placesIsFull = usedPlaces && hasFullPlacesParts(addressEl);

      // Case 2: user typed/autofilled a full address string
      const typedIsFull = looksLikeFullAddressString(rawAddress);

      if (!placesIsFull && !typedIsFull) {
        alert('Please enter a full address like "123 Main St, Jacksonville, FL 32256".');
        addressEl?.focus();
        setSubmitting(false);
        return;
      }

      window.dataLayer.push({ event: "form_submit", form_id: "leadForm" });

      // Dedupe key (useful if you later dedupe server-side)
      const submission_id =
        Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);

      const payload = {
        submission_id,

        address: placesIsFull ? (addressEl.dataset.street || "").trim() : rawAddress,
        city: placesIsFull ? (addressEl.dataset.city || "").trim() : "",
        state: placesIsFull ? (addressEl.dataset.state || "").trim() : "",
        postal_code: placesIsFull ? (addressEl.dataset.postal || "").trim() : "",
        latitude: placesIsFull ? (addressEl.dataset.lat || "").trim() : "",
        longitude: placesIsFull ? (addressEl.dataset.lng || "").trim() : "",
        address_source: placesIsFull ? "google_places" : "manual_or_autofill",

        first_name: (form.first_name?.value || "").trim(),
        last_name: (form.last_name?.value || "").trim(),
        phone: (form.phone?.value || "").trim(),
        email: (form.email?.value || "").trim(),

        ...getUtmBundle(),
        source: "Google Ads - Landing Page v 12.25.26",
        tag: "google_ads",
      };

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      if (!res.ok) throw new Error("Webhook failed");

      window.dataLayer.push({ event: "lead_webhook_success", form_id: "leadForm" });

      // Keep disabled; redirect immediately on success
      window.location.href = "thank-you.html";
    } catch (err) {
      console.error(err);
      window.dataLayer.push({ event: "lead_webhook_error", form_id: "leadForm" });
      alert("Something went wrong. Please try again or call (904) 944-9419.");

      // Only re-enable on error
      setSubmitting(false);
    }
  });
});
})(); 
