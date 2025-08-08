// Dutch Republic Site JS – Full Script (filters, search, sort, hues, chatbot hook)

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

  // --- Deal tile click placeholder ---
  document.querySelectorAll(".deal-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      alert(`You clicked on ${tile.querySelector("h3").innerText}`);
    });
  });

  // --- Dutch Touch: data model ---
  const strains = [
    {
      name: "Mr. Clean",
      category: "uplifting",
      tags: ["terpinolene", "limonene"],
      effect: "Sharp, citrusy, energizing",
      award: true,
      new: false,
      favorite: true,
      emoji: "⚡",
      addedAt: 20240120
    },
    {
      name: "Lilac Diesel",
      category: "balanced",
      tags: ["myrcene", "caryophyllene"],
      effect: "Floral, smooth, balanced buzz",
      award: false,
      new: true,
      favorite: false,
      emoji: "🍃",
      addedAt: 20250615
    },
    {
      name: "Lemon Wookie",
      category: "uplifting",
      tags: ["limonene", "ocimene"],
      effect: "Zesty, playful, euphoric",
      award: true,
      new: false,
      favorite: true,
      emoji: "✨",
      addedAt: 20240302
    },
    {
      name: "Space Hippy",
      category: "mellow",
      tags: ["linalool", "myrcene"],
      effect: "Dreamy, sedative, spacey",
      award: false,
      new: true,
      favorite: false,
      emoji: "🌙",
      addedAt: 20250701
    },
    {
      name: "Clusterfunk",
      category: "balanced",
      tags: ["caryophyllene", "humulene"],
      effect: "Savory, grounded, chill",
      award: false,
      new: false,
      favorite: false,
      emoji: "💨",
      addedAt: 20231010
    },
    {
      name: "Death By Funk",
      category: "mellow",
      tags: ["myrcene", "terpinolene"],
      effect: "Heavy, funky, couchlock",
      award: true,
      new: false,
      favorite: true,
      emoji: "🛋️",
      addedAt: 20231205
    }
  ];

  let wishlist = new Set();

  // --- Elements ---
  const strainGrid = document.getElementById("strainGrid");
  const searchInput = document.getElementById("strain-search");
  const filterButtons = document.querySelectorAll(".filter-buttons .filter-btn");
  const sortSelect = document.getElementById("strain-sort");
  const showAllBtn = document.getElementById("show-all-strains");

  // --- Helpers ---
  function vibeClass(cat) {
    if (cat === "uplifting") return "uplifting";
    if (cat === "mellow") return "mellow";
    if (cat === "balanced") return "balanced";
    return "";
  }

  function tileHueFromCategory(cat) {
    if (cat === "uplifting") return { border: "#f97316", bg: "#fff6f2" }; // coral
    if (cat === "mellow") return { border: "#60a5fa", bg: "#f3f7ff" };    // blue
    if (cat === "balanced") return { border: "#10b981", bg: "#f6fff2" };  // green
    return { border: "#d1d5db", bg: "#ffffff" };                          // gray
  }

  function sortStrains(list, mode) {
    const copy = [...list];
    switch (mode) {
      case "az":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      case "new":
        return copy.sort((a, b) => b.addedAt - a.addedAt);
      case "award":
        return copy.sort((a, b) => Number(b.award) - Number(a.award));
      default:
        return copy;
    }
  }

  function matchesFilter(strain, filter) {
    if (filter === "all") return true;
    if (filter === "award") return strain.award;
    if (filter === "new") return strain.new;
    if (filter === "favorite") return strain.favorite;
    return strain.category === filter;
  }

  // --- Render ---
  function renderStrains() {
    const activeFilterBtn = document.querySelector(".filter-buttons .active");
    const filter = activeFilterBtn ? activeFilterBtn.dataset.filter || activeFilterBtn.textContent.trim().toLowerCase() : "all";
    const q = (searchInput?.value || "").toLowerCase();
    const sortMode = sortSelect?.value || "az";

    // filter + search
    let view = strains.filter((s) => {
      const inFilter = matchesFilter(s, filter);
      const inSearch =
        s.name.toLowerCase().includes(q) ||
        s.effect.toLowerCase().includes(q) ||
        s.tags.join(" ").toLowerCase().includes(q);
      return inFilter && inSearch;
    });

    // sort
    view = sortStrains(view, sortMode);

    // draw
    strainGrid.innerHTML = "";
    view.forEach((s) => {
      const tile = document.createElement("div");
      tile.className = `strain-tile fade-in ${vibeClass(s.category)}`;

      const hues = tileHueFromCategory(s.category);
      tile.style.borderLeft = `6px solid ${hues.border}`;
      tile.style.backgroundColor = hues.bg;

     tile.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;">
    <h3 style="margin:0;">${s.emoji} ${s.name}</h3>
    <button class="star" aria-label="Save strain" data-name="${s.name}" title="Save">
      ${wishlist.has(s.name) ? "⭐" : "☆"}
    </button>
  </div>
  ${s.award ? '<span class="badge">🏆 Award Winner</span>' : ""}
  ${s.new ? '<span class="badge" style="margin-left:6px;">🆕 New Drop</span>' : ""}
  ${s.favorite ? '<span class="badge" style="margin-left:6px;">💚 Favorite</span>' : ""}
  <p class="effect" style="margin-top:.5rem;">${s.effect}</p>
  <p class="tags" style="color:#666;">${s.tags.join(" • ")}</p>
  <div style="display:flex;gap:.5rem;margin-top:.75rem;">
    <button class="button learn-more" type="button">Details</button>
    <button class="button secondary chat" type="button">Ask</button>
  </div>
`;


      // chatbot hook on click
      tile.querySelector(".learn-more").addEventListener("click", (e) => {
        e.stopPropagation();
        openChatbotForStrain(s.name);
      });

      // tile click also triggers chatbot (optional)
      tile.addEventListener("click", () => openChatbotForStrain(s.name));

      strainGrid.appendChild(tile);
    });

    if (view.length === 0) {
      const empty = document.createElement("p");
      empty.style.marginTop = "1rem";
      empty.textContent = "No strains match your search/filter.";
      strainGrid.appendChild(empty);
    }
  }

  // --- Events ---
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderStrains();
    });
  });

  searchInput?.addEventListener("input", renderStrains);
  sortSelect?.addEventListener("change", renderStrains);

  showAllBtn?.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    const allBtn = document.querySelector('.filter-buttons .filter-btn[data-filter="all"]') || document.querySelector(".filter-buttons .filter-btn");
    allBtn?.classList.add("active");
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "az";
    renderStrains();
  });

  // --- Chatbot hooks ---
  window.openChatbot = function () {
    alert("Chatbot coming soon! In the meantime, ask staff in-store or DM us on Instagram.");
  };

  function openChatbotForStrain(name) {
    alert(`💬 Chatbot will answer about: ${name}`);
    // future: open real chatbot widget w/ context: { strain: name }
  }

  // Initial render
  renderStrains();
});
