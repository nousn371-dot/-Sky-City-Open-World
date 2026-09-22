import * as THREE from 'three';
import { PHYSICS } from './constants';
import { MovementState } from '../types';
import { LevelEnvironment } from './worldBuilder';

export interface PlayerInput {
  moveForward: number; // -1 to 1
  moveRight: number; // -1 to 1
  jump: boolean;
  jumpJustPressed: boolean;
  sprint: boolean;
  slide: boolean;
  interact: boolean;
  respawn: boolean;
}

export interface PhysicsResult {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  state: MovementState;
  isGrounded: boolean;
  canDoubleJump: boolean;
  speed: number;
  altitude: number;
  landedThisFrame: boolean;
  hardLanding: boolean;
  wallRunSide: 'none' | 'left' | 'right';
  activeCheckpointId: number | null;
  collectedCoinId: number | null;
  hitHazard: boolean;
  reachedFlag: boolean;
  grabbedLedgePos: THREE.Vector3 | null;
}

export class PhysicsEngine {
  public position = new THREE.Vector3(0, 1.2, 0);
  public velocity = new THREE.Vector3(0, 0, 0);
  public state: MovementState = 'idle';
  public isGrounded = true;
  public canDoubleJump = true;
  private wallRunTimer = 0;
  private wallRunNormal = new THREE.Vector3();
  private wallRunSide: 'none' | 'left' | 'right' = 'none';
  private ledgeGrabPos: THREE.Vector3 | null = null;
  private pullUpTimer = 0;
  private rollTimer = 0;
  private currentMovingPlatformDelta = new THREE.Vector3();

  public reset(spawnPoint: THREE.Vector3) {
    this.position.copy(spawnPoint);
    this.velocity.set(0, 0, 0);
    this.state = 'idle';
    this.isGrounded = true;
    this.canDoubleJump = true;
    this.wallRunTimer = 0;
    this.ledgeGrabPos = null;
    this.pullUpTimer = 0;
    this.rollTimer = 0;
  }

