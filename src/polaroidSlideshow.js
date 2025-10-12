const photos = [
  { src: 'assets/PandO1.jpg', label: 'Gallery' },
  { src: 'assets/PandO2.jpg', label: 'Gallery' },
  { src: 'assets/PandO3.jpg', label: 'Gallery' },
];

const polaroidContainer = document.getElementById('polaroid-slideshow');
let polaroidElements = [];
let currentPhoto = 0;
let polaroidCount = 0;

function addPolaroid(photo, rotation) {
  const polaroid = document.createElement('div');
  polaroid.className = 'polaroid';
  polaroid.style.zIndex = polaroidCount + 1;
  polaroid.style.transform = `rotate(${rotation}deg)`;
  polaroid.style.background = '#fffbe9';
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

export function mountSlideShow(slideshowPixel) {
  // Position the slideshow at map coordinates in Route.js
  polaroidContainer.style.position = 'absolute';
  console.log(slideshowPixel)
  polaroidContainer.style.left = `${slideshowPixel[0]}px`;
  polaroidContainer.style.top = `${slideshowPixel[1]}px`;

  setInterval(nextPhoto, 1000);

  // Optionally: Limit stacking to N visible polaroids
  const maxStack = 7;
  setInterval(() => {
    if (polaroidElements.length > maxStack) {
      const old = polaroidElements.shift();
      old.remove();
    }
  }, 500);
}
