let imgs = [];
let names = [
  "Alice Comini",
  "Matilde Curino",
  "Greta Franco",
  "Carlo Galli",
  "Ilaria La Spada",
  "Annalisa Testaverde"
];

function preload() {
  imgs[0] = loadImage("../assets/alice.png");
  imgs[1] = loadImage("../assets/mati.png");
  imgs[2] = loadImage("../assets/greta.png");
  imgs[3] = loadImage("../assets/carlo.png");
  imgs[4] = loadImage("../assets/ilaria.png");
  imgs[5] = loadImage("../assets/annalisa.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Helvetica");
}

function draw() {
  background(255);

  
  drawTitles();
  drawMembers();
  drawFooter();
}




/* ---------------- TITOLI ---------------- */

function drawTitles() {
  textAlign(CENTER);

  fill(0);
  textSize(48);
  textStyle(BOLD);
  text("TEAM'S PROJECT", width / 2, 120);

  fill("#FF2B00");
  textSize(28);
  text("THE PEOPLE WHO MADE IT POSSIBLE.", width / 2, 170);

  fill(50);
  textSize(16);
  textStyle(NORMAL);

  let t =
    "Hi! We are second-year students of Communication Design from Section C2\nof the Computer Graphics Laboratory course at Politecnico di Milano.";

  text(t, width / 2, 220);
}

/* ---------------- GRIGLIA MEMBRI ---------------- */

function drawMembers() {
  let cols = 3;
  let colW = 250;
  let rowH = 250;

  let totalW = cols * colW;
  let startX = (width - totalW) / 2;
  let startY = 300;

  textAlign(CENTER);

  for (let i = 0; i < names.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);

    let x = startX + col * colW;
    let y = startY + row * rowH;

    let centerX = x + colW / 2;
    let centerY = y + 80;

    
    // immagine
    imageMode(CENTER);
    // immagine dentro cerchio (no stretch)
if (imgs[i]) {
  push();
  imageMode(CENTER);

  // crea una maschera circolare
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(centerX, centerY, 80, 0, TWO_PI);
  drawingContext.clip();

  // disegna l'immagine mantenendo le proporzioni
  let img = imgs[i];
  let targetSize = 190;
  let ratio = img.width / img.height;

  let w, h;
  if (ratio > 1) {
    w = targetSize;
    h = targetSize / ratio;
  } else {
    h = targetSize;
    w = targetSize * ratio;
  }

  image(img, centerX, centerY, w, h);

  // ripristina context
  drawingContext.restore();
  pop();
} else {
  fill(255);
  textSize(12);
  text("missing\nphoto", centerX, centerY);
}


    // nome
    fill(0);
    textSize(16);
    text(names[i], centerX, y + 180);
  }
}

/* ---------------- FOOTER ---------------- */

function drawFooter() {
  fill("#FF2B00");
  rect(0, height - 50, width, 1);

  fill(0);
  textSize(12);
  textAlign(LEFT);
  text("© Computer Graphics Lab - Information Design", 40, height - 20);

  textAlign(CENTER);
  text("A.A. 2025/2026", width / 2, height - 20);

  textAlign(RIGHT);
  text("Group 03", width - 40, height - 20);
}

/* ---------------- RESPONSIVE ---------------- */

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
