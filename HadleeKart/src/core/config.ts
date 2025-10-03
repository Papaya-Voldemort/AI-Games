// Game configuration constants

import { KartConfig, ItemConfig, TrackConfig } from '../types';

export const KART_CONFIGS: KartConfig[] = [
  { name: 'Speedster', speed: 100, acceleration: 70, handling: 75, weight: 80 },
  { name: 'Drift King', speed: 85, acceleration: 75, handling: 95, weight: 70 },
  { name: 'Tank', speed: 75, acceleration: 60, handling: 65, weight: 100 },
  { name: 'Balanced', speed: 85, acceleration: 85, handling: 85, weight: 85 },
  { name: 'Rocket', speed: 95, acceleration: 90, handling: 70, weight: 75 },
  { name: 'Nimble', speed: 80, acceleration: 80, handling: 100, weight: 65 },
];

export const ITEM_CONFIGS: ItemConfig[] = [
  { id: 'banana', name: 'Banana Peel', icon: '🍌', rarity: 0.15 },
  { id: 'green_shell', name: 'Green Shell', icon: '🟢', rarity: 0.15 },
  { id: 'red_shell', name: 'Red Shell', icon: '🔴', rarity: 0.12 },
  { id: 'bomb', name: 'Bomb', icon: '💣', rarity: 0.10 },
  { id: 'mushroom', name: 'Mushroom', icon: '🍄', rarity: 0.15 },
  { id: 'triple_mushroom', name: 'Triple Mushroom', icon: '🍄🍄🍄', rarity: 0.08 },
  { id: 'star', name: 'Star Power', icon: '⭐', rarity: 0.05 },
  { id: 'lightning', name: 'Lightning', icon: '⚡', rarity: 0.05 },
  { id: 'fake_box', name: 'Fake Box', icon: '📦', rarity: 0.08 },
  { id: 'oil', name: 'Oil Slick', icon: '🛢️', rarity: 0.10 },
  { id: 'shield', name: 'Shield', icon: '🛡️', rarity: 0.09 },
  { id: 'boo', name: 'Boo Ghost', icon: '👻', rarity: 0.05 },
];

export const TRACK_CONFIGS: TrackConfig[] = [
  { id: 'sunset_circuit', name: 'Sunset Circuit', description: 'A wide desert road with minimal hazards', difficulty: 1, laps: 3 },
  { id: 'moonlight_marina', name: 'Moonlight Marina', description: 'Coastal boardwalk with slowing puddles', difficulty: 2, laps: 3 },
  { id: 'metro_rush', name: 'Metro Rush', description: 'City streets with steam vents', difficulty: 3, laps: 3 },
  { id: 'forest_trail', name: 'Forest Trail', description: 'Dirt path with fallen logs', difficulty: 4, laps: 3 },
  { id: 'snowline_pass', name: 'Snowline Pass', description: 'Icy patches challenge your control', difficulty: 5, laps: 3 },
  { id: 'crimson_canyon', name: 'Crimson Canyon', description: 'Narrow ledges and wind gusts', difficulty: 6, laps: 3 },
  { id: 'skyline_loop', name: 'Skyline Loop', description: 'Cloud platforms with road gaps', difficulty: 7, laps: 3 },
  { id: 'starlight_finale', name: 'Starlight Finale', description: 'Cosmic track with black-hole warps', difficulty: 8, laps: 3 },
];

export const GAME_CONFIG = {
  PHYSICS: {
    GRAVITY: -30,
    TIME_STEP: 1 / 60,
    MAX_SUB_STEPS: 3,
  },
  KART: {
    MAX_SPEED: 50,
    ACCELERATION: 30,
    BRAKE_FORCE: 40,
    TURN_SPEED: 0.03,
    DRIFT_FRICTION: 0.95,
    BOOST_MULTIPLIER: 1.5,
    COLLISION_BOUNCE: 0.5,
  },
  AI: {
    BASE_SPEED_MULTIPLIER: 0.95,
    RUBBERBAND_RANGE: 0.2,
    OBSTACLE_DETECTION_RANGE: 20,
    WAYPOINT_THRESHOLD: 5,
  },
  RACE: {
    TOTAL_RACERS: 12,
    REQUIRED_POSITION: 3,
    COUNTDOWN_TIME: 3,
  },
  CAMERA: {
    DISTANCE: 12,
    HEIGHT: 6,
    LOOK_AHEAD: 3,
    SMOOTHNESS: 0.1,
  },
};
