// Track Generator - creates racing tracks

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TrackConfig } from '../types';
import { TRACK_CONFIGS } from '../core/config';

export interface Checkpoint {
  position: THREE.Vector3;
  rotation: number;
}

export class Track {
  public mesh: THREE.Group;
  public physicsBodies: CANNON.Body[] = [];
  public checkpoints: Checkpoint[] = [];
  public startPositions: THREE.Vector3[] = [];
  public config: TrackConfig;

  constructor(trackIndex: number) {
    this.config = TRACK_CONFIGS[trackIndex];
    this.mesh = new THREE.Group();
    
    this.generateTrack(trackIndex);
  }

  private generateTrack(trackIndex: number): void {
    // Create a simple oval track for demonstration
    // In a full implementation, each track would have unique geometry
    
    const trackWidth = 15;
    const segments = 32;
    const radius = 50;

    // Track surface
    const trackCurve = new THREE.EllipseCurve(
      0, 0,           // center x, y
      radius, radius * 0.7,  // x radius, y radius
      0, 2 * Math.PI, // start angle, end angle
      false,          // clockwise
      0               // rotation
    );

    const points = trackCurve.getPoints(segments);
    
    // Create track mesh segments
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      
      const segmentLength = p1.distanceTo(p2);
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      
      // Track geometry
      const geometry = new THREE.BoxGeometry(segmentLength, 0.5, trackWidth);
      const material = this.getTrackMaterial(trackIndex);
      const segment = new THREE.Mesh(geometry, material);
      
      segment.position.set(
        (p1.x + p2.x) / 2,
        0,
        (p1.y + p2.y) / 2
      );
      segment.rotation.y = -angle;
      segment.receiveShadow = true;
      
      this.mesh.add(segment);
      
      // Physics body
      const shape = new CANNON.Box(new CANNON.Vec3(segmentLength / 2, 0.25, trackWidth / 2));
      const body = new CANNON.Body({
        mass: 0,
        shape: shape,
        position: new CANNON.Vec3(segment.position.x, 0, segment.position.z),
      });
      body.quaternion.setFromEuler(0, -angle, 0);
      this.physicsBodies.push(body);
      
      // Create checkpoints every few segments
      if (i % 4 === 0) {
        this.checkpoints.push({
          position: new THREE.Vector3(p1.x, 1, p1.y),
          rotation: angle,
        });
      }
    }

    // Generate start positions (grid formation)
    const startAngle = 0;
    const startRadius = radius;
    for (let i = 0; i < 12; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = Math.cos(startAngle) * startRadius + (col - 0.5) * 5;
      const z = Math.sin(startAngle) * startRadius - row * 4;
      this.startPositions.push(new THREE.Vector3(x, 2, z));
    }

    // Add environment decorations based on track theme
    this.addEnvironment(trackIndex);
  }

  private getTrackMaterial(trackIndex: number): THREE.Material {
    // Different materials for different tracks
    const trackColors = [
      0xccaa66, // Sunset Circuit - sandy
      0x6699cc, // Moonlight Marina - blue
      0x666666, // Metro Rush - gray asphalt
      0x996633, // Forest Trail - dirt brown
      0xeeffff, // Snowline Pass - icy white
      0x993333, // Crimson Canyon - red rock
      0x99ccff, // Skyline Loop - cloud white
      0x330066, // Starlight Finale - cosmic purple
    ];

    return new THREE.MeshStandardMaterial({
      color: trackColors[trackIndex] || 0x888888,
      metalness: trackIndex === 4 ? 0.7 : 0.1, // Icy track is more metallic
      roughness: trackIndex === 3 ? 0.9 : 0.5,  // Dirt track is rougher
    });
  }

  private addEnvironment(trackIndex: number): void {
    // Add simple environment decorations
    const decorations = new THREE.Group();

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: this.getGroundColor(trackIndex),
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    decorations.add(ground);

    // Barriers
    this.checkpoints.forEach(checkpoint => {
      const barrierGeometry = new THREE.BoxGeometry(1, 2, 15);
      const barrierMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
      barrier.position.copy(checkpoint.position);
      barrier.position.x += Math.cos(checkpoint.rotation) * 10;
      barrier.position.z += Math.sin(checkpoint.rotation) * 10;
      barrier.rotation.y = checkpoint.rotation;
      barrier.castShadow = true;
      decorations.add(barrier);
    });

    this.mesh.add(decorations);
  }

  private getGroundColor(trackIndex: number): number {
    const colors = [
      0xddbb77, // Desert
      0x4477aa, // Ocean
      0x333333, // City
      0x335533, // Forest
      0xffffff, // Snow
      0xaa5533, // Canyon
      0xaaddff, // Sky
      0x110033, // Space
    ];
    return colors[trackIndex] || 0x88aa88;
  }

  public getStartPosition(index: number): THREE.Vector3 {
    return this.startPositions[index] || this.startPositions[0];
  }

  public getStartRotation(): THREE.Quaternion {
    return new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
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
