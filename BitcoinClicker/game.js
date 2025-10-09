

// Bitcoin Clicker - Main Game Logic

const GAME_VERSION = '1.2.0'; // Update this for each new release

class BitcoinClickerGame {
    constructor() {
    this.gameState = this.createDefaultState();
    this.lastPrestigedVersion = null;
        this.lastUpdate = Date.now();
        this.autosaveInterval = null;
        this.gameLoopInterval = null;
        this.eventCheckInterval = null;
        // Force unlock check every second
        setInterval(() => {
            this.checkUnlocks();
        }, 1000);

            // Live stats update every second
            setInterval(() => {
                this.updateUI();
            }, 1000);
        
        // Game configuration
        this.config = {
            hashesPerBTC: 100000000000, // 1e11 hashes = 1 BTC (adjusted)
            tickRate: 100, // Game updates 10 times per second
            eventCheckRate: 5000, // Check for events every 5 seconds
            
            // Market fluctuation
            marketBasePrice: 50000,
            marketVolatility: 0.005, // 0.5% max change per tick
            marketTrendDuration: 30000, // 30 seconds per trend

            // Bitcoin price limits
            maxBitcoinPrice: 10000000, // Example value, adjust as needed
            lowBitcoinPrice: 90000, // Example value, adjust as needed

            // Mining conversion: number of hashes required to produce 1 BTC
            // Increased substantially to avoid early-game snowballing when using loans.
            
            // Event probabilities (per check)
            eventChances: {
                marketCrash: 0.5,
                marketBoom: 0.5,
                halvening: 0.2,
                powerSurge: 1.0,
                hardwareMalfunction: 0.8,
                luckyFind: 1.5
            }
        };
        
    // Mining hardware definitions (real-world USD prices)
    this.hardwareTypes = hardwareTypes;
        
        // Power generator definitions (real-world USD prices)
        this.generatorTypes = [
                        {
                id: 'city',
                name: 'City Power Grid',
                description: 'Harness the power of the city.',
                subcategory: 'Grid',
                baseCost: 35,
                baseCapacity: 50,
                costMultiplier: 1.10,
                unlocked: true
            },
            {
                id: 'solar',
                name: 'Solar Panel Array',
                description: 'Clean renewable energy from the sun.',
                subcategory: 'Renewable',
                baseCost: 500,
                baseCapacity: 500,
                costMultiplier: 1.15,
                unlocked: true
            },
            {
                id: 'diesel',
                name: 'Diesel Generator',
                description: 'Reliable backup power.',
                subcategory: 'Fossil',
                baseCost: 2000,
                baseCapacity: 2000,
                costMultiplier: 1.18,
                unlocked: true
            },
            {
                id: 'hydro',
                name: 'Hydro Turbine',
                description: 'Harness the power of water.',
                subcategory: 'Renewable',
                baseCost: 10000,
                baseCapacity: 15000,
                costMultiplier: 1.20,
                unlocked: false,
                requirement: { totalBTC: 5 }
            },
            {
                id: 'nuclear',
                name: 'Nuclear Hookup',
                description: 'Massive power from nuclear plants.',
                subcategory: 'Advanced',
                baseCost: 100000,
                baseCapacity: 200000,
                costMultiplier: 1.25,
                unlocked: false,
                requirement: { totalBTC: 50 }
            },
            {
                id: 'fusion',
                name: 'Fusion Reactor',
                description: 'The future of energy production.',
                subcategory: 'Advanced',
                baseCost: 1000000,
                baseCapacity: 5000000,
                costMultiplier: 1.30,
                unlocked: false,
                requirement: { totalBTC: 500, hashPoints: 25 }
            }
        ];
        
        // Upgrade definitions (real-world USD prices)
        this.upgradeTypes = [
            {
                id: 'click_power0',
                name: 'Bad Mouse',
                description: 'Click slightly better with a worn-out mouse.',
                subcategory: 'Click Power',
                cost: 1,
                effect: { clickMultiplier: 2 },
                maxPurchases: 1,
                unlocked: true
            },
            {
                id: 'click_power1',
                name: 'Better Mouse',
                description: 'Click faster with an ergonomic mouse.',
                subcategory: 'Click Power',
                cost: 50,
                effect: { clickMultiplier: 2 },
                maxPurchases: 1,
                unlocked: true
            },
            {
                id: 'click_power2',
                name: 'Mechanical Keyboard',
                description: 'Smash those hashes harder.',
                subcategory: 'Click Power',
                cost: 100,
                effect: { clickMultiplier: 3 },
                maxPurchases: 1,
                requirement: { totalBTC: 10 },
                unlocked: false
            },
            {
                id: 'hash_efficiency',
                name: 'Hash Optimization',
                description: '+10% hashrate to all hardware.',
                subcategory: 'Hashrate',
                cost: 200,
                effect: { hashrateMultiplier: 1.1 },
                maxPurchases: 10,
                costMultiplier: 2,
                unlocked: true
            },
            {
                id: 'power_efficiency',
                name: 'Power Optimization',
                description: '-10% power consumption for all hardware.',
                subcategory: 'Efficiency',
                cost: 500,
                effect: { powerReduction: 0.9 },
                maxPurchases: 5,
                costMultiplier: 2.5,
                requirement: { totalBTC: 5 },
                unlocked: false
            },
            {
                id: 'conversion_boost',
                name: 'Hash Converter Upgrade',
                description: 'Reduce hashes needed per BTC by 10%.',
                subcategory: 'Conversion',
                cost: 1000,
                effect: { conversionBonus: 0.9 },
                maxPurchases: 5,
                costMultiplier: 3,
                requirement: { totalBTC: 20 },
                unlocked: false
            },
            {
                id: 'auto_clicker',
                name: 'Auto-Clicker',
                description: 'Automatically clicks 1 time per second.',
                subcategory: 'Automation',
                cost: 5000,
                effect: { autoClick: 1 },
                maxPurchases: 1,
                requirement: { totalBTC: 50 },
                unlocked: false
            }
        ];

        this.shopFilters = {
            hardware: null,
            power: null,
            upgrades: null
        };
        
        // Research Tree definitions - Reorganized with better spacing
        this.researchNodes = [
            // Tier 1 - Starting nodes (Row 1)
            {
                id: 'efficient_mining',
                name: 'Efficient Mining',
                description: 'Permanent +5% hashrate to all hardware.',
                cost: 5,
                tier: 1,
                effect: { hashrateBonus: 1.05 },
                requires: [],
                x: 8,
                y: 20
            },
            {
                id: 'power_savings',
                name: 'Power Savings',
                description: 'Permanent -5% power consumption.',
                cost: 5,
                tier: 1,
                effect: { powerReduction: 0.95 },
                requires: [],
                x: 8,
                y: 50
            },
            {
                id: 'click_training',
                name: 'Click Training',
                description: 'Permanent +8% click power.',
                cost: 5,
                tier: 1,
                effect: { clickBonus: 1.08 },
                requires: [],
                x: 8,
                y: 80
            },
            // Tier 2 (Row 2)
            {
                id: 'advanced_mining',
                name: 'Advanced Mining',
                description: 'Permanent +10% hashrate to all hardware.',
                cost: 10,
                tier: 2,
                effect: { hashrateBonus: 1.10 },
                requires: ['efficient_mining'],
                x: 28,
                y: 10
            },
            {
                id: 'overclocking',
                name: 'Overclocking',
                description: 'Permanent +15% hashrate but +5% power use.',
                cost: 15,
                tier: 2,
                effect: { hashrateBonus: 1.15, powerIncrease: 1.05 },
                requires: ['efficient_mining'],
                x: 28,
                y: 30
            },
            {
                id: 'renewable_energy',
                name: 'Renewable Energy',
                description: 'Permanent -10% power consumption.',
                cost: 10,
                tier: 2,
                effect: { powerReduction: 0.90 },
                requires: ['power_savings'],
                x: 28,
                y: 50
            },
            {
                id: 'unlock_fpga',
                name: 'FPGA Technology',
                description: 'Unlocks FPGA Miners for purchase.',
                cost: 12,
                tier: 2,
                effect: { unlockHardware: 'fpga' },
                requires: ['power_savings'],
                x: 28,
                y: 70
            },
            {
                id: 'enhanced_clicking',
                name: 'Enhanced Clicking',
                description: 'Permanent +12% click power.',
                cost: 10,
                tier: 2,
                effect: { clickBonus: 1.12 },
                requires: ['click_training'],
                x: 28,
                y: 90
            },
            // Tier 3 (Row 3)
            {
                id: 'hash_compression',
                name: 'Hash Compression',
                description: 'Reduce hashes needed per BTC by 15%.',
                cost: 20,
                tier: 3,
                effect: { conversionBonus: 0.85 },
                requires: ['advanced_mining'],
                x: 48,
                y: 5
            },
            {
                id: 'quantum_optimization',
                name: 'Quantum Optimization',
                description: 'Permanent +20% hashrate to all hardware.',
                cost: 25,
                tier: 3,
                effect: { hashrateBonus: 1.20 },
                requires: ['advanced_mining', 'overclocking'],
                x: 48,
                y: 25
            },
            {
                id: 'unlock_asic_pro',
                name: 'Pro ASIC Design',
                description: 'Unlocks Professional ASIC Miners.',
                cost: 25,
                tier: 3,
                effect: { unlockHardware: 'asic_pro' },
                requires: ['overclocking'],
                x: 48,
                y: 45
            },
            {
                id: 'fusion_power',
                name: 'Fusion Power',
                description: 'Permanent -20% power consumption.',
                cost: 20,
                tier: 3,
                effect: { powerReduction: 0.80 },
                requires: ['renewable_energy'],
                x: 48,
                y: 65
            },
            {
                id: 'unlock_immersion',
                name: 'Immersion Cooling',
                description: 'Unlocks Immersion-Cooled ASICs.',
                cost: 22,
                tier: 3,
                effect: { unlockHardware: 'immersion_asic' },
                requires: ['renewable_energy', 'unlock_fpga'],
                x: 46,
                y: 63
            },
            {
                id: 'master_clicker',
                name: 'Master Clicker',
                description: 'Permanent +20% click power.',
                cost: 18,
                tier: 3,
                effect: { clickBonus: 1.20 },
                requires: ['enhanced_clicking'],
                x: 46,
                y: 76
            },
            // Tier 4 (Row 4)
            {
                id: 'neural_mining',
                name: 'Neural Mining',
                description: 'Permanent +30% hashrate and +10% click power.',
                cost: 40,
                tier: 4,
                effect: { hashrateBonus: 1.30, clickBonus: 1.10 },
                requires: ['quantum_optimization', 'hash_compression'],
                x: 64,
                y: 18
            },
            {
                id: 'unlock_photonic',
                name: 'Photonic Chips',
                description: 'Unlocks Photonic Quantum Miners.',
                cost: 45,
                tier: 4,
                effect: { unlockHardware: 'photonic' },
                requires: ['quantum_optimization', 'unlock_asic_pro'],
                x: 64,
                y: 32
            },
            {
                id: 'perfect_efficiency',
                name: 'Perfect Efficiency',
                description: 'Power efficiency penalty removed entirely.',
                cost: 50,
                tier: 4,
                effect: { perfectEfficiency: true },
                requires: ['fusion_power', 'unlock_immersion'],
                x: 64,
                y: 50
            },
            {
                id: 'unlock_nano',
                name: 'Nanotech Mining',
                description: 'Unlocks Nanoscale Miners.',
                cost: 48,
                tier: 4,
                effect: { unlockHardware: 'nano_miner' },
                requires: ['unlock_immersion', 'master_clicker'],
                x: 64,
                y: 68
            },
            // Tier 5 - Ultimate (Row 5)
            {
                id: 'unlock_dimensional',
                name: 'Dimensional Mining',
                description: 'Unlocks Dimensional Rift Miners.',
                cost: 75,
                tier: 5,
                effect: { unlockHardware: 'dimensional' },
                requires: ['neural_mining', 'unlock_photonic'],
                x: 82,
                y: 25
            },
            {
                id: 'singularity',
                name: 'Singularity',
                description: 'Ultimate upgrade: +50% to everything.',
                cost: 100,
                tier: 5,
                effect: { hashrateBonus: 1.50, clickBonus: 1.50, conversionBonus: 0.70, powerReduction: 0.70 },
                requires: ['neural_mining', 'perfect_efficiency', 'unlock_photonic'],
                x: 82,
                y: 42
            },
            {
                id: 'unlock_reality',
                name: 'Reality Manipulation',
                description: 'Unlocks Reality-Bending Processors.',
                cost: 90,
                tier: 5,
                effect: { unlockHardware: 'reality_proc' },
                requires: ['perfect_efficiency', 'unlock_nano'],
                x: 82,
                y: 59
            }
        ];
    }

