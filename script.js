/* ============================================================
   MOMINA ASIF — PORTFOLIO
   script.js
   ============================================================ */

'use strict';

/* ===== UTILITY ===== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ===== NAVBAR ===== */
(function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');

  // Scroll state
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close menu on link click
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav link on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        $$('.nav-link').forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ===== SCROLL REVEAL ===== */
(function initScrollReveal() {
  const elements = $$('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Honour CSS animation-delay if set via inline style --delay
        const delay = el.style.getPropertyValue('--delay') || '0s';
        if (delay !== '0s') {
          el.style.transitionDelay = delay;
        }
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
})();

/* ===== PORTFOLIO FILTER ===== */
(function initPortfolioFilter() {
  const filterBtns = $$('.filter-btn');
  const cards = $$('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          // Re-animate
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ===== VIDEO MODAL ===== */
(function initVideoModal() {
  const modal = $('#videoModal');
  const backdrop = $('#modalBackdrop');
  const closeBtn = $('#modalClose');
  const modalVideo = $('#modalVideo');

  $$('.video-card').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.video;
      if (!src) return;

      const source = modalVideo.querySelector('source');
      source.src = src;
      modalVideo.load();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => modalVideo.play(), 300);
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modalVideo.pause();
    modalVideo.currentTime = 0;
    const source = modalVideo.querySelector('source');
    source.src = '';
  }

  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();

/* ===== TESTIMONIALS SLIDER ===== */
(function initSlider() {
  const track = $('#testimonialsTrack');
  const prevBtn = $('#sliderPrev');
  const nextBtn = $('#sliderNext');
  const dotsContainer = $('#sliderDots');

  if (!track) return;

  const cards = $$('.testimonial-card', track);
  let current = 0;
  let autoplayTimer;

  // Calculate visible count based on viewport
  function getVisible() {
    if (window.innerWidth < 700) return 1;
    if (window.innerWidth < 1000) return 1;
    return 3;
  }

  let visibleCount = getVisible();
  const total = cards.length;

  function buildDots() {
    dotsContainer.innerHTML = '';
    const numDots = Math.ceil(total / visibleCount);
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    const maxIndex = Math.ceil(total / visibleCount) - 1;
    current = Math.max(0, Math.min(index, maxIndex));

    const cardW = cards[0].offsetWidth + 24; // gap 24px
    track.style.transform = `translateX(-${current * visibleCount * cardW}px)`;

    $$('.dot', dotsContainer).forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() {
    const maxIndex = Math.ceil(total / visibleCount) - 1;
    goTo(current < maxIndex ? current + 1 : 0);
  }

  function prev() {
    const maxIndex = Math.ceil(total / visibleCount) - 1;
    goTo(current > 0 ? current - 1 : maxIndex);
  }

  prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });

  function startAutoplay() {
    autoplayTimer = setInterval(next, 5000);
  }
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      resetAutoplay();
    }
  });

  function init() {
    visibleCount = getVisible();

    // Set card widths
    const containerW = track.parentElement.offsetWidth;
    const gap = 24;
    const cardW = visibleCount === 1
      ? containerW
      : (containerW - gap * (visibleCount - 1)) / visibleCount;

    cards.forEach(card => {
      card.style.flex = `0 0 ${cardW}px`;
    });

    buildDots();
    goTo(0);
  }

  window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(init, 150);
  });

  init();
  startAutoplay();
})();

/* ===== CONTACT FORM ===== */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    // Simulate send (replace with real form submission)
    setTimeout(() => {
      btn.innerHTML = '<span>Message Sent ✦</span>';
      btn.style.background = '#2D6A4F';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    }, 1500);
  });
})();

/* ===== PARALLAX SHAPES ===== */
(function initParallax() {
  const shapes = $$('.shape');
  if (!shapes.length) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        shapes.forEach((shape, i) => {
          const speed = 0.05 + i * 0.02;
          const dir = i % 2 === 0 ? 1 : -1;
          shape.style.transform = `translateY(${y * speed * dir}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ===== SMOOTH SCROLL for anchor links ===== */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

/* ===== HERO TEXT ANIMATION ON LOAD ===== */
(function initHeroAnimation() {
  // Trigger hero reveal elements after a short delay
  const heroReveals = $$('.hero .reveal-up, .hero .reveal-right');

  setTimeout(() => {
    heroReveals.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, i * 120);
    });
  }, 200);
})();

/* ===== NUMBER COUNTER for stats ===== */
(function initCounters() {
  const stats = $$('.stat-num');
  if (!stats.length) return;

  const counters = stats.map(el => {
    const text = el.textContent;
    const match = text.match(/(\d+)/);
    return {
      el,
      target: match ? parseInt(match[1]) : 0,
      suffix: text.replace(/\d+/, ''),
      done: false,
    };
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const counter = counters.find(c => c.el === entry.target);
      if (!counter || counter.done) return;
      counter.done = true;

      const duration = 1800;
      const startTime = performance.now();
      const start = 0;

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(start + (counter.target - start) * ease);
        counter.el.textContent = value + counter.suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();

/* ===== CURSOR GLOW (desktop only) ===== */
(function initCursorGlow() {
  if (window.innerWidth < 900) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;
    width:300px;height:300px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(75,56,50,0.06) 0%, transparent 70%);
    pointer-events:none;
    z-index:0;
    transform:translate(-50%,-50%);
    transition:opacity 0.3s;
    opacity:0;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

  function animate() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    rafId = requestAnimationFrame(animate);
  }
  animate();
})();

/* ===== LAZY IMAGE LOADING fallback ===== */
(function initLazyImages() {
  const images = $$('img[loading="lazy"]');
  if ('IntersectionObserver' in window) return; // browser handles it natively

  images.forEach(img => {
    img.src = img.dataset.src || img.src;
  });
})();

console.log('%c✦ Momina Asif Portfolio', 'color:#4B3832;font-size:16px;font-weight:bold;');
console.log('%cDesigned with ♥', 'color:#D4A5A5;font-size:12px;');
