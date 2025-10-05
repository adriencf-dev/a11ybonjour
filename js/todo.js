(() => {
  /* ========================
     HELPERS
  ======================== */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const uid = () => crypto.randomUUID();
  const now = () => new Date().toISOString();

  // Lang helpers
  const getLang = () =>
    (document.documentElement.lang || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';

  const plural = (n, one, many) => (n === 1 ? one : many);

  const L = {
    en: {
      emptyCount: '', 
      renameTitle: 'Double-click to rename',
      markDone: (t) => `Mark “${t}” as done`,
      markUndone: (t) => `Mark “${t}” as not done`,
      del: (t) => `Delete “${t}”`,
      count: (total, remaining) =>
        `${total} task${total === 1 ? '' : 's'} (${remaining} remaining)`
    },
    fr: {
      emptyCount: '', 
      renameTitle: 'Double-clique pour renommer',
      markDone: (t) => `Marquer « ${t} » comme faite`,
      markUndone: (t) => `Marquer « ${t} » comme non faite`,
      del: (t) => `Supprimer « ${t} »`,
      count: (total, remaining) =>
        `${total} ${plural(total, 'tâche', 'tâches')} (${remaining} ${plural(remaining, 'restante', 'restantes')})`
    }
  };

  const TXT = () => L[getLang()];

  /* ========================
     DOMAIN
  ======================== */
  function createTask(text){
    const t = (text ?? '').trim();
    if (!t) throw new Error('Task is empty');
    return { id: uid(), text: t, done: false, createdAt: now() };
  }
  const addTask = (list, task) => [...list, task];
  const removeTask = (list, id) => list.filter(t => t.id !== id);
  const toggleTask = (list, id) => list.map(t => t.id === id ? { ...t, done: !t.done } : t);
  function renameTask(list, id, newText){
    const nt = (newText ?? '').trim();
    if (!nt) return list;
    return list.map(t => t.id === id ? { ...t, text: nt } : t);
  }

  /* ========================
     STATE
  ======================== */
  let state = { tasks: [] };

  const els = {
    list: $('#todo-list'),
    empty: $('#empty'),
    count: $('#task-count'),
    form: $('#todo-form'),
    input: $('#todo-input'),
  };

  function persist(){
    try { localStorage.setItem('tasks', JSON.stringify(state.tasks)); }
    catch(e){ console.warn('persist failed', e); }
  }
  function load(){
    try{
      const saved = JSON.parse(localStorage.getItem('tasks') || '[]');
      state.tasks = Array.isArray(saved) ? saved : [];
    }catch{ state.tasks = []; }
  }
  function setState(next){
    state = { ...state, ...next };
    persist();
    render();
  }

  /* ========================
     RENDER
  ======================== */
  function render(){
    const { tasks } = state;
    els.list.innerHTML = '';

    if (!tasks.length){
      els.empty.hidden = false;
      els.count.textContent = TXT().emptyCount; 
      return;
    }

    els.empty.hidden = true;
    const frag = document.createDocumentFragment();

    for (const t of tasks){
      const li = document.createElement('li');
      li.dataset.id = t.id;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = t.done;
      cb.setAttribute('aria-label', t.done ? TXT().markUndone(t.text) : TXT().markDone(t.text));
      cb.addEventListener('change', () => setState({ tasks: toggleTask(state.tasks, t.id) }));

      const span = document.createElement('span');
      span.textContent = t.text;
      span.className = t.done ? 'done' : '';
      span.tabIndex = 0;
      span.title = TXT().renameTitle;
      span.addEventListener('dblclick', () => startEdit(li, t));
      span.addEventListener('keydown', e => { if (e.key === 'Enter') startEdit(li, t); });

      const del = document.createElement('button');
      del.className = 'icon-btn';
      del.textContent = '❌';
      del.setAttribute('aria-label', TXT().del(t.text));
      del.addEventListener('click', () => setState({ tasks: removeTask(state.tasks, t.id) }));

      li.append(cb, span, del);
      frag.append(li);
    }

    els.list.append(frag);

    const remaining = tasks.filter(t => !t.done).length;
    els.count.textContent = TXT().count(tasks.length, remaining);
  }

  /* ========================
     EDIT
  ======================== */
  function startEdit(li, task){
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') finish();
      if (e.key === 'Escape') render();
    });
    input.addEventListener('blur', finish);

    const span = li.querySelector('span');
    li.replaceChild(input, span);
    input.focus();

    function finish(){
      setState({ tasks: renameTask(state.tasks, task.id, input.value) });
    }
  }

  /* ========================
     EVENTS
  ======================== */
  els.form.addEventListener('submit', e => {
    e.preventDefault();
    try{
      const text = els.input.value;
      const task = createTask(text);
      setState({ tasks: addTask(state.tasks, task) });
      els.input.value = '';
      els.input.focus();
    }catch(err){
      console.warn(err.message);
    }
  });

  
  new MutationObserver(() => render())
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ========================
     INIT
  ======================== */
  load();
  render();
})();
