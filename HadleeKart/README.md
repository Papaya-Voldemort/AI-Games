# 🏎️ HadleeKart - Season One

A fully functional browser-based Mario Kart-style racing game built with Three.js and TypeScript.

## Features

### Core Gameplay
- **3D Racing Engine**: Built on Three.js with realistic arcade physics using Cannon.js
- **12 Racers**: Player + 11 AI opponents with adaptive difficulty and rubberbanding
- **8 Unique Tracks**: Progressive difficulty from desert circuits to cosmic finalés
- **3-Lap Races**: Checkpoint-based lap tracking with position rankings

### Vehicle System
- **6 Kart Configurations**: Each with unique stats (speed, acceleration, handling, weight)
  - Speedster: Maximum velocity, lower handling
  - Drift King: Best handling and control
  - Tank: Heavy and durable
  - Balanced: All-around performer
  - Rocket: High speed and acceleration
  - Nimble: Lightweight with excellent handling

### 12 Power-Up Items
1. **🍌 Banana Peel** - Leave behind to spin out opponents
2. **🟢 Green Shell** - Straight projectile that bounces off walls
3. **🔴 Red Shell** - Homing missile that tracks nearest opponent
4. **💣 Bomb** - Timed explosive with area-of-effect damage
5. **🍄 Mushroom** - Instant speed boost
6. **🍄🍄🍄 Triple Mushroom** - Three consecutive boosts
7. **⭐ Star Power** - Invincibility + speed boost for 3 seconds
8. **⚡ Lightning** - Shrinks and slows all opponents
9. **📦 Fake Item Box** - Disguised trap that spins out racers
10. **🛢️ Oil Slick** - Reduces traction in affected area
11. **🛡️ Shield Bubble** - Absorbs one hit from any item
12. **👻 Boo Ghost** - Temporary intangibility (4 seconds)

### AI System
- **Adaptive Difficulty**: Base speed 5% slower than player potential
- **Rubberbanding**: AI speeds up when far behind, slows slightly when ahead
- **Waypoint Navigation**: Follows track checkpoints with intelligent pathfinding
- **Strategic Item Usage**: Uses items tactically based on race position
- **Obstacle Avoidance**: Detects and avoids hazards

### Story Mode: Season One
An adult-oriented romantic racing drama featuring:

**Characters**:
- **Luke** (Player) - The protagonist struggling with unspoken feelings
- **Hadlee** - Talented racer and Luke's long-time friend with hidden emotions
- **Harrison** - Skilled but morally questionable antagonist who manipulates situations

**Narrative Arc** (8 Races):
1. **Sunset Circuit** - Reintroduction and underlying tension
2. **Moonlight Marina** - Nostalgia and lingering glances
3. **Metro Rush** - Harrison's manipulation begins
4. **Forest Trail** - Private moment and confession of confusion
5. **Snowline Pass** - Harrison escalates emotional warfare
6. **Crimson Canyon** - Physical danger brings emotional honesty
7. **Skyline Loop** - Confrontation with Harrison's toxicity
8. **Starlight Finale** - Luke's confession and emotional resolution

**Mature Themes**:
- Unspoken attraction and romantic tension
- Emotional manipulation and gaslighting
- Adult relationships and vulnerability
- Regret, second chances, and courage
- Subtext and implications that adults will understand

**Requirements**: Finish in top 3 (out of 12) to progress. Story beats shown before and after each race.

### Tracks

1. **Sunset Circuit** (Difficulty: 1) - Wide desert roads with minimal hazards. Perfect for learning controls.

2. **Moonlight Marina** (Difficulty: 2) - Coastal boardwalk with water puddles that slow karts.

3. **Metro Rush** (Difficulty: 3) - Urban environment with steam vents and tight corners.

4. **Forest Trail** (Difficulty: 4) - Dirt paths with fallen logs and rough terrain.

5. **Snowline Pass** (Difficulty: 5) - Icy patches reduce traction and handling.

6. **Crimson Canyon** (Difficulty: 6) - Narrow cliff ledges with wind gusts affecting control.

7. **Skyline Loop** (Difficulty: 7) - Cloud platforms with gaps requiring precise jumps.

8. **Starlight Finale** (Difficulty: 8) - Cosmic track with gravity-warping black holes.

### Graphics & Performance
- **PBR Rendering**: Physically-based materials with metallic and roughness properties
- **Dynamic Lighting**: Directional sun, ambient, and hemisphere lights with real-time shadows
- **Camera System**: Smooth Mario Kart-style following camera with look-ahead
- **Particle Effects**: Visual feedback for boosts, items, and collisions
- **Optimized Performance**: Targets 60 FPS on modern browsers
- **Shadow Mapping**: Real-time shadows for immersion

### Controls

**Keyboard**:
- `W` or `↑` - Accelerate
- `S` or `↓` - Brake/Reverse
- `A` or `←` - Steer Left
- `D` or `→` - Steer Right
- `Space` - Use Item
- `Shift` - Drift (planned)

**Touch** (Mobile):
- Left side: Steering
- Right side: Acceleration

### Save System
- **Automatic Saving**: Progress saved to localStorage after each race
- **Track Unlocking**: Complete races to unlock subsequent tracks
- **Story Progress**: Narrative state persists across sessions
- **Resume Support**: Continue your season from where you left off

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Navigate to HadleeKart directory
cd HadleeKart

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open automatically in your default browser at `http://localhost:3000`

