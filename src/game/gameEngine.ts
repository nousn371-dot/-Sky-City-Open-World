import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  LevelDefinition, 
  GameSettings, 
  PlayerCustomization, 
  GameMode, 
  MovementState 
} from '../types';
import { CharacterModel } from './character';
import { WorldBuilder, LevelEnvironment } from './worldBuilder';
import { PhysicsEngine, PlayerInput, PhysicsResult } from './physicsEngine';
import { soundManager } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onTimeUpdate: (time: number) => void;
  onAltitudeUpdate: (alt: number) => void;
  onSpeedUpdate: (speed: number) => void;
  onStateUpdate: (state: MovementState) => void;
  onCheckpointReached: (id: number) => void;
  onCoinCollected: (id: number, count: number) => void;
  onDeath: (altitude: number) => void;
  onVictory: (time: number, deaths: number, coins: number) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private worldBuilder: WorldBuilder;
  private currentEnv: LevelEnvironment | null = null;
  private character: CharacterModel;
  private physics: PhysicsEngine;

  // Camera Controls
  public cameraYaw = 0;
  public cameraPitch = 0.2;
  private cameraDistance = 4.2;
  private cameraShakeIntensity = 0;
  private currentFOV = 75;

  // Game Loop
  private isRunning = false;
  private isPaused = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private gameTime = 0;
  private deathCount = 0;
  private coinsCollectedThisRun = 0;
  private lastCheckpointSpawn: THREE.Vector3 = new THREE.Vector3(0, 1.2, 0);

  // Victory & Slow-mo
  private isVictory = false;
  private victoryTimer = 0;
  private isDead = false;

  // Step audio timing
  private footstepTimer = 0;

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Configuration
  private settings: GameSettings;
  private mode: GameMode = '3D';
  private callbacks: GameEngineCallbacks;

  // Input State
  public input: PlayerInput = {
    moveForward: 0,
    moveRight: 0,
    jump: false,
    jumpJustPressed: false,
    sprint: false,
    slide: false,
    interact: false,
    respawn: false,
  };

  constructor(
    container: HTMLElement,
    settings: GameSettings,
    customization: PlayerCustomization,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.settings = settings;
    this.callbacks = callbacks;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.004);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      settings.fov,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.currentFOV = settings.fov;

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: settings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(
      settings.graphicsQuality === 'ultra' ? Math.min(window.devicePixelRatio, 2.0) :
      settings.graphicsQuality === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 1.0
    );
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = settings.graphicsQuality !== 'low';
    this.renderer.shadowMap.type = settings.graphicsQuality === 'ultra' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.6);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(25, 45, 25);
    this.dirLight.castShadow = settings.graphicsQuality !== 'low';
    this.dirLight.shadow.mapSize.width = settings.graphicsQuality === 'ultra' ? 2048 : 1024;
    this.dirLight.shadow.mapSize.height = settings.graphicsQuality === 'ultra' ? 2048 : 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    this.dirLight.shadow.camera.left = -30;
    this.dirLight.shadow.camera.right = 30;
    this.dirLight.shadow.camera.top = 30;
    this.dirLight.shadow.camera.bottom = -30;
    this.scene.add(this.dirLight);

    // 5. World Builder & Character
    this.worldBuilder = new WorldBuilder();
    this.character = new CharacterModel();
    this.character.applyCustomization(customization);
    this.scene.add(this.character.group);

    const trail = this.character.getTrailMesh();
    if (trail) this.scene.add(trail);

    // 6. Physics
    this.physics = new PhysicsEngine();

    // Window Resize Observer
    window.addEventListener('resize', this.onResize);
  }

  public setGameMode(mode: GameMode) {
    this.mode = mode;
  }

  public applyCustomization(c: PlayerCustomization) {
    this.character.applyCustomization(c);
  }

  public applySettings(s: GameSettings) {
    this.settings = s;
    this.renderer.shadowMap.enabled = s.graphicsQuality !== 'low';
    this.camera.fov = s.fov;
    this.camera.updateProjectionMatrix();
    soundManager.setVolumes(s.masterVolume, s.sfxVolume, s.musicVolume);
  }

  public loadLevel(level: LevelDefinition) {
    // Remove previous level environment
    if (this.currentEnv) {
      this.scene.remove(this.currentEnv.group);
      this.currentEnv = null;
    }

    // Sky & Fog based on level definition
    const skyColor = new THREE.Color(level.skyColorTop);
    const fogColor = new THREE.Color(level.fogColor);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(fogColor, level.fogDensity);

    // Lighting adjustments
    this.hemiLight.color.set(level.directionalLightColor);
    this.hemiLight.groundColor.set(level.fogColor);
    this.hemiLight.intensity = level.ambientLight;

    this.dirLight.color.set(level.directionalLightColor);
    this.dirLight.intensity = level.ambientLight * 1.5;

    // Build 3D world geometry
    this.currentEnv = this.worldBuilder.buildLevel(level);
    this.scene.add(this.currentEnv.group);

    // Reset physics & player state
    this.physics.reset(this.currentEnv.spawnPoint);
    this.lastCheckpointSpawn.copy(this.currentEnv.spawnPoint);
    this.character.group.position.copy(this.currentEnv.spawnPoint);

    this.gameTime = 0;
    this.deathCount = 0;
    this.coinsCollectedThisRun = 0;
    this.isVictory = false;
    this.isDead = false;
    this.victoryTimer = 0;

    // Camera initial position
    this.cameraYaw = 0;
    this.cameraPitch = 0.2;

    soundManager.startMusic();
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.animate();
  }

  public pause(p: boolean) {
    this.isPaused = p;
    if (p) {
      soundManager.stopMusic();
    } else {
      soundManager.startMusic();
      this.lastTime = performance.now();
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    soundManager.stopMusic();
  }

  public respawn() {
    if (!this.currentEnv) return;
    this.isDead = false;
    this.physics.reset(this.lastCheckpointSpawn);
    this.character.group.position.copy(this.lastCheckpointSpawn);
    this.cameraPitch = 0.2;
    this.callbacks.onStateUpdate('idle');
  }

  public restartLevel() {
    if (!this.currentEnv) return;
    this.isDead = false;
    this.isVictory = false;
    this.gameTime = 0;
    this.deathCount = 0;
    this.coinsCollectedThisRun = 0;
    this.physics.reset(this.currentEnv.spawnPoint);
    this.lastCheckpointSpawn.copy(this.currentEnv.spawnPoint);
    this.character.group.position.copy(this.currentEnv.spawnPoint);

    // Reset checkpoints & coins
    this.currentEnv.checkpoints.forEach(cp => (cp.reached = false));
    this.currentEnv.coins.forEach(c => (c.collected = false));
    this.currentEnv.checkpointMeshes.forEach(cm => {
      cm.ring.material = (this.worldBuilder as any).checkpointInactiveMat;
      cm.light.color.setHex(0xf97316);
    });
    this.currentEnv.coinMeshes.forEach(cm => (cm.mesh.visible = true));

    this.callbacks.onStateUpdate('idle');
    this.callbacks.onTimeUpdate(0);
  }

  private animate = () => {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (delta > 0.1) delta = 0.1; // clamp lag spike

    if (!this.isPaused && this.currentEnv) {
      this.update(delta);
    }

    this.render();
  };

  private update(delta: number) {
    if (!this.currentEnv) return;

    // Victory slow-mo
    if (this.isVictory) {
      delta *= 0.25;
      this.victoryTimer += delta;
      this.cameraYaw += delta * 0.8; // Cinematic orbit around flagpole
    }

    if (!this.isVictory && !this.isDead) {
      this.gameTime += delta;
      this.callbacks.onTimeUpdate(this.gameTime);
    }

    // 1. Update Dynamic Obstacles in Environment (Moving platforms, rotating beams, etc.)
    const time = this.gameTime;
    for (const obs of this.currentEnv.obstacleMeshes) {
      if (obs.data.type === 'moving_platform') {
        const range = obs.data.movementRange || 4.0;
        const speed = obs.data.speed || 1.5;
        const offset = Math.sin(time * speed) * range;
        const prevP = obs.mesh.position.clone();

        if (obs.data.movementAxis === 'y') {
          obs.mesh.position.y = obs.initialPos.y + offset;
        } else if (obs.data.movementAxis === 'x') {
          obs.mesh.position.x = obs.initialPos.x + offset;
        } else {
          obs.mesh.position.z = obs.initialPos.z + offset;
        }

        // If player is standing on this platform, move player along with it!
        const pBox = new THREE.Box3().setFromObject(obs.mesh);
        if (
          Math.abs(this.physics.position.y - pBox.max.y) < 0.25 &&
          this.physics.position.x >= pBox.min.x - 0.2 &&
          this.physics.position.x <= pBox.max.x + 0.2 &&
          this.physics.position.z >= pBox.min.z - 0.2 &&
          this.physics.position.z <= pBox.max.z + 0.2
        ) {
          const moveDelta = obs.mesh.position.clone().sub(prevP);
          this.physics.setMovingPlatformDelta(moveDelta);
        }

        // Update collider box
        obs.mesh.updateMatrixWorld(true);
      } else if (obs.data.type === 'rotating_beam') {
        const rotSpeed = obs.data.rotationSpeed || 1.5;
        obs.mesh.rotation.y += delta * rotSpeed;
      }
    }

    // 2. Animate Summit Flag cloth
    if (this.currentEnv.flagCloth) {
      this.currentEnv.flagCloth.rotation.y = Math.sin(time * 3.5) * 0.25;
    }

    // 3. Animate Coins & Checkpoint lights
    for (const cm of this.currentEnv.coinMeshes) {
      if (!cm.data.collected) {
        cm.mesh.rotation.z += delta * 2.5;
        cm.mesh.position.y = cm.data.position[1] + Math.sin(time * 3 + cm.data.id) * 0.15;
      } else {
        cm.mesh.visible = false;
      }
    }

    // 4. Weather Particles drift
    if (this.currentEnv.particlesGroup) {
      const positions = this.currentEnv.particlesGroup.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i++) {
        let py = positions.getY(i) - delta * 28;
        if (py < 0) py = this.currentEnv.flagPosition.y + 25;
        positions.setY(i, py);
      }
      positions.needsUpdate = true;
    }

    // 5. Physics & Movement Step
    if (!this.isDead) {
      const pResult: PhysicsResult = this.physics.update(
        delta,
        this.input,
        this.mode === '2D' ? Math.PI / 2 : this.cameraYaw,
        this.currentEnv
      );

      // Reset single-press inputs
      this.input.jumpJustPressed = false;

      // Update Character Transforms
      this.character.group.position.copy(pResult.position);

      // Character facing rotation
      if (this.mode === '2D') {
        // Face left or right in 2D
        if (this.input.moveForward !== 0) {
          const targetRotY = this.input.moveForward > 0 ? Math.PI / 2 : -Math.PI / 2;
          this.character.group.rotation.y = THREE.MathUtils.lerp(
            this.character.group.rotation.y,
            targetRotY,
            delta * 15
          );
        }
      } else {
        if (pResult.velocity.lengthSq() > 0.1 && pResult.state !== 'wall_run_left' && pResult.state !== 'wall_run_right') {
          const targetAngle = Math.atan2(pResult.velocity.x, pResult.velocity.z);
          this.character.group.rotation.y = THREE.MathUtils.lerp(
            this.character.group.rotation.y,
            targetAngle,
            delta * 12
          );
        }
      }

      // Update Character Animations
      this.character.updateAnimation(
        pResult.state,
        pResult.speed,
        delta,
        this.character.group.position
      );

      // Sound FX triggers
      if (pResult.isGrounded && pResult.speed > 1.5) {
        this.footstepTimer += delta * (pResult.state === 'sprint' ? 14 : 9);
        if (this.footstepTimer > Math.PI) {
          this.footstepTimer = 0;
          soundManager.playFootstep(pResult.state === 'sprint');
        }
      }

      if (pResult.landedThisFrame) {
        soundManager.playLanding(pResult.hardLanding);
        if (pResult.hardLanding) {
          this.triggerCameraShake(0.35);
        }
      }

      if (pResult.wallRunSide !== 'none') {
        soundManager.playWallRun();
      }

      if (pResult.state === 'slide') {
        soundManager.playSlide();
      }

      if (pResult.state === 'ledge_grab') {
        soundManager.playLedgeGrab();
      }

      // Update Dynamic Wind audio
      soundManager.updateWind(pResult.speed, pResult.altitude);

      // Checkpoint reached
      if (pResult.activeCheckpointId !== null) {
        soundManager.playCheckpoint();
        this.lastCheckpointSpawn.copy(pResult.position);
        const cm = this.currentEnv.checkpointMeshes.find(c => c.data.id === pResult.activeCheckpointId);
        if (cm) {
          cm.ring.material = (this.worldBuilder as any).checkpointActiveMat;
          cm.light.color.setHex(0x10b981);
        }
        this.callbacks.onCheckpointReached(pResult.activeCheckpointId);
      }

      // Coin collected
      if (pResult.collectedCoinId !== null) {
        soundManager.playCoin();
        this.coinsCollectedThisRun++;
        this.callbacks.onCoinCollected(pResult.collectedCoinId, this.coinsCollectedThisRun);
      }

      // Hazard / Death triggered
      if (pResult.hitHazard) {
        soundManager.playDeath();
        this.isDead = true;
        this.deathCount++;
        this.triggerCameraShake(0.6);
        this.callbacks.onDeath(pResult.altitude);
      }

      // Victory Summit reached!
      if (pResult.reachedFlag && !this.isVictory) {
        this.isVictory = true;
        soundManager.playVictory();
        this.triggerCameraShake(0.5);
        this.launchVictoryConfetti();
        this.callbacks.onVictory(this.gameTime, this.deathCount, this.coinsCollectedThisRun);
      }

      // UI Callbacks
      this.callbacks.onAltitudeUpdate(pResult.altitude);
      this.callbacks.onSpeedUpdate(pResult.speed);
      this.callbacks.onStateUpdate(pResult.state);

      // Camera Follow & Dynamic FOV
      this.updateCamera(delta, pResult.speed, pResult.velocity.y);
    }
  }

  private updateCamera(delta: number, speed: number, verticalVelocity: number) {
    const target = this.character.group.position.clone().add(new THREE.Vector3(0, 1.3, 0));

    if (this.mode === '2D') {
      // 2D Side-scrolling orthographic-like perspective
      const camTargetPos = target.clone().add(new THREE.Vector3(0, 0.8, 14.0));
      this.camera.position.lerp(camTargetPos, delta * 10);
      this.camera.lookAt(target);
      return;
    }

    // 3D Third Person Camera with Collision Avoidance
    const desiredDistance = this.cameraDistance;
    const phi = this.cameraPitch;
    const theta = this.cameraYaw;

    const offset = new THREE.Vector3(
      Math.sin(theta) * Math.cos(phi) * desiredDistance,
      Math.sin(phi) * desiredDistance,
      Math.cos(theta) * Math.cos(phi) * desiredDistance
    );

    let cameraPos = target.clone().add(offset);

    // Raycast camera collision against environment to prevent wall clipping
    if (this.currentEnv) {
      const ray = new THREE.Ray(target, offset.clone().normalize());
      for (const box of this.currentEnv.colliderBoxes) {
        const intersection = new THREE.Vector3();
        if (ray.intersectBox(box, intersection)) {
          const hitDist = target.distanceTo(intersection);
          if (hitDist < desiredDistance) {
            cameraPos.copy(target).add(offset.clone().normalize().multiplyScalar(Math.max(1.0, hitDist - 0.3)));
            break;
          }
        }
      }
    }

    // Camera Shake
    if (this.cameraShakeIntensity > 0) {
      cameraPos.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
      cameraPos.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
      cameraPos.z += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * 2.0);
    }

    // Smooth Camera Damping
    this.camera.position.lerp(cameraPos, delta * 15);
    this.camera.lookAt(target);

    // Dynamic FOV based on speed and falls
    const targetFOV = this.settings.fov + (speed > 12 ? (speed - 12) * 1.5 : 0) + (verticalVelocity < -15 ? 10 : 0);
    this.currentFOV = THREE.MathUtils.lerp(this.currentFOV, targetFOV, delta * 5);
    this.camera.fov = this.currentFOV;
    this.camera.updateProjectionMatrix();

    // Move directional sunlight along with player height for consistent high-quality shadows
    this.dirLight.position.set(
      target.x + 25,
      target.y + 45,
      target.z + 25
    );
    this.dirLight.target.position.copy(target);
    this.dirLight.target.updateMatrixWorld();
  }

  public triggerCameraShake(intensity: number) {
    if (this.settings.cameraShake) {
      this.cameraShakeIntensity = intensity;
    }
  }

  private launchVictoryConfetti() {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'],
      });
    } catch (e) {}
  }

  public handleMouseMove(movementX: number, movementY: number) {
    if (this.mode === '2D' || this.isPaused) return;
    const sens = 0.0022 * this.settings.mouseSensitivity;
    this.cameraYaw -= movementX * sens;
    const invert = this.settings.invertY ? -1 : 1;
    this.cameraPitch += movementY * sens * invert;
    this.cameraPitch = Math.max(-0.4, Math.min(1.2, this.cameraPitch));
  }

  public handleTouchPan(deltaX: number, deltaY: number) {
    if (this.mode === '2D' || this.isPaused) return;
    const sens = 0.0035 * this.settings.mouseSensitivity;
    this.cameraYaw -= deltaX * sens;
    this.cameraPitch += deltaY * sens;
    this.cameraPitch = Math.max(-0.4, Math.min(1.2, this.cameraPitch));
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
