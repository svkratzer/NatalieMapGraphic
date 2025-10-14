const photos = [
  { src: 'assets/PandO1.jpg', label: 'Gallery' },
  { src: 'assets/PandO2.jpg', label: 'Gallery' },
  { src: 'assets/PandO3.jpg', label: 'Gallery' },
];

const polaroidContainer = document.getElementById('polaroid-slideshow');
let polaroidElements = [];
let currentPhoto = 0;
let polaroidCount = 0;

let intervalPhoto = null;
let intervalStack = null;
let paused = false;

function addPolaroid(photo, rotation) {
  const polaroid = document.createElement('div');
  polaroid.className = 'polaroid';
  polaroid.style.zIndex = polaroidCount + 1;
  polaroid.style.transform = `rotate(${rotation}deg)`;
  // polaroid.style.background = '#fffbe9';
  polaroid.innerHTML = `
    <img src="${photo.src}" alt="${photo.label}">
    <div class="polaroid-label">${photo.label}</div>
  `;
  polaroidContainer.appendChild(polaroid);
  polaroidElements.push(polaroid);
  polaroidCount++;
}

function nextPhoto() {
  const rotation = (polaroidCount % 2 === 0) ? -8 : 8;
  addPolaroid(photos[currentPhoto], rotation);
  currentPhoto = (currentPhoto + 1) % photos.length;
}

function startSlideshow() {
  intervalPhoto = setInterval(nextPhoto, 1000);
  intervalStack = setInterval(() => {
    const maxStack = 7;
    if (polaroidElements.length > maxStack) {
      const old = polaroidElements.shift();
      old.remove();
    }
  }, 500);
}

function pauseSlideshow() {
  clearInterval(intervalPhoto);
  clearInterval(intervalStack);
}

export function mountSlideShow(slideshowPixel) {
  // Position the slideshow at map coordinates in Route.js
  polaroidContainer.style.position = 'absolute';
  polaroidContainer.style.left = `${slideshowPixel[0]}px`;
  polaroidContainer.style.top = `${slideshowPixel[1]}px`;

  startSlideshow();

  // Hover events to pause/resume and toggle visual state
  polaroidContainer.addEventListener('mouseenter', () => {
    if (!paused) {
      paused = true;
      polaroidContainer.classList.add('paused');
      pauseSlideshow();
    }
  });
  polaroidContainer.addEventListener('mouseleave', () => {
    if (paused) {
      paused = false;
      polaroidContainer.classList.remove('paused');
      startSlideshow();
    }
  });
}