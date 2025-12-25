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
