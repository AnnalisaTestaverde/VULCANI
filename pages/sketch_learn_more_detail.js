// ===== CONFIGURAZIONE IDENTICA AL GRAFICO ORIGINALE =====
const CONFIG = {
    chartXPercent: 0.695,
    chartYPercent: 0.51,
    chartSize: 400,
    chartLevels: 4,
    chartMainColor: "#FFFFF",
    chartOverlayAlpha: 200,
    chartGapAngleDeg: 10,
    chartGapRadial: 5,
    chartTitleSize: 28,
    chartLabelSize: 14,
    chartTooltipTextSize: 17,
    inflationFactor: 2.4,
    colors: {
        background: '#FF2B00',
        text: '#000000ff',
        accent: '#FFFFFF',
        infoBox: '#ffffffff',
        infoBoxText: '#000000ff',
        infoBoxStroke: '#FF2B00'
    },
    layout: {
        titleStartY: 95,
        topOffset: -20,
        marginX: 40,
        startButtonY: 720,
        labelFontSize: 16
    }
};

// ===== STATO APPLICAZIONE =====
let state = {
    // Dati fissi per Merapi 1961 (presi dal dataset reale)
    chartData: null,
    
    // Per le animazioni
    animationStartTime: 0,
    isAnimating: false,
    
    // Per il back button - MODIFICATO PER INCLUIRE HOVER
    backButtonArea: null,
    isBackButtonHovered: false,
    navBackArea: null,
    
    // Per il methodology button nel canvas (COME NEL CODICE 1)
    methodologyButtonArea: null,
    isMethodologyButtonHovered: false,
    showMethodologyButton: false, // Inizialmente nascosto (COME NEL CODICE 1)
    
    // Per lo scroll
    scrollArea: null,
    scrollHint: null,
    isAtBottom: false,
    
    // Flag per controllare se l'inizializzazione è già avvenuta
    initialized: false,
    
    // URL della pagina precedente
    previousPageUrl: null
};

// ===== DATI REALI PER MERAPI 1961 =====
const MERAPI_1961_DATA = {
    name: "Merapi",
    year: 1961,
    death: 2,
    inj: 1,
    dmg: 2,
    house: 3,
    missing: 0,
    impact: 8,
    rawDeath: "Some (~51 to 100 deaths)",
    rawInj: "Few (~1 to 50 injuries)", 
    rawDmg: "Moderate (~$2.4 to $12 million in 2026 dollars)",
    rawHouse: "Many (~101 to 1000 houses)",
    rawMissing: "Details not available"
};

// ===== FUNZIONI PRINCIPALI P5.JS =====

// 1 - Funzione per leggere i parametri dall'URL
function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 2 - Inizializzazione dati
function initializeData() {
    if (state.initialized) return;
    
    state.initialized = true;
    state.chartData = MERAPI_1961_DATA;
    
    // Prova a recuperare l'URL della pagina precedente dal localStorage
    try {
        state.previousPageUrl = localStorage.getItem('previousPageBeforeDetailView');
        console.log("Previous page URL from localStorage:", state.previousPageUrl);
    } catch (e) {
        console.log("Could not read previous page URL from localStorage:", e);
    }
    
    // Salva l'URL corrente come pagina di riferimento per future navigazioni
    try {
        localStorage.setItem('currentDetailViewPage', window.location.href);
    } catch (e) {
        console.log("Could not save current page to localStorage:", e);
    }
    
    // Forza un ridisegno immediato
    if (typeof redraw === 'function') {
        redraw();
    }
    
    // Avvia animazione iniziale dopo un breve ritardo
    setTimeout(startAnimation, 100);
    
    // Forza il ridimensionamento iniziale
    window.dispatchEvent(new Event('resize'));
}

// 3 - Setup iniziale
function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('main-sketch-container');
    frameRate(60);
    
    // Inizializza i dati immediatamente
    initializeData();
    
    // Setup degli event listener per lo scroll
    setupScrollListeners();
    
    // Forza un ridisegno iniziale
    if (typeof redraw === 'function') {
        redraw();
    }
}

