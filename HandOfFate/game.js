// Hand of Fate - Card Adventure Game
// A deck-building adventure game where fate is determined by the cards you draw

class HandOfFateGame {
    constructor() {
        this.gameState = 'title'; // title, playing, combat, gameOver
        this.player = {
            health: 100,
            maxHealth: 100,
            gold: 50,
            fame: 0,
            level: 1,
            attack: 10,
            defense: 5,
            inventory: [],
            deck: [],
            defending: false
        };
        
        this.currentLevel = 1;
        this.currentEncounter = null;
        this.currentEnemy = null;
        this.cardsRemaining = 0;
        this.levelComplete = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGameData();
    }
    
    setupEventListeners() {
        // Title screen
        document.getElementById('startGame').addEventListener('click', () => this.startNewGame());
        document.getElementById('continueGame').addEventListener('click', () => this.continueGame());
        document.getElementById('showHelp').addEventListener('click', () => this.showScreen('helpScreen'));
        
        // Help screen
        document.getElementById('backToTitle').addEventListener('click', () => this.showScreen('titleScreen'));
        
        // Game controls
        document.getElementById('inventoryBtn').addEventListener('click', () => this.showInventory());
        document.getElementById('deckBtn').addEventListener('click', () => this.showDeck());
        document.getElementById('saveGame').addEventListener('click', () => this.saveGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.returnToMenu());
        
        // Panel close buttons
        document.getElementById('closeEncounter')?.addEventListener('click', () => this.closePanel('encounterPanel'));
        document.getElementById('closeInventory')?.addEventListener('click', () => this.closePanel('inventoryPanel'));
        document.getElementById('closeShop')?.addEventListener('click', () => this.closePanel('shopPanel'));
        
        // Combat actions
        document.getElementById('attackBtn').addEventListener('click', () => this.performAttack());
        document.getElementById('defendBtn').addEventListener('click', () => this.performDefend());
        document.getElementById('itemBtn').addEventListener('click', () => this.performUseItem());
        document.getElementById('specialBtn').addEventListener('click', () => this.performSpecial());
        
        // Game over
        document.getElementById('restartGame').addEventListener('click', () => this.startNewGame());
        document.getElementById('returnToMenu').addEventListener('click', () => this.showScreen('titleScreen'));
    }
    
