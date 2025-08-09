/* =========================
   Dutch District – script.js
   ========================= */

/* Year in footer */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Mark "Home" tab active (demo) */
document.querySelectorAll('.tab-nav .tab').forEach(t => {
  t.classList.toggle('is-active', t.getAttribute('href') === '#home');
});

/* -------------------------
   DAILY DEALS (deals.json)
   ------------------------- */
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
    const fallback = `<div class="deal-cat"><ul class="deal-items"><li>Deals are loading…</li></ul></div>`;
    container.innerHTML = fallback;
  }
})();

/* -------------------------
   Deals accordion (HOD-style)
   ------------------------- */
const dealCard = document.querySelector('.deal-card');
const dealBody = document.getElementById('dealBody');
const closeBtn = document.getElementById('closeDeals');

function setDealsOpen(open){
  if (!dealCard || !dealBody) return;
  dealBody.classList.toggle('collapsed', !open);
  dealCard.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (closeBtn) closeBtn.style.display = open ? 'inline-block' : 'none';
}
// start collapsed with ~3-line teaser
setDealsOpen(false);

// Only toggle if you didn’t click an interactive element inside
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

/* -------------------------
   Hero carousel (dots + auto)
   ------------------------- */
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
    if (!document.body.contains(scroller)) return; // safety
    idx = (idx + 1) % slides.length;
    scroller.scrollTo({ left: idx * scroller.clientWidth, behavior: 'smooth' });
  }, 6000);
})();

/* -------------------------
   External commerce links
   ------------------------- */
document.querySelectorAll('[data-ext]').forEach(a => {
  a.setAttribute('rel', 'noopener');
  a.setAttribute('target', '_blank');
});

/* ---------------------------------------
   Hours of operation – pill + popover
   --------------------------------------- */
// Green Labs hours: 9:00–21:00 every day
const HOURS = {
  0: { open: '09:00', close: '21:00' },  // Sun
  1: { open: '09:00', close: '21:00' },  // Mon
  2: { open: '09:00', close: '21:00' },
  3: { open: '09:00', close: '21:00' },
  4: { open: '09:00', close: '21:00' },
  5: { open: '09:00', close: '21:00' },  // Fri
  6: { open: '09:00', close: '21:00' },  // Sat
};
const OPENING_SOON_MIN = 45;
const CLOSING_SOON_MIN = 45;

const hoursBtn = document.getElementById('hoursBtn');
const pop  = document.getElementById('hoursPopover');
const overlay = document.getElementById('hoursOverlay');
const listEl = document.getElementById('hoursList');
const dotEl  = document.getElementById('hoursStatusDot');
const noteEl = document.getElementById('hoursNote');

function t2m(s){ const [h,m] = s.split(':').map(Number); return h*60+m; }
function nowMinutes(){ const d=new Date(); return d.getHours()*60+d.getMinutes(); }

function computeStatus(){
  const d = new Date();
  const dow = d.getDay();
  const today = HOURS[dow];
  const mins = nowMinutes();

  let state = 'closed'; // 'open' | 'opening-soon' | 'closing-soon' | 'closed'
  let label = 'CLOSED';

  if (today && today.open && today.close){
    const o = t2m(today.open), c = t2m(today.close);

    if (mins >= o && mins < c){
      const toClose = c - mins;
      if (toClose <= CLOSING_SOON_MIN) { state = 'closing-soon'; label = 'CLOSING SOON'; }
      else { state = 'open'; label = 'OPEN'; }
    } else if (mins < o){
      const toOpen = o - mins;
      if (toOpen <= OPENING_SOON_MIN){ state = 'opening-soon'; label = 'OPENING SOON'; }
      else { state = 'closed'; label = 'CLOSED'; }
    } else {
      state = 'closed'; label = 'CLOSED';
    }
  }

  // Update pill text + state color class
  if (hoursBtn){
    hoursBtn.textContent = label;
    hoursBtn.classList.remove('state-open','state-soon','state-closed');
    hoursBtn.classList.add(state==='open' ? 'state-open'
                      : (state==='closing-soon' || state==='opening-soon') ? 'state-soon'
                      : 'state-closed');
  }

  // Update dot in popover
  if (dotEl){
    dotEl.className = 'status-dot ' + (state==='open' ? 'is-open'
                            : (state==='closing-soon' || state==='opening-soon') ? 'is-soon'
                            : 'is-closed');
  }
}

