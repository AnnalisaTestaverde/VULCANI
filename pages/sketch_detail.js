// ---------- VARIABILI CONFIGURABILI ----------
let chartXPercent = 0.7;      // posizione X (percentuale della larghezza, 0..1)
let chartYPercent = 0.5;      // posizione Y (percentuale dell'altezza, 0..1)
let chartSize = 600;           // dimensione totale del grafico (diametro suggerito)
let chartLevels = 4;           // livelli (max barre concentriche) - CAMBIATO DA 5 A 4
let chartMainColor = "#ff2b00";// colore principale delle barre
let chartOverlayAlpha = 200;   // alpha overlay scuro (0..255)
let chartGapAngleDeg = 10;     // gap tra spicchi (gradi)
let chartGapRadial = 5;        // spazio tra anelli
let chartTitleSize = 28;       // dimensione testo titolo centro
let mainTextSize = 17;
let chartLabelSize = 14;       // dimensione label esterne
let chartTooltipTextSize = 17; // dimensione tooltip
const INFLATION_FACTOR = 2.4;

// ---------- VARIABILI GLOBALI ----------
let data;
let eruptions = [];
let selectedName;
let selectedYear = 0;
let selectedNumber = 0;
let currentIndex = 0;

// Dopo le variabili globali
let state = {
  learnMoreButtonArea: null,
  homeButtonArea: null
};

// Variabili per animazione
let animationStartTime = 0;
let animationDuration = 1000; // Durata animazione in millisecondi
let isAnimating = false;
let previousSelectedNumber = null;
let initialAnimationStarted = false; // Nuova variabile per l'animazione iniziale

// immagini vulcano
let stratoImg, calderaImg, complexImg, cinderImg, compoundImg, craterImg, fissureImg;
let lava_coneImg, lava_domeImg, maarImg, pumiceImg, pyroclastic_coneImg, pyroclastic_shieldImg;
let shieldImg, subglacialImg, submarineImg, tuffImg, volcanic_fieldImg;

// immagine mappa
let worldMap;

// icoona libro
let bookIcon;
let homeIcon; // Aggiunta icona per Home

// ---------- PRELOAD ----------
function preload() {
  // CSV e mappa
  data = loadTable("../assets/data_impatto.csv", "csv", "header");
  worldMap = loadImage("../assets/Equirectangular_projection.jpg");

  // preload illustrazioni (stesso set che avevi)
  stratoImg = loadImage("../assets/stratovolcano.png");
  calderaImg = loadImage("../assets/caldera.png");
  complexImg = loadImage("../assets/complex_volcano.png");
  cinderImg = loadImage("../assets/cinder_cone.png");
  compoundImg = loadImage("../assets/compound_volcano.png");
  craterImg = loadImage("../assets/crater_rows.png");
  fissureImg = loadImage("../assets/fissure_vent.png");
  lava_coneImg = loadImage("../assets/lava_cone.png");
  lava_domeImg = loadImage("../assets/lava_dome.png");
  maarImg = loadImage("../assets/maar.png");
  pumiceImg = loadImage("../assets/pumice_cone.png");
  pyroclastic_coneImg = loadImage("../assets/pyroclastic_cone.png");
  pyroclastic_shieldImg = loadImage("../assets/pyroclastic_shield.png");
  shieldImg = loadImage("../assets/shield_volcano.png");
  subglacialImg = loadImage("../assets/subglacial_volcano.png");
  submarineImg = loadImage("../assets/submarine.png");
  tuffImg = loadImage("../assets/tuff_cone.png");
  volcanic_fieldImg = loadImage("../assets/volcanic_field.png");

  bookIcon = loadImage("../assets/book_icon.png");
  homeIcon = loadImage("../assets/home_icon.png"); 
}

// Funzione per convertire i danni da dollari 1990 a dollari 2026
function convertTo2026Dollars(damageValue) {
  if (!damageValue || damageValue === 0 || isNaN(damageValue)) {
    return 0;
  }
  return damageValue * INFLATION_FACTOR;
}

// Funzione per formattare i valori monetari in modo leggibile
function formatDamageValue(damageValue) {
  if (damageValue === undefined || damageValue === null || damageValue === 0 || isNaN(damageValue)) {
    return "Details not available";
  }
  
  // Converti sempre a dollari 2026
  let value = convertTo2026Dollars(damageValue);
  
  // Mostra solo "2026 dollars" senza menzionare il 1990
  if (value < 1) {
    return `Less than $1 million (2026 dollars)`;
  } else if (value < 1000) {
    return `$${Math.round(value * 10) / 10} million (2026 dollars)`;
  } else {
    return `$${(value / 1000).toFixed(1)} billion (2026 dollars)`;
  }
}

// ---------- SETUP ----------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Helvetica");

  // legge parametri ed assegna a variabili
  selectedName = getQueryParam("name");
  selectedYear = int(getQueryParam("year"));
  selectedNumber = int(getQueryParam("number"));

  if (!selectedName) return;

  // nella funzione setup(), dopo aver letto i parametri
  if (!selectedName) return;

  // PRE-PROCESSAMENTO: Converti tutte le coordinate una volta sola
  window.allCoordinates = {};

  for (let i = 0; i < data.getRowCount(); i++) {
    let name = data.getString(i, "Name");
    let country = data.getString(i, "Country");
    let latStr = data.getString(i, "Latitude");
    let lonStr = data.getString(i, "Longitude");
    let number = data.getString(i, "Number");
    
    // Crea una chiave unica
    let key = `${name}_${number || i}`;
    
    // Converti coordinate
    window.allCoordinates[key] = getUniversalCoordinates(latStr, lonStr, name, country);
  }

  console.log(`Coordinate pre-processate: ${Object.keys(window.allCoordinates).length}`);

  // popola eruptions[] filtrando per Name con coordinate corrette
  for (let i = 0; i < data.getRowCount(); i++) {
    if (data.getString(i, "Name") === selectedName) {
      let number = data.getString(i, "Number");
      let key = `${selectedName}_${number || i}`;
      
      // Ottieni coordinate pre-processate
      let coords = window.allCoordinates[key] || { lat: 0, lon: -30 };
      
      eruptions.push({
        year: int(data.getString(i, "Year")),
        mo: data.getString(i, "Mo"),
        dy: data.getString(i, "Dy"),
        country: data.getString(i, "Country"), 
        type: data.getString(i, "Type") || "Unknown",
        deaths: data.getString(i, "Deaths") || "Not Available",
        number: int(data.getString(i, "Number")),
        lat: coords.lat,  // Coordinate corrette!
        lon: coords.lon,  // Coordinate corrette!
      });
    }
  }

  // ordina per anno
  eruptions.sort((a, b) => a.year - b.year);

  // sincronizza currentIndex con Number o Year
  if (!isNaN(selectedNumber) && selectedNumber > 0) {
    const idxByNumber = eruptions.findIndex(e => e.number === selectedNumber);
    if (idxByNumber !== -1) currentIndex = idxByNumber;
  } else if (!isNaN(selectedYear) && selectedYear > 0) {
    const idxByYear = eruptions.findIndex(e => e.year === selectedYear);
    if (idxByYear !== -1) {
      currentIndex = idxByYear;
      selectedNumber = eruptions[currentIndex].number;
    }
  }

  // fallback (primo elemento)
  if (eruptions.length > 0 && currentIndex === 0) {
    selectedYear = eruptions[0].year;
    selectedNumber = eruptions[0].number;
  }
  
  // Avvia l'animazione iniziale
  startAnimation();
  initialAnimationStarted = true;
}

