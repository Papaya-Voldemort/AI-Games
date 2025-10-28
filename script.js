// Game Browser JavaScript
class GameBrowser {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.searchInput = document.getElementById('searchInput');
        this.genreFilter = document.getElementById('genreFilter');
        this.sortBy = document.getElementById('sortBy');
        this.gamesGrid = document.getElementById('gamesGrid');
        this.loadingState = document.getElementById('loadingState');
        this.noResults = document.getElementById('noResults');
        this.totalGames = document.getElementById('totalGames');
        this.displayedGames = document.getElementById('displayedGames');
        
        this.init();
    }
    
    init() {
        this.loadGames();
        this.setupEventListeners();
        this.filterDebounceTimer = null;
    }
    
    setupEventListeners() {
        // Debounce search input for better performance
        this.searchInput.addEventListener('input', () => this.debouncedFilterGames());
        this.genreFilter.addEventListener('change', () => this.filterGames());
        this.sortBy.addEventListener('change', () => this.sortAndDisplayGames());
        
        // Add some keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.target.matches('input, select')) {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }
    
    debouncedFilterGames() {
        // Debounce filter to avoid excessive re-rendering during typing
        clearTimeout(this.filterDebounceTimer);
        this.filterDebounceTimer = setTimeout(() => {
            this.filterGames();
        }, 150); // 150ms debounce
    }
    
    async loadGames() {
        // Game data extracted from the README and directory structure
        this.games = [
            {
                name: 'BitcoinClicker',
                displayName: 'Bitcoin Clicker',
                icon: '₿',
                genre: 'idle',
                description: 'A Bitcoin mining empire builder with hash-solving mechanics, power management, and prestige systems',
                features: ['hash-based clicking', 'progressive mining hardware', 'power management', 'market fluctuations', 'random events', 'prestige system'],
                path: 'BitcoinClicker',
                fullDescription: 'Build a Bitcoin mining empire by solving hashes manually and purchasing automated hardware. Balance power consumption with generator capacity. Watch the market fluctuate and respond to random events. Prestige for permanent Hash Point multipliers.'
            },
            {
                name: 'HadleeKart',
                displayName: 'HadleeKart',
                icon: '🏎️',
                genre: 'racing',
                description: 'A complete top-down 2D racing game with competitive AI and strategic power-ups',
                features: ['8-kart racing', '7 unique AI personalities', 'realistic physics', 'power-up system', 'professional HUD'],
                path: 'HadleeKart',
                fullDescription: 'Race against intelligent AI opponents through 3 laps of intense competition. Collect and use power-ups strategically while mastering drift mechanics and racing lines.'
            },
            {
                name: 'Echoes',
                displayName: 'Echoes of the Forgotten Code',
                icon: '🌐',
                genre: 'puzzle',
                description: 'A sci-fi puzzle adventure where you play as a sentient fragment of a lost neural network',
                features: ['memory reconstruction', 'logic-based hacking', 'moral choices', 'dynamic code interpretation', 'glitchcore aesthetic'],
                path: 'Echoes',
                fullDescription: 'Navigate decaying data landscapes to recover corrupted memories and uncover the mystery behind a vanished AI civilization.'
            },
            {
                name: 'DataStream',
                displayName: 'Data Stream',
                icon: '🧠',
                genre: 'action',
                description: 'A fast-paced pattern matching game where you train your artificial consciousness',
                features: ['progressive difficulty', 'neural integrity system', 'score progression', 'cyberpunk interface', 'mobile-friendly'],
                path: 'DataStream',
                fullDescription: 'Train your AI consciousness by recognizing patterns in endless data streams. Each successful match strengthens your neural pathways.'
            },
            {
                name: 'BounceBlox',
                displayName: 'BounceBlox',
                icon: '🎮',
                genre: 'platformer',
                description: 'A cheerful platforming adventure with a bouncy cube and color-coded block mechanics',
                features: ['snappy physics', 'color-coded blocks', 'star collection', 'single-screen levels', 'particle effects'],
                path: 'BounceBlox',
                fullDescription: 'Control a happy cube through platforming challenges. Collect all stars and reach the exit using different block types.'
            },
            {
                name: 'FreakOut',
                displayName: 'Freak Out',
                icon: '🎭',
                genre: 'adventure',
                description: 'A surreal interactive story where reality breaks down and nothing makes sense',
                features: ['fourth wall breaking', 'reality distortion', 'choice consequences', 'multiple endings', 'meta-narrative'],
                path: 'FreakOut',
                fullDescription: 'Navigate through increasingly bizarre scenarios where logic is optional and causality is more of a guideline. Your sanity and reality level determine your path through the madness.'
            },
            {
                name: 'PixelVault',
                displayName: 'PixelVault',
                icon: '💎',
                genre: 'platformer',
                description: 'A challenging digital platformer with advanced movement mechanics and 12 progressive levels',
                features: ['wall jumping', 'double jump', 'dash ability', '12 challenging levels', 'corrupted platforms', 'moving platforms'],
                path: 'PixelVault',
                fullDescription: 'Navigate corrupted data vaults as a digital entity. Master wall-jumping, double-jumping, and dash abilities to collect all data fragments and breach the system across 12 increasingly challenging levels.'
            },
            {
                name: 'Metroidvania',
                displayName: 'Lost Citadel',
                icon: '🏛️',
                genre: 'adventure',
                description: 'A classic Metroidvania adventure through an ancient citadel filled with secrets and dangers',
                features: ['exploration', 'ability progression', 'combat system', 'boss battles', 'secret areas', 'save system'],
                path: 'Metroidvania',
                fullDescription: 'Explore an ancient citadel filled with secrets and dangers. Unlock new abilities like wall jumping, dash, and double jump to reach previously inaccessible areas. Master combat against diverse enemies and powerful bosses as you uncover the mystery of the Lost Citadel!'
            },
            {
                name: 'HillRider',
                displayName: 'HillRider',
                icon: '🌄',
                genre: 'action',
                description: 'A simple, addictive hill-riding game where players master momentum control over procedurally generated terrain',
                features: ['procedural terrain', 'momentum physics', 'coin collection', 'power-ups', 'high score tracking'],
                path: 'HillRider',
                fullDescription: 'Master the core mechanic of holding to accelerate downhill and releasing to coast uphill. Perfect timing builds momentum for higher speeds.'
            },
            {
                name: 'SkyGlider',
                displayName: 'SkyGlider - Momentum Master',
                icon: '🌤️',
                genre: 'arcade',
                description: 'A momentum-based hill-riding game inspired by Dune and Tiny Wings with smooth physics and beautiful visuals',
                features: ['smooth sine-wave terrain', 'gravity manipulation', 'day-night cycle', 'character selection', 'combo system', 'particle effects'],
                path: 'SkyGlider',
                fullDescription: 'Glide over rolling hills using perfect momentum control. Hold to dive down slopes, release to launch off hills. Features three characters, dynamic lighting, and satisfying physics.'
            },
            {
                name: 'Dune',
                displayName: 'Dune',
                icon: '🏜️',
                genre: 'shooter',
                description: 'A top-down arena shooter where you face off against hilariously incompetent AI bots',
                features: ['arena shooter', 'terrible AI bots', 'wave-based progression', 'health system', 'desert theme'],
                path: 'Dune',
                fullDescription: 'Survive waves of horrible AI bots in a desert arena. The enemies are deliberately designed to be terrible at combat.'
            },
            {
                name: 'IdleBreakout',
                displayName: 'Idle Breakout+',
                icon: '🧱',
                genre: 'idle',
                description: 'A comprehensive idle brick-breaking game with autonomous balls, strategic upgrades, and prestige mechanics',
                features: ['autonomous balls', '4 ball types', 'strategic upgrades', 'offline earnings', 'prestige system'],
                path: 'IdleBreakout',
                fullDescription: 'Watch autonomous balls destroy bricks automatically while you strategically upgrade your arsenal. Master the art of idle optimization!'
            },
            {
                name: 'Ruleweaver',
                displayName: 'Ruleweaver',
                icon: '⚡',
                genre: 'puzzle',
                description: 'A strategic puzzle game exploring rule-based systems and emergent gameplay',
                features: ['rule-based mechanics', 'strategic thinking', 'emergent gameplay', 'complex systems'],
                path: 'Ruleweaver',
                fullDescription: 'Explore strategic rule-based systems in this innovative puzzle game that challenges your understanding of cause and effect.'
            },
            {
                name: 'ByteMiner',
                displayName: 'Byte Miner: Core Collapse',
                icon: '⛏️',
                genre: 'idle',
                description: 'A comprehensive idle mining game where you excavate bytes from digital quarries and unlock quantum technologies',
                features: ['click mining', 'auto miners', 'prestige system', 'quantum lab', 'achievement system', 'multiple upgrade tiers'],
                path: 'ByteMiner',
                fullDescription: 'Mine bytes through manual clicking and automated systems. Unlock upgrades, achieve prestigious milestones, and venture into quantum computing territories to maximize your byte production.'
            },
            {
                name: 'SpaceGuardian',
                displayName: 'Space Guardian',
                icon: '🛡️',
                genre: 'arcade',
                description: 'Defend an ancient space station using your energy shield to deflect cosmic threats',
                features: ['shield mechanics', 'wave-based survival', 'energy management', 'particle effects', 'space theme'],
                path: 'SpaceGuardian',
                fullDescription: 'As the last guardian of an ancient space station, use your energy shield to deflect waves of asteroids and hostile entities. Master energy management and precise positioning to survive!'
            },
            {
                name: 'Aether',
                displayName: 'Echoes of Aether',
                icon: '🌀',
                genre: 'adventure',
                description: 'A 2D side-scrolling action platformer where you explore fragmented mythical realms and unlock ancient abilities',
                features: ['metroidvania progression', 'ability unlocks', 'procedural rooms', 'mythical zones', 'persistent upgrades', 'combat system'],
                path: 'Aether',
                fullDescription: 'You are Nyra, a soul-forged warrior awakened in the mythical void. Explore fragmented realms, collect Aether Coins, and unlock movement abilities that persist across runs. Master combat, platforming, and progression as you restore balance to the shattered world of Aether.'
            },
            {
                name: 'TerminalVelocity',
                displayName: 'Terminal Velocity',
                icon: '🔬',
                genre: 'adventure',
                description: 'A fast-paced, grid-based cyberpunk roguelike where you play as V0-LT, a rogue AI escaping deletion',
                features: ['grid-based movement', 'node hacking puzzles', 'enemy AI', 'story system', 'abilities (cloak, pulse, dash)', 'procedural levels'],
                path: 'Terminal Velocity',
                fullDescription: 'You are V0-LT, a rogue AI escaping deletion by infiltrating procedurally generated networks. Hack nodes, avoid enemies, and uncover the truth about your creation across 10 network layers. Features minimalist visuals, modular systems, and rich branching story.'
            },
            {
                name: 'HandOfFate',
                displayName: 'Hand of Fate',
                icon: '🎴',
                genre: 'adventure',
                description: 'A deck-building card adventure game where your destiny is determined by the cards you draw',
                features: ['deck-building', 'card encounters', 'turn-based combat', 'resource management', 'progressive difficulty', 'boss battles'],
                path: 'HandOfFate',
                fullDescription: 'Navigate through encounters, battle enemies, collect treasures, and survive curses in this roguelike card game experience. Draw cards to reveal challenges and opportunities as you build your deck and manage health, gold, and fame to survive increasingly difficult levels.'
            }
        ];
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.filteredGames = [...this.games];
        this.sortAndDisplayGames();
        this.updateStats();
        this.hideLoading();
    }
    
    filterGames() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const selectedGenre = this.genreFilter.value;
        
        this.filteredGames = this.games.filter(game => {
            const matchesSearch = !searchTerm || 
                game.name.toLowerCase().includes(searchTerm) ||
                game.displayName.toLowerCase().includes(searchTerm) ||
                game.description.toLowerCase().includes(searchTerm) ||
                game.features.some(feature => feature.toLowerCase().includes(searchTerm));
            
            const matchesGenre = !selectedGenre || game.genre === selectedGenre;
            
            return matchesSearch && matchesGenre;
        });
        
        this.sortAndDisplayGames();
        this.updateStats();
    }
    
    sortAndDisplayGames() {
        const sortBy = this.sortBy.value;
        
        switch (sortBy) {
            case 'name':
                this.filteredGames.sort((a, b) => a.displayName.localeCompare(b.displayName));
                break;
            case 'genre':
                this.filteredGames.sort((a, b) => a.genre.localeCompare(b.genre) || a.displayName.localeCompare(b.displayName));
                break;
            case 'newest':
                // For now, reverse alphabetical as a placeholder for "newest"
                this.filteredGames.sort((a, b) => b.displayName.localeCompare(a.displayName));
                break;
        }
        
        this.displayGames();
    }
    
    displayGames() {
        if (this.filteredGames.length === 0) {
            this.showNoResults();
            return;
        }
        
        this.hideNoResults();
        
        const gamesHTML = this.filteredGames.map((game, index) => {
            return `
                <div class="game-card" style="animation-delay: ${index * 0.1}s" onclick="this.querySelector('.play-button').click()">
                    <div class="game-header">
                        <div class="game-icon">${game.icon}</div>
                        <h2 class="game-title">${game.displayName}</h2>
                    </div>
                    <p class="game-description">${game.description}</p>
                    <div class="game-features">
                        ${game.features.slice(0, 3).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                        ${game.features.length > 3 ? `<span class="feature-tag">+${game.features.length - 3} more</span>` : ''}
                    </div>
                    <div class="game-meta">
                        <span class="game-genre">${game.genre}</span>
                        <a href="${game.path}" class="play-button">Play Game</a>
                    </div>
                </div>
            `;
        }).join('');
        
        this.gamesGrid.innerHTML = gamesHTML;
        
        // Add staggered animation
        const cards = this.gamesGrid.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    updateStats() {
        this.totalGames.textContent = this.games.length;
        this.displayedGames.textContent = this.filteredGames.length;
        
        // Add a nice counting animation
        this.animateNumber(this.displayedGames, this.filteredGames.length);
    }
    
    animateNumber(element, targetNumber) {
        const startNumber = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = Date.now();
        
        const updateNumber = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentNumber = Math.round(startNumber + (targetNumber - startNumber) * progress);
            
            element.textContent = currentNumber;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    hideLoading() {
        this.loadingState.classList.add('hidden');
    }
    
    showNoResults() {
        this.noResults.classList.remove('hidden');
        this.gamesGrid.innerHTML = '';
    }
    
    hideNoResults() {
        this.noResults.classList.add('hidden');
    }
}

// Auto-detection functionality for new games
class GameDetector {
    constructor() {
        this.knownGames = new Set();
        this.initKnownGames();
    }
    
    initKnownGames() {
        // Initialize with current known games
        const currentGames = ['BounceBlox', 'DataStream', 'Dune', 'Echoes', 'HadleeKart', 'HillRider', 'IdleBreakout', 'Ruleweaver', 'SpaceGuardian'];
        currentGames.forEach(game => this.knownGames.add(game));
    }
    
    async detectNewGames() {
        // In a real scenario, this would scan the file system or make API calls
        // For now, we'll simulate the detection process
        try {
            // This would typically fetch directory listings or use a file system API
            const detectedDirectories = await this.scanDirectories();
            const newGames = detectedDirectories.filter(dir => !this.knownGames.has(dir));
            
            if (newGames.length > 0) {
                console.log('New games detected:', newGames);
                // In a real implementation, you'd update the games list and refresh the display
                this.notifyNewGames(newGames);
            }
        } catch (error) {
            console.log('Game detection not available in this environment');
        }
    }
    
async scanDirectories() {
    // Placeholder for directory scanning
    // In a real implementation, this would use File System Access API or server-side scanning
    return [
        'BounceBlox',
        'DataStream',
        'Dune',
        'Echoes',
        'HadleeKart',
        'HillRider',
        'IdleBreakout',
        'PixelVault',
        'Ruleweaver',
        'SpaceGuardian'
    ];
}
    
    notifyNewGames(newGames) {
        // Create a notification for new games
        const notification = document.createElement('div');
        notification.className = 'new-game-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎮 New Games Detected!</h3>
                <p>Found ${newGames.length} new game${newGames.length > 1 ? 's' : ''}: ${newGames.join(', ')}</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the game browser when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const gameBrowser = new GameBrowser();
    
    // Removed unnecessary polling for game detection - games are static in this repo
    // If dynamic game detection is needed in the future, use file system events instead

    // Add some keyboard shortcuts help
    const helpText = document.createElement('div');
    helpText.className = 'keyboard-help';
    helpText.innerHTML = `
        <div class="help-tooltip">
            <span class="help-trigger">?</span>
            <div class="help-content">
                <h4>Keyboard Shortcuts</h4>
                <p><kbd>/</kbd> - Focus search</p>
                <p><kbd>Esc</kbd> - Clear search</p>
            </div>
        </div>
    `;
    document.body.appendChild(helpText);
    
    // Add ESC to clear search
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.activeElement === gameBrowser.searchInput) {
            gameBrowser.searchInput.value = '';
            gameBrowser.filterGames();
        }
    });
});

