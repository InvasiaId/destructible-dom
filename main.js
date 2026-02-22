import Matter from 'matter-js';

const { Engine, Render, Runner, World, Bodies, Body } = Matter;

const engine = Engine.create();
const world = engine.world;
engine.world.gravity.y = 1.2; // Sedikit lebih berat agar puing jatuh lebih alami

const canvas = document.getElementById('game-canvas');
const destroyBtn = document.getElementById('destroy-btn');
const customCursor = document.getElementById('custom-cursor');
let isGameActive = false;

const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: 'transparent'
  }
});

destroyBtn.addEventListener('click', () => {
  if (isGameActive) return;
  isGameActive = true;
  
  document.body.classList.add('game-mode');
  
  customCursor.style.display = 'block';
  destroyBtn.style.opacity = '0';
  setTimeout(() => destroyBtn.remove(), 300);
  
  Render.run(render);
  Runner.run(Runner.create(), engine);
});

window.addEventListener('mousemove', (e) => {
  if (!isGameActive) return;
  customCursor.style.left = `${e.clientX}px`;
  customCursor.style.top = `${e.clientY}px`;
});

window.addEventListener('mousedown', (e) => {
  if (!isGameActive) return;

  // Animasi Ledakan
  customCursor.textContent = '💥';
  customCursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
  
  setTimeout(() => {
    customCursor.textContent = '💣';
    customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 150);

  // Raycasting ke DOM
  canvas.style.pointerEvents = 'none';
  const targetElement = document.elementFromPoint(e.clientX, e.clientY);
  canvas.style.pointerEvents = 'auto';

  // Validasi: Jangan hancurkan body, html, kontainer utama, atau SECTION besar.
  // Memaksa user menghancurkan elemen kecil (kartu, teks, tombol) satu per satu.
  if (
    targetElement && 
    targetElement.tagName !== 'BODY' && 
    targetElement.tagName !== 'HTML' &&
    targetElement.tagName !== 'SECTION' && 
    targetElement.id !== 'portfolio-ui' &&
    targetElement.style.visibility !== 'hidden'
  ) {
    
    const rect = targetElement.getBoundingClientRect();
    
    // Ambil warna untuk puing. Jika transparan, gunakan warna abu-abu pastel
    const computedStyle = window.getComputedStyle(targetElement);
    let color = computedStyle.backgroundColor;
    if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
      color = computedStyle.color === 'rgba(0, 0, 0, 0)' ? '#e0e0e0' : computedStyle.color; 
    }

    targetElement.style.visibility = 'hidden';
    shatterElementIntoPhysics(rect.x, rect.y, rect.width, rect.height, color);
  }
});

function shatterElementIntoPhysics(x, y, width, height, color) {
  // Ukuran grid puing
  const columns = Math.min(Math.max(Math.floor(width / 30), 2), 12);
  const rows = Math.min(Math.max(Math.floor(height / 30), 2), 12);
  
  const partWidth = width / columns;
  const partHeight = height / rows;

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const partX = x + (i * partWidth) + (partWidth / 2);
      const partY = y + (j * partHeight) + (partHeight / 2);

      const debris = Bodies.rectangle(partX, partY, partWidth, partHeight, {
        render: { 
          fillStyle: color, 
          strokeStyle: '#ffffff', // Outline putih agar cocok dengan tema pastel
          lineWidth: 1.5 
        }
      });

      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const forceX = (partX - centerX) * 0.00008;
      const forceY = (partY - centerY) * 0.00008 - 0.015; 
      
      Body.applyForce(debris, debris.position, { x: forceX, y: forceY });
      World.add(world, debris);
    }
  }
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
});