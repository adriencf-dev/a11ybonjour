// js/lab/mount.js — clean

import { mountA11yCombo } from './A11yCombo.js';


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cbx').forEach(mountA11yCombo);
});

(function () {
  const ready = () =>
    (globalThis.React || globalThis.react) &&
    (globalThis.ReactDOM || globalThis['react-dom']);

  
  function ensureToasterStack() {
    let el = document.querySelector('.toaster-stack');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toaster-stack';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      document.body.appendChild(el); 
    } else if (el.parentElement !== document.body) {
      document.body.appendChild(el);
    }
    return el;
  }

  let _toastTimer;
  function showToastPolite(message = 'Message sent politely.', timeout = 3000) {
    const stack = ensureToasterStack();

    
    const sr = document.getElementById('toast-region');
    if (sr) {
      sr.textContent = '';
      setTimeout(() => { sr.textContent = message; }, 20);
    }

    
    const card = document.createElement('div');
    card.className = 'toast-card';
    card.textContent = message;
    stack.appendChild(card);

    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { card.remove(); }, timeout);
  }

 

  function wireFallbackButton() {
    
    document.querySelector('[data-fallback-toast]')?.addEventListener('click', () => {
      showToastPolite('Gentle message shown.');
    });
  }

  function waitForReact(maxTries = 40) {
    return new Promise((resolve, reject) => {
      if (ready()) return resolve();
      let tries = 0;
      const id = setInterval(() => {
        if (ready()) { clearInterval(id); resolve(); }
        else if (++tries >= maxTries) { clearInterval(id); reject(new Error('React UMD not found')); }
      }, 50);
    });
  }

  (async () => {
    try {
      await waitForReact(); 
    } catch (e) {
      console.info('[lab] React not present — keeping HTML fallbacks.');
      wireFallbackButton();              
      return;
    }

    const React = globalThis.React || globalThis.react;
    const ReactDOM = globalThis.ReactDOM || globalThis['react-dom'];

    const mounts = [
      { sel: '[data-react-island="A11yDialog"]',  mod: './A11yDialog.js',  exp: 'A11yDialog'  },
      { sel: '[data-react-island="A11yCombo"]',   mod: './A11yCombo.js',   exp: 'A11yCombo'   },
      { sel: '[data-react-island="A11yToaster"]', mod: './A11yToaster.js', exp: 'A11yToaster' }
    ];

    for (const { sel, mod, exp } of mounts) {
      for (const el of document.querySelectorAll(sel)) {
        try {
          const m = await import(mod);
          const C = m[exp];
          if (C) {
            ReactDOM.createRoot(el).render(React.createElement(C));
          } else {
            if (sel.includes('A11yToaster')) wireFallbackButton();
          }
        } catch (err) {
          console.warn('[lab] island import failed:', mod, err);
          if (sel.includes('A11yToaster')) wireFallbackButton();
        }
      }
    }
  })();
})();
