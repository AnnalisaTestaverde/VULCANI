/**
 * METHODOLOGY PAGE - UNICO FILE JS
 * Gestisce testo, immagini, bottoni e footer HTML
 */

// ===== CONFIGURAZIONE =====
const sections = [
    {
        id: 1,
        title: "METHODOLOGY",
        subtitle: "HOW WE BUILT OUR VISUAL STORY.",
        imageId: "methodology-image-1",
        buttonText: "Explore the dataset",
        buttonLink: "https://www.ngdc.noaa.gov/hazel/view/hazards/volcano/event-data",
        threshold: 0
    },
    {
        id: 2,
        title: "OVERVIEW VISUALIZATION",
        subtitle: "HOW WE VISUALIZE ERUPTION DATA.",
        imageId: "methodology-image-2",
        buttonText: "Explore all eruptions",
        buttonLink: "overview.html",
        threshold: 500
    },
    {
        id: 3,
        title: "DATA INTERPRETATION",
        subtitle: "HOW WE INTERPRET AND PRESENT DATA.",
        imageId: "methodology-image-3",
        buttonText: "Explore the detail graphs",
        buttonLink: "learn_more_detail.html",
        threshold: 1400
    }
];

// ===== VARIABILI GLOBALI =====
let currentSectionId = 1;
let isScrolling = false;
let isAtFooter = false;
let textScrollArea = null;
let mainContent = null;
let footer = null;
let scrollHint = null;
let isScrollLocked = false;

// ===== DATI FOOTER HTML =====
const FOOTER_HTML = `
<div class="footer-content">
    <div class="footer-column">
        <h3>Computer Graphics Studio for Information Design</h3>
        <p>A.Y. 2025/2026</p>
        <p>Bachelor's Degree in Communication Design</p>
        
        <h3 style="margin-top: 40px;">Project by</h3>
        <ul>
            <li>Alice Comini</li>
            <li>Matilde Curino</li>
            <li>Greta Franco</li>
            <li>Carlo Galli</li>
            <li>Ilaria La Spada</li>
            <li>Annalisa Testaverde</li>
        </ul>
    </div>
    
    <div class="footer-column">
        <p>© CC-BY 4.0 The authors.</p>
        <p class="footer-license">
            Except where otherwise noted, all content on this website is licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). You are free to share and adapt the material, including for commercial use, provided appropriate credit is given.
        </p>
        
        <p>For questions about attribution or reuse, contact us at:</p>
        <ul>
            <li><a href="mailto:alice.comini@mail.polimi.it" class="footer-email">alice.comini@mail.polimi.it</a></li>
            <li><a href="mailto:matilde.curino@mail.polimi.it" class="footer-email">matilde.curino@mail.polimi.it</a></li>
            <li><a href="mailto:greta.franco@mail.polimi.it" class="footer-email">greta.franco@mail.polimi.it</a></li>
            <li><a href="mailto:carlo11.galli@mail.polimi.it" class="footer-email">carlo11.galli@mail.polimi.it</a></li>
            <li><a href="mailto:ilaria.laspada@mail.polimi.it" class="footer-email">ilaria.laspada@mail.polimi.it</a></li>
            <li><a href="mailto:annalisa.testaverde@mail.polimi.it" class="footer-email">annalisa.testaverde@mail.polimi.it</a></li>
        </ul>
    </div>
    
    <div class="footer-column">
        <h3>Faculty</h3>
        <ul>
            <li>Michele Mauri</li>
            <li>Davide Conficconi</li>
        </ul>
        
        <h3 style="margin-top: 40px;">Teaching Assistants</h3>
        <ul>
            <li>Alessandra Facchin</li>
            <li>Alessandro Nazzari</li>
        </ul>
        
        <div class="footer-logo">
            DensityDesign Lab<br>
            NECST
        </div>
    </div>
</div>
`;

// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    // Salva riferimenti agli elementi
    textScrollArea = document.querySelector('.text-content');
    mainContent = document.getElementById('main-content');
    scrollHint = document.getElementById('text-scroll-hint');
    
    // Crea il footer HTML
    createHTMLFooter();
    
    // Imposta i riferimenti dopo la creazione
    footer = document.getElementById('html-footer');
    
    // Configura event listener
    setupEventListeners();
    
    // Calcola soglie scroll
    calculateScrollThresholds();
    
    // Configura gestione errori immagine
    setupImageErrorHandler();
    
    // Inizializza la freccia di scroll
    updateScrollHint();
    
    console.log("Pagina inizializzata. Footer creato.");
}

