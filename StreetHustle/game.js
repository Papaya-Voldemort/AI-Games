// Street Hustle - Drug Lord 2D Platformer Game

class StreetHustleGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'title'; // title, playing, paused, gameOver
        this.currentScreen = 'titleScreen';
        
        // Player stats
        this.player = null;
        this.money = 0;
        this.score = 0;
        this.level = 1;
        this.citizensServed = 0;
        
        // Power-ups inventory
        this.powerups = {
            speed: 3,
            strength: 3,
            health: 3,
            invincibility: 1
        };
        
        // Active power-up effects
        this.activePowerups = [];
        
        // Game objects
        this.platforms = [];
        this.citizens = [];
        this.police = [];
        this.bosses = [];
        this.collectibles = [];
        this.particles = [];
        
        // Boss system
        this.bossLevel = 0;
        this.bossActive = false;
        this.bossNames = [
            'Officer Johnson', 'Sergeant Martinez', 'Lieutenant Brown',
            'Captain Rodriguez', 'Commander Smith', 'Chief Williams'
        ];
        
        // Camera
        this.camera = { x: 0, y: 0 };
        
        // Input
        this.keys = {};
        
        // Physics
        this.gravity = 0.8;
        
        // Level tracking
        this.levelDistance = 0;
        this.nextBossDistance = 2000;
        
        this.setupEventListeners();
        this.showScreen('titleScreen');
    }
    
    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Power-up keys
            if (this.gameState === 'playing') {
                if (e.key === '1') this.usePowerup('speed');
                if (e.key === '2') this.usePowerup('strength');
                if (e.key === '3') this.usePowerup('health');
                if (e.key === '4') this.usePowerup('invincibility');
                if (e.key.toLowerCase() === 'escape') this.togglePause();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Button events
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('showHelp').addEventListener('click', () => this.showScreen('helpScreen'));
        document.getElementById('startFromHelp').addEventListener('click', () => this.startGame());
        document.getElementById('backToTitle').addEventListener('click', () => this.showScreen('titleScreen'));
        
        document.getElementById('resumeGame').addEventListener('click', () => this.togglePause());
        document.getElementById('showHelpFromGame').addEventListener('click', () => {
            this.showScreen('helpScreen');
            this.gameState = 'paused';
        });
        document.getElementById('backToMenuFromGame').addEventListener('click', () => {
            this.showScreen('titleScreen');
            this.gameState = 'title';
        });
        
        document.getElementById('restartGame').addEventListener('click', () => this.startGame());
        document.getElementById('backToMenuFromGameOver').addEventListener('click', () => this.showScreen('titleScreen'));
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }
    
    startGame() {
        this.showScreen('gameScreen');
        this.gameState = 'playing';
        this.initializeGame();
        this.gameLoop();
    }
    
    initializeGame() {
        // Reset game state
        this.money = 0;
        this.score = 0;
        this.level = 1;
        this.citizensServed = 0;
        this.levelDistance = 0;
        this.bossLevel = 0;
        this.bossActive = false;
        this.nextBossDistance = 2000;
        
        // Reset power-ups
        this.powerups = {
            speed: 3,
            strength: 3,
            health: 3,
            invincibility: 1
        };
        this.activePowerups = [];
        
        // Create player
        this.player = new Player(200, 400, this);
        
        // Clear arrays
        this.platforms = [];
        this.citizens = [];
        this.police = [];
        this.bosses = [];
        this.collectibles = [];
        this.particles = [];
        
        // Generate initial world
        this.generatePlatforms();
        this.spawnCitizens();
        this.spawnPolice();
        
        this.updateHUD();
    }
    
    generatePlatforms() {
        // Ground
        this.platforms.push(new Platform(0, 650, 5000, 50, '#2c3e50'));
        
        // Floating platforms
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 4500 + 200;
            const y = Math.random() * 300 + 250;
            const width = Math.random() * 150 + 100;
            this.platforms.push(new Platform(x, y, width, 20, '#34495e'));
        }
    }
    
    spawnCitizens() {
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 4500 + 300;
            const y = 600; // On ground
            this.citizens.push(new Citizen(x, y, this));
        }
    }
    
    spawnPolice() {
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 4500 + 500;
            const y = 600;
            this.police.push(new Police(x, y, this, 1));
        }
    }
    
    spawnBoss() {
        if (this.bossLevel >= this.bossNames.length) return;
        
        this.bossActive = true;
        const bossX = this.player.x + 600;
        const bossY = 550;
        const boss = new Boss(bossX, bossY, this, this.bossLevel);
        this.bosses.push(boss);
        
        // Show warning
        const warning = document.getElementById('bossWarning');
        const bossName = document.getElementById('bossName');
        bossName.textContent = this.bossNames[this.bossLevel];
        warning.classList.remove('hidden');
        
        setTimeout(() => {
            warning.classList.add('hidden');
        }, 3000);
        
        this.bossLevel++;
        this.nextBossDistance = this.levelDistance + 2000 + (this.bossLevel * 500);
    }
    
    usePowerup(type) {
        if (this.powerups[type] <= 0) return;
        
        this.powerups[type]--;
        
        const powerup = {
            type: type,
            startTime: Date.now(),
            duration: 5000
        };
        
        this.activePowerups.push(powerup);
        
        // Apply immediate effects
        switch(type) {
            case 'speed':
                this.player.speedMultiplier = 1.5;
                break;
            case 'strength':
                this.player.damageMultiplier = 2;
                break;
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
                break;
            case 'invincibility':
                this.player.invincible = true;
                powerup.duration = 3000;
                break;
        }
        
        // Schedule removal
        setTimeout(() => {
            this.removePowerup(powerup);
        }, powerup.duration);
        
        this.updateHUD();
        this.createParticles(this.player.x, this.player.y, '#ffd93d', 15);
    }
    
    removePowerup(powerup) {
        const index = this.activePowerups.indexOf(powerup);
        if (index > -1) {
            this.activePowerups.splice(index, 1);
        }
        
        // Remove effects
        switch(powerup.type) {
            case 'speed':
                this.player.speedMultiplier = 1;
                break;
            case 'strength':
                this.player.damageMultiplier = 1;
                break;
            case 'invincibility':
                this.player.invincible = false;
                break;
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseMenu').classList.remove('hidden');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseMenu').classList.add('hidden');
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOverMenu').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalMoney').textContent = '$' + this.money;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('citizensServed').textContent = this.citizensServed;
    }
    
    updateCamera() {
        // Follow player
        this.camera.x = this.player.x - this.canvas.width / 3;
        this.camera.y = Math.max(0, this.player.y - this.canvas.height / 2);
        
        // Clamp camera
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.y = Math.max(0, Math.min(this.camera.y, 100));
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    updateHUD() {
        document.getElementById('moneyValue').textContent = '$' + this.money;
        document.getElementById('levelValue').textContent = this.level;
        document.getElementById('scoreValue').textContent = this.score;
        
        // Health bar
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        
        // Stamina bar
        const staminaPercent = (this.player.stamina / this.player.maxStamina) * 100;
        document.getElementById('staminaFill').style.width = staminaPercent + '%';
        
        // Power-ups
        document.getElementById('speedCount').textContent = this.powerups.speed;
        document.getElementById('strengthCount').textContent = this.powerups.strength;
        document.getElementById('healthCount').textContent = this.powerups.health;
        document.getElementById('invincCount').textContent = this.powerups.invincibility;
        
        // Update power-up slots
        ['speed', 'strength', 'health', 'invinc'].forEach(type => {
            const slot = document.getElementById(type + 'Slot');
            const actualType = type === 'invinc' ? 'invincibility' : type;
            if (this.powerups[actualType] <= 0) {
                slot.classList.add('empty');
            } else {
                slot.classList.remove('empty');
            }
            
            // Check if active
            const isActive = this.activePowerups.some(p => p.type === actualType);
            if (isActive) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update();
        
        // Update camera
        this.updateCamera();
        
        // Track distance for boss spawns
        this.levelDistance = Math.max(this.levelDistance, this.player.x);
        if (this.levelDistance >= this.nextBossDistance && !this.bossActive) {
            this.spawnBoss();
        }
        
        // Update citizens
        this.citizens = this.citizens.filter(c => !c.removed);
        this.citizens.forEach(c => c.update());
        
        // Update police
        this.police = this.police.filter(p => !p.defeated);
        this.police.forEach(p => p.update());
        
        // Update bosses
        this.bosses = this.bosses.filter(b => !b.defeated);
        this.bosses.forEach(b => b.update());
        
        // Check if boss defeated
        if (this.bossActive && this.bosses.length === 0) {
            this.bossActive = false;
            this.level++;
            this.money += 500;
            this.score += 1000;
            this.createParticles(this.player.x, this.player.y, '#ffd93d', 30);
        }
        
        // Update collectibles
        this.collectibles = this.collectibles.filter(c => !c.collected);
        this.collectibles.forEach(c => c.update());
        
        // Update particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());
        
        // Spawn more enemies/citizens periodically
        if (Math.random() < 0.005 && this.citizens.length < 20) {
            const spawnX = this.camera.x + this.canvas.width + 100;
            this.citizens.push(new Citizen(spawnX, 600, this));
        }
        
        if (Math.random() < 0.003 && this.police.length < 15 && !this.bossActive) {
            const spawnX = this.camera.x + this.canvas.width + 100;
            this.police.push(new Police(spawnX, 600, this, Math.min(this.level, 3)));
        }
        
        this.updateHUD();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render platforms
        this.platforms.forEach(p => p.render(this.ctx));
        
        // Render collectibles
        this.collectibles.forEach(c => c.render(this.ctx));
        
        // Render citizens
        this.citizens.forEach(c => c.render(this.ctx));
        
        // Render police
        this.police.forEach(p => p.render(this.ctx));
        
        // Render bosses
        this.bosses.forEach(b => b.render(this.ctx));
        
        // Render player
        this.player.render(this.ctx);
        
        // Render particles
        this.particles.forEach(p => p.render(this.ctx));
        
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        if (this.gameState !== 'title') {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Player Class
class Player {
    constructor(x, y, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.vx = 0;
        this.vy = 0;
        
        this.health = 100;
        this.maxHealth = 100;
        this.stamina = 100;
        this.maxStamina = 100;
        
        this.speed = 5;
        this.jumpPower = 15;
        this.onGround = false;
        
        this.speedMultiplier = 1;
        this.damageMultiplier = 1;
        this.invincible = false;
        
        this.color = '#ffd93d';
    }
    
    update() {
        this.handleInput();
        this.applyPhysics();
        this.checkCollisions();
        this.constrainToWorld();
        
        // Regenerate stamina
        if (this.stamina < this.maxStamina) {
            this.stamina = Math.min(this.maxStamina, this.stamina + 0.5);
        }
        
        // Check death
        if (this.health <= 0) {
            this.game.gameOver();
        }
    }
    
    handleInput() {
        const keys = this.game.keys;
        
        // Horizontal movement
        let moveSpeed = this.speed * this.speedMultiplier;
        
        if (keys['a'] || keys['arrowleft']) {
            this.vx = -moveSpeed;
        } else if (keys['d'] || keys['arrowright']) {
            this.vx = moveSpeed;
        } else {
            this.vx *= 0.8; // Friction
        }
        
        // Sprint
        if (keys['shift'] && this.stamina > 0 && Math.abs(this.vx) > 0) {
            this.vx *= 1.5;
            this.stamina -= 1;
        }
        
        // Jump
        if ((keys['w'] || keys[' '] || keys['arrowup']) && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
        }
    }
    
    applyPhysics() {
        // Gravity
        this.vy += this.game.gravity;
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Terminal velocity
        this.vy = Math.min(this.vy, 20);
    }
    
    checkCollisions() {
        this.onGround = false;
        
        // Platform collisions
        this.game.platforms.forEach(platform => {
            if (this.intersects(platform)) {
                // Vertical collision
                if (this.vy > 0 && this.y + this.height - this.vy <= platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                } else if (this.vy < 0 && this.y - this.vy >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                
                // Horizontal collision
                if (this.vx > 0) {
                    this.x = platform.x - this.width;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width;
                }
            }
        });
        
        // Citizen collisions (selling)
        this.game.citizens.forEach(citizen => {
            if (this.intersects(citizen) && !citizen.served) {
                citizen.serve();
                this.game.money += 50;
                this.game.score += 100;
                this.game.citizensServed++;
                this.game.createParticles(citizen.x, citizen.y, '#00ff00', 10);
            }
        });
        
        // Police collisions
        this.game.police.forEach(police => {
            if (this.intersects(police) && !police.defeated) {
                if (!this.invincible) {
                    this.takeDamage(police.damage);
                    this.game.createParticles(this.x, this.y, '#ff0000', 8);
                } else {
                    police.defeat();
                    this.game.score += 200;
                    this.game.createParticles(police.x, police.y, '#ffd93d', 12);
                }
            }
        });
        
        // Boss collisions
        this.game.bosses.forEach(boss => {
            if (this.intersects(boss) && !boss.defeated) {
                if (!this.invincible) {
                    this.takeDamage(boss.damage);
                    this.game.createParticles(this.x, this.y, '#ff0000', 8);
                }
            }
        });
        
        // Collectible collisions
        this.game.collectibles.forEach(collectible => {
            if (this.intersects(collectible) && !collectible.collected) {
                collectible.collect();
            }
        });
    }
    
    intersects(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    
    constrainToWorld() {
        if (this.y > 800) {
            this.takeDamage(50);
            this.y = 300;
            this.x = Math.max(100, this.x - 200);
        }
    }
    
    render(ctx) {
        // Invincibility effect
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Player body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Player details
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 8, 5, 5); // Eye
        ctx.fillRect(this.x + 17, this.y + 8, 5, 5); // Eye
        
        ctx.globalAlpha = 1;
    }
}

// Platform Class
class Platform {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Platform edge highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x, this.y, this.width, 2);
    }
}

// Citizen Class (NPCs to sell to)
class Citizen {
    constructor(x, y, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 35;
        this.served = false;
        this.removed = false;
        this.color = '#ffeb3b';
        this.serveTimer = 0;
    }
    
    update() {
        if (this.served) {
            this.serveTimer++;
            if (this.serveTimer > 60) {
                this.removed = true;
            }
        }
        
        // Simple AI - walk around
        if (!this.served) {
            this.x += Math.sin(Date.now() / 1000 + this.x) * 0.5;
        }
    }
    
    serve() {
        this.served = true;
        this.color = '#4caf50';
    }
    
    render(ctx) {
        ctx.fillStyle = this.served ? '#4caf50' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Head
        ctx.fillStyle = '#ffcc80';
        ctx.fillRect(this.x + 5, this.y - 10, 15, 15);
        
        // Money icon if not served
        if (!this.served) {
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px Arial';
            ctx.fillText('$', this.x + 10, this.y - 15);
        }
    }
}

// Police Class
class Police {
    constructor(x, y, game, level) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.level = level;
        this.health = 50 * level;
        this.maxHealth = this.health;
        this.damage = 10 * level;
        this.speed = 2 + (level * 0.5);
        this.defeated = false;
        this.color = '#2196f3';
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.attackCooldown = 0;
    }
    
    update() {
        // AI - chase player
        const player = this.game.player;
        const dx = player.x - this.x;
        const distance = Math.abs(dx);
        
        if (distance < 400) {
            if (dx > 0) {
                this.vx = this.speed;
            } else {
                this.vx = -this.speed;
            }
            
            // Jump if needed
            if (this.onGround && Math.random() < 0.02) {
                this.vy = -12;
            }
        } else {
            this.vx *= 0.9;
        }
        
        // Physics
        this.vy += this.game.gravity;
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collisions
        this.onGround = false;
        this.game.platforms.forEach(platform => {
            if (this.intersects(platform)) {
                if (this.vy > 0) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        });
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // Take damage from player if invincible
        if (this.game.player.invincible && this.intersects(this.game.player)) {
            this.defeat();
        }
    }
    
    intersects(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    defeat() {
        this.defeated = true;
        this.game.money += 100 * this.level;
        this.game.score += 200 * this.level;
        
        // Drop collectibles
        if (Math.random() < 0.3) {
            const types = ['speed', 'strength', 'health'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.game.collectibles.push(new Collectible(this.x, this.y, type, this.game));
        }
        
        this.game.createParticles(this.x, this.y, this.color, 15);
    }
    
    render(ctx) {
        // Police body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Badge
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x + 10, this.y + 15, 10, 10);
        
        // Health bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x, this.y - 8, this.width, 4);
        ctx.fillStyle = '#ff0000';
        const healthWidth = (this.health / this.maxHealth) * this.width;
        ctx.fillRect(this.x, this.y - 8, healthWidth, 4);
        
        // Level indicator
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('Lv' + this.level, this.x + 5, this.y - 12);
    }
}

// Boss Class
class Boss {
    constructor(x, y, game, level) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
        this.level = level;
        this.health = 200 + (level * 100);
        this.maxHealth = this.health;
        this.damage = 15 + (level * 5);
        this.speed = 3 + (level * 0.3);
        this.defeated = false;
        this.color = '#f44336';
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.attackCooldown = 0;
        this.attackPattern = 0;
    }
    
    update() {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // AI - advanced chase with attack patterns
        if (distance < 500) {
            // Movement
            if (Math.abs(dx) > 50) {
                this.vx = dx > 0 ? this.speed : -this.speed;
            } else {
                this.vx *= 0.9;
            }
            
            // Jump attack
            if (this.onGround && distance < 200 && Math.random() < 0.03) {
                this.vy = -15;
                this.vx = dx > 0 ? this.speed * 2 : -this.speed * 2;
            }
        }
        
        // Physics
        this.vy += this.game.gravity;
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collisions
        this.onGround = false;
        this.game.platforms.forEach(platform => {
            if (this.intersects(platform)) {
                if (this.vy > 0) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        });
        
        // Take damage from invincible player
        if (this.game.player.invincible && this.intersects(this.game.player)) {
            this.health -= 5;
            if (this.health <= 0) {
                this.defeat();
            }
        }
    }
    
    intersects(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    defeat() {
        this.defeated = true;
        this.game.createParticles(this.x, this.y, this.color, 30);
        
        // Big rewards
        this.game.money += 500;
        this.game.score += 1000;
        
        // Drop power-ups
        const types = ['speed', 'strength', 'health', 'invincibility'];
        for (let i = 0; i < 3; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            this.game.collectibles.push(
                new Collectible(this.x + Math.random() * 50, this.y - 50, type, this.game)
            );
        }
    }
    
    render(ctx) {
        // Boss body (larger and more menacing)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Crown/hat
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x + 10, this.y - 10, 30, 10);
        
        // Badge
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x + 15, this.y + 25, 20, 20);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('★', this.x + 21, this.y + 40);
        
        // Health bar (larger)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.x - 10, this.y - 20, this.width + 20, 6);
        ctx.fillStyle = '#ff0000';
        const healthWidth = (this.health / this.maxHealth) * (this.width + 20);
        ctx.fillRect(this.x - 10, this.y - 20, healthWidth, 6);
        
        // Name tag
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.game.bossNames[this.level], this.x + this.width / 2, this.y - 25);
        ctx.textAlign = 'left';
    }
}

// Collectible Class (power-up drops)
class Collectible {
    constructor(x, y, type, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // speed, strength, health, invincibility
        this.collected = false;
        this.vy = -5;
        this.vx = (Math.random() - 0.5) * 4;
        
        const colors = {
            speed: '#00ff00',
            strength: '#ff0000',
            health: '#00ffff',
            invincibility: '#ffd700'
        };
        this.color = colors[type] || '#fff';
    }
    
    update() {
        this.vy += this.game.gravity * 0.5;
        this.x += this.vx;
        this.y += this.vy;
        
        // Ground collision
        if (this.y > 630) {
            this.y = 630;
            this.vy = 0;
            this.vx *= 0.9;
        }
    }
    
    collect() {
        this.collected = true;
        this.game.powerups[this.type]++;
        this.game.createParticles(this.x, this.y, this.color, 8);
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Icon
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        const icons = {
            speed: '⚡',
            strength: '💪',
            health: '❤️',
            invincibility: '⭐'
        };
        ctx.fillText(icons[this.type] || '?', this.x + 10, this.y + 14);
        ctx.textAlign = 'left';
    }
}

// Particle Class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.life = 30;
        this.maxLife = 30;
        this.color = color;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new StreetHustleGame();
});
