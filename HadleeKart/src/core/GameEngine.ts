// Main Game Engine for HadleeKart

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RaceScene } from '../systems/RaceScene';
import { InputManager } from '../systems/InputManager';
import { UIManager } from '../ui/UIManager';
import { StoryManager } from '../story/StoryManager';
import { SaveManager } from '../systems/SaveManager';
import { GameState } from '../types';

export class GameEngine {
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private scene: THREE.Scene | null = null;
  private raceScene: RaceScene | null = null;
  private inputManager: InputManager;
  private uiManager: UIManager;
  private storyManager: StoryManager;
  private saveManager: SaveManager;
  private gameState: GameState;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Initialize clock
    this.clock = new THREE.Clock();

    // Initialize managers
    this.inputManager = new InputManager();
    this.uiManager = new UIManager();
    this.storyManager = new StoryManager();
    this.saveManager = new SaveManager();

    // Load or create game state
    this.gameState = this.saveManager.load() || {
      mode: 'menu',
      currentTrack: 0,
      playerProgress: 0,
      unlockedTracks: [true, false, false, false, false, false, false, false],
      storyProgress: {},
    };

    this.setupEventListeners();
    this.hideLoadingScreen();
  }

  private setupEventListeners(): void {
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Menu buttons
    document.getElementById('start-story-btn')?.addEventListener('click', () => {
      this.startStoryMode();
    });

    document.getElementById('quick-race-btn')?.addEventListener('click', () => {
      this.startQuickRace();
    });

    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showSettings();
    });
  }

  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }

  private onWindowResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.raceScene) {
      this.raceScene.onResize(window.innerWidth, window.innerHeight);
    }
  }

  public startStoryMode(): void {
    this.uiManager.hideMenu();
    this.storyManager.showIntro(() => {
      this.startRace(0, true);
    });
  }

  public startQuickRace(): void {
    this.uiManager.hideMenu();
    this.startRace(0, false);
  }

  public startRace(trackIndex: number, isStory: boolean): void {
    this.gameState.mode = 'racing';
    this.gameState.currentTrack = trackIndex;

    // Create race scene
    this.raceScene = new RaceScene(trackIndex, this.inputManager);
    this.scene = this.raceScene.getScene();

    // Show HUD
    this.uiManager.showRaceHUD();

    // Start game loop
    this.start();
  }

  private showSettings(): void {
    alert('Settings menu not yet implemented');
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const deltaTime = this.clock.getDelta();

    // Update game systems
    if (this.raceScene && this.gameState.mode === 'racing') {
      this.raceScene.update(deltaTime);
      
      // Update UI with race info
      const raceInfo = this.raceScene.getRaceInfo();
      this.uiManager.updateRaceHUD(raceInfo);

      // Render scene
      this.renderer.render(this.scene!, this.raceScene.getCamera());

      // Check for race completion
      if (raceInfo.isFinished) {
        this.onRaceComplete(raceInfo);
      }
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private onRaceComplete(raceInfo: any): void {
    this.stop();
    this.uiManager.hideRaceHUD();

    const playerPosition = raceInfo.position;
    const passed = playerPosition <= 3;

    if (passed) {
      this.gameState.playerProgress = Math.max(
        this.gameState.playerProgress,
        this.gameState.currentTrack + 1
      );
      
      // Unlock next track
      if (this.gameState.currentTrack < 7) {
        this.gameState.unlockedTracks[this.gameState.currentTrack + 1] = true;
      }

      this.saveManager.save(this.gameState);
    }

    // Show results and story dialogue
    this.storyManager.showPostRace(
      this.gameState.currentTrack,
      playerPosition,
      () => {
        if (passed && this.gameState.currentTrack < 7) {
          // Continue to next race
          this.startRace(this.gameState.currentTrack + 1, true);
        } else {
          // Return to menu
          this.returnToMenu();
        }
      }
    );
  }

  private returnToMenu(): void {
    this.gameState.mode = 'menu';
    this.scene = null;
    this.raceScene = null;
    this.uiManager.showMenu();
  }

  public dispose(): void {
    this.stop();
    this.renderer.dispose();
    this.inputManager.dispose();
    if (this.raceScene) {
      this.raceScene.dispose();
    }
  }
}
