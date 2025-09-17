// ------------------------------------------------------------
// Dutch District – main client script
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {


// ===== Age Gate logic (uses #ageGate, #ageYes, #ageNo, #ageRemember) =====
(function () {
  const KEY = 'dr_age_until';
  const gate = document.getElementById('ageGate');
  if (!gate) return;

  // Dev helpers:
  // ?agegate=show  -> force-show every load
  // ?agegate=clear -> clear stored acceptance
  const sp = new URL(location.href).searchParams;
  if (sp.get('agegate') === 'clear') localStorage.removeItem(KEY);
  const forceShow = sp.get('agegate') === 'show';

  const okUntil = Number(localStorage.getItem(KEY) || 0);
  const sessionOK = sessionStorage.getItem(KEY) === '1';
  const isOK = (okUntil > Date.now()) || sessionOK;

  function show() {
    gate.setAttribute('aria-hidden', 'false');
    gate.style.display = 'flex';
    document.body.classList.add('agegate--lock');
  }
  function hide() {
    gate.setAttribute('aria-hidden', 'true');
    gate.style.display = 'none';
    document.body.classList.remove('agegate--lock');
  }

  const yes = document.getElementById('ageYes');
  const no  = document.getElementById('ageNo');
  const remember = document.getElementById('ageRemember');

  yes?.addEventListener('click', () => {
    if (remember?.checked) {
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(KEY, String(Date.now() + THIRTY_DAYS));
    } else {
      sessionStorage.setItem(KEY, '1');
    }
    hide();
  });

  no?.addEventListener('click', () => {
    // Send under-21 away (choose your destination)
    location.href = 'https://www.google.com';
  });

  if (forceShow) show();
  else if (isOK) hide();
  else show();
})();

    // Place a floating panel under a trigger (keeps it near the icon)
  function alignFloating(trigger, panel, opts = {}) {
    if (!trigger || !panel) return;
    const r = trigger.getBoundingClientRect();
    const gap   = opts.gap ?? 8;                 // space between trigger & panel
    const align = opts.align ?? 'end';           // 'start' | 'center' | 'end'

    // make sure CSS "right" isn’t fighting us
    panel.style.position = 'fixed';
    panel.style.right = '';                      // clear any right: Npx from CSS

    // compute left
    let left;
    if (align === 'start')  left = r.left;
    if (align === 'center') left = r.left + r.width/2 - panel.offsetWidth/2;
    if (align === 'end')    left = r.left + r.width - panel.offsetWidth;

    // keep inside viewport
    const pad = 8;
    left = Math.max(pad, Math.min(left, window.innerWidth - panel.offsetWidth - pad));

    panel.style.left = Math.round(left) + 'px';
    panel.style.top  = Math.round(r.bottom + gap) + 'px';
  }
  
  // ================= Header / meta =================
  // Sticky header shadow (noop if .site-header doesn't exist)
  (function stickyHeader() {
    const hdr = document.querySelector('.site-header');
    if (!hdr) return;
    const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    document.addEventListener('scroll', onScroll, { passive: true });
  })();
  // NEW: show compact sticky nav after brand banner scrolls away
  (function stickySwap(){
    const banner = document.querySelector('.brand-banner'); // from new header
    if (!banner) return;
    const activate = (on) => document.body.classList.toggle('show-sticky', on);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        activate(!entries[0].isIntersecting);
      }, { rootMargin: '-1px 0px 0px 0px', threshold: 0 });
      io.observe(banner);
    } else {
      const check = () => activate(window.scrollY > banner.offsetHeight - 1);
      check();
      window.addEventListener('scroll', check, { passive:true });
      window.addEventListener('resize', check);
    }
  })();
