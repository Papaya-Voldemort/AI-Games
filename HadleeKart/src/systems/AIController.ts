// AI Controller for opponent karts

import * as THREE from 'three';
import { Kart } from '../entities/Kart';
import { Checkpoint } from '../tracks/Track';
import { GAME_CONFIG } from '../core/config';

export class AIController {
  private kart: Kart;
  private checkpoints: Checkpoint[];
  private targetCheckpoint: number = 0;

  constructor(kart: Kart, checkpoints: Checkpoint[]) {
    this.kart = kart;
    this.checkpoints = checkpoints;
  }

  public update(playerKart: Kart): { throttle: number; steer: number; useItem: boolean } {
    // Update target checkpoint
    this.updateTargetCheckpoint();

    // Calculate steering toward checkpoint
    const steer = this.calculateSteering();

    // Calculate throttle with rubberbanding
    const throttle = this.calculateThrottle(playerKart);

    // Decide whether to use item
    const useItem = this.shouldUseItem();

    return { throttle, steer, useItem };
  }

  private updateTargetCheckpoint(): void {
    const currentPos = new THREE.Vector3(
      this.kart.body.position.x,
      this.kart.body.position.y,
      this.kart.body.position.z
    );

    const target = this.checkpoints[this.targetCheckpoint];
    if (target && currentPos.distanceTo(target.position) < GAME_CONFIG.AI.WAYPOINT_THRESHOLD) {
      this.targetCheckpoint = (this.targetCheckpoint + 1) % this.checkpoints.length;
      
      // Track lap progress
      if (this.targetCheckpoint === 0) {
        this.kart.lap++;
      }
    }

    this.kart.checkpointIndex = this.targetCheckpoint;
  }

  private calculateSteering(): number {
    const target = this.checkpoints[this.targetCheckpoint];
    if (!target) return 0;

    // Calculate direction to target
    const kartPos = new THREE.Vector3(
      this.kart.body.position.x,
      this.kart.body.position.y,
      this.kart.body.position.z
    );

    const directionToTarget = new THREE.Vector3()
      .subVectors(target.position, kartPos)
      .normalize();

    // Get kart's forward direction
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.kart.mesh.quaternion);

    // Calculate angle difference
    const angle = Math.atan2(
      directionToTarget.x * forward.z - directionToTarget.z * forward.x,
      directionToTarget.x * forward.x + directionToTarget.z * forward.z
    );

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, angle * 2));
  }

  private calculateThrottle(playerKart: Kart): number {
    // Base AI speed is slightly slower than player
    let throttle = GAME_CONFIG.AI.BASE_SPEED_MULTIPLIER;

    // Rubberbanding: speed up if far behind player, slow down if far ahead
    const distanceFactor = this.getDistanceToPlayer(playerKart);
    
    if (distanceFactor > GAME_CONFIG.AI.RUBBERBAND_RANGE) {
      // Far behind - speed up
      throttle = Math.min(1.0, throttle + 0.15);
    } else if (distanceFactor < -GAME_CONFIG.AI.RUBBERBAND_RANGE) {
      // Far ahead - slow down slightly
      throttle = Math.max(0.8, throttle - 0.1);
    }

    // Avoid obstacles (basic implementation)
    if (this.detectObstacle()) {
      throttle *= 0.6;
    }

    return throttle;
  }

  private getDistanceToPlayer(playerKart: Kart): number {
    // Simple distance comparison based on checkpoint progress
    const aiProgress = this.kart.lap * this.checkpoints.length + this.kart.checkpointIndex;
    const playerProgress = playerKart.lap * this.checkpoints.length + playerKart.checkpointIndex;
    
    return (aiProgress - playerProgress) / this.checkpoints.length;
  }

  private detectObstacle(): boolean {
    // Simple obstacle detection
    // In a full implementation, this would raycast forward
    return false;
  }

  private shouldUseItem(): boolean {
    if (!this.kart.currentItem) return false;

    // Use items strategically
    const random = Math.random();
    
    // Use defensive items immediately
    if (this.kart.currentItem === '🛡️' || this.kart.currentItem === '👻') {
      return random > 0.5;
    }

    // Use boost items when not already boosted
    if ((this.kart.currentItem === '🍄' || this.kart.currentItem === '⭐') && this.kart.boostTime <= 0) {
      return random > 0.3;
    }

    // Use offensive items occasionally
    if (this.kart.currentItem === '🔴' || this.kart.currentItem === '🟢') {
      return random > 0.7;
    }

    return false;
  }
}
