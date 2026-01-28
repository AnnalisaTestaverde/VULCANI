let currentSlide = 0;
let isTyping = false;
let typingPhase = "main";
let typedMain = 0;
let typedCaption = 0;
let typingSpeed = 1.5;
let frameCounter = 0;

// Bounds per frecce
let upBounds = { x: 0, y: 0, w: 0, h: 0 };    // freccia su
let downBounds = { x: 0, y: 0, w: 0, h: 0 };  // freccia giù

// Stato hover
let isHovering = false;

// Array di slide con le parole da evidenziare in BIANCO
let slides = [
  {
    lines: ["Volcanic eruptions in our dataset are", "described through an impact score."],
    highlightedWords: ["impact score"]
  },
  {
    lines: ["Each eruption's impact is based on five", "factors: deaths, injuries, missing, houses", "destroyed, and economic damage."],
    highlightedWords: ["deaths", "injuries", "missing", "houses", "destroyed", "economic damage"]
  },
  {
    lines: [
      "Each eruption is assigned a total impact",
      "score, calculated by adding together the",
      "five factor levels (deaths, injuries, missing,",
      "houses destroyed, and economic damage).",
      "The score ranges from 1 to 16, with higher",
      "values representing eruptions with greater",
      "overall severity."
    ],
    highlightedWords: ["total impact score", "five factor levels", "score ranges", "1 to 16"]
  }
];

// Aggiungi HTML per gli indicatori e le frecce di scroll
function addHTMLStructure() {
  // Aggiungi gli indicatori delle schermate (pallini)
  const indicatorContainer = document.createElement('div');
  indicatorContainer.className = 'screen-indicator';
  indicatorContainer.innerHTML = `
    <div class="screen-dot active" data-screen="0"></div>
    <div class="screen-dot" data-screen="1"></div>
    <div class="screen-dot" data-screen="2"></div>
  `;
  document.body.appendChild(indicatorContainer);
  
  // Contenitore per le frecce (solo visualizzazione)
  const arrowsContainer = document.createElement('div');
  arrowsContainer.className = 'arrows-container';
  document.body.appendChild(arrowsContainer);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // PRIMA inizializza le frecce
  updateArrowsVisibility();
  
  // POI inizia la digitazione
  startTyping();
  
  // Aggiungi struttura HTML
  addHTMLStructure();
  
  // Setup event listeners
  setupEventListeners();
}

function draw() {
  background(255, 43, 0); // #FF2B00 - Sfondo rosso

  let current = slides[currentSlide];
  let fullMain = current.lines.join('\n');
  let fullCaption = current.caption || "";

  if (isTyping) {
    if (frameCounter % typingSpeed === 0) {
      if (typingPhase === "main") {
        typedMain++;
        if (typedMain >= fullMain.length) {
          if (fullCaption) {
            typingPhase = "caption";
            typedCaption = 0;
          } else {
            isTyping = false;
            // Quando finisce la digitazione, aggiorna le frecce
            updateArrowsVisibility();
          }
        }
      } else if (typingPhase === "caption") {
        typedCaption++;
        if (typedCaption >= fullCaption.length) {
          isTyping = false;
          // Quando finisce la digitazione, aggiorna le frecce
          updateArrowsVisibility();
        }
      }
    }
    frameCounter++;
  }

  let displayMain = fullMain.substring(0, typedMain);
  let displayCaption = fullCaption.substring(0, typedCaption);
  drawMultilineText(displayMain, displayCaption, width / 2);

  // Bottone finale "Explore all eruptions"
  if (currentSlide === slides.length - 1 && !isTyping) {
    drawExploreButton();
  }
}

