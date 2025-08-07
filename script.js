// Dutch Republic Site JS – Base Setup

document.addEventListener('DOMContentLoaded', () => {
  console.log("Site loaded and ready.");

  // Example: Newsletter form handler
  const newsletterForm = document.querySelector('.newsletter form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (email) {
        alert(`Thanks for signing up, ${email}!`);
        emailInput.value = '';
      } else {
        alert("Please enter a valid email.");
      }
    });
  }

  // Placeholder: Future chatbot button trigger
  // const chatButton = document.querySelector('.chat-button');
  // chatButton?.addEventListener('click', () => {
  //   openChatbot();
  // });

  // Placeholder: Tile interaction (future expansion)
  const dealTiles = document.querySelectorAll('.deal-tile');
  dealTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      alert(`You clicked on ${tile.querySelector('h3').innerText}`);
      // Later: expand tile, open modal, or link to Leafly
    });
  });
});
