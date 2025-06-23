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
  const categories = document.querySelectorAll('.deal-category');
  categories.forEach((cat) => {
    if (cat.id === categoryId) {
      cat.classList.toggle('active');
      if (cat.classList.contains('active')) {
        const button = document.querySelector(`button[onclick="toggleCategory('${categoryId}')"]`);
        if (button) {
          button.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      cat.classList.remove('active');
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

  function openPreferredMap() {
  const appleCoords = "41.81116,-83.44617"; // Correct pin location
  const googleAddress = encodeURIComponent("10701 Madison St, Luna Pier, MI 48157");
  const isApple = /iPhone|iPad|Macintosh|Mac OS/.test(navigator.userAgent);

  if (isApple) {
    window.open(`https://maps.apple.com/?ll=${appleCoords}`, '_blank');
  } else {
    window.open(`https://www.google.com/maps/place/${googleAddress}`, '_blank');
  }
}
