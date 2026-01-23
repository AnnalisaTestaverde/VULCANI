let contentText = `Our Design Methodology

To tell the story of volcanic eruptions in a meaningful and accessible way, we began with a trusted scientific source: the volcano dataset provided by NOAA – National Centers for Environmental Information (National Oceanic and Atmospheric Administration).

Data Organization

We first restructured the dataset into three thematic macro-categories:
• Core information (volcano name, eruption date, geographic location),
• Secondary details (volcano type, historical context),
• Impact metrics (human, structural, and economic effects).

Based on this structure, we defined two complementary levels of visualization:
• An overview to quickly compare eruptions at a glance,
• A detailed view to explore individual events in depth.

Overview Visualization

In the overview, each eruption is represented by four key elements:
• Year and time period of the event,
• Name of the volcano,
• VEI (Volcanic Explosivity Index),
• Overall impact score, derived from five standardized impact categories.

Each eruption receives a total impact score by summing the values across all five categories. This score ranges from 1 (minimal impact) to 20 (maximum severity), enabling direct comparison between events.`;

let tableData = [
  { category: "Deaths", level1: "1–50", level2: "51–100", level3: "101–1,000", level4: "1,001+" },
  { category: "Injuries", level1: "1–50", level2: "51–100", level3: "101–1,000", level4: "1,001+" },
  { category: "Houses Destroyed", level1: "1–50", level2: "51–100", level3: "101–1,000", level4: "1,001+" },
  { category: "Missing", level1: "1–50", level2: "51–100", level3: "101–1,000", level4: "1,001+" },
  { category: "Economic Damage*", level1: "< $1 million - NONE", level2: "$1–5 million - LIMITED", level3: "$5–24 million - SEVERE", level4: "≥ $25 million -" }
];

let imageSectionText = `In this chart, some segments may appear in gray with a hover label reading "no data available." This indicates that, for this specific eruption, the original dataset lacks reliable information for that impact category—not that no impact occurred, but that it was not documented or quantified in the source.`;

// 🖼️ Variabile per l'immagine reale
let chartImage1;

// Variabili per lo scroll
let scrollOffset = 0;
let totalContentHeight = 0;
let isDragging = false;
let lastMouseY = 0;
let scrollbarWidth = 10;
let scrollbarHeight = 0;
let scrollbarY = 0;

let tableSectionOffset = 60;

let tableNoteText = `*For those events not offering a monetary evaluation of damage, the following five-level scale was used to classify damage (1990 dollars) and was listed in the Damage De column. If the actual dollar amount of damage was listed, a descriptor was also added for search purposes. When possible, a rough estimate was made of the dollar amount of damage based upon the description provided, in order to choose the damage category. In many cases, only a single descriptive term was available. These terms were converted to the damage categories based upon the authors apparent use of the term elsewhere. In the absence of other information, LIMITED is considered synonymous with slight, minor, and light, SEVERE as synonymous with major, extensive, and heavy, and EXTREME as synonymous with catastrophic. Note: The descriptive terms relate approximately to current dollar values.`;


// Array per tenere traccia delle posizioni dei contenuti
let contentSections = [];
let currentSectionIndex = 0;

// Variabile per mostrare/nascondere il footer
let showFooter = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");
  textAlign(LEFT);
  
  // 📥 Carica l'immagine reale (assicurati che "foto.png" esista nella cartella)
  chartImage1 = loadImage("../assets/foto_screen_1.png");
}

function draw() {
  background(255);
  
  if (scrollOffset < 150) {
    
    drawMethodologyTitle();
  }
  
  push();
  translate(0, -scrollOffset);
  
  drawMethodologyContent();
  drawImageSection();
  
  pop();
  
  checkFooterVisibility();
  if (showFooter) drawFooter();
  drawScrollbar();
  calculateTotalHeight();
}



/* ---------------- TITLE ---------------- */
function drawMethodologyTitle() {
  let titleY = 120 - scrollOffset * 0.5;
  if (titleY > 50) {
    textAlign(CENTER);
    fill(0);
    textSize(48);
    textStyle(BOLD);
    text("METHODOLOGY", width / 2, titleY);

    fill("#FF2B00");
    textSize(28);
    text("HOW WE BUILT OUR VISUAL STORY.", width / 2, titleY + 50);
  }
}