// ===== GESTIONE FOOTER HTML =====
function createHTMLFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;
    
    const footerDiv = document.createElement('div');
    footerDiv.id = 'html-footer';
    footerDiv.className = 'footer';
    footerDiv.innerHTML = FOOTER_HTML;
    
    footerContainer.appendChild(footerDiv);
}

// ===== EVENT LISTENER =====
function setupEventListeners() {
    // Scroll del mouse
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
    setupLearnMoreButton();
    
    // Tasti freccia
    document.addEventListener('keydown', handleKeyDown);
    
    // Resize
    window.addEventListener('resize', calculateScrollThresholds);
    
    // Scroll per controllare footer
    window.addEventListener('scroll', checkScrollPosition);
}

function setupLearnMoreButton() {
    const button = document.getElementById('learn-more-btn');
    if (!button) return;
    
    // Rimuovi eventuali listener precedenti
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Aggiungi nuovo listener
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

// ===== GESTIONE SCROLL =====
function handleGlobalWheel(e) {
    if (isScrollLocked) return;
    
    e.preventDefault();
    
    if (!textScrollArea) return;
    
    const delta = e.deltaY;
    const scrollTop = textScrollArea.scrollTop;
    const scrollHeight = textScrollArea.scrollHeight - textScrollArea.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    // Se siamo nel footer
    if (isAtFooter) {
        // Scroll verso l'alto dal footer
        if (delta < 0 && window.scrollY <= mainContent.offsetTop + mainContent.offsetHeight) {
            scrollBackFromFooter();
        }
        // Scroll verso il basso - permetti scroll normale della pagina
        return;
    }
    
    // Se siamo nel testo
    if (delta > 0) { // SCROLL VERSO IL BASSO
        if (scrollPercentage >= 98) {
            // Fine del testo, vai al footer
            goToFooter();
        } else {
            // Scrolla il testo
            textScrollArea.scrollTop += delta * 0.5;
            detectCurrentSection(textScrollArea.scrollTop);
            updateScrollHint();
        }
    } else if (delta < 0) { // SCROLL VERSO L'ALTO
        textScrollArea.scrollTop += delta * 0.5;
        detectCurrentSection(textScrollArea.scrollTop);
        updateScrollHint();
    }
}

function checkScrollPosition() {
    if (!textScrollArea || !footer) return;
    
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Se il footer è visibile (nella viewport)
    if (footerRect.top < windowHeight && footerRect.bottom > 0) {
        if (!isAtFooter) {
            isAtFooter = true;
            footer.classList.add('visible');
            updateScrollHint();
        }
    } else {
        if (isAtFooter) {
            isAtFooter = false;
            footer.classList.remove('visible');
            updateScrollHint();
        }
    }
}

// ===== FUNZIONI SCROLL =====
function handleScrollHintClick() {
    if (isAtFooter) {
        scrollBackFromFooter();
    } else {
        const scrollTop = textScrollArea.scrollTop;
        const scrollHeight = textScrollArea.scrollHeight - textScrollArea.clientHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        if (scrollPercentage >= 95) {
            goToFooter();
        } else {
            scrollTextContent(400);
        }
    }
}

function goToFooter() {
    if (isScrollLocked || !footer) return;
    
    isScrollLocked = true;
    isAtFooter = true;
    
    // Mostra il footer
    footer.classList.add('visible');
    
    // Scorri fino al footer
    footer.scrollIntoView({ behavior: 'smooth' });
    
    updateScrollHint();
    
    // Sblocca dopo 500ms
    setTimeout(() => {
        isScrollLocked = false;
    }, 500);
}

function scrollBackFromFooter() {
    if (isScrollLocked || !textScrollArea) return;
    
    isScrollLocked = true;
    isAtFooter = false;
    
    // Nascondi il footer
    footer.classList.remove('visible');
    
    // Torna al contenuto principale
    mainContent.scrollIntoView({ behavior: 'smooth' });
    
    // Imposta scroll del testo in fondo
    setTimeout(() => {
        textScrollArea.scrollTop = textScrollArea.scrollHeight - textScrollArea.clientHeight;
        detectCurrentSection(textScrollArea.scrollTop);
        updateScrollHint();
        isScrollLocked = false;
    }, 500);
}

function scrollTextContent(pixels) {
    if (!textScrollArea || isAtFooter) return;
    
    textScrollArea.scrollTop += pixels;
    detectCurrentSection(textScrollArea.scrollTop);
    updateScrollHint();
}

// ===== GESTIONE SEZIONI =====
function calculateScrollThresholds() {
    const textSections = document.querySelectorAll('.text-section');
    
    if (textSections.length >= 3) {
        sections[1].threshold = textSections[0].offsetHeight - 100;
        sections[2].threshold = textSections[0].offsetHeight + textSections[1].offsetHeight - 100;
    }
}

function detectCurrentSection(scrollTop) {
    let newSectionId = currentSectionId;
    
    for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollTop >= sections[i].threshold) {
            newSectionId = sections[i].id;
            break;
        }
    }
    
    if (newSectionId !== currentSectionId) {
        updateCurrentSection(newSectionId);
    }
}

