// Kart Entity - represents a racing kart (player or AI)

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GAME_CONFIG, ITEM_CONFIGS } from '../core/config';
import { KartConfig } from '../types';

export class Kart {
  public mesh: THREE.Group;
  public body: CANNON.Body;
  public config: KartConfig;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public currentSpeed: number = 0;
  public steering: number = 0;
  public isPlayer: boolean;
  public currentItem: string | null = null;
  public isInvincible: boolean = false;
  public isGhost: boolean = false;
  public hasShield: boolean = false;
  public boostTime: number = 0;
  public position: number = 1;
  public lap: number = 1;
  public checkpointIndex: number = 0;
  public raceTime: number = 0;
  public isFinished: boolean = false;

  constructor(config: KartConfig, isPlayer: boolean = false) {
    this.config = config;
    this.isPlayer = isPlayer;

    // Create visual mesh
    this.mesh = this.createMesh();

    // Create physics body
    this.body = this.createPhysicsBody();
  }

  private createMesh(): THREE.Group {
    const group = new THREE.Group();

    // Kart body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 2.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.isPlayer ? 0x4444ff : 0xff4444,
      metalness: 0.6,
      roughness: 0.4,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.5,
      roughness: 0.7,
    });

    const wheelPositions = [
      { x: -0.7, y: 0.3, z: 0.9 },   // Front left
      { x: 0.7, y: 0.3, z: 0.9 },    // Front right
      { x: -0.7, y: 0.3, z: -0.9 },  // Back left
      { x: 0.7, y: 0.3, z: -0.9 },   // Back right
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      group.add(wheel);
    });

    return group;
  }

  private createPhysicsBody(): CANNON.Body {
    const shape = new CANNON.Box(new CANNON.Vec3(0.75, 0.5, 1.25));
    const body = new CANNON.Body({
      mass: this.config.weight,
      position: new CANNON.Vec3(0, 2, 0),
      shape: shape,
      linearDamping: 0.3,
      angularDamping: 0.3,
    });

    return body;
  }

  public update(deltaTime: number, input?: { throttle: number; steer: number; useItem: boolean }): void {
    this.raceTime += deltaTime;

    // Update boost
    if (this.boostTime > 0) {
      this.boostTime -= deltaTime;
    }

    // Handle input (for player or AI)
    if (input) {
      this.handleInput(input);
    }

    // Update physics
    this.updatePhysics(deltaTime);

    // Sync mesh with physics body
    this.mesh.position.copy(this.body.position as any);
    this.mesh.quaternion.copy(this.body.quaternion as any);

    // Update current speed
    this.currentSpeed = Math.sqrt(
      this.body.velocity.x ** 2 + this.body.velocity.z ** 2
    );
  }

  private handleInput(input: { throttle: number; steer: number; useItem: boolean }): void {
    const throttle = input.throttle;
    const steer = input.steer;

    // Acceleration
    const speedMultiplier = this.config.speed / 100;
    const accelMultiplier = this.config.acceleration / 100;
    const maxSpeed = GAME_CONFIG.KART.MAX_SPEED * speedMultiplier;
    const acceleration = GAME_CONFIG.KART.ACCELERATION * accelMultiplier;

    // Apply boost
    const boostMultiplier = this.boostTime > 0 ? GAME_CONFIG.KART.BOOST_MULTIPLIER : 1;

    // Calculate forward direction
    const forward = new CANNON.Vec3(0, 0, -1);
    this.body.quaternion.vmult(forward, forward);

    // Apply throttle
    if (throttle > 0) {
      const force = forward.scale(acceleration * throttle * boostMultiplier);
      this.body.applyForce(force, this.body.position);
    } else if (throttle < 0) {
      // Braking
      const brake = forward.scale(GAME_CONFIG.KART.BRAKE_FORCE * throttle);
      this.body.applyForce(brake, this.body.position);
    }

    // Steering
    const turnSpeed = GAME_CONFIG.KART.TURN_SPEED * (this.config.handling / 100);
    this.steering = steer * turnSpeed;
    
    if (this.currentSpeed > 1) {
      this.body.angularVelocity.y = this.steering * (this.currentSpeed / maxSpeed);
    }

    // Use item
    if (input.useItem && this.currentItem) {
      this.useItem();
    }
  }

  private updatePhysics(deltaTime: number): void {
    // Limit max speed
    const maxSpeed = (this.config.speed / 100) * GAME_CONFIG.KART.MAX_SPEED;
    const currentSpeed = Math.sqrt(
      this.body.velocity.x ** 2 + this.body.velocity.z ** 2
    );

    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      this.body.velocity.x *= scale;
      this.body.velocity.z *= scale;
    }

    // Keep kart upright
    const euler = new CANNON.Vec3();
    this.body.quaternion.toEuler(euler);
    const uprightQuat = new CANNON.Quaternion();
    uprightQuat.setFromEuler(0, euler.y, 0);
    this.body.quaternion.copy(uprightQuat);
  }

  public giveItem(): void {
    // Random item based on position (better items for worse positions)
    const positionFactor = this.position / 12; // Normalized position
    const availableItems = ITEM_CONFIGS.filter(item => {
      // Better items for racers in worse positions
      if (this.position <= 3 && item.rarity < 0.1) return false;
      if (this.position >= 10 && item.rarity < 0.12) return true;
      return Math.random() < item.rarity * (1.5 - positionFactor);
    });

    if (availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      this.currentItem = randomItem.icon;
    }
  }

  public useItem(): void {
    if (!this.currentItem) return;

    // Item effects
    switch (this.currentItem) {
      case '🍄': // Mushroom
      case '🍄🍄🍄': // Triple Mushroom
        this.boostTime = 1.5;
        break;
      case '⭐': // Star
        this.isInvincible = true;
        this.boostTime = 3;
        setTimeout(() => { this.isInvincible = false; }, 3000);
        break;
      case '🛡️': // Shield
        this.hasShield = true;
        break;
      case '👻': // Boo
        this.isGhost = true;
        setTimeout(() => { this.isGhost = false; }, 4000);
        break;
      // Other items spawn projectiles/hazards (handled by RaceScene)
    }

    this.currentItem = null;
  }

  public hit(): void {
    if (this.isInvincible || this.isGhost) return;

    if (this.hasShield) {
      this.hasShield = false;
      return;
    }

    // Spin out effect
    this.body.velocity.scale(0.3);
    this.body.angularVelocity.y = 5;
  }

  public setPosition(position: THREE.Vector3, rotation?: THREE.Quaternion): void {
    this.body.position.copy(position as any);
    if (rotation) {
      this.body.quaternion.copy(rotation as any);
    }
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  }

  public dispose(): void {
    this.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
