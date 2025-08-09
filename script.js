// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mark "Home" tab active (simple demo)
document.querySelectorAll('.tab-nav .tab').forEach(t => {
  t.classList.toggle('is-active', t.getAttribute('href') === '#home');
});

// ---- DAILY DEALS (from deals.json; groups/subgroups) ----
(async function loadDeals() {
  const container = document.getElementById('dealList');
  if (!container) return;

  try {
    const res = await fetch('deals.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const html = data.map(cat => {
      const title = `<div class="deal-cat-title">${cat.category}</div>`;

      if (Array.isArray(cat.groups) && cat.groups.length) {
        const groupsHTML = cat.groups.map(g => `
          <div class="deal-subgroup">
            <div class="deal-subtitle">${g.title}</div>
            <ul class="deal-items">
              ${g.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `).join('');
        return `<div class="deal-cat">${title}${groupsHTML}</div>`;
      }

      const itemsHTML = (cat.items || []).map(item => `<li>${item}</li>`).join('');
      return `<div class="deal-cat">${title}<ul class="deal-items">${itemsHTML}</ul></div>`;
    }).join('');

    container.innerHTML = html || `<div class="deal-cat"><ul class="deal-items"><li>No active deals today.</li></ul></div>`;

    // Optional tax note
    const note = document.createElement('div');
    note.className = 'deal-note';
    note.textContent = 'ALL PRICES ARE TAX INCLUDED';
    container.appendChild(note);

  } catch (err) {
    console.error('Failed to load deals.json:', err);
    container.innerHTML = `<div class="deal-cat"><ul class="deal-items"><li>Deals are loading…</li></ul></div>`;
  }
})();

// ---- Deals accordion (whole card clickable) ----
const dealCard = document.querySelector('.deal-card');
const dealBody = document.getElementById('dealBody');
const closeBtn = document.getElementById('closeDeals');

function setDealsOpen(open){
  if (!dealCard || !dealBody) return;
  dealBody.classList.toggle('collapsed', !open);
  dealCard.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (closeBtn) closeBtn.style.display = open ? 'inline-block' : 'none';
}
// initial: collapsed teaser
setDealsOpen(false);

// Toggle when clicking anywhere on the card head/body background.
// Ignore clicks on interactive elements (links/buttons inside).
function clickShouldToggle(e){
  const t = e.target;
  return !(t.closest('a, button, input, select, textarea'));
}
dealCard?.addEventListener('click', (e) => {
  if (!clickShouldToggle(e)) return;
  const isOpen = dealCard.getAttribute('aria-expanded') === 'true';
  setDealsOpen(!isOpen);
});
dealCard?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const isOpen = dealCard.getAttribute('aria-expanded') === 'true';
    setDealsOpen(!isOpen);
  }
});
closeBtn?.addEventListener('click', (e) => { e.stopPropagation(); setDealsOpen(false); });

// ---- Carousel dots + scroll-sync ----
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

// ---- Mobile drawer menu ----
const openBtn = document.querySelector('[data-open-menu]');
const drawer  = document.getElementById('navDrawer');
const closeX  = drawer?.querySelector('.drawer-close');

function openDrawer(){
  if (!drawer) return;
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeDrawer(){
  if (!drawer) return;
  drawer.hidden = true;
  document.body.style.overflow = '';
}
openBtn?.addEventListener('click', openDrawer);
closeX?.addEventListener('click', closeDrawer);
drawer?.addEventListener('click', (e)=>{
  if (e.target.classList.contains('drawer-link')) closeDrawer();
});
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer();
});

// (Wishlist intentionally removed)
try { localStorage.removeItem('wishlist'); } catch(e) {}
