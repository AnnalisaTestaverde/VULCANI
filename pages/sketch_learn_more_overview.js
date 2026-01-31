const CONFIG = {
  colors: {
    background: "#FF2B00", 
    text: "#000000ff",
    accent: "#FFFFFF", 
    circle: "#111010b3",
    infoBox: "#ffffffff",
    infoBoxText: "#000000ff",
    infoBoxStroke: "#FF2B00",
  },
  layout: {
    centerXRatio: 0.695,
    maxRadius: 300,
    minRadius: 29,
    continentLabelOffset: 15,
    europeAsiaOffset: 15,
    infoBoxWidth: 220,
    infoBoxHeight: 100,
    bottomControlY: 100,
    marginX: 40,
    fontSizeControls: 16,
    centerYOffset: -10,
    topOffset: -20,
    leftPanelWidth: 300,
    controlButtonHeight: 50,
    controlButtonWidth: 50,
    timeframeFontSize: 30,
    yearFontSize: 30,
    labelFontSize: 16,
    titleStartY: 95,
    buttonStartY: 450,
    timeframeStartY: 520,
    yearStartY: 620,
    legendStartY: 350,
    startButtonY: 720,
  },
  animation: {
    dotEntryDuration: 800,
    dotStaggerDelay: 30,
    dotPopScale: 1.4,
    randomDelayMax: 600,
    waveDuration: 1000,
    easingFunction: "easeOutBack",
    fastDotEntryDuration: 400,
    fastRandomDelayMax: 200,
    eruptionDuration: 1000,
    implosionDuration: 250,
    pauseDuration: 150,
    explosionDuration: 600,
    maxExplosionScale: 100,
    shockwaveCount: 5,
    pulseCount: 8,
  },
};

let impactLevels = [];
let scaleFactor = 1.0;
let originalConfig = null;
let allImpacts = [];

const CONCENTRIC_YEARS = [-4200, 0, 800, 1800, 1850, 1900, 1950, 2000, 2050];

//durata animazioni
const SELECTION_ANIMATION_DURATION = 800;
const HOVER_ANIMATION_DURATION = 300;
const CIRCLE_REVEAL_DURATION = 1500;
const TIMELINE_ANIMATION_SPEED_NORMAL = 500;
const TIMELINE_ANIMATION_SPEED_FAST = 800;
const TIMELINE_PAUSE_BETWEEN_CYCLES = 1000;

let state = {
  volcanoData: [],
  filteredData: [],
  selectedCentury: null,
  selectedContinent: null,
  hoveredVolcano: null,
  timelineYear: null,
  centerX: 0,
  centerY: 0,
  continentAngles: {},
  continentCounts: {},
  volcanoPositions: new Map(),
  globalYearRange: { min: 0, max: 0 },
  timelineButtons: [],
  currentCenturiesIndex: 0,
  isPlaying: false,
  leftControlAreas: null,
  rightControlAreas: null,
  asiaLabelY: 0,
  animationTimer: 0,
  animationSpeed: TIMELINE_ANIMATION_SPEED_NORMAL,
  pauseBetweenCycles: TIMELINE_PAUSE_BETWEEN_CYCLES,
  isPausedBetweenCycles: false,
  startButtonArea: null,
  timeFrameLeftArrows: null,
  timeFrameRightArrows: null,
  yearLeftArrow: null,
  yearRightArrow: null,
  availableYears: [],
  currentYearIndex: 0,
  displayedYear: null,
  yearActivatedByUser: false,
  selectionAnimationStart: new Map(),
  hoverAnimationStart: new Map(),
  circleRevealStart: null,
  circleRevealProgress: 0,
  dotAnimationStart: null,
  dotAnimationProgress: 0,
  dotAppearTimes: new Map(),
  waveAnimationStart: null,
  waveAnimationProgress: 0,
  disableDotEntryAnimation: false,
  useFastAnimations: false,
  eruption: {
    active: false,
    phase: "idle",
    x: 0,
    y: 0,
    startTime: 0,
    volcano: null,
    originalSize: 0,
    currentSize: 0,
    shockwaves: [],
    pulses: [],
    implosionStart: 0,
    pauseStart: 0,
    explosionStart: 0,
  },
  backButtonArea: null,
  methodologyButtonArea: null,
  isBackButtonHovered: false,
  isMethodologyButtonHovered: false,
  scrollArea: null,
  scrollHint: null,
  isAtBottom: false,
  showMethodologyButton: false,
  logoArea: null,
  navLinks: null,
  navBackArea: null,
};

//img di sfondo grafico concentrico
let radialBgImage;

//map continenti
const CONTINENT_MAP = {
  "Arabia-S": "Asia",
  "Arabia-W": "Asia",
  "China-S": "Asia",
  "Halmahera-Indonesia": "Asia",
  "Hokkaido-Japan": "Asia",
  "Honshu-Japan": "Asia",
  Indonesia: "Asia",
  "Izu Is-Japan": "Asia",
  Java: "Asia",
  Kamchatka: "Asia",
  "Kuril Is": "Asia",
  "Kyushu-Japan": "Asia",
  "Lesser Sunda Is": "Asia",
  "Luzon-Philippines": "Asia",
  "Mindanao-Philippines": "Asia",
  "Philippines-C": "Asia",
  "Ryukyu Is": "Asia",
  "Sangihe Is-Indonesia": "Asia",
  "Sulawesi-Indonesia": "Asia",
  Sumatra: "Asia",
  Turkey: "Asia",

  "Alaska Peninsula": "Americas",
  "Alaska-SW": "Americas",
  "Aleutian Is": "Americas",
  Canada: "Americas",
  "Chile-C": "Americas",
  "Chile-S": "Americas",
  Colombia: "Americas",
  "Costa Rica": "Americas",
  Ecuador: "Americas",
  "El Salvador": "Americas",
  Galapagos: "Americas",
  Guatemala: "Americas",
  "Hawaiian Is": "Americas",
  Mexico: "Americas",
  Nicaragua: "Americas",
  Peru: "Americas",
  "US-Oregon": "Americas",
  "US-Washington": "Americas",
  "US-Wyoming": "Americas",
  "W Indies": "Americas",

  Azores: "Europe",
  "Canary Is": "Europe",
  Greece: "Europe",
  "Iceland-NE": "Europe",
  "Iceland-S": "Europe",
  "Iceland-SE": "Europe",
  "Iceland-SW": "Europe",
  Italy: "Europe",

  "Admiralty Is-SW Paci": "Oceania",
  "Banda Sea": "Oceania",
  "Bougainville-SW Paci": "Oceania",
  "Kermadec Is": "Oceania",
  "New Britain-SW Pac": "Oceania",
  "New Guinea": "Oceania",
  "New Guinea-NE of": "Oceania",
  "New Zealand": "Oceania",
  "Samoa-SW Pacific": "Oceania",
  "Santa Cruz Is-SW Pac": "Oceania",
  "Solomon Is-SW Pacifi": "Oceania",
  "Tonga-SW Pacific": "Oceania",
  "Vanuatu-SW Pacific": "Oceania",

  "Africa-C": "Africa",
  "Africa-E": "Africa",
  "Africa-NE": "Africa",
  "Africa-W": "Africa",
  "Cape Verde Is": "Africa",
  "Indian O-W": "Africa",
  "Red Sea": "Africa",
};

const CONTINENTS = ["Asia", "Americas", "Europe", "Oceania", "Africa"];

function preload() {
  loadTable("../assets/data_impatto.csv", "csv", "header", processTableData);
  radialBgImage = loadImage("../assets/radial_bg.png");
}

