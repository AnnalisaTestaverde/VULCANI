/**
 * METHODOLOGY PAGE - TESTO UNICO CON CAMBI DINAMICI
 * Layout simile alla versione originale
 * SCROLL COMPLETO SENZA CONFLITTI
 */

// Configurazione delle sezioni
const sections = [
    {
        id: 1,
        title: "METHODOLOGY",
        subtitle: "HOW WE BUILT OUR VISUAL STORY.",
        imageId: "methodology-image-1",
        buttonText: "Learn More About Methodology",
        threshold: 0
    },
    {
        id: 2,
        title: "OVERVIEW VISUALIZATION",
        subtitle: "HOW WE VISUALIZE ERUPTION DATA.",
        imageId: "methodology-image-2",
        buttonText: "Learn More About Overview",
        threshold: 500
    },
    {
        id: 3,
        title: "DATA INTERPRETATION",
        subtitle: "HOW WE INTERPRET AND PRESENT DATA.",
        imageId: "methodology-image-3",
        buttonText: "Learn More About Data Interpretation",
        threshold: 1400
    }
];

let currentSectionId = 1;
let isScrolling = false;
let textScrollArea = null;
let scrollHint = null;
let isAtButtons = false;

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    // Configura gli event listener
    setupEventListeners();
    
    // Configura gestione errori immagine
    setupImageErrorHandler();
    
    // Calcola le soglie in base all'altezza reale
    calculateScrollThresholds();
    
    // Salva riferimenti agli elementi
    textScrollArea = document.querySelector('.text-content');
    scrollHint = document.getElementById('text-scroll-hint');
    
    // Inizializza la freccia di scroll
    updateScrollHint();
    
    // Configura event listener per i nuovi bottoni
    setupButtonListeners();
});

// Configura tutti gli event listener
function setupEventListeners() {
    // Scroll del mouse su TUTTA LA PAGINA
    document.addEventListener('wheel', handleGlobalWheel, { passive: false });
    
    // Click sulla freccia di scroll
    if (scrollHint) {
        scrollHint.addEventListener('click', handleScrollHintClick);
    }
    
    // Click sugli indicatori
    document.querySelectorAll('.screen-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const sectionId = parseInt(this.getAttribute('data-section'));
            if (sectionId !== currentSectionId) {
                scrollToSection(sectionId);
            }
        });
    });
    
    // Bottone Learn More
    const learnMoreBtn = document.getElementById('learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLearnMoreClick(currentSectionId);
        });
    }
    
    // Tasti freccia per scroll
    document.addEventListener('keydown', handleKeyDown);
    
    // Ricalcola soglie al resize
    window.addEventListener('resize', calculateScrollThresholds);
    
    // Controlla la posizione dello scroll
    textScrollArea.addEventListener('scroll', checkScrollPosition);
}

// Configura event listener per i nuovi bottoni
function setupButtonListeners() {
    const viewDatasetBtn = document.getElementById('view-dataset-btn');
    const exploreEruptionsBtn = document.getElementById('explore-eruptions-btn');
    const exploreGraphsBtn = document.getElementById('explore-graphs-btn');
    
    if (viewDatasetBtn) {
        viewDatasetBtn.addEventListener('click', function() {
            alert('Opening dataset view...');
            // Qui puoi aggiungere la logica per aprire il dataset
            // window.location.href = 'dataset.html';
        });
    }
    
    if (exploreEruptionsBtn) {
        exploreEruptionsBtn.addEventListener('click', function() {
            alert('Navigating to all eruptions overview...');
            // Qui puoi aggiungere la logica per aprire la mappa delle eruzioni
            // window.location.href = 'overview.html';
        });
    }
    
    if (exploreGraphsBtn) {
        exploreGraphsBtn.addEventListener('click', function() {
            alert('Opening detailed graphs...');
            // Qui puoi aggiungere la logica per aprire i grafici dettagliati
            // window.location.href = 'detail-graphs.html';
        });
    }
}

// Controlla la posizione dello scroll
function checkScrollPosition() {
    if (!textScrollArea) return;
    
    const scrollTop = textScrollArea.scrollTop;
    const scrollHeight = textScrollArea.scrollHeight - textScrollArea.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    // Verifica se siamo arrivati ai bottoni (ultimi 20% dello scroll)
    if (scrollPercentage >= 80 && !isAtButtons) {
        // Siamo arrivati ai bottoni
        isAtButtons = true;
        updateScrollHint();
    } else if (scrollPercentage < 80 && isAtButtons) {
        // Siamo tornati sopra ai bottoni
        isAtButtons = false;
        updateScrollHint();
    }
}

