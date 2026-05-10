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

    // Intercept all scroll and nav links
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

    // --- 4. REVEAL ENGINE (This makes the site visible) ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // --- 5. DEALS & HIGHLIGHTS (deals.json) ---
    (async function initDeals() {
        try {
            const r = await fetch(`./deals.json?v=${Date.now()}`);
            const data = await r.json();
            const dealList = document.getElementById('dealList');
            const jumpWrap = document.getElementById('dealJumpWrap');

            // Render Jump Chips
            if (jumpWrap && data.deals) {
                jumpWrap.innerHTML = '<button class="drJumpChip" data-scroll="#dealsDrop">All Deals</button>' + 
                    data.deals.map(cat => `<button class="drJumpChip" data-scroll="#cat-${cat.category.replace(/[^a-z0-9]/gi, '')}">${cat.category}</button>`).join('');
            }

            // Render Deal Groups
            if (dealList && data.deals) {
                dealList.innerHTML = data.deals.map(cat => `
                    <section class="drCat" id="cat-${cat.category.replace(/[^a-z0-9]/gi, '')}" data-category-block>
                        <div class="drCat__head"><h3 class="drCat__title">${esc(cat.category)}</h3></div>
                        <div class="drLines">${(cat.items || []).map(line => `<div class="drLine" data-line><div class="drLine__text">${esc(line)}</div></div>`).join('')}</div>
                    </section>
                `).join('') + `<div class="drTaxBanner"><strong>Pricing Update:</strong> All prices are <strong>Out The Door (Tax Included)</strong>.</div>`;
            }

            // Render Highlights
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

    // Dropdown & Search Logic
    const dealsDrop = document.getElementById('dealsDrop');
    document.querySelector('.drDrop__summary')?.addEventListener('click', (e) => {
        e.preventDefault();
        dealsDrop.classList.toggle('is-fully-open');
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
            const featured = list.filter(s => s.award === true).slice(0, 4);
            const mount = document.getElementById('current-strains');
            if (mount) {
                mount.innerHTML = featured.map(s => `
                    <article class="strain-card">
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

    document.querySelectorAll('a[href*="maps.google"], a[href*="google.com/maps"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const dest = encodeURIComponent("435 Blue Star Hwy, Douglas, MI 49406");
            const isApple = /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
            window.open(isApple ? `https://maps.apple.com/?daddr=${dest}` : `https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
        });
    });

    // --- BEST IN GRASS PROMO POP-UP (ANIMATED GRADIENT EDITION) ---
setTimeout(() => {
    // Inject custom CSS animations for the flowing gradient feel
    if (!document.getElementById('big-styles')) {
        const style = document.createElement('style');
        style.id = 'big-styles';
        style.innerHTML = `
            @keyframes awardDrop {
                0% { transform: scale(0.8) translateY(-40px); opacity: 0; }
                50% { transform: scale(1.02) translateY(5px); opacity: 1; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes bigGradientFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            /* The flowing text effect - Slowed down to 24s */
            .big-gradient-text {
                background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff);
                background-size: 300% 300%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: bigGradientFlow 24s ease infinite; 
            }
            /* The flowing background effect - Slowed down to 24s */
            .big-gradient-bg {
                background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff);
                background-size: 300% 300%;
                animation: bigGradientFlow 24s ease infinite;
            }
            /* The glowing animated border trick - Slowed down to 24s */
            .big-gradient-border {
                position: relative;
                border-radius: 24px;
                background: #0b0d0c; 
                background-clip: padding-box;
                border: 3px solid transparent; 
            }
            .big-gradient-border::before {
                content: '';
                position: absolute;
                inset: -3px;
                border-radius: 26px;
                z-index: -1;
                background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff);
                background-size: 300% 300%;
                animation: bigGradientFlow 24s ease infinite;
            }
        `;
        document.head.appendChild(style);
    }

    const bigPopup = document.createElement('div');
    bigPopup.id = 'big-promo-popup';
    // The dark overlay background wrapper
    bigPopup.style = "position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.85); backdrop-filter:blur(4px);";
    
    bigPopup.innerHTML = `
        <div class="big-gradient-border" style="position:relative; width:90%; max-width:520px; padding:35px 25px; text-align:center; box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 50px rgba(189, 0, 255, 0.2); animation: awardDrop 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;">
            
            <button id="close-big" style="position:absolute; top:-15px; right:-15px; width:38px; height:38px; background:#D6A34A; color:#000; font-family:Arial, sans-serif; font-size:26px; border:2px solid #000; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.6); z-index: 10000; transition: transform 0.2s ease, background 0.2s ease;">&times;</button>
            
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
    
    // Hover effects for the new Gold X
    const closeBtn = document.getElementById('close-big');
    closeBtn.onmouseover = () => { closeBtn.style.transform = 'scale(1.1)'; closeBtn.style.background = '#fff'; };
    closeBtn.onmouseout = () => { closeBtn.style.transform = 'scale(1)'; closeBtn.style.background = '#D6A34A'; };

    const shopBtn = document.getElementById('btn-big-shop');
    shopBtn.onmouseover = () => { shopBtn.style.transform = 'translateY(-3px)'; shopBtn.style.boxShadow = '0 15px 40px rgba(189,0,255,0.6)'; };
    shopBtn.onmouseout = () => { shopBtn.style.transform = 'translateY(0)'; shopBtn.style.boxShadow = '0 10px 30px rgba(189,0,255,0.4)'; };
    
    // Click handlers
    const closePopup = () => {
        bigPopup.remove();
    };
    closeBtn.onclick = closePopup;

    // CLICK OUTSIDE TO CLOSE LOGIC
    bigPopup.onclick = (e) => {
        // Only trigger the close function if they clicked the dark background overlay, not the ad box
        if (e.target === bigPopup) {
            closePopup();
        }
    };
    
    // Linking directly to the Best in Grass official site!
    shopBtn.onclick = () => {
        closePopup();
        window.open('https://bestingrass.io/competitions/michigan-2026/', '_blank');
    };
}, 15000);
