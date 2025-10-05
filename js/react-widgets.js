(() => {
    const { useEffect, useState } = React;
  
    /** Util: set text safely (no nested buttons rendered) */
    function setButtonContent(btn, text) {
      if (!btn) return;
      btn.textContent = text;
    }
  
    /** BackToTop controls existing #scrollTopBtn */
    function UseBackToTop({ hostId = 'scrollTopBtn' }) {
      const [visible, setVisible] = useState(false);
  
      useEffect(() => {
        const btn = document.getElementById(hostId);
        if (!btn) return;
  
        const onScroll = () => setVisible(window.scrollY > 180);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
  
        const onClick = (e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        btn.addEventListener('click', onClick);
  
        // Accessibilité minimale + contenu
        btn.setAttribute('aria-label', 'Back to top');
        setButtonContent(btn, '↑');
  
        return () => {
          window.removeEventListener('scroll', onScroll);
          btn.removeEventListener('click', onClick);
        };
      }, [hostId]);
  
      useEffect(() => {
        const btn = document.getElementById(hostId);
        if (!btn) return;
        // Affiche/masque sans casser ton style existant
        btn.style.opacity = visible ? '1' : '0';
        btn.style.pointerEvents = visible ? 'auto' : 'none';
      }, [visible, hostId]);
  
      return null; // ⚠️ rien n’est rendu, on pilote l’élément existant
    }
  
    /** Pink noise controls existing #pinkNoiseBtn + #pinkNoise */
    function UsePinkNoise({ btnId = 'pinkNoiseBtn', audioId = 'pinkNoise' }) {
      const [playing, setPlaying] = useState(false);
  
      useEffect(() => {
        const btn = document.getElementById(btnId);
        const audio = document.getElementById(audioId);
        if (!btn || !audio) return;
  
        audio.volume = 0.25;
  
        const toggle = async () => {
          try {
            if (!playing) {
              await audio.play();
              setPlaying(true);
            } else {
              audio.pause();
              audio.currentTime = 0;
              setPlaying(false);
            }
          } catch (e) {
            console.warn('Pink noise play error:', e);
          }
        };
  
        btn.addEventListener('click', toggle);
  
        // Init a11y + contenu
        btn.title = 'Pink noise';
        btn.classList.add('btn-icon', 'pink-noise-btn');
  
        return () => btn.removeEventListener('click', toggle);
      }, [btnId, audioId, playing]);
      
      React.useEffect(() => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
      
        btn.setAttribute(
          'aria-label',
          playing ? 'Stop pink noise' : 'Play pink noise for relaxation'
        );
      
        // on garde ton visuel CSS : triangle / pause
        btn.classList.toggle('pause', playing);
      }, [playing, btnId]);
      
    }
  
    function mountHooks() {
      // On crée une racine React “invisible” juste pour nos hooks
      const mount = document.createElement('div');
      mount.id = 'react-widgets-hook-root';
      document.body.appendChild(mount);
  
      const App = () => {
        return React.createElement(React.Fragment, null,
          React.createElement(UseBackToTop, null),
          React.createElement(UsePinkNoise, null)
        );
      };
  
      const root = ReactDOM.createRoot(mount);
      root.render(React.createElement(App));
    }
  
    document.addEventListener('DOMContentLoaded', mountHooks);
  })();
  