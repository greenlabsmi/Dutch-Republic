// Sticky header shadow + year
document.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mark "Home" tab active (simple demo)
document.querySelectorAll('.tab-nav .tab').forEach(t => {
  t.classList.toggle('is-active', t.getAttribute('href') === '#home');
});

// ---- DAILY DEALS (category-based from deals.json) ----
(async function loadDeals() {
  const list = document.getElementById('dealList');
  if (!list) return;

  try {
    const res = await fetch('deals.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Render categories -> items
    list.innerHTML = data.map(cat => `
      <li class="deal-cat">
        <div class="deal-cat-title">${cat.category}</div>
        <ul class="deal-items">
          ${cat.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </li>
    `).join('');

  } catch (err) {
    console.error('Failed to load deals.json:', err);
    list.innerHTML = `<li>Deals are loading…</li>`;
  }
})();

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

// Carousel dots + scroll-sync
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

// Temporary “Menu” button behavior (could open a drawer later)
document.querySelector('[data-open-menu]')?.addEventListener('click', () => {
  window.location.hash = '#shop';
});

// (Wishlist intentionally removed)
try { localStorage.removeItem('wishlist'); } catch(e) {}
