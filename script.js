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
    // 1. Identify and extract the highlights category first
    const highlightsCat = data.deals.find(c => c.category === "Highlights");
    const otherCats = data.deals.filter(c => c.category !== "Highlights");

    // 2. Build the new ordered list
    const sortedCategories = highlightsCat ? [highlightsCat, ...otherCats] : otherCats;

    // 3. Render
    dealList.innerHTML = sortedCategories.map(cat => `
        <section class="drCat" id="cat-${cat.category.replace(/[^a-z0-9]/gi, '')}" data-category-block>
            <div class="drCat__head"><h3 class="drCat__title">${esc(cat.category)}</h3></div>
            <div class="drLines">${(cat.items || []).map(line => `<div class="drLine" data-line><div class="drLine__text">${esc(line)}</div></div>`).join('')}</div>
        </section>
    `).join('') + `<div class="drTaxBanner"><strong>Pricing Update:</strong> All prices are <strong>Out The Door (Tax Included)</strong>.</div>`;
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


// --- 7. DUTCH DELI ---

const deliPricing = {
    premium: [
        ['1g', '$10'],
        ['3.5g', '$25'],
        ['7g', '$40'],
        ['14g', '$70'],
        ['28g', '$130'],
        ['56g', '$210'],
        ['70g', '$260']
    ],

    core: [
        ['1g', '$7'],
        ['3.5g', '$25'],
        ['7g', '$40'],
        ['14g', '$60'],
        ['28g', '$100'],
        ['56g', '$200'],
        ['70g', '$250']
    ]
};

const deliStrainData = {
    'mr-clean': {
        name: 'Mr. Clean',
        tier: 'premium',
        tierLabel: 'Premium Tier',
        seedSource: 'TGA Subcool Genetics',
        type: 'Sativa',
        thc: '23.74% THC',
        budImage: 'https://dutchtouchgenetics.com/assets/img/strains/mr-clean-bud.jpg',
        artImage: 'https://dutchtouchgenetics.com/assets/img/strains/mr-clean-art.jpg',
        genetics: 'Lime Skunk × The Cube',
        about: 'An award-winning Dutch Touch Genetics favorite with sharp lime, sour citrus, earthy skunk and pine-cleaner aromas. Mr. Clean is known for an energetic, creative and uplifting experience.'
    },

    'chocolate-marshmallow-14': {
        name: 'Chocolate Marshmallow #14',
        tier: 'premium',
        tierLabel: 'Premium Tier',
        seedSource: 'Exotic Genetix',
        type: 'Hybrid',
        thc: '28.38% THC',
        budImage: 'https://dutchtouchgenetics.com/assets/img/strains/chocolate-marshmallow-14-bud.jpg',
        artImage: 'https://dutchtouchgenetics.com/assets/img/strains/chocolate-marshmallow-14-art.jpg',
        genetics: 'GG4 × Mint Chocolate Chip',
        about: 'A rich dessert-forward hybrid with flavors of sweet chocolate, creamy vanilla and a punch of skunky pungency. Its dense potency delivers a deeply satisfying and balanced experience.'
    },

    'space-hippy-3': {
        name: 'Space Hippy #3',
        tier: 'premium',
        tierLabel: 'Premium Tier',
        seedSource: 'Dutch Touch Genetics',
        type: 'Hybrid',
        thc: '24.77% THC',
        budImage: 'https://dutchtouchgenetics.com/assets/img/strains/space-hippy-bud.jpg',
        artImage: 'https://dutchtouchgenetics.com/assets/img/strains/space-hippy-art.jpg',
        genetics: 'Apollo 13 × Dread Bread',
        about: 'A premium Dutch Touch Genetics exclusive with bright cerebral energy and a relaxing finish. Space Hippy is also a High Times Cannabis Cup award-winning genetic across multiple product categories.'
    },

    'cobra-lips': {
        name: 'Cobra Lips',
        tier: 'core',
        tierLabel: 'Core Tier',
        seedSource: 'Bodhi Seeds',
        type: 'Hybrid',
        thc: '24.39% THC',
        budImage: 'https://dutchtouchgenetics.com/assets/img/strains/cobra-lips-bud.png',
        artImage: 'https://dutchtouchgenetics.com/assets/img/strains/cobra-lips-art.jpg',
        genetics: 'Chem 3 × Appalachia',
        about: 'A complex and pungent hybrid with notes of pine, wet soil, funk, fuel and tart green apple. Cobra Lips offers a long-lasting energetic buzz balanced by a relaxed physical state.'
    },

    'illudium': {
        name: 'Illudium',
        tier: 'core',
        tierLabel: 'Core Tier',
        seedSource: 'Legendary Ohio Clone-Only',
        type: 'Indica',
        thc: '19.56% THC',
        budImage: 'https://dutchtouchgenetics.com/assets/img/strains/illudium-bud.jpg',
        artImage: 'https://dutchtouchgenetics.com/assets/img/strains/illudium-art.jpg',
        genetics: 'Hawaiian Indica × Pre-98 Bubba Kush',
        about: 'A legendary and highly sought-after Ohio clone-only strain. Illudium combines dark coffee, chocolate and sweet orange rind with a peppery, herbal and fuel-tinged aromatic base.'
    },

    'field-trip': {
        name: 'Field Trip',
        tier: 'core',
        tierLabel: 'Core Tier',
        seedSource: 'Dutch Touch Genetics',
        type: 'Hybrid',
        thc: '25.07% THC',
        budImage: 'https://dutchtouchgenetics.com/assets/img/strains/field-trip-bud.jpg',
        artImage: 'https://dutchtouchgenetics.com/assets/img/strains/field-trip-art.jpg',
        genetics: 'GSC × Sunshine Daydream',
        about: 'An uplifting and nostalgic balanced hybrid with classic earthy dough notes and a bright, spacey citrus kick. Field Trip is designed for an easygoing, functional experience.'
    },

    'dead-prez': {
        name: 'Dead Prez',
        tier: 'core',
        tierLabel: 'Core Tier',
        seedSource: 'Dutch Touch Genetics',
        type: 'Indica',
        thc: '26.32% THC',
        budImage: 'https://dutchtouchgenetics.com/assets/img/strains/dead-prez-bud.jpg',
        artImage: 'https://dutchtouchgenetics.com/assets/img/strains/dead-prez-art.jpg',
        genetics: 'Death Star × Dread Bread',
        about: 'A heavy-hitting in-house Dutch Touch Genetics cross with an aggressive sour aroma. Skunky jet fuel and diesel lead the profile, followed by earthy notes and hints of citrus and spice.'
    }
};