// 4 - Draw - loop principale
function draw() {
    // Assicura che i dati siano inizializzati
    if (!state.initialized) {
        initializeData();
    }
    
    background(CONFIG.colors.background);
    drawNavBar();
    drawTitle();
    drawBackButton();
    
    // Disegna il bottone methodology solo se è visibile (COME NEL CODICE 1)
    if (state.showMethodologyButton) {
        drawMethodologyButton();
    }
    
    if (state.chartData) {
        drawImpactChart(state.chartData);
    }
    
    updateAnimations();
    updateCursor();
}

// 5 - Titolo
function drawTitle() {
    textSize(72);
    textFont('Helvetica');
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    
    const titleY = CONFIG.layout.titleStartY + CONFIG.layout.topOffset;
    
    fill(CONFIG.colors.text);
    text('ABOUT THE', CONFIG.layout.marginX, titleY);

    fill(CONFIG.colors.accent);
    text('DETAIL VIEW', CONFIG.layout.marginX, titleY + 75);
    
    textStyle(NORMAL);
}

// 6a - Navbar per la pagina learn more (COPIA ESATTA DA P5)
function drawNavBar() {
    push();
    
    let navHeight = 60;
    let navY = 0;
    
    // sfondo navbar
    fill(255);
    noStroke();
    rect(-1, navY, width + 2, navHeight);
    
    // Calcola se il mouse è sopra "Back" nella navbar
    let isOverNavBack = false;
    
    // Testo Back nella navbar
    fill(0);
    textSize(15);
    textFont("Helvetica");
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    
    let backText = "<   Back";
    let backX = 40;
    let backY = navHeight/2;
    let backWidth = textWidth(backText);
    let backHeight = 20;
    let backTextY = backY - backHeight/2;
    
    // Controlla se il mouse è sopra "Back" nella navbar
    if (mouseX > backX && mouseX < backX + backWidth && 
        mouseY > backTextY && mouseY < backTextY + backHeight) {
        isOverNavBack = true;
        fill("#FF2B00"); // Cambia colore su hover
    }
    
    text(backText, backX, backY);
    
    // Memorizza l'area per l'interazione (solo per il back della navbar)
    state.navBackArea = {
        x: backX,
        y: backTextY,
        width: backWidth,
        height: backHeight
    };
    
    let navLinks = [
        { name: "Homepage", href: "../index.html", x: 0 },
        { name: "Team", href: "team.html", x: 0 },
        { name: "Methodology", href: "methodology.html", x: 0 },
        { name: "Explore", href: "overview.html", x: 0, isExplore: true }
    ];
    
    let totalLinksWidth = 0;
    let linkSpacing = 40;
    let linkFontSize = 15;
    
    textSize(linkFontSize);
    textStyle(NORMAL);
    
    for (let link of navLinks) {
        link.width = textWidth(link.name);
        totalLinksWidth += link.width;
    }
    totalLinksWidth += (navLinks.length - 1) * linkSpacing;
    
    let startX = width - totalLinksWidth - 40;
    let currentX = startX;
    
    for (let i = 0; i < navLinks.length; i++) {
        let link = navLinks[i];
        link.x = currentX;
        link.y = navHeight/2;
        
        if (link.isExplore) {
            fill("#FF2B00");
            textStyle(BOLD);
        } else {
            fill(0);
            textStyle(NORMAL);
        }
        
        text(link.name, link.x, link.y);
        
        let textW = link.width;
        let textH = 20;
        let textX = link.x;
        let textY = link.y - textH/2;
        
        if (mouseX > textX && mouseX < textX + textW && 
            mouseY > textY && mouseY < textY + textH) {
            if (!link.isExplore) {
                fill("#FF2B00");
                text(link.name, link.x, link.y);
            }
        }
        
        currentX += link.width + linkSpacing;
    }
    
    state.navLinks = navLinks;

    stroke(245, 40, 0);
    strokeWeight(1);
    line(0, navHeight, width, navHeight);
    
    pop();
}

