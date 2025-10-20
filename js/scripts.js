// ─────────────────────────────────────────────────────────────
// FILE: scripts.js  — clean, single-source
// ─────────────────────────────────────────────────────────────
"use strict";

// Helpers
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─────────────────────────────────────────────────────────────
// 1) Hero rotor (breathing copy)
// ─────────────────────────────────────────────────────────────
const heroPhrases = [
  'I design calm.',
  'Accessibility you can feel.',
  'Human + AI for clarity.'
];
let heroIdx = 0;
const heroRotor = $('#hero-rotor');

function rotateHero() {
  heroIdx = (heroIdx + 1) % heroPhrases.length;
  if (heroRotor) heroRotor.textContent = heroPhrases[heroIdx];
}
let heroTimer;
function startHeroRotor() {
  if (prefersReducedMotion()) return;
  stopHeroRotor();
  heroTimer = setInterval(rotateHero, 6000);
}
function stopHeroRotor() {
  if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') startHeroRotor();
  else stopHeroRotor();
});
startHeroRotor();

// ─────────────────────────────────────────────────────────────
// 2) Calm View toggle
// ─────────────────────────────────────────────────────────────
const calmBtn  = document.querySelector('[data-action="calm-view"]');
const resetBtn = document.querySelector('[data-action="reset-view"]');
const calmDemo = $('#calm-demo');

calmBtn?.addEventListener('click', () => {
  calmDemo?.classList.add('calm');
  calmBtn.setAttribute('aria-pressed', 'true');
});
resetBtn?.addEventListener('click', () => {
  calmDemo?.classList.remove('calm');
  calmBtn.setAttribute('aria-pressed', 'false');
});

// ─────────────────────────────────────────────────────────────
// 3) Mail bridge (mailto) — used by Calm Form + Contact
// ─────────────────────────────────────────────────────────────
const MAILTO = "a.calvezfoubert@gmail.com";
const enc = (s) => encodeURIComponent(s ?? '');

function sendMailFromForm(form, subject) {
  const fd = new FormData(form);
  const bodyText = Array.from(fd.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const href = `mailto:${MAILTO}?subject=${enc(subject)}&body=${enc(bodyText)}`;
  window.location.href = href;

  const status = form.querySelector(".form-status");
  if (status) {
    status.textContent =
      `Your email app just opened. If nothing happened, please email us directly at ${MAILTO}.`;
  }
}

// ─────────────────────────────────────────────────────────────
// 4) Calm Form — wizard + mailto (with initialLoad guard)
// ─────────────────────────────────────────────────────────────
let initialLoad = true; // ✔ On empêche le focus auto à la première ouverture
const form = document.getElementById('calm-form');

if (form) {
  const steps = Array
    .from(form.querySelectorAll('.form-step'))
    .sort((a, b) => (parseInt(a.dataset.step || '0', 10)) - (parseInt(b.dataset.step || '0', 10)));

  let current = 0;

  function showStep(i) {
    steps.forEach((s, idx) => { s.hidden = idx !== i; });

    // ✅ Focus uniquement après le premier chargement
    if (!initialLoad) {
      const first = steps[i].querySelector('input, textarea, button');
      first?.focus();
    }

    const status = form.querySelector('.form-status');
    if (status) status.textContent = `Step ${i + 1} of ${steps.length}`;
  }

  form.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.classList.contains('next')) {
      e.preventDefault();
      if (current < steps.length - 1) current++;
      showStep(current);
    }

    if (t.classList.contains('prev')) {
      e.preventDefault();
      if (current > 0) current--;
      showStep(current);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMailFromForm(form, 'A11yBonjour — Calm Form');

    const status = form.querySelector('.form-status');
    if (status) {
      status.textContent = 'Message sent with calm 🌿';
      status.style.opacity = '1';
    }

    form.reset();
    setTimeout(() => {
      current = 0;
      showStep(current);
      if (status) status.textContent = '';
    }, 3000);
  });

  showStep(current);
  initialLoad = false; // ✔ À partir de maintenant, la navigation focusera correctement
}

// ─────────────────────────────────────────────────────────────
// 5) Contact form — simple + mailto
// ─────────────────────────────────────────────────────────────
const contact = document.getElementById('contact-form');
if (contact) {
  contact.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMailFromForm(contact, 'A11yBonjour — Let’s talk');

    const status = contact.querySelector('.form-status');
    if (status) {
      status.textContent = 'Message sent with calm 🌿';
      status.style.opacity = '1';
    }
    contact.reset();
    setTimeout(() => { if (status) status.textContent = ''; }, 3000);
  });
}

