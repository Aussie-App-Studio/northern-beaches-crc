(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     Sticky Header Scroll State (Homepage hero -> frosted ivory)
     ------------------------------------------------------------------------ */
  const header = document.querySelector('.site-header');
  const getScrollTop = () => window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

  if (header) {
    const updateHeaderState = () => {
      if (getScrollTop() > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    document.addEventListener('scroll', updateHeaderState, { passive: true, capture: true });
    window.addEventListener('hashchange', updateHeaderState);
  }

  /* ------------------------------------------------------------------------
     Desktop Dropdown Accessibility (Hover, Click, Escape, Outside Click)
     ------------------------------------------------------------------------ */
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const setDropdownState = (dd, isOpen) => {
    dd.classList.toggle('is-open', isOpen);
    const btn = dd.querySelector('.dropdown-toggle');
    if (btn) btn.setAttribute('aria-expanded', String(isOpen));
  };

  const closeAllDropdowns = () => {
    dropdowns.forEach((dd) => setDropdownState(dd, false));
  };

  dropdowns.forEach((dd) => {
    const btn = dd.querySelector('.dropdown-toggle');
    if (!btn) return;
    let openedByHoverAt = 0;

    dd.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const wasOpen = dd.classList.contains('is-open');
        closeAllDropdowns();
        setDropdownState(dd, true);
        if (!wasOpen) openedByHoverAt = Date.now();
      }
    });

    dd.addEventListener('mouseleave', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        openedByHoverAt = 0;
        setDropdownState(dd, false);
      }
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dd.classList.contains('is-open');
      if (isOpen && Date.now() - openedByHoverAt < 350) {
        openedByHoverAt = 0;
        return;
      }
      openedByHoverAt = 0;
      closeAllDropdowns();
      if (!isOpen) {
        setDropdownState(dd, true);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      closeAllDropdowns();
    }
  });

  /* ------------------------------------------------------------------------
     Mobile Slide-in Drawer
     ------------------------------------------------------------------------ */
  const menuToggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('mobile-drawer-close');
  const backdrop = document.getElementById('mobile-backdrop');

  const setDrawerOpen = (open) => {
    if (!drawer || !backdrop || !menuToggle) return;
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('drawer-open', open);

    if (open && drawerClose) {
      drawerClose.focus();
    } else if (!open) {
      menuToggle.focus();
    }
  };

  if (menuToggle && drawer && backdrop) {
    menuToggle.addEventListener('click', () => setDrawerOpen(true));
    if (drawerClose) drawerClose.addEventListener('click', () => setDrawerOpen(false));
    backdrop.addEventListener('click', () => setDrawerOpen(false));
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
      if (drawer && drawer.classList.contains('is-open')) {
        setDrawerOpen(false);
      }
    }
  });

  /* ------------------------------------------------------------------------
     Scroll Reveal (IntersectionObserver + jump-scroll safety check)
     ------------------------------------------------------------------------ */
  const reveals = document.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealVisibleOrAbove = () => {
    const cutoff = window.innerHeight * 0.96;
    reveals.forEach((el) => {
      if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top <= cutoff) {
        el.classList.add('is-visible');
      }
    });
  };

  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight * 0.96) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
    revealVisibleOrAbove();
    window.addEventListener('scroll', revealVisibleOrAbove, { passive: true });
    document.addEventListener('scroll', revealVisibleOrAbove, { passive: true, capture: true });
  }

  /* ------------------------------------------------------------------------
     Lazy YouTube Click-to-Play Facades (Delegated for dynamic cards too)
     ------------------------------------------------------------------------ */
  const mountVideoIframe = (facade) => {
    const videoId = facade.dataset.youtubeId;
    if (!videoId || facade.dataset.mounted === 'true') return;

    const title = facade.dataset.title || 'Church Sermon Video';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    iframe.title = title;
    iframe.loading = 'eager';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    facade.dataset.mounted = 'true';
    facade.replaceChildren(iframe);
  };

  document.addEventListener('click', (e) => {
    const facade = e.target.closest('.video-facade');
    if (facade) {
      e.preventDefault();
      mountVideoIframe(facade);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const facade = e.target.closest('.video-facade');
      if (facade && !e.target.closest('iframe')) {
        e.preventDefault();
        mountVideoIframe(facade);
      }
    }
  });

  /* ------------------------------------------------------------------------
     Accessible Accordions (e.g. TULIP / Doctrines of Grace)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  /* ------------------------------------------------------------------------
     Contact Form Handler (Client-side validation + Mailto + Copy Fallback)
     Note: When moving to the official domain, you can optionally point this
     form's action to Formspree/Web3Forms for direct server-side submission.
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const statusBox = document.getElementById('contact-status');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName = contactForm.querySelector('#first-name').value.trim();
      const lastName = contactForm.querySelector('#last-name').value.trim();
      const email = contactForm.querySelector('#contact-email').value.trim();
      const phone = contactForm.querySelector('#contact-phone').value.trim();
      const message = contactForm.querySelector('#contact-message').value.trim();

      if (!firstName || !lastName || !email || !message) {
        if (statusBox) {
          statusBox.hidden = false;
          statusBox.className = 'form-status form-status--error';
          statusBox.textContent = 'Please complete your first name, last name, email address, and message before sending.';
        }
        return;
      }

      const fullName = `${firstName} ${lastName}`;
      const subject = encodeURIComponent(`Website Enquiry from ${fullName}`);
      const bodyLines = [
        `Name: ${fullName}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        '',
        'Message:',
        message
      ].filter((line) => line !== null);

      const mailtoUrl = `mailto:crcdeewhy@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      if (statusBox) {
        statusBox.hidden = false;
        statusBox.className = 'form-status';
        statusBox.innerHTML = `
          <p style="margin-bottom: 0.65rem; color: #1f3b32;"><strong>Thank you, ${escapeHtml(firstName)}.</strong> Your email app should open with your message addressed to <strong>crcdeewhy@gmail.com</strong>.</p>
          <div class="btn-group">
            <a class="btn btn-navy btn-sm" href="${mailtoUrl}">Open Email Draft</a>
            <button type="button" class="btn btn-outline btn-sm" id="copy-church-email">Copy crcdeewhy@gmail.com</button>
          </div>
        `;

        const copyBtn = document.getElementById('copy-church-email');
        if (copyBtn && navigator.clipboard) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('crcdeewhy@gmail.com').then(() => {
              copyBtn.textContent = 'Email Copied!';
            });
          });
        }
      }

      window.location.href = mailtoUrl;
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
