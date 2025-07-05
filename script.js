// === Initialization and Utility ===
console.log("script.js loaded");

// === Chatbot and Search Actions ===
function openChat() {
  alert("Launching the AI Budtender… (This will be replaced with actual chatbot trigger)");
}
function openSearch() {
  alert("Search function coming soon! Type to find strains, deals, or categories.");
}

// === Hamburger Menu ===
function toggleMenu() {
  const menu = document.getElementById("hamburgerMenu");
  const isOpen = menu.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
}

// Close the menu if user clicks outside of it
document.addEventListener("click", function (e) {
  const menu = document.getElementById("hamburgerMenu");
  const icon = document.querySelector(".hamburger-icon");
  if (
    menu.classList.contains("open") &&
    !menu.contains(e.target) &&
    !icon.contains(e.target)
  ) {
    menu.classList.remove("open");
  }
});

// === Flower Toggle Logic ===
function scrollToAllFlower() {
  const mainSection = document.getElementById('flowerDeals');
  const allDeals = document.getElementById('allFlowerDeals');
  const btn = document.getElementById('flowerToggleBtn');
  mainSection.classList.toggle('active');
  allDeals.classList.toggle('active');
  const isActive = mainSection.classList.contains('active');
  btn.setAttribute('aria-expanded', isActive);
  btn.textContent = isActive ? '👆 Hide Flower Deals' : '🌿 Flower';
  if (isActive) document.getElementById('deals').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideAllFlowerDeals() {
  const mainSection = document.getElementById('flowerDeals');
  const allDeals = document.getElementById('allFlowerDeals');
  const btn = document.getElementById('flowerToggleBtn');
  mainSection.classList.remove('active');
  allDeals.classList.remove('active');
  btn.setAttribute('aria-expanded', false);
  btn.textContent = '🌿 Flower';
  btn.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
// === Apple or Google Maps Logic ===
function openPreferredMap() {
  const appleCoords = "41.81116,-83.44617";
  const googleAddress = encodeURIComponent("10701 Madison St, Luna Pier, MI 48157");
  const isApple = /iPhone|iPad|Macintosh|Mac OS/.test(navigator.userAgent);
  window.open(isApple ? `https://maps.apple.com/?ll=${appleCoords}` : `https://www.google.com/maps/place/${googleAddress}`, '_blank');
}

// === Global Deals Variable ===
let allDealsData = [];

// === Load Deals from Google Sheets ===
const sheetURL = 'https://opensheet.elk.sh/132VDRorvAHlWm_OaIJI-JDXrYiyPA4RWm6voajQbiqU/Sheet1';
fetch(sheetURL)
  .then(response => response.json())
  .then(data => {
    console.log("Deals loaded:", data);
    allDealsData = data;
    handleCategorySelect('All');
  })
  .catch(error => {
    console.error("Error loading deals:", error);
    document.getElementById("deals-container").innerHTML = "<p>Failed to load deals.</p>";
  });

// === Category Selector Logic ===
function handleCategorySelect(selectedValue) {
  const allSections = document.querySelectorAll('.deal-category');
  allSections.forEach(section => {
    const isMatch = section.dataset.category === selectedValue || selectedValue === 'All';
    section.style.display = isMatch ? 'block' : 'none';
  });

  document.getElementById('deals').scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (selectedValue === 'Flower') {
    renderGroupedFlowerDeals(allDealsData);
  } else {
    renderPromoTiles(allDealsData, selectedValue);
    renderDealsByCategory(allDealsData, selectedValue);
  }
}
window.handleCategorySelect = handleCategorySelect;

// === Promo Tiles Renderer ===
function renderPromoTiles(data, selectedCategory = 'All') {
  const promoGrid = document.getElementById("promoGrid");
  if (!promoGrid) return;

  const featuredDeals = data.filter(d =>
    d.Featured?.toLowerCase() === 'yes' &&
    (selectedCategory === 'All' || d.Category === selectedCategory)
  );

  promoGrid.innerHTML = featuredDeals.map(d => {
    const hasImage = d.ImageURL && d.ImageURL.trim() !== '';

    return `
      <div class="promo-tile">
        <div class="promo-image">
          ${hasImage ? `<img src="${d.ImageURL.trim()}" alt="${d['Deal Title']}" />` : ''}
          ${d.Label ? `<span class="promo-badge">${d.Label}</span>` : ''}
        </div>
        <div class="promo-info">
          <h4>${d["Deal Title"]}</h4>
          <p>${d["Effects/Tagline"] || ''}</p>
          <p class="price-tag">${d.Price || '—'} <span class="tax-note">tax included</span></p>
        </div>
      </div>
    `;
  }).join('');
}

// === Grouped Flower Deals Renderer ===
function renderGroupedFlowerDeals(data) {
  const container = document.getElementById("deals-container");
  if (!container) return;
  container.innerHTML = '';

  const weightMap = {
    '28g': 'Ounce',
    '14g': 'Half',
    '7g': 'Quarter',
    '3.5g': 'Eighth',
    '1g': 'Gram'
  };
  const weightOrder = ['Ounce', 'Half', 'Quarter', 'Eighth', 'Gram'];

  const flowerDeals = data.filter(d => d.Category?.toLowerCase().trim() === 'flower');
  const groupedByWeight = {};

  flowerDeals.forEach(deal => {
    const rawWeight = deal.Weight?.toLowerCase().trim();
    const group = weightMap[rawWeight] || 'Other';
    if (!groupedByWeight[group]) groupedByWeight[group] = [];
    groupedByWeight[group].push(deal);
  });

  const section = document.createElement("div");
  section.className = "deal-category active";
  section.dataset.category = 'Flower';

  [...weightOrder, 'Other'].forEach(group => {
    const deals = groupedByWeight[group];
    if (deals && deals.length > 0) {
      deals.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
      section.innerHTML += `
        <div class="weight-group">
          <h3>${group}s</h3>
          <div class="flower-tile-group">
            ${deals.map(d => `
              <div class="deal-tile ${d.Featured?.toLowerCase() === 'yes' ? 'featured' : ''}">
                <div class="promo-image">
                  ${d.Label ? `<span class="promo-badge">${d.Label}</span>` : ''}
                </div>
                
                <div class="promo-info">
                  <h4>${d["Deal Title"]}
                    ${d.Badge?.toLowerCase().includes("award") ? ' 🏆' : d.Badge?.toLowerCase().includes("new") ? ' 🔥' : ''}
                    <span class="wishlist-icon" onclick="toggleWishlist('${d["Deal Title"]}')">➕</span>
                  </h4>
                  ${d["Effects/Tagline"] ? `<p>${d["Effects/Tagline"]}</p>` : ''}
                  ${d["Amount/Details"] ? `<p>${d["Amount/Details"]}</p>` : ''}
                  ${d.Notes ? `<p class="deal-notes">${d.Notes}</p>` : ''}
                  <p class="price-tag">$${d.Price} <span class="tax-note">tax included</span></p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  });

  container.appendChild(section);
}

function renderDealsByCategory(data, selectedCategory) {
  const container = document.getElementById("deals-container");
  if (!container) return;

  // Remove all but Flower
  const nonFlowerSections = container.querySelectorAll('.deal-category:not([data-category="Flower"])');
  nonFlowerSections.forEach(section => section.remove());

  const filteredDeals = data.filter(d => 
    d.Category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
  );

  if (filteredDeals.length === 0) return;

  const section = document.createElement("div");
  section.className = "deal-category active";
  section.dataset.category = selectedCategory;

  section.innerHTML = `
  <div class="tile-grid">
    ${filteredDeals.map(d => `
      <div class="deal-tile">
        ${d.Label ? `<span class="promo-badge">${d.Label}</span>` : ''}
        <div class="promo-info">
          <h4>${d["Deal Title"]}
            <span class="wishlist-icon" onclick="toggleWishlist('${d["Deal Title"]}')">➕</span>
          </h4>
          ${d["Effects/Tagline"] ? `<p>${d["Effects/Tagline"]}</p>` : ''}
          ${d["Amount/Details"] ? `<p>${d["Amount/Details"]}</p>` : ''}
          ${d.Notes ? `<p class="deal-notes">${d.Notes}</p>` : ''}
          <p class="price-tag">$${d.Price} <span class="tax-note">tax included</span></p>
        </div>
      </div>
    `).join('')}
  </div>
`;

  container.appendChild(section);
}

// Load Featured Promo Tiles
const promoGrid = document.getElementById("promoGrid");

const promoDeals = [
  {
    name: "Death By Funk",
    weight: "7g",
    price: "$45",
    badge: "🏆 Award Winner",
    image: "death-by-funk.png"
  },
  {
    name: "Lemon Wookie",
    weight: "3.5g",
    price: "$25",
    badge: "💼 Staff Pick",
    image: "lemon-wookie.png"
  }
];

promoDeals.forEach(deal => {
  const tile = document.createElement("div");
  tile.className = "promo-tile Flower";
  tile.innerHTML = `
    <img src="${deal.image}" alt="${deal.name}">
    <div class="promo-info">
      <h3>${deal.name} – ${deal.weight}</h3>
      <p class="price">${deal.price}</p>
      <span class="promo-badge">${deal.badge}</span>
    </div>
  `;
  promoGrid.appendChild(tile);
});

// === Wishlist Logic ===
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function toggleWishlist(item) {
  const index = wishlist.indexOf(item);
  if (index === -1) {
    wishlist.push(item);
  } else {
    wishlist.splice(index, 1);
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderWishlistModal(); // update display
}

function clearWishlist() {
  wishlist = [];
  localStorage.removeItem('wishlist');
  renderWishlistModal();
}

function renderWishlistModal() {
  const modal = document.getElementById('wishlistModal');
  if (!modal) return;

  const content = document.getElementById('wishlistContent');
  if (wishlist.length === 0) {
    content.innerHTML = "<p>Your wishlist is empty.</p>";
    return;
  }

  content.innerHTML = `
    <ul class="wishlist-items">
      ${wishlist.map(item => `<li>${item}</li>`).join('')}
    </ul>
    <p class="wishlist-note">Your wishlist won’t carry over. Show this list to your budtender or re-add on Leafly.</p>
    <a class="leafly-btn" href="https://www.leafly.com/dispensary-info/green-labs-provisions" target="_blank">Go to Leafly</a>
    <button onclick="clearWishlist()" class="clear-wishlist-btn">Clear Wishlist</button>
  `;
}

// Show modal
function showWishlistModal() {
  const modal = document.getElementById('wishlistModal');
  if (modal) modal.style.display = 'block';
  renderWishlistModal();
}

// Hide modal
function hideWishlistModal() {
  const modal = document.getElementById('wishlistModal');
  if (modal) modal.style.display = 'none';
}

// Close on background click
window.onclick = function(event) {
  const modal = document.getElementById('wishlistModal');
  if (event.target === modal) {
    hideWishlistModal();
  }
};

// Auto-clear wishlist at 9 PM
function scheduleWishlistReset() {
  const now = new Date();
  const next9PM = new Date();
  next9PM.setHours(21, 0, 0, 0); // 9 PM today
  if (now > next9PM) {
    next9PM.setDate(next9PM.getDate() + 1);
  }
  const timeUntilReset = next9PM - now;
  setTimeout(() => {
    clearWishlist();
    scheduleWishlistReset(); // reschedule next day's reset
  }, timeUntilReset);
}
scheduleWishlistReset();
