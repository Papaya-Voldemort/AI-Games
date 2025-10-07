# Hand of Fate - Card Adventure Game

A deck-building card adventure game where your destiny is determined by the cards you draw. Navigate through encounters, battle enemies, collect treasures, and survive curses in this roguelike card game experience.

## Features

- **Deck-Building Mechanics**: Build and customize your deck as you progress
- **Card-Based Encounters**: Every draw reveals a new challenge or opportunity
- **Dynamic Combat System**: Strategic turn-based combat with multiple actions
- **Resource Management**: Balance health, gold, and fame to survive
- **Progressive Difficulty**: Levels become increasingly challenging
- **Multiple Card Types**: 
  - 🎭 Encounter Cards: Story events with meaningful choices
  - ⚔️ Enemy Cards: Combat challenges
  - 💎 Treasure Cards: Rewards and blessings
  - ⚡ Curse Cards: Dangerous situations
- **Inventory System**: Collect and use items during your journey
- **Fame & Reputation**: Your actions affect your fame, unlocking special abilities
- **Boss Battles**: Face powerful enemies at the end of each level
- **Save/Load System**: Continue your adventure anytime
- **Medieval Fantasy Theme**: Immersive card table aesthetic

## How to Play

Open `index.html` in a modern web browser to start your journey.

## Game Mechanics

### The Dealer's Table

The game presents you with face-down cards. Draw cards to reveal encounters, enemies, treasures, or curses. Each card type offers different challenges and rewards.

### Resources

- **❤️ Health**: Your life force. Reach 0 and your journey ends.
- **💰 Gold**: Currency for purchasing items, blessings, and services.
- **⭐ Fame**: Your reputation. Higher fame unlocks special abilities and better rewards.

### Card Types

1. **Encounter Cards** 🎭
   - Merchant: Buy items and upgrades
   - Traveler: Make moral choices affecting fame
   - Shrine: Offer prayers and tributes for blessings
   - Bandits: Choose between combat, negotiation, or stealth

2. **Enemy Cards** ⚔️
   - Goblin: Weak but numerous
   - Skeleton: Undead warrior
   - Dire Wolf: Swift and dangerous
   - Cunning Thief: Tricky opponent
   - Orc Warrior: Powerful foe (Level 3+)
   - Ancient Dragon: Legendary beast (Level 5+)

3. **Treasure Cards** 💎
   - Treasure Chest: Large gold rewards
   - Gold Pile: Moderate gold gains

4. **Curse Cards** ⚡
   - Trap: Instant damage
   - Ambush: Surprise combat encounter
   - Dark Curse: Temporary stat debuffs

### Combat

When you encounter an enemy, combat begins. Choose your actions wisely:

- **⚔️ Attack**: Deal damage based on your attack stat
- **🛡️ Defend**: Reduce incoming damage on the next enemy turn
- **🧪 Use Item**: Consume healing potions or other consumables
- **✨ Special**: Powerful attack costing 20 Fame (deals 3x damage)

Combat Tips:
- Defending reduces damage by 50%
- Critical hits (15% chance) deal double damage
- Enemies get stronger each level
- Defeating enemies grants gold and fame

### Progression

- Complete all cards in a level to face the boss
- Defeat the boss to advance to the next level
- Each level up increases:
  - Your max health (+10)
  - Your attack power (+2)
  - Enemy difficulty
- Use gold to purchase upgrades and healing items
- Build fame through good deeds and victories

### Encounters & Choices

Many encounters offer multiple choices:
- **Moral Choices**: Affect your fame (help or harm others)
- **Economic Choices**: Spend gold for immediate benefits
- **Risk/Reward**: Gamble for better outcomes
- **Combat or Peace**: Choose your battles wisely

## Strategy Tips

1. **Manage Resources**: Don't spend all your gold at once. Save for critical moments.
2. **Build Fame**: High fame unlocks special attacks and better rewards.
3. **Defend Wisely**: Use defend when enemy attack is high or health is low.
4. **Stock Potions**: Keep healing items for tough boss battles.
5. **Take Risks**: Sometimes high-risk choices offer the best rewards.
6. **Visit Shrines**: Divine blessings provide powerful permanent upgrades.
7. **Learn Enemy Patterns**: Each enemy type has different strengths.

## Controls

- **Mouse**: Click on cards, buttons, and choices
- **Keyboard Shortcuts**:
  - **1-4**: Quick combat actions (Attack, Defend, Item, Special)
  - **I**: Open inventory
  - **S**: Save game
  - **ESC**: Open menu

## Save System

Your progress is automatically saved when you click "Save Game". You can continue your adventure later by clicking "Continue" on the title screen.

## Win Conditions

There is no final level - the game continues indefinitely with increasing difficulty. Your goal is to:
- Survive as long as possible
- Reach the highest level
- Accumulate the most gold and fame
- Build the most powerful character

## Game Over

The game ends when your health reaches 0. Your final stats will be displayed:
- Level reached
- Gold collected
- Fame earned
- Final health

You can start a new journey or return to the menu to continue a saved game.

## Development

Built with vanilla JavaScript, HTML5, and CSS3. No external dependencies required.

### File Structure
```
HandOfFate/
├── index.html       # Main game page
├── game.js         # Core game logic and mechanics
├── styles.css      # Visual styling
└── README.md       # This file
```

### Extending the Game

The game is designed to be easily extensible:

- Add new card types in `initializeDeck()`
- Create new encounters in `getEncounterData()`
- Add new enemy types in `getEnemyData()`
- Implement new items and effects
- Create special abilities and powers
- Design new choice branches

## Credits

Inspired by the deck-building adventure genre, particularly the video game "Hand of Fate".

## License

Part of the AI-Games repository. Feel free to modify and extend!

---

*"The cards never lie, but fate can be changed..."* - The Dealer
