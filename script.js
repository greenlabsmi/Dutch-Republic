// =========================================================
// DUTCH REPUBLIC — CORE ENGINE (DARK THEME OPTIMIZED)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[dr] Dutch Republic engine booted');
  
    // ==========================================
    // 1. AGE GATE LOGIC
    // ==========================================
    (function ageGate() {
      const KEY = 'dr_age_until';
      const gate = document.getElementById('ageGate');
      if (!gate) return;
  
      const okUntil = Number(localStorage.getItem(KEY) || 0);
      const sessionOK = sessionStorage.getItem(KEY) === '1';
      
      if (okUntil > Date.now() || sessionOK) {
          gate.style.display = 'none';
          document.body.style.overflow = '';
      } else {
          gate.style.display = 'flex';
          document.body.style.overflow = 'hidden';
      }
  
      document.getElementById('ageYes')?.addEventListener('click', () => {
          const remember = document.getElementById('ageRemember');
          if (remember && remember.checked) {
              localStorage.setItem(KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
          } else {
              sessionStorage.setItem(KEY, '1');
          }
          gate.style.display = 'none';
          document.body.style.overflow = '';
      });
  
      document.getElementById('ageNo')?.addEventListener('click', () => {
          location.href = 'https://www.google.com';
      });
    })();
  
    // ==========================================
    // 2. MOBILE MENU DRAWER
    // ==========================================
    (function menuDrawer() {
      const openBtn = document.querySelector('[data-open-menu]');
      const drawer = document.getElementById('navDrawer');
      const overlay = document.getElementById('menuOverlay');
      if (!openBtn || !drawer || !overlay) return;
  
      const open = () => { drawer.hidden = false; overlay.hidden = false; };
      const close = () => { drawer.hidden = true; overlay.hidden = true; };
  
      openBtn.addEventListener('click', open);
      overlay.addEventListener('click', close);
      drawer.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    })();
  
    // ==========================================
    // 3. HERO CAROUSEL ENGINE
    // ==========================================
    (function heroCarousel() {
      const root = document.getElementById('hero-slides');
      if (!root) return;
      const slides = Array.from(root.querySelectorAll('.slide'));
      if (!slides.length) return;
      
      let i = 0;
      let dotsBar = root.querySelector('.dots');
      if (!dotsBar) return;
      dotsBar.innerHTML = '';
      
      const dots = slides.map((_, k) => {
          const b = document.createElement('button');
          if (k === i) b.setAttribute('aria-current', 'true');
          b.addEventListener('click', () => go(k, true));
          dotsBar.appendChild(b);
          return b;
      });
  
      root.querySelector('.edge--prev')?.addEventListener('click', () => go(i - 1, true));
      root.querySelector('.edge--next')?.addEventListener('click', () => go(i + 1, true));
  
      let timer;
      const start = () => { stop(); timer = setInterval(() => go(i + 1, false), 6000); };
      const stop = () => clearInterval(timer);
  
      function go(n, user = false) {
          slides[i].classList.remove('is-active');
          dots[i].removeAttribute('aria-current');
          i = (n + slides.length) % slides.length;
          slides[i].classList.add('is-active');
          dots[i].setAttribute('aria-current', 'true');
          if (user) { stop(); start(); }
      }
      
      // Swipe support
      let startX = null;
      root.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stop(); }, {passive:true});
      root.addEventListener('touchend', e => {
          if (startX == null) return;
          const dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 40) go(dx < 0 ? i+1 : i-1, true);
          startX = null; start();
      }, {passive:true});
  
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      start();
    })();
  
    // ==========================================
    // 4. LIVE STORE HOURS POPOVER
    // ==========================================
    (function storeHours() {
      const btn = document.getElementById('hoursBtn');
      const pop = document.getElementById('hoursPopover');
      const ovl = document.getElementById('hoursOverlay');
      const list = document.getElementById('hoursList');
      if (!btn || !pop || !ovl || !list) return;
  
      // Dutch Republic Douglas Hours
      const HOURS = [
        { d: 'Sunday', open: 10, close: 20 },
        { d: 'Monday', open: 10, close: 20 },
        { d: 'Tuesday', open: 10, close: 20 },
        { d: 'Wednesday', open: 10, close: 20 },
        { d: 'Thursday', open: 10, close: 20 },
        { d: 'Friday', open: 10, close: 21 },
        { d: 'Saturday', open: 10, close: 21 },
      ];
  
      const fmt = (h) => h > 12 ? `${h-12}PM` : `${h}AM`;
      const today = new Date().getDay();
      
      // Render the 7-day list into the popover (Dark theme styling)
      list.innerHTML = HOURS.map((h, idx) => `
          <li style="display:flex; justify-content:space-between; padding:6px 0; color: ${idx === today ? 'var(--gold)' : '#aaa'}; font-weight: ${idx === today ? '900' : '600'}; border-bottom: 1px solid #222;">
              <span>${h.d}</span>
              <span>${fmt(h.open)} - ${fmt(h.close)}</span>
          </li>
      `).join('');
  
      // Calculate Open/Closed for the pill button
      const updateBtn = () => {
          const hr = new Date().getHours() + (new Date().getMinutes() / 60);
          const { open, close } = HOURS[today];
          const isOpen = hr >= open && hr < close;
          
          btn.textContent = isOpen ? 'OPEN' : 'CLOSED';
          btn.style.color = isOpen ? 'var(--emerald)' : '#ff4444';
          btn.style.background = isOpen ? 'rgba(46, 248, 187, 0.1)' : 'rgba(255, 68, 68, 0.1)';
          btn.style.borderColor = isOpen ? 'rgba(46, 248, 187, 0.3)' : 'rgba(255, 68, 68, 0.3)';
      };
  
      const openPop = () => { pop.hidden = false; ovl.hidden = false; };
      const closePop = () => { pop.hidden = true; ovl.hidden = true; };
  
      // Position the popover slightly under the header
      pop.style.position = 'fixed';
      pop.style.top = '75px';
      pop.style.right = '15px';
  
      btn.addEventListener('click', () => pop.hidden ? openPop() : closePop());
      ovl.addEventListener('click', closePop);
      
      updateBtn();
      setInterval(updateBtn, 60000); // Check every minute
    })();
  
    // ==========================================
    // 5. SMART MAP LINK
    // ==========================================
    const mapBtn = document.getElementById('openMapsSmart');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => {
        const q = encodeURIComponent('435 Blue Star Hwy, Douglas, MI 49406');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) window.location.href = `maps://?q=${q}`;
        else if (isAndroid) window.location.href = `geo:0,0?q=${q}`;
        else window.open(`https://www.google.com/maps?q=${q}`, '_blank');
      });
    }
  
    // ==========================================
    // 6. SMOOTH SCROLLING (ANCHORS)
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (id === '#menu') return; // Handled by inline Leafly script
          if (id === '#') return;
          
          const target = document.querySelector(id);
          if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: 'smooth' });
          }
      });
    });
});