function drawMultilineText(displayMain, displayCaption, xCenter) {
  let current = slides[currentSlide];
  let displayedMainLines = displayMain.split('\n');
  let fullLines = current.lines;
  let highlightedWords = current.highlightedWords || [];

  let mainSize = 36;
  let captionSize = 22;
  let mainLineHeight = 44;
  let captionLineHeight = 28;
  let captionSpacing = 24;

  textSize(mainSize);
  textStyle(BOLD);
  
  // Trova la larghezza massima del testo
  let maxWidthMain = 0;
  for (let line of fullLines) {
    let w = textWidth(line);
    if (w > maxWidthMain) maxWidthMain = w;
  }

  let maxWidthCaption = 0;
  if (current.caption) {
    textSize(captionSize);
    textStyle(BOLD);
    maxWidthCaption = textWidth(current.caption);
  }

  let blockWidth = Math.max(maxWidthMain, maxWidthCaption);
  let xStart = xCenter - blockWidth / 2;

  let totalMainHeight = fullLines.length * mainLineHeight;
  let hasCaption = !!current.caption;
  let totalHeight = totalMainHeight + (hasCaption ? captionSpacing + captionLineHeight : 0);
  let startY = height / 2 - totalHeight / 2;

  textAlign(LEFT, TOP);
  textSize(mainSize);
  textStyle(BOLD);
  
  // Disegna ogni linea di testo
  for (let i = 0; i < fullLines.length; i++) {
    let lineToShow = i < displayedMainLines.length ? displayedMainLines[i] : "";
    let lineText = fullLines[i];
    let lineY = startY + i * mainLineHeight;
    let currentX = xStart;
    
    // Controlla quali parole sono già state digitate in questa linea
    let typedInThisLine = displayedMainLines[i] || "";
    
    // Processa il testo carattere per carattere
    for (let charIndex = 0; charIndex < lineText.length; charIndex++) {
      let char = lineText[charIndex];
      let typedChar = charIndex < typedInThisLine.length ? typedInThisLine[charIndex] : "";
      
      if (typedChar === "") break; // Non disegnare caratteri non ancora digitati
      
      // Controlla se questo carattere è parte di una parola evidenziata
      let shouldHighlight = false;
      
      // Gestione speciale per "destroyed houses" nella seconda slide
      if (currentSlide === 1 && (i === 1 || i === 2)) {
        // Seconda slide, linee 2 e 3 (indici 1 e 2)
        if (i === 1 && lineText.includes("destroyed")) {
          // Se siamo nella linea con "destroyed"
          let destroyedPos = lineText.indexOf("destroyed");
          if (charIndex >= destroyedPos && charIndex < destroyedPos + "destroyed".length) {
            if (typedInThisLine.length > destroyedPos) {
              shouldHighlight = true;
            }
          }
        } else if (i === 2 && lineText.includes("houses")) {
          // Se siamo nella linea con "houses"
          let housesPos = lineText.indexOf("houses");
          if (charIndex >= housesPos && charIndex < housesPos + "houses".length) {
            if (typedInThisLine.length > housesPos) {
              shouldHighlight = true;
            }
          }
        }
      }
      
      // Controlla altre parole evidenziate se non abbiamo ancora trovato una corrispondenza
      if (!shouldHighlight) {
        // Cerca tutte le parole evidenziate per vedere se questo carattere ne fa parte
        for (let hw of highlightedWords) {
          // Salta "destroyed houses" che abbiamo già gestito
          if (hw === "houses destroyed" && currentSlide === 1) continue;
          
          let hwLower = hw.toLowerCase();
          let lineLower = lineText.toLowerCase();
          
          // Trova tutte le occorrenze di questa parola nella linea
          let startIndex = 0;
          while (true) {
            let pos = lineLower.indexOf(hwLower, startIndex);
            if (pos === -1) break;
            
            // Se il carattere corrente è dentro questa occorrenza
            if (charIndex >= pos && charIndex < pos + hw.length) {
              // Controlla se abbiamo digitato abbastanza caratteri
              if (typedInThisLine.length > pos) {
                shouldHighlight = true;
                break;
              }
            }
            startIndex = pos + 1;
          }
          if (shouldHighlight) break;
        }
      }
      
      if (shouldHighlight) {
        fill(255); // Testo BIANCO per le parole evidenziate
      } else {
        fill(0); // Testo NERO per il resto
      }
      
      // Disegna il carattere
      text(typedChar, currentX, lineY);
      currentX += textWidth(typedChar);
    }
  }

  if (hasCaption) {
    let captionY = startY + totalMainHeight + captionSpacing;
    textSize(captionSize);
    textStyle(BOLD);
    fill(0); // Caption nero
    text(displayCaption, xStart, captionY);
  }
}

