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
const sheetURL = 'https://script.google.com/macros/s/AKfycbwrWbijir5ddoJqCI4p-wAzlETQQZoekLoRCrBV58bI7ZLWssg5CfRcqJ0bw2BTOhea/exec';

fetch(sheetURL)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('deals-container');
    container.innerHTML = '';

    const categories = {};
    data.forEach(deal => {
      if (!categories[deal.Category]) categories[deal.Category] = [];
      categories[deal.Category].push(deal);
    });

    for (const [category, deals] of Object.entries(categories)) {
  const section = document.createElement('div');
  section.className = "deal-category";
  section.dataset.category = category;

  section.innerHTML = `
    <h2>${category} Deals</h2>
    <div class="tile-grid">
      ${deals.map(d => `
        <div class="deal-tile ${d.Featured === 'yes' ? 'featured' : ''}">
          <h4>${d["Deal Title"]}</h4>
          <p>${d["Amount/Details"]}</p>
          <p><strong>$${d.Price}</strong><br>Tax included</p>
        </div>
      `).join('')}
    </div>
  `;

  container.appendChild(section);

  }
  })
  .catch(err => {
    console.error('Error loading deals:', err);
    document.getElementById('deals-container').innerText = 'Failed to load deals.';
  });
