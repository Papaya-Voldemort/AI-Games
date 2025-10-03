// Save Manager for localStorage persistence

import { GameState } from '../types';

const SAVE_KEY = 'hadleekart_save';

export class SaveManager {
  public save(gameState: GameState): void {
    try {
      const saveData = JSON.stringify(gameState);
      localStorage.setItem(SAVE_KEY, saveData);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  public load(): GameState | null {
    try {
      const saveData = localStorage.getItem(SAVE_KEY);
      if (!saveData) return null;
      return JSON.parse(saveData) as GameState;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  public clear(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.error('Failed to clear save:', error);
    }
  }
}