// 6 - Back Button - MODIFICATO PER ESSERE IDENTICO AL CODICE 1
function drawBackButton() {
    const buttonWidth = 160;
    const buttonHeight = 40;
    
    const buttonX = width - buttonWidth - 50;
    const buttonY = CONFIG.layout.startButtonY;
    
    // NO FILL di default - solo su hover (come nel codice 1)
    if (state.isBackButtonHovered) {
        // FILL BIANCO solo su hover
        fill(CONFIG.colors.accent); // Bianco
    } else {
        noFill(); // Nessun fill di default
    }
    
    // Bordo - Bianco su hover, Nero di default (come nel codice 1)
    stroke(state.isBackButtonHovered ? CONFIG.colors.accent : CONFIG.colors.infoBox);
    strokeWeight(1);
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

    // Icona con "×" - SENZA CERCHIO ATTORNO (come nel codice 1)
    push();
    translate(buttonX + 25, buttonY + buttonHeight/2);
    fill(state.isBackButtonHovered ? CONFIG.colors.background : CONFIG.colors.infoBox); // Nero di default, Rosso su hover
    noStroke(); // NESSUNO STROKE
    textSize(20); // Leggermente più grande
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("×", 0, 0);
    pop();

    // Testo "Back" - Nero di default, Rosso su hover (come nel codice 1)
    fill(state.isBackButtonHovered ? CONFIG.colors.background : CONFIG.colors.infoBox);
    noStroke();
    textSize(CONFIG.layout.labelFontSize);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text("Back", buttonX + 50, buttonY + buttonHeight/2);

    // Memorizza l'area per l'interazione
    state.backButtonArea = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };
}

// 7 - Methodology Button - ESATTAMENTE COME NEL CODICE 1
function drawMethodologyButton() {
    const buttonWidth = 200; // Leggermente più largo per il testo più lungo
    const buttonHeight = 40;
    
    // POSIZIONE: a sinistra, stessa altezza del back button (COME NEL CODICE 1)
    const buttonX = 50; // Margine sinistro
    const buttonY = CONFIG.layout.startButtonY; // Stessa altezza del back button
    
    // NO FILL di default - solo su hover (COME NEL CODICE 1)
    if (state.isMethodologyButtonHovered) {
        // FILL BIANCO solo su hover
        fill(CONFIG.colors.accent); // Bianco
    } else {
        noFill(); // Nessun fill di default
    }
    
    // Bordo - Bianco su hover, Nero di default (COME NEL CODICE 1)
    stroke(state.isMethodologyButtonHovered ? CONFIG.colors.accent : CONFIG.colors.infoBox);
    strokeWeight(1);
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

    // Testo "About the Methodology" - Nero di default, Rosso su hover (COME NEL CODICE 1)
    fill(state.isMethodologyButtonHovered ? CONFIG.colors.background : CONFIG.colors.infoBox);
    noStroke();
    textSize(CONFIG.layout.labelFontSize);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text("About the Methodology", buttonX + 12, buttonY + buttonHeight/2);

    // Memorizza l'area per l'interazione (COME NEL CODICE 1)
    state.methodologyButtonArea = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };
}

