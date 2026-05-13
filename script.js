/* =========================================================
   DUTCH REPUBLIC — UNIFIED MASTER ENGINE
   Final Production Version — Douglas, MI
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[dr] Dutch Republic engine: Online');

    // --- 1. UTILITIES ---
    const esc = (s) => {
        if (!s) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    function smoothTo(el) {
        if (!el) return;
        const stickyH = 70;
        const stripOffset = window.pageYOffset < 50 ? 34 : 0;
        const yPos = el.getBoundingClientRect().top + window.pageYOffset - (stickyH + 20) - stripOffset;
        window.scrollTo({ top: Math.max(0, yPos), behavior: 'smooth' });
    }

    // --- 2. AGE GATE & SMART PROMO ---
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

    // --- 4. REVEAL ENGINE ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // --- 5. DEALS & HIGHLIGHTS ---
    (async function initDeals() {
        try {
            const r = await fetch(`./deals.json?v=${Date.now()}`);
            const data = await r.json();
            const dealList = document.getElementById('dealList');
            const jumpWrap = document.getElementById('dealJumpWrap');

            if (jumpWrap && data.deals) {
                jumpWrap.innerHTML = '<button class="drJumpChip" data-scroll="#dealsDrop">All Deals</button>' + 
                    data.deals.map(cat => `<button class="drJumpChip" data-scroll="#cat-${cat.category.replace(/[^a-z0-9]/gi, '')}">${cat.category}</button>`).join('');
            }

            if (dealList && data.deals) {
                dealList.innerHTML = data.deals.map(cat => `
                    <section class="drCat" id="cat-${cat.category.replace(/[^a-z0-9]/gi, '')}" data-category-block>
                        <div class="drCat__head"><h3 class="drCat__title">${esc(cat.category)}</h3></div>
                        <div class="drLines">${(cat.items || []).map(line => `<div class="drLine" data-line><div class="drLine__text">${esc(line)}</div></div>`).join('')}</div>
                    </section>
                `).join('') + `<div class="drTaxBanner"><strong>Pricing Update:</strong> All prices are <strong>Out The Door (Tax Included)</strong>.</div>`;
            }

            const hMount = document.getElementById('highlightsMount');
            if (hMount && data.highlights) {
                const renderH = (id, type) => {
                    const it = data.highlights.items[id];
                    if (!it) return '';
                    const isMini = type === 'mini';
                    return `
                        <a href="#shop" class="thCard th${type.charAt(0).toUpperCase() + type.slice(1)}" onclick="event.preventDefault(); document.querySelector('[data-open-shop]').click();">
                            <div class="thMedia"></div><div class="thOverlay"></div>
                            <div class="thContent" style="position:absolute; bottom:0; width:100%; height:100%; padding:24px; display:flex; flex-direction:column; justify-content:center;">
                                <div class="thMiniTitle" style="color:#fff; font-weight:800; font-size:${isMini ? '20px' : '22px'};">${esc(it.title)}</div>
                                <div style="color:#D6A34A; font-size:${isMini ? '28px' : '48px'}; font-weight:950;">${esc(it.price)}</div>
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

    const dealsDrop = document.getElementById('dealsDrop');
    dealsDrop?.addEventListener('click', (e) => {
        if (!dealsDrop.classList.contains('is-fully-open')) {
            dealsDrop.classList.add('is-fully-open');
            return;
        }
        if (e.target.closest('.drDrop__summary')) {
            dealsDrop.classList.remove('is-fully-open');
        }
    });

    document.getElementById('dealSearch')?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('[data-line]').forEach(line => {
            line.style.display = line.textContent.toLowerCase().includes(q) ? 'grid' : 'none';
        });
        document.querySelectorAll('[data-category-block]').forEach(cat => {
            const hasMatch = Array.from(cat.querySelectorAll('[data-line]')).some(l => l.style.display !== 'none');
            cat.style.display = hasMatch ? 'block' : 'none';
        });
    });

    // --- 6. TROPHY ROOM ---
    (async function initStrains() {
        try {
            const r = await fetch('https://dutchtouchgenetics.com/strains.json');
            const list = await r.json();
            const priorityOrder = ["Mr. Clean", "Lemon Wookie #4", "Lilac Diesel"];
            const sortedAwards = list
                .filter(s => s.award === true)
                .sort((a, b) => {
                    let idxA = priorityOrder.indexOf(a.name);
                    let idxB = priorityOrder.indexOf(b.name);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            const mount = document.getElementById('current-strains');
            if (mount) {
                mount.innerHTML = sortedAwards.map(s => `
                    <article class="strain-card">
                        <div class="award-badge-corner">AWARD WINNER</div>
                        <div class="strain-card-inner">
                            <div class="strain-image" style="background-image: url('https://dutchtouchgenetics.com/${s.image}')"></div>
                            <h3 class="strain-name">${esc(s.name)}</h3>
                            <p class="strain-notes">${esc(s.description)}</p>
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

    document.querySelectorAll('a[href*="maps.google"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const dest = encodeURIComponent("435 Blue Star Hwy, Douglas, MI 49406");
            const isApple = /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
            window.open(isApple ? `https://maps.apple.com/?daddr=${dest}` : `https://maps.google.com/?daddr=${dest}`, '_blank');
        });
    });

    // --- 8. BEST IN GRASS PROMO ---
    setTimeout(() => {
        if (!document.getElementById('big-styles')) {
            const style = document.createElement('style');
            style.id = 'big-styles';
            style.innerHTML = `
                @keyframes awardDrop { 0% { transform: scale(0.8) translateY(-40px); opacity: 0; } 50% { transform: scale(1.02) translateY(5px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
                @keyframes goldGradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .big-gradient-text { background: linear-gradient(90deg, #D6A34A, #f2c14e, #B8860B, #D6A34A); background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: goldGradientFlow 8s ease infinite; }
                .big-gradient-bg { background: linear-gradient(90deg, #D6A34A, #f2c14e, #B8860B, #D6A34A); background-size: 300% 300%; animation: goldGradientFlow 8s
