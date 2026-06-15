(function () {
  'use strict';

  // ===== STARFIELD =====
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let W, H;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.15 + 0.02,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const alpha = s.a * (0.6 + 0.4 * Math.sin(time * 0.001 * s.speed + s.pulse));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
      if (s.r > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.08})`;
        ctx.fill();
      }
    }
  }

  function animateStarfield(time) {
    drawStars(time);
    requestAnimationFrame(animateStarfield);
  }

  function initStarfield() {
    resizeCanvas();
    const count = Math.min(Math.floor((W * H) / 6000), 400);
    createStars(count);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    const count = Math.min(Math.floor((W * H) / 6000), 400);
    createStars(count);
  });

  initStarfield();
  requestAnimationFrame(animateStarfield);

  // ===== TAB SWITCHING =====
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = {
    home: document.getElementById('page-home'),
    about: document.getElementById('page-about'),
    impact: document.getElementById('page-impact'),
    contact: document.getElementById('page-contact'),
  };

  function switchPage(pageId) {
    Object.values(pages).forEach(p => p.classList.add('hidden'));
    if (pages[pageId]) {
      pages[pageId].classList.remove('hidden');
    }
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.dataset.page;
      if (pageId) {
        switchPage(pageId);
      }
    });
  });

  // Close buttons
  document.querySelectorAll('.overlay-close').forEach(btn => {
    btn.addEventListener('click', () => {
      switchPage('home');
      navLinks.forEach(link => link.classList.remove('active'));
    });
  });

  // Default: show HOME, no nav active
  switchPage('home');
  navLinks.forEach(link => link.classList.remove('active'));

})();
