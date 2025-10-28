/**
 * Idle Breakout+ - Full Game Implementation
 * A comprehensive idle brick-breaking game with autonomous balls,
 * upgrade systems, prestige mechanics, and offline earnings.
 */

// Game Configuration - Data-driven design for easy tuning
const CONFIG = {
    canvas: {
        width: 800,
        height: 600,
        backgroundColor: '#000011'
    },
    
    physics: {
        gravity: 0,
        friction: 1, // Reduced friction for more consistent movement
        bounceReduction: 0.95, // Less speed loss on bounces
        maxBallSpeed: 15 // Higher max speed
    },
    
    balls: {
        basic: {
            name: 'Basic Ball',
            baseCost: 10,
            costMultiplier: 1.5,
            baseDamage: 1,
            baseSpeed: 8, // Increased from 3
            color: '#ffffff',
            description: 'Simple but reliable'
        },
        power: {
            name: 'Power Ball',
            baseCost: 100,
            costMultiplier: 1.6,
            baseDamage: 5,
            baseSpeed: 6, // Increased from 2.5
            color: '#ff4444',
            description: 'Heavy damage, slower movement'
        },
        speed: {
            name: 'Speed Ball',
            baseCost: 250,
            costMultiplier: 1.7,
            baseDamage: 2,
            baseSpeed: 12, // Increased from 6
            color: '#44ff44',
            description: 'Fast but weaker hits'
        },
        splash: {
            name: 'Splash Ball',
            baseCost: 500,
            costMultiplier: 1.8,
            baseDamage: 3,
            baseSpeed: 9, // Increased from 4
            splashRadius: 50,
            color: '#4444ff',
            description: 'Damages nearby bricks'
        },
        plasma: {
            name: 'Plasma Ball',
            baseCost: 1000,
            costMultiplier: 1.9,
            baseDamage: 4,
            baseSpeed: 7, // Increased from 3.5
            penetration: 3,
            color: '#ff44ff',
            description: 'Passes through multiple bricks'
        },
        lightning: {
            name: 'Lightning Ball',
            baseCost: 2000,
            costMultiplier: 2.0,
            baseDamage: 2,
            baseSpeed: 10, // Increased from 5
            chainLightning: true,
            color: '#ffff44',
            description: 'Chains between nearby bricks'
        },
        void: {
            name: 'Void Ball',
            baseCost: 5000,
            costMultiplier: 2.2,
            baseDamage: 8,
            baseSpeed: 5, // Increased from 2
            voidRadius: 30,
            color: '#8844ff',
            description: 'Creates void zones that damage over time'
        },
        phoenix: {
            name: 'Phoenix Ball',
            baseCost: 10000,
            costMultiplier: 2.5,
            baseDamage: 6,
            baseSpeed: 8, // Increased from 4
            rebirth: true,
            fireTrail: true,
            color: '#ff8844',
            description: 'Resurrects and leaves burning trails'
        }
    },
    
    powerups: {
        doubleDamage: {
            name: 'Double Damage',
            cost: 50,
            duration: 10000,
            effect: 2,
            description: '2x damage for 10 seconds'
        },
        speedBoost: {
            name: 'Speed Boost',
            cost: 30,
            duration: 15000,
            effect: 1.5,
            description: '1.5x speed for 15 seconds'
        },
        multiball: {
            name: 'Multiball',
            cost: 100,
            duration: 5000,
            description: 'Spawn extra balls for 5 seconds'
        }
    },
    
    levels: {
        brickHPMultiplier: 1.2,
        rewardMultiplier: 1.1,
        maxBricksPerRow: 15,
        maxRows: 8,
        goldBrickInterval: 20 // Every 20th level gets gold brick
    },
    
    gameplay: {
        clickDamageBase: 1, // Base click damage
        clickDamageUpgradeCost: 100, // Cost to upgrade click damage
        clickDamageUpgradeMultiplier: 1.8 // Cost scaling for click damage upgrades
    }
};

// Utility Functions
const Utils = {
    // Format large numbers with suffixes
    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
        return (num / 1000000000000).toFixed(1) + 'T';
    },
    
    // Calculate upgrade cost with exponential scaling
    calculateCost(baseCost, level, multiplier) {
        return Math.floor(baseCost * Math.pow(multiplier, level));
    },
    
    // Generate random color
    randomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // Distance between two points
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};

// Ball Class - Autonomous physics and behaviors
class Ball {
    constructor(x, y, type = 'basic', level = 1) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.type = type;
        this.level = level;
        this.radius = 8;
        this.trail = [];
        this.lastHit = 0;
        
        const ballConfig = CONFIG.balls[type];
        this.damage = ballConfig.baseDamage * (1 + level * 0.5);
        this.maxSpeed = ballConfig.baseSpeed * (1 + level * 0.1);
        this.color = ballConfig.color;
        
        // Special abilities
        this.splashRadius = ballConfig.splashRadius || 0;
        this.penetration = ballConfig.penetration || 0;
        this.chainLightning = ballConfig.chainLightning || false;
        this.voidRadius = ballConfig.voidRadius || 0;
        this.rebirth = ballConfig.rebirth || false;
        this.fireTrail = ballConfig.fireTrail || false;
        
        // Special state
        this.penetrationCount = 0;
        this.isDead = false;
        this.rebirthCooldown = 0;
        this.voidZones = [];
        this.fireTrailParticles = [];
        
        // Normalize initial velocity with higher base speed
        const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (speed > 0) {
            this.vx = (this.vx / speed) * this.maxSpeed * 0.9; // Increased from 0.8
            this.vy = (this.vy / speed) * this.maxSpeed * 0.9; // Increased from 0.8
        } else {
            // Ensure balls always have some velocity
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.maxSpeed * 0.9;
            this.vy = Math.sin(angle) * this.maxSpeed * 0.9;
        }
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        // Handle death and rebirth for Phoenix balls
        if (this.isDead && this.rebirth) {
            this.rebirthCooldown -= deltaTime;
            if (this.rebirthCooldown <= 0) {
                this.isDead = false;
                this.x = canvasWidth / 2;
                this.y = canvasHeight / 2;
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * this.maxSpeed;
                this.vy = Math.sin(angle) * this.maxSpeed;
            }
            return; // Don't update position while dead
        }
        
        // Normalize deltaTime for consistent physics at different framerates
        const dt = deltaTime / 16.67; // 60 FPS baseline
        
        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Apply very minimal friction to prevent infinite acceleration
        this.vx *= CONFIG.physics.friction;
        this.vy *= CONFIG.physics.friction;
        
        // Check current speed
        const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        
        // Inject velocity if ball is moving too slowly
        if (speed < this.maxSpeed * 0.3) {
            const angle = Math.atan2(this.vy, this.vx) || Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.maxSpeed * 0.6; // Increased injection speed
            this.vy = Math.sin(angle) * this.maxSpeed * 0.6;
        }
        
        // Limit maximum speed
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
        
        // Improved wall bouncing with proper reflection
        let wallBounced = false;
        
