let imgs = [];
let names = [
  "Alice Comini",
  "Matilde Curino", 
  "Greta Franco",
  "Carlo Galli",
  "Ilaria La Spada",
  "Annalisa Testaverde"
];

// Ruoli dei membri
let roles = [
  "Frontend Development, \nData Visualization & Map-making.",
  "Data Analysis & Visualization,\nIllustrations and Debugging.",
  "Frontend Development, \nIllustrations and Methodology. ",
  "Figma Mockups & Prototypes, \nResearch and Debugging.",
  "Web Development, \nData Visualization & Animations.",
  "Web Support, Learn More \nand Call Management."
];

// Dimensioni di visualizzazione uniformi
let displayConfigs = [];

function preload() {
  imgs[0] = loadImage("../assets/alice.png");
  imgs[1] = loadImage("../assets/mati.png");
  imgs[2] = loadImage("../assets/greta.png");
  imgs[3] = loadImage("../assets/carlo.png");
  imgs[4] = loadImage("../assets/ilaria.png");
  imgs[5] = loadImage("../assets/annalisa.png");
}

function setup() {
  // Calcola altezza totale del contenuto
  const contentHeight = calculateContentHeight();
  
  // Crea canvas con altezza calcolata
  let canvas = createCanvas(window.innerWidth, contentHeight);
  canvas.parent('sketch-container');
  
  // Stili per il canvas
  canvas.style('display', 'block');
  canvas.style('position', 'relative');
  canvas.style('width', '100%');
  canvas.style('height', contentHeight + 'px');
  
  textFont("Helvetica");
  textAlign(CENTER);
  
  // Configurazione per ogni immagine
  setupImageConfigs();
}

function setupImageConfigs() {
  // Configurazioni specifiche per ogni immagine per uniformità
  displayConfigs = [
    { scale: 1.0, offsetY: 0, offsetX: 0 },   // Alice
    { scale: 1.0, offsetY: 0, offsetX: 0 },   // Matilde
    { scale: 1.0, offsetY: 0, offsetX: 0 },   // Greta
    { scale: 1.0, offsetY: 0, offsetX: 0 },   // Carlo
    { scale: 1.0, offsetY: 0, offsetX: 0 },   // Ilaria
    { scale: 1.0, offsetY: 0, offsetX: 0 }    // Annalisa
  ];
}

function draw() {
  background(255);
  
  // Disegna titoli
  drawTitles();
  
  // Disegna tutti i membri
  drawMembers();
}

/* ---------------- TITOLI ---------------- */

function drawTitles() {
  textAlign(CENTER);

  fill(0);
  textSize(window.innerWidth > 768 ? 48 : 36);
  textStyle(BOLD);
  text("TEAM'S PROJECT", width / 2, 100);

  fill("#FF2B00");
  textSize(window.innerWidth > 768 ? 28 : 22);
  text("THE PEOPLE WHO MADE IT POSSIBLE.", width / 2, 150);

  fill(50);
  textSize(window.innerWidth > 768 ? 16 : 14);
  textStyle(NORMAL);

  let t = "Hi! We are second-year students of Communication Design from Section C2\nof the Computer Graphics Laboratory course at Politecnico di Milano.";
  
  if (window.innerWidth <= 768) {
    t = "Hi! We are second-year students of Communication Design\nfrom Section C2 of the Computer Graphics Laboratory\ncourse at Politecnico di Milano.";
  }
  
  text(t, width / 2, 200);
}

/* ---------------- GRIGLIA MEMBRI ---------------- */

