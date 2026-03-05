/* ============================================================
   MAIN JS — Apex Consulting
   ============================================================ */

(function () {
  'use strict';

  /* ---- NAVBAR: scroll-based style ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- MOBILE MENU ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) &&
          !hamburger.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---- CASE STUDY FILTER ---- */
  const filterTabs = document.getElementById('filterTabs');
  const casesGrid = document.getElementById('casesGrid');
  if (filterTabs && casesGrid) {
    const cards = casesGrid.querySelectorAll('.case-card');

    filterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      // Update active tab
      filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      cards.forEach(card => {
        const cats = card.dataset.category || '';
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  }

  /* ---- FAQ ACCORDION ---- */
  const faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;

      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      // Close all
      faqList.querySelectorAll('.faq-question').forEach(q => {
        q.setAttribute('aria-expanded', 'false');
        q.nextElementSibling.classList.remove('open');
      });

      // Open clicked (toggle)
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  }

  /* ---- CONTACT FORM ---- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      let valid = true;
      const required = contactForm.querySelectorAll('[required]');
      required.forEach(field => {
        field.classList.remove('error');
        if (field.type === 'checkbox') {
          if (!field.checked) {
            valid = false;
            field.closest('.checkbox-item').style.outline = '2px solid #ef4444';
          } else {
            field.closest('.checkbox-item').style.outline = '';
          }
        } else if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      // Email format check
      const emailField = document.getElementById('email');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('error');
        valid = false;
      }

      if (!valid) {
        const firstError = contactForm.querySelector('.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Simulate submission (replace with your Azure Function / API endpoint)
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      await new Promise(resolve => setTimeout(resolve, 1200));

      // Show success
      contactForm.style.display = 'none';
      formSuccess.textContent = '✅ Thank you! Your message has been sent. A senior consultant will reach out within 24 hours.';
      formSuccess.classList.add('visible');
      formSuccess.style.display = 'block';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---- SCROLL ANIMATIONS ---- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll(
      '.service-card, .why-metric-card, .industry-chip, .testimonial-card, ' +
      '.case-card, .team-card, .office-card, .value-card, .engagement-card, ' +
      '.timeline-item, .faq-item, .info-block'
    ).forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  /* ---- ADD animate-in CSS via JS for IntersectionObserver ---- */
  const style = document.createElement('style');
  style.textContent = '.animate-in { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

  /* ---- SMOOTH SCROLL for anchor links ---- */
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const targetId = href.substring(hashIndex + 1);
      const targetEl = document.getElementById(targetId);

      // Only handle same-page anchors
      const pagePath = href.substring(0, hashIndex) || window.location.pathname.split('/').pop();
      const currentPage = window.location.pathname.split('/').pop();
      if (pagePath && pagePath !== currentPage && pagePath !== '') return;

      if (targetEl) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 20 : 80;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- COUNTER ANIMATION for hero stats ---- */
  function animateCounter(el, target, suffix, duration) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + suffix;
    }

    requestAnimationFrame(update);
  }

  const heroStats = document.querySelectorAll('.stat-num');
  if (heroStats.length) {
    const data = [
      { target: 200, suffix: '+' },
      { target: 2.4, suffix: 'B', isCurrency: true },
      { target: 18, suffix: '+' },
      { target: 96, suffix: '%' },
    ];

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const stat = data[i];
          if (stat) {
            if (stat.isCurrency) {
              entry.target.textContent = '$2.4B';
            } else {
              animateCounter(entry.target, stat.target, stat.suffix, 1500);
            }
          }
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    heroStats.forEach(stat => statsObserver.observe(stat));
  }

})();