function renderWeek(){
  if (!listEl) return;
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dow = new Date().getDay();

  listEl.innerHTML = '';
  for (let i=0;i<7;i++){
    const h = HOURS[i];
    const line = h ? `${h.open}–${h.close}` : 'Closed';
    const li = document.createElement('li');
    li.innerHTML = `<span>${dayNames[i]}</span><span>${line}</span>`;
    if (i===dow) li.classList.add('is-today');
    listEl.appendChild(li);
  }
  if (noteEl) noteEl.textContent = 'Tap anywhere to close';
}

function openHours(){
  if (!pop || !overlay) return;
  renderWeek();
  computeStatus();
  pop.hidden = false;
  overlay.hidden = false;
  hoursBtn?.setAttribute('aria-expanded','true');
}
function closeHours(){
  if (!pop || !overlay) return;
  pop.hidden = true;
  overlay.hidden = true;
  hoursBtn?.setAttribute('aria-expanded','false');
}

hoursBtn?.addEventListener('click', () => {
  const expanded = hoursBtn.getAttribute('aria-expanded') === 'true';
  expanded ? closeHours() : openHours();
});
overlay?.addEventListener('click', closeHours);
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && !pop?.hidden) closeHours(); });

// Initial + keep fresh every minute
computeStatus();
setInterval(computeStatus, 60*1000);

/* ---------------------------------------
   Device-aware Maps open (Apple / Google)
   --------------------------------------- */
const ADDRESS_QUERY = '435+Blue+Star+Hwy,+Douglas,+MI+49406';
const appleMapsURL = `https://maps.apple.com/?q=${ADDRESS_QUERY}`;
const googleMapsURL = `https://www.google.com/maps/search/?api=1&query=${ADDRESS_QUERY}`;

function detectAppleEnv(){
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod|Macintosh/.test(ua);
}
function getMapPref(){
  return localStorage.getItem('mapPref') || (detectAppleEnv() ? 'apple' : 'google');
}
function setMapPref(p){ try{ localStorage.setItem('mapPref', p); }catch(_){} }

function openPreferredMap(){
  const pref = getMapPref();
  const url = pref === 'apple' ? appleMapsURL : googleMapsURL;
  window.open(url, '_blank', 'noopener');
}

document.getElementById('openMaps')?.addEventListener('click', openPreferredMap);
document.getElementById('switchMapPref')?.addEventListener('click', () => {
  const next = getMapPref() === 'apple' ? 'google' : 'apple';
  setMapPref(next);
  const btn = document.getElementById('switchMapPref');
  if (btn){
    btn.textContent = next === 'apple' ? 'Use Google' : 'Use Apple';
    setTimeout(()=>{ btn.textContent = 'Switch'; }, 1200);
  }
});
document.getElementById('mapLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  openPreferredMap();
});

/* -------------------------
   Loyalty expand-on-continue
   ------------------------- */
const loyEmail = document.getElementById('loyEmail');
const loyStart = document.getElementById('loyStart');
const loyBody = document.getElementById('loyBody');

function openLoyalty(){
  if (!loyBody) return;
  loyBody.hidden = false;
  loyBody.scrollIntoView({ behavior:'smooth', block:'start' });
}
loyStart?.addEventListener('click', openLoyalty);
loyEmail?.addEventListener('focus', openLoyalty);

/* -------------------------
   Mobile drawer (optional)
   ------------------------- */
const openBtn = document.querySelector('[data-open-menu]');
const drawer  = document.getElementById('navDrawer');
const closeX  = drawer?.querySelector('.drawer-close');

function openDrawer(){ if (!drawer) return; drawer.hidden = false; document.body.style.overflow = 'hidden'; }
function closeDrawer(){ if (!drawer) return; drawer.hidden = true; document.body.style.overflow = ''; }

openBtn?.addEventListener('click', openDrawer);
closeX?.addEventListener('click', closeDrawer);
drawer?.addEventListener('click', (e)=>{ if (e.target.classList.contains('drawer-link')) closeDrawer(); });
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer(); });

/* Clean up any old wishlist */
try { localStorage.removeItem('wishlist'); } catch(e) {}
