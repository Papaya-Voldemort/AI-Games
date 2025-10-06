# Street Hustle

A 2D platformer game where you play as a drug lord building your empire while evading increasingly difficult police officers.

## Game Concept

Build your empire by selling to citizens while avoiding or defeating the police. Use your product as power-ups to boost your stats. Face increasingly difficult police bosses as you progress through the levels.

## Features

- **2D Platformer Gameplay**: Jump across platforms and navigate through the city
- **Drug Power-Up System**: Use 4 different types of power-ups to boost your stats:
  - Speed Boost (increases movement speed)
  - Strength Boost (increases damage)
  - Health Boost (regenerates health)
  - Invincibility (temporary immunity)
- **Dynamic NPCs**: 
  - Yellow Citizens: Approach to sell product and earn money
  - Blue Police: Defeat or evade them
- **Boss System**: Face increasingly difficult police bosses (6 levels)
- **Progressive Difficulty**: Police get stronger with each level
- **Stats System**: Health, stamina, money, score tracking
- **Collectibles**: Police drop power-ups when defeated

## Controls

### Movement
- **A/D or Arrow Keys**: Move left/right
- **W/Space or Up Arrow**: Jump
- **Shift**: Sprint (costs stamina)

### Power-Ups
- **1**: Use Speed Boost
- **2**: Use Strength Boost
- **3**: Use Health Boost
- **4**: Use Invincibility

### Game
- **ESC**: Pause/Resume game

## Gameplay Loop

1. Move through the level and approach yellow citizens to sell product
2. Earn money for each citizen served
3. Avoid or defeat blue police officers
4. Collect power-up drops from defeated police
5. Use power-ups strategically to boost your stats
6. Face boss police officers at certain distance milestones
7. Survive as long as possible and beat your high score

## Boss Battles

Every 2000+ meters, you'll face a boss police officer:
- Officer Johnson (Level 1)
- Sergeant Martinez (Level 2)
- Lieutenant Brown (Level 3)
- Captain Rodriguez (Level 4)
- Commander Smith (Level 5)
- Chief Williams (Level 6)

Each boss has increased health, damage, and speed compared to regular police.

## Scoring

- Serving citizens: 100 points + $50
- Defeating police: 200 points × level + $100 × level
- Defeating bosses: 1000 points + $500

## Tech Stack

- HTML5 Canvas
- Vanilla JavaScript
- CSS3

## Files

- `index.html` - Game structure and UI
- `game.js` - Core game logic and classes
- `styles.css` - Styling and visual effects
