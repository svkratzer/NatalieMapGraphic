const photos = [
  { src: 'assets/PandO1.jpg', label: 'portfolio' },
  { src: 'assets/PandO2.jpg', label: 'portfolio' },
  { src: 'assets/PandO3.jpg', label: 'portfolio' },
];

const polaroidContainer = document.getElementById('polaroid-slideshow');
let polaroidElements = [];
let currentPhoto = 0;
let polaroidCount = 0;

let intervalPhoto = null;
let intervalStack = null;
let paused = false;

let shakeIntervals = []; // Track shaking intervals for each polaroid

function addPolaroid(photo, rotation) {
  const polaroid = document.createElement('div');
  polaroid.className = 'polaroid';
  polaroid.style.zIndex = polaroidCount + 1;
  polaroid.style.transform = `rotate(${rotation}deg)`;
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

// ----- SHAKING LABEL LOGIC -----
function setShakingLabel(polaroid, text) {
  const labelDiv = polaroid.querySelector('.polaroid-label');
  labelDiv.innerHTML = ""; // Clear old label
  // Create spans for each letter
  for (let i = 0; i < text.length; ++i) {
    const span = document.createElement('span');
    span.textContent = text[i];
    span.className = 'shaking-letter';
    labelDiv.appendChild(span);
  }
}

function startShakingLabels() {
  polaroidElements.forEach((polaroid, idx) => {
    // setShakingLabel(polaroid, "view\u00A0more");
    setShakingLabel(polaroid, "portfolio");
    const spans = polaroid.querySelectorAll('.shaking-letter');
    let interval = setInterval(() => {
      spans.forEach(span => {
        const dx = (Math.random() - 0.5) * 3;
        const dy = (Math.random() - 0.5) * 3;
        span.style.display = 'inline-block';
        span.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    }, 60);
    shakeIntervals[idx] = interval;
  });
}

function stopShakingLabels() {
  polaroidElements.forEach((polaroid, idx) => {
    clearInterval(shakeIntervals[idx]);
    const labelDiv = polaroid.querySelector('.polaroid-label');
    // Restore label to whatever photo it is
    const imgSrc = polaroid.querySelector('img').src;
    const photoIdx = photos.findIndex(photo => imgSrc.includes(photo.src));
    labelDiv.textContent = photos[photoIdx]?.label || '';
    // Remove shaking-letter spans if present
  });
  shakeIntervals = [];
}

// ----- MOUNT SLIDESHOW -----
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
      // Start label shake
      startShakingLabels();
    }
  });
  polaroidContainer.addEventListener('mouseleave', () => {
    if (paused) {
      paused = false;
      polaroidContainer.classList.remove('paused');
      startSlideshow();
      // Stop label shake
      stopShakingLabels();
    }
  });
}