//processati dati
function processTableData(table) {
  state.volcanoData = [];
  allImpacts = [];

  for (let r = 0; r < table.getRowCount(); r++) {
    let row = table.getRow(r);
    let location = row.getString("Location");

    let deaths = parseInt(row.getString("Deaths")) || 0;
    let impact = parseInt(row.getString("Impact")) || 1;

    if (!isNaN(impact)) {
      allImpacts.push(impact);
    }

    state.volcanoData.push({
      year: parseInt(row.getString("Year")) || 0,
      name: row.getString("Name"),
      location: location,
      country: row.getString("Country"),
      type: row.getString("Type"),
      impact: impact,
      deaths: deaths,
      continent: CONTINENT_MAP[location] || "Sconosciuto",
    });
  }

  impactLevels = [...new Set(allImpacts)].sort((a, b) => a - b);

  if (!impactLevels.includes(15)) {
    impactLevels.push(15);
  }

  impactLevels.sort((a, b) => a - b);

  state.volcanoData.sort((a, b) => b.year - a.year);
  initializeData();
}

//dati inizializzati
function initializeData() {
  state.filteredData = [...state.volcanoData];
  state.globalYearRange = getGlobalYearRange();
  calculateContinentData();
  calculateVolcanoPositions();
  updateAvailableYears();

  state.circleRevealStart = millis();
  state.dotAnimationStart = millis() + 300;
  state.dotAnimationProgress = 0;
  state.useFastAnimations = false;

  state.waveAnimationStart = null;
  state.waveAnimationProgress = 0;

  state.eruption = {
    active: false,
    phase: "idle",
    x: 0,
    y: 0,
    startTime: 0,
    volcano: null,
    originalSize: 0,
    currentSize: 0,
    shockwaves: [],
    pulses: [],
    implosionStart: 0,
    pauseStart: 0,
    explosionStart: 0,
  };

  state.dotAppearTimes.clear();
  state.filteredData.forEach((v) => {
    let key = `${v.name}-${v.year}-${v.deaths}`;
    const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
    state.dotAppearTimes.set(key, randomDelay);
  });

  state.disableDotEntryAnimation = false;
  state.showMethodologyButton = false; 
}

//continenti calcolo dei dati
function calculateContinentData() {
  state.continentCounts = CONTINENTS.reduce((acc, cont) => {
    acc[cont] = 0;
    return acc;
  }, {});

  state.volcanoData.forEach((v) => {
    if (state.continentCounts[v.continent] !== undefined) {
      state.continentCounts[v.continent]++;
    }
  });

  let total = state.volcanoData.length;
  let startAngle = 0;

  state.continentAngles = {};
  CONTINENTS.forEach((cont) => {
    let proportion = total > 0 ? state.continentCounts[cont] / total : 0;
    let angleSize = proportion * TWO_PI;

    state.continentAngles[cont] = {
      start: startAngle,
      end: startAngle + angleSize,
      mid: startAngle + angleSize / 2,
    };

    startAngle += angleSize;
  });
}

//calcolo posizione di ciascun vulcano
function calculateVolcanoPositions() {
  state.volcanoPositions.clear();

  const volcanoesByContinent = {};

  CONTINENTS.forEach((cont) => {
    volcanoesByContinent[cont] = [];
  });

  state.filteredData.forEach((v) => {
    let key = `${v.name}-${v.year}-${v.deaths}`;
    if (volcanoesByContinent[v.continent]) {
      volcanoesByContinent[v.continent].push({
        key: key,
        volcano: v,
        year: v.year,
      });
    }
  });

  CONTINENTS.forEach((cont) => {
    const angles = state.continentAngles[cont];
    if (!angles || volcanoesByContinent[cont].length === 0) return;

    volcanoesByContinent[cont].sort((a, b) => a.year - b.year);

    const angleRange = angles.end - angles.start;
    const angleStep =
      angleRange / Math.max(1, volcanoesByContinent[cont].length);

    volcanoesByContinent[cont].forEach((item, index) => {
      const angle = angles.start + angleStep * (index + 0.5);
      state.volcanoPositions.set(item.key, angle);
    });
  });
}

//anni disponibili 
function updateAvailableYears() {
  if (state.selectedCentury === null) {
    state.availableYears = [
      ...new Set(state.volcanoData.map((v) => v.year)),
    ].sort((a, b) => a - b);
  } else {
    const centuryIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
    if (centuryIndex !== -1 && centuryIndex < CONCENTRIC_YEARS.length - 1) {
      const startYear = CONCENTRIC_YEARS[centuryIndex];
      const endYear = CONCENTRIC_YEARS[centuryIndex + 1];

      const filteredYears = state.volcanoData
        .filter((v) => {
          if (centuryIndex === CONCENTRIC_YEARS.length - 2) {
            return v.year >= startYear && v.year <= endYear;
          } else {
            return v.year >= startYear && v.year < endYear;
          }
        })
        .map((v) => v.year);

      state.availableYears = [...new Set(filteredYears)].sort((a, b) => a - b);
    } else {
      state.availableYears = [];
    }
  }

  state.timelineYear = null;
  state.displayedYear =
    state.availableYears.length > 0 ? state.availableYears[0] : null;
  state.currentYearIndex = 0;
  state.yearActivatedByUser = false;

  state.isPlaying = false;
  state.animationTimer = 0;
  state.isPausedBetweenCycles = false;
  state.useFastAnimations = false;

  state.selectionAnimationStart.clear();
  state.hoverAnimationStart.clear();

  state.dotAnimationStart = millis();
  state.dotAnimationProgress = 0;
  state.disableDotEntryAnimation = false;

  state.dotAppearTimes.clear();
  state.filteredData.forEach((v) => {
    let key = `${v.name}-${v.year}-${v.deaths}`;
    const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
    state.dotAppearTimes.set(key, randomDelay);
  });
}

//raggio posizionamento in base all'impatto
function getRadiusForImpact(impact) {
  if (impactLevels.length <= 1) return CONFIG.layout.minRadius;

  let idx = impactLevels.indexOf(impact);
  if (idx === -1) return CONFIG.layout.minRadius;

  const totalLevels = impactLevels.length;
  const normalized = idx / (totalLevels - 1);

  return map(
    normalized,
    0,
    1,
    CONFIG.layout.maxRadius,
    CONFIG.layout.minRadius,
  );
}

//disegno cerchi di impatto 
function drawImpactCircles() {
  const specialIndices = [0, 4, 8, 12].filter(
    (index) => index < impactLevels.length,
  );

  if (state.circleRevealStart !== null) {
    const elapsed = millis() - state.circleRevealStart;
    state.circleRevealProgress = constrain(
      elapsed / CIRCLE_REVEAL_DURATION,
      0,
      1,
    );

    if (state.circleRevealProgress >= 1) {
      state.circleRevealStart = null;
    }
  }

  for (let i = 0; i < impactLevels.length; i++) {
    let radius = map(
      i,
      0,
      impactLevels.length - 1,
      CONFIG.layout.maxRadius,
      CONFIG.layout.minRadius,
    );
    noFill();

    const isSpecial = specialIndices.includes(i);

    if (isSpecial) {
      let animatedRadius = radius;
      let animatedStrokeWeight = 2.75;
      let animatedAlpha = 255;

      if (state.circleRevealProgress < 1) {
        const circleProgress = constrain(
          (state.circleRevealProgress * impactLevels.length - i) / 4,
          0,
          1,
        );
        animatedRadius = radius * circleProgress;
        animatedStrokeWeight = 2.75 * circleProgress;
        animatedAlpha = 255 * circleProgress;
      }

      stroke(255, 43, 0, animatedAlpha);
      strokeWeight(animatedStrokeWeight);
      ellipse(0, 0, animatedRadius * 2);
    } else {
      let animatedRadius = radius;
      if (state.circleRevealProgress < 1) {
        const circleProgress = constrain(
          (state.circleRevealProgress * impactLevels.length - i) / 4,
          0,
          1,
        );
        animatedRadius = radius * circleProgress;
      }

      stroke(CONFIG.colors.circle);
      strokeWeight(0.5);
      ellipse(0, 0, animatedRadius * 2);
    }
  }
}