// Bottone "Explore all eruptions"
function drawExploreButton() {
  const buttonWidth = 220;
  const buttonHeight = 40;
  const buttonX = width / 2 - buttonWidth / 2;
  const buttonY = height - 100;
  
  // Calcola scala hover
  const scale = isHovering ? 1.05 : 1.0;
  const scaledW = buttonWidth * scale;
  const scaledH = buttonHeight * scale;
  const scaledX = buttonX - (scaledW - buttonWidth) / 2;
  const scaledY = buttonY - (scaledH - buttonHeight) / 2;
  
  if (isHovering) {
    // STATO HOVER: sfondo bianco, testo e contorno rosso
    fill(255); // Sfondo BIANCO
    stroke(255, 43, 0); // Stroke ROSSO (#FF2B00)
    strokeWeight(1);
    rect(scaledX, scaledY, scaledW, scaledH, 5); // Angoli arrotondati con raggio 5

    // Testo "Explore all eruptions" in ROSSO, CENTRATO
    fill(255, 43, 0); // #FF2B00 - Testo ROSSO
    noStroke();
    textSize(18);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Explore all eruptions", scaledX + scaledW/2, scaledY + scaledH/2);
  } else {
    // STATO NORMALE: contorno bianco, sfondo trasparente, testo bianco
    noFill();
    stroke(255); // Stroke BIANCO
    strokeWeight(1);
    rect(scaledX, scaledY, scaledW, scaledH, 5); // Angoli arrotondati con raggio 5

    // Testo "Explore all eruptions" in BIANCO, CENTRATO
    fill(255); // Testo BIANCO
    noStroke();
    textSize(18);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Explore all eruptions", scaledX + scaledW/2, scaledY + scaledH/2);
  }

  // Aggiorna bounds per il click
  downBounds.x = buttonX;
  downBounds.y = buttonY;
  downBounds.w = buttonWidth;
  downBounds.h = buttonHeight;
}

// Configura tutti gli event listener
function setupEventListeners() {
  // Scroll del mouse
  window.addEventListener('wheel', handleScroll, { passive: false });
  
  // Tasti freccia
  document.addEventListener('keydown', handleKeyDown);
  
  // Click sugli indicatori delle schermate
  document.querySelectorAll('.screen-dot').forEach(dot => {
    dot.addEventListener('click', function() {
      const slideIndex = parseInt(this.getAttribute('data-screen'));
      if (slideIndex !== currentSlide) {
        goToSlide(slideIndex);
      }
    });
  });
}

// Completa la digitazione del testo corrente
function completeTyping() {
  if (isTyping) {
    let current = slides[currentSlide];
    typedMain = current.lines.join('\n').length;
    typedCaption = (current.caption || "").length;
    isTyping = false;
    frameCounter = 0;
    // Aggiorna le frecce quando si completa la digitazione
    updateArrowsVisibility();
  }
}

