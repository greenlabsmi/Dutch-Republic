// Sticky header shadow + year
document.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Close on link click (mobile)
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }));
}

// Deals accordion
const toggle = document.querySelector('.deal-toggle');
const dealBody = document.getElementById('dealBody');
if (toggle && dealBody) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', (!expanded).toString());
    dealBody.hidden = expanded;
  });
}

// Carousel dots + scroll-sync (simple, no lib)
(function initCarousel(){
  const scroller = document.querySelector('[data-carousel]');
  const dotsWrap = document.querySelector('[data-dots]');
  if (!scroller || !dotsWrap) return;

  const slides = [...scroller.querySelectorAll('.slide')];
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    if (i === 0) b.classList.add('is-active');
    b.addEventListener('click', () => {
      scroller.scrollTo({ left: i * scroller.clientWidth, behavior: 'smooth' });
    });
    dotsWrap.appendChild(b);
  });

  const updateDots = () => {
    const i = Math.round(scroller.scrollLeft / scroller.clientWidth);
    dotsWrap.querySelectorAll('button').forEach((d, idx) => d.classList.toggle('is-active', idx === i));
  };
  scroller.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });

  // Optional auto-advance
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % slides.length;
    scroller.scrollTo({ left: idx * scroller.clientWidth, behavior: 'smooth' });
  }, 6000);
})();

// External commerce links – open in new tab
document.querySelectorAll('[data-ext]').forEach(a => {
  a.setAttribute('rel', 'noopener');
  a.setAttribute('target', '_blank');
});

// (Wishlist intentionally removed/neutralized)
try { localStorage.removeItem('wishlist'); } catch(e) {}