// ---------- DRAW ----------
function draw() {
  background("#FFFFFF");

  /* fallback nel caso in cui 
  NON ci sia alcun vulcano selezionato */
  if (eruptions.length === 0) {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text("Nessun vulcano selezionato", 50, 50);
    drawBackButton();
    return;
  }

  // recupera elemento nell'array e salva in selected
  let selected = eruptions[currentIndex];

  // 1. aggiunge illustrazione di sfondo
  drawVolcanoTypeBackground(selected.type);

  // 2. aggiunge mappa per sez. location (Passiamo il Country!)
  drawMap(selected.lat, selected.lon, selected.country);

  // 3. aggiunge Back button
  drawBackButton();

  // 4. AGGIUNGI IL PULSANTE LEARN MORE E HOME
  drawLearnMoreButton();

  // 5. aggiunge testo (titolo etc.)
  writeText();

  // 6. aggiunge elementi per navigazione negli anni 
  drawYearNavigator(selected.year);

  // 7. aggiunge la descrizione (Passiamo data completa!)
  drawVolcanoDescription(selected.type, selected.year, selected.mo, selected.dy);

  // 8. DRAW IMPACT CHART
  let dataRowIndex = findDataRowIndex(selectedName, selectedNumber);
  if (dataRowIndex !== -1) {
    let chartDatum = buildChartDataFromRow(dataRowIndex);
    drawImpactChart(chartDatum);
  } else {
    drawChartPlaceholder();
  }

  // 9. AGGIORNA IL CURSORE (manina per i pulsanti)
  updateCursor();
}

// ---------- FUNZIONI UTILI ----------

// restituisce il valore del parametro x presente nell'URL
function getQueryParam(param) {
  let urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/* FORMATTAZIONE ANNO - 
funzione per formattare l'anno con AD/BC */
function formatYear(year) {
  if (year < 0) {
    return Math.abs(year) + " BC";
  } else {
    return Math.abs(year) + " AD";
  }
}

/* NORMALIZZAZIONE TESTO */
function normalizeType(typeStr) {
  if (!typeStr) return "";
  return typeStr.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,;]/g, '');
}

/* RESTITUZIONE DESCRIZIONE */
function getVolcanoDescription(type) {
  let normalizedType = normalizeType(type);
  // ... (stesse descrizioni di prima)
  if (normalizedType.includes("caldera")) {
    return "Large, roughly circular depression formed when a volcano's magma chamber is emptied by eruption or subsurface magma movement, causing the overlying rock roof to collapse.";
  }
  else if (normalizedType.includes("cinder cone") || normalizedType.includes("cinder")) {
    return "Smallest and most common type of volcano, built from accumulation of pyroclastic fragments (cinders, ash, scoria) ejected from a single vent.";
  }
  else if (normalizedType.includes("complex volcano") || normalizedType.includes("complex")) {
    return "Mixed volcanic landform consisting of related volcanic centers with associated lava flows and pyroclastic deposits.";
  }
  else if (normalizedType.includes("crater rows") || normalizedType.includes("crater")) {
    return "Linear alignments of small volcanic cones and craters that form along active fissures, typically composed of spatter and cinder cones.";
  }
  else if (normalizedType.includes("fissure vent") || normalizedType.includes("fissure")) {
    return "Linear volcanic opening through which lava erupts, typically with little explosive activity.";
  }
  else if (normalizedType.includes("lava cone")) {
    return "Small, steep-sided cone built from welded fragments of molten lava called spatter, which adhere together upon impact near a volcanic vent.";
  }
  else if (normalizedType.includes("lava dome")) {
    return "Circular, mound-shaped volcanic protrusion formed by slow extrusion of highly viscous, silica-rich lava that accumulates around the vent.";
  }
  else if (normalizedType.includes("maar")) {
    return "Broad, low-relief volcanic crater formed by phreatomagmatic eruptions when groundwater comes into contact with hot magma.";
  }
  else if (normalizedType.includes("pumice cone") || normalizedType.includes("pumice")) {
    return "Volcanic cone built from accumulation of lapilli-to-block-sized pumice deposits ejected from moderate-intensity explosive eruptions.";
  }
  else if (normalizedType.includes("pyroclastic cone") || normalizedType.includes("pyroclastic")) {
    return "General term for volcanic cones constructed from accumulation of explosively ejected fragmental material around a vent.";
  }
  else if (normalizedType.includes("pyroclastic shield")) {
    return "Uncommon type of shield volcano formed primarily from pyroclastic and highly explosive eruptions rather than fluid lava flows.";
  }
  else if (normalizedType.includes("shield volcano") || normalizedType.includes("shield")) {
    return "Large volcano with low, gently sloping profile (typically 2–10 degrees), formed by eruption of highly fluid, low-viscosity basaltic lava.";
  }
  else if (normalizedType.includes("stratovolcano") || normalizedType.includes("strato")) {
    return "Tall, conical volcano built from many alternating layers of hardened lava, ash, and pyroclastic material deposited during successive eruptions.";
  }
  else if (normalizedType.includes("subglacial volcano") || normalizedType.includes("subglacial")) {
    return "Volcanic landform produced by eruptions beneath glaciers or ice sheets, where magma melts overlying ice and rapidly cools lava.";
  }
  else if (normalizedType.includes("submarine volcano") || normalizedType.includes("submarine")) {
    return "Volcanic eruption occurring beneath the ocean surface, more prevalent than subaerial volcanism.";
  }
  else if (normalizedType.includes("tuff cone") || normalizedType.includes("tuff")) {
    return "Pyroclastic cone composed primarily of consolidated volcanic ash (tuff) formed through phreatomagmatic eruptions.";
  }
  else if (normalizedType.includes("volcanic field") || normalizedType.includes("volcanic")) {
    return "Geographic area containing clusters of up to 100 or more volcanoes, typically 30–80 kilometers in diameter.";
  }
  else if (normalizedType.includes("compound")) {
    return "Compound volcano - a volcanic center that has experienced multiple eruptions from different vents.";
  }
  else {
    return "Volcanic formation with unique geological characteristics.";
  }
}

