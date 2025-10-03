// Race Scene - main racing gameplay scene

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Kart } from '../entities/Kart';
import { Track } from '../tracks/Track';
import { AIController } from './AIController';
import { InputManager } from './InputManager';
import { GAME_CONFIG, KART_CONFIGS } from '../core/config';

export class RaceScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private world: CANNON.World;
  private track!: Track;
  private playerKart!: Kart;
  private aiKarts: Kart[] = [];
  private aiControllers: AIController[] = [];
  private inputManager: InputManager;
  private raceStarted: boolean = false;
  private countdownTime: number = GAME_CONFIG.RACE.COUNTDOWN_TIME;
  private itemBoxes: THREE.Mesh[] = [];

  constructor(trackIndex: number, inputManager: InputManager) {
    this.inputManager = inputManager;

    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Initialize physics world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, GAME_CONFIG.PHYSICS.GRAVITY, 0),
    });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    (this.world.solver as CANNON.GSSolver).iterations = 10;

    // Create track
    this.track = new Track(trackIndex);
    this.scene.add(this.track.mesh);
    this.track.physicsBodies.forEach(body => this.world.addBody(body));

    // Create lighting
    this.setupLighting();

    // Create karts
    this.createKarts();

    // Create item boxes
    this.createItemBoxes();

    // Start countdown
    setTimeout(() => {
      this.raceStarted = true;
    }, GAME_CONFIG.RACE.COUNTDOWN_TIME * 1000);
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.4);
    this.scene.add(hemisphereLight);
  }

  private createKarts(): void {
    // Create player kart
    const playerConfig = KART_CONFIGS[3]; // Balanced
    this.playerKart = new Kart(playerConfig, true);
    this.playerKart.setPosition(this.track.getStartPosition(0), this.track.getStartRotation());
    this.scene.add(this.playerKart.mesh);
    this.world.addBody(this.playerKart.body);

    // Create AI karts
    for (let i = 1; i < GAME_CONFIG.RACE.TOTAL_RACERS; i++) {
      const configIndex = i % KART_CONFIGS.length;
      const aiKart = new Kart(KART_CONFIGS[configIndex], false);
      aiKart.setPosition(this.track.getStartPosition(i), this.track.getStartRotation());
      aiKart.position = i + 1;
      
      this.scene.add(aiKart.mesh);
      this.world.addBody(aiKart.body);
      this.aiKarts.push(aiKart);

      // Create AI controller
      const aiController = new AIController(aiKart, this.track.checkpoints);
      this.aiControllers.push(aiController);
    }
  }

  private createItemBoxes(): void {
    // Place item boxes around the track
    this.track.checkpoints.forEach((checkpoint, index) => {
      if (index % 3 === 0) {
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshStandardMaterial({
          color: 0xffff00,
          emissive: 0xffaa00,
          emissiveIntensity: 0.5,
        });
        const box = new THREE.Mesh(geometry, material);
        box.position.copy(checkpoint.position);
        box.position.y = 1.5;
        box.castShadow = true;
        this.itemBoxes.push(box);
        this.scene.add(box);
      }
    });
  }

  public update(deltaTime: number): void {
    // Update countdown
    if (!this.raceStarted) {
      this.countdownTime -= deltaTime;
      return;
    }

    // Update physics world
    this.world.step(GAME_CONFIG.PHYSICS.TIME_STEP, deltaTime, GAME_CONFIG.PHYSICS.MAX_SUB_STEPS);

    // Update player kart
    const playerInput = {
      throttle: this.inputManager.getThrottleInput(),
      steer: this.inputManager.getSteerInput(),
      useItem: this.inputManager.useItem,
    };
    this.playerKart.update(deltaTime, playerInput);

    // Update AI karts
    this.aiKarts.forEach((kart, index) => {
      const aiInput = this.aiControllers[index].update(this.playerKart);
      kart.update(deltaTime, aiInput);
    });

    // Update positions
    this.updatePositions();

    // Check item box collisions
    this.checkItemBoxCollisions();

    // Update camera
    this.updateCamera();

    // Rotate item boxes
    this.itemBoxes.forEach(box => {
      box.rotation.y += deltaTime * 2;
    });

    // Update player checkpoint
    this.updatePlayerCheckpoint();

    // Check for race finish
    if (this.playerKart.lap > GAME_CONFIG.RACE.REQUIRED_POSITION) {
      this.playerKart.isFinished = true;
    }
  }

  private updatePositions(): void {
    // Calculate race progress for all karts
    const allKarts = [this.playerKart, ...this.aiKarts];
    
    allKarts.forEach(kart => {
      const progress = kart.lap * 1000 + kart.checkpointIndex;
      (kart as any).raceProgress = progress;
    });

    // Sort by progress (descending)
    allKarts.sort((a, b) => (b as any).raceProgress - (a as any).raceProgress);

    // Assign positions
    allKarts.forEach((kart, index) => {
      kart.position = index + 1;
    });
  }

  private updatePlayerCheckpoint(): void {
    const playerPos = new THREE.Vector3(
      this.playerKart.body.position.x,
      this.playerKart.body.position.y,
      this.playerKart.body.position.z
    );

    const nextCheckpoint = this.track.checkpoints[this.playerKart.checkpointIndex];
    if (nextCheckpoint && playerPos.distanceTo(nextCheckpoint.position) < GAME_CONFIG.AI.WAYPOINT_THRESHOLD) {
      this.playerKart.checkpointIndex++;
      
      if (this.playerKart.checkpointIndex >= this.track.checkpoints.length) {
        this.playerKart.checkpointIndex = 0;
        this.playerKart.lap++;
      }
    }
  }

  private checkItemBoxCollisions(): void {
    const playerPos = new THREE.Vector3(
      this.playerKart.body.position.x,
      this.playerKart.body.position.y,
      this.playerKart.body.position.z
    );

    this.itemBoxes.forEach((box, index) => {
      if (playerPos.distanceTo(box.position) < 3 && !this.playerKart.currentItem) {
        this.playerKart.giveItem();
        // Respawn item box after delay
        box.visible = false;
        setTimeout(() => {
          box.visible = true;
        }, 5000);
      }
    });
  }

  private updateCamera(): void {
    // Mario Kart style following camera
    const kartPos = new THREE.Vector3(
      this.playerKart.body.position.x,
      this.playerKart.body.position.y,
      this.playerKart.body.position.z
    );

    // Get kart's backward direction
    const backward = new THREE.Vector3(0, 0, 1);
    backward.applyQuaternion(this.playerKart.mesh.quaternion);

    // Calculate camera position
    const cameraOffset = backward.multiplyScalar(GAME_CONFIG.CAMERA.DISTANCE);
    cameraOffset.y += GAME_CONFIG.CAMERA.HEIGHT;

    const targetCameraPos = kartPos.clone().add(cameraOffset);

    // Smooth camera movement
    this.camera.position.lerp(targetCameraPos, GAME_CONFIG.CAMERA.SMOOTHNESS);

    // Look at point slightly ahead of kart
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.playerKart.mesh.quaternion);
    const lookAtPoint = kartPos.clone().add(forward.multiplyScalar(GAME_CONFIG.CAMERA.LOOK_AHEAD));
    lookAtPoint.y += 1;

    this.camera.lookAt(lookAtPoint);
  }

  public getRaceInfo(): {
    position: number;
    totalRacers: number;
    currentLap: number;
    totalLaps: number;
    raceTime: number;
    currentItem: string | null;
    isFinished: boolean;
  } {
    return {
      position: this.playerKart.position,
      totalRacers: GAME_CONFIG.RACE.TOTAL_RACERS,
      currentLap: this.playerKart.lap,
      totalLaps: this.track.config.laps,
      raceTime: this.playerKart.raceTime,
      currentItem: this.playerKart.currentItem,
      isFinished: this.playerKart.isFinished,
    };
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.Camera {
    return this.camera;
  }

  public onResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public dispose(): void {
    this.track.dispose();
    this.playerKart.dispose();
    this.aiKarts.forEach(kart => kart.dispose());
    
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}