//range anni 
function getGlobalYearRange() {
  const years = state.volcanoData.map((v) => v.year);
  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
}

//animazioni timeline
function updateAnimation() {
  if (!state.isPlaying || state.availableYears.length === 0) return;

  if (!state.yearActivatedByUser) {
    state.yearActivatedByUser = true;
    state.timelineYear = state.availableYears[state.currentYearIndex];
    state.displayedYear = state.availableYears[state.currentYearIndex];
    state.selectionAnimationStart.clear();
  }

  if (state.isPausedBetweenCycles) {
    state.animationTimer += deltaTime;
    if (state.animationTimer >= state.pauseBetweenCycles) {
      state.animationTimer = 0;
      state.isPausedBetweenCycles = false;
      state.currentYearIndex = 0;
      state.timelineYear = state.availableYears[0];
      state.displayedYear = state.availableYears[0];
    }
  }

  state.animationTimer += deltaTime;

  if (state.animationTimer >= state.animationSpeed) {
    state.animationTimer = 0;

    if (state.currentYearIndex < state.availableYears.length - 1) {
      state.currentYearIndex++;
    } else {
      state.isPausedBetweenCycles = true;
      return;
    }
  }

  state.timelineYear = state.availableYears[state.currentYearIndex];
  state.displayedYear = state.availableYears[state.currentYearIndex];
}

//animazioni punti 
function updateDotAnimations() {
  if (state.isPlaying) {
    state.disableDotEntryAnimation = true;
  } else if (!state.isPlaying && state.dotAnimationStart === null) {
    state.disableDotEntryAnimation = false;
  }

  if (state.dotAnimationStart !== null) {
    const elapsed = millis() - state.dotAnimationStart;
    const duration = state.useFastAnimations
      ? CONFIG.animation.fastDotEntryDuration
      : CONFIG.animation.dotEntryDuration;

    state.dotAnimationProgress = constrain(elapsed / duration, 0, 1);

    if (state.dotAnimationProgress >= 1) {
      state.dotAnimationStart = null;
    }
  }

  if (state.waveAnimationStart !== null) {
    const waveElapsed = millis() - state.waveAnimationStart;
    state.waveAnimationProgress = constrain(
      waveElapsed / CONFIG.animation.waveDuration,
      0,
      1,
    );

    if (state.waveAnimationProgress >= 1) {
      state.waveAnimationStart = null;
    }
  }
}

// 12 - Aggiornamento animazione eruzione
function updateEruptionAnimation() {
  if (!state.eruption.active) return;

  const currentTime = millis();
  const totalElapsed = currentTime - state.eruption.startTime;

  if (state.eruption.phase === "imploding") {
    const implosionElapsed = currentTime - state.eruption.implosionStart;
    const implosionProgress = constrain(
      implosionElapsed / CONFIG.animation.implosionDuration,
      0,
      1,
    );

    state.eruption.currentSize =
      state.eruption.originalSize * (1 - implosionProgress * 0.9);

    if (implosionProgress >= 1) {
      state.eruption.phase = "pause";
      state.eruption.pauseStart = currentTime;
    }
  } else if (state.eruption.phase === "pause") {
    const pauseElapsed = currentTime - state.eruption.pauseStart;

    if (pauseElapsed >= CONFIG.animation.pauseDuration) {
      state.eruption.phase = "exploding";
      state.eruption.explosionStart = currentTime;

      for (let wave of state.eruption.shockwaves) {
        wave.startTime = currentTime + wave.delay;
      }

      for (let pulse of state.eruption.pulses) {
        pulse.active = true;
      }
    }
  } else if (state.eruption.phase === "exploding") {
    const explosionElapsed = currentTime - state.eruption.explosionStart;
    const explosionProgress = constrain(
      explosionElapsed / CONFIG.animation.explosionDuration,
      0,
      1,
    );

    state.eruption.currentSize =
      state.eruption.originalSize *
      (1 + explosionProgress * CONFIG.animation.maxExplosionScale);

    for (let wave of state.eruption.shockwaves) {
      if (wave.startTime > 0 && currentTime >= wave.startTime) {
        const waveElapsed = currentTime - wave.startTime;
        if (waveElapsed < 400) {
          const waveProgress = constrain(waveElapsed / 400, 0, 1);
          wave.size = waveProgress * wave.maxSize;
        }
      }
    }

    for (let pulse of state.eruption.pulses) {
      if (pulse.active) {
        pulse.distance = min(pulse.distance + pulse.speed, pulse.maxDistance);
      }
    }

    if (explosionProgress >= 1) {
      state.eruption.phase = "complete";

      setTimeout(() => {
        const v = state.eruption.volcano;
        const url = `detail.html?name=${encodeURIComponent(v.name)}&year=${v.year}&impact=${v.impact}`;
        window.location.href = url;
      }, 100);
    }
  }
}

// 13 - Loop principale del grafico
function draw() {
  // Sfondo arancione fisso per la pagina learn more
  background(CONFIG.colors.background);

  // Draw navbar con logo
  drawNavBar();

  updateLayout();
  updateAnimation();
  updateDotAnimations();
  updateEruptionAnimation();

  drawTitle();
  drawBackButton(); // Bottone Back (a destra)

  // Disegna il bottone methodology solo se è visibile
  if (state.showMethodologyButton) {
    drawMethodologyButton();
  }

  drawMainCircle();
  drawContinentLabels();

  drawEruption();

  checkHover();
  drawInfobox();

  updateCursor();
}

