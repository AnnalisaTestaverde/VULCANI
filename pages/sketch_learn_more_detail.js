// ===== CONFIGURAZIONE IDENTICA AL GRAFICO ORIGINALE =====
const CONFIG = {
    chartXPercent: 0.695,
    chartYPercent: 0.51,
    chartSize: 400,
    chartLevels: 4,
    chartMainColor: "#FFFFFF",
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
        infoBoxStroke: '#FF2B00',
        chartAvailable: '#FFFFFF',
        chartUnavailable: '#3C3C3C',
        labelAvailableText: '#000000',
        labelUnavailableText: '#3C3C3C'
    },
    layout: {
        titleStartY: 95,
        topOffset: -20,
        marginX: 40,
        startButtonY: 720,
        labelFontSize: 16
    }
};

// ===== VARIABILI GLOBALI COME IN sketch_detail.js =====
let data; // Per il CSV
const INFLATION_FACTOR = 2.4;

// ===== SISTEMA RESPONSIVE =====
let scaleFactor = 1.0;

function calculateScaleFactor() {
    const referenceWidth = 1920;
    const referenceHeight = 1080;
    
    const widthRatio = windowWidth / referenceWidth;
    const heightRatio = windowHeight / referenceHeight;
    
    return min(widthRatio, heightRatio);
}

function applyResponsiveScaling() {
    const availableHeight = windowHeight - 70;
    const referenceAvailableHeight = 1080 - 70;
    
    scaleFactor = availableHeight / referenceAvailableHeight;
    scaleFactor = constrain(scaleFactor, 0.7, 1.2);
    
    updateResponsiveDimensions();
}

function updateResponsiveDimensions() {
    let centerXRatio = 0.695;
    
    if (windowWidth > 1920) {
        centerXRatio = 0.75;
    } else if (windowWidth < 1366) {
        centerXRatio = 0.65;
    }
    
    const centerYPercentage = 0.48;
    let centerY;
    
    if (windowHeight > 1200) {
        centerY = windowHeight * 0.46 + 25;
    } else if (windowHeight < 800) {
        centerY = windowHeight * 0.50 + 25;
    } else {
        centerY = windowHeight * centerYPercentage + 25;
    }
    
    CONFIG.chartXPercent = centerXRatio; 
    CONFIG.chartYPercent = centerY / windowHeight;
    
    const graphScale = min(scaleFactor * 1.3, 1.2);
    const baseSize = 400;
    
    const availableHeight = windowHeight - 70 - 100;
    const availableWidth = windowWidth * 0.35;
    
    const targetSize = min(availableHeight, availableWidth);
    
    CONFIG.chartSize = constrain(
        targetSize * 0.8,
        300 * graphScale,
        500 * graphScale
    );
    
    CONFIG.chartTitleSize = 28;
    CONFIG.chartLabelSize = 14;
    CONFIG.chartTooltipTextSize = 17;
    CONFIG.layout.labelFontSize = 16;
    
    CONFIG.layout.startButtonY = windowHeight - 100;
}

// ===== STATO APPLICAZIONE =====
let state = {
    chartData: null,
    animationStartTime: 0,
    isAnimating: false,
    backButtonArea: null,
    isBackButtonHovered: false,
    navBackArea: null,
    methodologyButtonArea: null,
    isMethodologyButtonHovered: false,
    showMethodologyButton: false,
    scrollArea: null,
    scrollHint: null,
    isAtBottom: false,
    initialized: false,
    previousPageUrl: null,
    volcanoName: null,
    volcanoYear: null,
    volcanoNumber: null
};

// ===== FUNZIONI PER CARICARE I DATI (COME IN sketch_detail.js) =====

function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Funzione per caricare il CSV (come in preload di sketch_detail.js)
function preload() {
    data = loadTable("../assets/data_impatto.csv", "csv", "header");
}

// Funzione per trovare la riga dei dati (come in sketch_detail.js)
function findDataRowIndexFast(name, number) {
    if (!data) return -1;
    
    for (let i = 0; i < data.getRowCount(); i++) {
        if (data.getString(i, "Name") === name && 
            String(data.getString(i, "Number")) === String(number)) {
            return i;
        }
    }
    return -1;
}

