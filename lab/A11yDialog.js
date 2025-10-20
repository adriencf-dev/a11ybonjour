// /lab/A11yDialog.js
const React = globalThis.React;

export function A11yDialog() {
  const [open, setOpen] = React.useState(false);
  const dialogRef = React.useRef(null);
  const openerRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    root.setAttribute('data-popover-open', ''); 

    
    const first =
      dialogRef.current?.querySelector('[data-autofocus]') ||
      dialogRef.current?.querySelector(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
      );
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      if (e.key === 'Tab') trapFocus(e);
    };
    dialogRef.current?.addEventListener('keydown', onKey);

    return () => {
      dialogRef.current?.removeEventListener('keydown', onKey);
      root.removeAttribute('data-popover-open');
    };
  }, [open]);

  function openDialog(e) {
    openerRef.current = e?.currentTarget || document.activeElement;
    setOpen(true);
  }

  function close() {
    setOpen(false);
    
    setTimeout(() => openerRef.current?.focus(), 0);
  }

  function trapFocus(e) {
    const f = dialogRef.current?.querySelectorAll(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    if (!f || !f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  return React.createElement(
    'div',
    { className: 'island-dialog' },

    
    React.createElement('button', {
      type: 'button',
      className: 'btn',
      onClick: openDialog,
      'aria-haspopup': 'dialog',
      'aria-controls': 'rx-dialog'
    }, 'Open dialog'),

   
    open && React.createElement('div', {
      onClick: close,
      'aria-hidden': 'true',
      style: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.4)',
        zIndex: 10999, 
        pointerEvents: 'auto'
      }
    }),

    // Dialog
    open && React.createElement(
      'div',
      {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'rx-dialog-title',
        id: 'rx-dialog',
        className: 'card',
        ref: dialogRef,
        style: {
          position: 'fixed',
          inset: '50% auto auto 50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 11000,
          maxWidth: 'min(90vw, 560px)',
          pointerEvents: 'auto'
        }
      },
      React.createElement('h4', { id: 'rx-dialog-title', style: { marginTop: 0 } }, 'Accessible Dialog'),
      React.createElement('p', null, 'Focus trap, Escape to close, backdrop click closes.'),
      React.createElement('div', { style: { display: 'flex', gap: '.5rem', justifyContent: 'flex-end' } },
        React.createElement('button', {
          type: 'button',
          className: 'btn ghost',
          onClick: close,
          'data-autofocus': ''
        }, 'Close')
      )
    )
  );
}