  public update(
    delta: number,
    input: PlayerInput,
    cameraYaw: number,
    env: LevelEnvironment
  ): PhysicsResult {
    // Clamp delta time to avoid large physics steps
    const dt = Math.min(delta, 0.05);

    let landedThisFrame = false;
    let hardLanding = false;
    let hitHazard = false;
    let reachedFlag = false;
    let activeCheckpointId: number | null = null;
    let collectedCoinId: number | null = null;

    // 1. Handle Ledge Pull-Up State
    if (this.state === 'pull_up' && this.ledgeGrabPos) {
      this.pullUpTimer += dt;
      this.position.lerp(this.ledgeGrabPos, dt * 6.0);
      if (this.pullUpTimer >= 0.45) {
        this.position.copy(this.ledgeGrabPos);
        this.state = 'idle';
        this.ledgeGrabPos = null;
        this.pullUpTimer = 0;
        this.velocity.set(0, 0, 0);
        this.isGrounded = true;
      }
      return {
        position: this.position,
        velocity: this.velocity,
        state: this.state,
        isGrounded: this.isGrounded,
        canDoubleJump: this.canDoubleJump,
        speed: this.velocity.length(),
        altitude: this.position.y,
        landedThisFrame,
        hardLanding,
        wallRunSide: 'none',
        activeCheckpointId,
        collectedCoinId,
        hitHazard,
        reachedFlag,
        grabbedLedgePos: null,
      };
    }

    // 2. Handle Ledge Grab Hanging State
    if (this.state === 'ledge_grab' && this.ledgeGrabPos) {
      this.velocity.set(0, 0, 0);
      // If jump or interact or forward pressed, pull up!
      if (input.jumpJustPressed || input.interact || input.moveForward > 0.3) {
        this.state = 'pull_up';
        this.pullUpTimer = 0;
      } else if (input.slide) {
        // Drop down from ledge
        this.state = 'fall';
        this.ledgeGrabPos = null;
        this.velocity.y = -2.0;
      }
      return {
        position: this.position,
        velocity: this.velocity,
        state: this.state,
        isGrounded: false,
        canDoubleJump: true,
        speed: 0,
        altitude: this.position.y,
        landedThisFrame,
        hardLanding,
        wallRunSide: 'none',
        activeCheckpointId,
        collectedCoinId,
        hitHazard,
        reachedFlag,
        grabbedLedgePos: this.ledgeGrabPos,
      };
    }

    // 3. Handle Roll State
    if (this.state === 'roll') {
      this.rollTimer += dt;
      if (this.rollTimer > 0.42) {
        this.rollTimer = 0;
        this.state = 'run';
      }
    }

    // 4. Calculate Desired Movement Vector in World Coordinates relative to Camera Yaw
    const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
    const moveDir = new THREE.Vector3()
      .addScaledVector(forward, input.moveForward)
      .addScaledVector(right, input.moveRight);

    if (moveDir.lengthSq() > 0.001) {
      moveDir.normalize();
    }

    // 5. Target Speeds
    let targetSpeed = PHYSICS.RUN_SPEED;
    if (input.sprint && !input.slide) {
      targetSpeed = PHYSICS.SPRINT_SPEED;
    } else if (input.slide) {
      targetSpeed = PHYSICS.SLIDE_SPEED;
    } else if (moveDir.lengthSq() < 0.1) {
      targetSpeed = 0;
    }

    // 6. Wall Run Logic
    let isWallRunning = false;
    this.wallRunSide = 'none';

    if (!this.isGrounded && this.velocity.y < 3.0 && moveDir.lengthSq() > 0.1) {
      for (const wp of env.wallRunPlanes) {
        // Check if player is adjacent to wall bounding box
        const playerBox = new THREE.Box3().setFromCenterAndSize(
          this.position,
          new THREE.Vector3(PHYSICS.PLAYER_RADIUS * 2.8, PHYSICS.PLAYER_HEIGHT, PHYSICS.PLAYER_RADIUS * 2.8)
        );

        if (playerBox.intersectsBox(wp.box)) {
          // Check side: cross product between forward and wall normal
          const dot = wp.normal.dot(forward);
          if (Math.abs(dot) < 0.85) { // running alongside wall, not directly head-on
            const crossY = forward.x * wp.normal.z - forward.z * wp.normal.x;
            this.wallRunSide = crossY > 0 ? 'left' : 'right';
            this.wallRunNormal.copy(wp.normal);
            isWallRunning = true;
            break;
          }
        }
      }
    }

    if (isWallRunning) {
      this.wallRunTimer += dt;
      if (this.wallRunTimer < PHYSICS.WALL_RUN_DURATION) {
        this.state = this.wallRunSide === 'left' ? 'wall_run_left' : 'wall_run_right';
        // Gentle downward slide rather than full gravity
        this.velocity.y = Math.max(-PHYSICS.WALL_RUN_GRAVITY, this.velocity.y - dt * PHYSICS.WALL_RUN_GRAVITY * 1.5);

        // Project forward movement along wall surface
        const tangent = new THREE.Vector3()
          .crossVectors(this.wallRunNormal, new THREE.Vector3(0, 1, 0))
          .normalize();
        if (tangent.dot(forward) < 0) tangent.negate();

        this.velocity.x = tangent.x * PHYSICS.WALL_RUN_SPEED;
        this.velocity.z = tangent.z * PHYSICS.WALL_RUN_SPEED;

        // Wall Jump off wall!
        if (input.jumpJustPressed) {
          this.velocity.y = PHYSICS.WALL_JUMP_VERTICAL;
          this.velocity.x = (tangent.x * 0.7 + this.wallRunNormal.x * 1.1) * PHYSICS.WALL_JUMP_HORIZONTAL;
          this.velocity.z = (tangent.z * 0.7 + this.wallRunNormal.z * 1.1) * PHYSICS.WALL_JUMP_HORIZONTAL;
          this.state = 'jump';
          this.wallRunTimer = PHYSICS.WALL_RUN_DURATION + 1;
          isWallRunning = false;
        }
      } else {
        isWallRunning = false;
      }
    } else {
      this.wallRunTimer = 0;
    }

    // 7. Ground & Air Horizontal Acceleration
    if (!isWallRunning) {
      const accel = this.isGrounded ? PHYSICS.GROUND_ACCELERATION : PHYSICS.AIR_ACCELERATION;
      if (moveDir.lengthSq() > 0.01) {
        this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, moveDir.x * targetSpeed, dt * accel * 0.15);
        this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, moveDir.z * targetSpeed, dt * accel * 0.15);
      } else if (this.isGrounded) {
        // Apply friction deceleration
        const friction = PHYSICS.GROUND_FRICTION;
        this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, dt * friction);
        this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, dt * friction);
      }

      // 8. Jump & Double Jump
      if (input.jumpJustPressed) {
        if (this.isGrounded) {
          this.velocity.y = PHYSICS.JUMP_VELOCITY;
          this.isGrounded = false;
          this.canDoubleJump = true;
          this.state = 'jump';
        } else if (this.canDoubleJump) {
          this.velocity.y = PHYSICS.DOUBLE_JUMP_VELOCITY;
          this.canDoubleJump = false;
          this.state = 'jump';
        }
      }

      // 9. Gravity
      if (!this.isGrounded) {
        this.velocity.y -= PHYSICS.GRAVITY * dt;
        if (this.velocity.y < -PHYSICS.MAX_FALL_SPEED) {
          this.velocity.y = -PHYSICS.MAX_FALL_SPEED;
        }
      }
    }

    // 10. Update Position by Velocity
    const prevY = this.position.y;
    const prevFallVel = this.velocity.y;
    this.position.addScaledVector(this.velocity, dt);

    // Add moving platform offset if standing on one
    this.position.add(this.currentMovingPlatformDelta);
    this.currentMovingPlatformDelta.set(0, 0, 0);

    // 11. Collision Detection & Resolution against World Colliders
    this.isGrounded = false;
    const playerBox = new THREE.Box3();
    const halfH = input.slide ? PHYSICS.SLIDE_HEIGHT / 2 : PHYSICS.PLAYER_HEIGHT / 2;
    const pRadius = PHYSICS.PLAYER_RADIUS;

    playerBox.min.set(this.position.x - pRadius, this.position.y, this.position.z - pRadius);
    playerBox.max.set(this.position.x + pRadius, this.position.y + halfH * 2, this.position.z + pRadius);

    for (const box of env.colliderBoxes) {
      if (playerBox.intersectsBox(box)) {
        // Calculate penetration depths
        const overlapX = Math.min(playerBox.max.x - box.min.x, box.max.x - playerBox.min.x);
        const overlapY = Math.min(playerBox.max.y - box.min.y, box.max.y - playerBox.min.y);
        const overlapZ = Math.min(playerBox.max.z - box.min.z, box.max.z - playerBox.min.z);

        if (overlapY < overlapX && overlapY < overlapZ) {
          // Vertical collision
          if (this.velocity.y <= 0 && this.position.y >= box.max.y - 0.45) {
            // Landed on top of platform
            this.position.y = box.max.y;
            this.isGrounded = true;
            this.canDoubleJump = true;

            // Check for landing impact
            if (prevFallVel < -10) {
              landedThisFrame = true;
              if (prevFallVel < PHYSICS.ROLL_THRESHOLD_FALL_VELOCITY) {
                hardLanding = true;
                // If sliding or jumping on impact -> roll!
                if (input.slide || input.jump) {
                  this.state = 'roll';
                  this.rollTimer = 0;
                }
              }
            }
            this.velocity.y = 0;
          } else if (this.velocity.y > 0 && this.position.y < box.min.y) {
            // Hit ceiling
            this.position.y = box.min.y - halfH * 2;
            this.velocity.y = -1;
          }
        } else if (overlapX < overlapZ) {
          // Horizontal X collision
          if (this.position.x > box.getCenter(new THREE.Vector3()).x) {
            this.position.x += overlapX;
          } else {
            this.position.x -= overlapX;
          }
          this.velocity.x = 0;
        } else {
          // Horizontal Z collision
          if (this.position.z > box.getCenter(new THREE.Vector3()).z) {
            this.position.z += overlapZ;
          } else {
            this.position.z -= overlapZ;
          }
          this.velocity.z = 0;
        }

        // Re-update player box after resolution
        playerBox.min.set(this.position.x - pRadius, this.position.y, this.position.z - pRadius);
        playerBox.max.set(this.position.x + pRadius, this.position.y + halfH * 2, this.position.z + pRadius);
      }
    }

    // 12. Ledge Detection (Grab ledge if airborne and close to top edge)
    if (!this.isGrounded && this.velocity.y < 2.0 && this.state !== 'pull_up' && this.state !== 'roll') {
      const forwardReach = forward.clone().multiplyScalar(0.7);
      const chestPos = this.position.clone().add(new THREE.Vector3(0, 1.2, 0)).add(forwardReach);

      for (const box of env.colliderBoxes) {
        // If box top is just around shoulder level and in front of player
        if (Math.abs(box.max.y - (this.position.y + 1.3)) < 0.6) {
          if (box.containsPoint(new THREE.Vector3(chestPos.x, box.max.y - 0.1, chestPos.z))) {
            this.state = 'ledge_grab';
            this.ledgeGrabPos = new THREE.Vector3(
              chestPos.x - forwardReach.x * 0.3,
              box.max.y,
              chestPos.z - forwardReach.z * 0.3
            );
            this.velocity.set(0, 0, 0);
            break;
          }
        }
      }
    }

    // 13. State Management Update
    if (this.isGrounded && this.state !== 'pull_up' && this.state !== 'roll') {
      const hSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
      if (input.slide && hSpeed > 3.0) {
        this.state = 'slide';
      } else if (hSpeed > 12.0) {
        this.state = 'sprint';
      } else if (hSpeed > 4.0) {
        this.state = 'run';
      } else if (hSpeed > 0.5) {
        this.state = 'walk';
      } else {
        this.state = 'idle';
      }
    } else if (!this.isGrounded && !isWallRunning && this.state !== 'ledge_grab' && this.state !== 'pull_up') {
      if (this.velocity.y > 0) {
        this.state = 'jump';
      } else {
        this.state = 'fall';
      }
    }

    // 14. Checkpoints Trigger Detection
    for (const cp of env.checkpoints) {
      if (!cp.reached) {
        const cpPos = new THREE.Vector3(cp.position[0], cp.position[1], cp.position[2]);
        if (this.position.distanceTo(cpPos) < 2.8) {
          cp.reached = true;
          activeCheckpointId = cp.id;
          break;
        }
      }
    }

    // 15. Collectible Coins Trigger Detection
    for (const coin of env.coins) {
      if (!coin.collected) {
        const cPos = new THREE.Vector3(coin.position[0], coin.position[1], coin.position[2]);
        if (this.position.distanceTo(cPos) < 2.0) {
          coin.collected = true;
          collectedCoinId = coin.id;
          break;
        }
      }
    }

    // 16. Hazard Collision (Rotating beams, lasers)
    for (const obs of env.obstacles) {
      if (obs.type === 'rotating_beam' || obs.type === 'laser_barrier') {
        const obsPos = new THREE.Vector3(obs.position[0], obs.position[1], obs.position[2]);
        if (this.position.distanceTo(obsPos) < (obs.size[0] * 0.5 + 0.5)) {
          // Check vertical distance
          if (Math.abs(this.position.y - obsPos.y) < 1.2) {
            hitHazard = true;
          }
        }
      }
    }

    // 17. Flag Trigger Detection
    if (this.position.distanceTo(env.flagPosition) < 3.2) {
      reachedFlag = true;
      this.state = 'victory';
      this.velocity.set(0, 0, 0);
    }

    // 18. Fall Death Check
    if (this.position.y < PHYSICS.DEATH_FALL_Y) {
      hitHazard = true;
    }

    const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);

    return {
      position: this.position,
      velocity: this.velocity,
      state: this.state,
      isGrounded: this.isGrounded,
      canDoubleJump: this.canDoubleJump,
      speed: currentSpeed,
      altitude: this.position.y,
      landedThisFrame,
      hardLanding,
      wallRunSide: this.wallRunSide,
      activeCheckpointId,
      collectedCoinId,
      hitHazard,
      reachedFlag,
      grabbedLedgePos: this.ledgeGrabPos,
    };
  }

  public setMovingPlatformDelta(delta: THREE.Vector3) {
    this.currentMovingPlatformDelta.copy(delta);
  }
}
