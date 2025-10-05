// audit.js — accessible accordion for the Audit section (bilingual, auto-updates on lang change)
(() => {
  /* ========================
     SELECT MOUNT
  ======================== */
  const mount = document.getElementById('audit');
  if (!mount) return;

  /* ========================
     I18N (local au widget)
  ======================== */
  const getLang = () =>
    (document.documentElement.lang || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';

  const L = {
    en: {
      ariaLabel: 'Audit details',
      blocks: [
        {
          id: 'findings',
          title: 'Findings (summary)',
          html: `
            <h4>User Experience & Keyboard Navigation</h4>
            <ul>
              <li>Tab saturation: too many focusable elements (incl. decorative) → long, confusing journey.</li>
              <li>Essential CTAs not reliably keyboard-usable (Login, Subscribe, Purchase, Send).</li>
              <li>Focus/hover barely visible → hard to know "where I am".</li>
            </ul>
            <p><em>Impact:</em> partial blocking for users without a mouse, in fatigue/overload, or using AT.</p>

            <h4>Semantic Structure & ARIA</h4>
            <ul>
              <li>"DIV-soup": few semantic elements (header, nav, main, footer, section, article).</li>
              <li>No <code>h1</code>; overuse of <code>h2/h3</code> → confusing hierarchy.</li>
              <li>ARIA overused/misapplied → noisy for screen readers.</li>
            </ul>
            <p><em>Impact:</em> degraded accessibility tree; VO/NVDA overloaded; reduced comprehension.</p>

            <h4>Colors, Contrast & Themes</h4>
            <ul>
              <li>Headings insufficient contrast (~1.76–2.16) → WCAG AA fail.</li>
              <li>No dark mode → reduced visual comfort.</li>
            </ul>

            <h4>Images & Media</h4>
            <ul>
              <li><code>alt</code> present but misused (editorial copy instead of description).</li>
              <li>Hero/header images not mobile-first; homepage overly long (scroll fatigue).</li>
            </ul>

            <h4>Forms & Components</h4>
            <ul>
              <li>Submit & key actions not keyboard-operable.</li>
              <li>Animations without pause; login lacks hover/focus states.</li>
            </ul>

            <h4>Positive points (Tech/SEO)</h4>
            <ul>
              <li>Body text AAA contrast (~15.1).</li>
              <li>HTTPS + canonical, robots, sitemap, JSON-LD, Analytics present.</li>
            </ul>
          `
        },
        {
          id: 'solutions',
          title: 'Solutions (prioritized action plan)',
          html: `
            <h4>Quick wins</h4>
            <ul>
              <li>Smooth keyboard journey: visible focus, remove unnecessary stops, guarantee essential CTAs.</li>
              <li>Add “Skip to content”.</li>
              <li>Reduce ARIA noise; replace non-semantic divs where relevant.</li>
            </ul>

            <h4>Semantic refactoring</h4>
            <ul>
              <li>One <code>h1</code> per page; logical heading hierarchy.</li>
              <li>Use clear landmarks: <code>header</code>, <code>nav</code>, <code>main</code>, <code>footer</code>.</li>
              <li>Name menus/sections explicitly for SR users.</li>
            </ul>

            <h4>Components & forms</h4>
            <ul>
              <li>All forms usable without a mouse.</li>
              <li>Link errors to fields; clear messages.</li>
              <li>Reflect states (expanded/collapsed, pressed, loading).</li>
            </ul>

            <h4>Images, media & mobile</h4>
            <ul>
              <li>Alt-text strategy: describe what’s shown; mark decorative as empty.</li>
              <li>Optimize mobile images; limit excessive scrolling.</li>
              <li>Provide Pause for automatic animations.</li>
            </ul>

            <h4>Themes & comfort</h4>
            <ul>
              <li>Fix heading contrasts to meet AA.</li>
              <li>Add dark mode.</li>
              <li>Improve readability (line-height, measure).</li>
            </ul>

            <h4>Continuous QA</h4>
            <ul>
              <li>Automated checks (Lighthouse/Axe) + recurring manual tests (keyboard + SR).</li>
              <li>Test key journeys end-to-end (home → article → subscription → contact).</li>
              <li>Check small-screen accessibility.</li>
            </ul>
          `
        },
        {
          id: 'indicators',
          title: 'Success indicators',
          html: `
            <ul>
              <li>Login / Subscription / Purchase / Contact fully usable without a mouse.</li>
              <li>Clear, unique headings & landmarks; quieter SR output (no ARIA noise).</li>
              <li>AA contrast everywhere; dark mode operational.</li>
              <li>Lighthouse ≥ 95 (Accessibility) + Axe “no critical issues”.</li>
            </ul>
          `
        },
        {
          id: 'message',
          title: 'Key message',
          html: `
            <p><strong>“An inclusive media cannot rely solely on inclusive words: accessibility must live in the code, the components, and the user journeys.”</strong></p>
            <p>Our audit + fixes make inclusion truly usable — because everyone should be able to love you as much as we do. ❤️</p>
            <p style="margin-top:.5rem"><em>Accessibility isn’t only about compliance — it’s about care. Every fix is a small gesture of love toward readers who deserve comfort and dignity. 🌿</em></p>
          `
        }
      ]
    },
    fr: {
      ariaLabel: 'Détails de l’audit',
      blocks: [
        {
          id: 'findings',
          title: 'Constats (synthèse)',
          html: `
            <h4>Expérience & navigation clavier</h4>
            <ul>
              <li>Saturation de Tab : trop d’éléments focalisables (y compris décoratifs) → parcours long et confus.</li>
              <li>CTAs essentiels pas toujours utilisables au clavier (Connexion, S’abonner, Acheter, Envoyer).</li>
              <li>Focus/hover peu visibles → difficile de savoir « où je suis ».</li>
            </ul>
            <p><em>Impact :</em> blocages partiels pour les personnes sans souris, en fatigue/surcharge, ou utilisant des TA.</p>

            <h4>Structure sémantique & ARIA</h4>
            <ul>
              <li>“Soupe de DIV” : peu d’éléments sémantiques (header, nav, main, footer, section, article).</li>
              <li>Pas de <code>h1</code> ; sur-usage de <code>h2/h3</code> → hiérarchie confuse.</li>
              <li>ARIA sur-utilisée/mal appliquée → bruit pour les lecteurs d’écran.</li>
            </ul>
            <p><em>Impact :</em> arbre d’accessibilité dégradé ; VO/NVDA surchargés ; compréhension réduite.</p>

            <h4>Couleurs, contrastes & thèmes</h4>
            <ul>
              <li>Titres avec contraste insuffisant (~1,76–2,16) → échec WCAG AA.</li>
              <li>Pas de mode sombre → confort visuel réduit.</li>
            </ul>

            <h4>Images & médias</h4>
            <ul>
              <li><code>alt</code> présent mais mal utilisé (copie éditoriale au lieu de description).</li>
              <li>Images hero/header pas pensées mobile-first ; page d’accueil trop longue (fatigue de scroll).</li>
            </ul>

            <h4>Formulaires & composants</h4>
            <ul>
              <li>Actions clés non opérables au clavier.</li>
              <li>Animations sans pause ; login sans états hover/focus.</li>
            </ul>

            <h4>Points positifs (Tech/SEO)</h4>
            <ul>
              <li>Corps du texte avec contraste AAA (~15,1).</li>
              <li>HTTPS + canonical, robots, sitemap, JSON-LD, Analytics présents.</li>
            </ul>
          `
        },
        {
          id: 'solutions',
          title: 'Solutions (plan d’action priorisé)',
          html: `
            <h4>Gains rapides</h4>
            <ul>
              <li>Parcours clavier fluide : focus visible, retirer les arrêts inutiles, garantir les CTAs essentiels.</li>
              <li>Ajouter « Aller au contenu ».</li>
              <li>Réduire le bruit ARIA ; remplacer les divs non sémantiques quand pertinent.</li>
            </ul>

            <h4>Refactor sémantique</h4>
            <ul>
              <li>Un <code>h1</code> par page ; hiérarchie de titres logique.</li>
              <li>Landmarks clairs : <code>header</code>, <code>nav</code>, <code>main</code>, <code>footer</code>.</li>
              <li>Nommer explicitement menus/sections pour les lecteurs d’écran.</li>
            </ul>

            <h4>Composants & formulaires</h4>
            <ul>
              <li>Formulaires utilisables sans souris.</li>
              <li>Lier erreurs et champs ; messages clairs.</li>
              <li>Refléter les états (déployé/replié, pressé, en chargement).</li>
            </ul>

            <h4>Images, médias & mobile</h4>
            <ul>
              <li>Stratégie d’alt : décrire ce qui est montré ; marquer le décoratif vide.</li>
              <li>Optimiser les images mobile ; limiter le scroll excessif.</li>
              <li>Prévoir une pause pour les animations automatiques.</li>
            </ul>

            <h4>Thèmes & confort</h4>
            <ul>
              <li>Corriger les contrastes des titres pour atteindre AA.</li>
              <li>Ajouter un mode sombre.</li>
              <li>Améliorer la lisibilité (interligne, longueur de ligne).</li>
            </ul>

            <h4>QA continue</h4>
            <ul>
              <li>Vérifs auto (Lighthouse/Axe) + tests manuels récurrents (clavier + lecteur d’écran).</li>
              <li>Tester les parcours clés de bout en bout (accueil → article → abonnement → contact).</li>
              <li>Vérifier l’accessibilité sur petits écrans.</li>
            </ul>
          `
        },
        {
          id: 'indicators',
          title: 'Indicateurs de réussite',
          html: `
            <ul>
              <li>Connexion / Abonnement / Achat / Contact utilisables sans souris.</li>
              <li>Titres & repères clairs et uniques ; sortie lecteur d’écran plus calme (pas de bruit ARIA).</li>
              <li>Contraste AA partout ; mode sombre opérationnel.</li>
              <li>Lighthouse ≥ 95 (Accessibilité) + Axe « aucune criticité ».</li>
            </ul>
          `
        },
        {
          id: 'message',
          title: 'Message clé',
          html: `
            <p><strong>« Un média inclusif ne peut pas se contenter de mots inclusifs : l’accessibilité doit vivre dans le code, les composants et les parcours. »</strong></p>
            <p>Notre audit + nos correctifs rendent l’inclusion réellement utilisable — parce que chacun·e doit pouvoir vous aimer autant que nous. ❤️</p>
            <p style="margin-top:.5rem"><em>L’accessibilité n’est pas que de la conformité — c’est de l’attention. Chaque fix est un petit geste d’amour envers des lecteur·ices qui méritent confort et dignité. 🌿</em></p>
          `
        }
      ]
    }
  };

  /* ========================
     RENDER
  ======================== */
  function renderAccordion() {
    // Reset
    mount.innerHTML = '';

    const t = L[getLang()];
    const acc = document.createElement('div');
    acc.className = 'accordion';
    acc.setAttribute('role', 'group');
    acc.setAttribute('aria-label', t.ariaLabel);

    t.blocks.forEach((b, i) => {
      const item = document.createElement('div');
      item.className = 'acc-item';

      const btn = document.createElement('button');
      btn.className = 'acc-btn';
      btn.type = 'button';
      btn.id = `acc-btn-${b.id}`;
      btn.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      btn.setAttribute('aria-controls', `acc-panel-${b.id}`);
      btn.innerHTML = `<span>${b.title}</span><span class="chev" aria-hidden="true">›</span>`;

      const panel = document.createElement('div');
      panel.className = 'acc-panel';
      panel.id = `acc-panel-${b.id}`;
      panel.hidden = !(i === 0);
      panel.innerHTML = b.html;

      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });

      item.append(btn, panel);
      acc.append(item);
    });

    mount.appendChild(acc);
  }

  /* ========================
     INIT
  ======================== */
  renderAccordion();

  // Réagir si la langue de la page change (boutons FR/EN de ton site)
  new MutationObserver(() => {
    renderAccordion(); // re-render avec la langue courante
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