// =========================================================
// BEST IN GRASS PROMO POP-UP (ANIMATED GRADIENT EDITION)
// =========================================================
setTimeout(() => {
    if (!document.getElementById('big-styles')) {
        const style = document.createElement('style');
        style.id = 'big-styles';
        style.innerHTML = `
            @keyframes awardDrop { 0% { transform: scale(0.8) translateY(-40px); opacity: 0; } 50% { transform: scale(1.02) translateY(5px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
            @keyframes bigGradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            .big-gradient-text { background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff); background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: bigGradientFlow 24s ease infinite; }
            .big-gradient-bg { background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff); background-size: 300% 300%; animation: bigGradientFlow 24s ease infinite; }
            .big-gradient-border { position: relative; border-radius: 24px; background: #0b0d0c; background-clip: padding-box; border: 3px solid transparent; }
            .big-gradient-border::before { content: ''; position: absolute; inset: -3px; border-radius: 26px; z-index: -1; background: linear-gradient(90deg, #00e5ff, #bd00ff, #ff00a0, #00e5ff); background-size: 300% 300%; animation: bigGradientFlow 24s ease infinite; }
        `;
        document.head.appendChild(style);
    }

    const bigPopup = document.createElement('div');
    bigPopup.id = 'big-promo-popup';
    bigPopup.style = "position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.85); backdrop-filter:blur(4px);";
    
    bigPopup.innerHTML = `
        <div class="big-gradient-border" style="position:relative; width:90%; max-width:520px; padding:35px 25px; text-align:center; box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 50px rgba(189, 0, 255, 0.2); animation: awardDrop 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;">
            <button id="close-big" style="position:absolute; top:-15px; right:-15px; width:38px; height:38px; background:#D6A34A; color:#000; font-family:Arial, sans-serif; font-size:26px; border:2px solid #000; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.6); z-index: 10000; transition: transform 0.2s ease, background 0.2s ease;">&times;</button>
            <div class="big-gradient-bg" style="display:inline-block; font-size:14px; font-weight:950; letter-spacing:0.15em; color:#fff; padding:6px 20px; border-radius:999px; margin-bottom:18px; box-shadow: 0 4px 15px rgba(189, 0, 255, 0.4);">MAY 9TH EXCLUSIVE</div>
            <div style="background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); border-radius: 18px; padding: 24px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                <h2 style="font-family:'Cinzel', serif; font-size:36px; font-weight:900; color:#fff; margin:0 0 12px; line-height:1.1;">Best In Grass</h2>
                <p style="color:rgba(255,255,255,0.95); font-size:16px; font-weight:800; line-height:1.5; margin:0;">
                   Judge Kits Available Now! While Supplies Last.<br>
                    <span style="font-weight:600; font-size: 14px; color: rgba(255,255,255,0.75); display:block; margin-top:8px;">Put your lungs where your mouth is. Grab an official judge kit and tell the rest of Michigan what's actually good. Kits are IN-STORE ONLY while supplies last.</span>
                </p>
            </div>
            <div style="background: rgba(0,0,0,0.75); border: 1px solid rgba(189, 0, 255, 0.3); padding: 18px; border-radius: 16px; margin-bottom: 24px; box-shadow: inset 0 0 20px rgba(189,0,255,0.05), 0 10px 20px rgba(0,0,0,0.5);">
                <div class="big-gradient-text" style="font-size:13px; font-weight:900; letter-spacing:0.1em; margin-bottom:6px;">🔥 SPECIAL EVENT PRICING 🔥</div>
                <div style="color:#fff; font-family:'Cinzel', serif; font-size:18px; font-weight:900; line-height:1.3; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">Exclusive Deli Deals, Fresh Drops,<br>& Elite Discounts All Day</div>
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
    
    const closePopup = () => bigPopup.remove();
    closeBtn.onclick = closePopup;
    bigPopup.onclick = (e) => { if (e.target === bigPopup) closePopup(); };
    shopBtn.onclick = () => { closePopup(); window.open('https://bestingrass.io/competitions/michigan-2026/', '_blank'); };
}, 15000);