// 8 - Disegna il grafico d'impatto
function drawImpactChart(d) {
    push();

    let panelW = CONFIG.chartSize + 60;
    let panelH = CONFIG.chartSize + 60;
    let px = width * CONFIG.chartXPercent - panelW / 2;
    let py = height * CONFIG.chartYPercent - panelH / 2;

    noFill();
    noStroke();
    rect(px, py, panelW, panelH, 10);

    let cx = width * CONFIG.chartXPercent;
    let cy = height * CONFIG.chartYPercent;
    translate(cx, cy);

    let gapAngle = radians(CONFIG.chartGapAngleDeg);
    let gapRadial = CONFIG.chartGapRadial;
    let maxChartRadius = CONFIG.chartSize / 2 + 20;
    let radiusStep = CONFIG.chartSize / (2 * CONFIG.chartLevels);

    const values = [d.death, d.inj, d.dmg, d.house, d.missing];
    const labels = ["Deaths", "Injuries", "Damage", "Houses Destroyed", "Missing"];
    const rawValues = [d.rawDeath, d.rawInj, d.rawDmg, d.rawHouse, d.rawMissing];
    
    const isDataAvailable = [
        !(d.death === 0 && d.rawDeath === "Details not available"),
        !(d.inj === 0 && d.rawInj === "Details not available"),
        !(d.dmg === 0 && d.rawDmg === "Details not available"),
        !(d.house === 0 && d.rawHouse === "Details not available"),
        !(d.missing === 0 && d.rawMissing === "Details not available")
    ];

    let animationProgress = getAnimationProgress();
    
    let mx = mouseX - cx;
    let my = mouseY - cy;
    let mDist = dist(0, 0, mx, my);
    let mAngle = atan2(my, mx);
    if (mAngle < 0) mAngle += TWO_PI;

    let sectionAngle = TWO_PI / 5;
    let hoveredSection = -1;
    
    if (mDist < maxChartRadius && mDist > 20) {
        let sectionIndex = floor(mAngle / sectionAngle);
        let localAngle = mAngle % sectionAngle;
        let halfGap = gapAngle / 2;
        if (localAngle > halfGap && localAngle < (sectionAngle - halfGap)) {
            hoveredSection = sectionIndex;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (!isDataAvailable[i]) continue;
        
        let start = sectionAngle * i + gapAngle / 2;
        let end = sectionAngle * (i + 1) - gapAngle / 2;

        for (let level = 1; level <= CONFIG.chartLevels; level++) {
            let innerR = radiusStep * (level - 1) + gapRadial;
            let outerR = radiusStep * level - gapRadial;

            if (values[i] >= level) {
                let animatedOuterR;
                
                if (animationProgress < 1.0) {
                    let levelDelay = (level - 1) * 0.15;
                    let levelProgress = constrain((animationProgress - levelDelay) / (1 - levelDelay), 0, 1);
                    let easedProgress = 1 - pow(1 - levelProgress, 3);
                    animatedOuterR = innerR + (outerR - innerR) * easedProgress;
                } else {
                    animatedOuterR = outerR;
                }
                
                fill(CONFIG.chartMainColor);
                stroke(CONFIG.chartMainColor);
                strokeWeight(1);
                drawArcSegment(innerR, animatedOuterR, start, end);
            } else {
                noFill();
                stroke(CONFIG.chartMainColor);
                strokeWeight(1);
                drawArcSegment(innerR, outerR, start, end);
            }
        }
    }

    for (let i = 0; i < 5; i++) {
        if (isDataAvailable[i]) continue;
        
        let start = sectionAngle * i + gapAngle / 2;
        let end = sectionAngle * (i + 1) - gapAngle / 2;

        for (let level = 1; level <= CONFIG.chartLevels; level++) {
            let innerR = radiusStep * (level - 1) + gapRadial;
            let outerR = radiusStep * level - gapRadial;
            
            drawingContext.save();
            drawingContext.beginPath();
            
            for (let a = start; a <= end; a += 0.01) {
                let x = cos(a) * outerR;
                let y = sin(a) * outerR;
                if (a === start) drawingContext.moveTo(x, y);
                else drawingContext.lineTo(x, y);
            }
            for (let a = end; a >= start; a -= 0.01) {
                let x = cos(a) * innerR;
                let y = sin(a) * innerR;
                drawingContext.lineTo(x, y);
            }
            drawingContext.closePath();
            drawingContext.clip();
            
            let patternSpacing = 6;
            let lineColor = color(0, 155);
            
            stroke(lineColor);
            strokeWeight(1);
            noFill();
            
            let minX = -outerR;
            let maxX = outerR;
            let minY = -outerR;
            let maxY = outerR;
            
            let angle = PI / 4;
            let cosAngle = cos(angle);
            let sinAngle = sin(angle);
            
            for (let offset = -maxX - maxY; offset < maxX + maxY; offset += patternSpacing) {
                let x1, y1, x2, y2;
                
                if (cosAngle !== 0) {
                    x1 = minX;
                    y1 = (offset - x1 * cosAngle) / sinAngle;
                    x2 = maxX;
                    y2 = (offset - x2 * cosAngle) / sinAngle;
                }
                
                if (y1 >= minY || y2 >= minY || y1 <= maxY || y2 <= maxY) {
                    line(x1, y1, x2, y2);
                }
            }
            
            drawingContext.restore();
            
            noFill();
            stroke(0, 150);
            strokeWeight(1);
            drawArcSegment(innerR, outerR, start, end);
        }
    }

    let detailMaxWidth = 130;
    let lineHeight = 16;

    for (let i = 0; i < 5; i++) {
        let start = sectionAngle * i + gapAngle / 2;
        let end = sectionAngle * (i + 1) - gapAngle / 2;

        textStyle(NORMAL);
        noStroke();
        
        if (!isDataAvailable[i]) {
            fill(0, 150);
        } else {
            fill(0);
            textStyle(BOLD);
        }
        textSize(CONFIG.chartLabelSize);
        textAlign(CENTER, CENTER);

        let ang = (start + end) / 2;
        let lx = cos(ang) * (CONFIG.chartSize / 2 + 60);
        let ly = sin(ang) * (CONFIG.chartSize / 2 + 55);
        
        text(labels[i], lx, ly - 25);
        
        if (isDataAvailable[i]) {
            let levelValue = values[i];
            let levelText = "Impact: " + levelValue;

            fill(CONFIG.chartMainColor);
            textSize(CONFIG.chartLabelSize);
            textStyle(BOLD);
            text(levelText, lx, ly - 5);

            let detailText = "";
            if (i === 0) detailText = d.rawDeath;
            else if (i === 1) detailText = d.rawInj;
            else if (i === 2) detailText = d.rawDmg;
            else if (i === 3) detailText = d.rawHouse;
            else if (i === 4) detailText = d.rawMissing;

            fill(0);
            textSize(CONFIG.chartLabelSize);
            textStyle(NORMAL);
            textAlign(CENTER, TOP);
            
            let numLines = 1;
            if (detailText.includes('\n')) {
                numLines = 2;
            }
            
            let textY = ly + 7;
            text(detailText, lx - detailMaxWidth / 2, textY, detailMaxWidth);
        }
    }

    push();
    noStroke();
    fill(0);
    textSize(CONFIG.chartTitleSize);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    
    let totalImpactText = "Total impact level: " + d.impact;
    let totalImpactX = 270;
    let totalImpactY = -270;
    text(totalImpactText, totalImpactX, totalImpactY);
    
    textStyle(NORMAL);
    pop();  

    push();
    noStroke();
    fill(CONFIG.colors.accent);
    textSize(CONFIG.chartTitleSize);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    
    let exampleText = "Es. " + d.name + " " + d.year;
    text(exampleText, totalImpactX, totalImpactY - 40);
    pop();

    let tooltipText = "";
    if (hoveredSection !== -1) {
        if (hoveredSection === 0) {
            tooltipText = d.rawDeath;
        }
        else if (hoveredSection === 1) {
            tooltipText = d.rawInj;
        }
        else if (hoveredSection === 2) {
            tooltipText = d.rawDmg;
        }
        else if (hoveredSection === 3) {
            tooltipText = d.rawHouse;
        }
        else if (hoveredSection === 4) {
            tooltipText = d.rawMissing;
        }
    }

    pop();

    if (tooltipText !== "") {
        drawTooltip(tooltipText);
    }
}

// 9 - Funzione di utilità per disegnare segmento ad arco
function drawArcSegment(r1, r2, start, end) {
    beginShape();
    for (let a = start; a <= end; a += 0.01) {
        vertex(cos(a) * r2, sin(a) * r2);
    }
    for (let a = end; a >= start; a -= 0.01) {
        vertex(cos(a) * r1, sin(a) * r1);
    }
    endShape(CLOSE);
}

// 10 - Disegna tooltip
function drawTooltip(txt) {
    push();
    textSize(CONFIG.chartTooltipTextSize);
    let w = textWidth(txt) + 20;
    let h = 34;

    fill(255);
    stroke(CONFIG.chartMainColor);
    rect(mouseX + 15, mouseY - 10, w, h, 6);

    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    text(txt, mouseX + 25, mouseY + 8);
    pop();
}

// 11 - Gestione animazioni
function startAnimation() {
    state.isAnimating = true;
    state.animationStartTime = millis();
}

function updateAnimations() {
    // Gestito automaticamente
}

function getAnimationProgress() {
    if (!state.isAnimating) return 1.0;
    
    let elapsed = millis() - state.animationStartTime;
    let progress = constrain(elapsed / 1000, 0, 1);
    
    if (progress >= 1.0) {
        state.isAnimating = false;
    }
    
    return progress;
}

// 12 - Aggiorna il cursore - MODIFICATO PER INCLUIRE HOVER SUI BOTTONI COME NEL CODICE 1
function updateCursor() {
    let isOverButton = false;

    // Controlla hover su "Back" nella navbar
    if (state.navBackArea &&
        mouseX > state.navBackArea.x &&
        mouseX < state.navBackArea.x + state.navBackArea.width &&
        mouseY > state.navBackArea.y &&
        mouseY < state.navBackArea.y + state.navBackArea.height) {
        isOverButton = true;
    }

    // Controlla hover sui link della navbar (escluso "Back")
    if (state.navLinks) {
        for (let link of state.navLinks) {
            let textW = link.width;
            let textH = 20;
            let textX = link.x;
            let textY = link.y - textH/2;
            
            if (mouseX > textX && mouseX < textX + textW && 
                mouseY > textY && mouseY < textY + textH) {
                isOverButton = true;
                break;
            }
        }
    }

    // Controlla hover sul back button (quello grande in basso a destra)
    state.isBackButtonHovered = false;
    
    if (state.backButtonArea &&
        mouseX > state.backButtonArea.x &&
        mouseX < state.backButtonArea.x + state.backButtonArea.width &&
        mouseY > state.backButtonArea.y &&
        mouseY < state.backButtonArea.y + state.backButtonArea.height) {
        isOverButton = true;
        state.isBackButtonHovered = true;
    }
    
    // Controlla hover sul methodology button
    state.isMethodologyButtonHovered = false;
    
    if (state.showMethodologyButton && state.methodologyButtonArea &&
        mouseX > state.methodologyButtonArea.x &&
        mouseX < state.methodologyButtonArea.x + state.methodologyButtonArea.width &&
        mouseY > state.methodologyButtonArea.y &&
        mouseY < state.methodologyButtonArea.y + state.methodologyButtonArea.height) {
        isOverButton = true;
        state.isMethodologyButtonHovered = true;
    }

    let cx = width * CONFIG.chartXPercent;
    let cy = height * CONFIG.chartYPercent;
    let mx = mouseX - cx;
    let my = mouseY - cy;
    let mDist = dist(0, 0, mx, my);
    
    if (mDist < (CONFIG.chartSize / 2 + 20) && mDist > 20) {
        isOverButton = true;
    }

    if (isOverButton) {
        cursor(HAND);
    } else {
        cursor(ARROW);
    }
}

// 13 - Gestione click del mouse - AGGIORNATO PER IL BOTTONE METHODOLOGY COME NEL CODICE 1
function mousePressed() {
    // Controllo per "Back" nella navbar
    if (state.navBackArea &&
        mouseX > state.navBackArea.x &&
        mouseX < state.navBackArea.x + state.navBackArea.width &&
        mouseY > state.navBackArea.y &&
        mouseY < state.navBackArea.y + state.navBackArea.height) {
        
        goBackToPreviousPage();
        return;
    }

    // Controllo per i link della navbar
    if (state.navLinks) {
        for (let link of state.navLinks) {
            let textW = link.width;
            let textH = 20;
            let textX = link.x;
            let textY = link.y - textH/2;
            
            if (mouseX > textX && mouseX < textX + textW && 
                mouseY > textY && mouseY < textY + textH) {
                window.location.href = link.href;
                return;
            }
        }
    }

    // Controllo per il back button (quello grande in basso a destra)
    if (state.backButtonArea &&
        mouseX > state.backButtonArea.x &&
        mouseX < state.backButtonArea.x + state.backButtonArea.width &&
        mouseY > state.backButtonArea.y &&
        mouseY < state.backButtonArea.y + state.backButtonArea.height) {
        
        goBackToPreviousPage();
        return;
    }
    
    // Controllo per il methodology button
    if (state.showMethodologyButton && state.methodologyButtonArea &&
        mouseX > state.methodologyButtonArea.x &&
        mouseX < state.methodologyButtonArea.x + state.methodologyButtonArea.width &&
        mouseY > state.methodologyButtonArea.y &&
        mouseY < state.methodologyButtonArea.y + state.methodologyButtonArea.height) {
        
        window.location.href = "methodology.html";
        return;
    }
}

// Funzione per tornare alla pagina precedente
function goBackToPreviousPage() {
    // Prima prova con l'URL memorizzato nel localStorage
    if (state.previousPageUrl) {
        console.log("Navigating back to previous page:", state.previousPageUrl);
        window.location.href = state.previousPageUrl;
        return;
    }
    
    // Se non c'è un URL memorizzato, usa il referrer del browser
    if (document.referrer && document.referrer !== '' && document.referrer !== window.location.href) {
        console.log("Using browser referrer:", document.referrer);
        window.location.href = document.referrer;
        return;
    }
    
    // Fallback: se non c'è referrer e non c'è URL memorizzato,
    // usa i parametri dell'URL per costruire un URL di default
    let volcanoName = getQueryParam("name");
    let volcanoYear = getQueryParam("year");
    let volcanoNumber = getQueryParam("number");
    
    // Controlla se siamo arrivati da overview.html o detail.html
    // in base ai parametri presenti
    if (volcanoName || volcanoYear || volcanoNumber) {
        // Probabilmente veniamo da detail.html
        let backUrl = "detail.html";
        let params = [];
        
        if (volcanoName) params.push("name=" + encodeURIComponent(volcanoName));
        if (volcanoYear) params.push("year=" + volcanoYear);
        if (volcanoNumber) params.push("number=" + volcanoNumber);
        
        if (params.length > 0) {
            backUrl += "?" + params.join("&");
        }
        
        console.log("Fallback navigation to:", backUrl);
        window.location.href = backUrl;
    } else {
        // Default: torna alla mappa
        console.log("Default navigation to overview.html");
        window.location.href = "overview.html";
    }
}

// 14 - Ridimensionamento finestra
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Forza un ridisegno dopo il ridimensionamento
    if (typeof redraw === 'function') {
        redraw();
    }
}

