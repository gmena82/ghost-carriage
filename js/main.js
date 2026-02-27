/* ============================================================
   GHOST CARRIAGE — main.js
   Canvas Background · Custom Cursor · GSAP Animations · Nav
   ============================================================ */

/* ─── Helpers ─── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ═══════════════════════════════════════════════════════════
   1. CANVAS — Liquid Shadow Mesh (cursor-reactive)
   ═══════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let animId;

  /* Mesh nodes */
  const NODE_COUNT = 7;
  const nodes = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    mouse.x = mouse.tx = W / 2;
    mouse.y = mouse.ty = H / 2;
    buildNodes();
  }

  function buildNodes() {
    nodes.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x:  (i / (NODE_COUNT - 1)) * W,
        y:  H * (0.3 + Math.random() * 0.4),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25,
        r:  Math.min(W, H) * (0.22 + Math.random() * 0.18),
        hue: Math.random() > 0.5 ? 268 : 286,   /* cool violet tones */
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Soft ambient fill */
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    /* Mouse blob */
    const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, Math.min(W, H) * 0.38);
    mg.addColorStop(0, 'rgba(167,139,250,0.045)');
    mg.addColorStop(1, 'rgba(167,139,250,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(0, 0, W, H);

    /* Mesh node blobs */
    for (const n of nodes) {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, `hsla(${n.hue}, 15%, 12%, 0.6)`);
      g.addColorStop(0.4, `hsla(${n.hue}, 10%, 8%, 0.3)`);
      g.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      /* Update position */
      n.x += n.vx;
      n.y += n.vy;

      /* Gentle cursor attraction */
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 420) {
        n.vx += (dx / dist) * 0.008;
        n.vy += (dy / dist) * 0.008;
      }

      /* Boundary bounce */
      if (n.x < -n.r || n.x > W + n.r) n.vx *= -1;
      if (n.y < -n.r || n.y > H + n.r) n.vy *= -1;

      /* Dampen */
      n.vx *= 0.998;
      n.vy *= 0.998;
    }

    /* Vignette */
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    animId = requestAnimationFrame(draw);
  }

  /* Lerp mouse */
  function updateMouse() {
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    requestAnimationFrame(updateMouse);
  }

  window.addEventListener('mousemove', e => {
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
  });

  window.addEventListener('resize', resize);
  resize();
  draw();
  updateMouse();
})();


/* ═══════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let rx = cx, ry = cy;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    dot.style.left = cx + 'px';
    dot.style.top  = cy + 'px';
  });

  (function animRing() {
    rx += (cx - rx) * 0.14;
    ry += (cy - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  /* Expand on interactive elements */
  const interactives = 'a, button, [role="button"], input, textarea, select, label, .card, .blog-card, .feature-card, .pricing-card, .btn-primary, .btn-secondary, .nav-link';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactives)) document.body.classList.remove('cursor-hover');
  });
})();


/* ═══════════════════════════════════════════════════════════
   3. NAVIGATION — scroll state + mobile toggle
   ═══════════════════════════════════════════════════════════ */
(function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      hamburger.querySelectorAll('span')[0].style.transform = open ? 'rotate(45deg) translate(4px, 4px)' : '';
      hamburger.querySelectorAll('span')[1].style.opacity   = open ? '0' : '1';
      hamburger.querySelectorAll('span')[2].style.transform = open ? 'rotate(-45deg) translate(4px, -5px)' : '';
    });

    /* Close on link click */
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.querySelectorAll('span')[0].style.transform = '';
        hamburger.querySelectorAll('span')[1].style.opacity   = '';
        hamburger.querySelectorAll('span')[2].style.transform = '';
      });
    });
  }

  /* Active nav link highlight */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === path || href.includes(path))) {
      link.classList.add('active');
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   4. GSAP SCROLL ANIMATIONS
   ═══════════════════════════════════════════════════════════ */
(function initGSAP() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* Default ease */
  const EASE = 'power4.out';
  const EASE_SOFT = 'power3.out';

  /* ── Reveal elements ── */
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: EASE,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      }
    });
  });

  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.9,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.9,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  gsap.utils.toArray('.reveal-scale').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 0.85,
      ease: EASE_SOFT,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  /* ── Stagger children ── */
  gsap.utils.toArray('[data-stagger]').forEach(parent => {
    const delay = parseFloat(parent.dataset.stagger) || 0.1;
    const children = parent.children;
    gsap.fromTo(children,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: EASE,
        stagger: delay,
        scrollTrigger: { trigger: parent, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  /* ── Hero entrance (fires immediately) ── */
  const heroTimeline = gsap.timeline({ defaults: { ease: EASE } });

  const heroBadge   = $('.hero-badge');
  const heroHead    = $('.hero-heading');
  const heroSub     = $('.hero-sub');
  const heroCTAs    = $('.hero-ctas');
  const heroMeta    = $('.hero-meta');

  if (heroBadge)  heroTimeline.from(heroBadge,  { opacity: 0, y: 20, duration: 0.7 }, 0.3);
  if (heroHead)   heroTimeline.from(heroHead,   { opacity: 0, y: 48, skewY: 3, duration: 1.1 }, 0.5);
  if (heroSub)    heroTimeline.from(heroSub,    { opacity: 0, y: 28, duration: 0.9 }, 0.85);
  if (heroCTAs)   heroTimeline.from(heroCTAs,   { opacity: 0, y: 20, duration: 0.7 }, 1.05);
  if (heroMeta)   heroTimeline.from(heroMeta,   { opacity: 0, duration: 0.7 }, 1.25);

  /* ── Page hero (non-home pages) ── */
  const pageHeroLabel   = $('.page-hero .label');
  const pageHeroHeading = $('.page-hero .heading-xl');
  const pageHeroDesc    = $('.page-hero .page-hero-desc');

  const pht = gsap.timeline({ defaults: { ease: EASE } });
  if (pageHeroLabel)   pht.from(pageHeroLabel,   { opacity: 0, y: 20, duration: 0.7 }, 0.2);
  if (pageHeroHeading) pht.from(pageHeroHeading, { opacity: 0, y: 48, skewY: 2, duration: 1.0 }, 0.4);
  if (pageHeroDesc)    pht.from(pageHeroDesc,    { opacity: 0, y: 24, duration: 0.8 }, 0.7);

  /* ── Navbar entrance ── */
  const nav = document.getElementById('navbar');
  if (nav) gsap.from(nav, { opacity: 0, y: -20, duration: 0.8, ease: EASE_SOFT, delay: 0.1 });

  /* ── Counters (stat numbers) ── */
  document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let counter = { val: 0 };
    gsap.to(counter, {
      val: target,
      duration: 2.2,
      ease: 'power2.out',
      onUpdate: () => { el.innerHTML = prefix + Math.round(counter.val) + '<span>' + suffix + '</span>'; },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* ── Horizontal rule reveals ── */
  gsap.utils.toArray('.glow-line-h').forEach(el => {
    gsap.from(el, {
      scaleX: 0,
      duration: 1.2,
      ease: EASE_SOFT,
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   5. SMOOTH ANCHOR SCROLL
   ═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ═══════════════════════════════════════════════════════════
   6. CONTACT FORM — Basic validation + feedback
   ═══════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Transmitting…</span>';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<span>Request Received — We Will Contact You Securely</span>';
      btn.style.borderColor = '#22c55e';
      btn.style.color = '#22c55e';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 4000);
    }, 1600);
  });
})();