/* ---------------- CONTENT PRINCIPALE ---------------- */
function drawMethodologyContent() {
  let margin = width * 0.15;
  let contentWidth = width * 0.7;
  let startY = 220;
  let lineHeight = 24;
  let currentY = startY;

  let paragraphs = contentText.split("\n\n");
  
  fill(0);
  textSize(16);
  textStyle(NORMAL);
  textAlign(LEFT);

  for (let p = 0; p < paragraphs.length; p++) {
    let lines = paragraphs[p].split("\n");
    let firstLine = lines[0].trim();
    
    if (firstLine === "Our Design Methodology" || 
        firstLine === "Data Organization" || 
        firstLine === "Overview Visualization") {
      
      textStyle(BOLD);
      textSize(24);
      fill("#FF2B00");
      text(firstLine, margin, currentY);
      currentY += lineHeight + 8;
      
    } else {
      textStyle(NORMAL);
      textSize(16);
      fill(0);
      
      for (let line of lines) {
        if (line.trim().startsWith("•")) {
          text(line, margin + 20, currentY, contentWidth - 20);
        } else if (line.trim().length > 0) {
          text(line, margin, currentY, contentWidth);
        }
        currentY += lineHeight;
      }
    }
    
    if (p < paragraphs.length - 1) {
      let nextParagraph = paragraphs[p + 1];
      let nextFirstLine = nextParagraph.split("\n")[0].trim();
      
      if (paragraphs[p].includes("National Oceanic and Atmospheric Administration).") && 
          nextFirstLine === "Data Organization") {
        currentY += 50;
      } 
      else if (firstLine === "Data Organization" && 
               paragraphs[p].includes("We first restructured")) {
        currentY += 2;
      }
      else if (paragraphs[p].includes("A detailed view to explore individual events in depth.") && 
               nextFirstLine === "Overview Visualization") {
        currentY += 50;
      }
      else if (firstLine === "Overview Visualization" && 
               paragraphs[p].includes("In the overview")) {
        currentY += 2;
      }
      else {
        currentY += 15;
      }
    }
  }
  
  contentSections[0] = { endY: currentY };
}

/* ---------------- TABELLA ---------------- */
function drawTable() {
  let margin = width * 0.15;
  let tableWidth = width * 0.7;
  // ✅ AUMENTATO spazio prima della tabella (+80 invece di +40)
  let startY = (contentSections[0] ? contentSections[0].endY + 80 : 600) + tableSectionOffset;
  
  // Titolo della tabella
  textAlign(LEFT);
  textStyle(BOLD);
  textSize(24);
  fill("#FF2B00");
  text("Impact Categories", margin, startY - 60);
  
  // Frase introduttiva – SOLO qui
  fill(0);
  textStyle(NORMAL);
  textSize(16);
  text("The impact categories are defined as follows:", margin, startY - 20);
  
  // Stile della tabella
  noStroke();
  let rowHeight = 45;
  let headerHeight = 50;
  let columnWidth = tableWidth / 5;
  
  // Header rosso
  fill("#FF2B00");
  rect(margin, startY, tableWidth, headerHeight, 5, 5, 0, 0);

  // --- Nota metodologica sotto la tabella ---
let noteY = startY + headerHeight + tableData.length * rowHeight + 35;

fill(90);
textStyle(NORMAL);
textSize(12);              // 👈 più piccolo degli altri testi
textLeading(16);
textAlign(LEFT);

text(tableNoteText, margin, noteY, tableWidth);

  
  // Testo header in bianco
  fill(255);
  textStyle(BOLD);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Category", margin + columnWidth * 0.5, startY + headerHeight/2);
  text("Level 1", margin + columnWidth * 1.5, startY + headerHeight/2);
  text("Level 2", margin + columnWidth * 2.5, startY + headerHeight/2);
  text("Level 3", margin + columnWidth * 3.5, startY + headerHeight/2);
  text("Level 4", margin + columnWidth * 4.5, startY + headerHeight/2);
  
  // Righe dati
  stroke(220);
  for (let i = 0; i < tableData.length; i++) {
    let y = startY + headerHeight + i * rowHeight;
    
    if (i % 2 === 0) fill(250); else fill(255);
    noStroke();
    rect(margin, y, tableWidth, rowHeight);
    
    stroke(220);
    line(margin, y, margin + tableWidth, y);
    
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    
    textStyle(BOLD);
    textSize(14);
    text(tableData[i].category, margin + columnWidth * 0.5, y + rowHeight/2);
    
    textStyle(NORMAL);
    textSize(12);
    text(tableData[i].level1, margin + columnWidth * 1.5, y + rowHeight/2);
    text(tableData[i].level2, margin + columnWidth * 2.5, y + rowHeight/2);
    text(tableData[i].level3, margin + columnWidth * 3.5, y + rowHeight/2);
    text(tableData[i].level4, margin + columnWidth * 4.5, y + rowHeight/2);
  }
  
  // Linee verticali e bordo
  stroke(220);
  for (let i = 1; i < 5; i++) {
    line(margin + columnWidth * i, startY, margin + columnWidth * i, startY + headerHeight + tableData.length * rowHeight);
  }
  line(margin, startY + headerHeight + tableData.length * rowHeight, 
       margin + tableWidth, startY + headerHeight + tableData.length * rowHeight);
  
  stroke(150);
  strokeWeight(2);
  noFill();
  rect(margin, startY, tableWidth, headerHeight + tableData.length * rowHeight, 5);
  
  contentSections[1] = { 
  endY: noteY + 80   // spazio dopo la nota
};

}

