// ─────────────────────────────────────────────────────────────
// FILE: aohzy.js
// ─────────────────────────────────────────────────────────────
/** AOHZY — local companion (privacy by design) */
const AOHZY = (()=>{
    const el = document.getElementById('aohzy');
    const msg = document.getElementById('aohzy-msg');
    const accept = el?.querySelector('[data-a="accept"]');
    const dismiss = el?.querySelector('[data-a="dismiss"]');
    const store = window.localStorage;
  
    const M = {
      calm: 'Want a lighter view? I can add spacing.',
      focus: 'Reading mode is one tap away.',
      guided: 'Let’s keep it simple — one step each.',
      break: 'Need a 30-second breather? I’ll keep your place.',
      night: 'Night mode reduces glare and motion.'
    };
  
    let currentKey = null;
  
    function show(key){
      if(!el) return;
      if(store.getItem('aohzy:dismiss:'+key)) return; 
      currentKey = key;
      msg.textContent = M[key] || 'I’m here if you need me.';
      el.hidden = false;
    }
    function hide(persist=false){
      if(!el) return;
      el.hidden = true;
      if(persist && currentKey){ store.setItem('aohzy:dismiss:'+currentKey, '1'); }
    }
  
    accept?.addEventListener('click', ()=>{
      // trigger context action
      if(currentKey==='calm') document.querySelector('[data-action="calm-view"]')?.click();
      if(currentKey==='focus') document.querySelector('[data-action="tts-play"]')?.focus();
      hide(true);
    });
    dismiss?.addEventListener('click', ()=> hide(true));
  
    // Heuristics
    let lastScrollAt = Date.now();
    let errCount = 0;
  
    document.addEventListener('scroll', ()=>{ lastScrollAt = Date.now(); }, { passive: true });
    document.addEventListener('keydown', (e)=>{
      if(e.key==='Tab') lastScrollAt = Date.now();
    });
  
    // Form friction
    document.addEventListener('invalid', ()=>{ errCount++; if(errCount>=2) show('guided'); }, true);
  
    // Night tone (20:00+) or long session
    function checkNight(){
      const hours = new Date().getHours();
      if(hours>=20) show('night');
    }
  
    // Idle → break suggestion
    function checkIdle(){
      if(Date.now()-lastScrollAt > 90_000) show('break');
    }
  
    // Initialization
    function init(){
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){
        document.body.classList.add('reduced-motion');
      }
      checkNight();
      setInterval(checkIdle, 15_000);
    }
  
    return { init };
  })();
  
  window.addEventListener('DOMContentLoaded', ()=> AOHZY.init());
  