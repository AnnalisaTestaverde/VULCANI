// SEZIONI - configurazione per visualizzazione sezioni 
const sections = [
    {
        id: 1,
        title: "METHODOLOGY",
        subtitle: "HOW WE BUILT OUR VISUAL STORY.",
        imageId: "methodology-image-1",
        buttonText: "Explore the dataset",
        buttonLink: "https://www.ngdc.noaa.gov/hazel/view/hazards/volcano/event-data"
    },
    {
        id: 2,
        title: "OVERVIEW VISUALIZATION",
        subtitle: "HOW WE VISUALIZE ERUPTION DATA.",
        imageId: "methodology-image-2",
        buttonText: "Explore all eruptions",
        buttonLink: "overview.html"
    },
    {
        id: 3,
        title: "DATA INTERPRETATION",
        subtitle: "HOW WE INTERPRET AND PRESENT DATA.",
        imageId: "methodology-image-3",
        buttonText: "Explore the detail graphs",
        buttonLink: "learn_more_detail.html"
    }
];

// VARIABILI GLOBALI
let currentSectionId = 1;
let textScrollArea = null;
let scrollHint = null;
let isScrolling = false;
let scrollTimeout = null;
let p5Sketch = null;

// INIZIALIZZAZIONE - vari elementi
document.addEventListener('DOMContentLoaded', function() {
    console.log("=== INIZIALIZZAZIONE PAGINA METHODOLOGY ===");
    
    // (!) PAGINA
    initializePage();
    
    // (!!) P5.js IN MODALITÀ STATICA
    setTimeout(initializeStaticP5, 100);
});

// (!)
function initializePage() {
    // Salvataggio riferimenti agli elementi
    textScrollArea = document.querySelector('.text-content');
    scrollHint = document.getElementById('text-scroll-hint');
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup bottone
    setupLearnMoreButton();
    
    // Inizializzazione sezione corrente
    updateSection(currentSectionId);
}

