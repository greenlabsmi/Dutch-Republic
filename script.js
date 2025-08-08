// Dutch Republic Site JS — Full Script (filters, search, sort, hues, wishlist, modal, chatbot)

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

  // --- Deal tile click placeholder (future: open promo modal / link) ---
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

  // --- Wishlist (session only; upgrade to localStorage later if you want) ---
  let wishlist = new Set();

  // --- Elements expected in HTML ---
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

  // --- Render the grid ---
  function renderStrains() {
    if (!strainGrid) return;

    const activeFilterBtn = document.querySelector(".filter-buttons .active");
    const filter = activeFilterBtn
      ? activeFilterBtn.dataset.filter || activeFilterBtn.textContent.trim().toLowerCase()
      : "all";

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

      // wishlist star toggle
      tile.querySelector(".star")?.addEventListener("click", (e) => {
        e.stopPropagation();
        const name = e.currentTarget.dataset.name;
        if (wishlist.has(name)) wishlist.delete(name);
        else wishlist.add(name);
        e.currentTarget.textContent = wishlist.has(name) ? "⭐" : "☆";
      });

      // details → open modal
      tile.querySelector(".learn-more")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openStrainModal(s);
      });

      // ask → chatbot
      tile.querySelector(".chat")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openChatbotForStrain(s.name);
      });

      // (optional) clicking tile could also open modal:
      tile.addEventListener("click", () => openStrainModal(s));

      strainGrid.appendChild(tile);
    });

    if (view.length === 0) {
      const empty = document.createElement("p");
      empty.style.marginTop = "1rem";
      empty.textContent = "No strains match your search/filter.";
      strainGrid.appendChild(empty);
    }
  }

  // --- Filter/sort/search events ---
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
    const allBtn =
      document.querySelector('.filter-buttons .filter-btn[data-filter="all"]') ||
      document.querySelector(".filter-buttons .filter-btn");
    allBtn?.classList.add("active");
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "az";
    renderStrains();
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // --- Chatbot globals ---
  window.openChatbot = function () {
    alert("Chatbot coming soon! In the meantime, ask staff in-store or DM us on Instagram.");
  };
  function openChatbotForStrain(name) {
    alert(`💬 Chatbot will answer about: ${name}`);
    // future: open real chatbot widget w/ context: { strain: name }
  }

  // --- Modal (safe if HTML not present; guards in place) ---
  const modal = document.getElementById("strain-modal");
  const modalClose = modal?.querySelector(".modal-close");
  const modalBackdrop = modal?.querySelector(".modal-backdrop");
  const modalTitle = modal?.querySelector("#strain-modal-title");
  const modalBadges = modal?.querySelector(".modal-badges");
  const modalEffect = modal?.querySelector(".modal-effect");
  const modalTerpenes = modal?.querySelector(".modal-terpenes");
  const modalChatBtn = modal?.querySelector("#modal-chat");
  const modalSaveBtn = modal?.querySelector("#modal-save");

  function openStrainModal(s) {
    if (!modal) return; // if you haven't added the modal HTML yet, do nothing
    modalTitle.textContent = s.name;
    modalBadges.innerHTML = `
      ${s.award ? "🏆 Award Winner · " : ""}
      ${s.new ? "🆕 New Drop · " : ""}
      ${s.favorite ? "💚 House Favorite · " : ""}
      ${s.emoji} ${s.category}
    `;
    modalEffect.textContent = s.effect;
    modalTerpenes.textContent = `Terpenes: ${s.tags.join(", ")}`;

    // save button reflects wishlist
    if (modalSaveBtn) {
      modalSaveBtn.textContent = wishlist.has(s.name) ? "⭐ Saved" : "⭐ Save";
      modalSaveBtn.onclick = () => {
        if (wishlist.has(s.name)) wishlist.delete(s.name);
        else wishlist.add(s.name);
        modalSaveBtn.textContent = wishlist.has(s.name) ? "⭐ Saved" : "⭐ Save";
        renderStrains(); // update stars on tiles too
      };
    }

    if (modalChatBtn) {
      modalChatBtn.onclick = () => openChatbotForStrain(s.name);
    }

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeStrainModal() {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  modalClose?.addEventListener("click", closeStrainModal);
  modalBackdrop?.addEventListener("click", closeStrainModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal?.classList?.contains("hidden")) closeStrainModal();
  });

  // Initial render
  renderStrains();
});