/* ---------------- SEZIONE IMMAGINE ---------------- */
/* ---------------- SEZIONE IMMAGINE ---------------- */
function drawImageSection() {
  drawTable();
  
  let margin = width * 0.15;
  let contentWidth = width * 0.7;
  let imageWidth = contentWidth * 0.32;
  
  // ✅ SPAZIO aumentato prima di "Data Interpretation"
  let sectionTopY = contentSections[1] ? contentSections[1].endY + 100 : 800;
  
  // --- 1. Calcola l'altezza del testo ---
  let lineHeight = 24;
  textSize(16);
  textStyle(NORMAL);
  
  // Stima l'altezza del testo con wrapping
  let textWidth = contentWidth - imageWidth - 40; // spazio tra testo e immagine
  let textHeight = getTextHeight(imageSectionText, margin, textWidth);
  
  // --- 2. Carica e calcola l'altezza dell'immagine ---
  let imageHeight = 0;
  let aspectRatio = 1;
  if (chartImage1 && chartImage1.width > 0) {
    aspectRatio = chartImage1.height / chartImage1.width;
    imageHeight = imageWidth * aspectRatio;
    imageHeight = constrain(imageHeight, 220, 420);
    imageWidth = imageHeight / aspectRatio; // aggiorna per mantenere il rapporto
  } else {
    imageHeight = max(textHeight, 240); // fallback
  }
  
  // --- 3. Allineamento verticale: usa l'altezza maggiore ---
  let sectionHeight = max(textHeight, imageHeight);
  let centerY = sectionTopY + 40 + sectionHeight / 2; // 40 = spazio dopo il titolo
  
  // --- 4. Disegna il titolo ---
  noStroke();
  fill("#FF2B00");
  textStyle(BOLD);
  textSize(24);
  textAlign(LEFT);
  text("Data Interpretation", margin, sectionTopY);
  
  // --- 5. Disegna il testo (centrato verticalmente) ---
  let textY = centerY - textHeight / 2;
  fill(0);
  textSize(16);
  textStyle(NORMAL);
  textAlign(LEFT);
  drawWrappedText(imageSectionText, margin, textY, textWidth);
  
  // --- 6. Posiziona l'immagine (centrata verticalmente) ---
  let imageX = margin + contentWidth - imageWidth;
  let imageY = centerY - imageHeight / 2;
  
  if (chartImage1 && chartImage1.width > 0) {
    image(chartImage1, imageX, imageY, imageWidth, imageHeight);
  } else {
    // Placeholder
    fill(245, 245, 245);
    noStroke();
    rect(imageX, imageY, imageWidth, imageHeight, 10);
    fill("#FF2B00");
    ellipse(imageX + imageWidth/2, imageY + imageHeight/3, 60, 60);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("i", imageX + imageWidth/2, imageY + imageHeight/3);
    fill(80);
    textSize(12);
    textStyle(BOLD);
    text("Image missing", imageX + imageWidth/2, imageY + imageHeight/2 + 30);
  }
  
  // Bordo immagine
  stroke("#FF2B00");
  strokeWeight(2);
  noFill();
  rect(imageX, imageY, imageWidth, imageHeight, 10);
  
  // ✅ Allunga la pagina dopo questa sezione
  totalContentHeight = sectionTopY + 40 + sectionHeight + 160;
}

