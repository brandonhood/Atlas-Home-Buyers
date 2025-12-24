// Atlas LP — minimal JS
// 1) Address-first submit scrolls to step2 and copies address
// 2) Smooth anchor behavior

(function () {
  const addressForm = document.getElementById("addressForm");
  const heroAddress = document.getElementById("heroAddress");
  const address2 = document.getElementById("address2");
  const step2 = document.getElementById("step2");

  if (addressForm && heroAddress && address2 && step2) {
    addressForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (heroAddress.value || "").trim();
      if (val) address2.value = val;

      step2.scrollIntoView({ behavior: "smooth", block: "start" });

      // optional: focus next field for speed
      setTimeout(() => {
        const name = document.getElementById("name");
        if (name) name.focus({ preventScroll: true });
      }, 350);
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