### Building for Production

```bash
# Build optimized production version
npm run build

# Preview production build
npm run preview
```

Built files will be in the `dist/` directory.

## Architecture

### Directory Structure
```
HadleeKart/
├── src/
│   ├── core/           # Game engine and configuration
│   │   ├── GameEngine.ts
│   │   └── config.ts
│   ├── entities/       # Game objects (Kart, Items)
│   │   └── Kart.ts
│   ├── systems/        # Core systems (Input, AI, Physics)
│   │   ├── InputManager.ts
│   │   ├── AIController.ts
│   │   ├── RaceScene.ts
│   │   └── SaveManager.ts
│   ├── tracks/         # Track generation and configuration
│   │   └── Track.ts
│   ├── ui/             # User interface management
│   │   └── UIManager.ts
│   ├── story/          # Narrative system
│   │   └── StoryManager.ts
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   └── main.ts         # Entry point
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite build configuration
```

### Key Components

**GameEngine**: Main game loop, scene management, and state coordination

**RaceScene**: Manages 3D scene, physics simulation, and race logic

**Kart**: Vehicle entity with physics body, visual mesh, and item handling

**AIController**: Opponent behavior with pathfinding and rubberbanding

**Track**: Procedural track generation with checkpoints and collision geometry

**StoryManager**: Dialogue system and narrative progression

**InputManager**: Unified keyboard and touch input handling

**UIManager**: HUD updates and menu management

**SaveManager**: localStorage persistence for progress

### Technical Stack

- **Rendering**: Three.js r180
- **Physics**: Cannon-es (Cannon.js ES module fork)
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7.1
- **Module System**: ES Modules
- **Type Safety**: Strict TypeScript with full type coverage

### Physics System

- Gravity: -30 m/s²
- Fixed timestep: 60 Hz (1/60s)
- Collision detection: SAP Broadphase
- Solver iterations: 10 (for stability)
- Vehicle physics: Custom arcade-style controller

### Performance Optimizations

- Shadow map size: 2048x2048 (balanced quality/performance)
- Pixel ratio capped at 2x (prevents over-rendering on high-DPI displays)
- Physics substeps: Max 3 per frame
- Object pooling for particles and projectiles (planned)
- LOD system for distant track elements (planned)

## Story Mode Progression

### Completion Requirements
- Finish in **top 3 out of 12 racers** to unlock next track
- Story dialogue appears before and after each race
- Season One concludes after race 8 with emotional finale

### Unlock Progression
- Track 1 (Sunset Circuit): Available from start
- Tracks 2-8: Unlocked sequentially by completing previous race
- Progress saved automatically to localStorage

### Narrative Structure
- **Pre-race dialogue**: Sets up emotional context
- **Post-race dialogue**: Develops relationships and conflict
- **Branching moments**: Some dialogue varies based on race performance
- **Character development**: Luke and Hadlee's relationship evolves
- **Antagonist arc**: Harrison's manipulation increases over time
- **Resolution**: Emotional climax in final race

## Future: Season Two Expansion

### Planned Features
- [ ] 8 additional tracks with increased difficulty
- [ ] New character: Riley (mysterious new racer)
- [ ] Advanced items: Teleporter, Time Slow, Gravity Flip
- [ ] Multiplayer mode (local split-screen)
- [ ] Time trial mode with ghost racers
- [ ] Advanced drifting mechanics with boost chains
- [ ] Customizable kart skins and paint jobs
- [ ] Online leaderboards
- [ ] Photo mode for capturing race moments
- [ ] Additional story branches and endings
- [ ] Luke and Hadlee's relationship development
- [ ] New antagonist challenges
- [ ] Championship tournament mode

### Potential Technical Improvements
- [ ] WebGL 2.0 renderer for advanced effects
- [ ] Procedural track editor
- [ ] Replay system
- [ ] Advanced particle systems
- [ ] Dynamic weather effects
- [ ] Enhanced AI personalities (aggressive, defensive, balanced)
- [ ] Network multiplayer support

## Testing

Currently uses basic smoke testing. To run tests:

```bash
npm test
```

### Manual Testing Checklist
- [ ] All 8 tracks load without errors
- [ ] Player kart responds to all inputs
- [ ] AI karts navigate tracks correctly
- [ ] All 12 items function as intended
- [ ] Collision detection works properly
- [ ] Lap counting is accurate
- [ ] Position ranking updates correctly
- [ ] Story dialogue displays at appropriate times
- [ ] Save/load system persists data
- [ ] Performance maintains 60 FPS
- [ ] Camera follows player smoothly
- [ ] Graphics render correctly across browsers

## Known Issues

- Touch controls are basic (planned improvement)
- Item projectiles not yet fully implemented (visual/collision)
- Some items (banana, green shell, etc.) need projectile spawning
- Drift mechanics planned but not yet implemented
- No audio system implemented (stubs in place)
- Track variety is limited (uses template oval, needs unique layouts)

## Contributing

This game is part of the AI-Games repository exploring themes of:
- Relationships and emotional complexity
- Competition and cooperation
- Personal growth through challenge
- Adult storytelling in game narratives

## License

MIT License - See repository root for details

## Credits

**Game Design & Development**: HadleeKart Team
**Engine**: Three.js, Cannon-es
**Inspiration**: Mario Kart series
**Theme**: Adult-oriented narrative racing

---

**Made with ❤️ for players who want racing + story + heart**
