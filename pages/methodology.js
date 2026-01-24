/**
 * METHODOLOGY PAGE - MAIN JAVASCRIPT
 * Gestione delle schermate, testo dinamico e transizioni
 */

// Dati testuali per ogni schermata
const screenData = [
    {
        id: 'screen1',
        title: 'METHODOLOGY',
        subtitle: 'HOW WE BUILT OUR VISUAL STORY.',
        content: `
            <div class="text-scroll-area">
                <div class="text-content">
                    <div class="section-title">OUR DESIGN METHODOLOGY</div>
                    <div class="section-text">
                        To tell the story of volcanic eruptions in a meaningful and accessible way, we began with a trusted scientific source: the volcano dataset provided by <span class="bold-white">NOAA – National Centers for Environmental Information (National Oceanic and Atmospheric Administration)</span>.
                    </div>
                    
                    <div class="section-title">DATA ORGANIZATION</div>
                    <div class="section-text">
                        We first restructured the dataset into three thematic macro-categories:
                    </div>
                    
                    <ul class="impact-list">
                        <li><span class="bold-white">CORE INFORMATION</span> - Volcano name, eruption date, geographic location</li>
                        <li><span class="bold-white">SECONDARY DETAILS</span> - Volcano type, historical context</li>
                        <li><span class="bold-white">IMPACT METRICS</span> - Human, structural, and economic effects</li>
                    </ul>
                    
                    <div class="section-text">
                        Based on this structure, we defined two complementary levels of visualization:
                    </div>
                    
                    <ul class="impact-list">
                        <li>An <span class="bold-white">OVERVIEW</span> to quickly compare eruptions at a glance</li>
                        <li>A <span class="bold-white">DETAILED VIEW</span> to explore individual events in depth</li>
                    </ul>
                    
                    <div style="height: 150px;"></div>
                </div>
            </div>
        `
    },
    {
        id: 'screen2',
        title: 'OVERVIEW VISUALIZATION',
        subtitle: '',
        content: `
            <div class="text-scroll-area">
                <div class="text-content">
                    <div class="section-title">OVERVIEW VISUALIZATION</div>
                    <div class="section-text">
                        In the overview, each eruption is represented by four key elements:
                    </div>
                    
                    <ul class="impact-list">
                        <li><span class="bold-white">YEAR AND TIME PERIOD</span> of the event</li>
                        <li><span class="bold-white">NAME OF THE VOLCANO</span></li>
                        <li><span class="bold-white">VEI (VOLCANIC EXPLOSIVITY INDEX)</span></li>
                        <li><span class="bold-white">OVERALL IMPACT SCORE</span>, derived from five standardized impact categories</li>
                    </ul>
                    
                    <div class="section-text">
                        Each eruption receives a <span class="bold-white">TOTAL IMPACT SCORE</span> by summing the values across all five categories. This score ranges from <span class="bold-white">1 (MINIMAL IMPACT)</span> to <span class="bold-white">20 (MAXIMUM SEVERITY)</span>, enabling direct comparison between events.
                    </div>
                    
                    <div class="section-title">IMPACT CATEGORIES</div>
                    <div class="section-text">
                        The impact categories are defined as follows:
                    </div>
                    
                    <table class="impact-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Level 1</th>
                                <th>Level 2</th>
                                <th>Level 3</th>
                                <th>Level 4</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Deaths</td>
                                <td>1–50</td>
                                <td>51–100</td>
                                <td>101–1,000</td>
                                <td>1,001+</td>
                            </tr>
                            <tr>
                                <td>Injuries</td>
                                <td>1–50</td>
                                <td>51–100</td>
                                <td>101–1,000</td>
                                <td>1,001+</td>
                            </tr>
                            <tr>
                                <td>Houses Destroyed</td>
                                <td>1–50</td>
                                <td>51–100</td>
                                <td>101–1,000</td>
                                <td>1,001+</td>
                            </tr>
                            <tr>
                                <td>Missing</td>
                                <td>1–50</td>
                                <td>51–100</td>
                                <td>101–1,000</td>
                                <td>1,001+</td>
                            </tr>
                            <tr>
                                <td>Economic Damage*</td>
                                <td>&lt; $1 million - NONE</td>
                                <td>$1–5 million - LIMITED</td>
                                <td>$5–24 million - SEVERE</td>
                                <td>≥ $25 million -</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="table-note">
                        *For those events not offering a monetary evaluation of damage, the following five-level scale was used to classify damage (1990 dollars) and was listed in the Damage De column. If the actual dollar amount of damage was listed, a descriptor was also added for search purposes. When possible, a rough estimate was made of the dollar amount of damage based upon the description provided, in order to choose the damage category. In many cases, only a single descriptive term was available. These terms were converted to the damage categories based upon the authors apparent use of the term elsewhere. In the absence of other information, LIMITED is considered synonymous with slight, minor, and light, SEVERE as synonymous with major, extensive, and heavy, and EXTREME as synonymous with catastrophic. Note: The descriptive terms relate approximately to current dollar values.
                    </div>
                    
                    <div style="height: 150px;"></div>
                </div>
            </div>
        `
    },
    {
        id: 'screen3',
        title: 'DATA INTERPRETATION',
        subtitle: '',
        content: `
            <div class="text-scroll-area">
                <div class="text-content">
                    <div class="section-title">DATA INTERPRETATION</div>
                    <div class="section-text">
                        In this chart, some segments may appear in gray with a hover label reading <span class="bold-white">"NO DATA AVAILABLE."</span> This indicates that, for this specific eruption, the original dataset lacks reliable information for that impact category—not that no impact occurred, but that it was not documented or quantified in the source.
                    </div>
                    
                    <div class="section-text">
                        Our approach to data interpretation emphasizes <span class="bold-white">TRANSPARENCY</span> about data limitations. When information is missing or uncertain, we clearly indicate this to users rather than making assumptions or interpolating values.
                    </div>
                    
                    <div class="section-text">
                        This methodology ensures that our visualizations remain both <span class="bold-white">SCIENTIFICALLY ACCURATE</span> and <span class="bold-white">ETHICALLY RESPONSIBLE</span>, providing users with a clear understanding of both what we know and what we don't know about each volcanic event.
                    </div>
                    
                    <div class="section-title">VISUALIZATION PRINCIPLES</div>
                    
                    <ul class="impact-list">
                        <li><span class="bold-white">CLARITY OVER COMPLEXITY</span> - Prioritize understandable representations</li>
                        <li><span class="bold-white">ACCURACY OVER AESTHETICS</span> - Never sacrifice truth for visual appeal</li>
                        <li><span class="bold-white">TRANSPARENCY OVER ASSUMPTION</span> - Clearly indicate data gaps and limitations</li>
                        <li><span class="bold-white">CONTEXT OVER ISOLATION</span> - Show data in historical and geographical context</li>
                    </ul>
                    
                    <div class="section-text">
                        By adhering to these principles, we create visualizations that are not only informative but also honest about the limitations of the underlying data, allowing users to draw meaningful conclusions while understanding the boundaries of what can be known from the available information.
                    </div>
                    
                    <div style="height: 150px;"></div>
                </div>
            </div>
        `
    }
];