// Gestione scroll del mouse su tutta la pagina - VERSIONE SEMPLIFICATA
function handleGlobalWheel(e) {
    e.preventDefault();
    
    if (!textScrollArea) return;
    
    const delta = e.deltaY;
    
    // Scrolling verso il basso
    if (delta > 0) {
        scrollTextContent(delta * 0.5);
    }
    // Scrolling verso l'alto
    else if (delta < 0) {
        scrollTextContent(delta * 0.5);
    }
}

// Gestione click sulla freccia di scroll
function handleScrollHintClick() {
    if (isAtButtons) {
        // Torna all'inizio del testo
        scrollToTop();
    } else {
        // Scendi nel testo
        scrollTextContent(400);
    }
}

// Scrolla all'inizio del testo
function scrollToTop() {
    if (!textScrollArea) return;
    
    smoothScrollTo(textScrollArea, 0, 600);
    isAtButtons = false;
    
    // Aggiorna sezione corrente
    setTimeout(() => {
        detectCurrentSection(textScrollArea.scrollTop);
        updateScrollHint();
    }, 100);
}

// Vai ai bottoni (fine del testo)
function goToButtons() {
    if (!textScrollArea) return;
    
    const buttonsContainer = document.querySelector('.buttons-container');
    if (buttonsContainer) {
        const targetPosition = buttonsContainer.offsetTop - textScrollArea.clientHeight * 0.2;
        smoothScrollTo(textScrollArea, targetPosition, 600);
        
        setTimeout(() => {
            isAtButtons = true;
            updateScrollHint();
        }, 300);
    }
}

// Calcola le soglie di scroll in base all'altezza reale
function calculateScrollThresholds() {
    const textSections = document.querySelectorAll('.text-section');
    
    if (textSections.length >= 3) {
        sections[1].threshold = textSections[0].offsetHeight - 100;
        sections[2].threshold = textSections[0].offsetHeight + textSections[1].offsetHeight - 100;
    }
}

// Rileva la sezione corrente in base allo scroll
function detectCurrentSection(scrollTop) {
    let newSectionId = currentSectionId;
    
    // Trova la sezione attiva in base alle soglie
    for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollTop >= sections[i].threshold) {
            newSectionId = sections[i].id;
            break;
        }
    }
    
    // Se la sezione è cambiata, aggiorna
    if (newSectionId !== currentSectionId) {
        updateCurrentSection(newSectionId);
    }
}

// Aggiorna la sezione corrente
function updateCurrentSection(sectionId) {
    currentSectionId = sectionId;
    const section = sections.find(s => s.id === sectionId);
    
    if (!section) return;
    
    // Aggiorna titolo e sottotitolo con animazione
    updateTitle(section.title, section.subtitle);
    
    // Aggiorna immagine
    updateImage(section.imageId);
    
    // Aggiorna bottone
    updateButton(section.buttonText);
    
    // Aggiorna indicatori
    updateIndicators(sectionId);
}

// Aggiorna titolo con animazione
function updateTitle(title, subtitle) {
    const titleElement = document.getElementById('dynamic-title');
    const subtitleElement = document.getElementById('dynamic-subtitle');
    
    // Aggiungi classe di animazione
    titleElement.classList.add('title-transition');
    subtitleElement.classList.add('title-transition');
    
    // Aggiorna testo
    titleElement.textContent = title;
    subtitleElement.textContent = subtitle;
    
    // Rimuovi classe dopo animazione
    setTimeout(() => {
        titleElement.classList.remove('title-transition');
        subtitleElement.classList.remove('title-transition');
    }, 400);
}

// Aggiorna immagine visibile
function updateImage(imageId) {
    // Rimuovi active da tutte le immagini
    document.querySelectorAll('.methodology-image').forEach(img => {
        img.classList.remove('active');
    });
    
    // Aggiungi active all'immagine corrente
    const currentImage = document.getElementById(imageId);
    if (currentImage) {
        currentImage.classList.add('active');
    }
}

// Aggiorna testo del bottone
function updateButton(buttonText) {
    const button = document.getElementById('learn-more-btn');
    if (button) {
        button.textContent = buttonText;
    }
}

