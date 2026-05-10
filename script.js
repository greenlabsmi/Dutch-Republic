/* ===========================
   script.js (FULL REPLACEMENT)
   Dutch Republic — 1:1 Green Labs Engine
   Fixes:
   - Douglas, MI routing
   - Dutch Republic Leafly API
   - Tax Included / Out The Door Pricing
   - Auto-Centered Mini Highlight Tiles
=========================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[dr] Dutch Republic engine booted');

   // ===== AGE GATE & SMART PROMO LOGIC =====
    const ageGate = document.getElementById('ageGate');
    const promoModal = document.getElementById('promoModal');
    const btnPass = document.getElementById('btnAgePass');
    const btnFail = document.getElementById('btnAgeFail');

    // 1. Show Age Gate if not verified
    if (ageGate && !sessionStorage.getItem('dr_age_verified')) {
        ageGate.removeAttribute('hidden');
        document.body.style.overflow = 'hidden'; 
    }

    // 2. "Yes, I am 21" Logic
    if (btnPass) {
        btnPass.addEventListener('click', () => {
           sessionStorage.setItem('dr_age_verified', 'true');
            ageGate.setAttribute('hidden', 'true');
            document.body.style.overflow = ''; 

            // Only show the gift popup if they haven't dismissed it before
            if (!localStorage.getItem('dr_gift_claimed')) {
                setTimeout(() => {
                    showGiftPopup();
                }, 10000); // 10 Second Delay
            }
        });
    }

    // 3. "No, I am not" Logic
    if (btnFail) {
        btnFail.addEventListener('click', () => {
            window.location.href = "https://www.google.com";
        });
    }

    // 4. Promo Popup Function
    function showGiftPopup() {
        if (!promoModal) return;
        promoModal.removeAttribute('hidden');
        
        const closeBtn = document.getElementById('btnClosePromo');
        const okBtn = document.getElementById('btnPromoOk');
        
        [closeBtn, okBtn].forEach(b => b?.addEventListener('click', () => {
            promoModal.setAttribute('hidden', 'true');
            localStorage.setItem('dr_gift_claimed', 'true');
        }));
    }

    // 5. Drawer "Safety Net" Button Logic
    document.querySelector('[data-open-promo]')?.addEventListener('click', (e) => {
        e.preventDefault();
        showGiftPopup();
        // Close the drawer so they can see the popup
        document.getElementById('navDrawer')?.classList.remove('is-active');
        document.getElementById('menuOverlay')?.classList.remove('is-active');
    });
   
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // FIXED: Syntax error removed, properly escaping quotes
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&', '<': '<', '>': '>', '"': '&quot;', "'": '&#39;'
  }[c]));

  function fixAssetPath(p) {
    const s = String(p || '').trim();
    if (!s) return '';
    if (s.startsWith('/assets/')) return `.${s}`;   
    if (s.startsWith('assets/')) return `./${s}`;  
    return s; 
  }

  function smoothTo(el) {
    if (!el) return;
    const stickyH = 70;
    const stripOffset = window.pageYOffset < 50 ? 34 : 0;
    const yPos = el.getBoundingClientRect().top + window.pageYOffset - (stickyH + 20) - stripOffset;
    
    window.scrollTo({
      top: Math.max(0, yPos),
      behavior: prefersReduce ? 'auto' : 'smooth'
    });
  }

  // ===== MASTER SCROLL INTERCEPTOR =====
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    const scrollBtn = e.target.closest('[data-scroll]');
    
    let targetSelector = null;
    if (scrollBtn) {
      targetSelector = scrollBtn.getAttribute('data-scroll');
    } else if (link) {
      targetSelector = link.getAttribute('href');
    }

    if (targetSelector && targetSelector !== '#') {
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        e.preventDefault(); 
        smoothTo(targetEl);
      }
    }
  });

  // ===== SMART STICKY HEADER TRIGGER =====
  const handleSmartScroll = () => {
      if (window.scrollY > 50) {
          document.body.classList.add('is-scrolled');
      } else {
          document.body.classList.remove('is-scrolled');
      }
  };
  window.addEventListener('scroll', handleSmartScroll, { passive: true });

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
  const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              observer.unobserve(entry.target);
          }
      });
  }, revealOptions);

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

}); // FIXED: Added missing closing bracket here!


// ===== SMART NATIVE MAPS ROUTER =====
document.addEventListener('DOMContentLoaded', () => {
  const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  const mapLinks = document.querySelectorAll('a[href*="google.com/maps"]');

  mapLinks.forEach(link => {
    if (isApple) {
      const address = "435 Blue Star Hwy, Douglas, MI 49406";
      link.href = `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
      link.removeAttribute('target');
    }
  });

  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-scroll');
      const el = target ? document.querySelector(target) : null;
      if (el) {
          const stickyH = 70;
          const stripOffset = window.pageYOffset < 50 ? 34 : 0;
          const yPos = el.getBoundingClientRect().top + window.pageYOffset - (stickyH + 20) - stripOffset;
          window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' });
      }
    });
  });

  (function reveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('is-in');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  })();

  // ===== Today’s Highlights FX =====
  function initTodaysHighlightsFX() {
    const root = document.getElementById('todays-highlights');
    if (!root) return;
    const revealEls = Array.from(root.querySelectorAll('.thReveal'));
    const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduce && revealEls.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const idx = revealEls.indexOf(el);
          el.style.transitionDelay = (idx >= 0 ? Math.min(idx * 80, 320) : 0) + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        });
      }, { threshold: 0.12 });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('is-in'));
    }
  }

  // ===== Deals open helper =====
  const dealsDrop = document.getElementById('dealsDrop');
  function openDeals(scrollAlso) {
    const dealsSection = document.getElementById('deals');
    if (scrollAlso && dealsSection) {
        const yPos = dealsSection.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' });
    }
    setTimeout(() => {
      if (dealsDrop) dealsDrop.open = true;
    }, 220);
  }

  document.addEventListener('click', (e) => {
    const hit = e.target.closest('[data-open-deals]');
    if (!hit) return;
    e.preventDefault();
    openDeals(true);
  });

  // ===== Shop reveal & Leafly Injection =====
  const shopSection = document.getElementById('shop');
  const leaflyWrapper = document.getElementById('leafly-embed-wrapper');
  let currentLeaflyType = null; 

  function injectLeafly(shopType) {
      if (!leaflyWrapper) return;
      if (currentLeaflyType === shopType) return;
      
      if (currentLeaflyType !== null) {
          window.location.hash = 'shop-' + shopType;
          window.location.reload();
          return;
      }

      const s = document.createElement('script');
      s.id = 'leafly-embed-script'; 
      s.src = 'https://web-embedded-menu.leafly.com/loader.js';
      s.dataset.origin = 'https://web-embedded-menu.leafly.com';
      s.dataset.slug = 'dutch-republic'; 
      s.dataset.environment = shopType === 'med' ? 'medical' : 'recreational';
      s.dataset.primary = '#D6A34A';   // Gold
      s.dataset.secondary = '#2ef8bb'; // Emerald
      s.dataset.deals = '#CE300A';     // Deals
      
      leaflyWrapper.appendChild(s);
      currentLeaflyType = shopType;
  }

  function openShop(scrollAlso, shopType = 'rec') {
      if (shopSection) shopSection.hidden = false;
      
      const giantBtn = document.querySelector('.drShopBtn');
      if (giantBtn) giantBtn.style.display = 'none';

      injectLeafly(shopType);

      if (scrollAlso && shopSection) {
          setTimeout(() => {
              shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
      }
  }

  window.addEventListener('DOMContentLoaded', () => {
      if (window.location.hash === '#shop-med') {
          openShop(true, 'med');
          history.replaceState(null, null, ' '); 
      } else if (window.location.hash === '#shop-rec') {
          openShop(true, 'rec');
          history.replaceState(null, null, ' '); 
      }
  });

  document.querySelectorAll('[data-open-shop]').forEach(el => 
      el.addEventListener('click', (e) => {
          e.preventDefault();
          const btnText = el.textContent.toLowerCase();
          const tagValue = el.getAttribute('data-open-shop');
          
          if (tagValue === 'med' || btnText.includes('med')) {
              if (shopSection) shopSection.hidden = false;
              setTimeout(() => {
                  if (shopSection) shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
              const modal = document.getElementById('med-promo-modal');
              if (modal) modal.hidden = false;
          } else {
              openShop(true, 'rec');
          }
      })
  );

  document.getElementById('close-med-modal')?.addEventListener('click', () => {
      document.getElementById('med-promo-modal').hidden = true;
  });

  document.getElementById('proceed-to-shop')?.addEventListener('click', () => {
      document.getElementById('med-promo-modal').hidden = true;
      openShop(true, 'rec'); 
  });

  // ===== Drawer =====
  (function drawer() {
    const openBtns = document.querySelectorAll('[data-open-menu]');
    const closeBtn = document.querySelector('[data-close-menu]');
    const drawer = document.getElementById('navDrawer');
    const ovl = document.getElementById('menuOverlay');
    const links = drawer ? document.querySelectorAll('.drawer__link') : [];

    if (!openBtns.length || !drawer || !ovl) return;

    drawer.hidden = false;
    ovl.hidden = false;
    openBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));

    const open = () => {
      drawer.classList.add('is-active');
      ovl.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      links.forEach((link, index) => {
        setTimeout(() => link.classList.add('revealed'), 140 * (index + 1));
      });
    };

    const close = () => {
      drawer.classList.remove('is-active');
      ovl.classList.remove('is-active');
      links.forEach(link => link.classList.remove('revealed'));
      document.body.style.overflow = '';
    };

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        drawer.classList.contains('is-active') ? close() : open();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });

    ovl.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    drawer.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.classList.contains('icon--close')) return;

      if (btn.hasAttribute('data-open-deals')) { close(); openDeals(true); return; }
      if (btn.hasAttribute('data-open-shop')) { close(); openShop(true); return; }

      const hash = btn.getAttribute('data-scroll');
      if (hash) {
        close();
        const el = document.querySelector(hash);
        if (el) {
            const yPos = el.getBoundingClientRect().top + window.pageYOffset - 90;
            window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' });
        }
      }
    });
  })();

  // ===== Deals + Highlights render (from deals.json) =====
  (function loadDeals() {
    const dealList = document.getElementById('dealList');
    const tilesWrap = document.getElementById('dealTiles');
    const highlightsMount = document.getElementById('highlightsMount');

    if (!dealList) {
      console.warn('Missing #dealList in HTML. Deals dropdown cannot render.');
      return;
    }

    const url = `./deals.json?v=${Date.now()}`;

    // FIXED: Escaping function inside loadDeals logic
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&', '<': '<', '>': '>', '"': '&quot;', "'": '&#39;'
    }[c]));

    fetch(url, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => '');
          throw new Error(`Failed to load deals.json (${r.status}) ${text.slice(0, 120)}`);
        }
        return r.json();
      })
      .then((data) => {
      const dealsData = Array.isArray(data) ? data : (data.deals || []);
      renderDealsDropdown(dealsData);
      
      if (highlightsMount && data && data.highlights) {
        renderHighlightsFromConfig(data.highlights, highlightsMount);
      } else if (highlightsMount) {
        highlightsMount.innerHTML = '';
      }
      initTodaysHighlightsFX();
    })
      .catch((err) => {
        console.error(err);
        dealList.innerHTML = `
          <div class="cat">
            <div class="catTitle">Deals unavailable right now.</div>
            <div style="font-weight:800;opacity:.75;margin-top:8px;">
              Check that <code>deals.json</code> exists at the published site path and is valid JSON.
            </div>
          </div>
        `;
        if (tilesWrap) tilesWrap.innerHTML = '';
        if (highlightsMount) {
          highlightsMount.innerHTML = `
            <div style="padding:14px;font-weight:800;opacity:.7;color:#121614;">
              Highlights unavailable.
            </div>
          `;
        }
        initTodaysHighlightsFX();
      });

   function slugifyDealCategory(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function highlightDealMatch(text, query) {
  if (!query) return esc(text);
  const safe = esc(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    return safe.replace(new RegExp(`(${escapedQuery})`, 'ig'), '<mark>$1</mark>');
  } catch {
    return safe;
  }
}

function normalizeDealsData(data) {
  if (!Array.isArray(data)) return [];
  return data.map((cat) => {
    const category = cat.category || 'Deals';
    const id = slugifyDealCategory(category);
    let groups = [];
    if (Array.isArray(cat.groups) && cat.groups.length) {
      groups = cat.groups.map((g) => ({
        title: g.title || '',
        lines: Array.isArray(g.items) ? g.items.filter(Boolean) : []
      }));
    } else if (Array.isArray(cat.items) && cat.items.length) {
      groups = [{
        title: '',
        lines: cat.items.filter(Boolean)
      }];
    }
    return { category, id, groups };
  }).filter(cat => cat.groups.some(g => g.lines.length));
}

function bindDealJumpChips() {
  const wrap = document.getElementById('dealJumpWrap');
  if (!wrap) return;
  wrap.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSel = btn.getAttribute('data-jump');
      const target = document.querySelector(targetSel);
      if (!target) return;
      
      wrap.querySelectorAll('.drJumpChip').forEach(chip => chip.classList.remove('is-active'));
      btn.classList.add('is-active');
      const yPos = target.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' }); 
    });
  });
}

function bindDealSearch() {
  const input = document.getElementById('dealSearch');
  const meta = document.getElementById('dealSearchMeta');
  const cats = document.querySelectorAll('[data-category-block]');
  const lines = document.querySelectorAll('[data-line]');
  if (!input || !cats.length) return;

  const run = () => {
    const q = input.value.trim().toLowerCase();
    let visibleCategories = 0;
    let visibleLines = 0;

    lines.forEach(line => {
      const hay = line.getAttribute('data-search') || '';
      const textEl = line.querySelector('[data-line-text]');
      const originalText = textEl ? textEl.textContent : '';

      const match = !q || hay.includes(q);
      line.classList.toggle('is-hidden', !match);

      if (textEl) {
        textEl.innerHTML = match ? highlightDealMatch(originalText, q) : esc(originalText);
      }
      if (match) visibleLines++;
    });

    cats.forEach(cat => {
      const catLines = cat.querySelectorAll('[data-line]');
      const visibleCatLines = [...catLines].filter(line => !line.classList.contains('is-hidden'));

      const groups = cat.querySelectorAll('[data-group]');
      groups.forEach(group => {
        const groupLines = group.querySelectorAll('[data-line]');
        const hasVisible = [...groupLines].some(line => !line.classList.contains('is-hidden'));
        group.style.display = hasVisible ? '' : 'none';
      });

      const hasVisibleCategory = visibleCatLines.length > 0;
      cat.classList.toggle('is-hidden', !hasVisibleCategory);
      if (hasVisibleCategory) visibleCategories++;
    });

    if (meta) {
      if (q) {
        meta.hidden = false;
        meta.textContent = visibleLines
          ? `Showing ${visibleLines} matching deal${visibleLines === 1 ? '' : 's'} across ${visibleCategories} categor${visibleCategories === 1 ? 'y' : 'ies'}.`
          : `No deals matched “${input.value.trim()}”. Try another keyword like flower, ounce, carts, or edible.`;
      } else {
        meta.hidden = true;
        meta.textContent = '';
      }
    }
  };
  input.addEventListener('input', run);
}

function bindDealBackTop() {
    const drop = document.getElementById('dealsDrop');
    const backTop = document.getElementById('drBackTop');
    if (!drop || !backTop) return;
    backTop.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        const dealsDropTarget = document.getElementById('dealsDrop');
        const yPos = dealsDropTarget.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' });
    });
}

function renderDealsDropdown(data) {
    const jumpWrap = document.getElementById('dealJumpWrap');
    const searchMeta = document.getElementById('dealSearchMeta');
    const cats = normalizeDealsData(data);

    if (!cats.length) {
      dealList.innerHTML = '<div class="drEmpty">No deals available right now.</div>';
      if (jumpWrap) jumpWrap.innerHTML = '';
      if (searchMeta) {
        searchMeta.hidden = true;
        searchMeta.textContent = '';
      }
      return;
    }

    dealList.innerHTML = cats.map(cat => {
      const lineCount = cat.groups.reduce((sum, g) => sum + g.lines.length, 0);
      const groupsHtml = cat.groups.map(group => {
        const linesHtml = group.lines.map(line => `
          <div class="drLine" data-line data-search="${esc(`${cat.category} ${group.title || ''} ${line}`.toLowerCase())}">
            <div class="drLine__dot" aria-hidden="true">•</div>
            <div class="drLine__text" data-line-text>${esc(line)}</div>
          </div>
        `).join('');
        return `
          <div class="drGroup" data-group>
            ${group.title ? `<div class="drGroup__title">${esc(group.title)}</div>` : ''}
            <div class="drLines">
              ${linesHtml}
            </div>
          </div>
        `;
      }).join('');

      return `
        <section class="drCat" id="deal-cat-${cat.id}" data-category-block data-category-name="${esc(cat.category.toLowerCase())}">
          <div class="drCat__head">
            <div class="drCat__titleWrap">
              <h3 class="drCat__title">${esc(cat.category)}</h3>
            </div>
            <div class="drCat__count">${lineCount} deal${lineCount === 1 ? '' : 's'}</div>
          </div>
          ${groupsHtml}
        </section>
      `;
    }).join('') + `
<div class="drTaxBanner">
        <strong>Pricing Update:</strong> All prices are shown <strong>Out The Door (Tax Included)</strong>.
      </div>`;
    
    if (jumpWrap) {
      jumpWrap.innerHTML = `
        <button class="drJumpChip" type="button" data-jump="#dealsDrop">
          All Deals
        </button>
      ` + cats.map(cat => `
        <button class="drJumpChip" type="button" data-jump="#deal-cat-${cat.id}">
          ${esc(cat.category.replace(/^[^\w]+/, '').trim())}
        </button>
      `).join('');
    }

    if (searchMeta) {
      searchMeta.hidden = true;
      searchMeta.textContent = '';
    }

    bindDealJumpChips();
    bindDealSearch();
    bindDealBackTop();
  }

function renderHighlightsFromConfig(data, mount) {
    if (!data || !data.items || !data.layout) return;

    const { items, layout } = data;
    const hero = items[layout.hero];
    const midL = layout.mid ? items[layout.mid[0]] : null;
    const midR = layout.mid ? items[layout.mid[1]] : null;
    const scrollIds = layout.scroll || [];

    const cardHTML = (it, type) => {
      if (!it) return '';
      let sizeClass = type === 'hero' ? 'thHero thReveal' : type === 'mid' ? 'thMid thReveal' : 'thMini';
      const pillClass = it.tag ? `thPill--${it.tag.toLowerCase().replace(/[^a-z]/g, '')}` : '';
      let img = it.image || '';
      if (img && img.startsWith('/assets/')) img = `.${img}`;

      const shopClick = `event.preventDefault(); const nav = document.querySelector('[data-open-shop=\\'rec\\']') || document.querySelector('[data-open-shop]'); if(nav) nav.click();`;

      if (type === 'mini') {
        return `
          <a href="#shop" class="thCard ${sizeClass}" onclick="${shopClick}">
            <div class="thMedia" style="background-image:url('${esc(img)}')"></div>
            <div class="thOverlay" style="background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.9) 100%);"></div>
            <div class="thContent thContent--mini" style="position:absolute; bottom:0; width:100%; height: 100%; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
              <div class="thMiniTitle" style="color:#fff; font-weight: 800; font-size: 20px; line-height: 1.2; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">${esc(it.title)}</div>
              ${it.price ? `<div style="color: #D6A34A; display: block; font-size: 26px; margin-top: 6px; font-weight: 950; text-shadow: 0 2px 10px rgba(0,0,0,1);">${esc(it.price)}</div>` : ''}
            </div>
          </a>
        `;
      }
      return `
        <a href="#shop" class="thCard ${sizeClass}" onclick="${shopClick}">
          <div class="thMedia" style="background-image:url('${esc(img)}')"></div>
          <div class="thOverlay"></div>
          <div class="thContent">
            ${it.tag ? `<div class="thPill ${pillClass}">${esc(it.tag)}</div>` : ''}
            <h3 class="thH3">${esc(it.title)}</h3>
            ${it.price ? `<div class="thPrice">${esc(it.price)} <span class="thTaxTag">TAX INCLUDED</span></div>` : ''}
            ${it.details ? `<div class="thDetails">${esc(it.details)}</div>` : ''}
            <div class="thCta">Shop Deal →</div>
          </div>
        </a>
      `;
    };

    mount.innerHTML = `
        ${hero ? cardHTML(hero, 'hero') : ''}
        <div class="thGrid2">
            ${midL ? cardHTML(midL, 'mid') : ''}
            ${midR ? cardHTML(midR, 'mid') : ''}
        </div>
        <div class="thRowWrap thReveal">
            <div class="thRowTitle">More deals</div>
            <div class="thRow" role="list" aria-label="More deals">
                ${scrollIds.map(id => items[id]).filter(Boolean).map(it => cardHTML(it, 'mini')).join('')}
            </div>
        </div>
    `;
}
})(); // FIXED: Added missing closing bracket here to finish Deals block!

document.addEventListener('DOMContentLoaded', () => {
  // ===== DEALS DROPDOWN LOGIC =====
    const dealsDrop = document.getElementById('dealsDrop');
    const dealsSummary = document.querySelector('.drDrop__summary');
    const dealsBody = document.querySelector('.drDrop__body');

    if (dealsDrop && dealsSummary && dealsBody) {
        dealsDrop.setAttribute('open', 'true');
        dealsSummary.addEventListener('click', (e) => {
            e.preventDefault(); 
            dealsDrop.classList.toggle('is-fully-open');
        });
        dealsBody.addEventListener('click', (e) => {
            if (!dealsDrop.classList.contains('is-fully-open') && !e.target.closest('.drSearch')) {
                dealsDrop.classList.add('is-fully-open');
            }
        });
    }
     
    const dealJumpWrap = document.getElementById('dealJumpWrap');
    const leftArrow = document.getElementById('jumpArrowLeft');
    const rightArrow = document.getElementById('jumpArrowRight');

    if (dealJumpWrap && leftArrow && rightArrow) {
      leftArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        dealJumpWrap.scrollBy({ left: -250, behavior: 'smooth' });
      });
      rightArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dealJumpWrap.scrollBy({ left: 250, behavior: 'smooth' });
      });
  }
});

// =========================================================
// DTG DYNAMIC GENETICS & MODAL (Shared with Brand Site)
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {
    let strains = [];
    try {
        const response = await fetch('https://dutchtouchgenetics.com/strains.json');
        strains = await response.json();

        // --- THE DAVE DICTIONARY --- 
        const davesOverrides = {
            "Illudium": { lineage: "Hawaiian Indica x Pre98 Bubba", type: "Hybrid", description: "Effects include feeling relaxed, happy, and sleepy. Patients often choose Illudium when dealing with symptoms associated with insomnia, pain, and stress. Illudium features flavors like chocolate, caramel, and coffee. The aromatic profile balances bright citrus and herbal woodland with a peppery, fuel-tinged base. Primary notes often include lemon zest, sweet orange rind, and crushed juniper, wrapped in whispers of diesel and black pepper." },
            "Dead Prez": { lineage: "Death Star x Dread Bread", type: "Hybrid", description: "Primary Aromas: Sour spite smell. Skunky, sweet jet fuel, and diesel. Undertones: Earthy, pungent, with hints of citrus and spice (pepper)." },
            "Cobra Lips": { lineage: "Chem 3 x Appalachia", type: "Hybrid", description: "Aroma & Taste: The strain is known for a complex, pungent terpene profile featuring notes of pine, wet soil, funk, fuel, and a tart, green apple finish. Effects: Long-lasting, and energetic buzz that balances euphoria with a relaxed physical state. It is often described as a functional yet potent high." },
            "Vortex": { lineage: "Space Queen x Apollo 13", type: "Sativa", description: "Aroma/Taste: The flavor profile is described as a mix of sweet and sour lemon, with strong notes of tropical mango and, at times, a 'funky' or 'rotting fruit' undertone." },
            "Strawberry Daiquiri": { lineage: "Strawberry Cough x Jack the Ripper", type: "Sativa", description: "Aroma combines notes of strawberry, cherry and chocolate on an acidic background, while its energetic, positive effect can prove highly effective for users battling against anxiety and depression." },
            "Sticky Trap": { lineage: "Gorilla Glue 4 x Vortex", type: "Hybrid", description: "Aroma: GG4 has a pungent, earthy, and piney aroma with hints of diesel and chocolate. Vortex leans toward a sweet, tropical, and fruity profile. Together, the combo creates a balanced blend of pungent earthiness from GG4 with sweet, tropical, and citrusy notes from Vortex, making a complex and aromatic flavor experience." },
            "Mr. Clean": { lineage: "Lime Skunk x The Cube", type: "Sativa", description: "Strong citrus (lime), sour, earthy, and skunky, described as tasting like lemon-pine cleaners. Known for high, energetic, and creative effects." },
            "Ripped Bubba": { lineage: "Bubba Kush Pre-98 X Jacks Cleaner X Space Queen", type: "Hybrid", description: "Creative and Motivational in the mind and calming in the body and soul. Taste: Cherry, Kush, Hash, Black Berry, Skittles Candy, some variations have a heavier Lemon smell." },
            "Falcon 9": { lineage: "Sunset Sherb X Tina", type: "Indica", description: "Noted for a smooth, gassy ice cream flavor profile that comes from dark purple buds accented by vibrant orange pistils. Meant for indica lovers, Falcon 9 is known to start as a strong head high before settling into the body. Patients report that it can help with chronic pain, depression, and PTSD." },
            "13 Layer Cake": { lineage: "Apollo 13 x Wonka Bars", type: "Sativa", description: "Aroma and taste are unique and very pungent with hints of GMO. Its scent has been described as peppery/garlic and earthy. Taste takes on the herbal notes of tea with a skunky aftertaste." },
            "Agent Orange": { description: "Agent Orange is a well-balanced hybrid marijuana strain with uplifting and motivating effects. Agent Orange has an aroma of fresh-cut citrus and is an excellent mood enhancer if you are feeling lethargic or depressed." },
            "AJ's Cream Cake": { description: "Cream is a hybrid weed strain made from a genetic cross between Wedding Cake and Gelato #33. Leafly customers tell us Cream effects include feeling focused, aroused, and tingly." },
            "Angelica": { description: "A strain with 2.42% total terpenes - Highest in β-Myrcene, D-Limonene, and β-Caryophyllene. Buds grow large and dense in a Kush fashion, offering a thick smoke. Expect flavor notes of lemon, hash, incense, and menthol to flood your senses with a euphoric high that will blanket your mind and body." },
            "Apollo 13": { description: "The high is clear and cerebral, without a hint of paranoia. Her citrus flavor and happy high make Apollo 13 very popular at parties! Exquisite terpene profile with 2.45% total terpenes." },
            "Bonkers": { description: "The result is a fruity strain with a creamy lemon flavor profile that erupts from beautiful lime green buds. The experience makes for a smooth buzz that is toned down in intensity." },
            "Caesar": { description: "Consumers can expect the insane trichome production associated with Original Glue alongside a potent gassy nose that will catch attention after cracking the seal. Prepare to be baked in physical bliss and relaxation." },
            "Clusterfunk": { description: "Deep notes of oil and fuelly funk paired with skunky, sour hues. ClusterFunk is suitable for evening usage and for whenever you want to go nuclear." },
            "Crunchberries": { description: "The resulting flowers are long, bushy and practically white-colored with trichome density. The CrunchBerry’s high delivers a uplifting and peaceful effect. The strain reportedly delivers a vanilla-and-pine aroma." },
            "Death Star": { description: "This strain is named for its skunky sweet jet fuel aromas that are pungent and fill up your nostrils. It has a powerful buzz that can make you feel sleepy, relaxed, and euphoric." },
            "Death By Funk": { description: "Deep notes of oil and fuelly funk paired with skunky, sour hues and sweet jet fuel aromas that are pungent and fill up your nostrils. It has a powerful buzz that can make you feel sleepy, relaxed, and euphoric. Medical marijuana patients often choose this when dealing with symptoms associated with stress, pain, and anxiety. Features flavors like diesel, pungent, and tea." },
            "Double Dutch Cookies": { description: "Super frosty appearance and sweet kush flavor notes with hints of mango cookies." },
            "Field Trip": { description: "Field Trip is a hybrid weed strain made from a genetic cross between GSC and Sunshine Daydream." },
            "Forbidden Jelly": { description: "This strain produces uplifting and cerebral effects that will make you feel happy and perhaps tingly. The heavy amount of Caryohphyllene gives off a nice relaxing body high without being sedated to the couch." },
            "Goji OG": { description: "The flavor of Goji OG is as unique as the berry it's named after, offering a dynamic aroma including red berry, black cherry, strawberry, hawaiian punch, and licorice." },
            "Grease Monkey": { description: "Grease Monkey is a sweet hybrid marijuana strain with earthy and skunky overtones. This strain saddles the consumer with a lazy, munchie-fueled body buzz that may soften the blow of chronic pain, nausea, and stress." },
            "Hawaiian Bread": { description: "Hawaiian is a sativa marijuana strain known to provide happy and creative thoughts. This strain features an aroma that will remind you of tropical fruits." },
            "Jesus OG": { description: "Consumers enjoy the lemony kush aroma of this indica-dominant cross, along with heavy effects that relax the body while leaving the mind functional and clear." },
            "Lilac Diesel": { description: "Big buds have a complex terpene profile, including notes of citrus, sweet berries, earthy pine, and chem. Lilac Diesel is a great afternoon strain for a lackadaisical adventure." },
            "Mango Hashplant": { description: "Her tight, resin-drenched flower clusters develop a brittle surface when dried and give off a deep, rich Afghani aroma that’s undercut with a hint of hashish." },
            "Milk & Cookies": { description: "The odor is gassy, but sweet, with creamy hints of vanilla and orange citrus. Smoking or vaping Milk and Cookies turns the creamy flavor sour, leaving a peppery bite upon the exhale." },
            "Orange Kush Cake": { description: "Consumers can expect a rich, complicated terpene profile including notes of sharp orange, citrus, gas, sour candy, dried grapes, and even earthy sandalwood." },
            "Querkle": { description: "Querkle carries a strong grape and berry aroma. Heavily euphoric and cerebral, Querkle may be used during the day but is ideal for evening use as it relaxes muscles and guides the mind into sleep." },
            "Sky Lotus": { description: "The aroma is a mixture of Pine-Sol, lemon, and sweet berries, while the flavor is more piney and floral. This plant develops an abundance of trichomes which leads to a potent, punchy buzz." },
            "Space Monkey": { description: "The aroma is pungent, funky, sour, and dank with a little sweet lavender for good measure. Enthusiasts love its relaxing body high, low-key head high." },
            "Super Silver Hash Plant": { description: "Flavors and aromas include notes of fuel, hazy, and dank. The high will leave you uplifted and motivated in the mind while feeling relaxed in the body." },
            "Guicy G": { description: "The taste of Guicy G will leave you begging for more, with a bouquet of fresh fruity berries, sugary citrus and touches of light spice." },
            "Solo Walker": { description: "Musky/Melon/Guava/ sweet and sour notes of funk." },
            "Hash D": { description: "Users generally report a calming, relaxing, and heavy hitting 'body stone' effect. The strain carries a strong, pungent odor that combines the chemical/fuel notes of Chem D with earthy, hashish undertones." },
            "Spirit Hashplant": { description: "Reports indicate a strong Ghost OG scent, often described as gassy, earthy, and piney." },
            "Gorilla 88": { description: "Known to provide a powerful, relaxing, and euphoric experience, often suitable for evening use due to potential couchlock. Inherits the sticky, pungent nature of GG4 with added notes of cinnamon and earth." },
            "Banana Split": { description: "The familiar tangerine burst of the Tangie is backed with the bold fruity notes from the Banana Sherbet." },
            "Double Bubble": { description: "Reports suggest a range of aromas including tropical fruit, juicy fruit bubblegum, hash, musk, and sandalwood." },
            "Death Z": { description: "Hops/Floral/hints of gas and citrus coming from parents death star and z skittlez." },
            "Pina Rita": { description: "The strain is famous for a unique combination of pineapple and cherry candy notes. Provides a very tasty, functional, and uplifting high, making it great for daytime use." },
            "Chocolate Marshmallows": { description: "Flavors of sweet chocolate and creamy vanilla galore. The aroma is just as mouthwatering, with a sweet white chocolate smell that's accented by a punch of skunky pungency." }
        };

        // --- MASTER AWARD INJECTION LIST ---
        const awardsMap = {
            "Mr. Clean": "🏆 1st Place Sativa (High Times Cannabis Cup).",
            "Lilac Diesel": "🏆 3rd Place Sativa (High Times Cannabis Cup).",
            "Forbidden Jelly": "🏆 3rd Place Nug Run Sugar Solvent (Best in Grass).",
            "Lemon Wookie #4": "🏆 2nd Place (Best in Grass).",
            "Death By Funk": "🏆 3rd Place Indica Flower (Best in Grass)."
        };

        strains.forEach(s => {
            const overrideKey = Object.keys(davesOverrides).find(key => s.name.toLowerCase().includes(key.toLowerCase()));
            if (overrideKey) {
                if (davesOverrides[overrideKey].lineage) s.lineage = davesOverrides[overrideKey].lineage;
                if (davesOverrides[overrideKey].type) s.type = davesOverrides[overrideKey].type;
                if (davesOverrides[overrideKey].description) s.description = davesOverrides[overrideKey].description;
            }

            if (s.name.includes("Death By Funk")) s.award = true;
            let awardText = awardsMap[s.name];
            if (!awardText && s.name.includes("Lemon Wookie")) awardText = "🏆 2nd Place (Best in Grass).";

            if (awardText) {
                s.award = true;
                s.description = awardText + " " + (s.description || "");
            }
        });

        let angelica = strains.find(s => s.name.includes("Angelica"));
        if (angelica) {
            angelica.award = true;
            angelica.name = "Angelica RSO";
            angelica.type = "RSO";
            angelica.description = "🏆 1st Place RSO (High Times Cannabis Cup). " + (angelica.description || "");
        } else {
            strains.push({ name: "Angelica RSO", slug: "angelica-rso", award: true, type: "RSO", lineage: "Angelica Extract", breeder: "Dutch Touch Genetics", description: "🏆 1st Place RSO (High Times Cannabis Cup)." });
        }

        let spaceHippy = strains.find(s => s.name.includes("Space Hippy"));
        if (spaceHippy) {
            spaceHippy.award = true;
            spaceHippy.description = "🏆 2nd Place Nug Run Sugar Solvent & 3rd Place Disposable (High Times Cannabis Cup). " + (spaceHippy.description || "");
        } else {
            strains.push({ name: "Space Hippy", slug: "space-hippy", award: true, type: "HYBRID", lineage: "DTG Exclusive", breeder: "Dutch Touch Genetics", description: "🏆 2nd Place Nug Run Sugar Solvent & 3rd Place Disposable (High Times Cannabis Cup)." });
        }

        let whiteWampa = strains.find(s => s.name.includes("White Wampa"));
        if (!whiteWampa) {
            strains.push({ name: "White Wampa", slug: "white-wampa", award: true, type: "INFUSED PRE-ROLL", lineage: "DTG Exclusive", breeder: "Dutch Touch Genetics", description: "🏆 3rd Place Infused Pre-Roll (High Times Cannabis Cup)." });
        }

        renderFeaturedGenetics(strains);

    } catch (error) {
        console.error('Failed to load strains:', error);
    }

    function renderFeaturedGenetics(data) {
        const mount = document.getElementById('current-strains');
        if (!mount) return;

        mount.innerHTML = '';
        let featured = data.filter(s => s.award === true);

        const customOrder = ["Mr. Clean", "Lemon Wookie", "Lemon Wookie #4"];
        featured.sort((a, b) => {
            const indexA = customOrder.indexOf(a.name);
            const indexB = customOrder.indexOf(b.name);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.name.localeCompare(b.name);
        });

        mount.innerHTML = featured.map(s => {
            let img = s.image ? 'https://dutchtouchgenetics.com/' + s.image : 'https://dutchtouchgenetics.com/assets/img/logo/dtg-logo-orange.png';
            
            return `
            <article class="strain-card award-card" id="strain-${s.slug}">
                <div class="award-badge-corner">AWARD WINNER</div>
                <div class="strain-card-inner">
                    <div class="strain-image" style="background-image: url('${img}');"></div>
                    <div class="strain-top">
                        <h3 class="strain-name">${s.name}</h3>
                        <span class="strain-badge">${s.type.toUpperCase()}</span>
                    </div>
                    <p class="strain-meta">${s.lineage}</p>
                    <p class="strain-notes">${s.description}</p>
                </div>
            </article>
            `;
        }).join('');
    }

    const modalHTML = `
    <div class="strain-modal" id="glStrainModal">
        <div class="strain-modal-dialog">
            <button class="strain-modal-close" id="glCloseModal">×</button>
            <div class="strain-modal-layout">
                <div class="strain-modal-media"><img id="glModalImage" src="" alt="" class="strain-modal-image"></div>
                <div class="strain-modal-body">
                    <div class="strain-modal-badge" id="glModalBreeder"></div>
                    <h3 class="strain-modal-title" id="glModalName"></h3>
                    <div class="strain-modal-info">
                        <p><span>TYPE</span> <strong id="glModalType" style="color:#fff;"></strong></p>
                        <p><span>LINEAGE</span> <strong id="glModalLineage" style="color:#fff;"></strong></p>
                        <p><span>THC</span> <strong id="glModalThc" style="color:#fff;"></strong></p>
                    </div>
                    <p class="strain-modal-desc" id="glModalDesc"></p>
                    <div class="strain-modal-cta" style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
                        <a href="https://dutchtouchgenetics.com/strains.html" class="btn btn--gold" style="width: 100%;">
                            Explore DTG Vault →
                        </a>
                        <button id="glModalShopBtn" class="btn btn--ghost" onclick="document.getElementById('glCloseModal').click(); const nav = document.querySelector('[data-open-shop]'); if(nav) nav.click();" style="width: auto; padding: 6px 20px; font-size: 13px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;">
                            Shop Strain →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    if (!document.getElementById('glStrainModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('glStrainModal');
    const closeBtn = document.getElementById('glCloseModal');

    document.body.addEventListener('click', (e) => {
        const card = e.target.closest('.strain-card');
        if (!card) return;

        const name = card.querySelector('.strain-name').innerText;
        const s = strains.find(item => item.name === name);
        
        if (s) {
            document.getElementById('glModalName').innerText = s.name;
            document.getElementById('glModalBreeder').innerText = "Genetics by " + s.breeder;
            document.getElementById('glModalType').innerText = s.type.toUpperCase();
            document.getElementById('glModalLineage').innerText = s.lineage;
            document.getElementById('glModalThc').innerText = s.thc || "N/A";
            document.getElementById('glModalDesc').innerText = s.description;

            const outOfStockList = ["Lemon Wookie #4", "Angelica RSO","Forbidden Jelly","Space Hippy",]; 
            const shopBtn = document.getElementById('glModalShopBtn');
            
            if (outOfStockList.includes(s.name)) {
                shopBtn.innerHTML = "Out of Stock";
                shopBtn.style.background = "transparent"; 
                shopBtn.style.color = "#555";
                shopBtn.style.borderColor = "#333";
                shopBtn.style.cursor = "not-allowed";
                shopBtn.onclick = (e) => { e.preventDefault(); }; 
            } else {
                shopBtn.innerHTML = "Shop Strain →";
                shopBtn.style.background = "rgba(255,255,255,0.05)"; 
                shopBtn.style.color = "rgba(255,255,255,0.7)";
                shopBtn.style.borderColor = "rgba(255,255,255,0.15)";
                shopBtn.style.cursor = "pointer";
                shopBtn.onclick = (e) => { 
                    e.preventDefault();
                    document.getElementById('glCloseModal').click(); 
                    const mainNavShop = document.querySelector('[data-open-shop="rec"]') || document.querySelector('[data-open-shop]');
                    if(mainNavShop) mainNavShop.click(); 
                };
            }

            let img = s.image ? 'https://dutchtouchgenetics.com/' + s.image : 'https://dutchtouchgenetics.com/assets/img/logo/dtg-logo-orange.png';
            if (document.getElementById('glModalImage')) {
                document.getElementById('glModalImage').src = img;
            }
            
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; 
        }
    });

    const closeDialog = () => {
        if (modal) modal.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDialog);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeDialog();
        });
    }
});

// ===== SMART MAP LINK (Aggressive Catch-All for ALL map links) =====
const mapSelectors = '.smart-map, a[href*="google.com/maps"], a[href*="maps.google"], a[href*="maps.app.goo.gl"], a[href*="goo.gl/maps"]';

document.querySelectorAll(mapSelectors).forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); 
        const destination = "435 Blue Star Hwy, Douglas, MI 49406"; 
        const isApple = /iPad|iPhone|iPod|Mac/.test(navigator.userAgent) && !window.MSStream;
        
        if (isApple) {
            window.open(`https://maps.apple.com/?daddr=${encodeURIComponent(destination)}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank');
        }
    });
});

// ===== THE LEAFLY BODYGUARD (ANTI-CRASH FIX) =====
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
            const section = document.querySelector(href);
            if (section) {
                e.preventDefault(); 
                history.replaceState(null, null, window.location.pathname); 
                section.scrollIntoView({ behavior: 'smooth' }); 
            }
        }
    }
});

document.addEventListener('click', (e) => {
    if (e.target.closest('.deli-shop-btn') || e.target.closest('#glModalShopBtn')) {
        const leaflyIframe = document.querySelector('iframe[src*="leafly"]');
        if (leaflyIframe) {
            e.preventDefault();
            e.stopPropagation();
            window.location.hash = '#shop-rec';
            window.location.reload();
        }
    }
});

// ============================================================
// MASTER EDUCATION TILE LOGIC (GLITCH-FREE)
// ============================================================
document.querySelectorAll('[data-guide-card]').forEach(card => {
    const btn = card.querySelector('.guideCard__toggle');
    const btnText = card.querySelector('.guideCard__toggleText');
    const btnIcon = card.querySelector('.guideCard__toggleIcon');

    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = card.classList.contains('is-open');

        document.querySelectorAll('[data-guide-card]').forEach(otherCard => {
            otherCard.classList.remove('is-open');
            const otherBtn = otherCard.querySelector('.guideCard__toggleText');
            const otherIcon = otherCard.querySelector('.guideCard__toggleIcon');
            if (otherBtn) otherBtn.innerText = "Read the full answer";
            if (otherIcon) otherIcon.innerText = "+";
        });

        if (!isOpen) {
            card.classList.add('is-open');
            btnText.innerText = "Close full answer";
            btnIcon.innerText = "−";
            
            setTimeout(() => {
                const yPos = card.getBoundingClientRect().top + window.pageYOffset - 90;
                window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' });
            }, 300);
        } else {
            const section = document.getElementById('learn-before-you-buy');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}); 

// --- BEST IN GRASS PROMO POP-UP (ANIMATED GRADIENT EDITION) ---
setTimeout(() => {
    if (!document.getElementById('big-styles')) {
        const style = document.createElement('style');
        style.id = 'big-styles';
        style.innerHTML = `
            @keyframes awardDrop { 0% { transform: scale(0.8) translateY(-40px); opacity: 0; } 50% { transform: scale(1.02) translateY(5px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
            @keyframes bigGradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            .big-gradient-text { background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff); background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: bigGradientFlow 24s ease infinite;  }
            .big-gradient-bg { background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff); background-size: 300% 300%; animation: bigGradientFlow 24s ease infinite; }
            .big-gradient-border { position: relative; border-radius: 24px; background: #0b0d0c; background-clip: padding-box; border: 3px solid transparent;  }
            .big-gradient-border::before { content: ''; position: absolute; inset: -3px; border-radius: 26px; z-index: -1; background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff); background-size: 300% 300%; animation: bigGradientFlow 24s ease infinite; }
        `;
        document.head.appendChild(style);
    }

    const bigPopup = document.createElement('div');
    bigPopup.id = 'big-promo-popup';
    bigPopup.style = "position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.85); backdrop-filter:blur(4px);";
    
    bigPopup.innerHTML = `
        <div class="big-gradient-border" style="position:relative; width:90%; max-width:520px; padding:35px 25px; text-align:center; box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 50px rgba(189, 0, 255, 0.2); animation: awardDrop 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;">
            <button id="close-big" style="position:absolute; top:-15px; right:-15px; width:38px; height:38px; background:#D6A34A; color:#000; font-family:Arial, sans-serif; font-size:26px; border:2px solid #000; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.6); z-index: 10000; transition: transform 0.2s ease, background 0.2s ease;">×</button>
            <div class="big-gradient-bg" style="display:inline-block; font-size:14px; font-weight:950; letter-spacing:0.15em; color:#fff; padding:6px 20px; border-radius:999px; margin-bottom:18px; box-shadow: 0 4px 15px rgba(189, 0, 255, 0.4);">
                MAY 9TH EXCLUSIVE
            </div>
            <div style="background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); border-radius: 18px; padding: 24px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                <h2 style="font-family:'Cinzel', serif; font-size:36px; font-weight:900; color:#fff; margin:0 0 12px; line-height:1.1;">Best In Grass</h2>
                <p style="color:rgba(255,255,255,0.95); font-size:16px; font-weight:800; line-height:1.5; margin:0;">
                   Judge Kits Are Almost Gone! Start Judging Now!<br>
                    <span style="font-weight:600; font-size: 14px; color: rgba(255,255,255,0.75); display:block; margin-top:8px;">Put your lungs where your mouth is. Grab an official judge kit and tell the rest of Michigan what's actually good. Kits are IN-STORE ONLY while supplies last.</span>
                </p>
            </div>
            <div style="background: rgba(0,0,0,0.75); border: 1px solid rgba(189, 0, 255, 0.3); padding: 18px; border-radius: 16px; margin-bottom: 24px; box-shadow: inset 0 0 20px rgba(189,0,255,0.05), 0 10px 20px rgba(0,0,0,0.5);">
                <div class="big-gradient-text" style="font-size:13px; font-weight:900; letter-spacing:0.1em; margin-bottom:6px;">🔥 SPECIAL EVENT PRICING 🔥</div>
                <div style="color:#fff; font-family:'Cinzel', serif; font-size:18px; font-weight:900; line-height:1.3; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">
                    Exclusive Deli Deals, Fresh Drops,<br>& Elite Discounts All Day
                </div>
            </div>
            <button id="btn-big-shop" class="btn big-gradient-bg" style="width:100%; font-size:16px; padding:14px 0; color:#fff; border:none; box-shadow: 0 10px 30px rgba(189,0,255,0.4); font-weight: 950; border-radius: 999px; cursor: pointer; transition: 0.2s; letter-spacing: 0.05em;">VIEW COMPETITION DETAILS</button>
            <p style="color:rgba(255,255,255,0.4); font-size:12px; font-style:italic; margin:16px 0 0;">Ask your budtender for more details.</p>
        </div>
    `;
    document.body.appendChild(bigPopup);
    
    const closeBtn = document.getElementById('close-big');
    closeBtn.onmouseover = () => { closeBtn.style.transform = 'scale(1.1)'; closeBtn.style.background = '#fff'; };
    closeBtn.onmouseout = () => { closeBtn.style.transform = 'scale(1)'; closeBtn.style.background = '#D6A34A'; };

    const shopBtn = document.getElementById('btn-big-shop');
    shopBtn.onmouseover = () => { shopBtn.style.transform = 'translateY(-3px)'; shopBtn.style.boxShadow = '0 15px 40px rgba(189,0,255,0.6)'; };
    shopBtn.onmouseout = () => { shopBtn.style.transform = 'translateY(0)'; shopBtn.style.boxShadow = '0 10px 30px rgba(189,0,255,0.4)'; };
    
    const closePopup = () => {
        bigPopup.remove();
    };
    closeBtn.onclick = closePopup;

    bigPopup.onclick = (e) => {
        if (e.target === bigPopup) {
            closePopup();
        }
    };
    
    shopBtn.onclick = () => {
        closePopup();
        window.open('https://bestingrass.io/competitions/michigan-2026/', '_blank');
    };
}, 15000);