function drawMembers() {
  // Calcola layout basato sulla larghezza
  let cols, colW, rowH, startY, circleRadius;
  
  if (window.innerWidth > 1024) {
    cols = 3;
    colW = 320;
    rowH = 380;
    startY = 280;
    circleRadius = 100; // Cerchio grande
  } else if (window.innerWidth > 768) {
    cols = 3;
    colW = 240;
    rowH = 360;
    startY = 260;
    circleRadius = 90;
  } else if (window.innerWidth > 480) {
    cols = 2;
    colW = 280;
    rowH = 350;
    startY = 240;
    circleRadius = 85;
  } else {
    cols = 1;
    colW = 280;
    rowH = 340;
    startY = 220;
    circleRadius = 80;
  }
  
  let totalW = cols * colW;
  let startX = (width - totalW) / 2;

  for (let i = 0; i < names.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);

    let x = startX + col * colW;
    let y = startY + row * rowH;

    let centerX = x + colW / 2;
    let imgCenterY = y + circleRadius + 20;

    // 1. PRIMA: Cerchio di sfondo BIANCO (stesso colore dello sfondo)
    fill(255); // BIANCO PURO
    noStroke();
    ellipse(centerX, imgCenterY, circleRadius * 2, circleRadius * 2);

    // 2. POI: Immagine con clip circolare
    if (imgs[i]) {
      push();
      imageMode(CENTER);
      
      // Crea maschera circolare
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.arc(centerX, imgCenterY, circleRadius, 0, TWO_PI);
      drawingContext.clip();

      // Calcola dimensioni per riempire il cerchio
      let img = imgs[i];
      let config = displayConfigs[i] || { scale: 1.0, offsetY: 0, offsetX: 0 };
      
      let imgRatio = img.width / img.height;
      let targetDiameter = circleRadius * 2;
      
      // Dimensioni per coprire il cerchio
      let displayW, displayH;
      
      if (imgRatio > 1) {
        // Immagine più larga che alta
        displayW = targetDiameter * 1.1 * config.scale; // Leggermente più grande del cerchio
        displayH = displayW / imgRatio;
      } else {
        // Immagine più alta che larga
        displayH = targetDiameter * 1.1 * config.scale;
        displayW = displayH * imgRatio;
      }
      
      // Posiziona l'immagine al centro con eventuali offset
      image(img, 
            centerX + config.offsetX, 
            imgCenterY + config.offsetY, 
            displayW, 
            displayH);
      
      drawingContext.restore();
      pop();
      
      // 3. OPZIONALE: Contorno sottile per definire il cerchio (molto leggero)
      stroke(240); // Grigio MOLTO chiaro
      strokeWeight(0.5);
      noFill();
      ellipse(centerX, imgCenterY, circleRadius * 2, circleRadius * 2);
    }

    // Nome
    fill(0);
    textSize(window.innerWidth > 768 ? 18 : 16);
    textStyle(BOLD);
    let nameY = y + circleRadius * 2 + 60;
    text(names[i], centerX, nameY);
    
    // Ruolo
    fill(100);
    textSize(window.innerWidth > 768 ? 14 : 12);
    textStyle(NORMAL);
    let roleY = nameY + 25;
    text(roles[i], centerX, roleY);
  }
}

/* ---------------- CALCOLO ALTEZZA ---------------- */

function calculateContentHeight() {
  const titleHeight = 250;
  const membersHeight = calculateMembersHeight();
  const footerSpace = 100;
  
  return titleHeight + membersHeight + footerSpace;
}

function calculateMembersHeight() {
  let cols, rowH;
  
  if (window.innerWidth > 1024) {
    cols = 3;
    rowH = 380;
  } else if (window.innerWidth > 768) {
    cols = 3;
    rowH = 360;
  } else if (window.innerWidth > 480) {
    cols = 2;
    rowH = 350;
  } else {
    cols = 1;
    rowH = 340;
  }
  
  const rows = Math.ceil(6 / cols);
  return rows * rowH + 50;
}

/* ---------------- RESPONSIVE ---------------- */

function windowResized() {
  const contentHeight = calculateContentHeight();
  resizeCanvas(window.innerWidth, contentHeight);
  
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.height = contentHeight + 'px';
  }
  
  redraw();
}