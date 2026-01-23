let lines = [];
const numLines = 100;
const noiseScale = 0.008;
let timeOffset = 0;
// Rallentato da 0.01 a 0.003 per un movimento più lento e fluido
const noiseSpeed = 0.003; 

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  // Assegna l'ID per il CSS
  canvas.id("p5-background-canvas"); 
  canvas.position(0, 0);
  // Usa z-index 0 o -1 nel CSS per posizionare dietro il contenuto
  canvas.style('z-index', '-1'); 
  canvas.style('pointer-events', 'none'); 
  
  // Non chiamiamo background qui, lo facciamo in draw() con la trasparenza

  // Genera linee iniziali
  for (let i = 0; i < numLines; i++) {
    lines[i] = [];
    // Pre-popola le coordinate x (non necessario, ma mantenuto dalla struttura originale)
    for (let x = 0; x < width; x += 8) {
      lines[i].push(x);
    }
  }
}

function draw() {
  // Sfondo Bianco (o quasi bianco) con effetto di trascinamento/dissolvenza (15)
  // Questo crea l'effetto "ghosting" delle linee, rendendo l'animazione più fluida
  background(255, 255, 255, 15);
  
  // Rallentamento applicato qui
  timeOffset += noiseSpeed; 

  for (let i = 0; i < lines.length; i++) {
    // Colore Lava
    stroke('#ff2a00ff');
    strokeWeight(2);
    noFill();

    beginShape();
    for (let j = 0; j < lines[i].length; j++) {
      const x = lines[i][j];
      const yBase = map(i, 0, lines.length - 1, height * 0.1, height * 0.9);
      
      // Calcola il valore del noise per la posizione y
      const noiseVal = noise(
        x * noiseScale,
        yBase * noiseScale,
        timeOffset + i * 0.05 // timeOffset controlla la velocità, i*0.05 differenzia le linee
      );
      
      // Mappa il noise per l'offset verticale
      const yOffset = map(noiseVal, 0, 1, -40, 50);
      const y = yBase + yOffset;
      
      // Disegna il punto per la curva
      vertex(x, y);
    }
    endShape();
  }
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Ricalcola solo le linee x se il canvas è ridimensionato, 
  // le yBase sono calcolate in draw()
  for (let i = 0; i < numLines; i++) {
    lines[i] = [];
    for (let x = 0; x < width; x += 8) {
      lines[i].push(x);
    }
  }
}