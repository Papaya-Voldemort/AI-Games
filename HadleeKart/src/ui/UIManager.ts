// UI Manager for game interface

export class UIManager {
  private menuScreen: HTMLElement | null;
  private raceHUD: HTMLElement | null;
  private positionDisplay: HTMLElement | null;
  private lapDisplay: HTMLElement | null;
  private timeDisplay: HTMLElement | null;
  private itemDisplay: HTMLElement | null;

  constructor() {
    this.menuScreen = document.getElementById('menu-screen');
    this.raceHUD = document.getElementById('race-hud');
    this.positionDisplay = document.getElementById('position-display');
    this.lapDisplay = document.getElementById('lap-display');
    this.timeDisplay = document.getElementById('time-display');
    this.itemDisplay = document.getElementById('item-display');
  }

  public showMenu(): void {
    this.menuScreen?.classList.remove('hidden');
  }

  public hideMenu(): void {
    this.menuScreen?.classList.add('hidden');
  }

  public showRaceHUD(): void {
    this.raceHUD?.classList.remove('hidden');
    this.itemDisplay?.classList.remove('hidden');
  }

  public hideRaceHUD(): void {
    this.raceHUD?.classList.add('hidden');
    this.itemDisplay?.classList.add('hidden');
  }

  public updateRaceHUD(raceInfo: {
    position: number;
    totalRacers: number;
    currentLap: number;
    totalLaps: number;
    raceTime: number;
    currentItem: string | null;
    isFinished: boolean;
  }): void {
    // Update position
    if (this.positionDisplay) {
      const suffix = this.getPositionSuffix(raceInfo.position);
      this.positionDisplay.textContent = `${raceInfo.position}${suffix} / ${raceInfo.totalRacers}`;
    }

    // Update lap
    if (this.lapDisplay) {
      this.lapDisplay.textContent = `Lap ${raceInfo.currentLap} / ${raceInfo.totalLaps}`;
    }

    // Update time
    if (this.timeDisplay) {
      const minutes = Math.floor(raceInfo.raceTime / 60);
      const seconds = Math.floor(raceInfo.raceTime % 60);
      const ms = Math.floor((raceInfo.raceTime % 1) * 1000);
      this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }

    // Update item
    if (this.itemDisplay && raceInfo.currentItem) {
      this.itemDisplay.textContent = raceInfo.currentItem;
    } else if (this.itemDisplay) {
      this.itemDisplay.textContent = '';
    }
  }

  private getPositionSuffix(position: number): string {
    if (position === 1) return 'st';
    if (position === 2) return 'nd';
    if (position === 3) return 'rd';
    return 'th';
  }

  public showDialogue(speaker: string, text: string, choices: Array<{ text: string; callback: () => void }>): void {
    const dialogueScreen = document.getElementById('dialogue-screen');
    const speakerElement = document.getElementById('dialogue-speaker');
    const textElement = document.getElementById('dialogue-text');
    const buttonsContainer = document.getElementById('dialogue-buttons');

    if (!dialogueScreen || !speakerElement || !textElement || !buttonsContainer) return;

    speakerElement.textContent = speaker;
    textElement.textContent = text;

    // Clear previous buttons
    buttonsContainer.innerHTML = '';

    // Add new buttons
    choices.forEach(choice => {
      const button = document.createElement('button');
      button.className = 'dialogue-button';
      button.textContent = choice.text;
      button.addEventListener('click', () => {
        this.hideDialogue();
        choice.callback();
      });
      buttonsContainer.appendChild(button);
    });

    dialogueScreen.classList.remove('hidden');
  }

  public hideDialogue(): void {
    const dialogueScreen = document.getElementById('dialogue-screen');
    dialogueScreen?.classList.add('hidden');
  }
}
