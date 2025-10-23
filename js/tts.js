// ─────────────────────────────────────────────────────────────
// FILE: tts.js  (clean, single-source of truth)
// ─────────────────────────────────────────────────────────────

(() => {
  const NAR_PRESETS = {
    Masculine: {
      Warm:    { rate: 1.02, pitch: 0.96, volume: 1.0 },
      Neutral: { rate: 1.00, pitch: 1.00, volume: 1.0 },
      Night:   { rate: 0.92, pitch: 0.94, volume: 0.92 }
    },
    Feminine: {
      Warm:    { rate: 1.05, pitch: 1.10, volume: 1.0 },
      Neutral: { rate: 1.00, pitch: 1.05, volume: 1.0 },
      Night:   { rate: 0.94, pitch: 1.02, volume: 0.92 }
    },
    Neutral: {
      Warm:    { rate: 1.02, pitch: 1.02, volume: 1.0 },
      Neutral: { rate: 1.00, pitch: 1.00, volume: 1.0 },
      Night:   { rate: 0.96, pitch: 0.98, volume: 0.92 }
    }
  };

  const RADIO_TO_TONE = { warm: 'Warm', neutral: 'Neutral', night: 'Night' };

  function preferredLangs() {
    const langs = [];
    const docLang = (document.documentElement.lang || '').toLowerCase();
    const navLang = (navigator.language || '').toLowerCase();
    if (docLang) langs.push(docLang);
    if (navLang) langs.push(navLang);
    [...langs].forEach(l => {
      const r = l.split('-')[0];
      if (r && !langs.includes(r)) langs.push(r);
    });
    ['en-GB','en-US','en','fr-FR','fr'].forEach(l => {
      if (!langs.includes(l.toLowerCase())) langs.push(l.toLowerCase());
    });
    return langs;
  }

  function scoreVoice(v, gender) {
    let s = 0;
    if (v.localService) s += 3;
    const langs = preferredLangs();
    const vlang = (v.lang || '').toLowerCase();
    if (langs.includes(vlang)) s += 4;
    if (langs.some(l => vlang.startsWith(l.split('-')[0]))) s += 2;

    const n = (v.name || '').toLowerCase();
    const masculineHints = ['google uk english male','google us english','daniel','paul','thomas','alex','henry','oliver','george','charlie','liam','noah'];
    const feminineHints  = ['amélie','amelie','julie','claire','victoria','samantha','serena','moira','google uk english female','google français','pauline','audrey','margaux','zoe','zoé','ava'];
    const neutralHints   = ['alex','alloy','neutral','androg','alva'];

    const has = arr => arr.some(h => n.includes(h));
    if (gender === 'Masculine' && has(masculineHints)) s += 5;
    if (gender === 'Feminine'  && has(feminineHints))  s += 5;
    if (gender === 'Neutral'   && (has(neutralHints) || n.includes('alex'))) s += 5;

    if (langs[0]?.startsWith('fr') && vlang.startsWith('fr')) s += 2;
    return s;
  }

  function pickVoice(gender = 'Neutral') {
    const voices = speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;
    const cleaned = voices.filter(v => {
      const name = (v.name || '').toLowerCase();
      return !name.includes('espeak');
    });
    let best = null, bestScore = -Infinity;
    for (const v of cleaned) {
      const sc = scoreVoice(v, gender);
      if (sc > bestScore) { bestScore = sc; best = v; }
    }
    return best || voices[0];
  }

  function speakNarrator(text, { voiceType='Neutral', tone='Neutral' } = {}) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text || 'Bonjour, je suis A11yBonjour.');
    const preset = (NAR_PRESETS[voiceType] || NAR_PRESETS.Neutral)[tone] || NAR_PRESETS.Neutral.Neutral;
    u.rate   = preset.rate;
    u.pitch  = preset.pitch;
    u.volume = preset.volume;

    const langs = preferredLangs();
    const preferFr = langs.some(l => l.startsWith('fr'));
    u.lang = preferFr ? 'fr-FR' : (langs[0] || 'en-US');

    const v = pickVoice(voiceType);
    if (v) {
      u.voice = v;
      if (v.lang) u.lang = v.lang;
    }

    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  window.speakNarrator = speakNarrator;

  function mountNarratorControls() {
    const root = document.getElementById('narrator');

    const btnLegacyPlay = document.querySelector('[data-action="tts-play"]');
    const btnLegacyStop = document.querySelector('[data-action="tts-stop"]');
    const radios = Array.from(document.querySelectorAll('input[name="voice"]'));

    const btnPlay = root?.querySelector('[data-narrator-play]');
    const selType = root?.querySelector('#nar-voice-type');
    const selTone = root?.querySelector('#nar-tone');
    const input   = root?.querySelector('[data-narrator-text]') || root?.querySelector('textarea, input[type="text"]');

    const getToneFromRadios = () => {
      const checked = radios.find(r => r.checked);
      return RADIO_TO_TONE[(checked?.value || 'neutral').toLowerCase()] || 'Neutral';
    };

    btnPlay?.addEventListener('click', () => {
      const voiceType = selType?.value || 'Neutral';
      const tone = selTone?.value || getToneFromRadios();
      const text = (input?.value || input?.textContent || (document.documentElement.lang?.startsWith('fr') ? 'Bonjour, je suis A11yBonjour.' : 'Hello, I am A11yBonjour.'));
      speakNarrator(text, { voiceType, tone });
    });

    btnLegacyPlay?.addEventListener('click', () => {
      const tone = getToneFromRadios();
      const voiceType = selType?.value || 'Neutral';
      const text = (input?.value || input?.textContent || (document.documentElement.lang?.startsWith('fr') ? 'Bonjour, je suis A11yBonjour.' : 'This is AOHZY. Local only, gentle by design.'));
      speakNarrator(text, { voiceType, tone });
    });

    btnLegacyStop?.addEventListener('click', () => speechSynthesis.cancel());
  }

  function initWhenVoicesReady() {
    if (speechSynthesis.getVoices().length) {
      mountNarratorControls();
    } else {
      speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.onvoiceschanged = null;
        mountNarratorControls();
      };
    }
  }

  window.addEventListener('DOMContentLoaded', initWhenVoicesReady);
})();