// (!!) P5.js - STATO DEFINITIVO
function initializeStaticP5() {
    if (typeof p5 === 'undefined') {
        console.error("P5.js non trovato");
        return;
    }
    
    // a. BLOCCO - animazioni esistenti
    stopAllP5Animations();
    
    // b. CREAZIONE SKETCH STATICO
    p5Sketch = new p5((p) => {
        // Variabili con coordinate fisse
        let staticDots = [];
        let canvasElement = null;
        
        // 1. FUNZIONE SETUP
        p.setup = function() {
            
            // Calcolo dimensioni
            const header = document.querySelector('header');
            const footer = document.getElementById('html-footer');
            
            if (!header || !footer) {
                console.error("Elementi DOM mancanti");
                return;
            }
            
            const headerHeight = header.offsetHeight;
            const footerTop = footer.offsetTop;
            const canvasHeight = footerTop - headerHeight;
            
            // Creaziine canvas
            canvasElement = p.createCanvas(window.innerWidth, canvasHeight);
            
            // APPLICAZIONE STILI CRITICI
            canvasElement.position(0, headerHeight);
            canvasElement.style('position', 'fixed');
            canvasElement.style('z-index', '-100');
            canvasElement.style('pointer-events', 'none');
            
            // BLOCCO MOVIMENTI
            canvasElement.style('transform', 'translate3d(0,0,0)');
            canvasElement.style('will-change', 'auto');
            canvasElement.style('backface-visibility', 'hidden');
            
            /* NAVIGAZIONE 
            - creazione pallini con coordinate fisse */
            createStaticDots(p);
            
            // Disegna UNA VOLTA
            drawOnce(p);
            
            // FONDAMENTALE! DISABILITAZIONE LOOP
            p.noLoop();
            
            /* SOSTITUZIONE FUNZIONE DRAW 
            - sovrascrittura del draw */
            Object.defineProperty(p, 'draw', {
                value: function() {
                    // !! NON deve mai essere eseguita
                    console.error("ATTENZIONE: draw() è stata chiamata!");
                    return;
                },
                writable: false,
                configurable: false
            });
            
        };
        
        // 2. CREAZIONE PALLINI NAV. FISSI
        function createStaticDots(p) {
            staticDots = [];
            const dotCount = 45;
            
            for (let i = 0; i < dotCount; i++) {
                // Coordinate FISSE nella memoria - nessun movimento
                staticDots.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    size: p.random(1.5, 4),
                    alpha: p.random(20, 35),
                    // NESSUNA proprietà di movimento!
                });
            }
        }
        
        // 3. DISEGNA UNA VOLTA
        function drawOnce(p) {
            
            // pulizia
            p.clear();
            
            // Disegno pallino con coordinate FISSE
            p.push();
            p.noStroke();
            
            for (let dot of staticDots) {
                p.fill(255, 43, 0, dot.alpha);
                p.ellipse(dot.x, dot.y, dot.size, dot.size);
            }
            
            p.pop();
        }
        
        // 4. GESTIONE RESIZE
        p.windowResized = function() {
            console.log("📐 Ridimensionamento finestra");
            
            if (!canvasElement) return;
            
            const header = document.querySelector('header');
            const footer = document.getElementById('html-footer');
            
            if (!header || !footer) return;
            
            const headerHeight = header.offsetHeight;
            const footerTop = footer.offsetTop;
            const canvasHeight = footerTop - headerHeight;
            
            // Ridimensionamento
            p.resizeCanvas(window.innerWidth, canvasHeight);
            canvasElement.style('top', headerHeight + 'px');
            
            // Ricreazione pallini per le nuove dimensioni
            createStaticDots(p);
            
            // Ridisegno UNA volta
            drawOnce(p);
        };
        
        // 5. DEBUG: MONITORA LO SCROLL
        window.addEventListener('scroll', function() {
            if (canvasElement) {
                const rect = canvasElement.elt.getBoundingClientRect();
                
                // Se il canvas si è mosso, riposizionamento corretto
                if (rect.top !== parseInt(canvasElement.style('top'))) {
                    const header = document.querySelector('header');
                    if (header) {
                        canvasElement.style('top', header.offsetHeight + 'px');
                    }
                }
            }
        });
        
    });
}

// !! BLOCCO DI TUTTE LE ANIMAZIONI P5.JS
function stopAllP5Animations() {
    // (1): Disabilitazione istanze globali
    if (window.p5 && window.p5.instance) {
        try {
            window.p5.instance.noLoop();
            console.log("✅ Disabilitato loop istanza globale P5.js");
        } catch (e) {
            console.log("ℹ️  Nessuna istanza globale da disabilitare");
        }
    }
    
    // (2): Disabilitazione funzioni requestAnimationFrame
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
        console.warn("requestAnimationFrame BLOCCATA per prevenire animazioni");
        return 0; // Restituisce ID invalido
    };
    
    // (3): Disabilitazione setInterval per animazioni
    const intervals = [];
    const originalSetInterval = window.setInterval;
    window.setInterval = function(callback, delay) {
        if (delay < 1000) { // Blocca intervalli rapidi
            console.warn(`setInterval(${delay}ms) BLOCCATO per prevenire animazioni`);
            return 0;
        }
        return originalSetInterval.apply(this, arguments);
    };
}