    createDefaultState() {
        return {
            // Resources
            bitcoin: 0,
            money: 0,
            pendingHashes: 0,
            hashPoints: 0,
            
            // Totals for prestige calculation
            totalBTCThisRun: 0,
            totalBTCAllTime: 0,
            totalClicks: 0,
            totalPrestiges: 0,
            
            // Black Market
            loans: [],
            autopayEnabled: false,
            autopayPercentage: 50,
            blackMarketInventory: [],
            blackMarketShop: [],
            shopRotationTime: Date.now(),
            activeBuffs: [],
            hasHackersToolkit: false,
            
            // Owned items (count)
            hardware: {},
            generators: {},
            upgrades: {},
            
            // Market
            marketPrice: 50000,
            marketTrend: 'neutral',
            marketTrendTimer: 0,
            
            // Unlocks
            unlockedHardware: hardwareTypes.filter(h => h.unlocked).map(h => h.id),
            unlockedGenerators: ['city', 'solar', 'diesel'],
            unlockedUpgrades: ['click_power0', 'click_power1', 'hash_efficiency'],
            
            // Research Tree
            researchPurchased: [],
            
            // Stats
            stats: {
                totalClicks: 0,
                totalHashesSolved: 0,
                totalBTCEarned: 0,
                totalMoneyEarned: 0,
                playtime: 0,
                eventsTriggered: 0
            },
            
            // Settings
            lastUpdate: Date.now(),
            version: GAME_VERSION,
            lastPrestigedVersion: null
        };
    }

    init() {
        // Try to load saved game
        const savedState = Storage.load();
        if (savedState) {
            this.gameState = { ...this.createDefaultState(), ...savedState };
            // Migrate version fields if missing
            if (!this.gameState.version) this.gameState.version = GAME_VERSION;
            if (!this.gameState.lastPrestigedVersion) this.gameState.lastPrestigedVersion = null;
            // Calculate offline progress
            const offlineTime = Storage.calculateOfflineProgress(this.gameState);
            if (offlineTime > 60) { // Only show if offline for more than 1 minute
                this.processOfflineProgress(offlineTime);
            }
        } else {
            this.gameState.version = GAME_VERSION;
            this.gameState.lastPrestigedVersion = null;
        }
        // Initialize UI
        this.initializeUI();
        this.updateUI();
        // Start game loops
        this.startGameLoop();
        this.startAutosave();
        this.startEventLoop();
        // Check for unlocks
        this.checkUnlocks();
    }

    initializeUI() {
        // Mine button
        document.getElementById('mine-button').addEventListener('click', (e) => {
            this.handleClick(e);
        });
        // Convert BTC to Money button
        document.getElementById('convert-btc-money').addEventListener('click', () => {
            this.convertBitcoinToMoney();
        });
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        // Prestige button
        document.getElementById('prestige-button').addEventListener('click', () => {
            this.prestige();
        });

        // Version-based Prestige Button
        const prestigePanel = document.getElementById('prestige-panel');
        const prestigeInfo = prestigePanel.querySelector('.prestige-info');
        if (!document.getElementById('version-prestige-btn')) {
            // Only show if a new version is detected and not yet prestiged
            if (this.gameState.version !== this.gameState.lastPrestigedVersion) {
                const versionBtn = document.createElement('button');
                versionBtn.id = 'version-prestige-btn';
                versionBtn.className = 'prestige-btn';
                versionBtn.textContent = `PRESTIGE FOR v${GAME_VERSION} REWARD!`;
                versionBtn.style.marginTop = '16px';
                versionBtn.onclick = () => {
                    this.versionPrestige();
                };
                prestigeInfo.appendChild(versionBtn);
            }
        }

        // Research Tree button
        const researchBtn = document.createElement('button');
        researchBtn.id = 'research-tree-button';
        researchBtn.className = 'prestige-btn';
        researchBtn.textContent = '🔬 Research Tree';
        researchBtn.style.marginTop = '16px';
        researchBtn.onclick = () => {
            this.showResearchTree();
        };
        prestigeInfo.appendChild(researchBtn);

        // Add reset progress button
        if (!document.getElementById('reset-progress-btn')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'reset-progress-btn';
            resetBtn.className = 'prestige-btn danger';
            resetBtn.textContent = 'RESET PROGRESS (Hard Reset)';
            resetBtn.style.marginTop = '16px';
            resetBtn.onclick = () => {
                if (confirm('Are you sure you want to hard reset all progress? This cannot be undone!')) {
                    this.hardReset();
                }
            };
            prestigePanel.appendChild(resetBtn);
        }

        // Build shop items
        this.buildHardwareShop();
        this.buildPowerShop();
        this.buildUpgradesShop();
    }

    versionPrestige() {
        // Calculate hash points reward (generous: 10 HP per BTC, min 1)
        const btc = this.gameState.bitcoin;
        let reward = Math.floor(btc * 10);
        if (reward < 1) reward = 1;
        this.gameState.hashPoints += reward;
        this.gameState.lastPrestigedVersion = GAME_VERSION;
        this.gameState.version = GAME_VERSION;
        // Reset all progress except hash points and lastPrestigedVersion
        const keep = {
            hashPoints: this.gameState.hashPoints,
            lastPrestigedVersion: this.gameState.lastPrestigedVersion
        };
        this.gameState = { ...this.createDefaultState(), ...keep };
        Storage.save(this.gameState);
        this.updateUI();
        this.checkUnlocks();
        Utils.createNotification('Prestige Complete!', `You prestiged for v${GAME_VERSION} and earned ${reward} Hash Points!`, 'success');
        // Remove the button after prestige
        const btn = document.getElementById('version-prestige-btn');
        if (btn) btn.remove();
    }

    hardReset() {
        this.gameState = this.createDefaultState();
        this.shopFilters.hardware = null;
        this.shopFilters.power = null;
        this.shopFilters.upgrades = null;
        Storage.save(this.gameState);
        this.updateUI();
        this.checkUnlocks();
        Utils.createNotification('Progress Reset', 'All progress has been reset.', 'danger');
    }