// Funzione per formattare i danni (come in sketch_detail.js)
function formatDamageValue(damageValue) {
    if (damageValue === undefined || damageValue === null || damageValue === 0 || isNaN(damageValue)) {
        return "Details not available";
    }
    
    let value = damageValue * INFLATION_FACTOR;
    
    if (value < 2.4) {
        return `Less than $2.4 million (2026 dollars)`;
    } else if (value < 12) {
        return `$${Math.round(value * 10) / 10} million (2026 dollars)`;
    } else if (value < 57.6) {
        return `$${Math.round(value * 10) / 10} million (2026 dollars)`;
    } else {
        return `$${(value / 1000).toFixed(1)} billion (2026 dollars)`;
    }
}

// Funzione per ottenere il testo dettagliato (come in sketch_detail.js)
function getDetailText(value, descCode, type) {
    if (value && value !== "" && value !== "0") {
        return value;
    }
    
    let code = parseInt(descCode);
    
    if (isNaN(code) || code < 1 || code > 4) {
        return "Impact unknown";
    }
    
    const tables = {
        deaths: {
            1: "Few (~1 to 50 deaths)",
            2: "Some (~51 to 100 deaths)",
            3: "Many (~101 to 1000 deaths)",
            4: "Very Many (~1001 or more deaths)"
        },
        injuries: {
            1: "Few (~1 to 50 injuries)",
            2: "Some (~51 to 100 injuries)",
            3: "Many (~101 to 1000 injuries)",
            4: "Very Many (~1001 or more injuries)"
        },
        damage: {
            1: "Limited (less than $2.4 million in 2026 dollars)",
            2: "Moderate (~$2.4 to $12 million in 2026 dollars)",
            3: "Severe (~$12 to $57.6 million in 2026 dollars)",
            4: "Extreme ($60 million or more in 2026 dollars)"
        },
        houses: {
            1: "Few (~1 to 50 houses)",
            2: "Some (~51 to 100 houses)",
            3: "Many (~101 to 1000 houses)",
            4: "Very Many (~1001 or more houses)"
        },
        missing: {
            1: "Few (~1 to 50 missing)",
            2: "Some (~51 to 100 missing)",
            3: "Many (~101 to 1000 missing)",
            4: "Very Many (~1001 or more missing)"
        }
    };
    
    return tables[type][code] || "Details not available";
}

// Funzione per costruire i dati del grafico (come in sketch_detail.js)
function buildChartDataFromRow(i) {
    let strDeath = data.getString(i, "Deaths");
    let strInj = data.getString(i, "Injuries");
    let strDmg = data.getString(i, "Damage ($Mil)");
    let strHouse = data.getString(i, "Houses Destroyed");
    let strMissing = data.getString(i, "Missing");
    
    let deathVal = Number(data.getString(i, "Death Description"));
    let injVal = Number(data.getString(i, "Injuries Description"));
    let dmgVal = Number(data.getString(i, "Damage Description"));
    let houseVal = Number(data.getString(i, "Houses Destroyed Description"));
    let missingVal = Number(data.getString(i, "Missing Description"));
    let impactVal = Number(data.getString(i, "Impact"));
    
    let dmgValForChart = 0;
    if (!isNaN(dmgVal) && dmgVal > 0) {
        dmgValForChart = constrain(Math.round(dmgVal), 0, 4);
    }
    
    deathVal = isNaN(deathVal) ? 0 : deathVal;
    injVal = isNaN(injVal) ? 0 : injVal;
    dmgVal = isNaN(dmgVal) ? 0 : dmgVal;
    houseVal = isNaN(houseVal) ? 0 : houseVal;
    missingVal = isNaN(missingVal) ? 0 : missingVal;
    impactVal = isNaN(impactVal) ? 0 : impactVal;
    
    deathVal = constrain(Math.round(deathVal), 0, 4);
    injVal = constrain(Math.round(injVal), 0, 4);
    houseVal = constrain(Math.round(houseVal), 0, 4);
    missingVal = constrain(Math.round(missingVal), 0, 4);
    
    let formattedDamage = "Details not available";
    if (strDmg && strDmg.trim() !== "") {
        formattedDamage = strDmg;
    } else if (dmgVal > 0) {
        formattedDamage = formatDamageValue(dmgVal);
    }
    
    return {
        index: i,
        name: data.getString(i, "Name"),
        country: data.getString(i, "Country") || "",
        death: deathVal,
        inj: injVal,
        dmg: dmgValForChart,
        house: houseVal,
        missing: missingVal,
        impact: impactVal,
        rawDeath: (strDeath === "" ? getDetailText(strDeath, deathVal, "deaths") : strDeath),
        rawInj: (strInj === "" ? getDetailText(strInj, injVal, "injuries") : strInj),
        rawDmg: formattedDamage,
        rawHouse: (strHouse === "" ? getDetailText(strHouse, houseVal, "houses") : strHouse),
        rawMissing: (strMissing === "" ? getDetailText(strMissing, missingVal, "missing") : strMissing),
        originalDmgValue: dmgVal
    };
}