// Aggiorna indicatori (pallini)
function updateIndicators(sectionId) {
    // Rimuovi active da tutti i pallini
    document.querySelectorAll('.screen-dot').forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Aggiungi active al pallino corrente
    const currentDot = document.querySelector(`.screen-dot[data-section="${sectionId}"]`);
    if (currentDot) {
        currentDot.classList.add('active');
    }
}

// Aggiorna visibilità e testo della freccia di scroll
function updateScrollHint() {
    if (!scrollHint || !textScrollArea) return;
    
    if (isAtButtons) {
        // Quando siamo ai bottoni, freccia verso l'alto
        scrollHint.textContent = "↑";
        scrollHint.classList.add('up-arrow');
        scrollHint.classList.remove('hidden');
    } else {
        // Quando siamo nel testo
        const scrollTop = textScrollArea.scrollTop;
        const scrollHeight = textScrollArea.scrollHeight - textScrollArea.clientHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        scrollHint.textContent = "↓";
        scrollHint.classList.remove('up-arrow');
        scrollHint.classList.remove('hidden');
        
        // Opacità ridotta se siamo alla fine del testo
        scrollHint.style.opacity = scrollPercentage >= 95 ? "0.7" : "1";
    }
}

// Scroll del contenuto testo
function scrollTextContent(pixels) {
    if (!textScrollArea) return;
    
    textScrollArea.scrollTop += pixels;
    detectCurrentSection(textScrollArea.scrollTop);
    updateScrollHint();
}

// Scrolla a una sezione specifica
function scrollToSection(sectionId) {
    if (!textScrollArea) return;
    
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    smoothScrollTo(textScrollArea, section.threshold, 600);
    
    // Aggiorna sezione corrente
    updateCurrentSection(sectionId);
    isAtButtons = false;
}

// Animazione scroll fluida
function smoothScrollTo(element, to, duration) {
    if (duration <= 0) return;
    
    const start = element.scrollTop;
    const change = to - start;
    const increment = 20;
    let currentTime = 0;
    
    const animateScroll = function() {
        currentTime += increment;
        const val = easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        
        if (currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    
    animateScroll();
}

// Funzione di easing
function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

// Gestione click bottone Learn More
function handleLearnMoreClick(sectionId) {
    switch(sectionId) {
        case 1:
            alert('Learn more about our design methodology and data organization process.');
            break;
        case 2:
            alert('Explore the detailed overview visualization and impact categories.');
            break;
        case 3:
            alert('Discover our data interpretation principles and visualization approach.');
            break;
        default:
            alert('Learn more about our methodology and visualization approach.');
    }
}

// Gestione tasti freccia
function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
            e.preventDefault();
            scrollTextContent(100);
            break;
            
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            scrollTextContent(-100);
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            if (currentSectionId < 3) {
                scrollToSection(currentSectionId + 1);
            }
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            if (currentSectionId > 1) {
                scrollToSection(currentSectionId - 1);
            }
            break;
            
        case '1':
        case '2':
        case '3':
            e.preventDefault();
            const sectionId = parseInt(e.key);
            if (sectionId >= 1 && sectionId <= 3 && sectionId !== currentSectionId) {
                scrollToSection(sectionId);
            }
            break;
            
        case 'End':
            e.preventDefault();
            goToButtons();
            break;
            
        case 'Home':
            e.preventDefault();
            scrollToTop();
            break;
    }
}

// Configura gestione errori immagine
function setupImageErrorHandler() {
    const images = document.querySelectorAll('.methodology-image');
    images.forEach(image => {
        image.onerror = function() {
            const placeholders = [
                'Methodology Overview',
                'Overview Visualization', 
                'Data Interpretation'
            ];
            
            const index = parseInt(this.id.split('-')[3]) - 1;
            const text = placeholders[index] || 'Methodology Image';
            
            this.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f8f8f8"/><text x="200" y="160" text-anchor="middle" fill="%23FF2B00" font-family="Arial" font-size="16" font-weight="bold">${text}</text><text x="200" y="190" text-anchor="middle" fill="%23999" font-family="Arial" font-size="12">Visualization preview</text></svg>`;
            this.alt = `Placeholder for ${text}`;
        };
    });
}

// Esporta funzioni utili
window.methodology = {
    scrollToSection,
    currentSection: () => currentSectionId,
    goToButtons,
    scrollToTop
};