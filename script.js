// ------------------------------------------------------------
// Dutch District – main client script
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // ================= Header / meta =================
  // Sticky header shadow
  (function stickyHeader() {
    const hdr = document.querySelector('.site-header');
    if (!hdr) return;
    const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    document.addEventListener('scroll', onScroll, { passive: true });
  })();

  // Active tab (naive demo highlighting)
  document.querySelectorAll('.tab-nav .tab').forEach(t => {
    t.classList.toggle('is-active', t.getAttribute('href') === '#home');
  });

  // Year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ================= Hero carousel =================
  (function initCarousel() {
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
      dotsWrap.querySelectorAll('button').forEach((d, idx) => {
        d.classList.toggle('is-active', idx === i);
      });
    };
    scroller.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });

    // Auto-advance
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % slides.length;
      scroller.scrollTo({ left: idx * scroller.clientWidth, behavior: 'smooth' });
    }, 6000);
  })();

  // Open external links in a new tab
  document.querySelectorAll('[data-ext]').forEach(a => {
    a.setAttribute('rel', 'noopener');
    a.setAttribute('target', '_blank');
  });

  // ================= Mobile drawer =================
  (function mobileDrawer() {
    const openBtn = document.querySelector('[data-open-menu]');
    const drawer = document.getElementById('navDrawer');
    const closeBtn = drawer?.querySelector('.drawer-close');
    if (!openBtn || !drawer || !closeBtn) return;

    const open = () => drawer.removeAttribute('hidden');
    const close = () => drawer.setAttribute('hidden', '');
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    });
  })();

  // ================= Today’s Deals =================
  (function deals() {
    const body = document.getElementById('dealBody');
    const list = document.getElementById('dealList');
    const card = document.querySelector('.deal-card');
    if (!body || !list || !card) return;

    // Fetch and render deals.json (must be at /deals.json)
    fetch('deals.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => renderDeals(list, data))
      .catch(() => { list.innerHTML = '<li>Deals unavailable right now.</li>'; });

    function esc(s) {
      return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function renderDeals(target, data) {
      // Supports categories with optional subgroups
      const html = data.map(cat => {
        if (cat.groups && Array.isArray(cat.groups)) {
          const groups = cat.groups.map(g => `
            <div class="deal-subgroup">
              <div class="deal-subtitle">${esc(g.title)}</div>
              <ul class="deal-items">
                ${(g.items || []).map(it => `<li>${esc(it)}</li>`).join('')}
              </ul>
            </div>
          `).join('');
          return `
            <li class="deal-cat">
              <div class="deal-cat-title">${esc(cat.category)}</div>
              ${groups}
            </li>
          `;
        } else {
          return `
            <li class="deal-cat">
              <div class="deal-cat-title">${esc(cat.category)}</div>
              <ul class="deal-items">
                ${(cat.items || []).map(it => `<li>${esc(it)}</li>`).join('')}
              </ul>
            </li>
          `;
        }
      }).join('');
      target.innerHTML = html + `<div class="deal-note">All prices include tax.</div>`;
    }

    // Expand/collapse the card (entire header is clickable)
    const head = card.querySelector('.deal-head');
    const closeBtn = document.getElementById('closeDeals');

    const expand = () => {
      card.setAttribute('aria-expanded', 'true');
      body.classList.remove('collapsed');
    };
    const collapse = () => {
      card.setAttribute('aria-expanded', 'false');
      body.classList.add('collapsed');
    };

    head?.addEventListener('click', () => {
      const expanded = card.getAttribute('aria-expanded') === 'true';
      expanded ? collapse() : expand();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const expanded = card.getAttribute('aria-expanded') === 'true';
        expanded ? collapse() : expand();
      }
    });
    closeBtn?.addEventListener('click', collapse);
  })();

  // ================= Hours popover & pill =================
  (function hours() {
    const btn = document.getElementById('hoursBtn');
    const pop = document.getElementById('hoursPopover');
    const ovl = document.getElementById('hoursOverlay');
    const list = document.getElementById('hoursList');
    const note = document.getElementById('hoursNote');
    const statusDot = document.getElementById('hoursStatusDot');
    if (!btn || !pop || !ovl || !list || !note || !statusDot) return;

    // Business hours (9–21 daily)
    const HOURS = [
      { d: 'Sunday',    open: 9, close: 21 },
      { d: 'Monday',    open: 9, close: 21 },
      { d: 'Tuesday',   open: 9, close: 21 },
      { d: 'Wednesday', open: 9, close: 21 },
      { d: 'Thursday',  open: 9, close: 21 },
      { d: 'Friday',    open: 9, close: 21 },
      { d: 'Saturday',  open: 9, close: 21 },
    ];

    function fmt(h) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr = ((h + 11) % 12) + 1;
      return `${hr}${ampm}`;
    }
    function statusNow() {
      const now = new Date();
      const idx = now.getDay();
      const hour = now.getHours() + now.getMinutes() / 60;
      const { open, close } = HOURS[idx];
      const openSoon = hour >= open - 0.5 && hour < open;
      const closingSoon = hour >= close - 0.5 && hour < close;
      const isOpen = hour >= open && hour < close;
      return { isOpen, openSoon, closingSoon, open, close, idx };
    }
    function paintPill() {
      const s = statusNow();
      btn.classList.remove('state-open','state-soon','state-closed');
      if (s.isOpen && s.closingSoon) {
        btn.textContent = 'CLOSING SOON';
        btn.classList.add('state-soon');
        statusDot.className = 'status-dot is-soon';
      } else if (!s.isOpen && s.openSoon) {
        btn.textContent = 'OPENING SOON';
        btn.classList.add('state-soon');
        statusDot.className = 'status-dot is-soon';
      } else if (s.isOpen) {
        btn.textContent = 'OPEN';
        btn.classList.add('state-open');
        statusDot.className = 'status-dot is-open';
      } else {
        btn.textContent = 'CLOSED';
        btn.classList.add('state-closed');
        statusDot.className = 'status-dot is-closed';
      }
    }
    function renderHours() {
      const today = new Date().getDay();
      list.innerHTML = HOURS.map((h, i) => `
        <li class="${i === today ? 'is-today' : ''}">
          <span>${h.d}</span>
          <span>${fmt(h.open)} – ${fmt(h.close)}</span>
        </li>
      `).join('');
      const s = statusNow();
      note.textContent = s.isOpen
        ? `We’re open until ${fmt(s.close)} today.`
        : `We open at ${fmt(s.open)}.`;
    }
    function openPop() {
      pop.hidden = false;
      ovl.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }
    function closePop() {
      pop.hidden = true;
      ovl.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }

    paintPill();
    renderHours();
    btn.addEventListener('click', () => (pop.hidden ? openPop() : closePop()));
    ovl.addEventListener('click', closePop);
    window.addEventListener('scroll', closePop, { passive: true });
    setInterval(paintPill, 60 * 1000); // keep fresh
  })();

  // ================= Maps (smart open) =================
  (function maps() {
    // Your exact deep links (Luna Pier)
    const appleMapsURL = 'https://maps.apple.com/place?address=10701%20Madison%20St,%20Luna%20Pier,%20MI%2048157,%20United%20States&coordinate=41.811131,-83.446182&name=Green%20Labs&place-id=I7D92A14C05BBFB93&map=explore';
    const googleMapsURL = 'https://www.google.com/maps/place//data=!4m2!3m1!1s0x883b792f918df687:0xb3cf2121d239bc1d?entry=s&sa=X&ved=1t:8290&hl=en-us&ictx=111&g_ep=Eg1tbF8yMDI1MDgwNl8wIOC7DCoASAJQAg%3D%3D';

    const isApple = () => /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent || '');

    // MODE A: single smart button
    const openMapsSmartBtn = document.getElementById('openMapsSmart');
    openMapsSmartBtn?.addEventListener('click', () => {
      window.open(isApple() ? appleMapsURL : googleMapsURL, '_blank', 'noopener');
    });

    // MODE B: preference buttons (if present)
    const getMapPref = () => localStorage.getItem('mapPref') || (isApple() ? 'apple' : 'google');
    const setMapPref = (p) => { try { localStorage.setItem('mapPref', p); } catch(e) {} };
    const openPreferredMap = () => {
      const pref = getMapPref();
      const url = pref === 'apple' ? appleMapsURL : googleMapsURL;
      window.open(url, '_blank', 'noopener');
    };

    // If these exist in HTML, wire them too
    document.getElementById('openMaps')?.addEventListener('click', openPreferredMap);
    document.getElementById('switchMapPref')?.addEventListener('click', () => {
      const next = getMapPref() === 'apple' ? 'google' : 'apple';
      setMapPref(next);
      const btn = document.getElementById('switchMapPref');
      if (btn) {
        btn.textContent = next === 'apple' ? 'Use Apple Maps' : 'Use Google Maps';
        setTimeout(() => (btn.textContent = 'Switch'), 1200);
      }
    });
    document.getElementById('mapLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      openPreferredMap();
    });
  })();

  // ================= Loyalty expand-on-continue =================
  (function loyalty() {
    const start = document.getElementById('loyStart');
    const body = document.getElementById('loyBody');
    const email = document.getElementById('loyEmail');
    if (!start || !body || !email) return;
    const open = () => body.hidden = false;
    start.addEventListener('click', open);
    email.addEventListener('focus', open);
  })();

  // Clean up any old wishlist storage
  try { localStorage.removeItem('wishlist'); } catch (e) {}
});
