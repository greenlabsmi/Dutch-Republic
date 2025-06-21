<script>
  function openChat() {
    alert("Opening the AI Budtender…");
  }

  function toggleCategory(categoryId) {
    const categories = document.querySelectorAll('.deal-category');
    categories.forEach((cat) => {
      if (cat.id === categoryId) {
        cat.classList.toggle('active');
      } else {
        cat.classList.remove('active');
      }
    });
  }
</script>