// 14 - Navbar per la pagina learn more
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
  let backY = navHeight / 2;
  let backWidth = textWidth(backText);
  let backHeight = 20;
  let backTextY = backY - backHeight / 2;

  // Controlla se il mouse è sopra "Back"
  if (
    mouseX > backX &&
    mouseX < backX + backWidth &&
    mouseY > backTextY &&
    mouseY < backTextY + backHeight
  ) {
    isOverNavBack = true;
    fill(CONFIG.colors.text); // Nero su hover
  }

  text(backText, backX, backY);

  // Memorizza l'area per l'interazione
  state.navBackArea = {
    x: backX,
    y: backTextY,
    width: backWidth,
    height: backHeight,
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
    { name: "Explore", href: "overview.html", x: 0, isExplore: true },
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
    link.y = navHeight / 2;

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
    let textY = link.y - textH / 2;

    if (
      mouseX > textX &&
      mouseX < textX + textW &&
      mouseY > textY &&
      mouseY < textY + textH
    ) {
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
  line(0, navHeight - 5, width, navHeight - 5); // Spostata leggermente più in alto (-5)

  pop();
}

// 15 - Titolo (con "GRAPHIC" in bianco) - INVARIATO
function drawTitle() {
  textSize(72);
  textFont("Helvetica");
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  const titleY = CONFIG.layout.titleStartY + CONFIG.layout.topOffset;

  // "ABOUT THE" in nero
  fill(CONFIG.colors.text); // NERO
  text("ABOUT THE", CONFIG.layout.marginX, titleY);

  // "GRAPHIC" in BIANCO
  fill(CONFIG.colors.accent); // BIANCO
  text("INFOGRAPHIC", CONFIG.layout.marginX, titleY + 75);

  textStyle(NORMAL);
}

// 16 - Back Button MODIFICATO: STROKE NERO E SENZA CERCHIO - CON HOVER EFFECT
function drawBackButton() {
  const buttonWidth = 160;
  const buttonHeight = 40;

  // POSIZIONE FISSA: allineato con gli altri bottoni
  const buttonX = width - buttonWidth - 50;
  const buttonY = height - 40 - buttonHeight; // 40px dal fondo

  // NO FILL di default - solo su hover
  if (state.isBackButtonHovered) {
    // FILL BIANCO solo su hover
    fill(CONFIG.colors.accent); // Bianco
  } else {
    noFill(); // Nessun fill di default
  }

  // Bordo - Bianco su hover, Nero di default
  stroke(
    state.isBackButtonHovered ? CONFIG.colors.accent : CONFIG.colors.infoBox,
  );
  strokeWeight(1);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

  // Icona con "×" - SENZA CERCHIO ATTORNO
  push();
  translate(buttonX + 25, buttonY + buttonHeight / 2);
  fill(
    state.isBackButtonHovered
      ? CONFIG.colors.background
      : CONFIG.colors.infoBox,
  ); // Nero di default, Rosso su hover
  noStroke(); // NESSUNO STROKE
  textSize(20); // Leggermente più grande
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("×", 0, 0);
  pop();

  // Testo "Back" - Nero di default, Rosso su hover
  fill(
    state.isBackButtonHovered
      ? CONFIG.colors.background
      : CONFIG.colors.infoBox,
  );
  noStroke();
  textSize(CONFIG.layout.labelFontSize);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("Back", buttonX + 50, buttonY + buttonHeight / 2);

  // Memorizza l'area per l'interazione
  state.backButtonArea = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
  };
}

// 17 - Methodology Button - IDENTICO AL BACK BUTTON MA A SINISTRA - CON HOVER EFFECT
function drawMethodologyButton() {
  const buttonWidth = 200; // Leggermente più largo per il testo più lungo
  const buttonHeight = 40;

  // POSIZIONE: a sinistra, stessa altezza del back button
  const buttonX = 50; // Margine sinistro
  const buttonY = CONFIG.layout.startButtonY; // Stessa altezza del back button

  // NO FILL di default - solo su hover
  if (state.isMethodologyButtonHovered) {
    // FILL BIANCO solo su hover
    fill(CONFIG.colors.accent); // Bianco
  } else {
    noFill(); // Nessun fill di default
  }

  // Bordo - Bianco su hover, Nero di default
  stroke(
    state.isMethodologyButtonHovered
      ? CONFIG.colors.accent
      : CONFIG.colors.infoBox,
  );
  strokeWeight(1);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

  // Testo "About the Methodology" - Nero di default, Rosso su hover
  fill(
    state.isMethodologyButtonHovered
      ? CONFIG.colors.background
      : CONFIG.colors.infoBox,
  );
  noStroke();
  textSize(CONFIG.layout.labelFontSize);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("About the Methodology", buttonX + 12, buttonY + buttonHeight / 2);

  // Memorizza l'area per l'interazione
  state.methodologyButtonArea = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
  };
}

// 18 - Info box per hover sui vulcani - AGGIORNATO con dimensioni originali
function drawInfobox() {
  if (state.hoveredVolcano) {
    const volcano = state.hoveredVolcano;

    const boxWidth = 220; // Valore fisso, ma viene scalato da applyScaleToConfig
    const boxHeight = 90; // Valore fisso, ma viene scalato da applyScaleToConfig

    let x = mouseX + 25;
    let y = mouseY - boxHeight / 2;

    if (x + boxWidth > width) x = mouseX - boxWidth - 20;
    if (y < 0) y = 0;
    if (y + boxHeight > height) y = height - boxHeight;

    fill(CONFIG.colors.infoBox);
    stroke(CONFIG.colors.infoBoxStroke);
    strokeWeight(1);
    rect(x, y, boxWidth, boxHeight, 5);

    fill(CONFIG.colors.infoBoxText);
    noStroke();

    // Testo con dimensioni FISSE (non scalate)
    textSize(16);
    textStyle(BOLD);
    textAlign(LEFT, TOP);

    // Troncamento nome se troppo lungo
    let volcanoName = volcano.name;
    const maxNameWidth = boxWidth - 20;

    while (textWidth(volcanoName) > maxNameWidth && volcanoName.length > 10) {
      volcanoName = volcanoName.substring(0, volcanoName.length - 4) + "...";
    }

    text(volcanoName, x + 10, y + 10);

    // Year
    textSize(16);
    textStyle(NORMAL);
    text("Year: " + formatYear(volcano.year), x + 10, y + 40);

    // Impact
    text("Impact: " + volcano.impact, x + 10, y + 65);
  }
}

// 19 - Cerchio principale con cerchi di impatto - COMPLETAMENTE AGGIORNATO
function drawMainCircle() {
  push();
  translate(state.centerX, state.centerY);

  if (radialBgImage) {
    let imageDim = 2 * 0.989;
    let imageSize = CONFIG.layout.maxRadius * imageDim;
    imageMode(CENTER);
    image(radialBgImage, 0, 0, imageSize, imageSize);
  }

  drawImpactCircles();

  // NUMERAZIONE DEI CERCHI - come nel codice originale
  const numbers = [1, 5, 9, 13, 16];

  numbers.forEach((num, index) => {
    const radius = map(
      num,
      1,
      16,
      CONFIG.layout.maxRadius,
      CONFIG.layout.minRadius,
    );
    const x = 0;
    const y = radius + 10; // SOTTO il cerchio come nel codice originale

    if (num === 1 || num === 16) {
      fill(0); // Nero per 1 e 16
    } else {
      fill(0); // Rosso per 5, 9, 13
    }
    noStroke();
    textSize(16);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(num.toString(), x, y);
  });

  drawContinentDividers();

  if (state.filteredData.length > 0) {
    drawVolcanoes();
  }

  pop();
}

// 20 - Divisori tra continenti - INVARIATO
function drawContinentDividers() {
  stroke(CONFIG.colors.circle);
  strokeWeight(1);

  CONTINENTS.forEach((cont) => {
    const angles = state.continentAngles[cont];
    if (angles) {
      line(
        0,
        0,
        cos(angles.start) * CONFIG.layout.maxRadius,
        sin(angles.start) * CONFIG.layout.maxRadius,
      );
    }
  });
}

// 21 - Disegna tutti i vulcani - INVARIATO
function drawVolcanoes() {
  state.filteredData.forEach((v) => {
    let key = `${v.name}-${v.year}-${v.deaths}`;
    let angle = state.volcanoPositions.get(key);
    const angles = state.continentAngles[v.continent];

    if (!angle && angles) {
      angle = angles.mid;
      state.volcanoPositions.set(key, angle);
    }

    if (!angle) return;

    const r = getRadiusForImpact(v.impact);
    const x = cos(angle) * r;
    const y = sin(angle) * r;

    const isHighlighted =
      state.timelineYear !== null &&
      state.yearActivatedByUser &&
      v.year === state.timelineYear;
    const isHovered = state.hoveredVolcano === v;

    if (isHighlighted) {
      if (!state.selectionAnimationStart.has(key)) {
        state.selectionAnimationStart.set(key, millis());
      }
    } else {
      state.selectionAnimationStart.delete(key);
    }

    if (isHovered) {
      if (!state.hoverAnimationStart.has(key)) {
        state.hoverAnimationStart.set(key, millis());
      }
    } else {
      state.hoverAnimationStart.delete(key);
    }

    let selectionProgress = 0;
    if (isHighlighted && state.selectionAnimationStart.has(key)) {
      const startTime = state.selectionAnimationStart.get(key);
      const elapsed = millis() - startTime;
      selectionProgress = constrain(
        elapsed / SELECTION_ANIMATION_DURATION,
        0,
        1,
      );
    }

    let hoverProgress = 0;
    if (isHovered && state.hoverAnimationStart.has(key)) {
      const startTime = state.hoverAnimationStart.get(key);
      const elapsed = millis() - startTime;
      hoverProgress = constrain(elapsed / HOVER_ANIMATION_DURATION, 0, 1);
    }

    if (isHighlighted || isHovered) {
      drawVolcanoGlow(
        v,
        x,
        y,
        isHighlighted,
        isHovered,
        selectionProgress,
        hoverProgress,
      );
    }

    drawVolcanoDotAnimated(x, y, isHighlighted, isHovered, v, key);
  });
}

