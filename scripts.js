
function openChat() {
  alert("Opening the AI Budtender…");
}
let currentSlide = 0;

function goToSlide(slideIndex) {
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.carousel-dot');
  currentSlide = slideIndex;
  const slideWidth = track.offsetWidth / dots.length;
  track.style.transform = `translateX(-${slideWidth * slideIndex}px)`;

  dots.forEach(dot => dot.classList.remove('active'));
  dots[slideIndex].classList.add('active');
}