// Add some additional CSS for notifications and help
const additionalStyles = `
    .new-game-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(0, 255, 170, 0.2), rgba(0, 255, 170, 0.1));
        border: 2px solid #00ffaa;
        border-radius: 12px;
        padding: 1rem;
        max-width: 300px;
        z-index: 1000;
        animation: slideInRight 0.5s ease-out;
    }
    
    .notification-content h3 {
        color: #00ffaa;
        margin-bottom: 0.5rem;
        font-family: 'Orbitron', monospace;
    }
    
    .notification-content p {
        color: #88ffcc;
        margin-bottom: 1rem;
    }
    
    .notification-content button {
        background: #00ffaa;
        color: #000;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Share Tech Mono', monospace;
    }
    
    .keyboard-help {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    .help-trigger {
        display: inline-block;
        width: 40px;
        height: 40px;
        background: rgba(0, 255, 170, 0.2);
        border: 2px solid #00ffaa44;
        border-radius: 50%;
        text-align: center;
        line-height: 36px;
        color: #00ffaa;
        cursor: pointer;
        font-family: 'Orbitron', monospace;
        font-weight: bold;
    }
    
    .help-content {
        display: none;
        position: absolute;
        bottom: 50px;
        right: 0;
        background: rgba(26, 10, 42, 0.95);
        border: 2px solid #00ffaa44;
        border-radius: 8px;
        padding: 1rem;
        min-width: 200px;
    }
    
    .help-trigger:hover + .help-content {
        display: block;
    }
    
    .help-content h4 {
        color: #00ffaa;
        margin-bottom: 0.5rem;
        font-family: 'Orbitron', monospace;
    }
    
    .help-content p {
        color: #88ffcc;
        margin-bottom: 0.25rem;
    }
    
    kbd {
        background: rgba(0, 255, 170, 0.2);
        color: #00ffaa;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.8rem;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