// 22 - Puntini dei vulcani con animazione - AGGIORNATO
function drawVolcanoDotAnimated(x, y, isHighlighted, isHovered, volcano, key) {
  let entryProgress = 1;

  if (
    !state.disableDotEntryAnimation &&
    state.dotAnimationStart !== null &&
    state.dotAnimationProgress < 1
  ) {
    const appearTime = state.dotAppearTimes.get(key) || 0;
    const elapsed = millis() - state.dotAnimationStart;

    if (elapsed >= appearTime) {
      const dotElapsed = elapsed - appearTime;
      const duration = state.useFastAnimations
        ? CONFIG.animation.fastDotEntryDuration
        : CONFIG.animation.dotEntryDuration;
      entryProgress = constrain(dotElapsed / duration, 0, 1);
    } else {
      entryProgress = 0;
    }
  }

  if (entryProgress === 0) return;

  const baseSize = isHighlighted ? 10 : isHovered ? 8 : 5;
  const finalSize = baseSize * entryProgress;
  const alpha = 255 * entryProgress;

  let color;
  if (isHighlighted) {
    color = CONFIG.colors.accent;
  } else if (isHovered) {
    color = CONFIG.colors.text;
  } else {
    color = CONFIG.colors.text;
  }

  fill(red(color), green(color), blue(color), alpha);
  noStroke();
  circle(x, y, finalSize);
}

// 23 - Bagliore dei vulcani - INVARIATO
function drawVolcanoGlow(
  volcano,
  x,
  y,
  isHighlighted,
  isHovered,
  selectionProgress,
  hoverProgress,
) {
  let entryProgress = 1;
  const key = `${volcano.name}-${volcano.year}-${volcano.deaths}`;

  if (
    !state.disableDotEntryAnimation &&
    state.dotAnimationStart !== null &&
    state.dotAnimationProgress < 1
  ) {
    const appearTime = state.dotAppearTimes.get(key) || 0;
    const elapsed = millis() - state.dotAnimationStart;

    if (elapsed >= appearTime) {
      const dotElapsed = elapsed - appearTime;
      const duration = state.useFastAnimations
        ? CONFIG.animation.fastDotEntryDuration
        : CONFIG.animation.dotEntryDuration;
      entryProgress = constrain(dotElapsed / duration, 0, 1);
    } else {
      entryProgress = 0;
    }
  }

  if (entryProgress === 0) return;

  let glowSize, alpha;

  if (isHighlighted) {
    let baseSize = map(volcano.impact, 5, 15, 60, 90);
    let baseAlpha = map(volcano.impact, 5, 15, 70, 100);
    glowSize = selectionProgress * baseSize * entryProgress;
    alpha = selectionProgress * baseAlpha * entryProgress;
  } else if (isHovered) {
    let baseSize = map(volcano.impact, 5, 15, 50, 80);
    let baseAlpha = map(volcano.impact, 5, 15, 60, 90);
    glowSize = hoverProgress * baseSize * entryProgress;
    alpha = hoverProgress * baseAlpha * entryProgress;
  } else {
    return;
  }

  fill(255, 43, 0, alpha);
  noStroke();
  circle(x, y, glowSize);
}

// 24 - Etichette dei continenti in grassetto - AGGIORNATO
function drawContinentLabels() {
  CONTINENTS.forEach((cont) => {
    const angles = state.continentAngles[cont];
    if (!angles) return;

    const angle = angles.mid;

    // Distanza fissa dal bordo (come nel codice originale)
    const labelRadius = CONFIG.layout.maxRadius + 35;

    const x = state.centerX + cos(angle) * labelRadius;
    const y = state.centerY + sin(angle) * labelRadius;

    push();
    translate(x, y);

    let rotationAngle = angle + HALF_PI;

    if (angle > HALF_PI && angle < 3 * HALF_PI) {
      rotationAngle += PI;
    }

    if (cont === "Americas") {
      rotationAngle += PI;
    }

    rotate(rotationAngle);

    fill(CONFIG.colors.text);
    noStroke();
    textSize(16);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(cont, 0, 0);
    pop();
  });
}

// 25 - Animazione eruzione - INVARIATO
function drawEruption() {
  if (!state.eruption.active) return;

  push();

  const currentTime = millis();

  if (
    state.eruption.phase === "imploding" ||
    state.eruption.phase === "pause"
  ) {
    const size = state.eruption.currentSize;

    fill(0);
    stroke(255, 43, 0);
    strokeWeight(2);
    circle(state.eruption.x, state.eruption.y, size);

    if (state.eruption.phase === "pause") {
      const pulseTime = currentTime - state.eruption.pauseStart;
      const pulseSize = sin(pulseTime * 0.05) * 3;

      noFill();
      stroke(255, 43, 0, 100);
      strokeWeight(1);
      circle(state.eruption.x, state.eruption.y, size + pulseSize);
    }
  } else if (state.eruption.phase === "exploding") {
    const explosionProgress = constrain(
      (currentTime - state.eruption.explosionStart) /
        CONFIG.animation.explosionDuration,
      0,
      1,
    );
    const centerAlpha = 255 * (1 - explosionProgress * 0.7);

    fill(255, 255, 255, centerAlpha);
    noStroke();
    circle(
      state.eruption.x,
      state.eruption.y,
      state.eruption.currentSize * 0.3,
    );

    noFill();
    stroke(255, 43, 0, 200 * (1 - explosionProgress));
    strokeWeight(4);
    circle(state.eruption.x, state.eruption.y, state.eruption.currentSize);

    for (let wave of state.eruption.shockwaves) {
      if (wave.startTime > 0 && currentTime >= wave.startTime) {
        const waveElapsed = currentTime - wave.startTime;
        if (waveElapsed < 400) {
          const waveProgress = waveElapsed / 400;
          const alpha = 150 * (1 - waveProgress);

          stroke(255, 43, 0, alpha);
          strokeWeight(wave.thickness);
          circle(state.eruption.x, state.eruption.y, wave.size);

          stroke(255, 255, 255, alpha * 0.6);
          strokeWeight(wave.thickness * 0.5);
          circle(state.eruption.x, state.eruption.y, wave.size * 1.2);
        }
      }
    }

    for (let pulse of state.eruption.pulses) {
      if (pulse.active) {
        const endX = state.eruption.x + cos(pulse.angle) * pulse.distance;
        const endY = state.eruption.y + sin(pulse.angle) * pulse.distance;

        stroke(255, 43, 0, 150 * (1 - pulse.distance / pulse.maxDistance));
        strokeWeight(1);
        line(state.eruption.x, state.eruption.y, endX, endY);

        fill(255, 255, 255, 200 * (1 - pulse.distance / pulse.maxDistance));
        noStroke();
        circle(endX, endY, pulse.size);
      }
    }

    const expansionCount = 3;
    for (let i = 0; i < expansionCount; i++) {
      const offset = i * 0.2;
      const adjustedProgress = max(0, explosionProgress - offset);

      if (adjustedProgress > 0) {
        const circleSize = state.eruption.currentSize * (0.5 + i * 0.3);
        const alpha = 100 * (1 - adjustedProgress);

        noFill();
        stroke(255, 100, 0, alpha);
        strokeWeight(2 - i * 0.5);
        circle(state.eruption.x, state.eruption.y, circleSize);
      }
    }

    if (explosionProgress < 0.5) {
      const distortionProgress = explosionProgress * 2;
      const distortionAlpha = 80 * (1 - distortionProgress);

      for (let i = 0; i < 3; i++) {
        const size = state.eruption.currentSize * (0.3 + i * 0.2);
        noFill();
        stroke(255, 200, 200, distortionAlpha);
        strokeWeight(1);
        drawingContext.setLineDash([5, 5]);
        circle(state.eruption.x, state.eruption.y, size);
        drawingContext.setLineDash([]);
      }
    }

    if (explosionProgress < 0.3) {
      const flashProgress = explosionProgress / 0.3;
      const flashAlpha = 30 * (1 - flashProgress);

      fill(255, 255, 255, flashAlpha);
      noStroke();
      rect(0, 0, width, height);
    }
  }

  pop();
}