        // Left and right walls
        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx) * CONFIG.physics.bounceReduction;
            wallBounced = true;
        } else if (this.x + this.radius >= canvasWidth) {
            this.x = canvasWidth - this.radius;
            this.vx = -Math.abs(this.vx) * CONFIG.physics.bounceReduction;
            wallBounced = true;
        }
        
        // Top and bottom walls
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.vy = Math.abs(this.vy) * CONFIG.physics.bounceReduction;
            wallBounced = true;
        } else if (this.y + this.radius >= canvasHeight) {
            this.y = canvasHeight - this.radius;
            this.vy = -Math.abs(this.vy) * CONFIG.physics.bounceReduction;
            wallBounced = true;
        }
        
        // Ensure minimum speed after wall bounce
        if (wallBounced) {
            const newSpeed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
            if (newSpeed < this.maxSpeed * 0.2) {
                const angle = Math.atan2(this.vy, this.vx);
                this.vx = Math.cos(angle) * this.maxSpeed * 0.3;
                this.vy = Math.sin(angle) * this.maxSpeed * 0.3;
            }
        }
        
        // Update special abilities
        if (this.fireTrail) {
            this.updateFireTrail();
        }
        
        if (this.voidZones.length > 0) {
            this.updateVoidZones(deltaTime);
        }
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 8) {
            this.trail.shift();
        }
        
        // Fade trail
        this.trail.forEach((point, index) => {
            point.alpha = (index + 1) / this.trail.length * 0.5;
        });
    }
    
    updateFireTrail() {
        // Add fire trail particles
        if (Math.random() < 0.3) {
            this.fireTrailParticles.push({
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + (Math.random() - 0.5) * 10,
                life: 500,
                maxLife: 500
            });
        }
        
        // Update existing particles
        this.fireTrailParticles = this.fireTrailParticles.filter(particle => {
            particle.life -= 16.67;
            return particle.life > 0;
        });
    }
    
    updateVoidZones(deltaTime) {
        this.voidZones = this.voidZones.filter(zone => {
            zone.life -= deltaTime;
            return zone.life > 0;
        });
    }
    
    render(ctx) {
        // Don't render if dead (Phoenix ball)
        if (this.isDead) return;
        
        // Draw fire trail particles for Phoenix balls
        if (this.fireTrail && this.fireTrailParticles.length > 0) {
            this.fireTrailParticles.forEach(particle => {
                const alpha = particle.life / particle.maxLife;
                ctx.globalAlpha = alpha * 0.8;
                ctx.fillStyle = '#ff4400';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 3 * alpha, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
        
        // Draw void zones
        if (this.voidZones.length > 0) {
            this.voidZones.forEach(zone => {
                const alpha = zone.life / zone.maxLife;
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = '#440088';
                ctx.beginPath();
                ctx.arc(zone.x, zone.y, this.voidRadius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
        
        // Draw trail with special effects
        this.trail.forEach((point, index) => {
            if (index === 0) return;
            ctx.globalAlpha = point.alpha;
            
            // Special trail colors based on ball type
            let trailColor = this.color;
            if (this.type === 'lightning') {
                trailColor = `hsl(${60 + Math.sin(Date.now() * 0.01) * 30}, 100%, 70%)`;
            } else if (this.type === 'void') {
                trailColor = `hsl(${280 + Math.sin(Date.now() * 0.005) * 20}, 80%, 60%)`;
            }
            
            ctx.fillStyle = trailColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius * point.alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        // Draw ball with special effects
        if (this.type === 'plasma') {
            // Plasma ball pulsing effect
            const pulse = 0.8 + 0.3 * Math.sin(Date.now() * 0.01);
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15 * pulse;
        } else if (this.type === 'lightning') {
            // Lightning ball crackling effect
            ctx.shadowColor = '#ffff44';
            ctx.shadowBlur = 20;
        } else if (this.type === 'void') {
            // Void ball dark aura
            ctx.shadowColor = '#8844ff';
            ctx.shadowBlur = 25;
        } else if (this.type === 'phoenix') {
            // Phoenix ball fire glow
            ctx.shadowColor = '#ff8844';
            ctx.shadowBlur = 15;
        } else {
            // Default glow
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
        }
        
        // Main ball body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Special visual effects
        if (this.type === 'lightning') {
            // Draw electric arcs
            for (let i = 0; i < 3; i++) {
                const angle = (Date.now() * 0.01 + i * Math.PI * 2 / 3) % (Math.PI * 2);
                const x = this.x + Math.cos(angle) * (this.radius + 3);
                const y = this.y + Math.sin(angle) * (this.radius + 3);
                
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
        
        ctx.shadowBlur = 0;
        
        // Draw level indicator for upgraded balls
        if (this.level > 1) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.level.toString(), this.x, this.y + 3);
        }
        
        // Draw penetration counter for plasma balls
        if (this.type === 'plasma' && this.penetration > 0) {
            ctx.fillStyle = '#ff44ff';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`P${this.penetration}`, this.x, this.y - this.radius - 5);
        }
    }
    
    // Check collision with brick and apply damage
    checkBrickCollision(brick) {
        // Find closest point on brick to ball center
        const closestX = Utils.clamp(this.x, brick.x, brick.x + brick.width);
        const closestY = Utils.clamp(this.y, brick.y, brick.y + brick.height);
        
        // Calculate distance from ball center to closest point
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance < this.radius && Date.now() - this.lastHit > 100) {
            this.lastHit = Date.now();
            
            // Handle penetration for plasma balls
            if (this.penetration > 0 && this.penetrationCount < this.penetration) {
                this.penetrationCount++;
                // Don't bounce, just pass through
                return true;
            }
            
            // Create void zone for void balls
            if (this.voidRadius > 0) {
                this.voidZones.push({
                    x: this.x,
                    y: this.y,
                    life: 3000,
                    maxLife: 3000
                });
            }
            
            // Calculate collision normal
            let normalX = dx;
            let normalY = dy;
            
            // Handle edge cases where ball is inside brick
            if (distance === 0) {
                // Default to horizontal collision if ball is exactly at corner
                normalX = this.x < brick.x + brick.width / 2 ? -1 : 1;
                normalY = 0;
            } else {
                // Normalize the collision normal
                normalX /= distance;
                normalY /= distance;
            }
            
            // Reflect velocity based on collision normal (unless penetrating)
            if (this.penetrationCount >= this.penetration) {
                const dotProduct = this.vx * normalX + this.vy * normalY;
                this.vx -= 2 * dotProduct * normalX;
                this.vy -= 2 * dotProduct * normalY;
                
                // Apply bounce reduction to prevent infinite bouncing
                this.vx *= CONFIG.physics.bounceReduction;
                this.vy *= CONFIG.physics.bounceReduction;
                
                // Push ball out of brick to prevent sticking
                const pushDistance = this.radius - distance + 1;
                this.x += normalX * pushDistance;
                this.y += normalY * pushDistance;
                
                // Reset penetration counter after bouncing
                this.penetrationCount = 0;
            }
            
            // Ensure minimum speed to prevent balls from stopping
            const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
            if (speed < this.maxSpeed * 0.2) {
                const angle = Math.atan2(this.vy, this.vx);
                this.vx = Math.cos(angle) * this.maxSpeed * 0.3;
                this.vy = Math.sin(angle) * this.maxSpeed * 0.3;
            }
            
            return true;
        }
        
        return false;
    }
}

// Brick Class - Destructible targets with HP
class Brick {
    constructor(x, y, width, height, hp, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxHP = hp;
        this.hp = hp;
        this.type = type;
        this.color = this.getColorByHP();
        this.destroyed = false;
        this.lastDamageTime = 0;
        this.damageFlash = 0;
    }
    
    getColorByHP() {
        const ratio = this.hp / this.maxHP;
        if (ratio > 0.8) return '#ff4444';      // High HP - Red
        if (ratio > 0.6) return '#ff8844';      // Medium-High HP - Orange
        if (ratio > 0.4) return '#ffcc44';      // Medium HP - Yellow
        if (ratio > 0.2) return '#88ff44';      // Low-Medium HP - Light Green
        return '#44ff44';                       // Low HP - Green
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        this.lastDamageTime = Date.now();
        this.damageFlash = 300; // Flash duration in ms
        this.color = this.getColorByHP();
        
        if (this.hp <= 0) {
            this.destroyed = true;
            
            // Calculate rewards
            let coinReward = this.maxHP;
            let goldReward = 0;
            
            // Gold bricks give gold rewards using the specified formula
            if (this.isGoldBrick) {
                goldReward = Math.floor(this.maxHP / 100) + 1;
                coinReward = this.maxHP * 2; // Gold bricks also give bonus coins
            }
            
            return { coins: coinReward, gold: goldReward };
        }
        
        return { coins: 0, gold: 0 };
    }
    
    update(deltaTime) {
        if (this.damageFlash > 0) {
            this.damageFlash -= deltaTime;
        }
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        // Flash effect when damaged
        if (this.damageFlash > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw HP bar for stronger bricks
        if (this.maxHP > 5) {
            const barWidth = this.width - 4;
            const barHeight = 3;
            const barX = this.x + 2;
            const barY = this.y + this.height - 6;
            
            // Background
            ctx.fillStyle = '#333333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // HP bar
            const hpRatio = this.hp / this.maxHP;
            ctx.fillStyle = hpRatio > 0.5 ? '#44ff44' : hpRatio > 0.2 ? '#ffff44' : '#ff4444';
            ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
        }
    }
}

// PowerUp Class - Temporary boosts
class PowerUp {
    constructor(type, startTime) {
        this.type = type;
        this.startTime = startTime;
        this.config = CONFIG.powerups[type];
        this.active = true;
    }
    
    getRemainingTime() {
        return Math.max(0, this.config.duration - (Date.now() - this.startTime));
    }
    
    isExpired() {
        return this.getRemainingTime() <= 0;
    }
    
    getEffect() {
        return this.active ? this.config.effect : 1;
    }
}

// EconomyManager - Handles currency, costs, and offline earnings
class EconomyManager {
    constructor() {
        this.coins = 100; // Starting coins
        this.totalCoinsEarned = 0;
        this.coinsPerSecond = 0;
        this.lastSaveTime = Date.now();
        this.ballCounts = {
            basic: 1,
            power: 0,
            speed: 0,
            splash: 0,
            plasma: 0,
            lightning: 0,
            void: 0,
            phoenix: 0
        };
        this.ballLevels = {
            basic: 1,
            power: 1,
            speed: 1,
            splash: 1,
            plasma: 1,
            lightning: 1,
            void: 1,
            phoenix: 1
        };
        // Separate speed and damage upgrade levels
        this.ballSpeedLevels = {
            basic: 1,
            power: 1,
            speed: 1,
            splash: 1,
            plasma: 1,
            lightning: 1,
            void: 1,
            phoenix: 1
        };
        this.ballDamageLevels = {
            basic: 1,
            power: 1,
            speed: 1,
            splash: 1,
            plasma: 1,
            lightning: 1,
            void: 1,
            phoenix: 1
        };
        // Click damage system
        this.clickDamageLevel = 1;
        // Gold currency system
        this.gold = 0;
        this.totalGoldEarned = 0;
        this.prestigeLevel = 0;
        this.prestigeMultiplier = 1;
    }
    
    addCoins(amount) {
        const finalAmount = amount * this.prestigeMultiplier;
        this.coins += finalAmount;
        this.totalCoinsEarned += finalAmount;
        this.updateCPS();
    }
    
    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }
    
    updateCPS() {
        // Calculate coins per second based on current ball power
        let totalDPS = 0;
        for (const [type, count] of Object.entries(this.ballCounts)) {
            if (count > 0) {
                const config = CONFIG.balls[type];
                const level = this.ballLevels[type];
                const damage = config.baseDamage * (1 + level * 0.5);
                const speed = config.baseSpeed * (1 + level * 0.1);
                totalDPS += count * damage * speed * 0.1; // Estimated DPS
            }
        }
        this.coinsPerSecond = totalDPS * this.prestigeMultiplier;
    }
    
    calculateOfflineEarnings() {
        const currentTime = Date.now();
        const offlineTime = Math.min(currentTime - this.lastSaveTime, 24 * 60 * 60 * 1000); // Max 24 hours
        const offlineHours = offlineTime / (1000 * 60 * 60);
        const earnings = this.coinsPerSecond * offlineHours * 3600 * 0.5; // 50% efficiency offline
        
        this.lastSaveTime = currentTime;
        return Math.floor(earnings);
    }
    
    getBallCost(type) {
        const config = CONFIG.balls[type];
        const count = this.ballCounts[type];
        return Utils.calculateCost(config.baseCost, count, config.costMultiplier);
    }
    
    getUpgradeCost(type) {
        const config = CONFIG.balls[type];
        const level = this.ballLevels[type];
        return Utils.calculateCost(config.baseCost * 5, level - 1, 2);
    }
    
    getSpeedUpgradeCost(type) {
        const config = CONFIG.balls[type];
        const level = this.ballSpeedLevels[type];
        return Utils.calculateCost(config.baseCost * 3, level - 1, 1.8);
    }
    
    getDamageUpgradeCost(type) {
        const config = CONFIG.balls[type];
        const level = this.ballDamageLevels[type];
        return Utils.calculateCost(config.baseCost * 4, level - 1, 1.9);
    }
    
    getClickDamageUpgradeCost() {
        return Utils.calculateCost(
            CONFIG.gameplay.clickDamageUpgradeCost, 
            this.clickDamageLevel - 1, 
            CONFIG.gameplay.clickDamageUpgradeMultiplier
        );
    }
    
    canAfford(amount) {
        return this.coins >= amount;
    }
    
    buyBall(type) {
        const cost = this.getBallCost(type);
        if (this.spendCoins(cost)) {
            this.ballCounts[type]++;
            this.updateCPS();
            return true;
        }
        return false;
    }
    
    upgradeBall(type) {
        const cost = this.getUpgradeCost(type);
        if (this.spendCoins(cost)) {
            this.ballLevels[type]++;
            this.updateCPS();
            return true;
        }
        return false;
    }
    
    upgradeSpeedBall(type) {
        const cost = this.getSpeedUpgradeCost(type);
        if (this.spendCoins(cost)) {
            this.ballSpeedLevels[type]++;
            this.updateCPS();
            return true;
        }
        return false;
    }
    
    upgradeDamageBall(type) {
        const cost = this.getDamageUpgradeCost(type);
        if (this.spendCoins(cost)) {
            this.ballDamageLevels[type]++;
            this.updateCPS();
            return true;
        }
        return false;
    }
    
    upgradeClickDamage() {
        const cost = this.getClickDamageUpgradeCost();
        if (this.spendCoins(cost)) {
            this.clickDamageLevel++;
            return true;
        }
        return false;
    }
    
    getClickDamage() {
        return CONFIG.gameplay.clickDamageBase * this.clickDamageLevel;
    }
    
    addGold(amount) {
        this.gold += amount;
        this.totalGoldEarned += amount;
    }
    
    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
    
    canAffordGold(amount) {
        return this.gold >= amount;
    }
    
    canPrestige() {
        return this.totalCoinsEarned >= 10000 * Math.pow(10, this.prestigeLevel);
    }
    
    prestige() {
        if (this.canPrestige()) {
            this.prestigeLevel++;
            this.prestigeMultiplier = 1 + this.prestigeLevel * 0.5;
            
            // Reset progress but keep prestige bonuses
            this.coins = 100;
            this.totalCoinsEarned = 0;
            this.ballCounts = { basic: 1, power: 0, speed: 0, splash: 0, plasma: 0, lightning: 0, void: 0, phoenix: 0 };
            this.ballLevels = { basic: 1, power: 1, speed: 1, splash: 1, plasma: 1, lightning: 1, void: 1, phoenix: 1 };
            this.ballSpeedLevels = { basic: 1, power: 1, speed: 1, splash: 1, plasma: 1, lightning: 1, void: 1, phoenix: 1 };
            this.ballDamageLevels = { basic: 1, power: 1, speed: 1, splash: 1, plasma: 1, lightning: 1, void: 1, phoenix: 1 };
            this.clickDamageLevel = 1;
            // Note: Gold and gold upgrades persist through prestige
            
            return true;
        }
        return false;
    }
    
    saveData() {
        const saveData = {
            coins: this.coins,
            totalCoinsEarned: this.totalCoinsEarned,
            ballCounts: this.ballCounts,
            ballLevels: this.ballLevels,
            ballSpeedLevels: this.ballSpeedLevels,
            ballDamageLevels: this.ballDamageLevels,
            clickDamageLevel: this.clickDamageLevel,
            gold: this.gold,
            totalGoldEarned: this.totalGoldEarned,
            prestigeLevel: this.prestigeLevel,
            prestigeMultiplier: this.prestigeMultiplier,
            lastSaveTime: Date.now()
        };
        localStorage.setItem('idleBreakoutSave', JSON.stringify(saveData));
    }
    
    loadData() {
        const saveData = localStorage.getItem('idleBreakoutSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.coins = data.coins || 100;
            this.totalCoinsEarned = data.totalCoinsEarned || 0;
            
            // Ensure all ball types are initialized
            const defaultBallCounts = { basic: 1, power: 0, speed: 0, splash: 0, plasma: 0, lightning: 0, void: 0, phoenix: 0 };
            const defaultBallLevels = { basic: 1, power: 1, speed: 1, splash: 1, plasma: 1, lightning: 1, void: 1, phoenix: 1 };
            
            this.ballCounts = { ...defaultBallCounts, ...data.ballCounts };
            this.ballLevels = { ...defaultBallLevels, ...data.ballLevels };
            this.ballSpeedLevels = { ...defaultBallLevels, ...data.ballSpeedLevels };
            this.ballDamageLevels = { ...defaultBallLevels, ...data.ballDamageLevels };
            
            this.clickDamageLevel = data.clickDamageLevel || 1;
            this.gold = data.gold || 0;
            this.totalGoldEarned = data.totalGoldEarned || 0;
            this.prestigeLevel = data.prestigeLevel || 0;
            this.prestigeMultiplier = data.prestigeMultiplier || 1;
            this.lastSaveTime = data.lastSaveTime || Date.now();
            this.updateCPS();
            
            return this.calculateOfflineEarnings();
        }
        return 0;
    }
}

// GameManager - Controls level generation, progression, and game state
class GameManager {
    constructor() {
        this.currentLevel = 1;
        this.bricks = [];
        this.levelStartTime = Date.now();
        this.levelComplete = false;
        this.bricksDestroyed = 0;
        this.totalBricks = 0;
    }
    
    generateLevel(level) {
        this.bricks = [];
        this.levelComplete = false;
        this.levelStartTime = Date.now();
        this.bricksDestroyed = 0;
        
        // Check if this is a gold brick level (every 20th level)
        if (level > 0 && level % CONFIG.levels.goldBrickInterval === 0) {
            this.generateGoldBrickLevel(level);
            return;
        }
        
        const brickWidth = 45;
        const brickHeight = 20;
        const spacing = 5;
        const startY = 80;
        
        // Calculate grid dimensions
        const cols = Math.min(CONFIG.levels.maxBricksPerRow, 8 + Math.floor(level / 3));
        const rows = Math.min(CONFIG.levels.maxRows, 4 + Math.floor(level / 5));
        
        // Center the grid
        const totalWidth = cols * (brickWidth + spacing) - spacing;
        const startX = (CONFIG.canvas.width - totalWidth) / 2;
        
        // Generate brick grid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip some bricks for interesting patterns
                if (Math.random() < 0.1 && level > 5) continue;
                
                const x = startX + col * (brickWidth + spacing);
                const y = startY + row * (brickHeight + spacing);
                
                // Calculate HP based on level and position
                const baseHP = Math.floor(1 + level * CONFIG.levels.brickHPMultiplier);
                const positionMultiplier = 1 + (row / rows) * 0.5; // Back rows have more HP
                const hp = Math.floor(baseHP * positionMultiplier);
                
                // Special brick types for higher levels
                let type = 'normal';
                if (level > 10 && Math.random() < 0.1) {
                    type = 'boss'; // Boss bricks with extra HP
                }
                
                const brick = new Brick(x, y, brickWidth, brickHeight, hp, type);
                if (type === 'boss') {
                    brick.hp *= 3;
                    brick.maxHP *= 3;
                    brick.color = '#ff44ff'; // Purple for boss bricks
                }
                
                this.bricks.push(brick);
            }
        }
        
        this.totalBricks = this.bricks.length;
    }
    
    generateGoldBrickLevel(level) {
        // Generate one big gold brick in the center
        const brickWidth = 200;
        const brickHeight = 100;
        const x = (CONFIG.canvas.width - brickWidth) / 2;
        const y = 150;
        
        // Gold brick has massive HP
        const goldHP = Math.floor(level * CONFIG.levels.brickHPMultiplier * 50);
        
        const goldBrick = new Brick(x, y, brickWidth, brickHeight, goldHP, 'gold');
        goldBrick.color = '#ffd700'; // Gold color
        goldBrick.isGoldBrick = true;
        
        this.bricks = [goldBrick];
        this.totalBricks = 1;
    }
    
    update(deltaTime, balls, economy) {
        // Update all bricks
        for (const brick of this.bricks) {
            brick.update(deltaTime);
        }
        
        // Check ball-brick collisions
        for (const ball of balls) {
            if (ball.isDead) continue; // Skip dead balls (Phoenix resurrection)
            
            for (const brick of this.bricks) {
                if (brick.destroyed) continue;
                
                if (ball.checkBrickCollision(brick)) {
                    let damage = ball.damage;
                    
                    // Apply splash damage if ball has splash ability
                    if (ball.splashRadius > 0) {
                        this.applySplashDamage(ball, ball.damage * 0.5, economy);
                    }
                    
                    // Apply chain lightning if ball has chain lightning ability
                    if (ball.chainLightning) {
                        this.applyChainLightning(ball, brick, ball.damage * 0.3, economy);
                    }
                    
                    const reward = brick.takeDamage(damage);
                    if (reward.coins > 0 || reward.gold > 0) {
                        economy.addCoins(reward.coins);
                        if (reward.gold > 0) {
                            economy.addGold(reward.gold);
                        }
                        this.bricksDestroyed++;
                        
                        // Create particle effect
                        this.createDestructionParticles(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                }
            }
            
            // Check void zone damage
            if (ball.voidZones.length > 0) {
                this.applyVoidDamage(ball, economy, deltaTime);
            }
            
            // Check fire trail damage
            if (ball.fireTrail && ball.fireTrailParticles.length > 0) {
                this.applyFireTrailDamage(ball, economy);
            }
        }
        
        // Remove destroyed bricks (more efficient with filter)
        this.bricks = this.bricks.filter(brick => !brick.destroyed);
        
        // Check level completion
        if (this.bricks.length === 0 && !this.levelComplete) {
            this.completeLevel(economy);
        }
    }
    
    applyChainLightning(ball, sourceBrick, damage, economy) {
        const chainRange = 80;
        const maxChains = 3;
        let chainsUsed = 0;
        const processedBricks = new Set([sourceBrick]);
        
        const chainToNearby = (fromBrick) => {
            if (chainsUsed >= maxChains) return;
            
            const fromX = fromBrick.x + fromBrick.width / 2;
            const fromY = fromBrick.y + fromBrick.height / 2;
            
            for (const brick of this.bricks) {
                if (chainsUsed >= maxChains) break; // Early exit
                if (brick.destroyed || processedBricks.has(brick)) continue;
                
                const distance = Utils.distance(
                    fromX, fromY,
                    brick.x + brick.width / 2,
                    brick.y + brick.height / 2
                );
                
                if (distance <= chainRange) {
                    processedBricks.add(brick);
                    const reward = brick.takeDamage(damage);
                    if (reward.coins > 0 || reward.gold > 0) {
                        economy.addCoins(reward.coins);
                        if (reward.gold > 0) {
                            economy.addGold(reward.gold);
                        }
                        this.bricksDestroyed++;
                        this.createDestructionParticles(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                    chainsUsed++;
                    
                    // Chain further if brick was destroyed
                    if (reward.coins > 0 || reward.gold > 0) {
                        chainToNearby(brick);
                    }
                }
            }
        };
        
        chainToNearby(sourceBrick);
    }
    
    applyVoidDamage(ball, economy, deltaTime) {
        ball.voidZones.forEach(zone => {
            for (const brick of this.bricks) {
                if (brick.destroyed) continue;
                
                const distance = Utils.distance(
                    zone.x, zone.y,
                    brick.x + brick.width / 2,
                    brick.y + brick.height / 2
                );
                
                if (distance <= ball.voidRadius) {
                    // Damage over time based on deltaTime
                    const dotDamage = ball.damage * 0.1 * (deltaTime / 16.67);
                    const reward = brick.takeDamage(dotDamage);
                    if (reward.coins > 0 || reward.gold > 0) {
                        economy.addCoins(reward.coins);
                        if (reward.gold > 0) {
                            economy.addGold(reward.gold);
                        }
                        this.bricksDestroyed++;
                        this.createDestructionParticles(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                }
            }
        });
    }
    
    applyFireTrailDamage(ball, economy) {
        for (const particle of ball.fireTrailParticles) {
            for (const brick of this.bricks) {
                if (brick.destroyed) continue;
                
                const distance = Utils.distance(
                    particle.x, particle.y,
                    brick.x + brick.width / 2,
                    brick.y + brick.height / 2
                );
                
                if (distance <= 15) { // Fire trail damage radius
                    const burnDamage = ball.damage * 0.05;
                    const reward = brick.takeDamage(burnDamage);
                    if (reward.coins > 0 || reward.gold > 0) {
                        economy.addCoins(reward.coins);
                        if (reward.gold > 0) {
                            economy.addGold(reward.gold);
                        }
                        this.bricksDestroyed++;
                        this.createDestructionParticles(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                }
            });
        });
    }
    
    applySplashDamage(ball, damage, economy) {
        const ballX = ball.x;
        const ballY = ball.y;
        const splashRadius = ball.splashRadius;
        
        for (const brick of this.bricks) {
            if (brick.destroyed) continue;
            
            const distance = Utils.distance(
                ballX, ballY,
                brick.x + brick.width / 2,
                brick.y + brick.height / 2
            );
            
            if (distance <= splashRadius) {
                const reward = brick.takeDamage(damage);
                if (reward.coins > 0 || reward.gold > 0) {
                    economy.addCoins(reward.coins);
                    if (reward.gold > 0) {
                        economy.addGold(reward.gold);
                    }
                    this.bricksDestroyed++;
                }
            }
        }
    }
    
    createDestructionParticles(x, y) {
        // Simple particle effect for brick destruction
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = Utils.randomColor();
            particle.style.width = '4px';
            particle.style.height = '4px';
            document.body.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }
    }
    
    completeLevel(economy) {
        this.levelComplete = true;
        this.currentLevel++;
        
        // Bonus for completing level quickly
        const timeBonus = Math.max(0, 30000 - (Date.now() - this.levelStartTime)) / 1000;
        const bonus = Math.floor(this.currentLevel * 10 + timeBonus);
        economy.addCoins(bonus);
        
        // Generate next level after delay
        setTimeout(() => {
            this.generateLevel(this.currentLevel);
        }, 2000);
    }
    
    render(ctx) {
        // Render all bricks
        this.bricks.forEach(brick => brick.render(ctx));
        
        // Draw level progress
        if (this.totalBricks > 0) {
            const progress = (this.totalBricks - this.bricks.length) / this.totalBricks;
            const barWidth = 200;
            const barHeight = 8;
            const x = (CONFIG.canvas.width - barWidth) / 2;
            const y = CONFIG.canvas.height - 30;
            
            // Progress bar background
            ctx.fillStyle = '#333333';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Progress bar fill
            ctx.fillStyle = '#00ffaa';
            ctx.fillRect(x, y, barWidth * progress, barHeight);
            
            // Progress text
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `Level ${this.currentLevel} - ${this.bricks.length}/${this.totalBricks} bricks`,
                CONFIG.canvas.width / 2,
                y - 5
            );
        }
    }
}

// UIManager - Handles all user interface elements
class UIManager {
    constructor(game) {
        this.game = game;
        this.activePanel = 'upgrade';
        this.powerups = [];
        this.setupEventListeners();
        this.updateInterval = null;
    }
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('startGame').addEventListener('click', () => this.game.startGame());
        document.getElementById('showHelp').addEventListener('click', () => this.showHelp());
        document.getElementById('helpBack').addEventListener('click', () => this.hideHelp());
        
        // Panel tabs
        document.getElementById('upgradeTab').addEventListener('click', () => this.showPanel('upgrade'));
        document.getElementById('prestigeTab').addEventListener('click', () => this.showPanel('prestige'));
        document.getElementById('settingsTab').addEventListener('click', () => this.showPanel('settings'));
        document.getElementById('pauseButton').addEventListener('click', () => this.game.togglePause());
        
        // Top navigation quick shop
        document.getElementById('quickShop').addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const ballType = navItem.dataset.type;
                this.handleQuickBuy(ballType);
            }
        });
        
        // Expanded shop modal
        document.getElementById('expandShopBtn').addEventListener('click', () => this.showExpandedShop());
        document.getElementById('closeModal').addEventListener('click', () => this.hideExpandedShop());
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Settings - both main and modal
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.game.settings.soundEnabled = e.target.checked;
            document.getElementById('modalSoundToggle').checked = e.target.checked;
        });
        document.getElementById('particlesToggle').addEventListener('change', (e) => {
            this.game.settings.particlesEnabled = e.target.checked;
            document.getElementById('modalParticlesToggle').checked = e.target.checked;
        });
        document.getElementById('autosaveToggle').addEventListener('change', (e) => {
            this.game.settings.autosaveEnabled = e.target.checked;
            document.getElementById('modalAutosaveToggle').checked = e.target.checked;
        });
        
        // Modal settings sync
        document.getElementById('modalSoundToggle').addEventListener('change', (e) => {
            this.game.settings.soundEnabled = e.target.checked;
            document.getElementById('soundToggle').checked = e.target.checked;
        });
        document.getElementById('modalParticlesToggle').addEventListener('change', (e) => {
            this.game.settings.particlesEnabled = e.target.checked;
            document.getElementById('particlesToggle').checked = e.target.checked;
        });
        document.getElementById('modalAutosaveToggle').addEventListener('change', (e) => {
            this.game.settings.autosaveEnabled = e.target.checked;
            document.getElementById('autosaveToggle').checked = e.target.checked;
        });
        
        // Prestige button
        document.getElementById('prestigeButton').addEventListener('click', () => {
            if (this.game.economy.canPrestige()) {
                if (confirm('Are you sure you want to prestige? This will reset your progress but give permanent bonuses.')) {
                    this.game.prestige();
                }
            }
        });
        
        // Offline earnings
        document.getElementById('collectOffline').addEventListener('click', () => {
            document.getElementById('offlineEarnings').classList.add('hidden');
        });
        
        // Close modal when clicking outside
        document.getElementById('expandedShopModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('expandedShopModal')) {
                this.hideExpandedShop();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.game.togglePause();
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (!document.getElementById('expandedShopModal').classList.contains('hidden')) {
                        this.hideExpandedShop();
                    } else {
                        this.toggleHelp();
                    }
                    break;
            }
        });
    }
    
    showHelp() {
        document.getElementById('titleScreen').classList.remove('active');
        document.getElementById('helpScreen').classList.add('active');
    }
    
    hideHelp() {
        document.getElementById('helpScreen').classList.remove('active');
        document.getElementById('titleScreen').classList.add('active');
    }
    
    toggleHelp() {
        if (document.getElementById('helpScreen').classList.contains('active')) {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }
    
    showPanel(panelName) {
        // Hide all panels
        document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
        document.querySelectorAll('.menu-tab').forEach(tab => tab.classList.remove('active'));
        
        // Show selected panel
        const panel = document.getElementById(panelName + 'Panel');
        const tab = document.getElementById(panelName + 'Tab');
        
        if (panel) {
            panel.classList.remove('hidden');
        } else {
            console.error(`Panel not found: ${panelName}Panel`);
        }
        
        if (tab) {
            tab.classList.add('active');
        } else {
            console.error(`Tab not found: ${panelName}Tab`);
        }
        
        this.activePanel = panelName;
        this.updatePanel(panelName);
    }
    
    updatePanel(panelName) {
        switch(panelName) {
            case 'upgrade':
                this.updateUpgradesPanel();
                break;
            case 'prestige':
                this.updatePrestigePanel();
                break;
        }
    }
    
    updateUpgradesPanel() {
        const ballUpgrades = document.getElementById('ballUpgrades');
        const powerupShop = document.getElementById('powerupShop');
        
        // Clear existing content
        ballUpgrades.innerHTML = '';
        powerupShop.innerHTML = '';
        
        // Update top navigation
        this.updateTopNavigation();
        
        // Generate compact ball upgrades for the main panel
        Object.entries(CONFIG.balls).forEach(([type, config]) => {
            const count = this.game.economy.ballCounts[type];
            const level = this.game.economy.ballLevels[type];
            const buyCost = this.game.economy.getBallCost(type);
            const upgradeCost = this.game.economy.getUpgradeCost(type);
            
            // Only show owned balls in compact view
            if (count > 0) {
                // Upgrade ball button
                const upgradeItem = document.createElement('div');
                upgradeItem.className = 'upgrade-item-compact';
                if (!this.game.economy.canAfford(upgradeCost)) {
                    upgradeItem.classList.add('disabled');
                }
                
                upgradeItem.innerHTML = `
                    <div class="upgrade-info">
                        <div class="upgrade-name-compact">Upgrade ${config.name}</div>
                        <div class="upgrade-level-compact">Level: ${level} | Owned: ${count}</div>
                    </div>
                    <div class="upgrade-cost-compact">💰 ${Utils.formatNumber(upgradeCost)}</div>
                `;
                
                upgradeItem.addEventListener('click', () => {
                    if (this.game.economy.upgradeBall(type)) {
                        this.game.upgradeBalls(type);
                        this.playSound('upgradeSound');
                        this.updateUpgradesPanel();
                    }
                });
                
                ballUpgrades.appendChild(upgradeItem);
            }
        });
        
        // Generate compact power-ups
        Object.entries(CONFIG.powerups).forEach(([type, config]) => {
            const powerupItem = document.createElement('div');
            powerupItem.className = 'upgrade-item-compact';
            if (!this.game.economy.canAfford(config.cost)) {
                powerupItem.classList.add('disabled');
            }
            
            powerupItem.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name-compact">${config.name}</div>
                    <div class="upgrade-level-compact">${config.description}</div>
                </div>
                <div class="upgrade-cost-compact">💰 ${Utils.formatNumber(config.cost)}</div>
            `;
            
            powerupItem.addEventListener('click', () => {
                if (this.game.economy.spendCoins(config.cost)) {
                    this.game.activatePowerup(type);
                    this.playSound('powerupSound');
                    this.updateUpgradesPanel();
                }
            });
            
            powerupShop.appendChild(powerupItem);
        });
    }
    
    updateTopNavigation() {
        const quickShop = document.getElementById('quickShop');
        quickShop.querySelectorAll('.nav-item').forEach(item => {
            const type = item.dataset.type;
            const config = CONFIG.balls[type];
            const cost = this.game.economy.getBallCost(type);
            const canAfford = this.game.economy.canAfford(cost);
            
            item.querySelector('.nav-price').textContent = `💰 ${Utils.formatNumber(cost)}`;
            item.dataset.tooltip = `${config.name} - ${config.description}`;
            
            if (canAfford) {
                item.classList.remove('disabled');
            } else {
                item.classList.add('disabled');
            }
        });
    }
    
    handleQuickBuy(ballType) {
        const cost = this.game.economy.getBallCost(ballType);
        if (this.game.economy.spendCoins(cost)) {
            this.game.economy.ballCounts[ballType]++;
            const level = this.game.economy.ballLevels[ballType];
            this.game.addBall(ballType, level);
            this.playSound('upgradeSound');
            this.updateUpgradesPanel();
        }
    }
    
    showExpandedShop() {
        const modal = document.getElementById('expandedShopModal');
        modal.classList.remove('hidden');
        this.updateExpandedShop();
    }
    
    hideExpandedShop() {
        const modal = document.getElementById('expandedShopModal');
        modal.classList.add('hidden');
    }
    
    updateExpandedShop() {
        const ballShop = document.getElementById('modalBallShop');
        const powerupShop = document.getElementById('modalPowerupShop');
        
        // Clear existing content
        ballShop.innerHTML = '';
        powerupShop.innerHTML = '';
        
        // Generate detailed ball shop
        Object.entries(CONFIG.balls).forEach(([type, config]) => {
            const count = this.game.economy.ballCounts[type];
            const level = this.game.economy.ballLevels[type];
            const buyCost = this.game.economy.getBallCost(type);
            const upgradeCost = this.game.economy.getUpgradeCost(type);
            
            const ballSection = document.createElement('div');
            ballSection.className = 'ball-shop-section';
            ballSection.innerHTML = `
                <div class="ball-header">
                    <h4>${config.name}</h4>
                    <div class="ball-stats">Owned: ${count} | Level: ${level}</div>
                </div>
                <div class="ball-description">${config.description}</div>
                <div class="ball-actions">
                    <button class="shop-btn buy-btn ${!this.game.economy.canAfford(buyCost) ? 'disabled' : ''}" 
                            data-type="${type}" data-action="buy">
                        Buy (💰 ${Utils.formatNumber(buyCost)})
                    </button>
                    ${count > 0 ? `
                        <button class="shop-btn upgrade-btn ${!this.game.economy.canAfford(upgradeCost) ? 'disabled' : ''}" 
                                data-type="${type}" data-action="upgrade">
                            Upgrade (💰 ${Utils.formatNumber(upgradeCost)})
                        </button>
                    ` : ''}
                </div>
            `;
            
            ballShop.appendChild(ballSection);
        });
        
        // Generate detailed power-up shop
        Object.entries(CONFIG.powerups).forEach(([type, config]) => {
            const powerupSection = document.createElement('div');
            powerupSection.className = 'powerup-shop-section';
            powerupSection.innerHTML = `
                <div class="powerup-header">
                    <h4>${config.name}</h4>
                </div>
                <div class="powerup-description">${config.description}</div>
                <button class="shop-btn powerup-btn ${!this.game.economy.canAfford(config.cost) ? 'disabled' : ''}" 
                        data-type="${type}" data-action="powerup">
                    Activate (💰 ${Utils.formatNumber(config.cost)})
                </button>
            `;
            
            powerupShop.appendChild(powerupSection);
        });
        
        // Add event listeners for shop buttons
        document.querySelectorAll('.shop-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const action = btn.dataset.action;
                
                if (btn.classList.contains('disabled')) return;
                
                switch(action) {
                    case 'buy':
                        this.handleQuickBuy(type);
                        break;
                    case 'upgrade':
                        if (this.game.economy.upgradeBall(type)) {
                            this.game.upgradeBalls(type);
                            this.playSound('upgradeSound');
                        }
                        break;
                    case 'powerup':
                        if (this.game.economy.spendCoins(CONFIG.powerups[type].cost)) {
                            this.game.activatePowerup(type);
                            this.playSound('powerupSound');
                        }
                        break;
                }
                
                this.updateExpandedShop();
                this.updateUpgradesPanel();
            });
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }
    
    updatePrestigePanel() {
        const canPrestige = this.game.economy.canPrestige();
        const prestigeButton = document.getElementById('prestigeButton');
        const prestigeDescription = document.getElementById('prestigeDescription');
        const prestigeRewards = document.getElementById('prestigeRewards');
        
        if (canPrestige) {
            prestigeButton.classList.remove('disabled');
            prestigeDescription.textContent = 'You have earned enough coins to prestige!';
            prestigeRewards.innerHTML = `
                <p>Prestige Level: ${this.game.economy.prestigeLevel}</p>
                <p>Current Multiplier: ${this.game.economy.prestigeMultiplier.toFixed(1)}x</p>
                <p>Next Multiplier: ${(this.game.economy.prestigeMultiplier + 0.5).toFixed(1)}x</p>
            `;
        } else {
            prestigeButton.classList.add('disabled');
            const required = 10000 * Math.pow(10, this.game.economy.prestigeLevel);
            prestigeDescription.textContent = `Earn ${Utils.formatNumber(required)} total coins to prestige`;
            prestigeRewards.innerHTML = `
                <p>Prestige Level: ${this.game.economy.prestigeLevel}</p>
                <p>Total Earned: ${Utils.formatNumber(this.game.economy.totalCoinsEarned)}</p>
                <p>Progress: ${((this.game.economy.totalCoinsEarned / required) * 100).toFixed(1)}%</p>
            `;
        }
    }
    
    updateHUD() {
        document.getElementById('coinAmount').textContent = Utils.formatNumber(this.game.economy.coins);
        document.getElementById('currentLevel').textContent = this.game.gameManager.currentLevel;
        document.getElementById('ballCount').textContent = this.game.balls.length;
        document.getElementById('dpsAmount').textContent = Utils.formatNumber(this.game.economy.coinsPerSecond);
        
        // Update power-up timers
        const timersContainer = document.getElementById('powerupTimers');
        timersContainer.innerHTML = '';
        
        this.powerups.forEach(powerup => {
            if (!powerup.isExpired()) {
                const timer = document.createElement('div');
                timer.className = 'powerup-timer';
                timer.textContent = `${powerup.config.name}: ${Math.ceil(powerup.getRemainingTime() / 1000)}s`;
                timersContainer.appendChild(timer);
            }
        });
        
        // Remove expired power-ups
        this.powerups = this.powerups.filter(p => !p.isExpired());
    }
    
    showOfflineEarnings(amount) {
        if (amount > 0) {
            document.getElementById('offlineAmount').textContent = `${Utils.formatNumber(amount)} coins`;
            document.getElementById('offlineEarnings').classList.remove('hidden');
        }
    }
    
    addPowerup(powerup) {
        this.powerups.push(powerup);
    }
    
    playSound(soundId) {
        if (this.game.settings.soundEnabled) {
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {}); // Ignore audio play errors
            }
        }
    }
    
    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.updateHUD();
            if (this.activePanel) {
                this.updatePanel(this.activePanel);
            }
        }, 100);
    }
    
    stopUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Main Game Class - Orchestrates all systems
class IdleBreakoutGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'title'; // 'title', 'playing', 'paused'
        
        // Game systems
        this.economy = new EconomyManager();
        this.gameManager = new GameManager();
        this.uiManager = new UIManager(this);
        
        // Game objects
        this.balls = [];
        this.particles = [];
        this.powerups = [];
        
        // Game settings
        this.settings = {
            soundEnabled: true,
            particlesEnabled: true,
            autosaveEnabled: true
        };
        
        // Timing
        this.lastTime = 0;
        this.autosaveInterval = null;
        
        this.init();
    }
    
    init() {
        // Load saved data
        const offlineEarnings = this.economy.loadData();
        
        // Initialize balls based on saved data
        for (const [type, count] of Object.entries(this.economy.ballCounts)) {
            const level = this.economy.ballLevels[type];
            for (let i = 0; i < count; i++) {
                this.addBall(type, level);
            }
        }
        
        // Generate initial level
        this.gameManager.generateLevel(this.gameManager.currentLevel);
        
        // Add click-to-damage event listener
        this.canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
        
        // Show offline earnings if any
        if (offlineEarnings > 0) {
            this.economy.addCoins(offlineEarnings);
            this.uiManager.showOfflineEarnings(offlineEarnings);
        }
        
        // Start autosave
        this.startAutosave();
    }
    
    startGame() {
        document.getElementById('titleScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        
        this.gameState = 'playing';
        this.uiManager.showPanel('upgrade');
        this.uiManager.startUpdateLoop();
        this.gameLoop();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.uiManager.stopUpdateLoop();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.uiManager.startUpdateLoop();
            this.gameLoop();
        }
    }
    
    handleCanvasClick(event) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click hit any brick
        this.gameManager.bricks.forEach(brick => {
            if (!brick.destroyed && 
                x >= brick.x && x <= brick.x + brick.width &&
                y >= brick.y && y <= brick.y + brick.height) {
                
                const clickDamage = this.economy.getClickDamage();
                const reward = brick.takeDamage(clickDamage);
                
                if (reward.coins > 0 || reward.gold > 0) {
                    this.economy.addCoins(reward.coins);
                    if (reward.gold > 0) {
                        this.economy.addGold(reward.gold);
                    }
                    this.gameManager.bricksDestroyed++;
                    this.gameManager.createDestructionParticles(
                        brick.x + brick.width / 2, 
                        brick.y + brick.height / 2
                    );
                }
                
                // Create click effect particle
                this.createClickEffect(x, y, clickDamage);
            }
        });
    }
    
    createClickEffect(x, y, damage) {
        // Create visual effect for click damage
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 2,
            life: 30,
            maxLife: 30,
            text: `-${damage}`,
            color: '#ffff00',
            type: 'text'
        });
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update balls
        this.balls.forEach(ball => {
            ball.update(deltaTime, this.canvas.width, this.canvas.height);
        });
        
        // Apply power-up effects
        this.applyPowerupEffects();
        
        // Update game manager
        this.gameManager.update(deltaTime, this.balls, this.economy);
        
        // Update particles
        this.updateParticles(deltaTime);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.canvas.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render game objects
        this.gameManager.render(this.ctx);
        this.balls.forEach(ball => ball.render(this.ctx));
        this.renderParticles();
        
        // Draw pause overlay
        if (this.gameState === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    addBall(type, level) {
        const x = this.canvas.width / 2 + (Math.random() - 0.5) * 100;
        const y = this.canvas.height / 2 + (Math.random() - 0.5) * 100;
        const speedLevel = this.economy.ballSpeedLevels[type];
        const damageLevel = this.economy.ballDamageLevels[type];
        const ball = new Ball(x, y, type, level, speedLevel, damageLevel);
        this.balls.push(ball);
    }
    
    upgradeBalls(type) {
        this.balls.forEach(ball => {
            if (ball.type === type) {
                ball.level = this.economy.ballLevels[type];
                ball.speedLevel = this.economy.ballSpeedLevels[type];
                ball.damageLevel = this.economy.ballDamageLevels[type];
                const config = CONFIG.balls[type];
                ball.damage = config.baseDamage * (1 + (ball.damageLevel - 1) * 0.5);
                ball.maxSpeed = config.baseSpeed * (1 + (ball.speedLevel - 1) * 0.15);
            }
        });
    }
    
    activatePowerup(type) {
        const powerup = new PowerUp(type, Date.now());
        this.powerups.push(powerup);
        this.uiManager.addPowerup(powerup);
        
        // Special handling for multiball
        if (type === 'multiball') {
            for (let i = 0; i < 3; i++) {
                this.addBall('basic', 1);
            }
            // Remove extra balls after duration
            setTimeout(() => {
                this.balls = this.balls.slice(0, -3);
            }, CONFIG.powerups.multiball.duration);
        }
    }
    
    applyPowerupEffects() {
        let damageMultiplier = 1;
        let speedMultiplier = 1;
        
        this.powerups.forEach(powerup => {
            if (!powerup.isExpired()) {
                switch(powerup.type) {
                    case 'doubleDamage':
                        damageMultiplier *= powerup.getEffect();
                        break;
                    case 'speedBoost':
                        speedMultiplier *= powerup.getEffect();
                        break;
                }
            }
        });
        
        // Remove expired power-ups
        this.powerups = this.powerups.filter(p => !p.isExpired());
        
        // Apply effects to balls
        this.balls.forEach(ball => {
            ball.damage = CONFIG.balls[ball.type].baseDamage * (1 + ball.level * 0.5) * damageMultiplier;
            ball.maxSpeed = CONFIG.balls[ball.type].baseSpeed * (1 + ball.level * 0.1) * speedMultiplier;
        });
    }
    
    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            particle.update(deltaTime);
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    renderParticles() {
        if (this.settings.particlesEnabled) {
            this.particles.forEach(particle => {
                particle.render(this.ctx);
            });
        }
    }
    
    prestige() {
        if (this.economy.prestige()) {
            // Reset balls
            this.balls = [];
            this.addBall('basic', 1);
            
            // Reset level
            this.gameManager.currentLevel = 1;
            this.gameManager.generateLevel(1);
            
            // Save progress
            this.economy.saveData();
            
            alert(`Prestiged to level ${this.economy.prestigeLevel}! Coin multiplier is now ${this.economy.prestigeMultiplier.toFixed(1)}x`);
        }
    }
    
    startAutosave() {
        if (this.settings.autosaveEnabled) {
            this.autosaveInterval = setInterval(() => {
                this.economy.saveData();
            }, 30000); // Autosave every 30 seconds
        }
    }
    
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new IdleBreakoutGame();
    
    // Make game globally accessible for debugging
    window.game = game;
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        game.economy.saveData();
    });
});