const deliCarousel = document.getElementById('deliCarousel');
const deliCards = Array.from(
    document.querySelectorAll('#dutch-deli .deli-card-wrapper')
);

const deliFilterButtons = Array.from(
    document.querySelectorAll('#dutch-deli .deli-filter[data-filter]')
);

const deliArtToggle = document.getElementById('art-mode-toggle');
const deliArrowLeft = document.getElementById('deliArrowLeft');
const deliArrowRight = document.getElementById('deliArrowRight');

const deliModal = document.getElementById('deliModal');
const deliModalImage = document.getElementById('deliModalImage');
const deliModalName = document.getElementById('deliModalName');
const deliModalType = document.getElementById('deliModalType');
const deliModalTier = document.getElementById('deliModalTier');
const deliModalSeedSource = document.getElementById('deliModalSeedSource');
const deliModalGenetics = document.getElementById('deliModalGenetics');
const deliModalAbout = document.getElementById('deliModalAbout');
const deliModalPriceTitle = document.getElementById('deliModalPriceTitle');
const deliModalPrice = document.getElementById('deliModalPrice');
const deliModalImageHint = deliModal?.querySelector('.deli-modal__image-hint');

let currentDeliStrainId = null;
let currentDeliModalImage = 'bud';
let deliArtModeActive = false;
let deliLastFocusedElement = null;

/**
 * Optional mobile vibration feedback.
 */
function triggerDeliHaptic() {
    if (navigator.vibrate) {
        navigator.vibrate(25);
    }
}

/**
 * Builds the complete pricing table for the active tier.
 */
function renderDeliPricing(tier) {
    if (!deliModalPrice) return;

    const prices = deliPricing[tier] || [];

    deliModalPrice.innerHTML = prices.map(([weight, price]) => `
        <div class="deli-price-row">
            <span class="deli-price-weight">${esc(weight)}</span>
            <span class="deli-price-dots" aria-hidden="true"></span>
            <span class="deli-price-value">${esc(price)}</span>
        </div>
    `).join('');
}

/**
 * Updates the modal image and its helper text.
 */