// 26 - Controllo hover su vulcani e bottoni - AGGIORNATO PER ENTRAMBI I BOTTONI
function checkHover() {
  if (state.filteredData.length === 0) {
    state.hoveredVolcano = null;
  } else {
    let newHovered = null;
    let minDist = Infinity;

    state.filteredData.forEach((v) => {
      const angles = state.continentAngles[v.continent];
      if (!angles) return;

      const key = `${v.name}-${v.year}-${v.deaths}`;
      const angle = state.volcanoPositions.get(key) || angles.mid;
      const r = getRadiusForImpact(v.impact);
      const x = state.centerX + cos(angle) * r;
      const y = state.centerY + sin(angle) * r;

      const d = dist(mouseX, mouseY, x, y);
      if (d < 15 && d < minDist) {
        minDist = d;
        newHovered = v;
      }
    });

    state.hoveredVolcano = newHovered;
  }

  // Controllo hover sui bottoni
  state.isBackButtonHovered = false;
  state.isMethodologyButtonHovered = false;

  if (
    state.backButtonArea &&
    mouseX > state.backButtonArea.x &&
    mouseX < state.backButtonArea.x + state.backButtonArea.width &&
    mouseY > state.backButtonArea.y &&
    mouseY < state.backButtonArea.y + state.backButtonArea.height
  ) {
    state.isBackButtonHovered = true;
  }

  if (
    state.showMethodologyButton &&
    state.methodologyButtonArea &&
    mouseX > state.methodologyButtonArea.x &&
    mouseX <
      state.methodologyButtonArea.x + state.methodologyButtonArea.width &&
    mouseY > state.methodologyButtonArea.y &&
    mouseY < state.methodologyButtonArea.y + state.methodologyButtonArea.height
  ) {
    state.isMethodologyButtonHovered = true;
  }
}

// 27 - Aggiornamento layout in base alle dimensioni della finestra - INVARIATO
function updateLayout() {
  // Calcolo del centro X (ESATTAMENTE come in overview)
  let centerXRatio = CONFIG.layout.centerXRatio;

  if (width > 1920) {
    centerXRatio = 0.75;
  } else if (width < 1366) {
    centerXRatio = 0.65;
  }

  state.centerX = width * centerXRatio;

  // Calcolo del centro Y (ESATTAMENTE come in overview)
  const centerYPercentage = 0.48;

  if (height > 1200) {
    state.centerY = height * 0.46 + 25;
  } else if (height < 800) {
    state.centerY = height * 0.5 + 25;
  } else {
    state.centerY = height * centerYPercentage + 25;
  }
}

// 28 - Gestione click del mouse - AGGIORNATO PER NAVIGAZIONE E ERUZIONI
function mousePressed() {
  // Controllo per "Back" nella navbar
  if (
    state.navBackArea &&
    mouseX > state.navBackArea.x &&
    mouseX < state.navBackArea.x + state.navBackArea.width &&
    mouseY > state.navBackArea.y &&
    mouseY < state.navBackArea.y + state.navBackArea.height
  ) {
    // Torna alla pagina overview.html
    window.location.href = "overview.html";
    return;
  }

  // Controllo per i link della navbar
  if (state.navLinks) {
    for (let link of state.navLinks) {
      let textW = link.width;
      let textH = 20;
      let textX = link.x;
      let textY = link.y - textH / 2;

      if (
        mouseX > textX &&
        mouseX < textX + textW &&
        mouseY > textY &&
        mouseY < textY + textH
      ) {
        window.location.href = link.href;
        return;
      }
    }
  }

  // Controllo per il back button (quello grande in basso a destra)
  if (
    state.backButtonArea &&
    mouseX > state.backButtonArea.x &&
    mouseX < state.backButtonArea.x + state.backButtonArea.width &&
    mouseY > state.backButtonArea.y &&
    mouseY < state.backButtonArea.y + state.backButtonArea.height
  ) {
    // Torna alla pagina overview.html
    window.location.href = "overview.html";
    return;
  }

  // Controllo per il methodology button (solo se visibile)
  if (
    state.showMethodologyButton &&
    state.methodologyButtonArea &&
    mouseX > state.methodologyButtonArea.x &&
    mouseX <
      state.methodologyButtonArea.x + state.methodologyButtonArea.width &&
    mouseY > state.methodologyButtonArea.y &&
    mouseY < state.methodologyButtonArea.y + state.methodologyButtonArea.height
  ) {
    // Vai alla pagina methodology.html
    window.location.href = "methodology.html";
    return;
  }

  // Controllo per click su vulcani (eruzione)
  let closestVolcano = null;
  let closestVolcanoPos = null;
  let minDistance = 25;

  for (let v of state.filteredData) {
    let key = `${v.name}-${v.year}-${v.deaths}`;

    if (!state.volcanoPositions.has(key)) continue;

    const angle = state.volcanoPositions.get(key);
    const radius = getRadiusForImpact(v.impact);

    const x = state.centerX + cos(angle) * radius;
    const y = state.centerY + sin(angle) * radius;

    const d = dist(mouseX, mouseY, x, y);

    if (d < minDistance) {
      minDistance = d;
      closestVolcano = v;
      closestVolcanoPos = { x, y };
    }
  }

  if (closestVolcano && closestVolcanoPos) {
    triggerVolcanoEruption(
      closestVolcano,
      closestVolcanoPos.x,
      closestVolcanoPos.y,
    );
    return;
  }

  // Trigger onda al click sul grafico
  const distFromCenter = dist(mouseX, mouseY, state.centerX, state.centerY);
  if (distFromCenter < CONFIG.layout.maxRadius * 1.5) {
    triggerWaveAnimation();
  }
}