// ─────────────────────────────────────────────────────────────
// 6) Noise of Focus — super simple synthesized noise
// ─────────────────────────────────────────────────────────────
let noiseCtx, noiseNode, noiseTimer;
function createNoise(type = 'pink') {
  noiseCtx = new (window.AudioContext || window.webkitAudioContext)();
  const node = noiseCtx.createScriptProcessor(4096, 1, 1);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  node.onaudioprocess = (e) => {
    const out = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < out.length; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        out[i] = white * 0.08;
      } else if (type === 'brown') {
        b0 += 0.02 * white;
        out[i] = b0 * 0.02;
      } else {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }
    }
  };
  node.connect(noiseCtx.destination);
  return node;
}

const noiseTypeSel = $('#noise-type');
const noiseMins    = $('#noise-mins');
const noisePlayBtn = document.querySelector('[data-action="noise-play"]');
const noiseStopBtn = document.querySelector('[data-action="noise-stop"]');
const noiseStatus  = $('#noise-status');

function stopNoise() {
  if (noiseNode) { noiseNode.disconnect(); noiseNode = null; }
  if (noiseCtx)  { noiseCtx.close(); noiseCtx = null; }
  clearTimeout(noiseTimer);
  if (noiseStatus) noiseStatus.textContent = 'Noise stopped.';
}

noisePlayBtn?.addEventListener('click', () => {
  if (noiseNode) return;
  noiseNode = createNoise(noiseTypeSel?.value || 'pink');
  const mins = Math.max(1, parseInt(noiseMins?.value || '5', 10));
  if (noiseStatus) noiseStatus.textContent = `Focus noise for ${mins} minutes.`;
  clearTimeout(noiseTimer);
  noiseTimer = setTimeout(stopNoise, mins * 60 * 1000);
});
noiseStopBtn?.addEventListener('click', stopNoise);

// ─────────────────────────────────────────────────────────────
// 7) Dots nav active state on scroll
// ─────────────────────────────────────────────────────────────
const chapterLinks = $$('.chapters a');
const sections = ['manifesto', 'lab', 'story', 'human-ai', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const obs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      chapterLinks.forEach((a) => {
        if (a.getAttribute('href') === '#' + id) {
          a.setAttribute('aria-current', 'page');
        } else {
          a.removeAttribute('aria-current');
        }
      });
    }
  });
}, { threshold: 0.51 });
sections.forEach((s) => obs.observe(s));

// ─────────────────────────────────────────────────────────────
// 8) Easter egg timing (idle or click)
// ─────────────────────────────────────────────────────────────
const egg = document.getElementById('easter-one');
let idleTimer;
function revealEgg() {
  if (!egg) return;
  egg.classList.add('revealed');
  egg.querySelector('.whisper')?.removeAttribute('hidden');
}
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(revealEgg, 4000);
}
['mousemove', 'keydown', 'pointerdown', 'scroll']
  .forEach(ev => document.addEventListener(ev, resetIdle, { passive: true }));
resetIdle();
egg?.addEventListener('click', revealEgg);

// ─────────────────────────────────────────────────────────────
// 9) Enter → scroll to lab
// ─────────────────────────────────────────────────────────────
const enterBtn = document.querySelector('[data-action="enter"]');
enterBtn?.addEventListener('click', () => {
  document.getElementById('lab')
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
});

// ─────────────────────────────────────────────────────────────
// 10) View Transitions for links marked [data-vt]
// ─────────────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-vt]');
  if (!a || !document.startViewTransition) return;
  e.preventDefault();
  document.startViewTransition(() => { window.location.href = a.href; });
});

// ─────────────────────────────────────────────────────────────
// 11) Popover fallback minimal (if needed)
// ─────────────────────────────────────────────────────────────
if (!('showPopover' in HTMLDialogElement.prototype)) {
  document.querySelectorAll('[data-popover-target]').forEach(btn => {
    const pop = document.getElementById(btn.getAttribute('data-popover-target'));
    if (!pop) return;
    pop.classList.add('popover-fallback');
    btn.addEventListener('click', () => {
      pop.classList.toggle('is-open');
      if (pop.classList.contains('is-open')) {
        pop.querySelector('[data-autofocus]')?.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (!pop.contains(e.target) && e.target !== btn) {
        pop.classList.remove('is-open');
      }
    });
  });
}
