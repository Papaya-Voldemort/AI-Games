// Main entry point for HadleeKart

import { GameEngine } from './core/GameEngine';

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Game canvas not found!');
    return;
  }

  // Initialize game engine
  const game = new GameEngine(canvas);

  // Make game accessible globally for debugging
  (window as any).game = game;

  console.log('🏎️ HadleeKart initialized!');
});