function updateCurrentSection(sectionId) {
    currentSectionId = sectionId;
    const section = sections.find(s => s.id === sectionId);
    
    if (!section) return;
    
    // Aggiorna titolo
    updateTitle(section.title, section.subtitle);
    
    // Aggiorna immagine
    updateImage(section.imageId);
    
    // Aggiorna bottone
    updateButton(section.buttonText, section.buttonLink);
    
    // Aggiorna indicatori
    updateIndicators(sectionId);
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
    
    // Ricrea il listener con il nuovo link
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

function updateIndicators(sectionId) {
    document.querySelectorAll('.screen-dot').forEach(dot => {
        dot.classList.remove('active');
    });
    
    const currentDot = document.querySelector(`.screen-dot[data-section="${sectionId}"]`);
    if (currentDot) {
        currentDot.classList.add('active');
    }
}

function updateScrollHint() {
    if (!scrollHint) return;
    
    if (isAtFooter) {
        scrollHint.textContent = "V";
        scrollHint.classList.add('up-arrow');
        scrollHint.classList.remove('hidden');
    } else {
        if (!textScrollArea) return;
        
        const scrollTop = textScrollArea.scrollTop;
        const scrollHeight = textScrollArea.scrollHeight - textScrollArea.clientHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        scrollHint.textContent = "V";
        scrollHint.classList.remove('up-arrow');
        scrollHint.classList.remove('hidden');
        scrollHint.style.opacity = scrollPercentage >= 95 ? "0.7" : "1";
    }
}

// ===== FUNZIONI UTILITY =====
function scrollToSection(sectionId) {
    if (!textScrollArea || isAtFooter) return;
    
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    smoothScrollTo(textScrollArea, section.threshold, 600);
    updateCurrentSection(sectionId);
}

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

function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
            e.preventDefault();
            if (!isAtFooter) scrollTextContent(100);
            break;
            
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            if (isAtFooter) scrollBackFromFooter();
            else scrollTextContent(-100);
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            if (!isAtFooter && currentSectionId < 3) scrollToSection(currentSectionId + 1);
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            if (!isAtFooter && currentSectionId > 1) scrollToSection(currentSectionId - 1);
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
            if (!isAtFooter) goToFooter();
            break;
            
        case 'Home':
            e.preventDefault();
            if (isAtFooter) scrollBackFromFooter();
            else scrollToSection(1);
            break;
    }
}

function setupImageErrorHandler() {
    const images = document.querySelectorAll('.methodology-image');
    images.forEach(image => {
        image.onerror = function() {
            const placeholders = ['Methodology Overview', 'Overview Visualization', 'Data Interpretation'];
            const index = parseInt(this.id.split('-')[3]) - 1;
            const text = placeholders[index] || 'Methodology Image';
            
            this.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f8f8f8"/><text x="200" y="160" text-anchor="middle" fill="%23FF2B00" font-family="Arial" font-size="16" font-weight="bold">${text}</text><text x="200" y="190" text-anchor="middle" fill="%23999" font-family="Arial" font-size="12">Visualization preview</text></svg>`;
            this.alt = `Placeholder for ${text}`;
        };
    });
}

// ===== ESPORTA FUNZIONI =====
window.methodology = {
    scrollToSection,
    currentSection: () => currentSectionId,
    goToFooter,
    scrollBackFromFooter
};