document.querySelectorAll('.sticky-tabs .stab').forEach(t => {
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

 // ================= Menu popover (like Hours) =================
(function menuPopover(){
  const openBtn = document.querySelector('[data-open-menu]');
  const pop = document.getElementById('navDrawer');      // the popover panel
  const ovl = document.getElementById('menuOverlay');
  if (!openBtn || !pop || !ovl) return;

  const open = () => {
    pop.hidden = false;
    ovl.hidden = false;
    openBtn.setAttribute('aria-expanded','true');
    // Align right under the hamburger icon
    alignFloating(openBtn, pop, { align: 'end', gap: 8 });
  };

  const close = () => {
    pop.hidden = true;
    ovl.hidden = true;
    openBtn.setAttribute('aria-expanded','false');
  };

  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    (pop.hidden ? open() : close());
  });
  ovl.addEventListener('click', close);

  // Close when clicking any link inside
  pop.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Keep the panel hugged to the icon on resize/scroll
  const keepAligned = () => { if (!pop.hidden) alignFloating(openBtn, pop, { align:'end', gap:8 }); };
  window.addEventListener('resize', keepAligned, { passive:true });
  window.addEventListener('scroll',  keepAligned, { passive:true });

  // Optional: close if window scrolls a lot
  window.addEventListener('scroll', close, { passive: true });
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
    // Expand/collapse helpers
    const expand = () => {
      card.setAttribute('aria-expanded', 'true');
      body.classList.remove('collapsed');
    };
    const collapse = () => {
      card.setAttribute('aria-expanded', 'false');
      body.classList.add('collapsed');
    };
    const toggle = () => {
      (card.getAttribute('aria-expanded') === 'true') ? collapse() : expand();
    };
    // Make the WHOLE CARD clickable (except real controls/links)
    card.addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, label, select, textarea')) return;
      toggle();
    });
    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
    // Close button still works
    document.getElementById('closeDeals')?.addEventListener('click', (e) => {
      e.stopPropagation();
      collapse();
    });
  })();

  // ---- Map helpers (use default maps app on phones) ----
function isIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent || ''); }
function isAndroid(){ return /Android/.test(navigator.userAgent || ''); }
function smartMapHref(address){
  const q = encodeURIComponent(address);
  if (isIOS())     return `maps://?q=${q}`;     // Apple Maps app
  if (isAndroid()) return `geo:0,0?q=${q}`;     // Default maps app (Android)
  return `https://www.google.com/maps?q=${q}`;  // Desktop fallback
}
  
  // ================= Hours popover & pill =================
  (function hours() {
    const btn = document.getElementById('hoursBtn');
    const pop = document.getElementById('hoursPopover');
    const ovl = document.getElementById('hoursOverlay');
    const list = document.getElementById('hoursList');
    const note = document.getElementById('hoursNote');
    const statusDot = document.getElementById('hoursStatusDot');
    if (!btn || !pop || !ovl || !list || !note) return;
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

  // build a clean tooltip message
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let tip = '';

  if (s.isOpen && s.closingSoon) {
    btn.textContent = 'CLOSING SOON';
    btn.classList.add('state-soon');
    tip = `Closes at ${fmt(s.close)} today`;
  } else if (!s.isOpen && s.openSoon) {
    btn.textContent = 'OPENING SOON';
    btn.classList.add('state-soon');
    tip = `Opens at ${fmt(s.open)} today`;
  } else if (s.isOpen) {
    btn.textContent = 'OPEN';
    btn.classList.add('state-open');
    tip = `Open until ${fmt(s.close)} today`;
  } else {
    btn.textContent = 'CLOSED';
    btn.classList.add('state-closed');
    const next = (s.idx + 1) % 7;
    tip = `Opens ${days[next]} at ${fmt(HOURS[next].open)}`;
  }

  // expose message for the tooltip
  btn.dataset.tip = tip;

  if (statusDot) {
    statusDot.className = 'status-dot ' + (s.isOpen ? 'is-open' : (s.openSoon || s.closingSoon ? 'is-soon' : 'is-closed'));
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

  // Use the global smartMapHref helper
  const addr = "435 Blue Star Hwy, Douglas, MI 49406";
  const href = smartMapHref(addr);

  note.innerHTML = `
    <a class="note-address" href="${href}">
      ${addr}
    </a>
  `;

  // Only set target/rel for web URLs (http/https), not app schemes (maps://, geo:)
  const a = note.querySelector('.note-address');
  if (a) {
    if (/^https?:/i.test(a.href)) {
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.removeAttribute('target');
      a.removeAttribute('rel');
    }
  }
}

/* ---------- Popover alignment to the mobile status strip ---------- */
/* Anchors the hours popover so its top edge sits flush with the
   bottom of the thin "status strip" (Open/Closed + address). */
function alignHoursPopover() {
  // Prefer the mobile status strip when it's visible; otherwise use the sticky nav/site header
  const strip = document.getElementById('statusStrip');
  const stripVisible = strip && getComputedStyle(strip).display !== 'none';

  const anchor =
    (stripVisible && strip) ||
    document.querySelector('.sticky-nav') ||
    document.querySelector('.site-header');

  if (!anchor) return;

  const rect = anchor.getBoundingClientRect(); // viewport coords for position:fixed anchor
  const top = rect.bottom;                      // sit flush under the bar

  // Position the fixed popover in viewport space
  pop.style.top = `${top}px`;
  pop.style.right = '16px';                     // keep your existing horizontal snap
}

function openPop() {
  pop.hidden = false;
  ovl.hidden  = false;
  btn.setAttribute('aria-expanded', 'true');
  alignHoursPopover();        // <- make sure it’s aligned when opened
}

/* Keep alignment while the page moves/resizes */
let alignRaf = null;
const queueAlign = () => {
  if (pop.hidden) return;
  if (alignRaf) cancelAnimationFrame(alignRaf);
  alignRaf = requestAnimationFrame(alignHoursPopover);
};
window.addEventListener('scroll', queueAlign, { passive:true });
window.addEventListener('resize', queueAlign);
    
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
  
  // NEW: Hours pill tooltip (uses hoursNote text)
(function hoursTooltip(){
  const btn  = document.getElementById('hoursBtn');
  const tip  = document.getElementById('hoursTip');
  const note = document.getElementById('hoursNote');
  if (!btn || !tip) return;

  const syncTip = () => {
    // prefer the live message the hours() code put on the button
    tip.textContent = btn.dataset.tip || 'Store hours';
    // fallback using note text if needed
    if ((!tip.textContent || tip.textContent === 'Store hours') && note) {
      const raw = (note.textContent || '').trim();
      const short = raw.replace(/^We’re\s*/i,'')
                       .replace(/\s*today\.?$/i,'')
                       .replace(/^We\s*/,'');
      tip.textContent = short || 'Store hours';
    }
  };

  const show = () => { syncTip(); tip.hidden = false; };
  const hide = () => { tip.hidden = true;  };

  btn.addEventListener('mouseenter', show);
  btn.addEventListener('mouseleave', hide);
  btn.addEventListener('focus',      show);
  btn.addEventListener('blur',       hide);

  setInterval(syncTip, 60 * 1000);
  syncTip();
})();

  // ================= Maps (smart open) =================
(function maps() {
  const btn = document.getElementById('openMapsSmart');
  if (!btn) return;

  const ADDRESS = '435 Blue Star Hwy, Douglas, MI 49406';

  // Button opens the right maps app on phones, Google Maps on desktop
  btn.addEventListener('click', () => {
    const href = smartMapHref(ADDRESS); // uses your helper above
    if (/^https?:/i.test(href)) {
      window.open(href, '_blank', 'noopener');   // desktop/web
    } else {
      window.location.href = href;               // app schemes: maps:// (iOS) / geo: (Android)
    }
  });

  // Optional: clicking the map card (outside the iframe) opens Google Maps in a new tab
  const mapLink = document.querySelector('.map-link');
  if (mapLink) {
    mapLink.addEventListener('click', (e) => {
      // ignore clicks that originate inside the iframe
      if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'iframe') return;
      const webUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(ADDRESS);
      window.open(webUrl, '_blank', 'noopener');
    });
  }
})();
  
  // ================= Loyalty expand & remove "Continue" =================
  (function loyalty() {
    const start = document.getElementById('loyStart');
    const body  = document.getElementById('loyBody');
    const email = document.getElementById('loyEmail');
    if (!body || !email) return;
    const reveal = () => { if (body.hidden) body.hidden = false; };
    const nukeStart = () => { start?.remove(); };
    // Reveal and remove button as soon as user interacts with email
    email.addEventListener('focus', () => { reveal(); nukeStart(); }, { once: true });
    email.addEventListener('input', () => { reveal(); nukeStart(); }, { once: true });
    // Still support clicking the old button if they tap it first
    start?.addEventListener('click', (e) => {
      e.preventDefault();
      reveal();
      nukeStart();
    });
  })();
  // Clean up any old wishlist storage
  try { localStorage.removeItem('wishlist'); } catch (e) {}
});