/* ---------------- FOOTER ---------------- */
function checkFooterVisibility() {
  let visibleHeight = height - 100;
  let contentBottom = totalContentHeight - scrollOffset;
  let threshold = 100;
  showFooter = contentBottom <= visibleHeight + threshold;
}

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

/* ---------------- SCROLLBAR ---------------- */
function calculateTotalHeight() {
  if (totalContentHeight === 0) {
    totalContentHeight = 1500;
  }
}

function drawScrollbar() {
  let scrollStartY = 0;
  let scrollEndY = height;
  let visibleHeight = scrollEndY - scrollStartY;
  
  if (totalContentHeight > visibleHeight) {
    scrollbarHeight = max(30, visibleHeight * (visibleHeight / totalContentHeight));
    let scrollRatio = scrollOffset / (totalContentHeight - visibleHeight);
    scrollbarY = scrollStartY + (visibleHeight - scrollbarHeight) * scrollRatio;
    
    fill(240, 240, 240);
    noStroke();
    rect(width - scrollbarWidth - 5, scrollStartY, scrollbarWidth, visibleHeight, 5);
    
    fill(150, 150, 150, 200);
    rect(width - scrollbarWidth - 5, scrollbarY, scrollbarWidth, scrollbarHeight, 5);
  }
}

// Calcola l'altezza di un testo con wrapping
function getTextHeight(txt, x, boxWidth) {
  push();
  textSize(16);
  textStyle(NORMAL);
  let lines = floor(textWidth(txt, boxWidth) / boxWidth) + 1;
  // Metodo più affidabile: usa textBounds (ma non sempre preciso con a capo)
  // Alternativa semplice:
  let words = txt.split(' ');
  let testLine = '';
  let lineCount = 1;
  textAlign(LEFT);
  for (let w of words) {
    let test = testLine + w + ' ';
    if (textWidth(test) > boxWidth && testLine.length > 0) {
      lineCount++;
      testLine = w + ' ';
    } else {
      testLine = test;
    }
  }
  pop();
  return lineCount * 24 + (lineCount - 1) * 4; // lineHeight + interlinea
}

// Disegna testo con wrapping manuale (più controllabile)
function drawWrappedText(txt, x, y, boxWidth) {
  let words = txt.split(' ');
  let line = '';
  let currentY = y;
  let lineHeight = 24;
  
  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + ' ';
    let testWidth = textWidth(testLine);
    
    if (testWidth > boxWidth && line.length > 0) {
      text(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  text(line, x, currentY);
}

function mousePressed() {
  let scrollStartY = 0;
  let scrollEndY = height;
  
  if (mouseX > width - scrollbarWidth - 5 && mouseX < width - 5 &&
      mouseY >= scrollStartY && mouseY < scrollEndY) {
    isDragging = true;
    lastMouseY = mouseY;
    
    if (mouseY < scrollbarY || mouseY > scrollbarY + scrollbarHeight) {
      let visibleHeight = scrollEndY - scrollStartY;
      let clickRatio = (mouseY - scrollStartY) / visibleHeight;
      scrollOffset = clickRatio * (totalContentHeight - visibleHeight);
      scrollOffset = constrain(scrollOffset, 0, totalContentHeight - visibleHeight);
    }
    return;
  }
}

function mouseDragged() {
  if (!isDragging) return;
  
  let deltaY = mouseY - lastMouseY;
  lastMouseY = mouseY;
  
  let scrollStartY = 0;
  let scrollEndY = height;
  let visibleHeight = scrollEndY - scrollStartY;
  let maxScroll = max(0, totalContentHeight - visibleHeight);
  
  scrollOffset += deltaY * (totalContentHeight / visibleHeight);
  scrollOffset = constrain(scrollOffset, 0, maxScroll);
}

function mouseReleased() {
  isDragging = false;
}

function mouseWheel(event) {
  let scrollStartY = 0;
  let scrollEndY = height;
  let visibleHeight = scrollEndY - scrollStartY;
  let maxScroll = max(0, totalContentHeight - visibleHeight);
  
  scrollOffset -= event.delta * 0.5;
  scrollOffset = constrain(scrollOffset, 0, maxScroll);
  
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}