// script.js — UI polish only (no i18n logic)
window.addEventListener('DOMContentLoaded', () => {
  /* ========================
     THEME TOGGLE
  ======================== */
  const root        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');
  const storageKey  = 'hty_theme';

  function applyTheme(theme){
    const isDark = theme === 'dark';
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle?.setAttribute('aria-pressed', String(isDark));
    if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
    // aria-label / title are handled by i18n via data-i18n-aria / data-i18n-title
  }

  const saved = localStorage.getItem(storageKey);
  const initial = saved || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(initial);

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(storageKey, next);
  });

  /* ========================
     MOBILE NAV TOGGLE
  ======================== */
  const navToggle  = document.querySelector('.nav-toggle');
  const primaryNav = document.getElementById('site-nav');

  if (navToggle && primaryNav){
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      primaryNav.dataset.open = String(!open);
      (!open ? primaryNav.querySelector('a') : navToggle)?.focus();
    });
  }

  /* ========================
     NAV aria-current
  ======================== */
  const nav = document.querySelector('nav[aria-label]');
  const links = nav ? [...nav.querySelectorAll('a')] : [];
  function updateAriaCurrent(){
    if (!links.length) return;
    const hash = window.location.hash || '#features';
    links.forEach(a => {
      if (a.getAttribute('href') === hash) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('hashchange', updateAriaCurrent);
  updateAriaCurrent();


  /* ========================
     I18N EVENT HOOK
  ======================== */
  window.addEventListener('i18n:changed', () => {
    // No DOM text writes here — i18n.js updates texts/labels.
    // Keep this if you need to react to language changes later.
  });
});