// AGGIUNTA CSS CHE BLOCCA ANIMAZIONI
function addAnimationBlockingCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* BLOCCA TUTTE LE ANIMAZIONI CANVAS */
        canvas {
            animation: none;
            transition: none;
            transform: none;
            will-change: auto;
        }
        
        /* ASSICURA CHE IL CANVAS P5 SIA FISSO */
        .p5Canvas {
            position: fixed;
            top: 90px;
            left: 0;
            width: 100vw;
            z-index: -100;
            pointer-events: none;
        }
        
        /* DISABILITA TRANSFORMAZIONI CSS */
        * {
            backface-visibility: hidden;
            perspective: 1000px;
        }
    `;
    document.head.appendChild(style);
}

// EVENT LISTENER
function setupEventListeners() {
    // Scroll del mouse sull'area di testo
    if (textScrollArea) {
        textScrollArea.addEventListener('scroll', handleTextScroll);
    }
    
    // Click sulla freccia di scroll
    if (scrollHint) {
        scrollHint.addEventListener('click', handleScrollHintClick);
    }
    
    // Click sui pallini FISSI di navigazione
    document.querySelectorAll('.fixed-dot').forEach(dot => {
        dot.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = parseInt(this.getAttribute('data-section'));
            if (sectionId !== currentSectionId && !isScrolling) {
                scrollToSection(sectionId);
            }
        });
    });
    
    document.addEventListener('keydown', handleKeyDown);
    
    // CSS anti-animazione
    addAnimationBlockingCSS();
}

function setupLearnMoreButton() {
    const button = document.getElementById('learn-more-btn');
    if (!button) return;
    
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        const section = sections.find(s => s.id === currentSectionId);
        if (section) {
            if (section.buttonLink.includes('http')) {
                window.open(section.buttonLink, '_blank');
            } else {
                window.location.href = section.buttonLink;
            }
        }
    });
}

// GESTIONE SCROLL TESTO - scroll vari
function handleTextScroll() {
    if (!textScrollArea || isScrolling) return;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const scrollTop = textScrollArea.scrollTop;
        const scrollHeight = textScrollArea.scrollHeight;
        const clientHeight = textScrollArea.clientHeight;
        
        // (1) Calcolo con OFFSET AUMENTATO!
        const sectionHeight = (scrollHeight - clientHeight) / 3;
        let newSectionId = currentSectionId;
        
        /* OFFSET (correzioni varie + modifica da r.388)
        - IMPOSTATO +150 per migliore funzionam. */
        if (scrollTop < sectionHeight + 150) {
            newSectionId = 1;
        } else if (scrollTop < (sectionHeight * 2) + 150) {
            newSectionId = 2;
        } else {
            newSectionId = 3;
        }
        
        if (newSectionId !== currentSectionId) {
            updateSection(newSectionId);
        }
    }, 100);
}

/* SCROLL - freccia */
function handleScrollHintClick() {
    if (isScrolling) return;
    
    if (currentSectionId === sections.length) {
        // Se ultima sezione, torna alla prima
        scrollToSection(1);
    } else {
        // Altrimenti prossima
        scrollToSection(currentSectionId + 1);
    }
}

/* SCROLL - alle diverse sezioni */
function scrollToSection(sectionId) {
    if (!textScrollArea || sectionId < 1 || sectionId > sections.length) return;
    
    isScrolling = true;
    
    const section = sections.find(s => s.id === sectionId);
    if (!section) {
        isScrolling = false;
        return;
    }
    
    // (2) Calcolo con OFFSET AUMENTATO!
    const scrollHeight = textScrollArea.scrollHeight;
    const clientHeight = textScrollArea.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    const sectionHeight = maxScroll / 3;
    
    let targetScroll;
    
    // !! POSIZIONI AGGIORNATE CON OFFSET
    switch(sectionId) {
        // (1) - leggera correzione
        case 1:
            targetScroll = 0 - 10;
            break;
        // (2) - utile per evitare taglio titolo da parte della nav
        case 2:
            targetScroll = sectionHeight - 120 ; 
            break;
        // (3) - correzione per minore spazio scroll
        case 3:
            targetScroll = (sectionHeight * 2) + 135; //
            break;
        default:
            targetScroll = 0;
    }
    
    // ! LIMITA AL MASSIMO SCROLL POSSIBILE
    targetScroll = Math.min(maxScroll, targetScroll);
    
    // Aggiornamento immediato di sezione
    updateSection(sectionId);
    
    // Scroll alla posizione calcolata
    textScrollArea.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
    });
    
    // Rilascio lock dopo lo scroll
    setTimeout(() => {
        isScrolling = false;
    }, 600);
}

// FUNZIONI DI AGGIORNAMENTO
function updateSection(sectionId) {
    currentSectionId = sectionId;
    const section = sections.find(s => s.id === sectionId);
    
    if (!section) return;
    
    updateTitle(section.title, section.subtitle);
    updateImage(section.imageId);
    updateButton(section.buttonText, section.buttonLink);
    updateFixedDots(sectionId);
    updateScrollHint();
}

function updateTitle(title, subtitle) {
    const titleElement = document.getElementById('dynamic-title');
    const subtitleElement = document.getElementById('dynamic-subtitle');
    
    if (!titleElement || !subtitleElement) return;
    
    titleElement.classList.add('title-transition');
    subtitleElement.classList.add('title-transition');
    
    titleElement.textContent = title;
    subtitleElement.textContent = subtitle;
    
    setTimeout(() => {
        titleElement.classList.remove('title-transition');
        subtitleElement.classList.remove('title-transition');
    }, 400);
}

function updateImage(imageId) {
    document.querySelectorAll('.methodology-image').forEach(img => {
        img.classList.remove('active');
    });
    
    const currentImage = document.getElementById(imageId);
    if (currentImage) {
        currentImage.classList.add('active');
    }
}

function updateButton(buttonText, buttonLink) {
    const button = document.getElementById('learn-more-btn');
    if (!button) return;
    
    button.textContent = buttonText;
    
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (buttonLink.includes('http')) {
            window.open(buttonLink, '_blank');
        } else {
            window.location.href = buttonLink;
        }
    });
}

function updateFixedDots(sectionId) {
    document.querySelectorAll('.fixed-dot').forEach(dot => {
        const dotSectionId = parseInt(dot.getAttribute('data-section'));
        if (dotSectionId === sectionId) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateScrollHint() {
    if (!scrollHint) return;
    
    if (currentSectionId === sections.length) {
        // Ultima sezione: freccia ruotata (v specchiata)
        scrollHint.classList.add('flipped');
        scrollHint.title = "Torna all'inizio";
    } else {
        // Altre sezioni: freccia normale
        scrollHint.classList.remove('flipped');
        scrollHint.title = "Vai alla prossima sezione";
    }
}

// GESTIONE TASTI
function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
            e.preventDefault();
            if (currentSectionId < sections.length) {
                scrollToSection(currentSectionId + 1);
            } else {
                scrollToSection(1);
            }
            break;
            
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            if (currentSectionId > 1) {
                scrollToSection(currentSectionId - 1);
            } else {
                scrollToSection(sections.length);
            }
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            if (currentSectionId < sections.length) {
                scrollToSection(currentSectionId + 1);
            }
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            if (currentSectionId > 1) {
                scrollToSection(currentSectionId - 1);
            }
            break;
            
        case ' ':
        case 'Enter':
            e.preventDefault();
            if (currentSectionId < sections.length) {
                scrollToSection(currentSectionId + 1);
            } else {
                scrollToSection(1);
            }
            break;
            
        case '1':
            e.preventDefault();
            if (currentSectionId !== 1) {
                scrollToSection(1);
            }
            break;
            
        case '2':
            e.preventDefault();
            if (currentSectionId !== 2) {
                scrollToSection(2);
            }
            break;
            
        case '3':
            e.preventDefault();
            if (currentSectionId !== 3) {
                scrollToSection(3);
            }
            break;
    }
}

// UTILITY DEBUG
window.debugP5 = function() {
    console.log("=== DEBUG P5.js ===");
    console.log("Sketch attivo:", p5Sketch ? "Sì" : "No");
    
    if (p5Sketch) {
        const canvas = document.querySelector('.p5Canvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            console.log("Canvas position:", canvas.style.position);
            console.log("Canvas top:", canvas.style.top);
            console.log("Bounding rect top:", rect.top);
            console.log("Canvas si muove?", rect.top !== parseInt(canvas.style.top || 0));
        }
    }
};

// ESPORTO FUNZIONI
window.methodology = {
    // chiamata scroll to section
    scrollToSection,
    // ritorno valore
    currentSection: () => currentSectionId,
    // marcata disponibilità methodology
    debugP5: window.debugP5
};