// ===== INIZIALIZZAZIONE DATI =====
function initializeData() {
    if (state.initialized) return;
    
    applyResponsiveScaling();
    
    state.initialized = true;
    
    // Recupera parametri dall'URL
    state.volcanoName = getQueryParam("name");
    state.volcanoYear = getQueryParam("year");
    state.volcanoNumber = getQueryParam("number");
    
    // Recupera URL precedente
    try {
        state.previousPageUrl = localStorage.getItem('previousPageBeforeDetailView');
        console.log("Previous page URL from localStorage:", state.previousPageUrl);
    } catch (e) {
        console.log("Could not read previous page URL from localStorage:", e);
    }
    
    // Carica i dati del grafico
    if (state.volcanoName && state.volcanoNumber && data) {
        const rowIndex = findDataRowIndexFast(state.volcanoName, state.volcanoNumber);
        
        if (rowIndex !== -1) {
            state.chartData = buildChartDataFromRow(rowIndex);
            console.log("Chart data loaded:", state.chartData);
        } else {
            console.warn("No data found for:", state.volcanoName, state.volcanoNumber);
            // Usa dati di default se non trovati
            state.chartData = {
                name: state.volcanoName,
                year: state.volcanoYear || "Unknown",
                death: 0,
                inj: 0,
                dmg: 0,
                house: 0,
                missing: 0,
                impact: 0,
                rawDeath: "Details not available",
                rawInj: "Details not available",
                rawDmg: "Details not available",
                rawHouse: "Details not available",
                rawMissing: "Details not available"
            };
        }
    } else {
        console.error("Missing parameters or data not loaded");
        // Dati di fallback
        state.chartData = {
            name: state.volcanoName || "Volcano",
            year: state.volcanoYear || "Unknown",
            death: 0,
            inj: 0,
            dmg: 0,
            house: 0,
            missing: 0,
            impact: 0,
            rawDeath: "Details not available",
            rawInj: "Details not available",
            rawDmg: "Details not available",
            rawHouse: "Details not available",
            rawMissing: "Details not available"
        };
    }
    
    // Forza un ridisegno immediato
    if (typeof redraw === 'function') {
        redraw();
    }
    
    // Avvia animazione
    setTimeout(startAnimation, 100);
    
    // Forza il ridimensionamento
    window.dispatchEvent(new Event('resize'));
}

// ===== FUNZIONI P5.JS PRINCIPALI =====

function setup() {
    // Calcola e applica lo scaling iniziale
    applyResponsiveScaling();
    
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('main-sketch-container');
    frameRate(60);
    
    // Setup degli event listener per lo scroll
    setupScrollListeners();
    
    // Forza un ridisegno iniziale
    if (typeof redraw === 'function') {
        redraw();
    }
}

function draw() {
    // Assicura che i dati siano inizializzati
    if (!state.initialized) {
        initializeData();
    }
    
    background(CONFIG.colors.background);
    drawNavBar();
    drawTitle();
    drawBackButton();
    
    // Disegna il bottone methodology solo se è visibile
    if (state.showMethodologyButton) {
        drawMethodologyButton();
    }
    
    if (state.chartData) {
    drawImpactChart(state.chartData);
} else {
    drawChartPlaceholder();
}
    
    updateAnimations();
    updateCursor();
}

