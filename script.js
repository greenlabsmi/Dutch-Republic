console.log("script.js loaded");

// === Chatbot and Search Actions ===
function openChat() {
  alert("Launching the AI Budtender… (This will be replaced with actual chatbot trigger)");
}

function openSearch() {
  alert("Search function coming soon! Type to find strains, deals, or categories.");
}

// === Deal Category Toggle ===
function toggleCategory(categoryId) {
  const allCategories = document.querySelectorAll('.deal-category');
  allCategories.forEach(category => {
    if (category.id === categoryId) {
      const isHidden = category.style.display === 'none';
      category.style.display = isHidden ? 'block' : 'none';
    } else {
      category.style.display = 'none';
    }
  });
}

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

function toggleAllFlower() {
  const section = document.getElementById('allFlowerDeals');
  const isHidden = section.style.display === 'none' || section.style.display === '';
  section.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    document.getElementById('flowerDeals').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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

function handleCategorySelect(selectedValue) {
  const allSections = document.querySelectorAll('.deal-category');
  allSections.forEach(section => {
    const isMatch = section.dataset.category === selectedValue || selectedValue === 'All';
    section.style.display = isMatch ? 'block' : 'none';
  });

  // Auto-scroll to the deals section after category change
  const dealsSection = document.getElementById('deals');
  if (dealsSection) {
    dealsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollBy(0, -20); // Optional nudge so banner stays in view
  }
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

// === Load Deals from Google Sheets ===
const sheetURL = 'https://opensheet.elk.sh/132VDRorvAHlWm_OaIJI-JDXrYiyPA4RWm6voajQbiqU/Sheet1';

fetch(sheetURL)
  .then(response => response.json())
   .then(data => {
    console.log("Deals loaded:", data);
    window.allDeals = data; // Save full dataset globally
    renderPromoTiles(data, 'All'); // Initial Featured Picks
    renderDealsByCategory(data, 'All'); // Initial deal sections
  })

  .catch(error => {
    console.error("Error loading deals:", error);
    document.getElementById("deals-container").innerHTML = "<p>Failed to load deals.</p>";
  });

function renderPromoTiles(data, selectedCategory = 'All') {
  const promoGrid = document.getElementById("promoGrid");
  const featuredDeals = data.filter(d => 
    d.Featured && d.Featured.toLowerCase() === 'yes' &&
    (selectedCategory === 'All' || d.Category === selectedCategory)
  );

  promoGrid.innerHTML = featuredDeals.map(d => `
    <div class="promo-tile">
      <div class="promo-image">
        <img src="${d.ImageURL || 'https://raw.githubusercontent.com/greenlabsmii/Green-labs-site/main/green_labs_logo.png'}" ... />

        ${d.Label ? `<span class="promo-badge">${d.Label}</span>` : ''}
      </div>
      <div class="promo-info">
        <h4>${d["Deal Title"]}</h4>
        <p>${d["Effects/Tagline"] || ''}</p>
        <p class="price-tag">$${d.Price} <span class="tax-note">tax included</span></p>
      </div>
    </div>
  `).join('');
  
function renderDealsByCategory(data, selectedCategory = 'All') {
  const container = document.getElementById("deals-container");
  container.innerHTML = '';

  const categories = {};

  data.forEach(deal => {
    const category = deal.Category || "Uncategorized";
    if (!categories[category]) categories[category] = [];
    categories[category].push(deal);
  });

  for (const [category, deals] of Object.entries(categories)) {
    if (selectedCategory !== 'All' && selectedCategory !== category) continue;

    const section = document.createElement("div");
    section.className = "deal-category active";
    section.dataset.category = category;

    section.innerHTML = `
      <h2>${category} Deals</h2>
      <div class="tile-grid">
        ${deals.map(d => `
          <div class="deal-tile">
            <h4>${d["Deal Title"]}</h4>
            <p>${d["Amount/Details"] || ''}</p>
            <p><strong>$${d.Price}</strong> <span class="tax-note">tax included</span></p>
          </div>
        `).join('')}
      </div>
    `;

    container.appendChild(section);
  }
}
