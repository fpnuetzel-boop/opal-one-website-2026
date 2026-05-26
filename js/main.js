/* ============================================================
   OPAL ONE — Shared JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Nav scroll effect ───────────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ── Mobile hamburger menu ───────────────────────────────── */
  const hamburger  = document.querySelector('.nav-hamburger');
  const navMobile  = document.querySelector('.nav-mobile');

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navMobile.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close when a mobile link is clicked
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMobile.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMobile.classList.contains('open')) {
        hamburger.classList.remove('open');
        navMobile.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Active nav link ─────────────────────────────────────── */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isHome = (currentFile === '' || currentFile === 'index.html') && href === 'index.html';
    if (href === currentFile || isHome) {
      link.classList.add('active');
    }
  });

  /* ── IntersectionObserver — fade-in-up ──────────────────── */
  const fadeEls = document.querySelectorAll('.fade-in-up');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
    });
    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Orbital Services Timeline ──────────────────────────── */
  (function initOrbital() {
    const wrap = document.getElementById('orbital-services');
    if (!wrap) return;

    const ICON = {
      person:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      compass: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
      canvas:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="9" x2="12" y2="21"/></svg>`,
    };

    const SERVICES = [
      { id: 1, label: '01', title: 'Kulturcoaching',          icon: ICON.person,  relatedIds: [2, 3], text: '1:1-Begleitung für Menschen. Persönliche Reflexion, Haltungsarbeit und das Erkennen eigener Kommunikationsmuster. Direkt, ohne Unternehmenskontext.' },
      { id: 2, label: '02', title: 'Persönliches Zukunftsbild', icon: ICON.compass, relatedIds: [1, 3], text: 'Wer bist du jenseits deiner Rolle? Im 1:1-Gespräch entwickeln wir ein klares Bild deiner Stärken, Werte und Richtung — als Mensch, nicht als Funktion.' },
      { id: 3, label: '03', title: 'Zukunftsbild Canvas',     icon: ICON.canvas,  relatedIds: [1, 2], text: 'Ein strukturiertes Workshop-Format: Trends, Bedürfnisse, Risiken und deine Rolle — zusammengeführt in zwei Langzeitzielen und einer klaren Vision.' },
    ];

    wrap.innerHTML = `
      <div class="orb-stage" id="orb-stage">
        <div class="orb-ring" aria-hidden="true"></div>
        <div class="orb-center" aria-hidden="true">
          <div class="orb-center-ring orb-ring-1"></div>
          <div class="orb-center-ring orb-ring-2"></div>
          <div class="orb-center-inner"></div>
        </div>
        ${SERVICES.map(s => `
          <div class="orb-node" id="orb-node-${s.id}" data-id="${s.id}" role="listitem" tabindex="0" aria-label="${s.title}">
            <div class="orb-node-glow"></div>
            <div class="orb-node-btn">${s.icon}</div>
            <span class="orb-node-title">${s.title}</span>
          </div>
        `).join('')}
      </div>
      <div class="orb-detail" id="orb-detail" aria-live="polite"></div>
    `;

    const stage      = document.getElementById('orb-stage');
    const detailEl   = document.getElementById('orb-detail');
    const nodeEls    = SERVICES.map(s => ({ ...s, el: document.getElementById(`orb-node-${s.id}`) }));

    let angle      = 0;
    let autoRotate = true;
    let activeId   = null;
    let lastTs     = 0;

    function radius() {
      return window.innerWidth < 480 ? 115 : window.innerWidth < 768 ? 150 : 190;
    }

    function calcPos(idx, total, rot) {
      const a = ((idx / total) * 360 + rot) % 360;
      const r = (a * Math.PI) / 180;
      const R = radius();
      return {
        x:       R * Math.cos(r),
        y:       R * Math.sin(r),
        zIndex:  Math.round(100 + 50 * Math.cos(r)),
        opacity: Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(r)) / 2))),
      };
    }

    function render() {
      nodeEls.forEach((node, i) => {
        const p = calcPos(i, nodeEls.length, angle);
        node.el.style.transform = `translate(${p.x - 22}px, ${p.y - 22}px)`;
        if (activeId === null) {
          node.el.style.zIndex  = p.zIndex;
          node.el.style.opacity = p.opacity;
        } else if (activeId === node.id) {
          node.el.style.zIndex  = 200;
        }
      });
    }

    function tick(ts) {
      if (autoRotate && ts - lastTs > 40) {
        angle  = (angle + 0.28) % 360;
        lastTs = ts;
        render();
      }
      requestAnimationFrame(tick);
    }

    function showDetail(id) {
      const s       = SERVICES.find(x => x.id === id);
      const related = SERVICES.filter(x => s.relatedIds.includes(x.id));
      detailEl.innerHTML = `
        <div class="orb-detail-card">
          <div class="orb-detail-header">
            <span class="orb-detail-label">${s.label} / Leistung</span>
            <button class="orb-detail-close" id="orb-close" aria-label="Schließen">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <h3 class="orb-detail-title">${s.title}</h3>
          <p class="orb-detail-text">${s.text}</p>
          <div class="orb-detail-footer">
            ${related.length ? `
              <div class="orb-related-wrap">
                <span class="orb-related-label">Verbunden:</span>
                ${related.map(r => `<button class="orb-related-btn" data-id="${r.id}">${r.label} ${r.title}</button>`).join('')}
              </div>` : '<span></span>'}
            <a href="leistungen.html" class="orb-detail-link">
              Im Detail &nbsp;→
            </a>
          </div>
        </div>`;
      detailEl.classList.add('is-open');

      document.getElementById('orb-close').addEventListener('click', e => { e.stopPropagation(); deselect(); });
      detailEl.querySelectorAll('.orb-related-btn').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); setActive(parseInt(btn.dataset.id)); });
      });
    }

    function setActive(id) {
      if (activeId === id) { deselect(); return; }
      activeId   = id;
      autoRotate = false;
      const s    = SERVICES.find(x => x.id === id);

      nodeEls.forEach(n => {
        n.el.classList.remove('is-active', 'is-related', 'is-dim');
        if (n.id === id)                   { n.el.classList.add('is-active');  n.el.style.opacity = '1'; }
        else if (s.relatedIds.includes(n.id)) { n.el.classList.add('is-related'); n.el.style.opacity = '0.85'; }
        else                               { n.el.classList.add('is-dim');    n.el.style.opacity = '0.28'; }
      });
      showDetail(id);
    }

    function deselect() {
      activeId   = null;
      autoRotate = true;
      nodeEls.forEach(n => { n.el.classList.remove('is-active', 'is-related', 'is-dim'); n.el.style.opacity = ''; });
      detailEl.classList.remove('is-open');
      setTimeout(() => { if (!detailEl.classList.contains('is-open')) detailEl.innerHTML = ''; }, 450);
    }

    nodeEls.forEach(node => {
      node.el.addEventListener('click', e => { e.stopPropagation(); setActive(node.id); });
      node.el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(node.id); } });
    });
    stage.addEventListener('click', () => { if (activeId !== null) deselect(); });

    render();
    requestAnimationFrame(tick);
  })();

  /* ── Contact form (Formspree) ────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  const formSuccess  = document.getElementById('form-success');

  // Replace FORMSPREE_ID below with your Formspree form ID (e.g. "xabcdefg")
  // Get it at https://formspree.io → New Form → copy the ID from the endpoint URL
  const FORMSPREE_ID = 'xlgvbodo';

  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Wird gesendet …';

      try {
        const response = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          contactForm.style.display = 'none';
          if (formSuccess) {
            formSuccess.classList.add('visible');
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          btn.disabled = false;
          btn.textContent = 'Nachricht senden';
          alert('Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut oder schreiben Sie direkt an f.p.nuetzel@gmail.com');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Nachricht senden';
        alert('Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung oder schreiben Sie direkt an f.p.nuetzel@gmail.com');
      }
    });
  }

})();