    showResearchTree() {
        // Create or show research tree modal
        let modal = document.getElementById('research-tree-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'research-tree-modal';
            modal.innerHTML = `
                <div class="research-modal-content">
                    <div class="research-header">
                        <h2>🔬 Research Tree</h2>
                        <div class="research-hp-display">
                            <span>Available Hash Points: <strong id="research-hp-count">${this.gameState.hashPoints}</strong></span>
                        </div>
                        <button class="close-research" id="close-research">✕</button>
                    </div>
                    <div class="research-legend">
                        <div class="legend-item"><span class="legend-icon">⚙️</span> Hardware Unlock</div>
                        <div class="legend-item"><span class="legend-icon">⛏️</span> Hashrate Boost</div>
                        <div class="legend-item"><span class="legend-icon">⚡</span> Power Efficiency</div>
                        <div class="legend-item"><span class="legend-icon">👆</span> Click Power</div>
                        <div class="legend-item"><span class="legend-icon">🔄</span> Conversion Bonus</div>
                        <div class="legend-item"><span class="legend-icon">💎</span> Special Effect</div>
                    </div>
                    <div class="research-tree-container" id="research-tree-container">
                        <svg id="research-connections" class="research-connections"></svg>
                        <div id="research-nodes" class="research-nodes"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('close-research').onclick = () => {
                modal.style.display = 'none';
            };
        }
        this.buildResearchTree();
        modal.style.display = 'flex';
    }

    buildResearchTree() {
        const nodesContainer = document.getElementById('research-nodes');
        const svg = document.getElementById('research-connections');
        nodesContainer.innerHTML = '';
        svg.innerHTML = '';
        
        // Update HP display
        document.getElementById('research-hp-count').textContent = this.gameState.hashPoints;
        
        // Draw connection lines first
        for (const node of this.researchNodes) {
            if (node.requires && node.requires.length > 0) {
                for (const reqId of node.requires) {
                    const reqNode = this.researchNodes.find(n => n.id === reqId);
                    if (reqNode) {
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', `${reqNode.x}%`);
                        line.setAttribute('y1', `${reqNode.y}%`);
                        line.setAttribute('x2', `${node.x}%`);
                        line.setAttribute('y2', `${node.y}%`);
                        line.classList.add('research-line');
                        if (this.gameState.researchPurchased.includes(reqId) && this.gameState.researchPurchased.includes(node.id)) {
                            line.classList.add('purchased');
                        }
                        svg.appendChild(line);
                    }
                }
            }
        }
        
        // Draw nodes
        for (const node of this.researchNodes) {
            const isPurchased = this.gameState.researchPurchased.includes(node.id);
            const canAfford = this.gameState.hashPoints >= node.cost;
            const requirementsMet = node.requires.every(reqId => this.gameState.researchPurchased.includes(reqId));
            const canPurchase = !isPurchased && canAfford && requirementsMet;
            
            // Determine node icon based on type
            let nodeIcon = '🔒';
            if (isPurchased) {
                nodeIcon = '✓';
            } else if (node.effect && node.effect.unlockHardware) {
                nodeIcon = '⚙️';
            } else if (node.effect && node.effect.hashrateBonus) {
                nodeIcon = '⛏️';
            } else if (node.effect && node.effect.powerReduction) {
                nodeIcon = '⚡';
            } else if (node.effect && node.effect.clickBonus) {
                nodeIcon = '👆';
            } else if (node.effect && node.effect.conversionBonus) {
                nodeIcon = '🔄';
            } else if (node.effect && node.effect.perfectEfficiency) {
                nodeIcon = '💎';
            }
            
            const nodeEl = document.createElement('div');
            nodeEl.className = `research-node ${isPurchased ? 'purchased' : ''} ${canPurchase ? 'available' : ''} ${!requirementsMet ? 'locked' : ''}`;
            nodeEl.style.left = `${node.x}%`;
            nodeEl.style.top = `${node.y}%`;
            nodeEl.innerHTML = `
                <div class="node-icon">${nodeIcon}</div>
                <div class="node-name">${node.name}</div>
                <div class="node-cost">Cost: ${node.cost} HP</div>
                <div class="node-tier">Tier ${node.tier}</div>
            `;
            
            nodeEl.onclick = () => {
                this.showResearchDetails(node);
            };
            
            nodesContainer.appendChild(nodeEl);
        }
    }

    showResearchDetails(node) {
        const isPurchased = this.gameState.researchPurchased.includes(node.id);
        const canAfford = this.gameState.hashPoints >= node.cost;
        const requirementsMet = node.requires.every(reqId => this.gameState.researchPurchased.includes(reqId));
        const canPurchase = !isPurchased && canAfford && requirementsMet;
        
        let requirementsText = 'None';
        if (node.requires.length > 0) {
            requirementsText = node.requires.map(reqId => {
                const reqNode = this.researchNodes.find(n => n.id === reqId);
                const owned = this.gameState.researchPurchased.includes(reqId);
                return `<span style="color: ${owned ? '#00ff88' : '#ff4444'}">${reqNode.name}${owned ? ' ✓' : ' ✗'}</span>`;
            }).join(', ');
        }
        
        // Build effects description
        let effectsText = '';
        if (node.effect) {
            const effects = [];
            if (node.effect.hashrateBonus) {
                const bonus = ((node.effect.hashrateBonus - 1) * 100).toFixed(0);
                effects.push(`+${bonus}% Hashrate`);
            }
            if (node.effect.clickBonus) {
                const bonus = ((node.effect.clickBonus - 1) * 100).toFixed(0);
                effects.push(`+${bonus}% Click Power`);
            }
            if (node.effect.conversionBonus) {
                const reduction = ((1 - node.effect.conversionBonus) * 100).toFixed(0);
                effects.push(`-${reduction}% Hashes per BTC`);
            }
            if (node.effect.powerReduction) {
                const reduction = ((1 - node.effect.powerReduction) * 100).toFixed(0);
                effects.push(`-${reduction}% Power Consumption`);
            }
            if (node.effect.powerIncrease) {
                const increase = ((node.effect.powerIncrease - 1) * 100).toFixed(0);
                effects.push(`+${increase}% Power Consumption`);
            }
            if (node.effect.perfectEfficiency) {
                effects.push('Removes Power Penalty');
            }
            if (node.effect.unlockHardware) {
                const hardware = this.hardwareTypes.find(h => h.id === node.effect.unlockHardware);
                if (hardware) {
                    effects.push(`<strong style="color: #00ff88;">⚙️ Unlocks ${hardware.name}</strong>`);
                }
            }
            effectsText = effects.join('<br>');
        }
        
        const modal = document.createElement('div');
        modal.className = 'research-detail-modal';
        modal.innerHTML = `
            <div class="research-detail-content">
                <h3>${node.name}</h3>
                <p class="detail-description">${node.description}</p>
                ${effectsText ? `<div class="detail-effects">${effectsText}</div>` : ''}
                <div class="detail-info">
                    <div><strong>Cost:</strong> ${node.cost} Hash Points</div>
                    <div><strong>Tier:</strong> ${node.tier}</div>
                    <div><strong>Requirements:</strong> ${requirementsText}</div>
                    <div><strong>Status:</strong> ${isPurchased ? '<span style="color: #00ff88">Purchased ✓</span>' : '<span style="color: #ffcc00">Not Purchased</span>'}</div>
                </div>
                <div class="detail-buttons">
                    ${canPurchase ? `<button class="buy-research-btn" id="buy-research-${node.id}">Purchase for ${node.cost} HP</button>` : ''}
                    <button class="close-detail-btn" id="close-detail">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        if (canPurchase) {
            document.getElementById(`buy-research-${node.id}`).onclick = () => {
                this.purchaseResearch(node.id);
                document.body.removeChild(modal);
            };
        }
        
        document.getElementById('close-detail').onclick = () => {
            document.body.removeChild(modal);
        };
    }

    purchaseResearch(nodeId) {
        const node = this.researchNodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const isPurchased = this.gameState.researchPurchased.includes(node.id);
        const canAfford = this.gameState.hashPoints >= node.cost;
        const requirementsMet = node.requires.every(reqId => this.gameState.researchPurchased.includes(reqId));
        
        if (isPurchased || !canAfford || !requirementsMet) {
            Utils.createNotification('Cannot Purchase', 'Requirements not met or already purchased.', 'warning');
            return;
        }
        
        // Deduct hash points
        this.gameState.hashPoints -= node.cost;
        this.gameState.researchPurchased.push(node.id);
        
        // Handle hardware unlocks
        if (node.effect && node.effect.unlockHardware) {
            const hardwareId = node.effect.unlockHardware;
            if (!this.gameState.unlockedHardware.includes(hardwareId)) {
                this.gameState.unlockedHardware.push(hardwareId);
                Utils.createNotification('Hardware Unlocked!', `${node.name} unlocked new mining hardware!`, 'success');
                this.buildHardwareShop();
            }
        }
        
        Utils.createNotification('Research Complete!', `${node.name} has been unlocked!`, 'success');
        this.buildResearchTree();
        this.updateUI();
        this.checkUnlocks();
    }

    getResearchMultipliers() {
        let hashrateBonus = 1;
        let clickBonus = 1;
        let conversionBonus = 1;
        let powerReduction = 1;
        let powerIncrease = 1;
        let perfectEfficiency = false;
        
        for (const nodeId of this.gameState.researchPurchased) {
            const node = this.researchNodes.find(n => n.id === nodeId);
            if (node && node.effect) {
                if (node.effect.hashrateBonus) hashrateBonus *= node.effect.hashrateBonus;
                if (node.effect.clickBonus) clickBonus *= node.effect.clickBonus;
                if (node.effect.conversionBonus) conversionBonus *= node.effect.conversionBonus;
                if (node.effect.powerReduction) powerReduction *= node.effect.powerReduction;
                if (node.effect.powerIncrease) powerIncrease *= node.effect.powerIncrease;
                if (node.effect.perfectEfficiency) perfectEfficiency = true;
            }
        }
        
        return { hashrateBonus, clickBonus, conversionBonus, powerReduction, powerIncrease, perfectEfficiency };
    }

    handleClick(event) {
        // Show math challenge popup for manual clicks
        this.showMathChallenge().then((correct) => {
            if (!correct) {
                Utils.createNotification('Incorrect!', 'Wrong answer. Try again!', 'danger');
                return;
            }
            Utils.createNotification('Correct!', 'Hash solved!', 'success');
            const clickPower = this.getClickPower();
            this.gameState.pendingHashes += clickPower;
            this.gameState.totalClicks++;
            this.gameState.stats.totalClicks++;
            // Create click effect
            if (event && event.currentTarget) {
                const button = event.currentTarget;
                const rect = button.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                Utils.createClickEffect(x, y, '+' + Utils.formatNumber(clickPower));
            }
            // Convert hashes to BTC
            this.convertHashes();
            // Update UI
            this.updateUI();
        });
    }

    showMathChallenge() {
        return new Promise((resolve) => {
            // Generate two random numbers for a simple addition
            const a = Utils.randomInt(1, 20);
            const b = Utils.randomInt(1, 20);
            // Create modal
            let modal = document.getElementById('math-challenge-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'math-challenge-modal';
                document.body.appendChild(modal);
            }
            // Always ensure modal is styled and visible
            modal.style.position = 'fixed';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.zIndex = '99999';
            modal.style.background = '#222';
            modal.style.color = '#fff';
            modal.style.padding = '24px 32px';
            modal.style.borderRadius = '12px';
            modal.style.boxShadow = '0 4px 24px #0008';
            modal.style.setProperty('display', 'block', 'important');
            modal.style.visibility = 'visible';
            modal.innerHTML = `
                <div style="font-size:1.2em;margin-bottom:12px;">Solve: <b>${a} + ${b}</b></div>
                <input id="math-answer" type="number" style="font-size:1.2em;padding:4px 8px;width:80px;" autofocus />
                <button id="math-submit" style="font-size:1.1em;margin-left:12px;">Submit</button>
                <div class="math-feedback" id="math-feedback"></div>
            `;
            setTimeout(() => {
                const answerInput = document.getElementById('math-answer');
                if (answerInput) answerInput.focus();
            }, 50);
            console.log('Math challenge modal should be visible now.');
            const submitBtn = document.getElementById('math-submit');
            const answerInput = document.getElementById('math-answer');
            const feedback = document.getElementById('math-feedback');
            submitBtn.onclick = () => {
                const val = parseInt(answerInput.value, 10);
                if (val === a + b) {
                    feedback.textContent = '✅ Correct!';
                    feedback.style.color = '#00ff88';
                    setTimeout(() => {
                        modal.style.setProperty('display', 'none', 'important');
                        modal.style.visibility = 'hidden';
                        resolve(true);
                    }, 500);
                } else {
                    feedback.textContent = '❌ Incorrect!';
                    feedback.style.color = '#ff4444';
                    setTimeout(() => {
                        modal.style.setProperty('display', 'none', 'important');
                        modal.style.visibility = 'hidden';
                        resolve(false);
                    }, 700);
                }
            };
            answerInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    submitBtn.click();
                }
            };
        });
    }

    getClickPower() {
        let power = 1;
        
        // Apply click multiplier upgrades
        for (const [id, count] of Object.entries(this.gameState.upgrades)) {
            const upgrade = this.upgradeTypes.find(u => u.id === id);
            if (upgrade && upgrade.effect.clickMultiplier) {
                power *= Math.pow(upgrade.effect.clickMultiplier, count);
            }
        }
        
        // Apply hash point multiplier
        power *= this.getHashPointMultiplier();
        
        // Apply research bonuses
        const research = this.getResearchMultipliers();
        power *= research.clickBonus;
        
        // Apply black market buff multipliers
        if (window.blackmarket) {
            power *= window.blackmarket.getActiveMultiplier('click');
        }
        
        return Math.floor(power);
    }

    getHashPointMultiplier() {
        // Each hash point gives 1% bonus
        return 1 + (this.gameState.hashPoints * 0.01);
    }

    convertHashes() {
        let hashesPerBTC = this.config.hashesPerBTC;
        // Apply conversion upgrades
        for (const [id, count] of Object.entries(this.gameState.upgrades)) {
            const upgrade = this.upgradeTypes.find(u => u.id === id);
            if (upgrade && upgrade.effect.conversionBonus) {
                hashesPerBTC *= Math.pow(upgrade.effect.conversionBonus, count);
            }
        }
        // Apply research bonuses
        const research = this.getResearchMultipliers();
        hashesPerBTC *= research.conversionBonus;
        
        let btcEarned = this.gameState.pendingHashes / hashesPerBTC;
        
        // Apply black market BTC magnet buff
        if (window.blackmarket && btcEarned > 0) {
            btcEarned *= window.blackmarket.getActiveMultiplier('btc');
        }
        
        if (btcEarned > 0) {
            this.gameState.bitcoin += btcEarned;
            this.gameState.totalBTCThisRun += btcEarned;
            this.gameState.totalBTCAllTime += btcEarned;
            this.gameState.stats.totalBTCEarned += btcEarned;
            this.gameState.pendingHashes = 0;
        }
    }

    convertBitcoinToMoney() {
        if (this.gameState.bitcoin > 0) {
            const btc = this.gameState.bitcoin;
            const usd = btc * this.gameState.marketPrice;
            this.gameState.money += usd;
            this.gameState.stats.totalMoneyEarned += usd;
            this.gameState.bitcoin = 0;
            Utils.createNotification('Converted!', `Converted ${Utils.formatBTC(btc)} to ${Utils.formatUSD(usd)}!`, 'success');
            this.updateUI();
        }
    }

    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            const now = Date.now();
            const deltaTime = (now - this.lastUpdate) / 1000; // seconds
            this.lastUpdate = now;
            
            this.update(deltaTime);
        }, this.config.tickRate);
    }

    update(deltaTime) {
        // Update playtime
        this.gameState.stats.playtime += deltaTime;
        
        // Generate hashes from hardware
        this.generateHashes(deltaTime);
        
        // Auto-click
        this.processAutoClick(deltaTime);
        
        // Convert hashes to BTC
        this.convertHashes();
        
        // Update market
        this.updateMarket(deltaTime);
        
        // Update UI
        this.updateUI();
    }

    generateHashes(deltaTime) {
        const powerEfficiency = this.getPowerEfficiency();
        let totalHashrate = 0;
        let hashrateMultiplier = 1;
        
        // Apply hashrate upgrades
        for (const [id, count] of Object.entries(this.gameState.upgrades)) {
            const upgrade = this.upgradeTypes.find(u => u.id === id);
            if (upgrade && upgrade.effect.hashrateMultiplier) {
                hashrateMultiplier *= Math.pow(upgrade.effect.hashrateMultiplier, count);
            }
        }
        
        // Apply hash point multiplier
        hashrateMultiplier *= this.getHashPointMultiplier();
        
        // Apply research bonuses
        const research = this.getResearchMultipliers();
        hashrateMultiplier *= research.hashrateBonus;
        
        // Apply black market buff multipliers
        if (window.blackmarket) {
            hashrateMultiplier *= window.blackmarket.getActiveMultiplier('hashrate');
        }
        
        // Calculate total hashrate from all hardware
        for (const [id, count] of Object.entries(this.gameState.hardware)) {
            const hardware = this.hardwareTypes.find(h => h.id === id);
            if (hardware) {
                totalHashrate += hardware.baseHashrate * count * hashrateMultiplier;
            }
        }
        
        // Apply power efficiency (unless power surge is active)
        if (window.blackmarket && window.blackmarket.hasPowerSurge()) {
            // Unlimited power!
        } else {
            totalHashrate *= powerEfficiency;
        }
        
        // Generate hashes
        const hashesGenerated = totalHashrate * deltaTime;
        this.gameState.pendingHashes += hashesGenerated;
        this.gameState.stats.totalHashesSolved += hashesGenerated;
    }

    processAutoClick(deltaTime) {
        // Check for auto-clicker upgrade
        const autoClickUpgrade = this.gameState.upgrades['auto_clicker'];
        if (autoClickUpgrade && autoClickUpgrade > 0) {
            const clickPower = this.getClickPower();
            const clicksPerSecond = 1;
            const hashesFromAutoClick = clickPower * clicksPerSecond * deltaTime;
            this.gameState.pendingHashes += hashesFromAutoClick;
        }
    }

    getPowerEfficiency() {
        const research = this.getResearchMultipliers();
        if (research.perfectEfficiency) {
            return 1.0; // No penalty
        }
        const powerUsed = this.getTotalPowerUsed();
        const powerCapacity = this.getTotalPowerCapacity();
        return Utils.calculatePowerEfficiency(powerUsed, powerCapacity);
    }

    getTotalPowerUsed() {
        let total = 0;
        let powerReduction = 1;
        
        // Apply power reduction upgrades
        for (const [id, count] of Object.entries(this.gameState.upgrades)) {
            const upgrade = this.upgradeTypes.find(u => u.id === id);
            if (upgrade && upgrade.effect.powerReduction) {
                powerReduction *= Math.pow(upgrade.effect.powerReduction, count);
            }
        }
        
        // Apply research bonuses
        const research = this.getResearchMultipliers();
        powerReduction *= research.powerReduction;
        powerReduction *= research.powerIncrease;
        
        for (const [id, count] of Object.entries(this.gameState.hardware)) {
            const hardware = this.hardwareTypes.find(h => h.id === id);
            if (hardware) {
                total += hardware.basePower * count * powerReduction;
            }
        }
        return total;
    }

    getTotalPowerCapacity() {
        let total = 0;
        for (const [id, count] of Object.entries(this.gameState.generators)) {
            const generator = this.generatorTypes.find(g => g.id === id);
            if (generator) {
                total += generator.baseCapacity * count;
            }
        }
        return total;
    }

    updateMarket(deltaTime) {
        // Update trend timer
        this.gameState.marketTrendTimer += deltaTime * 1000;
        
        // Change trend periodically
        if (this.gameState.marketTrendTimer >= this.config.marketTrendDuration) {
            this.gameState.marketTrendTimer = 0;
            const trends = ['up', 'down', 'neutral'];
            this.gameState.marketTrend = trends[Utils.randomInt(0, trends.length - 1)];
        }
        
        // Fluctuate price based on trend
        let change = 0;
        if (this.gameState.marketTrend === 'up') {
            change = Utils.randomFloat(0, this.config.marketVolatility);
        } else if (this.gameState.marketTrend === 'down') {
            change = Utils.randomFloat(-this.config.marketVolatility, 0);
        } else {
            change = Utils.randomFloat(-this.config.marketVolatility * 0.5, this.config.marketVolatility * 0.5);
        }
        
        this.gameState.marketPrice *= (1 + change);
        this.gameState.marketPrice = Utils.clamp(this.gameState.marketPrice, 
            this.config.lowBitcoinPrice,
            this.config.maxBitcoinPrice);
    }

    startEventLoop() {
        this.eventCheckInterval = setInterval(() => {
            this.checkRandomEvents();
        }, this.config.eventCheckRate);
    }

    checkRandomEvents() {
        // Only trigger events if player has made progress
        if (this.gameState.totalBTCThisRun < 1) return;
        
        for (const [eventName, chance] of Object.entries(this.config.eventChances)) {
            if (Utils.chance(chance)) {
                this.triggerEvent(eventName);
            }
        }
    }

    triggerEvent(eventName) {
        this.gameState.stats.eventsTriggered++;
        
        switch (eventName) {
            case 'marketCrash':
                this.gameState.marketPrice *= 0.8;
                Utils.createNotification('Market Crash!', 'Bitcoin price dropped 20%!', 'warning');
                this.gameState.marketTrend = 'down';
                break;
                
            case 'marketBoom':
                this.gameState.marketPrice *= 1.3;
                Utils.createNotification('Market Boom!', 'Bitcoin price surged 30%!', 'success');
                this.gameState.marketTrend = 'up';
                break;
                
            case 'halvening':
                // Temporary boost to click power
                const bonusHashes = this.getClickPower() * 100;
                this.gameState.pendingHashes += bonusHashes;
                Utils.createNotification('Halvening Event!', `Bonus ${Utils.formatNumber(bonusHashes)} hashes!`, 'event');
                break;
                
            case 'powerSurge':
                // Temporary power boost
                const bonusBTC = this.gameState.totalBTCThisRun * 0.05;
                this.gameState.bitcoin += bonusBTC;
                Utils.createNotification('Power Surge!', `+${Utils.formatBTC(bonusBTC)} from efficient mining!`, 'success');
                break;
                
            case 'hardwareMalfunction':
                // Lose some pending hashes
                const lostHashes = this.gameState.pendingHashes * 0.1;
                this.gameState.pendingHashes *= 0.9;
                Utils.createNotification('Hardware Malfunction', `Lost ${Utils.formatNumber(lostHashes)} pending hashes`, 'warning');
                break;
                
            case 'luckyFind':
                // Find some bonus BTC
                const luckyBTC = Math.random() * 0.1;
                this.gameState.bitcoin += luckyBTC;
                Utils.createNotification('Lucky Find!', `Found ${Utils.formatBTC(luckyBTC)} in an old wallet!`, 'event');
                break;
        }
    }

    buyHardware(hardwareId) {
        const hardware = this.hardwareTypes.find(h => h.id === hardwareId);
        if (!hardware) return;
        const cost = this.getHardwareCost(hardwareId);
        if (this.gameState.money < cost) return;
        this.gameState.money -= cost;
        this.gameState.hardware[hardwareId] = (this.gameState.hardware[hardwareId] || 0) + 1;
        this.updateUI();
        this.checkUnlocks();
    }

    getHardwareCost(hardwareId) {
        const hardware = this.hardwareTypes.find(h => h.id === hardwareId);
        if (!hardware) return Infinity;
        const owned = this.gameState.hardware[hardwareId] || 0;
        return hardware.baseCost * Math.pow(hardware.costMultiplier, owned);
    }

    buyGenerator(generatorId) {
        const generator = this.generatorTypes.find(g => g.id === generatorId);
        if (!generator) return;
        const cost = this.getGeneratorCost(generatorId);
        if (this.gameState.money < cost) return;
        this.gameState.money -= cost;
        this.gameState.generators[generatorId] = (this.gameState.generators[generatorId] || 0) + 1;
        this.updateUI();
        this.checkUnlocks();
    }

    getGeneratorCost(generatorId) {
        const generator = this.generatorTypes.find(g => g.id === generatorId);
        if (!generator) return Infinity;
        const owned = this.gameState.generators[generatorId] || 0;
        return generator.baseCost * Math.pow(generator.costMultiplier, owned);
    }

    buyUpgrade(upgradeId) {
        const upgrade = this.upgradeTypes.find(u => u.id === upgradeId);
        if (!upgrade) return;
        const owned = this.gameState.upgrades[upgradeId] || 0;
        if (upgrade.maxPurchases && owned >= upgrade.maxPurchases) return;
        const cost = this.getUpgradeCost(upgradeId);
        if (this.gameState.money < cost) return;
        this.gameState.money -= cost;
        this.gameState.upgrades[upgradeId] = owned + 1;
        this.updateUI();
        this.checkUnlocks();
    }

    getUpgradeCost(upgradeId) {
        const upgrade = this.upgradeTypes.find(u => u.id === upgradeId);
        if (!upgrade) return Infinity;
        const owned = this.gameState.upgrades[upgradeId] || 0;
        if (upgrade.costMultiplier) {
            return upgrade.cost * Math.pow(upgrade.costMultiplier, owned);
        }
        return upgrade.cost;
    }

    checkUnlocks() {
        // Check hardware unlocks
        for (const hardware of this.hardwareTypes) {
            if (this.gameState.unlockedHardware.includes(hardware.id)) continue;
            if (!hardware.unlocked && this.meetsRequirement(hardware.requirement)) {
                this.gameState.unlockedHardware.push(hardware.id);
                Utils.createNotification('New Hardware!', `${hardware.name} is now available!`, 'success');
            }
        }
        // Check generator unlocks
        for (const generator of this.generatorTypes) {
            if (this.gameState.unlockedGenerators.includes(generator.id)) continue;
            if (!generator.unlocked && this.meetsRequirement(generator.requirement)) {
                this.gameState.unlockedGenerators.push(generator.id);
                Utils.createNotification('New Generator!', `${generator.name} is now available!`, 'success');
            }
        }
        // Check upgrade unlocks
        for (const upgrade of this.upgradeTypes) {
            if (this.gameState.unlockedUpgrades.includes(upgrade.id)) continue;
            if (!upgrade.unlocked && this.meetsRequirement(upgrade.requirement)) {
                this.gameState.unlockedUpgrades.push(upgrade.id);
                Utils.createNotification('New Upgrade!', `${upgrade.name} is now available!`, 'success');
            }
        }
        // Rebuild shops if unlocks changed
        this.buildHardwareShop();
        this.buildPowerShop();
        this.buildUpgradesShop();
    }

    meetsRequirement(requirement) {
        if (!requirement) return true;
        
        if (requirement.totalBTC && this.gameState.totalBTCAllTime < requirement.totalBTC) {
            return false;
        }
        
        if (requirement.hashPoints && this.gameState.hashPoints < requirement.hashPoints) {
            return false;
        }
        
        // Check for research node requirement
        if (requirement.researchNode) {
            if (!this.gameState.researchPurchased.includes(requirement.researchNode)) {
                return false;
            }
        }
        
        return true;
    }

    calculateHashPointsOnPrestige() {
        // HP = √(Total BTC mined this run ÷ 1,000)
        const hp = Math.floor(Math.sqrt(this.gameState.totalBTCThisRun / 10));
        return Math.max(0, hp);
    }

    prestige() {
        const hpGain = this.calculateHashPointsOnPrestige();
        if (hpGain <= 0 || this.gameState.totalBTCThisRun < 1) {
            Utils.createNotification('Cannot Prestige', 'You need to mine at least 1 BTC this run to gain Hash Points.', 'warning');
            return;
        }
        if (!confirm(`Prestige now and gain ${hpGain} Hash Points? This will reset your progress.`)) {
            return;
        }
        // Award hash points
        this.gameState.hashPoints += hpGain;
        this.gameState.totalPrestiges++;
        // Reset run-specific stats
        this.gameState.bitcoin = 0;
        this.gameState.money = 0;
        this.gameState.pendingHashes = 0;
        this.gameState.totalBTCThisRun = 0;
        this.gameState.hardware = {};
        this.gameState.generators = {};
        this.gameState.upgrades = {};
        // Reset unlocks to base
        this.gameState.unlockedHardware = ['cpu', 'gpu', 'asic_early'];
        this.gameState.unlockedGenerators = ['solar', 'diesel'];
        this.gameState.unlockedUpgrades = ['click_power1', 'hash_efficiency'];
        this.shopFilters.hardware = null;
        this.shopFilters.power = null;
        this.shopFilters.upgrades = null;
        Utils.createNotification('Prestige!', `Gained ${hpGain} Hash Points! Total: ${this.gameState.hashPoints}`, 'success');
        this.updateUI();
        this.checkUnlocks();
    }

    processOfflineProgress(offlineTime) {
        // Calculate offline production (at reduced rate)
        const offlineMultiplier = 0.5; // 50% production while offline
        // Simulate production
        const iterations = Math.min(Math.floor(offlineTime), 3600); // Cap at 1 hour of iterations
        const timePerIteration = offlineTime / iterations;
        for (let i = 0; i < iterations; i++) {
            this.generateHashes(timePerIteration * offlineMultiplier);
            this.convertHashes();
        }

        // --- Apply loan interest for offline period ---
        // 10% every 12 hours offline
        const offlineLoanInterval = 43200; // 12 hours in seconds
        const offlineLoanInterest = 0.10; // 10% per 12 hours
        const offlineLoanIntervals = Math.floor(offlineTime / offlineLoanInterval);
        if (offlineLoanIntervals > 0 && this.gameState.loans && this.gameState.loans.length > 0) {
            this.gameState.loans.forEach(loan => {
                loan.remaining *= Math.pow(1 + offlineLoanInterest, offlineLoanIntervals);
                loan.lastInterestApplied = Date.now();
            });
            Utils.createNotification(
                'Offline Loan Interest',
                `Your loans accrued 10% interest every 12 hours offline.`,
                'danger'
            );
        }

        // --- Offline earnings: sqrt of money per minute offline ---
        const minutesOffline = Math.floor(offlineTime / 60);
        const moneyAtLogout = this.gameState.money;
        let offlineMoney = 0;
        if (minutesOffline > 0 && moneyAtLogout > 0) {
            offlineMoney = Math.floor(minutesOffline * Math.sqrt(moneyAtLogout));
            this.gameState.money += offlineMoney;
        }
        const btcEarned = this.gameState.totalBTCThisRun;
        let msg = '';
        if (btcEarned > 0) {
            msg += `You earned ${Utils.formatBTC(btcEarned)} BTC while offline (${Utils.formatTime(offlineTime)}).\n`;
        }
        if (offlineMoney > 0) {
            msg += `Offline bonus: $${offlineMoney.toLocaleString()} (sqrt of money per min)`;
        }
        if (msg) {
            Utils.createNotification('Welcome Back!', msg, 'success');
        }
    }

    getCategoriesForItems(items, fallback = 'General') {
        const categories = [];
        for (const item of items) {
            const category = (item && item.subcategory) ? item.subcategory : fallback;
            if (!categories.includes(category)) {
                categories.push(category);
            }
        }
        return categories;
    }

    renderCategoryTabs(container, categories, activeCategory, onSelect) {
        if (!container) return;
        container.innerHTML = '';
        if (categories.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'flex';
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = `category-tab${category === activeCategory ? ' active' : ''}`;
            button.textContent = category;
            button.addEventListener('click', () => {
                if (category !== activeCategory && typeof onSelect === 'function') {
                    onSelect(category);
                }
            });
            container.appendChild(button);
        });
    }

    buildHardwareShop() {
        const container = document.getElementById('hardware-list');
        const tabsContainer = document.getElementById('hardware-categories');
        if (!container || !tabsContainer) return;

        const unlockedHardware = this.hardwareTypes.filter(h => this.gameState.unlockedHardware.includes(h.id));
        const categories = this.getCategoriesForItems(unlockedHardware, 'Other');

        if (categories.length === 0) {
            tabsContainer.style.display = 'none';
            tabsContainer.innerHTML = '';
            container.innerHTML = '<div class="empty-shop">No mining hardware unlocked yet.</div>';
            this.shopFilters.hardware = null;
            return;
        }

        let activeCategory = this.shopFilters.hardware;
        if (!activeCategory || !categories.includes(activeCategory)) {
            activeCategory = categories[0];
            this.shopFilters.hardware = activeCategory;
        }

        this.renderCategoryTabs(tabsContainer, categories, activeCategory, (category) => {
            this.shopFilters.hardware = category;
            this.buildHardwareShop();
        });

        container.innerHTML = '';
        const itemsToRender = categories.length === 1
            ? unlockedHardware
            : unlockedHardware.filter(h => (h.subcategory || 'Other') === activeCategory);

        if (itemsToRender.length === 0) {
            container.innerHTML = `<div class="empty-shop">No mining hardware available in ${activeCategory} yet.</div>`;
            return;
        }

        for (const hardware of itemsToRender) {
            const owned = this.gameState.hardware[hardware.id] || 0;
            const cost = this.getHardwareCost(hardware.id);
            const canAfford = this.gameState.money >= cost;
            const item = document.createElement('div');
            item.className = `shop-item ${canAfford ? 'affordable' : ''}`;
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${hardware.name}</span>
                    <span class="item-owned">Owned: ${owned}</span>
                </div>
                <div class="item-description">${hardware.description}</div>
                <div class="item-stats">
                    <div class="stat-row">
                        <span class="label">Hashrate:</span>
                        <span class="value">${Utils.formatNumber(hardware.baseHashrate)}/s</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Power:</span>
                        <span class="value">${Utils.formatNumber(hardware.basePower)} kW</span>
                    </div>
                </div>
                <div class="item-footer">
                    <button class="buy-button" ${!canAfford ? 'disabled' : ''}>
                        Buy for ${Utils.formatUSD(cost)}
                    </button>
                </div>
            `;
            const buyBtn = item.querySelector('.buy-button');
            buyBtn.addEventListener('click', () => this.buyHardware(hardware.id));
            container.appendChild(item);
        }
    }

    buildPowerShop() {
        const container = document.getElementById('power-list');
        const tabsContainer = document.getElementById('power-categories');
        if (!container || !tabsContainer) return;

        const unlockedGenerators = this.generatorTypes.filter(g => this.gameState.unlockedGenerators.includes(g.id));
        const categories = this.getCategoriesForItems(unlockedGenerators, 'General');

        if (categories.length === 0) {
            tabsContainer.style.display = 'none';
            tabsContainer.innerHTML = '';
            container.innerHTML = '<div class="empty-shop">No power systems unlocked yet.</div>';
            this.shopFilters.power = null;
            return;
        }

        let activeCategory = this.shopFilters.power;
        if (!activeCategory || !categories.includes(activeCategory)) {
            activeCategory = categories[0];
            this.shopFilters.power = activeCategory;
        }

        this.renderCategoryTabs(tabsContainer, categories, activeCategory, (category) => {
            this.shopFilters.power = category;
            this.buildPowerShop();
        });

        container.innerHTML = '';
        const itemsToRender = categories.length === 1
            ? unlockedGenerators
            : unlockedGenerators.filter(g => (g.subcategory || 'General') === activeCategory);

        if (itemsToRender.length === 0) {
            container.innerHTML = `<div class="empty-shop">No power systems available in ${activeCategory} yet.</div>`;
            return;
        }

        for (const generator of itemsToRender) {
            const owned = this.gameState.generators[generator.id] || 0;
            const cost = this.getGeneratorCost(generator.id);
            const canAfford = this.gameState.money >= cost;
            const item = document.createElement('div');
            item.className = `shop-item ${canAfford ? 'affordable' : ''}`;
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${generator.name}</span>
                    <span class="item-owned">Owned: ${owned}</span>
                </div>
                <div class="item-description">${generator.description}</div>
                <div class="item-stats">
                    <div class="stat-row">
                        <span class="label">Capacity:</span>
                        <span class="value">${Utils.formatNumber(generator.baseCapacity)} kW</span>
                    </div>
                </div>
                <div class="item-footer">
                    <button class="buy-button" ${!canAfford ? 'disabled' : ''}>
                        Buy for ${Utils.formatUSD(cost)}
                    </button>
                </div>
            `;
            const buyBtn = item.querySelector('.buy-button');
            buyBtn.addEventListener('click', () => this.buyGenerator(generator.id));
            container.appendChild(item);
        }
    }

    buildUpgradesShop() {
        const container = document.getElementById('upgrades-list');
        const tabsContainer = document.getElementById('upgrades-categories');
        if (!container || !tabsContainer) return;

        const unlockedUpgrades = this.upgradeTypes.filter(u => this.gameState.unlockedUpgrades.includes(u.id));
        const categories = this.getCategoriesForItems(unlockedUpgrades, 'General');

        if (categories.length === 0) {
            tabsContainer.style.display = 'none';
            tabsContainer.innerHTML = '';
            container.innerHTML = '<div class="empty-shop">No upgrades unlocked yet.</div>';
            this.shopFilters.upgrades = null;
            return;
        }

        let activeCategory = this.shopFilters.upgrades;
        if (!activeCategory || !categories.includes(activeCategory)) {
            activeCategory = categories[0];
            this.shopFilters.upgrades = activeCategory;
        }

        this.renderCategoryTabs(tabsContainer, categories, activeCategory, (category) => {
            this.shopFilters.upgrades = category;
            this.buildUpgradesShop();
        });

        container.innerHTML = '';
        const itemsToRender = categories.length === 1
            ? unlockedUpgrades
            : unlockedUpgrades.filter(u => (u.subcategory || 'General') === activeCategory);

        if (itemsToRender.length === 0) {
            container.innerHTML = `<div class="empty-shop">No upgrades available in ${activeCategory} yet.</div>`;
            return;
        }

        for (const upgrade of itemsToRender) {
            const owned = this.gameState.upgrades[upgrade.id] || 0;
            const maxed = upgrade.maxPurchases && owned >= upgrade.maxPurchases;
            const cost = this.getUpgradeCost(upgrade.id);
            const canAfford = this.gameState.money >= cost && !maxed;
            const item = document.createElement('div');
            item.className = `shop-item ${canAfford ? 'affordable' : ''} ${maxed ? 'locked' : ''}`;
            let statusText = '';
            if (maxed) {
                statusText = 'MAX';
            } else if (upgrade.maxPurchases) {
                statusText = `${owned}/${upgrade.maxPurchases}`;
            } else {
                statusText = `Owned: ${owned}`;
            }
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${upgrade.name}</span>
                    <span class="item-owned">${statusText}</span>
                </div>
                <div class="item-description">${upgrade.description}</div>
                <div class="item-footer">
                    <button class="buy-button" ${!canAfford ? 'disabled' : ''}>
                        ${maxed ? 'MAXED' : 'Buy for ' + Utils.formatUSD(cost)}
                    </button>
                </div>
            `;
            const buyBtn = item.querySelector('.buy-button');
            buyBtn.addEventListener('click', () => this.buyUpgrade(upgrade.id));
            container.appendChild(item);
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update panels
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const panelMap = {
            hardware: 'hardware-panel',
            power: 'power-panel',
            upgrades: 'upgrades-panel',
            prestige: 'prestige-panel',
            stats: 'stats-panel'
        };
        
        const panelId = panelMap[tabName];
        if (panelId) {
            document.getElementById(panelId).classList.add('active');
        }
        
        // Update stats if stats panel
        if (tabName === 'stats') {
            this.updateStatsPanel();
        }
    }

    updateStatsPanel() {
        const container = document.getElementById('stats-content');
        const stats = [
            { label: 'Total Clicks', value: Utils.formatNumber(this.gameState.stats.totalClicks) },
            { label: 'Total Hashes Solved', value: Utils.formatNumber(this.gameState.stats.totalHashesSolved) },
            { label: 'Total BTC Earned', value: Utils.formatBTC(this.gameState.stats.totalBTCEarned) },
            { label: 'Total Money Earned', value: Utils.formatUSD(this.gameState.stats.totalMoneyEarned) },
            { label: 'Current Money', value: Utils.formatUSD(this.gameState.money) },
            { label: 'Playtime', value: Utils.formatTime(this.gameState.stats.playtime) },
            { label: 'Events Triggered', value: this.gameState.stats.eventsTriggered },
            { label: 'Total Prestiges', value: this.gameState.totalPrestiges },
            { label: 'Hash Points', value: this.gameState.hashPoints },
            { label: 'HP Multiplier', value: this.getHashPointMultiplier().toFixed(2) + 'x' }
        ];
        container.innerHTML = stats.map(stat => `
            <div class="stat-row">
                <span class="label">${stat.label}:</span>
                <span class="value">${stat.value}</span>
            </div>
        `).join('');
    }

    updateUI() {
        // Update header stats
        document.getElementById('btc-display').textContent = Utils.formatBTC(this.gameState.bitcoin);
        document.getElementById('money-display').textContent = Utils.formatUSD(this.gameState.money);
        document.getElementById('hp-display').textContent = this.gameState.hashPoints;
        // Calculate rates
        const powerEfficiency = this.getPowerEfficiency();
        let totalHashrate = 0;
        let hashrateMultiplier = 1;
        for (const [id, count] of Object.entries(this.gameState.upgrades)) {
            const upgrade = this.upgradeTypes.find(u => u.id === id);
            if (upgrade && upgrade.effect.hashrateMultiplier) {
                hashrateMultiplier *= Math.pow(upgrade.effect.hashrateMultiplier, count);
            }
        }
        hashrateMultiplier *= this.getHashPointMultiplier();
        for (const [id, count] of Object.entries(this.gameState.hardware)) {
            const hardware = this.hardwareTypes.find(h => h.id === id);
            if (hardware) {
                totalHashrate += hardware.baseHashrate * count * hashrateMultiplier;
            }
        }
        totalHashrate *= powerEfficiency;
        document.getElementById('hashrate-display').textContent = Utils.formatNumber(totalHashrate);
        let hashesPerBTC = this.config.hashesPerBTC;
        for (const [id, count] of Object.entries(this.gameState.upgrades)) {
            const upgrade = this.upgradeTypes.find(u => u.id === id);
            if (upgrade && upgrade.effect.conversionBonus) {
                hashesPerBTC *= Math.pow(upgrade.effect.conversionBonus, count);
            }
        }
        const btcRate = totalHashrate / hashesPerBTC;
        document.getElementById('btcrate-display').textContent = Utils.formatBTC(btcRate);
        // Update power meter
        const powerUsed = this.getTotalPowerUsed();
        const powerCapacity = this.getTotalPowerCapacity();
        document.getElementById('power-used').textContent = Utils.formatNumber(powerUsed);
        document.getElementById('power-capacity').textContent = Utils.formatNumber(powerCapacity);
        const powerFill = document.getElementById('power-fill');
        const powerPercent = powerCapacity > 0 ? (powerUsed / powerCapacity) * 100 : 0;
        powerFill.style.width = Math.min(powerPercent, 100) + '%';
        if (powerPercent > 100) {
            powerFill.classList.add('overpowered');
        } else {
            powerFill.classList.remove('overpowered');
        }
        // Update market
        document.getElementById('market-rate').textContent = Utils.formatUSD(this.gameState.marketPrice);
        const trendEl = document.getElementById('market-trend');
        trendEl.className = 'trend-' + this.gameState.marketTrend;
        if (this.gameState.marketTrend === 'up') {
            trendEl.textContent = '↗';
        } else if (this.gameState.marketTrend === 'down') {
            trendEl.textContent = '↘';
        } else {
            trendEl.textContent = '─';
        }
        // Update click power display
        document.getElementById('click-power-display').textContent = '+' + Utils.formatNumber(this.getClickPower()) + ' hash/click';
        // Update pending hashes
        document.getElementById('pending-hashes').textContent = Utils.formatNumber(this.gameState.pendingHashes);
        // Update prestige panel
        document.getElementById('total-btc-run').textContent = Utils.formatBTC(this.gameState.totalBTCThisRun);
        document.getElementById('hp-on-prestige').textContent = this.calculateHashPointsOnPrestige();
        document.getElementById('hp-multiplier').textContent = this.getHashPointMultiplier().toFixed(2) + 'x';
        const prestigeBtn = document.getElementById('prestige-button');
        if (this.calculateHashPointsOnPrestige() === 0) {
            prestigeBtn.disabled = true;
        } else {
            prestigeBtn.disabled = false;
        }
        // Update shop affordability
        this.updateShopAffordability();
    }

    updateShopAffordability() {
        // Update hardware shop
        document.querySelectorAll('#hardware-list .shop-item').forEach((item, index) => {
            const hardware = this.hardwareTypes.filter(h => 
                this.gameState.unlockedHardware.includes(h.id)
            )[index];
            if (hardware) {
                const cost = this.getHardwareCost(hardware.id);
                const canAfford = this.gameState.money >= cost;
                if (canAfford) {
                    item.classList.add('affordable');
                } else {
                    item.classList.remove('affordable');
                }
                const btn = item.querySelector('.buy-button');
                btn.disabled = !canAfford;
            }
        });
        // Update generator shop
        document.querySelectorAll('#power-list .shop-item').forEach((item, index) => {
            const generator = this.generatorTypes.filter(g => 
                this.gameState.unlockedGenerators.includes(g.id)
            )[index];
            if (generator) {
                const cost = this.getGeneratorCost(generator.id);
                const canAfford = this.gameState.money >= cost;
                if (canAfford) {
                    item.classList.add('affordable');
                } else {
                    item.classList.remove('affordable');
                }
                const btn = item.querySelector('.buy-button');
                btn.disabled = !canAfford;
            }
        });
        // Update upgrades shop
        document.querySelectorAll('#upgrades-list .shop-item').forEach((item, index) => {
            const upgrade = this.upgradeTypes.filter(u => 
                this.gameState.unlockedUpgrades.includes(u.id)
            )[index];
            if (upgrade) {
                const owned = this.gameState.upgrades[upgrade.id] || 0;
                const maxed = upgrade.maxPurchases && owned >= upgrade.maxPurchases;
                const cost = this.getUpgradeCost(upgrade.id);
                const canAfford = this.gameState.money >= cost && !maxed;
                if (canAfford) {
                    item.classList.add('affordable');
                } else {
                    item.classList.remove('affordable');
                }
                const btn = item.querySelector('.buy-button');
                btn.disabled = !canAfford;
            }
        });
    }

    startAutosave() {
        this.autosaveInterval = setInterval(() => {
            this.gameState.lastUpdate = Date.now();
            Storage.save(this.gameState);
        }, Storage.AUTOSAVE_INTERVAL);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new BitcoinClickerGame();
    game.init();
    window.game = game;
    window.blackjack = new Blackjack(game);
    window.blackmarket = new BlackMarket(game);
    // Secret gambling menu toggle
    document.addEventListener('keydown', (e) => {
        if (e.key === 'g' && !e.repeat) {
            const menu = document.getElementById('gambler-menu');
            menu.classList.toggle('active');
            window.blackjack.resetUI();
        }
        if (e.key === 'b' && !e.repeat) {
            const menu = document.getElementById('blackmarket-menu');
            menu.classList.toggle('active');
            if (menu.classList.contains('active')) {
                window.blackmarket.updateUI();
            }
        }
        if (e.key === 'h' && !e.repeat && game.gameState.hasHackersToolkit) {
            window.blackmarket.startHackingMinigame();
        }
    });
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        game.gameState.lastUpdate = Date.now();
        Storage.save(game.gameState);
    });
});

// Blackjack logic
class Blackjack {
    constructor(game) {
        this.game = game;
        this.playerCards = [];
        this.dealerCards = [];
        this.bet = 0;
        this.inProgress = false;
        this.playerStands = false;
        this.setupUI();
    }
    setupUI() {
        this.statusEl = document.getElementById('blackjack-status');
        this.playerEl = document.getElementById('blackjack-player-cards');
        this.dealerEl = document.getElementById('blackjack-dealer-cards');
        this.betEl = document.getElementById('blackjack-bet');
        this.dealBtn = document.getElementById('blackjack-deal');
        this.hitBtn = document.getElementById('blackjack-hit');
        this.standBtn = document.getElementById('blackjack-stand');
        this.dealBtn.onclick = () => this.startGame();
        this.hitBtn.onclick = () => this.hit();
        this.standBtn.onclick = () => this.stand();
    }
    resetUI() {
        this.statusEl.textContent = 'Press Deal to start!';
        this.playerEl.textContent = '';
        this.dealerEl.textContent = '';
        this.hitBtn.disabled = true;
        this.standBtn.disabled = true;
        this.inProgress = false;
        this.playerStands = false;
    }
    startGame() {
        this.bet = Math.max(1, Math.floor(Number(this.betEl.value)));
        if (this.bet > this.game.gameState.money) {
            this.statusEl.textContent = 'Not enough cash!';
            return;
        }
        this.game.gameState.money -= this.bet;
        this.inProgress = true;
        this.playerStands = false;
        this.playerCards = [this.drawCard(), this.drawCard()];
        this.dealerCards = [this.drawCard(), this.drawCard()];
        this.updateUI();
        this.hitBtn.disabled = false;
        this.standBtn.disabled = false;
        this.statusEl.textContent = 'Hit or Stand?';
    }
    drawCard() {
        const ranks = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
        const suits = ['♠','♥','♦','♣'];
        const rank = ranks[Math.floor(Math.random()*ranks.length)];
        const suit = suits[Math.floor(Math.random()*suits.length)];
        return {rank,suit};
    }
    handValue(cards) {
        let value = 0, aces = 0;
        for (const card of cards) {
            if (typeof card.rank === 'number') value += card.rank;
            else if (card.rank === 'A') { value += 11; aces++; }
            else value += 10;
        }
        while (value > 21 && aces > 0) { value -= 10; aces--; }
        return value;
    }
    updateUI() {
        this.playerEl.textContent = this.playerCards.map(c=>c.rank+c.suit).join(' ')+` (${this.handValue(this.playerCards)})`;
        if (this.playerStands)
            this.dealerEl.textContent = this.dealerCards.map(c=>c.rank+c.suit).join(' ')+` (${this.handValue(this.dealerCards)})`;
        else
            this.dealerEl.textContent = this.dealerCards[0].rank+this.dealerCards[0].suit+' ??';
    }
    hit() {
        if (!this.inProgress) return;
        this.playerCards.push(this.drawCard());
        this.updateUI();
        const val = this.handValue(this.playerCards);
        if (val > 21) {
            this.endGame('Bust! You lose.');
        }
    }
    stand() {
        if (!this.inProgress) return;
        this.playerStands = true;
        this.hitBtn.disabled = true;
        this.standBtn.disabled = true;
        this.dealerTurn();
    }
    dealerTurn() {
        while (this.handValue(this.dealerCards) < 17) {
            this.dealerCards.push(this.drawCard());
        }
        this.updateUI();
        this.resolveGame();
    }
    resolveGame() {
        const playerVal = this.handValue(this.playerCards);
        const dealerVal = this.handValue(this.dealerCards);
        let result = '';
        if (dealerVal > 21 || playerVal > dealerVal) {
            result = `You win! +$${this.bet*2}`;
            this.game.gameState.money += this.bet*2;
        } else if (playerVal === dealerVal) {
            result = 'Push! Bet returned.';
            this.game.gameState.money += this.bet;
        } else {
            result = 'Dealer wins! You lose.';
        }
        this.endGame(result);
    }
    endGame(msg) {
        this.statusEl.textContent = msg;
        this.hitBtn.disabled = true;
        this.standBtn.disabled = true;
        this.inProgress = false;
        this.updateUI();
        // Update main money display
        if (document.getElementById('money-display')) {
            document.getElementById('money-display').textContent = `$${this.game.gameState.money.toLocaleString()}`;
        }
    }
}

// Black Market logic
class BlackMarket {
    constructor(game) {
        this.game = game;
        
        // Item pool for the rotating shop
        this.itemPool = [
            // Risk/Reward Items
            {
                id: 'quantum_gamble',
                name: '⚛️ Quantum Gamble',
                description: 'Schrödinger\'s investment. 60% chance to triple your money, 40% chance to lose it all.',
                type: 'risk',
                cost: 5000,
                effect: () => {
                    const roll = Math.random();
                    if (roll < 0.6) {
                        this.game.gameState.money *= 3;
                        Utils.createNotification('Quantum Success!', 'The wave collapsed in your favor! Money tripled!', 'success');
                    } else {
                        this.game.gameState.money = 0;
                        Utils.createNotification('Quantum Failure!', 'Your money evaporated into the void...', 'danger');
                    }
                }
            },
            {
                id: 'mystery_box',
                name: '📦 Mystery Box',
                description: 'Could be anything! 50% BTC bonus, 30% small loss, 20% jackpot!',
                type: 'risk',
                cost: 10000,
                effect: () => {
                    const roll = Math.random();
                    if (roll < 0.5) {
                        const bonus = this.game.gameState.bitcoin * 0.5;
                        this.game.gameState.bitcoin += bonus;
                        Utils.createNotification('Mystery Box: Bonus!', `Found ${bonus.toFixed(8)} BTC inside!`, 'success');
                    } else if (roll < 0.8) {
                        this.game.gameState.money *= 0.7;
                        Utils.createNotification('Mystery Box: Dud', 'Just a note saying "GOTCHA" and 30% of your money is gone.', 'warning');
                    } else {
                        const jackpot = this.game.gameState.bitcoin * 2;
                        this.game.gameState.bitcoin += jackpot;
                        Utils.createNotification('Mystery Box: JACKPOT!', `🎰 YOU HIT THE JACKPOT! +${jackpot.toFixed(8)} BTC!`, 'success');
                    }
                }
            },
            {
                id: 'volatility_token',
                name: '📊 Volatility Token',
                description: 'Doubles market volatility for 2 minutes. High risk, high reward.',
                type: 'risk',
                cost: 15000,
                effect: () => {
                    const buff = {
                        id: 'volatility',
                        name: 'Market Volatility',
                        icon: '📊',
                        multiplier: 2,
                        duration: 120000, // 2 minutes
                        startTime: Date.now(),
                        description: 'Market swings are doubled!'
                    };
                    this.game.gameState.activeBuffs.push(buff);
                    this.game.config.marketVolatility *= 2;
                    Utils.createNotification('Volatility Activated!', 'The market is about to get wild!', 'warning');
                    
                    setTimeout(() => {
                        this.game.config.marketVolatility /= 2;
                        this.removeBuff('volatility');
                    }, buff.duration);
                }
            },
            // Hacker's Toolkit
            {
                id: 'hackers_toolkit',
                name: '💻 Hacker\'s Toolkit',
                description: 'Press H to hack random wallets for BTC. High risk, high reward. One-time purchase.',
                type: 'special',
                cost: 50000,
                permanent: true,
                effect: () => {
                    this.game.gameState.hasHackersToolkit = true;
                    Utils.createNotification('Hacker\'s Toolkit Acquired!', 'Press H to start hacking. Welcome to the dark side...', 'success');
                }
            },
            // Temporary Buffs
            {
                id: 'overclocking_chip',
                name: '⚡ Overclocking Chip',
                description: 'Double hashrate for 5 minutes. Your hardware is screaming.',
                type: 'buff',
                cost: 8000,
                effect: () => {
                    const buff = {
                        id: 'overclock',
                        name: 'Overclocked',
                        icon: '⚡',
                        multiplier: 2,
                        duration: 300000, // 5 minutes
                        startTime: Date.now(),
                        description: 'Hashrate x2'
                    };
                    this.game.gameState.activeBuffs.push(buff);
                    Utils.createNotification('Overclocked!', 'Your hardware is running HOT! Hashrate x2 for 5 min', 'success');
                    
                    setTimeout(() => {
                        this.removeBuff('overclock');
                        Utils.createNotification('Overclock Expired', 'Hardware returning to normal temps...', 'info');
                    }, buff.duration);
                }
            },
            {
                id: 'golden_touch',
                name: '✨ Golden Touch',
                description: 'Every click gives 10x hashes for 3 minutes.',
                type: 'buff',
                cost: 12000,
                effect: () => {
                    const buff = {
                        id: 'golden_touch',
                        name: 'Golden Touch',
                        icon: '✨',
                        multiplier: 10,
                        duration: 180000, // 3 minutes
                        startTime: Date.now(),
                        description: 'Click power x10'
                    };
                    this.game.gameState.activeBuffs.push(buff);
                    Utils.createNotification('Golden Touch!', 'Your clicks are LEGENDARY! x10 for 3 min', 'success');
                    
                    setTimeout(() => {
                        this.removeBuff('golden_touch');
                        Utils.createNotification('Golden Touch Faded', 'Back to mortal clicking...', 'info');
                    }, buff.duration);
                }
            },
            {
                id: 'time_warp',
                name: '⏰ Time Warp',
                description: 'Simulate 10 minutes of offline progress instantly.',
                type: 'buff',
                cost: 20000,
                effect: () => {
                    const offlineTime = 10 * 60; // 10 minutes in seconds
                    this.game.processOfflineProgress(offlineTime);
                    Utils.createNotification('Time Warp!', 'You just skipped 10 minutes into the future!', 'success');
                }
            },
            {
                id: 'focus_serum',
                name: '🧪 Focus Serum',
                description: 'Triple click power for 2 minutes. Feel the rush.',
                type: 'buff',
                cost: 7000,
                effect: () => {
                    const buff = {
                        id: 'focus',
                        name: 'Focused',
                        icon: '🧪',
                        multiplier: 3,
                        duration: 120000, // 2 minutes
                        startTime: Date.now(),
                        description: 'Click power x3'
                    };
                    this.game.gameState.activeBuffs.push(buff);
                    Utils.createNotification('Focus Activated!', 'Your mind is razor sharp! Click power x3', 'success');
                    
                    setTimeout(() => {
                        this.removeBuff('focus');
                        Utils.createNotification('Focus Worn Off', 'The serum has faded...', 'info');
                    }, buff.duration);
                }
            },
            {
                id: 'btc_magnet',
                name: '🧲 BTC Magnet',
                description: 'Attracts Bitcoin. +50% BTC/s for 4 minutes.',
                type: 'buff',
                cost: 18000,
                effect: () => {
                    const buff = {
                        id: 'btc_magnet',
                        name: 'BTC Magnet',
                        icon: '🧲',
                        multiplier: 1.5,
                        duration: 240000, // 4 minutes
                        startTime: Date.now(),
                        description: 'BTC generation +50%'
                    };
                    this.game.gameState.activeBuffs.push(buff);
                    Utils.createNotification('BTC Magnet Active!', 'Bitcoin is magnetically drawn to you! +50%', 'success');
                    
                    setTimeout(() => {
                        this.removeBuff('btc_magnet');
                        Utils.createNotification('Magnet Deactivated', 'The magnetic field has collapsed.', 'info');
                    }, buff.duration);
                }
            },
            {
                id: 'power_surge',
                name: '⚡ Power Surge',
                description: 'Infinite power for 5 minutes. No power restrictions!',
                type: 'buff',
                cost: 25000,
                effect: () => {
                    const buff = {
                        id: 'power_surge',
                        name: 'Power Surge',
                        icon: '⚡',
                        multiplier: 1,
                        duration: 300000, // 5 minutes
                        startTime: Date.now(),
                        description: 'Infinite power!'
                    };
                    this.game.gameState.activeBuffs.push(buff);
                    Utils.createNotification('Power Surge!', 'Unlimited power for 5 minutes!', 'success');
                    
                    setTimeout(() => {
                        this.removeBuff('power_surge');
                        Utils.createNotification('Power Surge Ended', 'Power constraints restored.', 'info');
                    }, buff.duration);
                }
            }
        ];
        
        this.setupUI();
        this.setupLoanProcessing();
        this.rotateShop(); // Initial shop setup
        
        // Live updates
        setInterval(() => {
            this.updateUI();
            this.updateBuffs();
        }, 1000);
        
        // Rotate shop every 10 minutes
        setInterval(() => {
            this.rotateShop();
        }, 600000); // 10 minutes
    }
    
    rotateShop() {
        // Select 4-6 random items for the shop
        const shopSize = 4 + Math.floor(Math.random() * 3); // 4-6 items
        const availableItems = this.itemPool.filter(item => {
            // Exclude Hacker's Toolkit if already owned
            if (item.id === 'hackers_toolkit' && this.game.gameState.hasHackersToolkit) {
                return false;
            }
            return true;
        });
        
        const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
        this.game.gameState.blackMarketShop = shuffled.slice(0, shopSize);
        this.game.gameState.shopRotationTime = Date.now();
        
        Utils.createNotification('Black Market Restocked!', 'New items available. Press B to check them out.', 'info');
        this.updateUI();
    }
    
    removeBuff(buffId) {
        const index = this.game.gameState.activeBuffs.findIndex(b => b.id === buffId);
        if (index !== -1) {
            this.game.gameState.activeBuffs.splice(index, 1);
        }
    }
    
    updateBuffs() {
        const now = Date.now();
        this.game.gameState.activeBuffs = this.game.gameState.activeBuffs.filter(buff => {
            return (now - buff.startTime) < buff.duration;
        });
    }
    
    getActiveMultiplier(type) {
        let multiplier = 1;
        this.game.gameState.activeBuffs.forEach(buff => {
            if (buff.id === 'overclock' && type === 'hashrate') multiplier *= buff.multiplier;
            if ((buff.id === 'golden_touch' || buff.id === 'focus') && type === 'click') multiplier *= buff.multiplier;
            if (buff.id === 'btc_magnet' && type === 'btc') multiplier *= buff.multiplier;
        });
        return multiplier;
    }
    
    hasPowerSurge() {
        return this.game.gameState.activeBuffs.some(buff => buff.id === 'power_surge');
    }
    
    startHackingMinigame() {
        // Create hacking overlay
        const overlay = document.createElement('div');
        overlay.className = 'hacking-overlay';
        overlay.innerHTML = `
            <div class="hacking-terminal">
                <div class="terminal-header">
                    <span>💻 HACKING TERMINAL</span>
                    <button class="terminal-close">✖</button>
                </div>
                <div class="terminal-content">
                    <div class="terminal-output" id="hack-output">
                        <p class="terminal-line">INITIALIZING WALLET SCANNER...</p>
                        <p class="terminal-line">SEARCHING FOR VULNERABLE TARGETS...</p>
                        <p class="terminal-line">TARGET ACQUIRED: WALLET #${Math.floor(Math.random() * 999999)}</p>
                        <p class="terminal-line terminal-prompt">CRACK THE CODE: <span id="hack-code"></span></p>
                    </div>
                    <div class="terminal-input-area">
                        <span class="prompt">></span>
                        <input type="text" id="hack-input" class="terminal-input" maxlength="6" placeholder="Enter code...">
                        <button id="hack-submit" class="terminal-btn">HACK</button>
                    </div>
                    <div class="hack-timer">
                        Time remaining: <span id="hack-time">10</span>s
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Generate random 6-digit code
        const code = String(Math.floor(Math.random() * 900000) + 100000);
        document.getElementById('hack-code').textContent = code.split('').join(' ');
        
        let timeLeft = 10;
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('hack-time').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.endHack(overlay, false);
            }
        }, 1000);
        
        const input = document.getElementById('hack-input');
        const submit = document.getElementById('hack-submit');
        
        const attemptHack = () => {
            const userCode = input.value;
            if (userCode === code) {
                clearInterval(timer);
                this.endHack(overlay, true);
            } else {
                const output = document.getElementById('hack-output');
                output.innerHTML += `<p class="terminal-line terminal-error">INCORRECT CODE: ${userCode}</p>`;
                output.scrollTop = output.scrollHeight;
                input.value = '';
            }
        };
        
        submit.addEventListener('click', attemptHack);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') attemptHack();
        });
        
        overlay.querySelector('.terminal-close').addEventListener('click', () => {
            clearInterval(timer);
            overlay.remove();
        });
        
        input.focus();
    }
    
    endHack(overlay, success) {
        const output = document.getElementById('hack-output');
        
        if (success) {
            // Successful hack
            const baseReward = this.game.gameState.bitcoin * 0.1;
            const bonusChance = Math.random();
            let reward = baseReward;
            let message = 'HACK SUCCESSFUL!';
            
            if (bonusChance > 0.9) {
                // 10% chance for mega bonus
                reward = baseReward * 5;
                message = '💎 JACKPOT WALLET FOUND!';
                output.innerHTML += `<p class="terminal-line terminal-success">████████████████████</p>`;
                output.innerHTML += `<p class="terminal-line terminal-success">${message}</p>`;
                output.innerHTML += `<p class="terminal-line terminal-success">EXTRACTED ${reward.toFixed(8)} BTC!</p>`;
                output.innerHTML += `<p class="terminal-line terminal-success">████████████████████</p>`;
            } else if (bonusChance < 0.2) {
                // 20% chance to get caught and pay a fine
                const fine = this.game.gameState.money * 0.3;
                this.game.gameState.money -= fine;
                output.innerHTML += `<p class="terminal-line terminal-error">⚠️ WARNING: TRACE DETECTED!</p>`;
                output.innerHTML += `<p class="terminal-line terminal-error">SECURITY ALERT TRIGGERED!</p>`;
                output.innerHTML += `<p class="terminal-line terminal-error">PAID $${fine.toFixed(0)} IN BRIBES TO AVOID ARREST</p>`;
                reward = 0;
            } else {
                output.innerHTML += `<p class="terminal-line terminal-success">✓ ${message}</p>`;
                output.innerHTML += `<p class="terminal-line terminal-success">✓ STOLEN ${reward.toFixed(8)} BTC</p>`;
            }
            
            this.game.gameState.bitcoin += reward;
            
        } else {
            output.innerHTML += `<p class="terminal-line terminal-error">✗ TIME EXPIRED!</p>`;
            output.innerHTML += `<p class="terminal-line terminal-error">✗ CONNECTION LOST</p>`;
            output.innerHTML += `<p class="terminal-line terminal-error">✗ TRACE INITIATED... RUN!</p>`;
        }
        
        setTimeout(() => {
            overlay.remove();
        }, 3000);
    }

    setupUI() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.blackmarket-tabs .tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Loan buttons
        const loanBtns = document.querySelectorAll('.loan-btn');
        loanBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseFloat(btn.dataset.amount);
                const interest = parseFloat(btn.dataset.interest);
                this.takeLoan(amount, interest);
            });
        });

        // Autopay settings
        const autopayCheckbox = document.getElementById('autopay-enabled');
        const autopayPercentage = document.getElementById('autopay-percentage');
        
        autopayCheckbox.addEventListener('change', (e) => {
            this.game.gameState.autopayEnabled = e.target.checked;
        });

        autopayPercentage.addEventListener('change', (e) => {
            this.game.gameState.autopayPercentage = Math.max(10, Math.min(100, parseFloat(e.target.value)));
        });
    }

    setupLoanProcessing() {
        // Process loan interest periodically. Run check every minute and
        // apply compounding every hour (production).
        setInterval(() => {
            this.processLoanInterest();
        }, 60000); // run check every 60 seconds
    }

    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.blackmarket-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.blackmarket-content .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    takeLoan(amount, interestRate) {
        // Apply 15% upfront fee
        const upfrontFee = 0.15;
        const totalOwed = amount * (1 + upfrontFee);
        const loan = {
            id: Date.now(),
            principal: amount,
            remaining: totalOwed,
            interestRate: interestRate,
            takenAt: Date.now(),
            lastInterestApplied: Date.now()
        };

        this.game.gameState.loans.push(loan);
        this.game.gameState.money += amount;

        Utils.createNotification(
            'Loan Approved',
            `You received $${amount.toLocaleString()} but owe $${totalOwed.toLocaleString()} (15% fee).`,
            'warning'
        );

        this.updateUI();
    }
    
    buyItem(itemId) {
        const item = this.game.gameState.blackMarketShop.find(i => i.id === itemId);
        if (!item) return;
        
        if (this.game.gameState.money < item.cost) {
            Utils.createNotification('Insufficient Funds', 'You don\'t have enough money!', 'danger');
            return;
        }
        
        this.game.gameState.money -= item.cost;
        item.effect();
        
        // Remove item from shop after purchase (will reappear on next rotation)
        this.game.gameState.blackMarketShop = this.game.gameState.blackMarketShop.filter(i => i.id !== itemId);
        
        this.updateUI();
    }

    processLoanInterest() {
        const now = Date.now();
    const intervalMs = 3600000; // 60 minutes (1 hour)
    const interestRate = 0.20; // 20% per compounding (online)

        this.game.gameState.loans.forEach(loan => {
            const timeSinceLastInterest = now - loan.lastInterestApplied;
            if (timeSinceLastInterest >= intervalMs) {
                const intervalsElapsed = Math.floor(timeSinceLastInterest / intervalMs);
                loan.remaining *= Math.pow(1 + interestRate, intervalsElapsed);
                loan.lastInterestApplied = now;

                Utils.createNotification(
                    'Loan Interest Applied',
                    `Your debt compounded by 20% every 1 hour. Now owing $${loan.remaining.toLocaleString(undefined, {maximumFractionDigits: 0})}`,
                    'danger'
                );
            }
        });

        // Auto-payment processing
        if (this.game.gameState.autopayEnabled && this.game.gameState.loans.length > 0) {
            this.processAutopay();
        }

        this.updateUI();
    }

    processAutopay() {
        this.game.gameState.loans.forEach((loan, index) => {
            const paymentAmount = Math.min(
                loan.remaining * (this.game.gameState.autopayPercentage / 100),
                this.game.gameState.money
            );

            if (paymentAmount > 0) {
                this.payLoan(index, paymentAmount);
            }
        });
    }

    payLoan(loanIndex, amount) {
        const loan = this.game.gameState.loans[loanIndex];
        if (!loan) return;

        const actualPayment = Math.min(amount, this.game.gameState.money, loan.remaining);
        
        this.game.gameState.money -= actualPayment;
        loan.remaining -= actualPayment;

        if (loan.remaining <= 0.01) {
            this.game.gameState.loans.splice(loanIndex, 1);
            Utils.createNotification(
                'Loan Paid Off!',
                'One less problem to worry about.',
                'success'
            );
        }

        this.updateUI();
    }

    updateUI() {
        this.updateLoansUI();
        this.updateMarketUI();
        this.updateBuffsDisplay();
    }
    
    updateBuffsDisplay() {
        // Update active buffs display in header or create a dedicated area
        let buffsContainer = document.getElementById('active-buffs-display');
        if (!buffsContainer) {
            buffsContainer = document.createElement('div');
            buffsContainer.id = 'active-buffs-display';
            buffsContainer.className = 'active-buffs-container';
            const header = document.getElementById('header');
            if (header) {
                header.appendChild(buffsContainer);
            }
        }
        
        if (this.game.gameState.activeBuffs.length === 0) {
            buffsContainer.innerHTML = '';
            return;
        }
        
        buffsContainer.innerHTML = '<div class="buffs-title">Active Effects:</div>' + 
            this.game.gameState.activeBuffs.map(buff => {
                const timeLeft = Math.max(0, buff.duration - (Date.now() - buff.startTime));
                const seconds = Math.floor(timeLeft / 1000);
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `
                    <div class="buff-item">
                        <span class="buff-icon">${buff.icon}</span>
                        <span class="buff-name">${buff.name}</span>
                        <span class="buff-time">${minutes}:${secs.toString().padStart(2, '0')}</span>
                    </div>
                `;
            }).join('');
    }
    
    updateMarketUI() {
        const marketSection = document.querySelector('.market-section');
        if (!marketSection) return;
        
        const now = Date.now();
        const timeUntilRotation = 600000 - (now - this.game.gameState.shopRotationTime);
        const minutes = Math.floor(timeUntilRotation / 60000);
        const seconds = Math.floor((timeUntilRotation % 60000) / 1000);
        
        marketSection.innerHTML = `
            <div class="market-header">
                <h3>🏴‍☠️ Underground Market</h3>
                <p class="shop-timer">Shop rotates in: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
                ${this.game.gameState.hasHackersToolkit ? '<p class="hack-hint">💻 Press H to start hacking</p>' : ''}
            </div>
            <div class="market-items">
                ${this.game.gameState.blackMarketShop.map(item => {
                    const canAfford = this.game.gameState.money >= item.cost;
                    return `
                        <div class="market-item ${canAfford ? 'affordable' : 'locked'}">
                            <div class="item-header">
                                <h4>${item.name}</h4>
                                <span class="item-type ${item.type}">${item.type.toUpperCase()}</span>
                            </div>
                            <p class="item-description">${item.description}</p>
                            <div class="item-footer">
                                <span class="item-cost">$${item.cost.toLocaleString()}</span>
                                <button class="buy-item-btn" onclick="window.blackmarket.buyItem('${item.id}')" ${!canAfford ? 'disabled' : ''}>
                                    ${canAfford ? 'BUY' : 'LOCKED'}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    updateLoansUI() {
        const loansListEl = document.getElementById('active-loans-list');
        const autopayCheckbox = document.getElementById('autopay-enabled');
        const autopayPercentage = document.getElementById('autopay-percentage');

        // Update autopay controls
        autopayCheckbox.checked = this.game.gameState.autopayEnabled;
        autopayPercentage.value = this.game.gameState.autopayPercentage;

        if (this.game.gameState.loans.length === 0) {
            loansListEl.innerHTML = '<p class="empty-state">No active loans. (Smart choice.)</p>';
            return;
        }

        loansListEl.innerHTML = this.game.gameState.loans.map((loan, index) => {
            const minutesActive = Math.floor((Date.now() - loan.takenAt) / 60000);
            const intervalMs = 3600000; // 60 min (1 hour)
            const now = Date.now();
            const elapsed = now - loan.lastInterestApplied;
            const nextCompoundMs = Math.max(0, intervalMs - elapsed);
            const minLeft = Math.floor(nextCompoundMs / 60000);
            const secLeft = Math.floor((nextCompoundMs % 60000) / 1000);
            return `
                <div class="loan-item">
                    <div class="loan-info">
                        <p><strong>Principal:</strong> $${loan.principal.toLocaleString()}</p>
                        <p><strong>Remaining:</strong> $${loan.remaining.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                        <p><strong>Interest Rate:</strong> <span style='color:#e00;'>20%/1h (online), 10%/12h (offline)</span></p>
                        <p><strong>Minutes Active:</strong> ${minutesActive}</p>
                        <p style="color:#ff8800;font-weight:bold;">Next compounding: ${minLeft}m ${secLeft}s</p>
                    </div>
                    <div class="loan-actions">
                        <input type="number" id="payment-${index}" placeholder="Payment amount" min="1" />
                        <button onclick="window.blackmarket.payLoan(${index}, parseFloat(document.getElementById('payment-${index}').value) || 0)">Pay</button>
                        <button onclick="window.blackmarket.payLoan(${index}, ${loan.remaining})">Pay in Full</button>
                    </div>
                </div>
            `;
        }).join('');

        // Countdown to next compounding
        const timerEl = document.getElementById('loan-compound-timer');
        if (this.game.gameState.loans.length > 0 && timerEl) {
            const now = Date.now();
            const nextCompoundMs = Math.min(...this.game.gameState.loans.map(loan => {
                const intervalMs = 3600000;
                const elapsed = now - loan.lastInterestApplied;
                return Math.max(0, intervalMs - elapsed);
            }));
            const minLeft = Math.floor(nextCompoundMs / 60000);
            const secLeft = Math.floor((nextCompoundMs % 60000) / 1000);
            timerEl.textContent = `Next interest compounding in: ${minLeft}m ${secLeft}s`;
        } else if (timerEl) {
            timerEl.textContent = '';
        }
    }
}