// ===== FUNZIONI PER IL GRAFICO (NUOVA VERSIONE CON COLORI MODIFICATI) =====

function drawImpactChart(d) {
    push();

    let chartSize = CONFIG.chartSize;
    let chartXPercent = CONFIG.chartXPercent;
    let chartYPercent = CONFIG.chartYPercent;
    
    let panelW = chartSize + 60;
    let panelH = chartSize + 60;
    let px = width * chartXPercent - panelW / 2;
    let py = height * chartYPercent - panelH / 2;

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
    
    // Determina quali dati sono disponibili
    const isDataAvailable = [
        !(d.death === 0 && d.rawDeath.includes("not available")),
        !(d.inj === 0 && d.rawInj.includes("not available")),
        !(d.dmg === 0 && d.rawDmg.includes("not available")),
        !(d.house === 0 && d.rawHouse.includes("not available")),
        !(d.missing === 0 && d.rawMissing.includes("not available"))
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

    // Sezioni con dati disponibili - BIANCHE
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
                
                // BIANCO per dati disponibili
                fill(CONFIG.colors.chartAvailable);
                stroke(CONFIG.colors.chartAvailable);
                strokeWeight(1);
                drawArcSegment(innerR, animatedOuterR, start, end);
            } else {
                noFill();
                // BIANCO per dati disponibili (bordo)
                stroke(CONFIG.colors.chartAvailable);
                strokeWeight(1);
                drawArcSegment(innerR, outerR, start, end);
            }
        }
    }

    // Sezioni in cui non ci sono dati disponibili - GRIGIO SCURO
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
            // GRIGIO SCURO per pattern
            let lineColor = color(CONFIG.colors.chartUnavailable);
            lineColor.setAlpha(150);
            
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
            // GRIGIO SCURO per bordo
            stroke(CONFIG.colors.chartUnavailable);
            strokeWeight(1);
            drawArcSegment(innerR, outerR, start, end);
        }
    }

    let detailMaxWidth = 130;
    let lineHeight = 16;

    // Etichette attorno al grafico
    for (let i = 0; i < 5; i++) {
        let start = sectionAngle * i + gapAngle / 2;
        let end = sectionAngle * (i + 1) - gapAngle / 2;

        textStyle(NORMAL);
        noStroke();
        
        let ang = (start + end) / 2;
        let lx = cos(ang) * (CONFIG.chartSize / 2 + 60);
        let ly = sin(ang) * (CONFIG.chartSize / 2 + 55);
        
        // Titolo della categoria (es. "Deaths")
        textSize(CONFIG.chartLabelSize);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        
        if (!isDataAvailable[i]) {
            // GRIGIO SCURO per etichette senza dati
            fill(CONFIG.colors.labelUnavailableText);
        } else {
            // NERO per etichette con dati
            fill(CONFIG.colors.labelAvailableText);
        }
        
        text(labels[i], lx, ly - 25);
        
        if (isDataAvailable[i]) {
            let levelValue = values[i];
            let levelText = "Impact: " + levelValue;

            // IMPACT VALUE: BIANCO per dati disponibili
            fill(CONFIG.colors.chartAvailable);
            textSize(CONFIG.chartLabelSize);
            textStyle(BOLD);
            text(levelText, lx, ly - 5);

            // Testo dettagliato
            let detailText = "";
            if (i === 0) detailText = d.rawDeath;
            else if (i === 1) detailText = d.rawInj;
            else if (i === 2) detailText = d.rawDmg;
            else if (i === 3) detailText = d.rawHouse;
            else if (i === 4) detailText = d.rawMissing;

            // DETTAGLIO: NERO per dati disponibili
            fill(CONFIG.colors.labelAvailableText);
            textSize(CONFIG.chartLabelSize);
            textStyle(NORMAL);
            textAlign(CENTER, TOP);
            
            let textY = ly + 7;
            text(detailText, lx - detailMaxWidth / 2, textY, detailMaxWidth);
        } else {
            // Per sezioni senza dati, mostra solo il titolo in grigio
            fill(CONFIG.colors.labelUnavailableText);
            textSize(CONFIG.chartLabelSize);
            textStyle(NORMAL);
            textAlign(CENTER, TOP);
            
            let textY = ly + 7;
            text("Details not available", lx - detailMaxWidth / 2, textY, detailMaxWidth);
        }
    }

    // Torna alle coordinate globali prima di disegnare il Total Impact Level
    pop();

    // ===== DOPO IL GRAFICO: TOTAL IMPACT LEVEL =====
    push();
    noStroke();
    fill(CONFIG.colors.text); // NERO
    textSize(CONFIG.chartTitleSize);
    textAlign(RIGHT, CENTER);
    textStyle(BOLD);
    
    let totalImpactText = "Total impact level: " + d.impact;
    
    // Calcola la posizione esattamente come in sketch_detail.js
    let scaleFactor = calculateScaleFactor();
    scaleFactor = constrain(scaleFactor, 0.7, 1.5);
    
    // Usa il margine destro dal CONFIG
    let totalImpactX = width - CONFIG.layout.marginX;
    
    // Posizione Y: sotto la navbar (70px) + 30px scalati
    const navbarHeight = 70;
    let totalImpactY = navbarHeight + 30 * scaleFactor;
    
    // Disegna il testo
    text(totalImpactText, totalImpactX, totalImpactY);
    
    textStyle(NORMAL);
    pop();

    // ===== TOOLTIP (se necessario) =====
    let tooltipText = "";
    if (hoveredSection !== -1 && isDataAvailable[hoveredSection]) {
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

    if (tooltipText !== "" && !tooltipText.includes("not available")) {
        drawTooltip(tooltipText);
    }
}

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

