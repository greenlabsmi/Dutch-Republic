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
  const menu = document.querySelector('.hamburger-menu');
  menu.classList.toggle('open');
}
function closeMenu() {
  const menu = document.querySelector('.hamburger-menu');
  if (menu) menu.classList.remove('open');
}
window.addEventListener('click', function (e) {
  const menu = document.querySelector('.hamburger-menu');
  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !e.target.closest('.hamburger-icon')) {
    closeMenu();
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
    renderPromoTiles(data, 'All');
    renderDealsByCategory(data, 'All');
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

  // Special case for Flower
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

  promoGrid.innerHTML = featuredDeals.map(d => `
    <div class="promo-tile">
      <div class="promo-image">
        <img src="${d.ImageURL?.trim() || 'https://raw.githubusercontent.com/greenlabsmi/Green-labs-site/main/green_labs_logo.png'}" alt="${d['Deal Title']}" />
        ${d.Label ? `<span class="promo-badge">${d.Label}</span>` : ''}
      </div>
      <div class="promo-info">
        <h4>${d["Deal Title"]}</h4>
        <p>${d["Effects/Tagline"] || ''}</p>
        <p class="price-tag">$${d.Price} <span class="tax-note">tax included</span></p>
      </div>
    </div>
  `).join('');
}
function renderGroupedFlowerDeals(data) {
  const container = document.getElementById("deals-container");
  container.innerHTML = '';

  const weightMap = {
    '28g': 'Ounce', '28G': 'Ounce',
    '14g': 'Half', '14G': 'Half',
    '7g': 'Quarter', '7G': 'Quarter',
    '3.5g': 'Eighth', '3.5G': 'Eighth',
    '1g': 'Gram', '1G': 'Gram'
  };

  const weightOrder = ['Ounce', 'Half', 'Quarter', 'Eighth', 'Gram'];

  const flowerDeals = data.filter(d => d.Category?.toLowerCase() === 'flower');

  const groupedByWeight = {};
  flowerDeals.forEach(deal => {
    const rawWeight = deal.Weight?.trim();
    const group = weightMap[rawWeight] || 'General';
    if (!groupedByWeight[group]) groupedByWeight[group] = [];
    groupedByWeight[group].push(deal);
  });

  const section = document.createElement("div");
  section.className = "deal-category active";
  section.dataset.category = 'Flower';

  weightOrder.concat('General').forEach(group => {
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
                  <img src="${d.ImageURL?.trim() || 'https://raw.githubusercontent.com/greenlabsmi/Green-labs-site/main/green_labs_logo.png'}" alt="${d['Deal Title']}" />
                  ${d.Label ? `<span class="promo-badge">${d.Label}</span>` : ''}
                </div>
                <div class="promo-info">
                  <h4>${d["Deal Title"]}</h4>
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
