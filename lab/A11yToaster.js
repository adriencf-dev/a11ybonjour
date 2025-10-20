// /lab/A11yToaster.js
const React = globalThis.React;
const ReactDOM = globalThis.ReactDOM;

export function A11yToaster() {
  const [toasts, setToasts] = React.useState([]);
  const liveRef = React.useRef(null);
  const idRef = React.useRef(0);
  const portalRef = React.useRef(null);

  
  React.useEffect(() => {
    const el = document.createElement('div');
    el.className = 'toaster-stack';
    document.body.appendChild(el);
    portalRef.current = el;
    return () => { document.body.removeChild(el); };
  }, []);

  function push(msg = 'Saved successfully.') {
    const id = ++idRef.current;
    setToasts(ts => [...ts, { id, msg }]);
    if (liveRef.current) liveRef.current.textContent = msg; 
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000);
  }

  return React.createElement(
    React.Fragment,
    null,
    
    React.createElement('button', { className: 'btn', onClick: () => push() }, 'Show message'),
    React.createElement('p', { ref: liveRef, className: 'visually-hidden', 'aria-live': 'polite' }, 'Ready.'),

    
    portalRef.current && ReactDOM.createPortal(
      React.createElement(
        React.Fragment,
        null,
        toasts.map(t => React.createElement(
          'div',
          { key: t.id, className: 'card toast-card', role: 'status' },
          t.msg
        ))
      ),
      portalRef.current
    )
  );
}