// Stato dell'applicazione
let currentScreen = 0;
let isTransitioning = false;
let isScrollLocked = false;

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    // Carica il contenuto iniziale
    loadScreenContent(0);
    
    // Configura gli event listener
    setupEventListeners();
    
    // Configura gestione errori immagine
    setupImageErrorHandler();
    
    // Inizializza i pallini indicatori
    updateScreenIndicator(0);
    
    // Regola le posizioni in base all'altezza dello schermo
    adjustPositionsForScreenHeight();
    
    // Ascolta il resize della finestra
    window.addEventListener('resize', adjustPositionsForScreenHeight);
});

// Carica il contenuto di una schermata
function loadScreenContent(screenIndex) {
    const screen = screenData[screenIndex];
    const screenElement = document.getElementById(screen.id);
    
    if (!screenElement) return;
    
    // Aggiorna il titolo se necessario
    const titleElement = screenElement.querySelector('.screen-title');
    if (titleElement && screen.title) {
        titleElement.textContent = screen.title;
    }
    
    const subtitleElement = screenElement.querySelector('.screen-subtitle');
    if (subtitleElement) {
        if (screen.subtitle) {
            subtitleElement.textContent = screen.subtitle;
            subtitleElement.style.display = 'block';
        } else {
            subtitleElement.style.display = 'none';
        }
    }
    
    // Carica il contenuto nel container
    const container = screenElement.querySelector('#text-container');
    if (container) {
        container.innerHTML = screen.content;
        
        // Aggiungi event listener per lo scroll del testo
        const scrollArea = container.querySelector('.text-scroll-area');
        if (scrollArea) {
            // Resetta lo scroll all'inizio
            scrollArea.scrollTop = 0;
            
            scrollArea.addEventListener('scroll', () => {
                updateScrollHintVisibility(screenIndex, scrollArea);
            });
            
            // Inizializza la visibilità della freccia
            updateScrollHintVisibility(screenIndex, scrollArea);
        }
    }
}

