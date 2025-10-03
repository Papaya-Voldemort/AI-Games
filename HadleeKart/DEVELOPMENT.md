# HadleeKart Development Guide

## Architecture Overview

HadleeKart is built using modern web technologies with a focus on performance, type safety, and maintainability.

### Tech Stack
- **Language**: TypeScript 5.9 (strict mode)
- **3D Rendering**: Three.js r180
- **Physics**: Cannon-es (ES module fork of Cannon.js)
- **Build Tool**: Vite 7.1
- **Module System**: ES Modules

### Project Structure

```
HadleeKart/
├── src/
│   ├── core/              # Core game engine
│   │   ├── GameEngine.ts  # Main game loop and state management
│   │   └── config.ts      # Game configuration constants
│   ├── entities/          # Game objects
│   │   └── Kart.ts        # Kart entity with physics and visuals
│   ├── systems/           # Game systems
│   │   ├── RaceScene.ts   # 3D scene and race logic
│   │   ├── AIController.ts # AI opponent behavior
│   │   ├── InputManager.ts # Keyboard/touch input handling
│   │   └── SaveManager.ts  # localStorage persistence
│   ├── tracks/            # Track generation
│   │   └── Track.ts       # Procedural track builder
│   ├── ui/                # User interface
│   │   └── UIManager.ts   # HUD and menu management
│   ├── story/             # Narrative system
│   │   └── StoryManager.ts # Dialogue and story progression
│   ├── audio/             # Audio system (stub)
│   │   └── AudioManager.ts # Sound and music (placeholder)
│   ├── types/             # TypeScript types
│   │   └── index.ts       # Shared type definitions
│   └── main.ts            # Entry point
├── index.html             # Main HTML file
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── vite.config.ts         # Vite build config
```

## Game Systems

### 1. GameEngine (Core)
The main game engine manages:
- Game loop with `requestAnimationFrame`
- State transitions (menu → racing → dialogue → results)
- Scene management
- Save/load integration
- Event handling

**Key Methods**:
- `start()` - Begin game loop
- `stop()` - Halt game loop
- `startRace(trackIndex, isStory)` - Initialize race
- `onRaceComplete(raceInfo)` - Handle race finish

### 2. RaceScene (Racing Logic)
Manages the 3D racing environment:
- Three.js scene setup with lighting
- Cannon.js physics world integration
- Kart creation and updates
- AI opponent management
- Camera system (Mario Kart style)
- Item box spawning
- Position tracking and lap counting

**Physics Configuration**:
- Gravity: -30 m/s²
- Time step: 1/60s (60 Hz)
- Solver iterations: 10
- Broadphase: SAP (Sweep and Prune)

### 3. Kart Entity
Represents a racing kart with:
- Three.js mesh (visual representation)
- Cannon.js body (physics)
- Configuration (speed, handling, acceleration, weight)
- Item handling
- State tracking (position, lap, checkpoint)

**Arcade Physics**:
- Max speed based on kart config
- Acceleration with forward force
- Steering via angular velocity
- Boost system for items
- Auto-upright quaternion correction

### 4. AIController
Controls opponent karts:
- Waypoint-based pathfinding
- Rubberbanding (5% slower base, adjusts based on player distance)
- Steering calculation toward checkpoints
- Strategic item usage
- Obstacle detection (basic)

**Rubberbanding Algorithm**:
```typescript
if (far_behind_player) {
  speed = base_speed + 0.15  // Speed up
} else if (far_ahead_player) {
  speed = base_speed - 0.1   // Slow down slightly
}
```

### 5. Track Generator
Creates procedural race tracks:
- Oval/ellipse-based layout (template)
- Track segments with physics bodies
- Checkpoint placement
- Environment decorations
- Theme-based materials

**Track Themes**:
1. Desert (sandy, warm colors)
2. Ocean (blue, water effects)
3. City (gray asphalt)
4. Forest (dirt brown)
5. Ice (white, high metalness)
6. Canyon (red rock)
7. Sky (cloud white)
8. Space (cosmic purple)

### 6. Story System
Narrative engine featuring:
- Pre-race and post-race dialogue
- Character system (Luke, Hadlee, Harrison)
- Choice-based dialogue (basic)
- Story progression tracking
- Adult-oriented romantic subplot

