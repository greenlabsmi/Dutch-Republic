let currentSlide = 0;
const totalSlides = 4;
const track = document.getElementById("carouselTrack");
const dots = document.querySelectorAll(".carousel-dot");

function goToSlide(slide) {
  currentSlide = slide;
  const offset = slide * -100;
  track.style.transform = `translateX(${offset}%)`;
  dots.forEach(dot => dot.classList.remove("active"));
  dots[slide].classList.add("active");
}

function autoSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  goToSlide(currentSlide);
}

let slideInterval = setInterval(autoSlide, 5000);
document.getElementById("banner-carousel").addEventListener("mouseenter", () => clearInterval(slideInterval));
document.getElementById("banner-carousel").addEventListener("mouseleave", () => slideInterval = setInterval(autoSlide, 5000));
