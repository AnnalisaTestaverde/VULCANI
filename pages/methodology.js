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
        buttonText: "Explore the dataset",
        threshold: 0
    },
    {
        id: 2,
        title: "OVERVIEW VISUALIZATION",
        subtitle: "HOW WE VISUALIZE ERUPTION DATA.",
        imageId: "methodology-image-2",
        buttonText: "Explore all eruptions",
        threshold: 500
    },
    {
        id: 3,
        title: "DATA INTERPRETATION",
        subtitle: "HOW WE INTERPRET AND PRESENT DATA.",
        imageId: "methodology-image-3",
        buttonText: "Explore the detail graphs",
        threshold: 1400
    }
];

let currentSectionId = 1;
let isScrolling = false;
let isAtFooter = false;
let textScrollArea = null;
let mainContent = null;
let footer = null;
let scrollHint = null;
let isPageScrollMode = false; // Nuovo flag per controllare se stiamo scorrendo la pagina

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
    mainContent = document.getElementById('main-content');
    footer = document.getElementById('main-footer');
    scrollHint = document.getElementById('text-scroll-hint');
    
    // Inizializza la freccia di scroll
    updateScrollHint();
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
            if (sectionId !== currentSectionId && !isAtFooter) {
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
    window.addEventListener('scroll', checkScrollPosition);
}

// Gestione click sulla freccia di scroll
function handleScrollHintClick() {
    if (isAtFooter) {
        // Dal footer torna su
        scrollBackFromFooter();
    } else {
        // Dal testo, scendi di una sezione o vai al footer
        const scrollTop = textScrollArea.scrollTop;
        const scrollHeight = textScrollArea.scrollHeight - textScrollArea.clientHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        if (scrollPercentage >= 95) {
            // Fine del testo, vai al footer
            goToFooter();
        } else {
            // Scendi nel testo
            scrollTextContent(400);
        }
    }
}

// Controlla la posizione dello scroll
function checkScrollPosition() {
    if (!footer || !textScrollArea) return;
    
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Verifica se il footer è visibile
    const isFooterVisible = footerRect.top < windowHeight && footerRect.bottom > 0;
    
    if (isFooterVisible && !isAtFooter) {
        // Siamo entrati nel footer
        isAtFooter = true;
        isPageScrollMode = true; // Passiamo allo scroll della pagina
        updateScrollHint();
    } else if (!isFooterVisible && isAtFooter) {
        // Siamo usciti dal footer
        isAtFooter = false;
        isPageScrollMode = false; // Torniamo allo scroll del testo
        updateScrollHint();
    }
}

// Gestione scroll del mouse su tutta la pagina - VERSIONE SEMPLIFICATA
function handleGlobalWheel(e) {
    e.preventDefault();
    
    if (!textScrollArea || !footer) return;
    
    const delta = e.deltaY;
    
    // Se stiamo scorrendo la pagina (footer visibile)
    if (isPageScrollMode || isAtFooter) {
        // Controlla se siamo tornati completamente su
        if (delta < 0 && window.scrollY <= mainContent.offsetTop + mainContent.offsetHeight) {
            // Siamo tornati al contenuto principale
            isPageScrollMode = false;
            isAtFooter = false;
            updateScrollHint();
        }
        // Altrimenti lascia che la pagina scroli normalmente
        return;
    }
    
    // Se siamo nel testo
    const scrollTop = textScrollArea.scrollTop;
    const scrollHeight = textScrollArea.scrollHeight - textScrollArea.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    // Scrolling verso il basso
    if (delta > 0) {
        if (scrollPercentage >= 95) {
            // Fine del testo, vai al footer
            goToFooter();
        } else {
            // Scrolla il testo
            textScrollArea.scrollTop += delta * 0.5;
            detectCurrentSection(textScrollArea.scrollTop);
            updateScrollHint();
        }
    }
    // Scrolling verso l'alto
    else if (delta < 0) {
        // Scrolla il testo verso l'alto
        textScrollArea.scrollTop += delta * 0.5;
        detectCurrentSection(textScrollArea.scrollTop);
        updateScrollHint();
    }
}

// Vai al footer (fine del testo)
function goToFooter() {
    isAtFooter = true;
    isPageScrollMode = true;
    
    // Scorri la pagina per mostrare il footer
    if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
    }
    
    updateScrollHint();
}

// Torna indietro dal footer
function scrollBackFromFooter() {
    isAtFooter = false;
    isPageScrollMode = false;
    
    // Torna al contenuto principale
    if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Imposta lo scroll del testo in fondo
    setTimeout(() => {
        if (textScrollArea) {
            textScrollArea.scrollTop = textScrollArea.scrollHeight - textScrollArea.clientHeight;
            detectCurrentSection(textScrollArea.scrollTop);
        }
        updateScrollHint();
    }, 500);
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
    if (!scrollHint) return;
    
    if (isAtFooter) {
        // Quando siamo al footer, freccia verso l'alto
        scrollHint.textContent = "V";
        scrollHint.classList.add('up-arrow');
        scrollHint.classList.remove('hidden');
    } else {
        // Quando siamo nel testo
        if (!textScrollArea) return;
        
        const scrollTop = textScrollArea.scrollTop;
        const scrollHeight = textScrollArea.scrollHeight - textScrollArea.clientHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        scrollHint.textContent = "V";
        scrollHint.classList.remove('up-arrow');
        scrollHint.classList.remove('hidden');
        
        // Opacità ridotta se siamo alla fine del testo
        scrollHint.style.opacity = scrollPercentage >= 95 ? "0.7" : "1";
    }
}

// Scroll del contenuto testo
function scrollTextContent(pixels) {
    if (!textScrollArea || isAtFooter) return;
    
    textScrollArea.scrollTop += pixels;
    detectCurrentSection(textScrollArea.scrollTop);
    updateScrollHint();
}

// Scrolla a una sezione specifica
function scrollToSection(sectionId) {
    if (!textScrollArea || isAtFooter) return;
    
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    smoothScrollTo(textScrollArea, section.threshold, 600);
    
    // Aggiorna sezione corrente
    updateCurrentSection(sectionId);
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
            if (isAtFooter) {
                // Rimani al footer
                return;
            } else {
                scrollTextContent(100);
            }
            break;
            
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            if (isAtFooter) {
                scrollBackFromFooter();
            } else {
                scrollTextContent(-100);
            }
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            if (!isAtFooter) {
                if (currentSectionId < 3) {
                    scrollToSection(currentSectionId + 1);
                }
            }
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            if (!isAtFooter) {
                if (currentSectionId > 1) {
                    scrollToSection(currentSectionId - 1);
                }
            }
            break;
            
        case '1':
        case '2':
        case '3':
            e.preventDefault();
            if (!isAtFooter) {
                const sectionId = parseInt(e.key);
                if (sectionId >= 1 && sectionId <= 3 && sectionId !== currentSectionId) {
                    scrollToSection(sectionId);
                }
            }
            break;
            
        case 'End':
            e.preventDefault();
            if (!isAtFooter) {
                goToFooter();
            }
            break;
            
        case 'Home':
            e.preventDefault();
            if (isAtFooter) {
                scrollBackFromFooter();
            } else {
                scrollToSection(1);
            }
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
    goToFooter,
    scrollBackFromFooter
};