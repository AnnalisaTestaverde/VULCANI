let imgs = [];

let names = [
  "Alice Comini",
  "Matilde Curino", 
  "Greta Franco",
  "Carlo Galli",
  "Ilaria La Spada",
  "Annalisa Testaverde"
];

let roles = [
  "Frontend Development, \nData Visualization & Map-making.",
  "Data Analysis & Visualization,\nIllustrations and Debugging.",
  "Frontend Development, \nIllustrations and Methodology. ",
  "Figma Mockups & Prototypes, \nResearch and Debugging.",
  "Web Development, \nData Visualization & Animations.",
  "Web Support, Learn More \nand Call Management."
];

/*IMMAGINI - array per regolare ogni immagine 
all'interno del cerchio */
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
  // calcolo dell'altezza del contenuto
  const contentHeight = calculateContentHeight();
  
  // creazione canvas con altezza calcolata
  let canvas = createCanvas(window.innerWidth, contentHeight);
  canvas.parent('sketch-container');
  
  // stili per il canvas
  canvas.style('display', 'block');
  canvas.style('position', 'relative');
  canvas.style('width', '100%');
  canvas.style('height', contentHeight + 'px');
  
  textFont("Helvetica");
  textAlign(CENTER);
  
  // configurazione per ogni immagine!
  setupImageConfigs();
}

function setupImageConfigs() {
  // IMMAGINI - aggiustamento dimensioni
  displayConfigs = [
    { scale: 1.15, offsetY: -15, offsetX: 0 },   // alice
    { scale: 1.00, offsetY: 0, offsetX: 0 },   // matilde
    { scale: 1.15, offsetY: 0, offsetX: 0 },   // greta
    { scale: 0.90, offsetY: 0, offsetX: 0 },   // carlo
    { scale: 1.40, offsetY: 0, offsetX: 0 },   // ilaria
    { scale: 1.15, offsetY: 0, offsetX: 0 }    // annalisa
  ];
}

function draw() {
  background(255);
  
  drawTitles();
  
  drawMembers();
}

/* TESTO - per titolo e testi */

function drawTitles() {
  textAlign(CENTER);

  fill(0);
  textSize(48);
  textStyle(BOLD);
  text("TEAM'S PROJECT", width / 2, 100);

  fill("#FF2B00");
  textSize(28);
  text("THE PEOPLE WHO MADE IT POSSIBLE.", width / 2, 150);

  fill(50);
  textSize(16);
  textStyle(NORMAL);

  let t = "Hi! We are second-year students of Communication Design from Section C2\nof the Computer Graphics Laboratory course at Politecnico di Milano.";
  
  text(t, width / 2, 200);
}

/* GRIGLIA MEMBRI - per disposizione team */

function drawMembers() {
  // layout fisso per desktop
  let cols = 3;
  let colW = 320;
  let rowH = 380;
  let startY = 280;
  let circleRadius = 100;
  
  // calcolo delle colonne (dimensione, posizionamento etc.)
  let totalW = cols * colW;
  let startX = (width - totalW) / 2;

  for (let i = 0; i < names.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);

    let x = startX + col * colW;
    let y = startY + row * rowH;

    let centerX = x + colW / 2;
    let imgCenterY = y + circleRadius + 20;

    /* 1. CREAZIONE CERCHIO
    - rendo il cerchio bianco per inserimento immagine 
    e coprire eventuali parti scoperte */
    fill(255);
    noStroke();
    ellipse(centerX, imgCenterY, circleRadius * 2, circleRadius * 2);

    /* 2. IMMAGINE
    - riempimento del cerchio con le immagini */
    if (imgs[i]) {
      push();
      imageMode(CENTER);
      
      // maschera circolare
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.arc(centerX, imgCenterY, circleRadius, 0, TWO_PI);
      drawingContext.clip();

      // calcolo delle dimensioni per riempimento
      let img = imgs[i];
      let config = displayConfigs[i] || { scale: 1.0, offsetY: 0, offsetX: 0 };
      
      let imgRatio = img.width / img.height;
      let targetDiameter = circleRadius * 2;
      
      let displayW, displayH;
      
      /* !! PATTERN - moltiplico per 1.1 in modo da
        avere l'immagine leggermente più grande del cerchio
        in entrambi i casi */
      if (imgRatio > 1) {
        // se l'immagine è più larga, calcolo l'altezza
        displayW = targetDiameter * 1.1 * config.scale;
        displayH = displayW / imgRatio;
      } else {
        // se l'immagine è più alta, calcolo la larghezza
        displayH = targetDiameter * 1.1 * config.scale;
        displayW = displayH * imgRatio;
      }
      
      /* posizionamento dell'immagine al centro 
      con eventuali offset */
      image(img, 
            centerX + config.offsetX, 
            imgCenterY + config.offsetY, 
            displayW, 
            displayH);
      
      drawingContext.restore();
      pop();
      
      // 3. CONTORNO: aggiunta per marcare leggermente il cerchio
      stroke(240);
      strokeWeight(0.5);
      noFill();
      ellipse(centerX, imgCenterY, circleRadius * 2, circleRadius * 2);
    }

    // STILE - testi nomi e ruoli
    fill(0);
    textSize(18);
    textStyle(BOLD);
    let nameY = y + circleRadius * 2 + 60;
    text(names[i], centerX, nameY);
    
    fill(100);
    textSize(14);
    textStyle(NORMAL);
    let roleY = nameY + 25;
    text(roles[i], centerX, roleY);
  }
}

// ALTEZZA - calcolo dell'altezza del contenuto
function calculateContentHeight() {
  const titleHeight = 250;
  const membersHeight = calculateMembersHeight();
  const footerSpace = 100;
  
  return titleHeight + membersHeight + footerSpace;
}

// ALTEZZA - calcolo altezza membri
function calculateMembersHeight() {
  let cols = 3;
  let rowH = 380;
  
  const rows = Math.ceil(6 / cols);
  return rows * rowH + 50;
}