// /lab/A11yCombo.js
const React = globalThis.React;

const ITEMS = ['Dialog', 'Combobox', 'Toaster', 'View Transitions', 'Popover', 'Container Queries', 'Scroll Animations', 'Web Audio', 'Web Speech'];

export function A11yCombo() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);
  const idBase = 'rx-combo';

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ITEMS.filter(x => x.toLowerCase().includes(q)) : ITEMS;
  }, [query]);

  React.useEffect(() => {
    // fermer si clic hors
    const onDoc = (e) => {
      if (!listRef.current || !inputRef.current) return;
      if (listRef.current.contains(e.target) || inputRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  function onKey(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); return; }
    if (!open) return;
    if (e.key === 'ArrowDown') { setActiveIdx(i => Math.min(i + 1, results.length - 1)); e.preventDefault(); }
    if (e.key === 'ArrowUp')   { setActiveIdx(i => Math.max(i - 1, 0)); e.preventDefault(); }
    if (e.key === 'Home')      { setActiveIdx(0); e.preventDefault(); }
    if (e.key === 'End')       { setActiveIdx(results.length - 1); e.preventDefault(); }
    if (e.key === 'Escape')    { setOpen(false); e.preventDefault(); }
    if (e.key === 'Enter')     { choose(results[activeIdx]); e.preventDefault(); }
  }

  function choose(val) {
    setQuery(val);
    setOpen(false);
    inputRef.current?.focus();
  }

  const listId = `${idBase}-list`;
  const actId  = `${idBase}-opt-${activeIdx}`;

  return React.createElement('div', { className: 'island-combo', style: { position: 'relative', maxWidth: '28rem' } },
    React.createElement('label', { htmlFor: `${idBase}-input` }, 'Find component'),
    React.createElement('input', {
      id: `${idBase}-input`,
      ref: inputRef,
      type: 'text',
      role: 'combobox',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': listId,
      'aria-autocomplete': 'list',
      'aria-activedescendant': open && results.length ? actId : undefined,
      value: query,
      onChange: e => { setQuery(e.target.value); setOpen(true); setActiveIdx(0); },
      onKeyDown: onKey,
      autoComplete: 'off'
    }),
    open && results.length > 0 && React.createElement('ul', {
      id: listId,
      role: 'listbox',
      ref: listRef,
      style: { position: 'absolute', inset: 'auto 0 0 0', transform: 'translateY(100%)', background: '#0f1318', border: '1px solid #29303a', borderRadius: 10, padding: 6, margin: 4, listStyle: 'none', zIndex: 20, maxHeight: '240px', overflow: 'auto' }
    },
      results.map((item, i) => React.createElement('li', {
        id: `${idBase}-opt-${i}`,
        key: item,
        role: 'option',
        'aria-selected': i === activeIdx ? 'true' : 'false',
        onMouseEnter: () => setActiveIdx(i),
        onMouseDown: (e) => { e.preventDefault(); choose(item); },
        style: { padding: '6px 8px', borderRadius: 8, background: i === activeIdx ? '#1a1f26' : 'transparent', cursor: 'pointer' }
      }, item))
    )
  );
}

// --- A11yCombo: roving tabindex + Enter select ---
export function mountA11yCombo(root) {
  const input = root.querySelector('[role="combobox"]');
  const list  = root.querySelector('[role="listbox"]');
  const opts  = Array.from(list.querySelectorAll('[role="option"]'));
  let i = -1;

  function setActive(n) {
    i = Math.max(0, Math.min(n, opts.length - 1));
    opts.forEach((el, idx) => {
      el.tabIndex = idx === i ? 0 : -1;
      el.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    });
    opts[i]?.focus();
    input.setAttribute('aria-activedescendant', opts[i]?.id || '');
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); input.setAttribute('aria-expanded', 'true'); setActive(i < 0 ? 0 : i + 1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); input.setAttribute('aria-expanded', 'true'); setActive(i < 0 ? 0 : i - 1); }
    if (e.key === 'Enter' && i >= 0) { e.preventDefault(); input.value = opts[i].textContent.trim(); input.setAttribute('aria-expanded', 'false'); }
  });

  list.addEventListener('click', (e) => {
    const li = e.target.closest('[role="option"]');
    if (!li) return;
    input.value = li.textContent.trim();
    input.setAttribute('aria-expanded', 'false');
    input.focus();
  });


  input.addEventListener('input', () => input.setAttribute('aria-expanded', 'true'));
  input.addEventListener('focus', () => input.setAttribute('aria-expanded', 'true'));
}

