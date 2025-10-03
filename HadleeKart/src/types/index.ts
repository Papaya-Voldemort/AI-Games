// Type definitions for HadleeKart

export interface KartConfig {
  name: string;
  speed: number;
  acceleration: number;
  handling: number;
  weight: number;
}

export interface ItemConfig {
  id: string;
  name: string;
  icon: string;
  rarity: number;
}

export interface TrackConfig {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  laps: number;
}

export interface RacerState {
  position: number;
  lap: number;
  checkpointIndex: number;
  raceTime: number;
  currentItem: string | null;
}

export interface StoryBeat {
  id: string;
  speaker: string;
  text: string;
  choices?: Array<{
    text: string;
    nextBeat?: string;
  }>;
}

export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export interface GameState {
  mode: 'menu' | 'racing' | 'dialogue' | 'results';
  currentTrack: number;
  playerProgress: number;
  unlockedTracks: boolean[];
  storyProgress: Record<string, boolean>;
}
