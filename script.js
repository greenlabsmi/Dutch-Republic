/* =========================================================
   DUTCH REPUBLIC — UNIFIED MASTER ENGINE
   Everything in one place. Clean, fast, and feature-complete.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[dr] Dutch Republic engine: Online');

  // --- 1. UTILITIES ---
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function smoothTo(el) {
    if (!el) return;
    const yPos = el.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' });
  }

  // --- 2. AGE GATE & PROMO ---
  const ageGate = document.getElementById('ageGate');
  const promoModal = document.getElementById('promoModal');

  if (ageGate && !sessionStorage.getItem('dr_age_verified')) {
    ageGate.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  document.getElementById('btnAgePass')?.addEventListener('click', () => {
    sessionStorage.setItem('dr_age_verified', 'true');
    ageGate.setAttribute('hidden', 'true');
    document.body.style.overflow = '';
    if (!localStorage.getItem('dr_gift_claimed')) {
      setTimeout(() => promoModal?.removeAttribute('hidden'), 10000);
    }
  });

  document.getElementById('btnAgeFail')?.addEventListener('click', () => location.href = "https://google.com");
  [document.getElementById('btnClosePromo'), document.getElementById('btnPromoOk')].forEach(b => b?.addEventListener('click', () => {
    promoModal?.setAttribute('hidden', 'true');
    localStorage.setItem('dr_gift_claimed', 'true');
  }));

  // --- 3. NAV & DRAWER ---
  const drawer = document.getElementById('navDrawer');
  const ovl = document.getElementById('menuOverlay');
  
  document.querySelectorAll('[data-open-menu]').forEach(btn => btn.addEventListener('click', () => {
    drawer.classList.add('is-active');
    ovl.classList.add('is-active');
    document.querySelectorAll('.drawer__link').forEach((l, i) => setTimeout(() => l.classList.add('revealed'), 80 * i));
  }));

  const closeDrawer = () => {
    drawer.classList.remove('is-active');
    ovl.classList.remove('is-active');
  };
  [document.querySelector('[data-close-menu]'), ovl].forEach(el => el?.addEventListener('click', closeDrawer));

  // Intercept all scroll links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"], [data-scroll]');
    if (!link) return;
    const targetId = link.getAttribute('data-scroll') || link.getAttribute('href');
    if (targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      closeDrawer();
      smoothTo(targetEl);
    }
  });

  // --- 4. DEALS & HIGHLIGHTS (deals.json) ---
  (async function initDeals() {
    try {
      const r = await fetch(`./deals.json?v=${Date.now()}`);
      const data = await r.json();
      const dealList = document.getElementById('dealList');
      const jumpWrap = document.getElementById('dealJumpWrap');

      // Render Jump Chips
      if (jumpWrap) {
        jumpWrap.innerHTML = '<button class="drJumpChip" data-scroll="#dealsDrop">All Deals</button>' + 
          data.deals.map(cat => `<button class="drJumpChip" data-scroll="#cat-${cat.category.replace(/\s+/g, '')}">${cat.category}</button>`).join('');
      }

      // Render Deal Groups
      if (dealList) {
        dealList.innerHTML = data.deals.map(cat => `
          <section class="drCat" id="cat-${cat.category.replace(/\s+/g, '')}" data-category-block>
            <div class="drCat__head"><h3 class="drCat__title">${esc(cat.category)}</h3></div>
            <div class="drLines">${cat.items.map(line => `<div class="drLine"><div class="drLine__text">${esc(line)}</div></div>`).join('')}</div>
          </section>
        `).join('') + `<div class="drTaxBanner"><strong>Pricing Update:</strong> All prices are <strong>Out The Door (Tax Included)</strong>.</div>`;
      }

      // Render Highlights
      const hMount = document.getElementById('highlightsMount');
      if (hMount && data.highlights) {
        const renderH = (id, type) => {
          const it = data.highlights.items[id];
          const isMini = type === 'mini';
          return `
            <a href="#shop" class="thCard th${type.charAt(0).toUpperCase() + type.slice(1)}" onclick="event.preventDefault(); document.querySelector('[data-open-shop]').click();">
              <div class="thMedia"></div><div class="thOverlay"></div>
              <div class="thContent" style="position:absolute; bottom:0; width:100%; height:100%; padding:24px; display:flex; flex-direction:column; justify-content:center;">
                <div class="thMiniTitle" style="color:#fff; font-weight:800; font-size:${isMini ? '20px' : '32px'};">${esc(it.title)}</div>
                <div style="color:#D6A34A; font-size:${isMini ? '26px' : '48px'}; font-weight:950;">${esc(it.price)}</div>
                ${!isMini && it.details ? `<div style="color:#aaa;">${esc(it.details)}</div>` : ''}
              </div>
            </a>`;
        };
        const h = data.highlights;
        hMount.innerHTML = renderH(h.layout.hero, 'hero') + 
          `<div class="thGrid2">${h.layout.mid.map(id => renderH(id, 'mid')).join('')}</div>` +
          `<div class="thRowWrap"><div class="thRowTitle">More deals</div><div class="thRow">${h.layout.scroll.map(id => renderH(id, 'mini')).join('')}</div></div>`;
      }
    } catch(e) { console.error('Deals error:', e); }
  })();

  // Dropdown & Search Toggle
  const dealsDrop = document.getElementById('dealsDrop');
  document.querySelector('.drDrop__summary')?.addEventListener('click', (e) => {
    e.preventDefault();
    dealsDrop.classList.toggle('is-fully-open');
  });

  document.getElementById('dealSearch')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.drLine').forEach(l => l.style.display = l.textContent.toLowerCase().includes(q) ? 'grid' : 'none');
    document.querySelectorAll('.drCat').forEach(c => {
      const has = Array.from(c.querySelectorAll('.drLine')).some(l => l.style.display !== 'none');
      c.style.display = has ? 'block' : 'none';
    });
  });

  // --- 5. EDUCATION ACCORDION ---
  document.querySelectorAll('[data-guide-card]').forEach(card => {
    card.querySelector('.guideCard__toggle')?.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = card.classList.contains('is-open');
      document.querySelectorAll('[data-guide-card]').forEach(c => c.classList.remove('is-open'));
      if (!isOpen) {
        card.classList.add('is-open');
        setTimeout(() => smoothTo(card), 300);
      }
    });
  });

  // --- 6. TROPHY ROOM & MODAL ---
  const strainsUrl = 'https://dutchtouchgenetics.com/strains.json';
  const dave = { "Mr. Clean": "Strong citrus (lime) known for high, energetic effects.", "Lilac Diesel": "Complex profile of citrus, berries, and earthy pine." };

  (async function initStrains() {
    try {
      const r = await fetch(strainsUrl);
      const list = await r.json();
      const featured = list.filter(s => s.award === true).slice(0, 4);
      const mount = document.getElementById('current-strains');
      if (mount) {
        mount.innerHTML = featured.map(s => `
          <article class="strain-card" data-strain-name="${esc(s.name)}">
            <div class="strain-card-inner">
              <div class="strain-image" style="background-image: url('https://dutchtouchgenetics.com/${s.image}')"></div>
              <h3 class="strain-name">${esc(s.name)}</h3>
              <p class="strain-notes">${esc(dave[s.name] || s.description)}</p>
            </div>
          </article>`).join('');
      }
    } catch(e) { console.error('Strains failed'); }
  })();

  // --- 7. SHOP & MAPS ---
  const openShop = () => {
    document.getElementById('shop').hidden = false;
    if (!document.getElementById('leafly-embed-script')) {
      const s = document.createElement('script');
      s.id = 'leafly-embed-script';
      s.src = 'https://web-embedded-menu.leafly.com/loader.js';
      s.dataset.slug = 'dutch-republic';
      s.dataset.primary = '#D6A34A';
      document.getElementById('leafly-embed-wrapper').appendChild(s);
    }
    setTimeout(() => smoothTo(document.getElementById('shop')), 100);
  };
  document.querySelectorAll('[data-open-shop]').forEach(b => b.addEventListener('click', openShop));

  document.querySelectorAll('a[href*="google.com/maps"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const dest = encodeURIComponent("435 Blue Star Hwy, Douglas, MI 49406");
      const isApple = /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
      window.open(isApple ? `https://maps.apple.com/?daddr=${dest}` : `https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
    });
  });

  // --- 8. BEST IN GRASS POPUP ---
  setTimeout(() => {
    const style = document.createElement('style');
    style.innerHTML = `@keyframes awardDrop { 0% { transform: scale(0.8) translateY(-40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }`;
    document.head.appendChild(style);
    const popup = document.createElement('div');
    popup.style = "position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.85); backdrop-filter:blur(4px);";
    popup.innerHTML = `
      <div style="background:#0b0d0c; border:3px solid #D6A34A; border-radius:24px; padding:35px 25px; max-width:500px; text-align:center; animation:awardDrop 0.6s forwards;">
        <h2 style="color:#fff; font-family:Cinzel;">Best In Grass</h2>
        <p style="color:#aaa;">Judge Kits are almost gone! Grab yours in-store today.</p>
        <button id="close-big" style="background:#D6A34A; color:#000; border:none; padding:10px 20px; border-radius:99px; margin-top:20px; cursor:pointer;">GOT IT</button>
      </div>`;
    document.body.appendChild(popup);
    document.getElementById('close-big').onclick = () => popup.remove();
  }, 15000);
});