// Configura tutti gli event listener
function setupEventListeners() {
    // Scroll del mouse su tutto il documento
    document.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    // Tasti freccia
    document.addEventListener('keydown', handleKeyDown);
    
    // Click sulla freccia di scroll
    document.querySelectorAll('.scroll-hint').forEach(hint => {
        hint.addEventListener('click', () => {
            if (!isTransitioning && !isScrollLocked) {
                // Controlla se abbiamo letto tutto il testo
                if (checkIfTextFullyRead(currentScreen)) {
                    // Vai alla schermata successiva se possibile
                    if (currentScreen < screenData.length - 1) {
                        goToScreen(currentScreen + 1);
                    }
                } else {
                    // Altrimenti scrolla il testo
                    const screenElement = document.getElementById(screenData[currentScreen].id);
                    const scrollArea = screenElement.querySelector('.text-scroll-area');
                    if (scrollArea) {
                        scrollArea.scrollTop += 300;
                    }
                }
            }
        });
    });
    
    // Click sugli indicatori delle schermate
    document.querySelectorAll('.screen-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const screenIndex = parseInt(this.getAttribute('data-screen'));
            if (!isTransitioning && !isScrollLocked && screenIndex !== currentScreen) {
                // Permetti di andare a qualsiasi schermata (anche indietro)
                goToScreen(screenIndex);
            }
        });
    });
    
    // Bottoni Learn More
    document.querySelectorAll('.learn-more-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Learn more functionality will be implemented here');
        });
    });
}

// Controlla se il testo è stato letto completamente
function checkIfTextFullyRead(screenIndex) {
    const screenElement = document.getElementById(screenData[screenIndex].id);
    const scrollArea = screenElement.querySelector('.text-scroll-area');
    
    if (!scrollArea) return true;
    
    const scrollTop = scrollArea.scrollTop;
    const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    // Considera il testo letto quando siamo al 95% o più
    return scrollPercentage >= 95;
}

// Gestione scroll del mouse
function handleMouseWheel(e) {
    if (isTransitioning || isScrollLocked) return;
    
    e.preventDefault();
    
    const screen = screenData[currentScreen];
    const screenElement = document.getElementById(screen.id);
    const scrollArea = screenElement.querySelector('.text-scroll-area');
    
    if (!scrollArea) return;
    
    const delta = e.deltaY;
    const scrollTop = scrollArea.scrollTop;
    const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    // Scroll verso il basso
    if (delta > 0) {
        // Se abbiamo letto tutto il testo E non siamo all'ultima schermata
        if (scrollPercentage >= 95 && currentScreen < screenData.length - 1) {
            goToScreen(currentScreen + 1);
        } else {
            // Altrimenti scrolla normalmente il testo
            scrollArea.scrollTop += delta * 0.5;
        }
    }
    // Scroll verso l'alto
    else if (delta < 0) {
        // Se siamo in cima E non siamo alla prima schermata
        if (scrollTop <= 5 && currentScreen > 0) {
            // Permetti di tornare alla schermata precedente SENZA controllare se abbiamo letto tutto
            goToScreen(currentScreen - 1);
        } else {
            // Altrimenti scrolla normalmente il testo verso l'alto
            scrollArea.scrollTop += delta * 0.5;
        }
    }
    
    // Aggiorna visibilità freccia
    updateScrollHintVisibility(currentScreen, scrollArea);
}

