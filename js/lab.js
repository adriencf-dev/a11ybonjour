// js/lab.js
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* ----------------------------------------------------------
   A) View Transitions (progressive)
---------------------------------------------------------- */
function goto(hash) {
  const nav = () => { location.hash = hash; };
  if (!document.startViewTransition) return nav();
  document.startViewTransition(nav);
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-goto]');
  if (!a) return;
  e.preventDefault();
  goto(a.getAttribute('data-goto'));
});

/* ----------------------------------------------------------
   B) Proof mode (A11Y helpers)
   - data-proof="tabmap" | "landmarks" | "contrast"
---------------------------------------------------------- */
const proofStatus = $('#proof-status');

function setStatus(msg) {
  if (proofStatus) proofStatus.textContent = msg;
}


let tabBadges = [];
function toggleTabMap() {
  if (tabBadges.length) {
    tabBadges.forEach(b => b.remove()); tabBadges = [];
    setStatus('Tab map off.');
    return;
  }
  const focusables = $$('a, button, input, textarea, select, details, summary, [tabindex]:not([tabindex="-1"])')
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  focusables.forEach((el, i) => {
    const b = document.createElement('span');
    b.textContent = i+1;
    Object.assign(b.style, {
      position:'absolute', transform:'translate(-50%,-50%)',
      background:'rgba(125,167,217,.9)', color:'#000', padding:'2px 6px',
      borderRadius:'999px', font:'600 12px/1 system-ui', zIndex:9999,
      boxShadow:'0 0 0 2px #000'
    });
    const r = el.getBoundingClientRect();
    b.style.left = (window.scrollX + r.left + r.width) + 'px';
    b.style.top  = (window.scrollY + r.top) + 'px';
    document.body.appendChild(b);
    tabBadges.push(b);
  });
  setStatus('Tab map on.');
}

/* Landmarks outline */
let landmarksOn = false;
function toggleLandmarks() {
  landmarksOn = !landmarksOn;
  document.documentElement.toggleAttribute('data-proof-landmarks', landmarksOn);
  setStatus(landmarksOn ? 'Landmarks outlined.' : 'Landmarks off.');
}

/* Contrast badge (fg/bg principaux) */
let contrastOn = false;
function luminance(rgb) {
  const srgb = rgb.map(v => {
    v /= 255;
    return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  });
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
}
function parseColor(c) {
  const ctx = parseColor._ctx || (parseColor._ctx = document.createElement('canvas').getContext('2d'));
  ctx.canvas.width = ctx.canvas.height = 1;
  ctx.fillStyle = c; ctx.fillRect(0,0,1,1);
  const d = ctx.getImageData(0,0,1,1).data;
  return [d[0], d[1], d[2]];
}
let contrastBadge;
function toggleContrast() {
  contrastOn = !contrastOn;
  if (!contrastOn) { contrastBadge?.remove(); setStatus('Contrast badge off.'); return; }
  const cs = getComputedStyle(document.documentElement);
  const fg = parseColor(cs.getPropertyValue('--text').trim() || '#E6E9EF');
  const bg = parseColor(cs.getPropertyValue('--bg').trim() || '#0B0D10');
  const L1 = luminance(fg), L2 = luminance(bg);
  const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
  contrastBadge = document.createElement('div');
  contrastBadge.textContent = `Contrast ~ ${ratio.toFixed(2)}:1`;
  Object.assign(contrastBadge.style, {
    position:'fixed', inset:'1rem 1rem auto auto',
    background:'#0f1318', color:'#E6E9EF', padding:'6px 10px',
    border:'1px solid #29303a', borderRadius:'10px', zIndex:9999
  });
  document.body.appendChild(contrastBadge);
  setStatus('Contrast badge on.');
}

/* Bind proof buttons */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-proof]');
  if (!b) return;
  const k = b.getAttribute('data-proof');
  if (k === 'tabmap') toggleTabMap();
  if (k === 'landmarks') toggleLandmarks();
  if (k === 'contrast') toggleContrast();
});

/* ----------------------------------------------------------
   C) Popover background lock (fallback ergonomique)
---------------------------------------------------------- */
const hasPopover = 'popover' in document.createElement('div');
if (hasPopover) {
  document.addEventListener('toggle', (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target.hasAttribute('popover')) {
      const open = e.target.matches(':popover-open');
      document.documentElement.toggleAttribute('data-popover-open', open);
    }
  }, true);
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[popovertarget][popovertargetaction="hide"]');
    if (!btn) return;
    const id = btn.getAttribute('popovertarget');
    const el = id && document.getElementById(id);
    if (el && typeof el.hidePopover === 'function') el.hidePopover();
  }, { capture: true });
  