/* ILLUSTRAZIONE TIPOLOGIA - sfondo */
function drawVolcanoTypeBackground(typeRaw) {
  let type = normalizeType(typeRaw);

  push();
  translate(width * 0.5, height / 2);
  imageMode(CENTER);

  // riduzione opacità!
  tint(255, 50);

  let imgWidth = min(1100, width * 0.95);
  let imgHeight = imgWidth * (750/1000);

  // cambio immagine a seconda della tipologia di vulcano
  switch(true) {
    case type.includes("stratovolcano"):
      image(stratoImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("caldera"):
      image(calderaImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("cinder"):
      image(cinderImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("shield"):
      image(shieldImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("complex"):
      image(complexImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("compound"):
      image(compoundImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("fissure"):
      image(fissureImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("lava cone"):
      image(lava_coneImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("lava dome"):
      image(lava_domeImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("maar"):
      image(maarImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("pumice"):
      image(pumiceImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("pyroclastic cone"):
      image(pyroclastic_coneImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("pyroclastic shield"):
      image(pyroclastic_shieldImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("subglacial"):
      image(subglacialImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("submarine"):
      image(submarineImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("tuff"):
      image(tuffImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("volcanic"):
      image(volcanic_fieldImg, 0, 0, imgWidth, imgHeight);
      break;
    case type.includes("crater"):
      image(craterImg, 0, 0, imgWidth, imgHeight);
      break;
  }

  tint(255, 255);
  pop();
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function getMonthName(mo) {
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];
  let m = int(mo);
  return (m >= 1 && m <= 12) ? months[m - 1] : "???";
}

// ---------- DESCRIZIONE ----------
function drawVolcanoDescription(typeRaw, y, mo, dy) {
  let margin = 60;
  
  // Spostiamo tutto leggermente in giù per far spazio alla data
  let dateY = 340; 
  let titleY = 365; 
  let descriptionY = 410;

  // INIZIO: il testo è allineato al punto d'inizio della mappa
  let mapW = 320;
  // LARGHEZZA: il testo va a capo quando raggiunge il bordo della mappa
  let textWidthValue = mapW;

  // --- DATA COMPLETA (estesa) ---
  let dayAvailable = (dy && dy !== "0" && dy !== "");
  let monthAvailable = (mo && mo !== "0" && mo !== "");

  let dayText = dayAvailable ? dy + getOrdinalSuffix(int(dy)) : "??";
  let monthText = monthAvailable ? getMonthName(mo) : "???";

  // Anno con BC
  let yearText = (y < 0) ? Math.abs(y) + " BC" : y.toString();

  let fullDate = `${dayText} ${monthText} ${yearText}`;


  push();
  fill(chartMainColor);
  textSize(mainTextSize);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  push();
  textSize(mainTextSize);
  textAlign(LEFT, TOP);
  textStyle(BOLD);

  // Label rossa
  fill(chartMainColor);
  text("Date: ", margin, dateY);

  // Valore nero
  fill(0);
  text(fullDate, margin + textWidth("Date: "), dateY);
  pop();

  pop();

  // --- TITOLO TIPO VULCANO ---
  push();
  fill(245, 40, 0);
  textSize(mainTextSize);
  textAlign(LEFT, TOP);
  text(typeRaw, margin, titleY+20);
  pop();

  // --- DESCRIZIONE ---
  let description = getVolcanoDescription(typeRaw);
  push();
  fill(0);
  textSize(mainTextSize);
  textStyle(BOLD);
  textLeading(20);
  textAlign(LEFT, TOP);
  text(description, margin, descriptionY, textWidthValue);
  pop();
}

/* AGGIUNTA TITOLO */
function writeText() {
  let margin = 60;

  // TESTO: prima riga - "THE IMPACT OF"
  fill(0);
  textAlign(LEFT, TOP);
  textSize(48);
  textStyle(BOLD);
  let y1 = 75;
  text("THE IMPACT OF ", margin, y1);

  // TESTO: seconda riga - nome del vulcano in rosso
  fill(245, 40, 0);
  let volcanoName = selectedName ? selectedName.toUpperCase() : "UNKNOWN";
  let y2 = y1 + 55;
  text(volcanoName, margin, y2);

  // TESTO: "IN" in nero sulla stessa riga
  fill(0);
  text(" IN", margin + textWidth(volcanoName), y2);
}

// =============================================
// FUNZIONI DI CORREZIONE COORDINATE
// =============================================

// Funzione per convertire coordinate nel formato strano del CSV
function fixAllCoordinates(coordStr, isLatitude = true) {
  if (!coordStr || coordStr === "" || coordStr === "0") {
    return isLatitude ? 0 : -30;
  }
  
  let str = coordStr.toString().trim();
  
  // Se è già un numero decimale valido
  if (!isNaN(parseFloat(str)) && str.indexOf(' ') === -1) {
    let dotCount = (str.match(/\./g) || []).length;
    
    if (dotCount <= 1) {
      let num = parseFloat(str);
      
      // Controllo di sanità
      if (isLatitude && Math.abs(num) > 90) {
        return fixDMS(str, isLatitude);
      }
      if (!isLatitude && Math.abs(num) > 180) {
        return fixDMS(str, isLatitude);
      }
      
      return num;
    }
  }
  
  return fixDMS(str, isLatitude);
}

// Funzione per correggere formato DMS (gradi.minuti.secondi)
function fixDMS(str, isLatitude) {
  let parts = str.split('.');
  parts = parts.filter(p => p !== "");
  
  if (parts.length === 0) {
    return isLatitude ? 0 : -30;
  }
  
  let isNegative = false;
  if (parts[0].startsWith('-')) {
    isNegative = true;
    parts[0] = parts[0].substring(1);
  }
  
  // Formato "gradi.minuti.secondi" (3+ parti)
  if (parts.length >= 3) {
    let degrees = parseFloat(parts[0]) || 0;
    let minutes = parseFloat(parts[1]) || 0;
    let seconds = parseFloat(parts[2]) || 0;
    
    let decimal = degrees + minutes/60 + seconds/3600;
    decimal = isNegative ? -decimal : decimal;
    
    return decimal;
  }
  
  // Formato "gradi.minuti" (2 parti)
  if (parts.length === 2) {
    let degrees = parseFloat(parts[0]) || 0;
    let minutes = parseFloat(parts[1]) || 0;
    
    // Se minuti > 59, probabilmente non sono minuti ma parte decimale
    if (minutes >= 60) {
      let combined = parseFloat(parts[0] + "." + parts[1]);
      return isNegative ? -combined : combined;
    }
    
    let decimal = degrees + minutes/60;
    decimal = isNegative ? -decimal : decimal;
    
    return decimal;
  }
  
  // Solo gradi (1 parte)
  if (parts.length === 1) {
    let num = parseFloat(parts[0]) || 0;
    
    // Controllo per valori impossibili
    if (isLatitude && Math.abs(num) > 90) {
      // Forse è un errore: "367" potrebbe essere "36.7"
      if (num > 90 && num < 1000) {
        let strNum = parts[0];
        if (strNum.length === 3) {
          num = parseFloat(strNum.substring(0, 2) + "." + strNum.substring(2));
        }
      }
    }
    
    return isNegative ? -num : num;
  }
  
  return isLatitude ? 0 : -30;
}

// Funzione che applica correzioni automatiche basate sul paese
function applyKnownFixes(name, lat, lon, country) {
  // Correzione per Italia (coordinate sballate nel dataset)
  if (country && country.includes("Italy")) {
    if (lat > 47 && lat < 60) {
      lat = lat - 12;
      lon = lon - 7;
    }
  }
  
  // Correzione per Islanda
  if (country && country.includes("Iceland")) {
    if (lat > 70) {
      lat = lat - 15;
    }
  }
  
  // Correzione per Giappone - Fujisan
  if (country && country.includes("Japan")) {
    if (name === "Fujisan" && lat > 40) {
      lat = 35.36;
      lon = 138.73;
    }
  }
  
  return { lat: lat, lon: lon };
}

// Funzione principale per ottenere coordinate corrette
function getUniversalCoordinates(latStr, lonStr, name = "", country = "") {
  // Step 1: Converti le coordinate grezze
  let lat = fixAllCoordinates(latStr, true);
  let lon = fixAllCoordinates(lonStr, false);
  
  // Step 2: Applica correzioni per errori sistematici
  let fixed = applyKnownFixes(name, lat, lon, country);
  
  // Step 3: Normalizza ai range geografici validi
  if (fixed.lat > 90) fixed.lat = 90;
  if (fixed.lat < -90) fixed.lat = -90;
  
  // Longitudine: -180 a 180
  while (fixed.lon > 180) fixed.lon -= 360;
  while (fixed.lon < -180) fixed.lon += 360;
  
  return fixed;
}

/* MAPPA CON CORREZIONE RESPONSIVE DEL MARKER */
function drawMap(lat, lon, country) {
  let margin = 60;
  let mapW = 320;
  let mapH = 180;
  let mapX = margin;
  let mapY = height - mapH - margin;
  let cornerRadius = 10;

  // Titolo
  let titleY = mapY - 30;
  push();
  fill(245, 40, 0);
  textSize(mainTextSize);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  
  let label = "Location: ";
  let value = country && country.trim() !== "" ? country : "Unknown";

  push();
  textSize(mainTextSize);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  // Label rossa
  fill(chartMainColor);
  text(label, mapX, titleY);

  // Valore nero
  fill(0);
  text(value, mapX + textWidth(label), titleY);
  pop();

  pop();

  // Cornice e sfondo
  push();
  fill(255, 230);
  noStroke();
  rect(mapX - 5, mapY - 5, mapW + 10, mapH + 10, cornerRadius + 2);
  pop();

  push();
  stroke(245, 40, 0);
  strokeWeight(1);
  noFill();
  rect(mapX, mapY, mapW, mapH, cornerRadius);
  pop();

  // Immagine mappa
  let innerX = mapX + 2;
  let innerY = mapY + 2;
  let innerW = mapW - 4;
  let innerH = mapH - 4;

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.roundRect(innerX, innerY, innerW, innerH, cornerRadius - 2);
  drawingContext.clip();
  
  image(worldMap, innerX, innerY, innerW, innerH);
  
  drawingContext.restore();
  pop();

  // Indicatore posizione
  if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
    // Normalizza la longitudine se necessario
    let lonAdjusted = lon;
    while (lonAdjusted > 180) lonAdjusted -= 360;
    while (lonAdjusted < -180) lonAdjusted += 360;
    
    // Calcola la posizione X (longitudine)
    let markerX = map(lonAdjusted, -180, 180, innerX, innerX + innerW);
    
    // Calcola la posizione Y (latitudine)
    let latAdjusted = constrain(lat, -90, 90);
    let markerY = map(latAdjusted, 90, -90, innerY, innerY + innerH);
    
    // CORREZIONE RESPONSIVE: usa percentuale della mappa invece di mm fissi
    // 1.8% della larghezza della mappa (circa 5-6 pixel su schermi normali)
    let offsetPercent = -0.018;
    let offsetPixels = offsetPercent * innerW;
    
    markerX += offsetPixels;
    
    // Disegna l'indicatore RESPONSIVE
    drawResponsiveLocationMarker(markerX, markerY);
  }
}

/* FUNZIONE PER DISEGNARE INDICATORE RESPONSIVE */
function drawResponsiveLocationMarker(x, y) {
  push();
  noStroke();
  
  // DIMENSIONI RESPONSIVE basate sulla larghezza dello schermo
  // Usa come riferimento uno schermo di 1920px (Full HD)
  let scaleFactor = width / 1920;
  // Limita il fattore di scala tra 0.7 e 1.5 per evitare dimensioni estreme
  scaleFactor = constrain(scaleFactor, 0.7, 1.5);
  
  // Dimensioni base (per schermo 1920px)
  let baseSize = 30 * scaleFactor;
  
  // Glow esterno (3 livelli)
  for (let i = 0; i < 3; i++) {
    let size = baseSize * (1 + i * 0.3); // Cresce del 30% ogni livello
    let alpha = map(i, 0, 2, 25, 8);
    fill(255, 100, 0, alpha);
    ellipse(x, y, size, size);
  }
  
  // Cerchio intermedio
  strokeWeight(max(1, baseSize * 0.07));
  stroke(255, 50, 0);
  noFill();
  ellipse(x, y, baseSize * 0.6, baseSize * 0.6);
  
  // Punto centrale
  noStroke();
  fill(255, 0, 0);
  ellipse(x, y, baseSize * 0.4, baseSize * 0.4);
  
  // Nucleo brillante
  fill(255, 255, 200);
  ellipse(x, y, baseSize * 0.2, baseSize * 0.2);
  
  pop();
}

/* BACK BUTTON */
function drawBackButton() {
  push();
  
  // Imposta il bordo nero
  stroke(0);
  strokeWeight(1);
  noFill();
  
  // Calcola le dimensioni del testo
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  let textW = textWidth("<   BACK");
  let textH = 15; // Altezza approssimativa del testo
  
  // Definisci il padding (spaziatura interna)
  let paddingX = 12;
  let paddingY = 8;
  
  // Calcola la posizione e dimensione del rettangolo
  // Il rettangolo deve essere centrato attorno al testo
  let rectX = 67 - paddingX/2;
  let rectY = 25 - paddingY/2;
  let rectW = textW + paddingX;
  let rectH = textH + paddingY;
  
  // Disegna il rettangolo con angoli leggermente arrotondati
  rect(rectX, rectY, rectW, rectH, 6);
  
  // Disegna il testo
  noStroke();
  fill(0);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("<   BACK", 67, 25);
  
  pop();
}

/* NAVIGATORE ANNI */
function drawYearNavigator(year) {

  let hasMultipleEruptions = eruptions.length > 1;
  let activeColor = color(chartMainColor);
  let inactiveColor = color(180);
  let arrowColor = hasMultipleEruptions ? activeColor : inactiveColor;


  let margin = 82;
  let y = 230;
  let navigatorX = margin;

  textSize(48);
  let leftArrowWidth = textWidth("<");
  
  // Calcolo larghezza anno corrente per posizionamento
  textSize(72);
  let yearFormatted = formatYear(year);
  let yearWidth = textWidth(yearFormatted);
  
  textSize(48);
  let rightArrowWidth = textWidth(">");

  // altezza e padding cornice
  let spaceBetween = 40;
  let framePadding = 20;
  let frameHeight = 50;

  textAlign(LEFT, CENTER);
  fill(0);

  // FRECCIA SINISTRA / DIM.
  let leftArrowX = navigatorX;
  let leftFrameX = leftArrowX - framePadding;
  let leftFrameY = y - frameHeight/2;

  // FRECCIA SINISTRA: cornice
  push();
  stroke(arrowColor);
  strokeWeight(1);
  noFill();
  rect(leftFrameX, leftFrameY, leftArrowWidth + framePadding*2, frameHeight, 10);
  pop();

  // FRECCIA SINISTRA: disegno "<"
  push();
  fill(arrowColor);
  textSize(48);
  textStyle(NORMAL);
  text("<", leftArrowX, y);
  pop();



  // TESTO: anno
  push();
  fill(245, 40, 0);
  textSize(72);
  let yearX = leftArrowX + leftArrowWidth + spaceBetween;
  text(yearFormatted, yearX, y);
  
  let rightArrowX = yearX + yearWidth + spaceBetween;
  pop();

  // FRECCIA DESTRA / DIM.
  let rightFrameX = rightArrowX - framePadding;
  let rightFrameY = y - frameHeight/2;

  // FRECCIA DESTRA: cornice
  push();
  stroke(arrowColor);
  strokeWeight(1);
  noFill();
  rect(rightFrameX, rightFrameY, rightArrowWidth + framePadding*2, frameHeight, 10);
  pop();

  // FRECCIA DESTRA: disegno ">"
  push();
  fill(arrowColor);
  textSize(48);
  textStyle(NORMAL);
  text(">", rightArrowX, y);
  pop();


  // ---- COUNTER ------
  if (eruptions.length > 0) {
    push();
    noStroke();
    fill(chartMainColor);
    textSize(mainTextSize);
    textAlign(LEFT); 
    
    let counterY = y + 75;
    
    let counterText = (currentIndex + 1) + " / " + eruptions.length;
    
    let label = "Eruption count: ";
    let value = counterText;

    push();
    textSize(mainTextSize);
    textAlign(LEFT);

    // Label rossa
    fill(chartMainColor);
    text(label, margin - 22, counterY);

    // Valore nero (subito dopo la label)
    fill(0);
    text(value, margin - 22 + textWidth(label), counterY);
    pop();

    pop();
  }
}

/* INTERAZIONI (mousePressed) - mantiene la navigazione e back */
function mousePressed() {
  // BACK BUTTON
  if (mouseX > 15 && mouseX < 105 && mouseY > 15 && mouseY < 45) {
    window.location.href = "overview.html";
    return;
  }

  // HOME BUTTON
  if (state.homeButtonArea &&
      mouseX > state.homeButtonArea.x &&
      mouseX < state.homeButtonArea.x + state.homeButtonArea.width &&
      mouseY > state.homeButtonArea.y &&
      mouseY < state.homeButtonArea.y + state.homeButtonArea.height) {
    
    window.location.href = "../index.html";
    return;
  }

  // LEARN MORE BUTTON
  if (state.learnMoreButtonArea &&
      mouseX > state.learnMoreButtonArea.x &&
      mouseX < state.learnMoreButtonArea.x + state.learnMoreButtonArea.width &&
      mouseY > state.learnMoreButtonArea.y &&
      mouseY < state.learnMoreButtonArea.y + state.learnMoreButtonArea.height) {
    
    window.open("learn_more_detail.html", "_blank");
    return;
  }

  // Se c'è una sola eruzione, disabilita la navigazione
  if (eruptions.length <= 1) {
    return;
  }


  // NAV. ANNI / DIM: calcolo posizione (AGGIORNATO con i nuovi valori)
  let margin = 82; // Aggiornato da 60 a 82 (come in drawYearNavigator)
  let y = 230;
  let navigatorX = margin;

  // sinistra
  textSize(48);
  let leftArrowWidth = textWidth("<");
  let framePadding = 20; // Aggiornato da 15 a 20 (come in drawYearNavigator)
  let frameHeight = 50; // Aggiornato da 70 a 50 (come in drawYearNavigator)
  let leftArrowX = navigatorX;
  let leftFrameX = leftArrowX - framePadding;
  let leftFrameY = y - frameHeight/2;

  // centro
  textSize(72);
  let yearFormatted = formatYear(selectedYear);
  let yearWidth = textWidth(yearFormatted);
  let yearX = leftArrowX + leftArrowWidth + 40;

  // destra
  textSize(48);
  let rightArrowWidth = textWidth(">");
  let rightArrowX = yearX + yearWidth + 40;
  let rightFrameX = rightArrowX - framePadding;
  let rightFrameY = y - frameHeight/2;

  // FRECCIA SINISTRA: cliccabilità (area cornice)
  if (mouseX > leftFrameX &&
      mouseX < leftFrameX + leftArrowWidth + framePadding*2 &&
      mouseY > leftFrameY &&
      mouseY < leftFrameY + frameHeight) {
    // Loop all'indietro
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      // Se siamo al primo elemento, vai all'ultimo
      currentIndex = eruptions.length - 1;
    }
    selectedYear = eruptions[currentIndex].year;
    selectedNumber = eruptions[currentIndex].number;
    
    // Avvia l'animazione
    startAnimation();
    return;
  }

  // FRECCIA DESTRA: cliccabilità (area cornice)
  if (mouseX > rightFrameX &&
      mouseX < rightFrameX + rightArrowWidth + framePadding*2 &&
      mouseY > rightFrameY &&
      mouseY < rightFrameY + frameHeight) {
    // MODIFICA QUI: crea il loop tornando all'indice 0 quando si è all'ultimo elemento
    if (currentIndex < eruptions.length - 1) {
      currentIndex++;
    } else {
      // Se siamo all'ultimo elemento, torna al primo
      currentIndex = 0;
    }
    selectedYear = eruptions[currentIndex].year;
    selectedNumber = eruptions[currentIndex].number;
    
    // Avvia l'animazione
    startAnimation();
    return;
  }
}

/* RESPONSIVENESS */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ---------- FUNZIONI GRAFICO D'IMPATTO ----------

/**
 * Cerca la riga CSV corrispondente a name + number.
 * Ritorna indice riga o -1 se non trovato.
 */
function findDataRowIndex(name, number) {
  for (let i = 0; i < data.getRowCount(); i++) {
    let n = data.getString(i, "Name");
    let num = data.getString(i, "Number");
    // confronto robusto
    if (n === name && String(number) === String(num)) {
      return i;
    }
  }
  return -1;
}

/**
 * Costruisce l'oggetto chartData dalla riga CSV (index)
 */
function buildChartDataFromRow(i) {
  // prende le stringhe raw per i tooltip/testo
  let strDeath = data.getString(i, "Deaths");
  let strInj = data.getString(i, "Injuries");
  let strDmg = data.getString(i, "Damage ($Mil)");
  let strHouse = data.getString(i, "Houses Destroyed");
  let strMissing = data.getString(i, "Missing");

  // parse dei valori
  let deathVal = Number(data.getString(i, "Death Description"));
  let injVal = Number(data.getString(i, "Injuries Description"));
  let dmgVal = Number(data.getString(i, "Damage Description"));
  let houseVal = Number(data.getString(i, "Houses Destroyed Description"));
  let missingVal = Number(data.getString(i, "Missing Description"));

  // prendi il valore "Impact" dal CSV
  let impactVal = Number(data.getString(i, "Impact"));

  // DEBUG: Controlla se ci sono dati
  console.log(`Row ${i}: dmgVal = ${dmgVal}, strDmg = "${strDmg}"`);

  // Calcola il valore convertito per i danni (SOLO PER GRAFICO)
  let dmgValForChart = 0;
  if (!isNaN(dmgVal) && dmgVal > 0) {
    dmgValForChart = constrain(Math.round(convertTo2026Dollars(dmgVal)), 0, chartLevels);
  }

  // normalizzazione: se NaN => 0
  deathVal = isNaN(deathVal) ? 0 : deathVal;
  injVal = isNaN(injVal) ? 0 : injVal;
  dmgVal = isNaN(dmgVal) ? 0 : dmgVal;
  houseVal = isNaN(houseVal) ? 0 : houseVal;
  missingVal = isNaN(missingVal) ? 0 : missingVal;
  impactVal = isNaN(impactVal) ? 0 : impactVal;

  // clamp fra 0 e chartLevels
  deathVal = constrain(Math.round(deathVal), 0, chartLevels);
  injVal = constrain(Math.round(injVal), 0, chartLevels);
  houseVal = constrain(Math.round(houseVal), 0, chartLevels);
  missingVal = constrain(Math.round(missingVal), 0, chartLevels);

  // Formatta i dati raw
  let formattedDamage = "Details not available";
  if (strDmg && strDmg.trim() !== "") {
    // Se c'è una stringa nel CSV, usala
    formattedDamage = strDmg;
  } else if (dmgVal > 0) {
    // Altrimenti formatta il valore numerico
    formattedDamage = formatDamageValue(dmgVal);
  }

  return {
    index: i,
    name: data.getString(i, "Name"),
    country: data.getString(i, "Country") || "",
    death: deathVal,
    inj: injVal,
    dmg: dmgValForChart, // Valore convertito per il grafico
    house: houseVal,
    missing: missingVal,
    impact: impactVal,
    rawDeath: (strDeath === "" ? "Details not available" : strDeath),
    rawInj: (strInj === "" ? "Details not available" : strInj),
    rawDmg: formattedDamage, // Usa il valore formattato
    rawHouse: (strHouse === "" ? "Details not available" : strHouse),
    rawMissing: (strMissing === "" ? "Details not available" : strMissing),
    originalDmgValue: dmgVal // Mantieni il valore originale per debug
  };
}

/**
 * Disegna un placeholder se la riga CSV non è trovata
 */
function drawChartPlaceholder() {
  let cx = width * chartXPercent;
  let cy = height * chartYPercent;
  push();
  fill(240);
  noStroke();
  rectMode(CENTER);
  rect(cx, cy, chartSize + 40, chartSize + 40, 12);
  pop();

  push();
  textAlign(CENTER, CENTER);
  fill(0);
  textSize(16);
  text("Impact chart\nnot available", cx, cy);
  pop();
}

function getDetailText(value, descCode, type, chartData = null) {
  // Se il valore numerico esiste, restituiamo quello
  if (value !== "" && value !== 0 && !isNaN(value)) {
    return value;
  }

  // Se non c'è valore, usiamo il codice descrizione
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
      1: "Limited (less than $1 million)",
      2: "Moderate (~$1 to $5 million)",
      3: "Severe (~$5 to $24 million)",
      4: "Extreme ($25 million or more)"
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

  return tables[type][code];
}

/**
 * Funzione per avviare l'animazione
 */
function startAnimation() {
  isAnimating = true;
  animationStartTime = millis();
}

/**
 * Funzione per calcolare il progresso dell'animazione (0-1)
 */
function getAnimationProgress() {
  if (!isAnimating) return 1.0;
  
  let elapsed = millis() - animationStartTime;
  let progress = constrain(elapsed / animationDuration, 0, 1);
  
  // Se l'animazione è completata, resetta lo stato
  if (progress >= 1.0) {
    isAnimating = false;
  }
  
  return progress;
}

/**
 * Disegna il grafico d'impatto con animazione
 */
function drawImpactChart(d) {
  // DEBUG: Controlla i dati
  console.log("Chart data:", d);
  console.log("d.rawDmg:", d.rawDmg);
  console.log("d.dmg (converted):", d.dmg);
  console.log("originalDmgValue:", d.originalDmgValue);

  // Tooltip text
  let tooltipText = "";

  push();

  // Overlay scuro dietro il grafico
  let panelW = chartSize + 60;
  let panelH = chartSize + 60;
  let px = width * chartXPercent - panelW / 2;
  let py = height * chartYPercent - panelH / 2;

  // pannello semitrasparente
  noFill();
  noStroke();
  rect(px, py, panelW, panelH, 10);

  // translate al centro del grafico
  let cx = width * chartXPercent;
  let cy = height * chartYPercent;
  translate(cx, cy);

  // configurazione
  let gapAngle = radians(chartGapAngleDeg);
  let gapRadial = chartGapRadial;
  let maxChartRadius = chartSize / 2 + 20;
  let radiusStep = chartSize / (2 * chartLevels);

  // valori e labels
  const values = [d.death, d.inj, d.dmg, d.house, d.missing];
  const labels = ["Deaths", "Injuries", "Damage", "Houses Destroyed", "Missing"];
  const rawValues = [d.rawDeath, d.rawInj, d.rawDmg, d.rawHouse, d.rawMissing];
  
  // Controlla se i dati sono disponibili
  const isDataAvailable = [
    !(d.death === 0 && d.rawDeath === "Details not available"),
    !(d.inj === 0 && d.rawInj === "Details not available"),
    !(d.dmg === 0 && d.rawDmg === "Details not available"),
    !(d.house === 0 && d.rawHouse === "Details not available"),
    !(d.missing === 0 && d.rawMissing === "Details not available")
  ];

  // DEBUG: Controlla disponibilità dati
  console.log("isDataAvailable:", isDataAvailable);
  console.log("Damage check - d.dmg:", d.dmg, "d.rawDmg:", d.rawDmg);

  // Calcola il progresso dell'animazione
  let animationProgress = getAnimationProgress();
  
  // mouse in coordinate relative
  let mx = mouseX - cx;
  let my = mouseY - cy;
  let mDist = dist(0, 0, mx, my);

  // angolo mouse
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

  // Prima disegna tutte le sezioni CON dati disponibili (con animazione)
  for (let i = 0; i < 5; i++) {
    if (!isDataAvailable[i]) continue;
    
    let start = sectionAngle * i + gapAngle / 2;
    let end = sectionAngle * (i + 1) - gapAngle / 2;

    for (let level = 1; level <= chartLevels; level++) {
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
        
        fill(chartMainColor);
        stroke(chartMainColor);
        strokeWeight(1);
        drawArcSegment(innerR, animatedOuterR, start, end);
      } else {
        noFill();
        stroke(chartMainColor);
        strokeWeight(1);
        drawArcSegment(innerR, outerR, start, end);
      }
    }
  }

  // Poi disegna le sezioni SENZA dati disponibili (con pattern a linee oblique)
  for (let i = 0; i < 5; i++) {
    if (isDataAvailable[i]) continue;
    
    let start = sectionAngle * i + gapAngle / 2;
    let end = sectionAngle * (i + 1) - gapAngle / 2;

    for (let level = 1; level <= chartLevels; level++) {
      let innerR = radiusStep * (level - 1) + gapRadial;
      let outerR = radiusStep * level - gapRadial;
      
      // Crea una maschera per il pattern
      drawingContext.save();
      drawingContext.beginPath();
      
      // Disegna la forma dell'arco come maschera
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
      
      // Disegna il pattern a linee oblique all'interno della maschera
      let patternSpacing = 6; // Spaziatura tra le linee
      let lineColor = color(180, 180, 180); // Grigio trasparente
      
      stroke(lineColor);
      strokeWeight(1);
      noFill();
      
      // Calcola i limiti del rettangolo che contiene l'arco
      let minX = -outerR;
      let maxX = outerR;
      let minY = -outerR;
      let maxY = outerR;
      
      // Angolo per le linee oblique (45 gradi)
      let angle = PI / 4;
      let cosAngle = cos(angle);
      let sinAngle = sin(angle);
      
      // Disegna linee oblique
      for (let offset = -maxX - maxY; offset < maxX + maxY; offset += patternSpacing) {
        // Calcola i punti per la linea corrente
        let x1, y1, x2, y2;
        
        if (cosAngle !== 0) {
          // Linea obliqua standard
          x1 = minX;
          y1 = (offset - x1 * cosAngle) / sinAngle;
          x2 = maxX;
          y2 = (offset - x2 * cosAngle) / sinAngle;
        }
        
        // Disegna la linea solo se è all'interno dell'area visibile
        if (y1 >= minY || y2 >= minY || y1 <= maxY || y2 <= maxY) {
          line(x1, y1, x2, y2);
        }
      }
      
      drawingContext.restore();
      
      // Bordo grigio
      noFill();
      stroke(150, 150, 150);
      strokeWeight(1);
      drawArcSegment(innerR, outerR, start, end);
    }
  }

  // Disegna tutte le label
  let detailMaxWidth = 130; // Aumenta la larghezza massima
  let lineHeight = 16; // Altezza di ogni linea di testo

  for (let i = 0; i < 5; i++) {
    let start = sectionAngle * i + gapAngle / 2;
    let end = sectionAngle * (i + 1) - gapAngle / 2;

    textStyle(NORMAL);
    noStroke();
    
    if (!isDataAvailable[i]) {
      fill(150, 150, 150);
    } else {
      fill(0);
    }
    textSize(chartLabelSize);
    textAlign(CENTER, CENTER);

    let ang = (start + end) / 2;
    let lx = cos(ang) * (chartSize / 2 + 60);
    let ly = sin(ang) * (chartSize / 2 + 55);
    
    // Disegna il titolo principale (Deaths, Injuries, ecc.)
    text(labels[i], lx, ly - 25);
    
    // AGGIUNTA: Disegna "Lvl. x" sotto ogni etichetta
    if (isDataAvailable[i]) {
      let levelValue = values[i];
      let levelText = "Impact: " + levelValue;

      // --- Impact: x ---
      fill(chartMainColor);
      textSize(chartLabelSize);
      textStyle(BOLD);
      text(levelText, lx, ly - 5);

      // --- Valore completo descrittivo ---
      let detailText = "";
      if (i === 0) detailText = getDetailText(d.rawDeath, d.death, "deaths");
      else if (i === 1) detailText = getDetailText(d.rawInj, d.inj, "injuries");
      else if (i === 2) detailText = d.rawDmg;
      else if (i === 3) detailText = getDetailText(d.rawHouse, d.house, "houses");
      else if (i === 4) detailText = getDetailText(d.rawMissing, d.missing, "missing");

      fill(0); // nero
      textSize(chartLabelSize);
      textStyle(NORMAL);
      textAlign(CENTER, TOP);
      
      // Calcola quante linee di testo ci sono
      let numLines = 1;
      if (detailText.includes('\n')) {
        numLines = 2;
      }
      
      // Posiziona il testo in base al numero di linee
      let textY = ly + 7;
      text(detailText, lx - detailMaxWidth / 2, textY, detailMaxWidth);
    }
  }

  push();
  noStroke();
  fill(245, 40, 0); // Rosso
  textSize(chartTitleSize);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  
  // Testo "Total impact level: " + valore
  let totalImpactText = "Total impact level: " + d.impact;
  let totalImpactX = 270;
  let totalImpactY = -310; // CAMBIATO da -320 a -350 per abbassare la scritta
  text(totalImpactText, totalImpactX, totalImpactY);
  
  // Ripristina stile normale
  textStyle(NORMAL);
  pop();  

    // hover tooltip content
  if (hoveredSection !== -1) {
    if (hoveredSection === 0) {
      tooltipText = getDetailText(d.rawDeath, d.death, "deaths");
    }
    else if (hoveredSection === 1) {
      tooltipText = getDetailText(d.rawInj, d.inj, "injuries");
    }
    else if (hoveredSection === 2) {
      tooltipText = d.rawDmg; // Usa il valore già convertito
    }
    else if (hoveredSection === 3) {
      tooltipText = getDetailText(d.rawHouse, d.house, "houses");
    }
    else if (hoveredSection === 4) {
      tooltipText = getDetailText(d.rawMissing, d.missing, "missing");
    }
  }

  pop();

  // disegno tooltip
  if (tooltipText !== "") {
    drawTooltip(tooltipText);
  }
}

/* tooltip box */
function drawTooltip(txt) {
  push();
  textSize(chartTooltipTextSize);
  let w = textWidth(txt) + 20;
  let h = 34;

  // background
  fill(255);
  stroke(chartMainColor);
  rect(mouseX + 15, mouseY - 10, w, h, 6);

  // text
  fill(0);
  noStroke();
  textAlign(LEFT, CENTER);
  text(txt, mouseX + 25, mouseY + 8);
  pop();
}

/* funzione di utilità per disegnare segmento ad arco tra r1 e r2 */
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

function drawLearnMoreButton() {
  const buttonWidth = 160; // Stessa larghezza di overview
  const buttonHeight = 35; // Altezza consistente
  const buttonSpacing = 10; // Spazio tra i pulsanti
  
  // Posizionato in alto a destra con margine - Learn More a destra
  const buttonX = width - buttonWidth - 50; // Allineato con overview
  const buttonY = 20; // Allineato con il back button
  
  // Home button a sinistra di Learn More
  const homeButtonX = buttonX - buttonWidth - buttonSpacing;
  
  // --- HOME BUTTON ---
  stroke(245, 40, 0); // Usa il rosso del tema
  strokeWeight(1);
  noFill();
  rect(homeButtonX, buttonY, buttonWidth, buttonHeight, 5);

  // Icona casa (se l'immagine è caricata, altrimenti placeholder)
  if (homeIcon) {
    push();
    imageMode(CENTER);
    // Ridimensiona l'icona (circa 24x24 pixel)
    let iconSize = 24;
    // Posiziona l'icona a sinistra nel pulsante
    let iconX = homeButtonX + 25;
    let iconY = buttonY + buttonHeight/2;
    
    // Applica il colore rosso all'icona usando tint
    tint(245, 40, 0); // Colore rosso del tema
    image(homeIcon, iconX, iconY, iconSize, iconSize);
    tint(255, 255, 255); // Ripristina il colore normale
    pop();
  } else {
    // Fallback se l'icona non è caricata
    push();
    translate(homeButtonX + 25, buttonY + buttonHeight/2);
    // Disegna una semplice icona casa
    stroke(245, 40, 0);
    strokeWeight(1);
    noFill();
    // Quadrato
    rect(-8, -8, 16, 16, 3);
    // Tetto triangolare
    triangle(-10, -8, 0, -15, 10, -8);
    // Porta
    fill(245, 40, 0);
    rect(-3, 0, 6, 8, 2);
    pop();
  }

  // Testo "Home"
  fill(0); // Testo nero per contrasto
  noStroke();
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Home", homeButtonX + 50, buttonY + buttonHeight/2);

  // Memorizza l'area per l'interazione
  state.homeButtonArea = {
    x: homeButtonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };

  // --- LEARN MORE BUTTON (come in overview) ---
  stroke(245, 40, 0);
  strokeWeight(1);
  noFill();
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

  // Icona "i" di informazioni (stesso stile di overview)
  fill(245, 40, 0);
  noStroke();
  
  // Disegna un cerchio con la "i" dentro
  push();
  translate(buttonX + 25, buttonY + buttonHeight/2);
  // Cerchio
  stroke(245, 40, 0);
  strokeWeight(1);
  noFill();
  circle(0, 0, 20);
  // Testo "i"
  fill(245, 40, 0);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text("i", 0, 0);
  pop();

  // Testo "Learn More"
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Learn More", buttonX + 50, buttonY + buttonHeight/2);

  // Memorizza l'area per l'interazione
  state.learnMoreButtonArea = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
}

/* FUNZIONE PER CONTROLLARE SE IL MOUSE È SOPRA UN PULSANTE */
function updateCursor() {
  let isOverButton = false;

  // Controlla se il mouse è sopra il Back button
  if (mouseX > 15 && mouseX < 105 && mouseY > 15 && mouseY < 45) {
    isOverButton = true;
  }

  // Controlla se il mouse è sopra il Home button
  if (state.homeButtonArea &&
      mouseX > state.homeButtonArea.x &&
      mouseX < state.homeButtonArea.x + state.homeButtonArea.width &&
      mouseY > state.homeButtonArea.y &&
      mouseY < state.homeButtonArea.y + state.homeButtonArea.height) {
    isOverButton = true;
  }

  // Controlla se il mouse è sopra il Learn More button
  if (state.learnMoreButtonArea &&
      mouseX > state.learnMoreButtonArea.x &&
      mouseX < state.learnMoreButtonArea.x + state.learnMoreButtonArea.width &&
      mouseY > state.learnMoreButtonArea.y &&
      mouseY < state.learnMoreButtonArea.y + state.learnMoreButtonArea.height) {
    isOverButton = true;
  }

  // Controlla se il mouse è sopra le frecce di navigazione
  let margin = 82;
  let y = 230;
  let navigatorX = margin;

  textSize(48);
  let leftArrowWidth = textWidth("<");
  let framePadding = 20;
  let frameHeight = 50;
  let leftArrowX = navigatorX;
  let leftFrameX = leftArrowX - framePadding;
  let leftFrameY = y - frameHeight/2;

  textSize(72);
  let yearFormatted = formatYear(selectedYear);
  let yearWidth = textWidth(yearFormatted);
  let yearX = leftArrowX + leftArrowWidth + 40;

  textSize(48);
  let rightArrowWidth = textWidth(">");
  let rightArrowX = yearX + yearWidth + 40;
  let rightFrameX = rightArrowX - framePadding;
  let rightFrameY = y - frameHeight/2;

  // Freccia sinistra
  if (mouseX > leftFrameX &&
      mouseX < leftFrameX + leftArrowWidth + framePadding*2 &&
      mouseY > leftFrameY &&
      mouseY < leftFrameY + frameHeight) {
    isOverButton = true;
  }

  // Freccia destra
  if (mouseX > rightFrameX &&
      mouseX < rightFrameX + rightArrowWidth + framePadding*2 &&
      mouseY > rightFrameY &&
      mouseY < rightFrameY + frameHeight) {
    isOverButton = true;
  }

  // Cambia il cursore
  if (isOverButton) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}