function drawTooltip(txt) {
    push();
    textSize(CONFIG.chartTooltipTextSize);
    let w = textWidth(txt) + 20;
    let h = 34;

    fill(255);
    stroke(CONFIG.colors.chartAvailable);
    rect(mouseX + 15, mouseY - 10, w, h, 6);

    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    text(txt, mouseX + 25, mouseY + 8);
    pop();
}

function drawChartPlaceholder() {
    let cx = width * CONFIG.chartXPercent;
    let cy = height * CONFIG.chartYPercent;
    
    push();
    fill(240);
    noStroke();
    rectMode(CENTER);
    rect(cx, cy, CONFIG.chartSize + 40, CONFIG.chartSize + 40, 12);
    pop();

    push();
    textAlign(CENTER, CENTER);
    fill(0);
    textSize(16);
    text("Impact chart\nnot available", cx, cy);
    pop();
}

// ===== ANIMAZIONI =====
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

// ===== FUNZIONI PER NAVBAR, BOTTONI, ETC. (RIMANGONO INVARIATE) =====

function drawTitle() {
    textSize(72);
    textFont('Helvetica');
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    
    const titleY = 95 - 20;
    
    fill(CONFIG.colors.text);
    text('ABOUT THE', CONFIG.layout.marginX, titleY);

    fill(CONFIG.colors.accent);
    text('DETAIL VIEW', CONFIG.layout.marginX, titleY + 75);
    
    textStyle(NORMAL);
}

