// Dutch Republic Site JS – Full Script

document.addEventListener("DOMContentLoaded", () => {
  console.log("Dutch Republic site ready.");

  // --- Newsletter form ---
  const newsletterForm = document.querySelector(".newsletter form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (email) {
        alert(`Thanks for signing up, ${email}!`);
        emailInput.value = "";
      } else {
        alert("Please enter a valid email.");
      }
    });
  }

  // --- Tile click behavior (placeholder for Leafly/modal/chatbot) ---
  const dealTiles = document.querySelectorAll(".deal-tile");
  dealTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      alert(`You clicked on ${tile.querySelector("h3").innerText}`);
      // Future: expand with strain info or redirect to chatbot/Leafly
    });
  });

  // --- Dutch Touch strain filtering ---
  const filterButtons = document.querySelectorAll(".filter-btn");
  const strainTiles = document.querySelectorAll(".strain-tile");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const filter = this.textContent.trim().toLowerCase();
      strainTiles.forEach((tile) => {
        const tags = tile.getAttribute("data-tags").toLowerCase();

        if (filter === "all" || tags.includes(filter)) {
          tile.style.display = "block";
        } else {
          tile.style.display = "none";
        }
      });
    });
  });

  // --- Show All button logic ---
  const showAllButton = document.getElementById("show-all-strains");
  if (showAllButton) {
    showAllButton.addEventListener("click", () => {
      strainTiles.forEach((tile) => (tile.style.display = "block"));
      filterButtons.forEach((btn) => btn.classList.remove("active"));
    });
  }

  // --- Live search filter ---
  const searchInput = document.getElementById("strain-search");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      strainTiles.forEach((tile) => {
        const name = tile.querySelector("h4").innerText.toLowerCase();
        if (name.includes(query)) {
          tile.style.display = "block";
        } else {
          tile.style.display = "none";
        }
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // --- Optional: strain tile chatbot popup on click ---
  const strainTilesInteractive = document.querySelectorAll(".strain-tile");
  strainTilesInteractive.forEach((tile) => {
    tile.addEventListener("click", () => {
      const strainName = tile.querySelector("h4")?.innerText;
      const simulatedQuery = `Tell me more about the strain ${strainName}`;
      alert(`💬 AI Chatbot will answer: ${simulatedQuery}`);
      // In future: trigger embedded chatbot with strain context
    });
  });

  // --- Automatic color hue application based on data-tags ---
  strainTiles.forEach((tile) => {
    const tags = tile.getAttribute("data-tags").toLowerCase();
    const color = getColorFromTags(tags);
    tile.style.borderTop = `6px solid ${color}`;
  });

  function getColorFromTags(tags) {
    if (tags.includes("uplifting")) return "#f97316"; // coral
    if (tags.includes("mellow")) return "#60a5fa"; // blue
    if (tags.includes("balanced")) return "#10b981"; // green
    if (tags.includes("award")) return "#facc15"; // gold
    return "#d1d5db"; // neutral gray fallback
  }
});

function openChatbot() {
  alert("Chatbot coming soon! In the meantime, our team is happy to help in-store or via DM.");
}
