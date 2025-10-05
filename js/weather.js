(() => {
  /* ========================
     SELECTORS
  ======================== */
  const root = document.getElementById('weather');
  if (!root) return;

  const form = root.querySelector('#searchForm');
  const cityInput = root.querySelector('#city');
  const unitBtn = root.querySelector('#unitToggle');
  const result = root.querySelector('#result');
  const sr = root.querySelector('#srStatus');

  /* ========================
     STATE
  ======================== */
  const apiKey = '0d9f51fe5ce6db6653f7694e3dc0dd7b';
  let units = localStorage.getItem('units') || 'metric';
  let submitLock = false;
  let inFlight;

  /* ========================
     I18N (local au widget)
  ======================== */
  const getLang = () =>
    (document.documentElement.lang || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';

  const L = {
    en: {
      loading: 'Loading weather…',
      error404: 'City not found.',
      errorGeneric: 'Could not fetch weather.',
      wind: 'Wind',
      noDesc: 'No description',
      unitToC: 'Switch to °C',
      unitToF: 'Switch to °F',
      srFor: (city, temp, unit, desc) => `${city}: ${temp}°${unit}, ${desc}`
    },
    fr: {
      loading: 'Chargement de la météo…',
      error404: 'Ville introuvable.',
      errorGeneric: 'Impossible de récupérer la météo.',
      wind: 'Vent',
      noDesc: 'Pas de description',
      unitToC: 'Passer en °C',
      unitToF: 'Passer en °F',
      srFor: (city, temp, unit, desc) => `${city} : ${temp}°${unit}, ${desc}`
    }
  };

 
  const MSG = () => L[getLang()];

  /* ========================
     UTILS
  ======================== */
  const kmh = (ms) => `${Math.round(ms * 3.6)} km/h`;
  const mph = (ms) => `${Math.round(ms)} mph`;
  const windFmt = (ms) => (units === 'metric' ? kmh(ms) : mph(ms));
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  function setLoading(is) {
    result.dataset.loading = String(is);
    result.setAttribute('aria-busy', String(is));
    const submit = form.querySelector("button[type='submit']");
    if (submit) {
      submit.disabled = is;
      submit.setAttribute('aria-disabled', String(is));
    }
    unitBtn.disabled = is;
  }

  function updateUnitBtn() {
    const isImperial = units === 'imperial';
    unitBtn.textContent = isImperial ? '°F' : '°C';
    unitBtn.setAttribute('aria-pressed', String(isImperial));
    unitBtn.setAttribute('aria-label', isImperial ? MSG().unitToC : MSG().unitToF);
  }

  /* ========================
     API
  ======================== */
  async function fetchWeather(city) {
    if (inFlight) inFlight.abort();
    inFlight = new AbortController();
    const { signal } = inFlight;

    const lang = getLang();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}&lang=${lang}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      if (res.status === 404) throw new Error(MSG().error404);
      throw new Error(MSG().errorGeneric);
    }
    return res.json();
  }

  /* ========================
     RENDER
  ======================== */
  function renderError(msg) {
    result.innerHTML = `<p class="error" role="alert">${msg}</p>`;
  }

  function renderWeather(d) {
    const icon = d.weather?.[0]?.icon;
    const desc = cap(d.weather?.[0]?.description || MSG().noDesc);
    const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';
    const unitLabel = units === 'metric' ? 'C' : 'F';

    result.innerHTML = `
      <article class="card">
        <h3>${d.name}, ${d.sys.country}</h3>
        ${iconUrl ? `<img src="${iconUrl}" alt="" aria-hidden="true" />` : ''}
        <p class="temp">${Math.round(d.main.temp)}°${unitLabel}</p>
        <p>${desc}</p>
        <p>${MSG().wind}: ${windFmt(d.wind.speed)}</p>
      </article>
    `;
  }

  /* ========================
     FLOW
  ======================== */
  async function loadWeather(city) {
    try {
      setLoading(true);
      sr.textContent = MSG().loading;
      const data = await fetchWeather(city);
      localStorage.setItem('lastCity', city);
      renderWeather(data);

      const temp = Math.round(data.main.temp);
      const unitLabel = units === 'metric' ? 'C' : 'F';
      const desc = cap(data.weather?.[0]?.description || MSG().noDesc);
      sr.textContent = MSG().srFor(data.name, temp, unitLabel, desc);

      window.dispatchEvent(new CustomEvent('weather:loaded'));
    } catch (err) {
      renderError(err.message);
      sr.textContent = `Error: ${err.message}`;
    } finally {
      setLoading(false);
    }
  }

  /* ========================
     EVENTS
  ======================== */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitLock) return;
    const city = cityInput.value.trim();
    if (!city) return;
    submitLock = true;
    await loadWeather(city);
    submitLock = false;
  });

  unitBtn.addEventListener('click', async () => {
    units = units === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('units', units);
    updateUnitBtn();
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) await loadWeather(lastCity);
  });

  // gentle focus on H1 after first load
  function focusMainHeading() {
    const h1 = document.querySelector('h1');
    if (!h1) return;
    h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
    setTimeout(() => h1.removeAttribute('tabindex'), 100);
  }
  window.addEventListener('weather:loaded', focusMainHeading);

  
  new MutationObserver(() => {
    updateUnitBtn(); 
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) loadWeather(lastCity); 
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ========================
     INIT
  ======================== */
  updateUnitBtn();
  const savedCity = localStorage.getItem('lastCity') || 'Montreal';
  cityInput.value = savedCity;
  loadWeather(savedCity);
})();
