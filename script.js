// === Initialization and Utility ===
console.log("script.js loaded");

// === Chatbot and Search Actions ===
function openChat() {
  alert("Launching the AI Budtender… (This will be replaced with actual chatbot trigger)");
}

function openSearch() {
  alert("Search function coming soon! Type to find strains, deals, or categories.");
}

// === Hamburger Menu Open/Close ===
function toggleMenu() {
  console.log("toggleMenu fired");
  const menu = document.querySelector('.hamburger-menu');
  menu.classList.toggle('open');
}

function closeMenu() {
  const menu = document.querySelector('.hamburger-menu');
  if (menu) menu.classList.remove('open');
}

// Tap outside to close menu
window.addEventListener('click', function (e) {
  const menu = document.querySelector('.hamburger-menu');
  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !e.target.closest('.hamburger-icon')) {
    closeMenu();
  }
});

// === Flower Deals Expand/Collapse ===
function scrollToAllFlower() {
  const mainSection = document.getElementById('flowerDeals');
  const allDeals = document.getElementById('allFlowerDeals');
  const btn = document.getElementById('flowerToggleBtn');

  mainSection.classList.toggle('active');
  allDeals.classList.toggle('active');

  const isActive = mainSection.classList.contains('active');
  btn.setAttribute('aria-expanded', isActive);
  btn.textContent = isActive ? '👆 Hide Flower Deals' : '🌿 Flower';

  if (isActive) {
    document.getElementById('deals').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function expandAllFlowerDeals() {
  const mainSection = document.getElementById('flowerDeals');
  const allDeals = document.getElementById('allFlowerDeals');
  const btn = document.getElementById('flowerToggleBtn');

  mainSection.style.display = 'block';
  allDeals.classList.add('active');
  allDeals.style.display = 'block';

  btn.textContent = '✖️ Hide Flower Deals';
  btn.setAttribute('onclick', 'collapseAllFlowerDeals()');

  mainSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function collapseAllFlowerDeals() {
  const mainSection = document.getElementById('flowerDeals');
  const allDeals = document.getElementById('allFlowerDeals');
  const btn = document.getElementById('flowerToggleBtn');

  allDeals.classList.remove('active');
  allDeals.style.display = 'none';

  btn.textContent = '➕ See All Flower Deals';
  btn.setAttribute('onclick', 'expandAllFlowerDeals()');

  mainSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
// === Apple or Google Maps Button ===
function openPreferredMap() {
  const appleCoords = "41.81116,-83.44617";
  const googleAddress = encodeURIComponent("10701 Madison St, Luna Pier, MI 48157");
  const isApple = /iPhone|iPad|Macintosh|Mac OS/.test(navigator.userAgent);

  if (isApple) {
    window.open(`https://maps.apple.com/?ll=${appleCoords}`, '_blank');
  } else {
    window.open(`https://www.google.com/maps/place/${googleAddress}`, '_blank');
  }
}

// === Global Storage for Deals ===
let allDealsData = [];

// === Handle Category Select Dropdown ===
function handleCategorySelect(selectedValue) {
  const allSections = document.querySelectorAll('.deal-category');
  allSections.forEach(section => {
    const isMatch = section.dataset.category === selectedValue || selectedValue === 'All';
    section.style.display = isMatch ? 'block' : 'none';
  });

  const dealsSection = document.getElementById('deals');
  if (dealsSection) {
    dealsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollBy(0, -20);
  }

  // Re-render filtered content
  renderPromoTiles(allDealsData, selectedValue);
  renderDealsByCategory(allDealsData, selectedValue);
}
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

// === Render Featured Promo Tiles ===
function renderPromoTiles(data, selectedCategory = 'All') {
  const promoGrid = document.getElementById("promoGrid");
  if (!promoGrid) return;

  const featuredDeals = data.filter(d =>
    d.Featured && d.Featured.toLowerCase() === 'yes' &&
    (selectedCategory === 'All' || d.Category === selectedCategory)
  );

  promoGrid.innerHTML = featuredDeals.map(d => `
    <div class="promo-tile">
      <div class="promo-image">
        <img src="${d.ImageURL || 'https://raw.githubusercontent.com/greenlabsmii/Green-labs-site/main/green_labs_logo.png'}" alt="${d['Deal Title']}" />
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
// === Render All Deals By Category ===
function renderDealsByCategory(data, selectedCategory = 'All') {
  const container = document.getElementById("deals-container");
  container.innerHTML = '';

  const weightMap = {
    '3.5g': 'Eighth',
    '3.5G': 'Eighth',
    '7g': 'Quarter',
    '14g': 'Half',
    '14G': 'Half',
    '28g': 'Ounce',
    '28G': 'Ounce'
  };

  const validDeals = data.filter(d =>
    selectedCategory === 'All' || d.Category === selectedCategory
  );

  // Group Flower deals by normalized weight label
const groupedByWeight = {};
validDeals.forEach(deal => {
  const category = deal.Category?.trim();
  const rawWeight = deal.Weight?.trim();
  const groupLabel = weightMap[rawWeight];

  if ((selectedCategory === 'Flower' || selectedCategory === 'All') && category === 'Flower' && groupLabel) {
    if (!groupedByWeight[groupLabel]) groupedByWeight[groupLabel] = [];
    groupedByWeight[groupLabel].push(deal);
  } else {
    if (!groupedByWeight.General) groupedByWeight.General = [];
    groupedByWeight.General.push(deal);
  }
});

  const section = document.createElement("div");
  section.className = "deal-category active";
  section.dataset.category = selectedCategory;

  for (const [group, deals] of Object.entries(groupedByWeight)) {
    section.innerHTML += `
      <div class="weight-group">
        <h3>${group}s</h3>
        <div class="flower-tile-group">
          ${deals.map(d => `
            <div class="deal-tile">
              <h4>${d["Deal Title"]}</h4>
              ${d["Amount/Details"] ? `<p>${d["Amount/Details"]}</p>` : ''}
              ${d.Notes ? `<p class="deal-notes">${d.Notes}</p>` : ''}
              <p><strong>$${d.Price}</strong> <span class="tax-note">tax included</span></p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.appendChild(section);
}
