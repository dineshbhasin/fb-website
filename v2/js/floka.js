/* FrontBenchers v2 — Floka aesthetic interactions
   Vanilla JS, no dependencies. */

(function () {
  'use strict';

  // ── Nav scroll state ─────────────────────────────────────────
  const nav = document.querySelector('.nav');
  const toTop = document.querySelector('.totop');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 30);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── Mobile menu ─────────────────────────────────────────────
  const burger = document.querySelector('.nav__burger');
  const mobile = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.mobile-menu__close');
  const openMobile = () => { mobile.classList.add('is-open'); document.body.classList.add('body-lock'); };
  const closeMobile = () => { mobile.classList.remove('is-open'); document.body.classList.remove('body-lock'); };
  if (burger) burger.addEventListener('click', openMobile);
  if (closeBtn) closeBtn.addEventListener('click', closeMobile);
  if (mobile) mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));

  // ── Reveal on scroll ────────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ── Skill bars (about section) ──────────────────────────────
  const barIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill = e.target.querySelector('.about__bar-fill');
        if (fill && fill.dataset.percent) {
          fill.style.width = fill.dataset.percent;
        }
        barIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.about__bar-row').forEach(el => barIo.observe(el));

  // ── Animated counters ───────────────────────────────────────
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (target * eased).toFixed(decimals);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(animateCounter);
        counterIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-counter-section]').forEach(el => counterIo.observe(el));

  // ── Testimonial slider ──────────────────────────────────────
  const slides = document.querySelectorAll('.testi__slide');
  const prevBtn = document.querySelector('.testi__btn--prev');
  const nextBtn = document.querySelector('.testi__btn--next');
  let idx = 0;
  const show = (i) => {
    slides.forEach((s, n) => s.classList.toggle('is-active', n === i));
  };
  if (slides.length) {
    show(0);
    let auto = setInterval(() => { idx = (idx + 1) % slides.length; show(idx); }, 6500);
    const goPrev = () => { idx = (idx - 1 + slides.length) % slides.length; show(idx); };
    const goNext = () => { idx = (idx + 1) % slides.length; show(idx); };
    if (prevBtn) prevBtn.addEventListener('click', () => { goPrev(); clearInterval(auto); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goNext(); clearInterval(auto); });
  }

  // ── FAQ accordion ───────────────────────────────────────────
  document.querySelectorAll('.faq__item').forEach((item) => {
    const q = item.querySelector('.faq__q');
    q.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq__item.is-open').forEach(i => i.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
    });
  });

  // ── Year stamp ──────────────────────────────────────────────
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ── Web3Forms — Contact form ────────────────────────────────
  const cf = document.getElementById('contactForm');
  if (cf) {
    cf.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = cf.querySelector('[type="submit"]');
      const msg = cf.querySelector('.contact__msg');
      const orig = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = 'Sending…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(cf)))
        });
        const data = await res.json();
        if (data.success) {
          msg.textContent = '✓ Message sent. We\'ll be in touch within 24 hours.';
          msg.style.color = '#94D96B';
          cf.reset();
        } else {
          throw new Error(data.message || 'Failed');
        }
      } catch (err) {
        msg.textContent = '✗ Something went wrong. Email collabs@frontbenchersmarketing.com directly.';
        msg.style.color = '#FE6462';
      } finally {
        msg.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = orig;
      }
    });
  }

  // ── Web3Forms — Newsletter ──────────────────────────────────
  document.querySelectorAll('.newsletter-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const msg = form.querySelector('.foot__news-msg') || form.parentElement.querySelector('.foot__news-msg');
      btn.disabled = true;
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        const data = await res.json();
        if (data.success) {
          if (msg) { msg.textContent = '✓ You\'re subscribed.'; msg.style.color = '#94D96B'; }
          form.reset();
        } else {
          throw new Error(data.message || 'Failed');
        }
      } catch (err) {
        if (msg) { msg.textContent = '✗ Try again later.'; msg.style.color = '#FE6462'; }
      } finally {
        btn.disabled = false;
      }
    });
  });

})();
