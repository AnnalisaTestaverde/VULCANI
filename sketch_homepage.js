// ===== VARIABILI PER ANIMAZIONE =====
let lines = [];
const numLines = 100;
const noiseScale = 0.008;
let timeOffset = 0;
const noiseSpeed = 0.003;

// ===== SETUP P5.JS =====
function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.id("p5-background-canvas");
    canvas.position(0, 0);
    canvas.style('z-index', '-1');
    canvas.style('pointer-events', 'none');

    // Genera linee iniziali
    for (let i = 0; i < numLines; i++) {
        lines[i] = [];
        for (let x = 0; x < width; x += 8) {
            lines[i].push(x);
        }
    }
}

// ===== DRAW LOOP =====
function draw() {
    // Sfondo con effetto ghosting
    background(255, 255, 255, 15);
    
    // Incrementa tempo per animazione
    timeOffset += noiseSpeed;

    // Disegna tutte le linee
    for (let i = 0; i < lines.length; i++) {
        stroke('#ff2a00ff');
        strokeWeight(2);
        noFill();

        beginShape();
        for (let j = 0; j < lines[i].length; j++) {
            const x = lines[i][j];
            const yBase = map(i, 0, lines.length - 1, height * 0.1, height * 0.9);
            
            const noiseVal = noise(
                x * noiseScale,
                yBase * noiseScale,
                timeOffset + i * 0.05
            );
            
            const yOffset = map(noiseVal, 0, 1, -40, 50);
            const y = yBase + yOffset;
            
            vertex(x, y);
        }
        endShape();
    }
}

// ===== WINDOW RESIZE =====
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    for (let i = 0; i < numLines; i++) {
        lines[i] = [];
        for (let x = 0; x < width; x += 8) {
            lines[i].push(x);
        }
    }
}

// FUNZIONE PER LO SCROLL SMOOTH VERSO IL CONTENT
function setupScrollHint() {
  const scrollHint = document.querySelector('.scroll-hint.center-hint');
  if (scrollHint) {
    scrollHint.addEventListener('click', function(e) {
      e.preventDefault();
      const contentSection = document.getElementById('content');
      if (contentSection) {
        contentSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }
}