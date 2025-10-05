(() => {
    let dict = {};
    let current = localStorage.getItem('lang') || 'en';
  
    async function loadDict() {
      const res = await fetch('assets/i18n/i18n.json');
      dict = await res.json();
      apply();
    }
  
    function apply() {
      const strings = dict[current] || {};
  
      // text nodes
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (strings[key] !== undefined) el.textContent = strings[key];
      });
  
      // placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (strings[key] !== undefined) el.setAttribute('placeholder', strings[key]);
      });
  
      // aria-label
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (strings[key] !== undefined) el.setAttribute('aria-label', strings[key]);
      });
  
      // title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (strings[key] !== undefined) el.setAttribute('title', strings[key]);
      });
  
      // html lang + lang buttons state
      document.documentElement.lang = current;
      const enBtn = document.getElementById('langEn');
      const frBtn = document.getElementById('langFr');
      if (enBtn && frBtn) {
        enBtn.setAttribute('aria-pressed', String(current === 'en'));
        frBtn.setAttribute('aria-pressed', String(current === 'fr'));
      }
  
      // notify others (weather, etc.)
      window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: current } }));
    }
  
    function setLang(lang) {
      if (lang !== 'en' && lang !== 'fr') return;
      current = lang;
      localStorage.setItem('lang', lang);
      apply();
    }
  
    // boot
    document.addEventListener('DOMContentLoaded', () => {
      loadDict();
      document.getElementById('langEn')?.addEventListener('click', () => setLang('en'));
      document.getElementById('langFr')?.addEventListener('click', () => setLang('fr'));
    });
  })();
  