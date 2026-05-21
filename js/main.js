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

  /* ── Contact form (Formspree) ────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  const formSuccess  = document.getElementById('form-success');

  // Replace FORMSPREE_ID below with your Formspree form ID (e.g. "xabcdefg")
  // Get it at https://formspree.io → New Form → copy the ID from the endpoint URL
  const FORMSPREE_ID = 'FORMSPREE_ID';

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
