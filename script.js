/* ===========================
   script.js (FINAL SEALED VERSION)
   Dutch Republic — 1:1 Green Labs Engine
   Fixes:
   - Un-nested listeners (dropdown and strains now work)
   - Fixed syntax error in text escaping
   - Douglas, MI routing & Dutch Republic Leafly API
=========================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[dr] Dutch Republic engine booted');

    // ===== 1. AGE GATE & SMART PROMO LOGIC =====
    const ageGate = document.getElementById('ageGate');
    const promoModal = document.getElementById('promoModal');
    const btnPass = document.getElementById('btnAgePass');
    const btnFail = document.getElementById('btnAgeFail');

    if (ageGate && !sessionStorage.getItem('dr_age_verified')) {
        ageGate.removeAttribute('hidden');
        document.body.style.overflow = 'hidden'; 
    }

    if (btnPass) {
        btnPass.addEventListener('click', () => {
           sessionStorage.setItem('dr_age_verified', 'true');
            ageGate.setAttribute('hidden', 'true');
            document.body.style.overflow = ''; 

            if (!localStorage.getItem('dr_gift_claimed')) {
                setTimeout(() => { showGiftPopup(); }, 10000);
            }
        });
    }

    if (btnFail) {
        btnFail.addEventListener('click', () => {
            window.location.href = "https://www.google.com";
        });
    }

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

    document.querySelector('[data-open-promo]')?.addEventListener('click', (e) => {
        e.preventDefault();
        showGiftPopup();
        document.getElementById('navDrawer')?.classList.remove('is-active');
        document.getElementById('menuOverlay')?.classList.remove('is-active');
    });
   
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&', '<': '<', '>': '>', '"': '&quot;', "'": '&#39;'
    }[c]));

    function smoothTo(el) {
        if (!el) return;
        const stickyH = 70;
        const stripOffset = window.pageYOffset < 50 ? 34 : 0;
        const yPos = el.getBoundingClientRect().top + window.pageYOffset - (stickyH + 20) - stripOffset;
        window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' });
    }

    // ===== 2. MASTER SCROLL & NAV DRAWER =====
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        const scrollBtn = e.target.closest('[data-scroll]');
        let targetSelector = null;
        if (scrollBtn) targetSelector = scrollBtn.getAttribute('data-scroll');
        else if (link) targetSelector = link.getAttribute('href');

        if (targetSelector && targetSelector !== '#') {
            const targetEl = document.querySelector(targetSelector);
            if (targetEl) {
                e.preventDefault();
                smoothTo(targetEl);
            }
        }
    });

    (function drawer() {
        const openBtns = document.querySelectorAll('[data-open-menu]');
        const closeBtn = document.querySelector('[data-close-menu]');
        const drawer = document.getElementById('navDrawer');
        const ovl = document.getElementById('menuOverlay');
        const links = drawer ? document.querySelectorAll('.drawer__link') : [];

        if (!openBtns.length || !drawer || !ovl) return;
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
        openBtns.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); drawer.classList.contains('is-active') ? close() : open(); }));
        if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); close(); });
        ovl.addEventListener('click', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    })();

    // ===== 3. DEALS DROPDOWN LOGIC =====
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

    // ===== 4. LEAFLY SHOP INJECTION =====
    const shopSection = document.getElementById('shop');
    const leaflyWrapper = document.getElementById('leafly-embed-wrapper');
    let currentLeaflyType = null; 

    function injectLeafly(shopType) {
        if (!leaflyWrapper) return;
        if (currentLeaflyType === shopType) return;
        if (currentLeaflyType !== null) { window.location.hash = 'shop-' + shopType; window.location.reload(); return; }

        const s = document.createElement('script');
        s.id = 'leafly-embed-script'; 
        s.src = 'https://web-embedded-menu.leafly.com/loader.js';
        s.dataset.origin = 'https://web-embedded-menu.leafly.com';
        s.dataset.slug = 'dutch-republic'; 
        s.dataset.primary = '#D6A34A';   s.dataset.secondary = '#2ef8bb'; s.dataset.deals = '#CE300A'; 
        leaflyWrapper.appendChild(s);
        currentLeaflyType = shopType;
    }

    function openShop(scrollAlso) {
        if (shopSection) shopSection.hidden = false;
        injectLeafly('rec');
        if (scrollAlso && shopSection) { setTimeout(() => { shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
    }

    document.querySelectorAll('[data-open-shop]').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); openShop(true); }));

    // ===== 5. LOAD DEALS.JSON & RENDER DROPDOWN =====
    (function loadDeals() {
        const dealList = document.getElementById('dealList');
        const highlightsMount = document.getElementById('highlightsMount');
        if (!dealList) return;

        fetch(`./deals.json?v=${Date.now()}`, { cache: 'no-store' })
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(data => {
                const dealsData = Array.isArray(data) ? data : (data.deals || []);
                renderDealsDropdown(dealsData, dealList);
                if (highlightsMount && data.highlights) renderHighlightsFromConfig(data.highlights, highlightsMount);
            })
            .catch(err => { console.error('Deals load failed:', err); });
    })();

    function renderDealsDropdown(data, target) {
        target.innerHTML = data.map(cat => `
            <section class="drCat" data-category-block>
                <div class="drCat__head"><h3 class="drCat__title">${esc(cat.category)}</h3></div>
                <div class="drLines">${(cat.items || []).map(line => `<div class="drLine"><div class="drLine__text">${esc(line)}</div></div>`).join('')}</div>
            </section>
        `).join('') + '<div class="drTaxBanner"><strong>Pricing Update:</strong> All prices shown are <strong>Out The Door (Tax Included)</strong>.</div>';
    }

    function renderHighlightsFromConfig(config, mount) {
        const cardHTML = (it, type) => {
            if (!it) return '';
            const isMini = type === 'mini';
            const shopClick = `event.preventDefault(); document.querySelector('[data-open-shop]').click();`;
            return `
                <a href="#shop" class="thCard ${type === 'hero' ? 'thHero' : type === 'mid' ? 'thMid' : 'thMini'}" onclick="${shopClick}">
                    <div class="thMedia" style="background-color:#111"></div>
                    <div class="thOverlay" style="background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%);"></div>
                    <div class="thContent" style="position:absolute; bottom:0; width:100%; padding: 24px; display: flex; flex-direction: column; justify-content: center; height:100%;">
                        <div class="thMiniTitle" style="color:#fff; font-weight: 800; font-size: ${isMini ? '20px' : '32px'};">${esc(it.title)}</div>
                        ${it.price ? `<div style="color: #D6A34A; font-size: ${isMini ? '26px' : '48px'}; font-weight: 950;">${esc(it.price)}</div>` : ''}
                        ${!isMini && it.details ? `<div style="color:#aaa;">${esc(it.details)}</div>` : ''}
                        ${!isMini ? `<div class="thCta" style="color:var(--gold); text-decoration:underline; margin-top:10px;">Shop Deal →</div>` : ''}
                    </div>
                </a>`;
        };

        const hero = config.items[config.layout.hero];
        const mid = config.layout.mid.map(id => config.items[id]);
        const scroll = config.layout.scroll.map(id => config.items[id]);

        mount.innerHTML = `
            ${cardHTML(hero, 'hero')}
            <div class="thGrid2">${mid.map(it => cardHTML(it, 'mid')).join('')}</div>
            <div class="thRow" style="display:flex; gap:12px; overflow-x:auto; padding-bottom:20px;">${scroll.map(it => cardHTML(it, 'mini')).join('')}</div>
        `;
    }

    // ===== 6. MAPS & TROPHY ROOM =====
    const mapSelectors = '.smart-map, a[href*="google.com/maps"]';
    document.querySelectorAll(mapSelectors).forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const dest = "435 Blue Star Hwy, Douglas, MI 49406";
            const isApple = /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
            window.open(isApple ? `https://maps.apple.com/?daddr=${encodeURIComponent(dest)}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`, '_blank');
        });
    });

    (async function loadStrains() {
        try {
            const r = await fetch('https://dutchtouchgenetics.com/strains.json');
            const strains = await r.json();
            const featured = strains.filter(s => s.award === true).slice(0, 4);
            const mount = document.getElementById('current-strains');
            if (mount) {
                mount.innerHTML = featured.map(s => `
                    <article class="strain-card">
                        <div class="strain-card-inner">
                            <div class="strain-image" style="background-image: url('https://dutchtouchgenetics.com/${s.image}'); height:200px; background-size:cover;"></div>
                            <h3 class="strain-name" style="color:#fff; font-family:Cinzel; margin-top:15px;">${esc(s.name)}</h3>
                            <p style="color:#aaa; font-size:14px;">${esc(s.description)}</p>
                        </div>
                    </article>
                `).join('');
            }
        } catch(e) { console.error('Strains load failed'); }
    })();
});