// 29 - Animazione eruzione al click
function triggerVolcanoEruption(volcano, x, y) {
  const originalSize = map(volcano.impact, 1, 15, 5, 15);

  state.eruption = {
    active: true,
    phase: "imploding",
    x: x,
    y: y,
    startTime: millis(),
    volcano: volcano,
    originalSize: originalSize,
    currentSize: originalSize,
    shockwaves: [],
    pulses: [],
    implosionStart: millis(),
    pauseStart: 0,
    explosionStart: 0,
  };

  for (let i = 0; i < CONFIG.animation.shockwaveCount; i++) {
    state.eruption.shockwaves.push({
      startTime: 0,
      size: 0,
      maxSize: random(50, 100),
      thickness: random(1, 3),
      delay: i * 50,
    });
  }

  for (let i = 0; i < CONFIG.animation.pulseCount; i++) {
    state.eruption.pulses.push({
      angle: random(TWO_PI),
      distance: 0,
      maxDistance: random(50, 200),
      speed: random(3, 8),
      size: random(2, 6),
      active: false,
    });
  }

  state.isPlaying = false;
  state.waveAnimationStart = null;
}

// 30 - Animazione onda al click
function triggerWaveAnimation() {
  state.waveAnimationStart = millis();
  state.waveAnimationProgress = 0;
}

// 31 - Formattazione anno esteso (es: "1500 AD" o "500 BC") - INVARIATO
function formatYear(year) {
  return Math.abs(year) + (year < 0 ? " BC" : " AD");
}

// 32 - Formattazione anno breve
function formatYearShort(year) {
  if (year < 0) {
    return Math.abs(year) + " BC";
  } else if (year === 0) {
    return "0";
  } else {
    return year + " AD";
  }
}

// 33 - Ridimensionamento finestra - INVARIATO
function windowResized() {
  // Aggiorna il fattore di scala
  const newScaleFactor = calculateScaleFactor();
  const constrainedScale = constrain(newScaleFactor, 0.5, 1.2);

  if (abs(constrainedScale - scaleFactor) > 0.01) {
    scaleFactor = constrainedScale;
    applyScaleToConfig(scaleFactor);
    console.log("Scale factor updated to:", scaleFactor);
  }

  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}

// ===== FUNZIONI RESPONSIVE =====

function calculateScaleFactor() {
  const referenceWidth = 1920;
  const referenceHeight = 1080;

  const widthRatio = windowWidth / referenceWidth;
  const heightRatio = windowHeight / referenceHeight;

  return min(widthRatio, heightRatio);
}

function applyScaleToConfig(scale) {
  // Salva la configurazione originale se non esiste
  if (!originalConfig) {
    originalConfig = JSON.parse(JSON.stringify(CONFIG.layout));
  }

  const original = originalConfig;
  const availableHeight = windowHeight;
  const bottomMargin = 40;

  // Scale dei testi e bottoni
  CONFIG.layout.fontSizeControls = original.fontSizeControls;
  CONFIG.layout.timeframeFontSize = original.timeframeFontSize * scale;
  CONFIG.layout.yearFontSize = original.yearFontSize * scale;
  CONFIG.layout.labelFontSize = original.labelFontSize;
  CONFIG.layout.leftPanelWidth = original.leftPanelWidth * scale;
  CONFIG.layout.controlButtonHeight = original.controlButtonHeight * scale;
  CONFIG.layout.controlButtonWidth = original.controlButtonWidth * scale;

  // Scale del grafico (esattamente come in overview)
  const graphScale = min(scale * 1.3, 1.2);
  CONFIG.layout.maxRadius = original.maxRadius * graphScale;
  CONFIG.layout.minRadius = original.minRadius * graphScale;
  CONFIG.layout.continentLabelOffset =
    original.continentLabelOffset * graphScale;
  CONFIG.layout.europeAsiaOffset = original.europeAsiaOffset * graphScale;

  // Scale del tooltip
  const tooltipScale = min(scale * 1.2, 1.1);
  CONFIG.layout.infoBoxWidth = original.infoBoxWidth * tooltipScale;
  CONFIG.layout.infoBoxHeight = original.infoBoxHeight * tooltipScale;

  // Margini
  CONFIG.layout.marginX = 40;
  CONFIG.layout.centerYOffset = original.centerYOffset * scale;
  CONFIG.layout.topOffset = original.topOffset * scale;

  // Titolo
  CONFIG.layout.titleStartY = 95 * scale;

  // Ricalcola le posizioni Y come in overview
  CONFIG.layout.startButtonY = availableHeight - bottomMargin - 40;
  CONFIG.layout.yearStartY = CONFIG.layout.startButtonY - 120;
  CONFIG.layout.timeframeStartY = CONFIG.layout.yearStartY - 100;
  CONFIG.layout.legendStartY = CONFIG.layout.timeframeStartY - 200;

  // Aggiusta se c'è poco spazio (come in overview)
  const spaceBetweenTitleAndLegend =
    CONFIG.layout.legendStartY - CONFIG.layout.titleStartY;

  if (spaceBetweenTitleAndLegend < 200) {
    CONFIG.layout.legendStartY = CONFIG.layout.titleStartY + 200;
    CONFIG.layout.timeframeStartY = CONFIG.layout.legendStartY + 150;
    CONFIG.layout.yearStartY = CONFIG.layout.timeframeStartY + 80;
    CONFIG.layout.startButtonY = CONFIG.layout.yearStartY + 80;

    if (CONFIG.layout.startButtonY > availableHeight - bottomMargin) {
      CONFIG.layout.startButtonY = availableHeight - bottomMargin - 20;
      CONFIG.layout.yearStartY = CONFIG.layout.startButtonY - 60;
      CONFIG.layout.timeframeStartY = CONFIG.layout.yearStartY - 60;
      CONFIG.layout.legendStartY = CONFIG.layout.timeframeStartY - 120;
    }
  }

  // Limiti finali
  CONFIG.layout.titleStartY = max(80, CONFIG.layout.titleStartY);
  CONFIG.layout.startButtonY = min(
    CONFIG.layout.startButtonY,
    availableHeight - bottomMargin,
  );
  CONFIG.layout.yearStartY = min(
    CONFIG.layout.yearStartY,
    CONFIG.layout.startButtonY - 60,
  );
  CONFIG.layout.timeframeStartY = min(
    CONFIG.layout.timeframeStartY,
    CONFIG.layout.yearStartY - 60,
  );
  CONFIG.layout.legendStartY = min(
    CONFIG.layout.legendStartY,
    CONFIG.layout.timeframeStartY - 120,
  );
  CONFIG.layout.legendStartY = max(
    CONFIG.layout.titleStartY + 200,
    CONFIG.layout.legendStartY,
  );
}

// 34 - Setup iniziale del canvas principale
function setup() {
  // Calcola e applica il fattore di scala (come in overview)
  scaleFactor = calculateScaleFactor();
  scaleFactor = constrain(scaleFactor, 0.5, 1.2);
  applyScaleToConfig(scaleFactor);

  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("main-sketch-container");
  updateLayout();
  frameRate(60);
  console.log("Learn More - Setup completato");

  // Setup degli event listener per lo scroll
  setupScrollListeners();

  // Inizializza anche la leggenda
  initializeLegend();
}

