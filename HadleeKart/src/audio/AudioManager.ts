// Audio Manager - Stub system for game sounds

export class AudioManager {
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private voiceVolume: number = 0.8;
  private isMuted: boolean = false;

  // Placeholder audio contexts
  private bgMusic: HTMLAudioElement | null = null;
  private sfxPool: Map<string, HTMLAudioElement[]> = new Map();

  constructor() {
    console.log('🔊 Audio Manager initialized (stub mode)');
  }

  public playMusic(trackName: string): void {
    console.log(`[Audio] Playing music: ${trackName}`);
    // TODO: Load and play background music
  }

  public stopMusic(): void {
    console.log('[Audio] Stopping music');
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  public playSFX(soundName: string): void {
    console.log(`[Audio] Playing SFX: ${soundName}`);
    // TODO: Play sound effect from pool
  }

  public playVoiceLine(character: string, line: string): void {
    console.log(`[Audio] Voice line - ${character}: "${line}"`);
    // TODO: Play voice audio file
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.isMuted ? 0 : this.musicVolume;
    }
  }

  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  public setVoiceVolume(volume: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.bgMusic) {
      this.bgMusic.volume = this.isMuted ? 0 : this.musicVolume;
    }
  }

  public dispose(): void {
    this.stopMusic();
    this.sfxPool.clear();
  }
}

// Sound effect names for reference
export const SFX = {
  ENGINE: 'engine',
  BOOST: 'boost',
  DRIFT: 'drift',
  ITEM_PICKUP: 'item_pickup',
  ITEM_USE: 'item_use',
  COLLISION: 'collision',
  COUNTDOWN: 'countdown',
  RACE_START: 'race_start',
  CHECKPOINT: 'checkpoint',
  LAP_COMPLETE: 'lap_complete',
  RACE_FINISH: 'race_finish',
  MENU_SELECT: 'menu_select',
  MENU_BACK: 'menu_back',
};

// Music track names
export const MUSIC = {
  MENU: 'menu_theme',
  RACE_1: 'race_theme_1',
  RACE_2: 'race_theme_2',
  RACE_3: 'race_theme_3',
  VICTORY: 'victory_theme',
  DEFEAT: 'defeat_theme',
  STORY: 'story_theme',
};