// Gestione tasti freccia
function handleKeyDown(e) {
    if (isTransitioning || isScrollLocked) return;
    
    const screen = screenData[currentScreen];
    const screenElement = document.getElementById(screen.id);
    const scrollArea = screenElement.querySelector('.text-scroll-area');
    
    if (!scrollArea) return;
    
    const scrollTop = scrollArea.scrollTop;
    const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
            e.preventDefault();
            if (scrollPercentage >= 95 && currentScreen < screenData.length - 1) {
                goToScreen(currentScreen + 1);
            } else {
                scrollArea.scrollTop += 100;
            }
            break;
            
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            if (scrollTop <= 5 && currentScreen > 0) {
                // Permetti di tornare indietro SENZA controllare se abbiamo letto tutto
                goToScreen(currentScreen - 1);
            } else {
                scrollArea.scrollTop -= 100;
            }
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            if (currentScreen < screenData.length - 1) {
                // Vai avanti solo se abbiamo letto tutto
                if (checkIfTextFullyRead(currentScreen)) {
                    goToScreen(currentScreen + 1);
                }
            }
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            if (currentScreen > 0) {
                // Permetti di tornare indietro SEMPRE
                goToScreen(currentScreen - 1);
            }
            break;
            
        case '1':
        case '2':
        case '3':
            e.preventDefault();
            const screenIndex = parseInt(e.key) - 1;
            if (screenIndex >= 0 && screenIndex < screenData.length && screenIndex !== currentScreen) {
                // Permetti di andare a qualsiasi schermata (anche indietro)
                goToScreen(screenIndex);
            }
            break;
    }
    
    // Aggiorna visibilità freccia
    updateScrollHintVisibility(currentScreen, scrollArea);
}

// Vai a una schermata specifica - CORRETTO
function goToScreen(screenIndex) {
    if (isTransitioning || isScrollLocked || 
        screenIndex < 0 || screenIndex >= screenData.length || 
        screenIndex === currentScreen) return;
    
    // Blocca lo scroll durante la transizione
    isScrollLocked = true;
    isTransitioning = true;
    
    const currentScreenElement = document.getElementById(screenData[currentScreen].id);
    const newScreenElement = document.getElementById(screenData[screenIndex].id);
    
    // Rimuovi la classe active dalla schermata corrente
    currentScreenElement.classList.remove('active');
    
    // BREVE pausa per permettere alla transizione di uscita di iniziare
    setTimeout(() => {
        // Aggiorna lo stato corrente
        currentScreen = screenIndex;
        
        // Aggiungi la classe active alla nuova schermata
        newScreenElement.classList.add('active');
        
        // Carica il contenuto della nuova schermata
        loadScreenContent(currentScreen);
        
        // Aggiorna indicatori - IMPORTANTE: chiama questa funzione
        updateScreenIndicator(currentScreen);
        
        // Sblocca lo scroll dopo che le animazioni sono completate
        setTimeout(() => {
            isTransitioning = false;
            isScrollLocked = false;
        }, 800);
        
    }, 50);
}