function showDeliModalImage(side) {
    const strain = deliStrainData[currentDeliStrainId];

    if (!strain || !deliModalImage) return;

    currentDeliModalImage = side;

    if (side === 'art') {
        deliModalImage.src = strain.artImage;
        deliModalImage.alt = `${strain.name} label artwork`;

        if (deliModalImageHint) {
            deliModalImageHint.textContent = 'Tap for Bud Photo 🔄';
        }
    } else {
        deliModalImage.src = strain.budImage;
        deliModalImage.alt = `${strain.name} flower`;

        if (deliModalImageHint) {
            deliModalImageHint.textContent = 'Tap for Label Art 🔄';
        }
    }
}

/**
 * Opens the deli modal.
 * Attached to window because the HTML uses onclick="openDeliModal(...)"
 */
window.openDeliModal = function openDeliModal(strainId) {
    const strain = deliStrainData[strainId];

    if (!strain || !deliModal) {
        console.warn(`[deli] Missing strain data for: ${strainId}`);
        return;
    }

    triggerDeliHaptic();

    currentDeliStrainId = strainId;
    deliLastFocusedElement = document.activeElement;

    if (deliModalName) {
        deliModalName.textContent = strain.name;
    }

    if (deliModalType) {
        deliModalType.textContent = `${strain.type} • ${strain.thc}`;
    }

    if (deliModalSeedSource) {
        deliModalSeedSource.textContent = strain.seedSource;
    }

    if (deliModalGenetics) {
        deliModalGenetics.textContent = strain.genetics;
    }

    if (deliModalAbout) {
        deliModalAbout.textContent = strain.about;
    }

    if (deliModalTier) {
        deliModalTier.textContent = strain.tierLabel;

        deliModalTier.classList.remove(
            'is-premium',
            'is-core'
        );

        deliModalTier.classList.add(
            strain.tier === 'premium'
                ? 'is-premium'
                : 'is-core'
        );
    }

    if (deliModalPriceTitle) {
        deliModalPriceTitle.textContent =
            `${strain.tierLabel} Pricing`;
    }

    renderDeliPricing(strain.tier);
    showDeliModalImage('bud');

    deliModal.classList.add('is-open');
    deliModal.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';

    const closeButton =
        deliModal.querySelector('.deli-modal__close');

    setTimeout(() => {
        closeButton?.focus();
    }, 50);
};

/**
 * Closes the deli modal.
 * Attached to window because the HTML uses onclick="closeDeliModal()"
 */
window.closeDeliModal = function closeDeliModal() {
    if (!deliModal) return;

    deliModal.classList.remove('is-open');
    deliModal.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';

    currentDeliStrainId = null;
    currentDeliModalImage = 'bud';

    if (
        deliLastFocusedElement &&
        typeof deliLastFocusedElement.focus === 'function'
    ) {
        deliLastFocusedElement.focus();
    }
};

/**
 * Flips the large modal image.
 * Attached to window because the HTML uses onclick="flipDeliModalImage()"
 */
window.flipDeliModalImage = function flipDeliModalImage() {
    if (!currentDeliStrainId) return;

    triggerDeliHaptic();

    showDeliModalImage(
        currentDeliModalImage === 'bud'
            ? 'art'
            : 'bud'
    );
};

/**
 * Premium, Core, Sativa, Hybrid and Indica filters.
 */
deliFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        triggerDeliHaptic();

        const selectedFilter =
            button.getAttribute('data-filter');

        deliFilterButtons.forEach(otherButton => {
            const isSelected = otherButton === button;

            otherButton.classList.toggle(
                'is-active',
                isSelected
            );

            otherButton.setAttribute(
                'aria-pressed',
                String(isSelected)
            );
        });

        deliCards.forEach(card => {
            const categories = (
                card.getAttribute('data-category') || ''
            )
                .split(/\s+/)
                .filter(Boolean);

            const shouldShow =
                selectedFilter === 'all' ||
                categories.includes(selectedFilter);

            card.classList.toggle(
                'is-hidden',
                !shouldShow
            );
        });

        deliCarousel?.scrollTo({
            left: 0,
            behavior: 'smooth'
        });
    });
});

/**
 * Flips every card from bud photo to label artwork.
 */