// 35 - Aggiorna il cursore in base a cosa c'è sotto il mouse - AGGIORNATO PER ENTRAMBI I BOTTONI
function updateCursor() {
  let isOverButton = false;

  // Controlla hover sul "Back" della navbar
  if (
    state.navBackArea &&
    mouseX > state.navBackArea.x &&
    mouseX < state.navBackArea.x + state.navBackArea.width &&
    mouseY > state.navBackArea.y &&
    mouseY < state.navBackArea.y + state.navBackArea.height
  ) {
    isOverButton = true;
  }

  // Controlla se il mouse è sopra i link della navbar
  if (state.navLinks) {
    for (let link of state.navLinks) {
      let textW = link.width;
      let textH = 20;
      let textX = link.x;
      let textY = link.y - textH / 2;

      if (
        mouseX > textX &&
        mouseX < textX + textW &&
        mouseY > textY &&
        mouseY < textY + textH
      ) {
        isOverButton = true;
        break;
      }
    }
  }

  // Controlla se il mouse è sopra i bottoni
  if (
    (state.backButtonArea &&
      mouseX > state.backButtonArea.x &&
      mouseX < state.backButtonArea.x + state.backButtonArea.width &&
      mouseY > state.backButtonArea.y &&
      mouseY < state.backButtonArea.y + state.backButtonArea.height) ||
    (state.showMethodologyButton &&
      state.methodologyButtonArea &&
      mouseX > state.methodologyButtonArea.x &&
      mouseX <
        state.methodologyButtonArea.x + state.methodologyButtonArea.width &&
      mouseY > state.methodologyButtonArea.y &&
      mouseY <
        state.methodologyButtonArea.y + state.methodologyButtonArea.height)
  ) {
    isOverButton = true;
  }

  // Controlla se il mouse è sopra un vulcano (puntino)
  const distFromCenter = dist(mouseX, mouseY, state.centerX, state.centerY);
  if (distFromCenter < CONFIG.layout.maxRadius * 1.5) {
    for (let v of state.filteredData) {
      let key = `${v.name}-${v.year}-${v.deaths}`;

      if (!state.volcanoPositions.has(key)) continue;

      const angle = state.volcanoPositions.get(key);
      const radius = getRadiusForImpact(v.impact);
      const x = state.centerX + cos(angle) * radius;
      const y = state.centerY + sin(angle) * radius;
      const d = dist(mouseX, mouseY, x, y);

      if (d < 15) {
        isOverButton = true;
        break;
      }
    }
  }

  // Cambia il cursore
  if (isOverButton) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

// ===== FUNZIONI PER LO SCROLL - VERSIONE SEMPLIFICATA =====

// 36 - Setup degli event listener per lo scroll
function setupScrollListeners() {
  // Ottieni gli elementi
  state.scrollArea = document.getElementById("text-scroll-area");
  state.scrollHint = document.getElementById("scroll-hint");

  // Se l'elemento dello scroll esiste
  if (state.scrollArea) {
    // Aggiungi scroll listener semplice
    state.scrollArea.addEventListener("scroll", handleTextScroll);

    // Abilita lo scroll con la ruota del mouse su tutto il documento
    document.addEventListener("wheel", handleGlobalWheel, { passive: false });

    // Click sulla freccia
    if (state.scrollHint) {
      state.scrollHint.addEventListener("click", function () {
        scrollTextContent(300);
      });
    }

    // Controlla inizialmente
    checkScrollEnd();
  }
}

// 37 - Gestione scroll globale - SEMPLICE
function handleGlobalWheel(e) {
  // Se abbiamo un'area di scroll
  if (state.scrollArea) {
    // Applica lo scroll all'area del testo
    state.scrollArea.scrollTop += e.deltaY;

    // Previeni lo scroll della pagina
    e.preventDefault();

    // Controlla se siamo alla fine
    checkScrollEnd();
  }
}

// 38 - Gestione scroll del testo
function handleTextScroll() {
  checkScrollEnd();
}

// 39 - Controlla se siamo alla fine dello scroll - AGGIORNATO PER NASCONDERE FRECCIA E MOSTRARE BOTTONE METHODOLOGY
function checkScrollEnd() {
  if (!state.scrollArea || !state.scrollHint) return;

  const scrollTop = state.scrollArea.scrollTop;
  const scrollHeight =
    state.scrollArea.scrollHeight - state.scrollArea.clientHeight;
  const scrollPercentage =
    scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

  // Nasconde la freccia e mostra il bottone methodology quando si è vicini alla fine (90%)
  if (scrollPercentage > 90) {
    state.scrollHint.style.display = "none";
    state.isAtBottom = true;
    state.showMethodologyButton = true; // Mostra il bottone
  } else {
    state.scrollHint.style.display = "block";
    state.isAtBottom = false;
    state.showMethodologyButton = false; // Nascondi il bottone
  }
}

// 40 - Scroll del contenuto testo
function scrollTextContent(pixels) {
  if (!state.scrollArea) return;

  state.scrollArea.scrollTop += pixels;
  checkScrollEnd();
}

// ===== FUNZIONI PER LA LEGGENDA =====

// 41 - Inizializza la leggenda p5.js - FUNZIONE RINOMINATA
function initializeLegend() {
  // Crea un nuovo sketch p5.js per la leggenda
  new p5(legendSketch, "legend-container");
}

// 42 - Sketch p5.js per la leggenda - AGGIORNATO esattamente come nel codice originale
function legendSketch(sketch) {
  sketch.setup = function () {
    const container = document.getElementById("legend-container");
    const canvas = sketch.createCanvas(
      container.clientWidth,
      container.clientHeight,
    );
    canvas.parent("legend-container");
    sketch.textSize(16);
    sketch.textFont("Helvetica");
    sketch.textStyle(sketch.NORMAL);
  };

  sketch.draw = function () {
    sketch.clear(); // Sfondo trasparente

    const startX = 20;
    const startY = 20;

    sketch.fill(255); // Testo bianco
    sketch.noStroke();
    sketch.textAlign(sketch.LEFT, sketch.CENTER);

    // Prima riga: Volcanic eruption (pallino nero)
    const y1 = startY;

    // Icona: pallino nero SENZA bordo
    sketch.fill(0); // Nero
    sketch.noStroke();
    sketch.circle(startX + 20, y1 + 12, 12);

    // Testo
    sketch.fill(255); // Bianco
    sketch.text("Volcanic eruption", startX + 45, y1 + 12);

    // Seconda riga: Distribution based on impact range (cerchio + freccia)
    const y2 = startY + 35;

    sketch.push();
    sketch.translate(startX + 20, y2 + 12);

    sketch.noFill();
    sketch.stroke(255); // Bianco
    sketch.strokeWeight(1);

    const R = 13;
    const r = 4;

    // cerchio grande
    sketch.circle(0, 0, R * 2);

    // cerchio centrale
    sketch.circle(0, 0, r * 2);

    // linea verticale
    sketch.line(0, R + 2, 0, 4);

    // punta della freccia
    sketch.fill(255); // Bianco
    sketch.triangle(0, 1, -2, 6, 2, 6);
    sketch.pop();

    // Testo
    sketch.fill(255);
    sketch.text("Distribution based on impact range", startX + 45, y2 + 12);

    // Terza riga: Temporal order of eruptions (spicchio con freccia)
    const y3 = startY + 70;

    sketch.push();
    sketch.translate(startX + 15, y3 + 25);

    sketch.noFill();
    sketch.stroke(255); // Bianco
    sketch.strokeWeight(1);

    const A = 23;
    const a1 = -sketch.PI / 1.7;
    const a2 = -sketch.PI / 4;

    // lati dello spicchio
    sketch.line(0, 0, sketch.cos(a1) * A, sketch.sin(a1) * A);
    sketch.line(0, 0, sketch.cos(a2) * A, sketch.sin(a2) * A);

    // arco
    sketch.arc(0, 0, A * 2, A * 2, a1, a2);

    // freccia tangente sull'arco
    const ax = sketch.cos(a2) * A;
    const ay = sketch.sin(a2) * A;

    sketch.line(ax, ay, ax - 4, ay - 2);
    sketch.line(ax, ay, ax - 2, ay - 4);

    sketch.pop();

    // Testo (ESATTAMENTE come nel codice originale)
    sketch.fill(255);
    sketch.text(
      "Eruption order: from oldest to most recent within each continent. ",
      startX + 45,
      y3 + 12,
    );
  };
}