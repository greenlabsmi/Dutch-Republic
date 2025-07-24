console.log("Dutch District script loaded");

function openChat() {
  alert("AI Budtender coming soon!");
}
function openSearch() {
  alert("Search launching soon!");
}
function toggleMenu() {
  const menu = document.getElementById("hamburgerMenu");
  const open = menu.classList.toggle("open");
  document.body.classList.toggle("menu-open", open);
}
document.addEventListener("click", e => {
  const menu = document.getElementById("hamburgerMenu");
  const icon = document.querySelector(".hamburger-icon");
  if (menu.classList.contains("open") && !menu.contains(e.target) && !icon.contains(e.target)) {
    menu.classList.remove("open");
  }
});

// Wishlist (basic for demo)
let wishlist = JSON.parse(localStorage.getItem('wishlist'))||[];
function showWishlistModal() {
  document.getElementById('wishlistModal').style.display='block';
}
function hideWishlistModal() {
  document.getElementById('wishlistModal').style.display='none';
}
