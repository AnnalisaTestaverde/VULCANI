// ===== P5.JS CON SCROLL FLUIDO =====
let lines = [];
const numLines = 100;
const noiseScale = 0.008;
let timeOffset = 0;
const noiseSpeed = 0.003;
let canvas;
let animationInterval;
let isScrolling = false;
let scrollTimeout;

function setup() {
    // Crea canvas
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.id("p5-background-canvas");
    canvas.position(0, 0);
    canvas.style('z-index', '-1');
    canvas.style('pointer-events', 'none');
    
    // Ottimizzazioni rendering
    canvas.elt.style.imageRendering = 'optimizeSpeed';
    drawingContext.imageSmoothingEnabled = false;
    
    // Genera linee (100 linee, punti ogni 8px)
    for (let i = 0; i < numLines; i++) {
        lines[i] = [];
        for (let x = 0; x < width; x += 8) {
            lines[i].push(x);
        }
    }
    
    // Ferma il loop automatico
    noLoop();
    
    // Avvia animazione a 30fps
    animationInterval = setInterval(drawFrame, 33);
    
    // Rileva scroll per ottimizzare
    window.addEventListener('scroll', handleScroll, { passive: true });
}

function handleScroll() {
    // Segnala che stiamo scrollando
    isScrolling = true;
    
    // Ferma temporaneamente l'animazione durante scroll veloce
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    // Ripristina animazione dopo lo scroll
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        if (!animationInterval) {
            animationInterval = setInterval(drawFrame, 33);
        }
    }, 150);
}

function drawFrame() {
    // Disegna solo se non stiamo scrollando velocemente
    if (!isScrolling) {
        draw();
    }
}

function draw() {
    // Sfondo con effetto ghosting 
    background(255, 255, 255, 15);
    
    // Incrementa tempo 
    timeOffset += noiseSpeed;

    // DISEGNA TUTTE LE LINEE
    for (let i = 0; i < lines.length; i++) {
        stroke('#ff2a00ff');
        strokeWeight(2); // 
        noFill();

        beginShape();
        // USA TUTTI I PUNTI ORIGINALI
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

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Rigenera linee
    for (let i = 0; i < numLines; i++) {
        lines[i] = [];
        for (let x = 0; x < width; x += 8) {
            lines[i].push(x);
        }
    }
}

// Pulizia per evitare sovraccarico
window.addEventListener('beforeunload', function() {
    if (animationInterval) {
        clearInterval(animationInterval);
    }
    window.removeEventListener('scroll', handleScroll);
});