**Story Structure**:
- 8 races with pre/post dialogue
- Progressive relationship development
- Antagonist arc with emotional manipulation
- Climactic confession in finale
- Performance-based dialogue variations

### 7. Input System
Unified input handling:
- Keyboard (WASD + Arrow keys)
- Touch (basic left/right steering)
- Item usage (Space)
- Drift (Shift - planned)

### 8. UI Manager
Interface management:
- Race HUD (position, laps, time, items)
- Dialogue system with choices
- Menu screens
- Dynamic updates

### 9. Save System
Progress persistence:
- localStorage backend
- Game state serialization
- Track unlocking
- Story progress
- Auto-save after races

## Performance Considerations

### Optimization Strategies
1. **Shadow Maps**: 2048x2048 (balanced)
2. **Pixel Ratio**: Capped at 2x
3. **Physics Substeps**: Max 3 per frame
4. **Renderer**: Hardware acceleration with antialiasing
5. **Tone Mapping**: ACES Filmic for better colors

### Target Performance
- **Frame Rate**: 60 FPS
- **Bundle Size**: ~600KB (minified)
- **Memory**: Moderate (managed object lifecycle)

## Development Workflow

### Running Locally
```bash
npm install      # Install dependencies
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Adding New Tracks
1. Add track config to `TRACK_CONFIGS` in `config.ts`
2. Update `Track.ts` to generate unique geometry
3. Add environment-specific decorations
4. Create story dialogue in `StoryManager.ts`

### Adding New Items
1. Add item config to `ITEM_CONFIGS` in `config.ts`
2. Implement item effect in `Kart.useItem()`
3. Add collision/spawning logic in `RaceScene`
4. Update UI to display item icon

### Adding New Kart Types
1. Add kart config to `KART_CONFIGS` in `config.ts`
2. Optionally customize visual mesh in `Kart.createMesh()`
3. Balance stats for gameplay

## Known Limitations & TODOs

### Current Limitations
- Tracks use template oval geometry (need unique layouts)
- Item projectiles not fully implemented (visual/collision)
- Touch controls are basic (need improvement)
- Audio system is stub-only (no actual sounds)
- No drift boost chains yet
- Limited particle effects

### Planned Enhancements
- [ ] Unique track layouts for each of 8 tracks
- [ ] Full item projectile system with physics
- [ ] Advanced touch controls (virtual joystick)
- [ ] Audio implementation with Web Audio API
- [ ] Drift boost mechanics
- [ ] Particle systems for exhaust, boost, collisions
- [ ] Enhanced AI personalities
- [ ] Multiplayer (local split-screen)
- [ ] Time trial mode
- [ ] Track editor

## Testing

### Manual Testing Checklist
- [x] Game loads without errors
- [x] Menu displays correctly
- [x] Quick Race starts successfully
- [x] Story Mode shows dialogue
- [x] Player kart responds to inputs
- [x] AI karts navigate track
- [x] Lap counting works
- [x] Position tracking updates
- [x] Items appear and can be collected
- [x] Basic item effects work
- [x] Camera follows player smoothly
- [x] HUD updates correctly
- [x] Save/load persists data

### Automated Testing
Currently minimal. Future improvements:
- Unit tests for game logic
- Integration tests for systems
- E2E tests with Playwright
- Performance benchmarks

## Browser Compatibility

**Supported Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Requirements**:
- WebGL 1.0
- ES2020 JavaScript
- localStorage API

## Code Style

### TypeScript Guidelines
- Strict mode enabled
- Explicit types preferred
- No `any` types
- Use interfaces for public APIs
- Classes for entities and systems
- Functions for utilities

### Naming Conventions
- Classes: PascalCase
- Interfaces: PascalCase
- Functions/Methods: camelCase
- Constants: UPPER_SNAKE_CASE
- Private fields: camelCase with `private` keyword

## Contributing

When adding features:
1. Maintain type safety (no `any`)
2. Follow existing architecture patterns
3. Update documentation
4. Test thoroughly before committing
5. Consider performance impact

## License

MIT - See repository root