// Aggiorna la visibilità della freccia di scroll
function updateScrollHintVisibility(screenIndex, scrollArea) {
    const screenElement = document.getElementById(screenData[screenIndex].id);
    if (!screenElement) return;
    
    const scrollHint = screenElement.querySelector('.scroll-hint');
    if (!scrollHint) return;
    
    // Nella schermata 3, nascondi sempre la freccia
    if (screenIndex === 2) {
        scrollHint.style.opacity = '0';
        scrollHint.style.pointerEvents = 'none';
        return;
    }
    
    if (!scrollArea) {
        scrollArea = screenElement.querySelector('.text-scroll-area');
        if (!scrollArea) return;
    }
    
    const scrollTop = scrollArea.scrollTop;
    const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    // Nascondi solo quando abbiamo letto tutto (95%+) E siamo nell'ultima schermata disponibile
    if (scrollPercentage >= 95 && screenIndex === screenData.length - 2) {
        scrollHint.style.opacity = '0';
        scrollHint.style.pointerEvents = 'none';
    } else {
        // Altrimenti mostra sempre
        scrollHint.style.opacity = '1';
        scrollHint.style.pointerEvents = 'auto';
    }
}

// Aggiorna l'indicatore della schermata - VERSIONE CORRETTA E SEMPLICE
function updateScreenIndicator(screenIndex) {
    // Trova TUTTI i pallini in tutte le schermate
    const allDots = document.querySelectorAll('.screen-dot');
    
    allDots.forEach(dot => {
        const dotScreenIndex = parseInt(dot.getAttribute('data-screen'));
        
        // Rimuovi la classe active da tutti i pallini
        dot.classList.remove('active');
        
        // Aggiungi la classe active solo al pallino corrispondente alla schermata corrente
        if (dotScreenIndex === screenIndex) {
            dot.classList.add('active');
        }
    });
}

// Configura gestione errori immagine
function setupImageErrorHandler() {
    const images = document.querySelectorAll('.methodology-image');
    images.forEach(image => {
        image.onerror = function() {
            // Se l'immagine non si carica, mostra un placeholder specifico
            if (this.id === 'methodology-image-1') {
                this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="200" y="150" text-anchor="middle" fill="%23999" font-family="Arial" font-size="16">Methodology Overview (foto_screen_3.png)</text></svg>';
            } else if (this.id === 'methodology-image-2') {
                this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="200" y="150" text-anchor="middle" fill="%23999" font-family="Arial" font-size="16">Overview Visualization (foto_screen_2.png)</text></svg>';
            } else if (this.id === 'methodology-image-3') {
                this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="200" y="150" text-anchor="middle" fill="%23999" font-family="Arial" font-size="16">Data Interpretation (foto_screen_1.png)</text></svg>';
            }
            this.alt = "Placeholder for methodology visualization";
        };
    });
}

// Regola le posizioni in base all'altezza dello schermo
function adjustPositionsForScreenHeight() {
    const viewportHeight = window.innerHeight;
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    const scrollHints = document.querySelectorAll('.scroll-hint.center-hint');
    const scrollTexts = document.querySelectorAll('.scroll-text');
    
    if (viewportHeight < 700) {
        // Schermi molto corti
        learnMoreButtons.forEach(btn => {
            btn.style.bottom = '50px';
        });
        scrollHints.forEach(hint => {
            hint.style.bottom = '30px';
        });
        scrollTexts.forEach(text => {
            text.style.bottom = '70px';
        });
    } else if (viewportHeight >= 700 && viewportHeight < 900) {
        // Schermi medi
        learnMoreButtons.forEach(btn => {
            btn.style.bottom = '90px';
        });
        scrollHints.forEach(hint => {
            hint.style.bottom = '40px';
        });
        scrollTexts.forEach(text => {
            text.style.bottom = '80px';
        });
    } else {
        // Schermi alti
        learnMoreButtons.forEach(btn => {
            btn.style.bottom = '180px';
        });
        scrollHints.forEach(hint => {
            hint.style.bottom = '50px';
        });
        scrollTexts.forEach(text => {
            text.style.bottom = '90px';
        });
    }
}

// Esporta funzioni utili
window.methodology = {
    goToScreen,
    currentScreen: () => currentScreen,
    isTransitioning: () => isTransitioning,
    isScrollLocked: () => isScrollLocked
};