// Gestione tasti freccia - MODIFICATA per completare l'animazione
function handleKeyDown(e) {
  switch(e.key) {
    case 'ArrowDown':
    case 'PageDown':
      e.preventDefault();
      if (isTyping) {
        completeTyping();
      } else if (currentSlide < slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
      break;
      
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      if (isTyping) {
        completeTyping();
      } else if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
      }
      break;
      
    case 'ArrowRight':
      e.preventDefault();
      if (isTyping) {
        completeTyping();
      } else if (currentSlide < slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
      break;
      
    case 'ArrowLeft':
      e.preventDefault();
      if (isTyping) {
        completeTyping();
      } else if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
      }
      break;
      
    case ' ':
    case 'Enter':
      e.preventDefault();
      if (isTyping) {
        completeTyping();
      } else if (currentSlide < slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
      break;
      
    case '1':
    case '2':
    case '3':
      e.preventDefault();
      const slideIndex = parseInt(e.key) - 1;
      if (slideIndex >= 0 && slideIndex < slides.length && slideIndex !== currentSlide) {
        if (isTyping) {
          completeTyping();
        }
        goToSlide(slideIndex);
      }
      break;
  }
}

// Vai a una slide specifica
function goToSlide(slideIndex) {
  if (slideIndex < 0 || slideIndex >= slides.length || slideIndex === currentSlide) return;
  
  currentSlide = slideIndex;
  startTyping();
  updateScreenIndicator();
  // Le frecce vengono aggiornate in startTyping() e quando finisce la digitazione
  
  // Forza il redraw per mostrare immediatamente il cambiamento
  redraw();
}

// Gestione scroll del mouse
function handleScroll(e) {
  e.preventDefault();
  
  const delta = e.deltaY;
  
  if (delta > 0 && currentSlide < slides.length - 1) {
    if (!isTyping) {
      goToSlide(currentSlide + 1);
    }
  } else if (delta < 0 && currentSlide > 0) {
    if (!isTyping) {
      goToSlide(currentSlide - 1);
    }
  }
}

function mousePressed() {
  if (isTyping) {
    // Completa la digitazione
    completeTyping();
    return;
  }
  
  // NON gestire più i click sulle frecce qui - le frecce HTML hanno i loro event listener
  // Click sul bottone finale
  if (currentSlide === slides.length - 1) {
    if (
      mouseX >= downBounds.x &&
      mouseX <= downBounds.x + downBounds.w &&
      mouseY >= downBounds.y &&
      mouseY <= downBounds.y + downBounds.h
    ) {
      // VAI ALLA MAPPA
      window.location.href = "overview.html";
    }
  }
}

// Rileva hover sul bottone
function mouseMoved() {
  // Hover sul bottone finale
  if (currentSlide === slides.length - 1 && !isTyping) {
    if (
      mouseX >= downBounds.x &&
      mouseX <= downBounds.x + downBounds.w &&
      mouseY >= downBounds.y &&
      mouseY <= downBounds.y + downBounds.h
    ) {
      if (!isHovering) {
        isHovering = true;
        document.body.style.cursor = 'pointer';
        redraw(); // Forza il redraw per mostrare il cambio di stato
      }
      return;
    } else {
      if (isHovering) {
        isHovering = false;
        document.body.style.cursor = 'default';
        redraw(); // Forza il redraw per mostrare il cambio di stato
      }
    }
  }
  
  // NON gestire più hover sulle aree delle frecce qui - le frecce HTML hanno i loro stili CSS
  if (!isHovering) {
    document.body.style.cursor = 'default';
  }
}

// Aggiorna gli indicatori delle schermate
function updateScreenIndicator() {
  const dots = document.querySelectorAll('.screen-dot');
  dots.forEach((dot, index) => {
    if (index === currentSlide) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Aggiorna visibilità delle frecce - MODIFICATA per mostrare sempre se non si sta digitando
function updateArrowsVisibility() {
  const arrows = document.querySelector('.arrows-container');
  if (arrows) {
    arrows.innerHTML = '';
    
    // Mostra frecce solo se non si sta digitando o siamo all'ultima slide (per il bottone)
    if (!isTyping || currentSlide === slides.length - 1) {
      // Freccia SU (solo se non siamo alla prima slide)
      if (currentSlide > 0) {
        const upArrow = document.createElement('div');
        upArrow.className = 'scroll-hint up-arrow';
        upArrow.innerHTML = 'V';
        // Aggiungi event listener per il click
        upArrow.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (currentSlide > 0) {
            if (isTyping) {
              completeTyping();
            }
            goToSlide(currentSlide - 1);
          }
        });
        arrows.appendChild(upArrow);
      }
      
      // Freccia GIÙ (solo se non siamo all'ultima slide)
      if (currentSlide < slides.length - 1) {
        const downArrow = document.createElement('div');
        downArrow.className = 'scroll-hint down-arrow';
        downArrow.innerHTML = 'V';
        // Aggiungi event listener per il click
        downArrow.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (currentSlide < slides.length - 1) {
            if (isTyping) {
              completeTyping();
            }
            goToSlide(currentSlide + 1);
          }
        });
        arrows.appendChild(downArrow);
      }
    }
  }
}