deliArtToggle?.addEventListener('click', () => {
    triggerDeliHaptic();

    deliArtModeActive = !deliArtModeActive;

    deliArtToggle.classList.toggle(
        'active',
        deliArtModeActive
    );

    deliArtToggle.setAttribute(
        'aria-pressed',
        String(deliArtModeActive)
    );

    deliArtToggle.textContent =
        deliArtModeActive
            ? 'Show Bud Photos'
            : 'Tap for Label Art';

    deliCards.forEach(cardWrapper => {
        const card =
            cardWrapper.querySelector('.deli-card');

        const front =
            card?.querySelector('.deli-card__front');

        const back =
            card?.querySelector('.deli-card__back');

        if (!card) return;

        /*
         * Creates the staggered Green Labs-style wave.
         * Cards further to the right flip slightly later.
         */
        const rect = cardWrapper.getBoundingClientRect();
        const delay = Math.min(
            Math.max(0, rect.left) * 0.45,
            450
        );

        if (front) {
            front.style.transitionDelay = `${delay}ms`;
        }

        if (back) {
            back.style.transitionDelay = `${delay}ms`;
        }

        card.classList.toggle(
            'is-flipped',
            deliArtModeActive
        );

        window.setTimeout(() => {
            if (front) {
                front.style.transitionDelay = '0ms';
            }

            if (back) {
                back.style.transitionDelay = '0ms';
            }
        }, delay + 850);
    });
});

/**
 * Desktop carousel arrows.
 * Arrows automatically hide when no further scrolling is available.
 */
function updateDeliArrowVisibility() {
    if (
        !deliCarousel ||
        !deliArrowLeft ||
        !deliArrowRight
    ) {
        return;
    }

    const maxScrollLeft =
        deliCarousel.scrollWidth -
        deliCarousel.clientWidth;

    const currentScrollLeft =
        deliCarousel.scrollLeft;

    const edgeTolerance = 4;

    const canScrollLeft =
        currentScrollLeft > edgeTolerance;

    const canScrollRight =
        currentScrollLeft <
        maxScrollLeft - edgeTolerance;

    deliArrowLeft.classList.toggle(
        'is-hidden',
        !canScrollLeft
    );

    deliArrowRight.classList.toggle(
        'is-hidden',
        !canScrollRight
    );

    deliArrowLeft.setAttribute(
        'aria-hidden',
        String(!canScrollLeft)
    );

    deliArrowRight.setAttribute(
        'aria-hidden',
        String(!canScrollRight)
    );

    deliArrowLeft.tabIndex =
        canScrollLeft ? 0 : -1;

    deliArrowRight.tabIndex =
        canScrollRight ? 0 : -1;
}

deliArrowLeft?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();

    triggerDeliHaptic();

    deliCarousel?.scrollBy({
        left: -285,
        behavior: 'smooth'
    });
});

deliArrowRight?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();

    triggerDeliHaptic();

    deliCarousel?.scrollBy({
        left: 285,
        behavior: 'smooth'
    });
});

deliCarousel?.addEventListener(
    'scroll',
    updateDeliArrowVisibility,
    { passive: true }
);

window.addEventListener(
    'resize',
    updateDeliArrowVisibility
);

/*
 * Run once after layout and images settle.
 */
requestAnimationFrame(() => {
    updateDeliArrowVisibility();

    setTimeout(
        updateDeliArrowVisibility,
        300
    );
});

/**
 * Keyboard support for cards.
 */
deliCards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    card.addEventListener('keydown', event => {
        if (
            event.key !== 'Enter' &&
            event.key !== ' '
        ) {
            return;
        }

        event.preventDefault();

        const inlineClick =
            card.getAttribute('onclick') || '';

        const strainMatch =
            inlineClick.match(
                /openDeliModal\(['"]([^'"]+)['"]\)/
            );

        if (strainMatch?.[1]) {
            window.openDeliModal(strainMatch[1]);
        }
    });
});

/**
 * Escape closes the modal.
 */
document.addEventListener('keydown', event => {
    if (
        event.key === 'Escape' &&
        deliModal?.classList.contains('is-open')
    ) {
        window.closeDeliModal();
    }
});

   

    // --- 8. SHOP & MAPS ---
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
    

    // --- 9. EDUCATION LOGIC (GUIDE CARDS) ---
    document.querySelectorAll('[data-guide-card]').forEach(card => {
        const toggle = card.querySelector('.guideCard__toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const isOpen = card.classList.contains('is-open');
                
                // Close all other open cards first
                document.querySelectorAll('[data-guide-card].is-open').forEach(openCard => {
                    if (openCard !== card) openCard.classList.remove('is-open');
                });

                // Toggle the clicked card
                card.classList.toggle('is-open');
                
                // If opening, smooth scroll to it
                if (!isOpen) {
                    setTimeout(() => smoothTo(card), 400);
                }
            });
        }
    });
});