// 15 - Setup degli event listener per lo scroll
function setupScrollListeners() {
    state.scrollArea = document.getElementById('text-scroll-area');
    state.scrollHint = document.getElementById('scroll-hint');
    
    if (state.scrollArea) {
        state.scrollArea.addEventListener('scroll', handleTextScroll);
        document.addEventListener('wheel', handleGlobalWheel, { passive: false });
        
        if (state.scrollHint) {
            state.scrollHint.addEventListener('click', function() {
                scrollTextContent(300);
            });
        }
        
        // Inizializza lo stato dello scroll
        setTimeout(checkScrollEnd, 100);
    }
}

// 16 - Gestione scroll globale
function handleGlobalWheel(e) {
    if (state.scrollArea) {
        state.scrollArea.scrollTop += e.deltaY;
        e.preventDefault();
        checkScrollEnd();
    }
}

// 17 - Gestione scroll del testo
function handleTextScroll() {
    checkScrollEnd();
}

// 18 - Controlla se siamo alla fine dello scroll - MODIFICATO PER MOSTRARE/NASCONDERE BOTTONE METHODOLOGY COME NEL CODICE 1
function checkScrollEnd() {
    if (!state.scrollArea || !state.scrollHint) return;
    
    const scrollTop = state.scrollArea.scrollTop;
    const scrollHeight = state.scrollArea.scrollHeight - state.scrollArea.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    // Nasconde la freccia e mostra il bottone methodology quando si è vicini alla fine (90%) - COME NEL CODICE 1
    if (scrollPercentage > 90) {
        state.scrollHint.style.display = "none";
        state.isAtBottom = true;
        state.showMethodologyButton = true; // Mostra il bottone (COME NEL CODICE 1)
    } else {
        state.scrollHint.style.display = "block";
        state.isAtBottom = false;
        state.showMethodologyButton = false; // Nascondi il bottone (COME NEL CODICE 1)
    }
}

// 19 - Scroll del contenuto testo
function scrollTextContent(pixels) {
    if (!state.scrollArea) return;
    
    state.scrollArea.scrollTop += pixels;
    checkScrollEnd();
}

// 20 - Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
    // Assicura che p5.js sia pronto
    setTimeout(function() {
        if (typeof setup === 'function' && !state.initialized) {
            // Forza l'inizializzazione
            initializeData();
            // Forza un ridisegno
            if (typeof redraw === 'function') {
                redraw();
            }
        }
    }, 100);
});