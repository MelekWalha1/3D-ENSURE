const slider = document.querySelector('.testimonial-slider');

let isDown = false;
let startX;
let scrollLeft;

// --- Mouse Drag ---
slider.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener('mouseleave', () => isDown = false);
slider.addEventListener('mouseup', () => isDown = false);

slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 1.5; // scroll speed
  slider.scrollLeft = scrollLeft - walk;
});

// --- Touch Support ---
let startTouchX;
slider.addEventListener('touchstart', (e) => {
  startTouchX = e.touches[0].pageX;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener('touchmove', (e) => {
  const x = e.touches[0].pageX;
  const walk = (x - startTouchX) * 1.5;
  slider.scrollLeft = scrollLeft - walk;
});
