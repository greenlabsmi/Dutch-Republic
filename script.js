document.addEventListener("DOMContentLoaded", function () {
  // === CATEGORY FILTERING ===
  const categoryDropdown = document.getElementById("categoryDropdown");
  if (categoryDropdown) {
    categoryDropdown.addEventListener("change", function () {
      const category = this.value;
      const dealTiles = document.querySelectorAll(".deal-tile");

      dealTiles.forEach((tile) => {
        if (category === "all" || tile.dataset.category === category) {
          tile.style.display = "block";
        } else {
          tile.style.display = "none";
        }
      });
    });
  }

  // === SEARCH STUB ===
  document.getElementById("searchIcon")?.addEventListener("click", () => {
    alert("Search feature coming soon!");
  });

  // === CHATBOT STUB ===
  document.getElementById("chatbotIcon")?.addEventListener("click", () => {
    alert("Launching AI Budtender...");
  });

  // === WISHLIST MODAL ===
  const wishlistIcon = document.getElementById("wishlistIcon");
  const wishlistModal = document.getElementById("wishlistModal");
  const wishlistClose = document.getElementById("wishlistClose");

  wishlistIcon?.addEventListener("click", () => {
    wishlistModal.style.display = "flex";
  });

  wishlistClose?.addEventListener("click", () => {
    wishlistModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === wishlistModal) {
      wishlistModal.style.display = "none";
    }
  });
});