// === Mobile status strip: mirror pill + keep clickable address ===
(function statusStripSync(){
  const strip   = document.getElementById('statusStrip');
  const dot     = strip ? strip.querySelector('.status-dot') : null;
  const textEl  = document.getElementById('statusText');
  const pillBtn = document.getElementById('hoursBtn');
  const addrEl  = document.getElementById('statusAddr');

  if (!strip || !pillBtn || !dot || !textEl) return;

  // Keep the address link from toggling the popover
  addrEl?.addEventListener('click', (e) => e.stopPropagation());

  // Ensure address is set (safe even if already in HTML)
  const ADDRESS = '435 Blue Star Hwy, Douglas, MI 49406';
  if (addrEl){
    addrEl.textContent = ADDRESS;
     }

  const setText = (label, klass) => {
    textEl.className = 'status-text';
    if (klass) textEl.classList.add(klass);
    textEl.textContent = label;
  };

  const syncState = () => {
    dot.classList.remove('is-open','is-soon','is-closed');

    if (pillBtn.classList.contains('state-open')){
      dot.classList.add('is-open');   setText('Open','open');
    } else if (pillBtn.classList.contains('state-soon')){
      dot.classList.add('is-soon');   setText('Closing Soon','soon');
    } else if (pillBtn.classList.contains('state-closed')){
      dot.classList.add('is-closed'); setText('Closed','closed');
    } else {
      setText('Store status','');
    }
  };

  // Clicking the strip opens the Hours popover (same as pill)
  strip.addEventListener('click', () => pillBtn.click());

  // 1) Initial (after hours() has painted)
  setTimeout(syncState, 0);

  // 2) Resync when the pill’s class changes
  const mo = new MutationObserver(syncState);
  mo.observe(pillBtn, { attributes: true, attributeFilter: ['class'] });

  // 3) Periodic refresh so it flips automatically at open/close minutes
  setInterval(syncState, 30 * 1000);
})();

// Make the address in the thin status strip open the Hours popover
(function () {
  const addrEl = document.getElementById('statusAddr');   // the address in the strip
  const pillBtn = document.getElementById('hoursBtn');    // the OPEN/CLOSED pill button
  if (!addrEl || !pillBtn) return;

  // If it's still an <a>, neutralize its navigation
  addrEl.removeAttribute?.('href');
  addrEl.removeAttribute?.('target');

  // Tap = open the same popover as the pill
  addrEl.style.cursor = 'pointer';
  addrEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    pillBtn.click();
  });
})();

// Only smooth-scroll in-page anchors; never hijack real links.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;

  const href = a.getAttribute('href') || '';

  // External / new-tab / explicit external: let the browser handle it.
  if (
    a.hasAttribute('data-ext') ||
    a.target === '_blank' ||
    /^https?:\/\//i.test(href)
  ) {
    return; // no preventDefault
  }

  // In-page anchor (e.g., #deals)
  if (href.startsWith('#')) {
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

(() => {
  const btn = document.getElementById('searchBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // If you add a filter input later, you can focus it here:
    // document.getElementById('shopFilter')?.focus();
  });
})();