    // Screen Management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        
        if (screenId === 'gameScreen') {
            this.updateUI();
        }
    }
    
    closePanel(panelId) {
        document.getElementById(panelId).classList.add('hidden');
    }
    
    showPanel(panelId) {
        document.getElementById(panelId).classList.remove('hidden');
    }
    
    // Game Initialization
    startNewGame() {
        this.player = {
            health: 100,
            maxHealth: 100,
            gold: 50,
            fame: 0,
            level: 1,
            attack: 10,
            defense: 5,
            inventory: [
                { name: 'Health Potion', icon: '🧪', effect: 'heal', value: 30, description: 'Restores 30 health' },
                { name: 'Health Potion', icon: '🧪', effect: 'heal', value: 30, description: 'Restores 30 health' }
            ],
            deck: [],
            defending: false
        };
        
        this.currentLevel = 1;
        this.initializeDeck();
        this.gameState = 'playing';
        this.showScreen('gameScreen');
        this.startLevel();
    }
    
    continueGame() {
        const savedGame = localStorage.getItem('handOfFateGame');
        if (savedGame) {
            const data = JSON.parse(savedGame);
            this.player = data.player;
            this.currentLevel = data.currentLevel;
            this.initializeDeck();
            this.gameState = 'playing';
            this.showScreen('gameScreen');
            this.startLevel();
        } else {
            alert('No saved game found!');
        }
    }
    
    saveGame() {
        const saveData = {
            player: this.player,
            currentLevel: this.currentLevel
        };
        localStorage.setItem('handOfFateGame', JSON.stringify(saveData));
        this.showMessage('Game saved!');
    }
    
    loadGameData() {
        const savedGame = localStorage.getItem('handOfFateGame');
        if (savedGame) {
            document.getElementById('continueGame').disabled = false;
        } else {
            document.getElementById('continueGame').disabled = true;
        }
    }
    
    returnToMenu() {
        if (confirm('Return to menu? (Unsaved progress will be lost)')) {
            this.showScreen('titleScreen');
            this.gameState = 'title';
        }
    }
    
    // Deck Management
    initializeDeck() {
        const baseDeck = [
            // Encounters
            { type: 'encounter', id: 'merchant', icon: '🏪', title: 'Merchant' },
            { type: 'encounter', id: 'traveler', icon: '🚶', title: 'Traveler' },
            { type: 'encounter', id: 'shrine', icon: '⛩️', title: 'Shrine' },
            { type: 'encounter', id: 'bandits', icon: '🗡️', title: 'Bandits' },
            
            // Enemies
            { type: 'enemy', id: 'goblin', icon: '👺', title: 'Goblin' },
            { type: 'enemy', id: 'skeleton', icon: '💀', title: 'Skeleton' },
            { type: 'enemy', id: 'wolf', icon: '🐺', title: 'Wolf' },
            { type: 'enemy', id: 'thief', icon: '🥷', title: 'Thief' },
            
            // Treasures
            { type: 'treasure', id: 'chest', icon: '📦', title: 'Treasure' },
            { type: 'treasure', id: 'gold', icon: '💰', title: 'Gold Pile' },
            
            // Curses
            { type: 'curse', id: 'trap', icon: '⚠️', title: 'Trap' },
            { type: 'curse', id: 'ambush', icon: '⚡', title: 'Ambush' }
        ];
        
        // Add more difficult cards for higher levels
        if (this.currentLevel >= 3) {
            baseDeck.push(
                { type: 'enemy', id: 'orc', icon: '👹', title: 'Orc Warrior' },
                { type: 'curse', id: 'curse', icon: '🔮', title: 'Dark Curse' }
            );
        }
        
        if (this.currentLevel >= 5) {
            baseDeck.push(
                { type: 'enemy', id: 'dragon', icon: '🐉', title: 'Dragon' }
            );
        }
        
        this.player.deck = [...baseDeck];
        this.shuffleDeck();
    }
    
    shuffleDeck() {
        for (let i = this.player.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.player.deck[i], this.player.deck[j]] = [this.player.deck[j], this.player.deck[i]];
        }
    }
    
    // Level Management
    startLevel() {
        this.showMessage(`Level ${this.currentLevel} begins...`);
        this.shuffleDeck();
        this.cardsRemaining = Math.min(5 + this.currentLevel, this.player.deck.length);
        this.levelComplete = false;
        this.displayCards();
    }
    
    displayCards() {
        const cardsArea = document.getElementById('cardsArea');
        cardsArea.innerHTML = '';
        
        const numCards = Math.min(4, this.cardsRemaining);
        
        for (let i = 0; i < numCards; i++) {
            const card = this.createCard(true);
            cardsArea.appendChild(card);
        }
        
        this.updateUI();
    }
    
    createCard(faceDown = false) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        if (faceDown) {
            cardDiv.classList.add('face-down');
            cardDiv.innerHTML = `
                <div class="card-icon">🎴</div>
                <div class="card-title">???</div>
                <div class="card-type">Draw Card</div>
            `;
            cardDiv.addEventListener('click', () => this.drawCard(cardDiv));
        }
        
        return cardDiv;
    }
    
    drawCard(cardElement) {
        if (this.gameState !== 'playing') return;
        
        this.cardsRemaining--;
        
        // Get random card from deck
        const cardIndex = Math.floor(Math.random() * this.player.deck.length);
        const cardData = this.player.deck[cardIndex];
        
        // Reveal card
        cardElement.classList.remove('face-down');
        cardElement.classList.add(cardData.type);
        cardElement.innerHTML = `
            <div class="card-icon">${cardData.icon}</div>
            <div class="card-title">${cardData.title}</div>
            <div class="card-type">${cardData.type}</div>
        `;
        
        // Trigger card effect after animation
        setTimeout(() => {
            cardElement.remove();
            this.triggerCardEffect(cardData);
        }, 1000);
    }
    
    triggerCardEffect(cardData) {
        switch (cardData.type) {
            case 'encounter':
                this.startEncounter(cardData);
                break;
            case 'enemy':
                this.startCombat(cardData);
                break;
            case 'treasure':
                this.receiveTreasure(cardData);
                break;
            case 'curse':
                this.applyCurse(cardData);
                break;
        }
        
        // Check if level complete
        if (this.cardsRemaining === 0 && !this.levelComplete) {
            this.completeLevel();
        }
    }
    
    // Encounters
    startEncounter(cardData) {
        this.currentEncounter = this.getEncounterData(cardData.id);
        document.getElementById('encounterTitle').textContent = this.currentEncounter.title;
        document.getElementById('encounterText').textContent = this.currentEncounter.text;
        
        const choicesContainer = document.getElementById('encounterChoices');
        choicesContainer.innerHTML = '';
        
        this.currentEncounter.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            
            // Check if choice is available
            if (choice.requireGold && this.player.gold < choice.requireGold) {
                btn.classList.add('disabled');
                btn.disabled = true;
                btn.textContent += ` (Need ${choice.requireGold} gold)`;
            }
            
            btn.addEventListener('click', () => this.makeChoice(choice));
            choicesContainer.appendChild(btn);
        });
        
        this.showPanel('encounterPanel');
    }
    
    getEncounterData(id) {
        const encounters = {
            merchant: {
                title: 'The Traveling Merchant',
                text: 'A friendly merchant approaches with a cart full of wares. "Care to browse my goods, traveler?"',
                choices: [
                    { text: 'Buy Health Potion (20 gold)', effect: 'buyPotion', requireGold: 20 },
                    { text: 'Buy Attack Blessing (50 gold)', effect: 'buyAttack', requireGold: 50 },
                    { text: 'Sell items for gold', effect: 'sellItems' },
                    { text: 'Move on', effect: 'continue' }
                ]
            },
            traveler: {
                title: 'Fellow Traveler',
                text: 'You meet a weary traveler resting by the road. They share stories of their adventures.',
                choices: [
                    { text: 'Share your food (Gain Fame)', effect: 'gainFame' },
                    { text: 'Ask for advice (Gain small heal)', effect: 'gainHeal' },
                    { text: 'Rob them (Lose Fame, Gain Gold)', effect: 'robTraveler' },
                    { text: 'Continue walking', effect: 'continue' }
                ]
            },
            shrine: {
                title: 'Ancient Shrine',
                text: 'A mystical shrine glows with divine energy. You sense its power calling to you.',
                choices: [
                    { text: 'Pray for strength (10 gold)', effect: 'prayStrength', requireGold: 10 },
                    { text: 'Pray for health (10 gold)', effect: 'prayHealth', requireGold: 10 },
                    { text: 'Offer tribute (50 gold)', effect: 'offerTribute', requireGold: 50 },
                    { text: 'Leave the shrine', effect: 'continue' }
                ]
            },
            bandits: {
                title: 'Bandit Encounter',
                text: 'A group of bandits blocks your path! "Your gold or your life!" they shout.',
                choices: [
                    { text: 'Fight them!', effect: 'fightBandits' },
                    { text: 'Pay them off (30 gold)', effect: 'payBandits', requireGold: 30 },
                    { text: 'Try to intimidate them', effect: 'intimidate' },
                    { text: 'Attempt to flee', effect: 'flee' }
                ]
            }
        };
        
        return encounters[id] || encounters.traveler;
    }
    
    makeChoice(choice) {
        this.closePanel('encounterPanel');
        
        switch (choice.effect) {
            case 'buyPotion':
                this.player.gold -= 20;
                this.player.inventory.push({ 
                    name: 'Health Potion', 
                    icon: '🧪', 
                    effect: 'heal', 
                    value: 30,
                    description: 'Restores 30 health'
                });
                this.showMessage('Purchased Health Potion!');
                break;
                
            case 'buyAttack':
                this.player.gold -= 50;
                this.player.attack += 5;
                this.showMessage('Attack increased by 5!');
                break;
                
            case 'sellItems':
                const goldGained = Math.floor(Math.random() * 20) + 10;
                this.player.gold += goldGained;
                this.showMessage(`Sold items for ${goldGained} gold!`);
                break;
                
            case 'gainFame':
                this.player.fame += 10;
                this.showMessage('Your kindness increases your fame!');
                break;
                
            case 'gainHeal':
                this.healPlayer(15);
                this.showMessage('The traveler shares healing herbs!');
                break;
                
            case 'robTraveler':
                this.player.gold += 30;
                this.player.fame -= 20;
                this.showMessage('You robbed the traveler... Fame decreased.');
                break;
                
            case 'prayStrength':
                this.player.gold -= 10;
                this.player.attack += 3;
                this.showMessage('The shrine blesses you with strength!');
                break;
                
            case 'prayHealth':
                this.player.gold -= 10;
                this.healPlayer(25);
                this.showMessage('The shrine restores your vitality!');
                break;
                
            case 'offerTribute':
                this.player.gold -= 50;
                this.player.maxHealth += 20;
                this.player.health = this.player.maxHealth;
                this.player.attack += 5;
                this.showMessage('The shrine grants you great power!');
                break;
                
            case 'fightBandits':
                this.startCombat({ id: 'bandits', icon: '🗡️', title: 'Bandits' });
                break;
                
            case 'payBandits':
                this.player.gold -= 30;
                this.showMessage('The bandits let you pass...');
                break;
                
            case 'intimidate':
                if (this.player.fame >= 30) {
                    this.showMessage('Your reputation scares them off!');
                } else {
                    this.showMessage('They laugh at you...');
                    this.damagePlayer(10);
                }
                break;
                
            case 'flee':
                if (Math.random() > 0.5) {
                    this.showMessage('You escaped!');
                } else {
                    this.showMessage('They caught you!');
                    this.damagePlayer(15);
                }
                break;
                
            case 'continue':
            default:
                this.displayCards();
                break;
        }
        
        this.updateUI();
        
        // Continue to next card if not in combat
        if (this.gameState !== 'combat') {
            setTimeout(() => this.displayCards(), 1000);
        }
    }
    
    // Combat System
    startCombat(cardData) {
        this.gameState = 'combat';
        this.currentEnemy = this.getEnemyData(cardData.id);
        
        document.getElementById('combatTitle').textContent = `Battle: ${this.currentEnemy.name}`;
        document.getElementById('enemyName').textContent = this.currentEnemy.name;
        this.updateCombatUI();
        
        this.clearCombatLog();
        this.logCombat(`You encounter ${this.currentEnemy.name}!`);
        
        this.showPanel('combatPanel');
    }
    
    getEnemyData(id) {
        const enemies = {
            goblin: {
                name: 'Goblin',
                health: 30 + (this.currentLevel * 5),
                maxHealth: 30 + (this.currentLevel * 5),
                attack: 5 + this.currentLevel,
                goldReward: 20,
                fameReward: 5
            },
            skeleton: {
                name: 'Skeleton Warrior',
                health: 40 + (this.currentLevel * 7),
                maxHealth: 40 + (this.currentLevel * 7),
                attack: 7 + this.currentLevel,
                goldReward: 25,
                fameReward: 8
            },
            wolf: {
                name: 'Dire Wolf',
                health: 35 + (this.currentLevel * 6),
                maxHealth: 35 + (this.currentLevel * 6),
                attack: 8 + this.currentLevel,
                goldReward: 15,
                fameReward: 7
            },
            thief: {
                name: 'Cunning Thief',
                health: 25 + (this.currentLevel * 5),
                maxHealth: 25 + (this.currentLevel * 5),
                attack: 6 + this.currentLevel,
                goldReward: 30,
                fameReward: 10
            },
            bandits: {
                name: 'Bandit Gang',
                health: 50 + (this.currentLevel * 8),
                maxHealth: 50 + (this.currentLevel * 8),
                attack: 10 + this.currentLevel,
                goldReward: 50,
                fameReward: 15
            },
            orc: {
                name: 'Orc Warrior',
                health: 60 + (this.currentLevel * 10),
                maxHealth: 60 + (this.currentLevel * 10),
                attack: 12 + this.currentLevel,
                goldReward: 60,
                fameReward: 20
            },
            dragon: {
                name: 'Ancient Dragon',
                health: 100 + (this.currentLevel * 15),
                maxHealth: 100 + (this.currentLevel * 15),
                attack: 15 + (this.currentLevel * 2),
                goldReward: 150,
                fameReward: 50
            },
            boss: {
                name: `Level ${this.currentLevel} Boss`,
                health: 80 + (this.currentLevel * 20),
                maxHealth: 80 + (this.currentLevel * 20),
                attack: 10 + (this.currentLevel * 3),
                goldReward: 100 + (this.currentLevel * 20),
                fameReward: 30 + (this.currentLevel * 5)
            }
        };
        
        return enemies[id] || enemies.goblin;
    }
    
    performAttack() {
        if (this.gameState !== 'combat' || !this.currentEnemy) return;
        
        const damage = this.player.attack + Math.floor(Math.random() * 5);
        const critical = Math.random() > 0.85;
        const finalDamage = critical ? damage * 2 : damage;
        
        this.currentEnemy.health -= finalDamage;
        
        if (critical) {
            this.logCombat(`<span class="critical">CRITICAL HIT! You deal ${finalDamage} damage!</span>`);
        } else {
            this.logCombat(`<span class="damage">You deal ${finalDamage} damage!</span>`);
        }
        
        this.player.defending = false;
        this.updateCombatUI();
        
        if (this.currentEnemy.health <= 0) {
            this.winCombat();
        } else {
            setTimeout(() => this.enemyTurn(), 800);
        }
    }
    
    performDefend() {
        if (this.gameState !== 'combat' || !this.currentEnemy) return;
        
        this.player.defending = true;
        this.logCombat('You take a defensive stance!');
        
        setTimeout(() => this.enemyTurn(), 800);
    }
    
    performUseItem() {
        if (this.gameState !== 'combat' || !this.currentEnemy) return;
        
        const healingItems = this.player.inventory.filter(item => item.effect === 'heal');
        
        if (healingItems.length === 0) {
            this.logCombat('No healing items available!');
            return;
        }
        
        const item = healingItems[0];
        const itemIndex = this.player.inventory.indexOf(item);
        this.player.inventory.splice(itemIndex, 1);
        
        this.healPlayer(item.value);
        this.logCombat(`<span class="heal">Used ${item.name}! Restored ${item.value} health!</span>`);
        this.updateCombatUI();
        
        setTimeout(() => this.enemyTurn(), 800);
    }
    
    performSpecial() {
        if (this.gameState !== 'combat' || !this.currentEnemy) return;
        
        if (this.player.fame < 20) {
            this.logCombat('Not enough Fame for special attack!');
            return;
        }
        
        this.player.fame -= 20;
        const damage = this.player.attack * 3;
        this.currentEnemy.health -= damage;
        
        this.logCombat(`<span class="critical">SPECIAL ATTACK! You deal ${damage} damage!</span>`);
        this.player.defending = false;
        this.updateCombatUI();
        
        if (this.currentEnemy.health <= 0) {
            this.winCombat();
        } else {
            setTimeout(() => this.enemyTurn(), 800);
        }
    }
    
    enemyTurn() {
        if (!this.currentEnemy || this.currentEnemy.health <= 0) return;
        
        let damage = this.currentEnemy.attack + Math.floor(Math.random() * 3);
        
        if (this.player.defending) {
            damage = Math.max(1, Math.floor(damage / 2));
            this.logCombat(`${this.currentEnemy.name} attacks! Your defense reduces damage!`);
        } else {
            this.logCombat(`${this.currentEnemy.name} attacks!`);
        }
        
        this.damagePlayer(damage);
        this.logCombat(`<span class="damage">You take ${damage} damage!</span>`);
        
        this.player.defending = false;
        this.updateCombatUI();
        
        if (this.player.health <= 0) {
            this.gameOver(false);
        }
    }
    
    winCombat() {
        this.logCombat(`<span class="critical">Victory! ${this.currentEnemy.name} defeated!</span>`);
        
        this.player.gold += this.currentEnemy.goldReward;
        this.player.fame += this.currentEnemy.fameReward;
        
        this.logCombat(`<span class="heal">Gained ${this.currentEnemy.goldReward} gold and ${this.currentEnemy.fameReward} fame!</span>`);
        
        // Random item drop
        if (Math.random() > 0.6) {
            const items = [
                { name: 'Health Potion', icon: '🧪', effect: 'heal', value: 30, description: 'Restores 30 health' },
                { name: 'Greater Health Potion', icon: '⚗️', effect: 'heal', value: 50, description: 'Restores 50 health' }
            ];
            const item = items[Math.floor(Math.random() * items.length)];
            this.player.inventory.push(item);
            this.logCombat(`<span class="heal">Found ${item.name}!</span>`);
        }
        
        setTimeout(() => {
            this.closePanel('combatPanel');
            this.gameState = 'playing';
            this.currentEnemy = null;
            this.displayCards();
        }, 2000);
    }
    
    // Treasure & Curses
    receiveTreasure(cardData) {
        const treasures = {
            chest: () => {
                const gold = 30 + Math.floor(Math.random() * 30);
                this.player.gold += gold;
                this.showMessage(`Found ${gold} gold in a treasure chest!`);
            },
            gold: () => {
                const gold = 20 + Math.floor(Math.random() * 20);
                this.player.gold += gold;
                this.showMessage(`Found ${gold} gold!`);
            }
        };
        
        const action = treasures[cardData.id] || treasures.gold;
        action();
        
        setTimeout(() => this.displayCards(), 1500);
    }
    
    applyCurse(cardData) {
        const curses = {
            trap: () => {
                const damage = 10 + Math.floor(Math.random() * 10);
                this.damagePlayer(damage);
                this.showMessage(`You triggered a trap! Lost ${damage} health!`);
            },
            ambush: () => {
                this.showMessage('Ambushed by enemies!');
                setTimeout(() => {
                    this.startCombat({ id: 'thief', icon: '🥷', title: 'Ambusher' });
                }, 1000);
            },
            curse: () => {
                this.player.attack = Math.max(5, this.player.attack - 3);
                this.showMessage('A dark curse weakens you! Attack decreased!');
            }
        };
        
        const action = curses[cardData.id] || curses.trap;
        action();
        
        if (cardData.id !== 'ambush') {
            setTimeout(() => this.displayCards(), 1500);
        }
    }
    
    // Level Completion
    completeLevel() {
        this.levelComplete = true;
        this.showMessage(`Level ${this.currentLevel} Complete!`);
        
        // Boss fight
        setTimeout(() => {
            this.showMessage('A powerful enemy approaches...');
            setTimeout(() => {
                this.startCombat({ id: 'boss', icon: '👑', title: 'Boss' });
            }, 1500);
        }, 1500);
    }
    
    nextLevel() {
        this.currentLevel++;
        this.player.level = this.currentLevel;
        
        // Level up bonuses
        this.player.maxHealth += 10;
        this.player.health = this.player.maxHealth;
        this.player.attack += 2;
        
        this.showMessage(`Level Up! Now Level ${this.currentLevel}!`);
        setTimeout(() => this.startLevel(), 2000);
    }
    
    // Player Actions
    healPlayer(amount) {
        this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
    }
    
    damagePlayer(amount) {
        this.player.health = Math.max(0, this.player.health - amount);
    }
    
    // UI Updates
    updateUI() {
        // Update stats
        document.getElementById('healthValue').textContent = `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('goldValue').textContent = this.player.gold;
        document.getElementById('fameValue').textContent = this.player.fame;
        document.getElementById('levelValue').textContent = this.player.level;
        
        // Update health bar
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('healthBar').style.width = `${healthPercent}%`;
    }
    
    updateCombatUI() {
        if (!this.currentEnemy) return;
        
        document.getElementById('enemyHealthValue').textContent = 
            `${Math.max(0, this.currentEnemy.health)}/${this.currentEnemy.maxHealth}`;
        document.getElementById('enemyAttack').textContent = this.currentEnemy.attack;
        
        const enemyHealthPercent = (this.currentEnemy.health / this.currentEnemy.maxHealth) * 100;
        document.getElementById('enemyHealthBar').style.width = `${Math.max(0, enemyHealthPercent)}%`;
        
        // Update special button state
        const specialBtn = document.getElementById('specialBtn');
        if (this.player.fame < 20) {
            specialBtn.disabled = true;
            specialBtn.textContent = '✨ Special (20 Fame)';
        } else {
            specialBtn.disabled = false;
            specialBtn.textContent = '✨ Special';
        }
        
        this.updateUI();
    }
    
    showMessage(message) {
        const messageEl = document.getElementById('tableMessage');
        messageEl.textContent = message;
        messageEl.style.animation = 'none';
        setTimeout(() => {
            messageEl.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }
    
    logCombat(message) {
        const log = document.getElementById('combatLog');
        const p = document.createElement('p');
        p.innerHTML = message;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
    }
    
    clearCombatLog() {
        document.getElementById('combatLog').innerHTML = '';
    }
    
    // Inventory
    showInventory() {
        const inventoryItems = document.getElementById('inventoryItems');
        inventoryItems.innerHTML = '';
        
        if (this.player.inventory.length === 0) {
            inventoryItems.innerHTML = '<p style="text-align: center; color: var(--text-light);">Inventory is empty</p>';
        } else {
            this.player.inventory.forEach((item, index) => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.innerHTML = `
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                `;
                inventoryItems.appendChild(itemCard);
            });
        }
        
        this.showPanel('inventoryPanel');
    }
    
    showDeck() {
        alert('Deck management coming soon!');
    }
    
    // Game Over
    gameOver(victory = false) {
        this.gameState = 'gameOver';
        
        const title = document.getElementById('gameOverTitle');
        const stats = document.getElementById('gameOverStats');
        const message = document.getElementById('gameOverMessage');
        
        if (victory) {
            title.textContent = 'VICTORY!';
            title.classList.add('victory');
            message.textContent = 'You have conquered all challenges and proven your worth!';
        } else {
            title.textContent = 'FATE SEALED';
            title.classList.remove('victory');
            message.textContent = 'Your journey has come to an end... but fate always offers another chance.';
        }
        
        stats.innerHTML = `
            <p>Level Reached: ${this.player.level}</p>
            <p>Gold Collected: ${this.player.gold}</p>
            <p>Fame Earned: ${this.player.fame}</p>
            <p>Final Health: ${this.player.health}/${this.player.maxHealth}</p>
        `;
        
        this.closePanel('combatPanel');
        this.closePanel('encounterPanel');
        this.showScreen('gameOverScreen');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new HandOfFateGame();
    window.handOfFateGame = game; // Make available for debugging
});