function startTyping() {
  isTyping = true;
  typingPhase = "main";
  typedMain = 0;
  typedCaption = 0;
  frameCounter = 0;
  // Aggiorna le frecce (che ora gestiscono la visibilità in base a isTyping)
  updateArrowsVisibility();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

// Aggiungi CSS inline per gli elementi HTML
function addInlineStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Indicatore schermate a sinistra */
    .screen-indicator {
      position: fixed;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 15px;
      z-index: 1000;
    }
    
    .screen-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid transparent;
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    .screen-dot.active {
      background-color: white;
      transform: scale(1.2);
      border-color: white;
    }
    
    .screen-dot:hover {
      background-color: rgba(255, 255, 255, 0.7);
      border-color: white;
      transform: scale(1.3);
    }
    
    /* Contenitore frecce */
    .arrows-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    }
    
    /* Stile frecce - NERO SOLIDO PER ENTRAMBE */
    .scroll-hint {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      color: #000000 !important;
      font-size: 40px;
      font-weight: 900 !important;
      text-align: center;
      cursor: pointer;
      z-index: 1000;
      width: 40px;
      height: 40px;
      animation: bounce 2s infinite;
      pointer-events: auto !important; /* IMPORTANTE: permette i click */
      opacity: 1 !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-shadow: 0 0 0 #000000 !important;
      font-family: 'Helvetica', Arial, sans-serif !important;
    }
    
    /* Freccia SU - posizionata in alto, ruotata di 180 gradi */
    .up-arrow {
      top: 40px;
      left: 50%;
      transform: translateX(-50%) rotate(180deg);
    }
    
    /* Freccia GIÙ - posizionata in basso */
    .down-arrow {
      bottom: 40px;
      left: 50%;
    }
    
    /* Animazione bounce ESATTAMENTE COME NEL CODICE DI RIFERIMENTO */
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateX(-50%) translateY(0);
      }
      40% {
        transform: translateX(-50%) translateY(-10px);
      }
      60% {
        transform: translateX(-50%) translateY(-5px);
      }
    }
    
    /* Animazione per freccia su (ruotata) */
    .up-arrow {
      animation: bounceUp 2s infinite;
    }
    
    @keyframes bounceUp {
      0%, 20%, 50%, 80%, 100% {
        transform: translateX(-50%) rotate(180deg) translateY(0);
      }
      40% {
        transform: translateX(-50%) rotate(180deg) translateY(10px);
      }
      60% {
        transform: translateX(-50%) rotate(180deg) translateY(5px);
      }
    }
    
    /* Reset canvas position */
    canvas {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      pointer-events: none; /* IMPORTANTE: il canvas non deve intercettare i click */
    }
    
    /* Body e HTML per coprire tutto */
    body, html {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
      background-color: #FF2B00;
      font-family: 'Helvetica', Arial, sans-serif;
    }
    
    /* Aggiungi effetto hover per le frecce */
    .scroll-hint:hover {
      opacity: 0.8 !important;
      transform: translateX(-50%) scale(1.1);
    }
    
    .up-arrow:hover {
      transform: translateX(-50%) rotate(180deg) scale(1.1);
    }
  `;
  document.head.appendChild(style);
}

// Esegui il setup degli stili all'avvio
addInlineStyles();

// Inizializza le frecce SUBITO
updateArrowsVisibility();