// 6a - Navbar per la pagina learn more (COPIA ESATTA DA P5)
// 14 - Navbar per la pagina learn more - MODIFICATA SENZA SFONDO BIANCO
function drawNavBar() {
    push();
    
    // navbar fissa in alto - SENZA SFONDO BIANCO
    let navHeight = 60;
    let navY = 0;
    
    // NESSUNO sfondo navbar (rimuovi il rettangolo bianco)
    // fill(255); <- RIMOSSO
    // noStroke(); <- RIMOSSO
    // rect(0, navY, width, navHeight); <- RIMOSSO
    
    // AGGIUNGI: calcola se il mouse è sopra "Back"
    let isOverNavBack = false;
    
    // Testo Back - BIANCO di default, NERO su hover
    fill(CONFIG.colors.accent); // Bianco
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
    
    // Controlla se il mouse è sopra "Back"
    if (mouseX > backX && mouseX < backX + backWidth && 
        mouseY > backTextY && mouseY < backTextY + backHeight) {
        isOverNavBack = true;
        fill(CONFIG.colors.text); // Nero su hover
    }
    
    text(backText, backX, backY);
    
    // Memorizza l'area per l'interazione
    state.navBackArea = {
        x: backX,
        y: backTextY,
        width: backWidth,
        height: backHeight
    };
    
    // LOGO RIMOSSO - non serve più la scritta "Significant Volcanic Eruptions"
    // let logoText = "Significant Volcanic Eruptions"; <- RIMOSSO
    // fill(0); <- RIMOSSO
    // textSize(15); <- RIMOSSO
    // textStyle(BOLD); <- RIMOSSO
    // textAlign(LEFT, CENTER); <- RIMOSSO
    // text(logoText, 200, navHeight/2); <- RIMOSSO
    
    // area logo per click - RIMOSSO
    // let logoWidth = textWidth(logoText); <- RIMOSSO
    // state.logoArea = { <- RIMOSSO
    //     x: 200 - 11,  <- RIMOSSO
    //     y: navY, <- RIMOSSO
    //     width: logoWidth + 20, <- RIMOSSO
    //     height: navHeight <- RIMOSSO
    // }; <- RIMOSSO
    
    // link - modificati i colori
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
    
    for (let link of navLinks) {
        link.width = textWidth(link.name);
        totalLinksWidth += link.width;
    }
    totalLinksWidth += (navLinks.length - 1) * linkSpacing;
    
    // posizione link
    let startX = width - totalLinksWidth - 40;
    let currentX = startX;
    
    for (let i = 0; i < navLinks.length; i++) {
        let link = navLinks[i];
        link.x = currentX;
        link.y = navHeight/2;
        
        // Colori di default
        if (link.isExplore) {
            fill(CONFIG.colors.accent); // Explore BIANCO di default
            textStyle(BOLD);
        } else {
            fill(CONFIG.colors.text); // Homepage, Team, Methodology NERE di default
            textStyle(NORMAL);
        }
        
        text(link.name, link.x, link.y);
        
        // hover
        let textW = link.width;
        let textH = 20;
        let textX = link.x;
        let textY = link.y - textH/2;
        
        if (mouseX > textX && mouseX < textX + textW && 
            mouseY > textY && mouseY < textY + textH) {
            
            if (link.isExplore) {
                // Explore: su hover diventa NERO
                fill(CONFIG.colors.text); // Nero
            } else {
                // Homepage, Team, Methodology: su hover diventano BIANCHE
                fill(CONFIG.colors.accent); // Bianco
            }
            
            text(link.name, link.x, link.y);
        }
        
        currentX += link.width + linkSpacing;
    }
    state.navLinks = navLinks;

    // Aggiungi linea sotto la navbar - BIANCA invece che rossa
    stroke(CONFIG.colors.accent); // Bianco
    strokeWeight(1);
    line(0, navHeight-5, width, navHeight-5); // Spostata leggermente più in alto (-5)
    
    pop();
}

// 6 - Back Button - MODIFICATO PER ESSERE IDENTICO AL CODICE 1
function drawBackButton() {
    const buttonWidth = 160;
    const buttonHeight = 40;
    
    // POSIZIONE IDENTICA A sketch_detail.js (senza sovrapposizione mappa)
    const buttonY = height - 80;  // 80px sopra il bordo inferiore
    const buttonX = width - buttonWidth - 50;   // 50px dal bordo destro
    
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
    const buttonWidth = 200;
    const buttonHeight = 40;
    
    // POSIZIONE: a sinistra, stessa altezza del back button
    const buttonX = 50;
    const buttonY = CONFIG.layout.startButtonY; // ← Usa la stessa Y del back button
    
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
    applyResponsiveScaling();
    resizeCanvas(windowWidth, windowHeight);
    
    if (typeof redraw === 'function') {
        redraw();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (typeof setup === 'function' && !state.initialized) {
            initializeData();
            if (typeof redraw === 'function') {
                redraw();
            }
        }
    }, 100);
});

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