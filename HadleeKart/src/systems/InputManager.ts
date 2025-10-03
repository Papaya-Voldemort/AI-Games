// Input Manager for keyboard and touch controls

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private touches: Map<number, { x: number; y: number }> = new Map();

  public accelerate: boolean = false;
  public brake: boolean = false;
  public left: boolean = false;
  public right: boolean = false;
  public useItem: boolean = false;
  public drift: boolean = false;

  constructor() {
    this.setupKeyboard();
    this.setupTouch();
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true);
      this.updateInputState();
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
      this.updateInputState();
    });
  }

  private setupTouch(): void {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        this.touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }
      this.updateTouchState();
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        this.touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }
      this.updateTouchState();
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.touches.delete(touch.identifier);
      }
      this.updateTouchState();
    });
  }

  private updateInputState(): void {
    // Arrow keys and WASD
    this.accelerate = this.keys.get('ArrowUp') || this.keys.get('KeyW') || false;
    this.brake = this.keys.get('ArrowDown') || this.keys.get('KeyS') || false;
    this.left = this.keys.get('ArrowLeft') || this.keys.get('KeyA') || false;
    this.right = this.keys.get('ArrowRight') || this.keys.get('KeyD') || false;
    
    // Space for items, Shift for drift
    this.useItem = this.keys.get('Space') || false;
    this.drift = this.keys.get('ShiftLeft') || this.keys.get('ShiftRight') || false;
  }

  private updateTouchState(): void {
    // Simple touch controls: left half = steer, right half = accelerate
    // TODO: Implement more sophisticated touch controls
    if (this.touches.size > 0) {
      const touch = Array.from(this.touches.values())[0];
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (touch.x < screenWidth / 2) {
        // Left side - steering
        this.left = touch.y < screenHeight / 2;
        this.right = touch.y >= screenHeight / 2;
      } else {
        // Right side - acceleration
        this.accelerate = true;
      }
    } else {
      // No touches - reset all
      this.accelerate = false;
      this.brake = false;
      this.left = false;
      this.right = false;
    }
  }

  public getSteerInput(): number {
    let steer = 0;
    if (this.left) steer -= 1;
    if (this.right) steer += 1;
    return steer;
  }

  public getThrottleInput(): number {
    if (this.accelerate) return 1;
    if (this.brake) return -1;
    return 0;
  }

  public dispose(): void {
    this.keys.clear();
    this.touches.clear();
  }
}
