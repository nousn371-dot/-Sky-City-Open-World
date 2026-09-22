import * as THREE from 'three';
import { LevelDefinition, CheckpointData, CollectibleCoin, ObstacleData } from '../types';

export interface LevelEnvironment {
  group: THREE.Group;
  colliderBoxes: THREE.Box3[];
  wallRunPlanes: { box: THREE.Box3; normal: THREE.Vector3 }[];
  checkpoints: CheckpointData[];
  coins: CollectibleCoin[];
  obstacles: ObstacleData[];
  obstacleMeshes: { data: ObstacleData; mesh: THREE.Object3D; initialPos: THREE.Vector3 }[];
  checkpointMeshes: { data: CheckpointData; mesh: THREE.Group; light: THREE.PointLight; ring: THREE.Mesh }[];
  coinMeshes: { data: CollectibleCoin; mesh: THREE.Group }[];
  flagMesh: THREE.Group;
  flagPosition: THREE.Vector3;
  flagCloth: THREE.Mesh;
  particlesGroup: THREE.Points | null;
  spawnPoint: THREE.Vector3;
}

export class WorldBuilder {
  // Shared materials for performance and LOD
  private concreteMat: THREE.MeshStandardMaterial;
  private metalMat: THREE.MeshStandardMaterial;
  private yellowMetalMat: THREE.MeshStandardMaterial;
  private darkWallMat: THREE.MeshStandardMaterial;
  private wallRunMat: THREE.MeshStandardMaterial;
  private glassMat: THREE.MeshPhysicalMaterial;
  private hazardMat: THREE.MeshStandardMaterial;
  private laserMat: THREE.MeshBasicMaterial;
  private coinMat: THREE.MeshStandardMaterial;
  private checkpointInactiveMat: THREE.MeshStandardMaterial;
  private checkpointActiveMat: THREE.MeshStandardMaterial;

  constructor() {
    this.concreteMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.metalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.7,
    });

    this.yellowMetalMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.4,
      metalness: 0.5,
    });

    this.darkWallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
    });

    this.wallRunMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3,
      metalness: 0.4,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
    });

    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
    });

    this.hazardMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.4,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.6,
    });

    this.laserMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.85,
    });

    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
    });

    this.checkpointInactiveMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xc2410c,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });

    this.checkpointActiveMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
  }

  public buildLevel(level: LevelDefinition): LevelEnvironment {
    const group = new THREE.Group();
    group.name = `level_${level.id}`;

    const colliderBoxes: THREE.Box3[] = [];
    const wallRunPlanes: { box: THREE.Box3; normal: THREE.Vector3 }[] = [];
    const checkpoints: CheckpointData[] = [];
    const checkpointMeshes: { data: CheckpointData; mesh: THREE.Group; light: THREE.PointLight; ring: THREE.Mesh }[] = [];
    const coins: CollectibleCoin[] = [];
    const coinMeshes: { data: CollectibleCoin; mesh: THREE.Group }[] = [];
    const obstacles: ObstacleData[] = [];
    const obstacleMeshes: { data: ObstacleData; mesh: THREE.Object3D; initialPos: THREE.Vector3 }[] = [];

    const spawnPoint = new THREE.Vector3(0, 1.2, 0);

    // 1. Ground starting plaza
    const groundGeom = new THREE.BoxGeometry(24, 2, 24);
    const groundMesh = new THREE.Mesh(groundGeom, this.darkWallMat);
    groundMesh.position.set(0, -1, 0);
    groundMesh.receiveShadow = true;
    group.add(groundMesh);
    colliderBoxes.push(new THREE.Box3().setFromObject(groundMesh));

    // Ground safety border perimeter
    const borderGeom = new THREE.BoxGeometry(26, 1.5, 1);
    const b1 = new THREE.Mesh(borderGeom, this.metalMat);
    b1.position.set(0, 0.75, 12.5);
    group.add(b1);
    colliderBoxes.push(new THREE.Box3().setFromObject(b1));

    const b2 = b1.clone();
    b2.position.set(0, 0.75, -12.5);
    group.add(b2);
    colliderBoxes.push(new THREE.Box3().setFromObject(b2));

    // Starting training banner / portal arch
    const archPillarGeom = new THREE.BoxGeometry(1, 6, 1);
    const archP1 = new THREE.Mesh(archPillarGeom, this.yellowMetalMat);
    archP1.position.set(-3.5, 3, -6);
    group.add(archP1);
    const archP2 = archP1.clone();
    archP2.position.set(3.5, 3, -6);
    group.add(archP2);
    const archTopGeom = new THREE.BoxGeometry(8, 1, 1.2);
    const archTop = new THREE.Mesh(archTopGeom, this.metalMat);
    archTop.position.set(0, 6.5, -6);
    group.add(archTop);

    // 2. Tower Spine (Giant Central Monument / Pillars)
    const spineHeight = level.height + 25;
    const spineGeom = new THREE.BoxGeometry(5, spineHeight, 5);
    const spineMesh = new THREE.Mesh(spineGeom, this.darkWallMat);
    spineMesh.position.set(0, spineHeight / 2 - 2, 0);
    spineMesh.receiveShadow = true;
    spineMesh.castShadow = true;
    group.add(spineMesh);
    colliderBoxes.push(new THREE.Box3().setFromObject(spineMesh));

    // Scaffolding details on central spine
    const scafCount = Math.floor(level.height / 15);
    for (let i = 0; i < scafCount; i++) {
      const ringY = (i + 1) * 15;
      const ringGeom = new THREE.BoxGeometry(7, 0.6, 7);
      const ringMesh = new THREE.Mesh(ringGeom, this.metalMat);
      ringMesh.position.set(0, ringY, 0);
      group.add(ringMesh);
    }

    // 3. Generate Vertical Spiral & Multi-Directional Parkour Path
    // Each section ascends by ~3.5m to 5m (athletic jump reach)
    const totalSteps = Math.floor(level.height / 3.8);
    let currentPos = new THREE.Vector3(0, 0, -4);
    let currentAngle = 0;
    const checkpointInterval = Math.floor(totalSteps / (level.checkpointsCount + 1));
    let nextCheckpointStep = checkpointInterval;
    let cpId = 1;
    let coinId = 1;

    for (let step = 1; step <= totalSteps; step++) {
      const progress = step / totalSteps;
      const altitude = step * 3.8;
      
      // Determine radius and angle for climbing spiral / jagged pattern
      currentAngle += 0.55 + (level.id * 0.05);
      const radius = 6.5 + Math.sin(step * 0.8) * 3.0;
      const px = Math.cos(currentAngle) * radius;
      const pz = Math.sin(currentAngle) * radius;
      const py = altitude;

      currentPos.set(px, py, pz);

      // Section type variety based on level and step
      const stepType = step % 8;

      if (stepType === 0 || stepType === 4) {
        // Standard wide or narrow platform
        const isNarrow = level.id > 8 && step % 3 === 0;
        const width = isNarrow ? 1.4 : 3.4 - (progress * 1.2);
        const depth = isNarrow ? 3.5 : 3.8 - (progress * 1.0);
        const platGeom = new THREE.BoxGeometry(Math.max(1.2, width), 0.8, Math.max(1.5, depth));
        const platMesh = new THREE.Mesh(platGeom, step % 2 === 0 ? this.concreteMat : this.metalMat);
        platMesh.position.set(px, py, pz);
        platMesh.receiveShadow = true;
        platMesh.castShadow = true;
        group.add(platMesh);
        colliderBoxes.push(new THREE.Box3().setFromObject(platMesh));

        // Edge trim
        const trimGeom = new THREE.BoxGeometry(width + 0.1, 0.1, depth + 0.1);
        const trimMesh = new THREE.Mesh(trimGeom, this.yellowMetalMat);
        trimMesh.position.set(px, py + 0.42, pz);
        group.add(trimMesh);

      } else if (stepType === 1 || stepType === 5) {
        // Wall Run Section!
        // A vertical wall aligned tangential to the path
        const wallLength = 7.0;
        const wallHeight = 5.0;
        const wallGeom = new THREE.BoxGeometry(wallLength, wallHeight, 0.6);
        const wallMesh = new THREE.Mesh(wallGeom, this.wallRunMat);
        
        // Orient wall facing inward/outward
        const wallAngle = currentAngle + Math.PI / 2;
        wallMesh.position.set(px, py + 2.0, pz);
        wallMesh.rotation.y = wallAngle;
        wallMesh.receiveShadow = true;
        wallMesh.castShadow = true;
        group.add(wallMesh);

        const wallBox = new THREE.Box3().setFromObject(wallMesh);
        colliderBoxes.push(wallBox);

        // Calculate normal for wall-running
        const normal = new THREE.Vector3(Math.cos(currentAngle), 0, Math.sin(currentAngle)).normalize();
        wallRunPlanes.push({ box: wallBox, normal });

        // Small landing perch after the wall run
        const landingPerch = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), this.yellowMetalMat);
        const exitOffset = new THREE.Vector3(
          Math.cos(wallAngle) * (wallLength * 0.55),
          -0.5,
          Math.sin(wallAngle) * (wallLength * 0.55)
        );
        landingPerch.position.copy(wallMesh.position).add(exitOffset);
        group.add(landingPerch);
        colliderBoxes.push(new THREE.Box3().setFromObject(landingPerch));

      } else if (stepType === 2) {
        // Moving platform or Elevator!
        const isElevator = level.id >= 4 && step % 2 === 0;
        const moveAxis = isElevator ? 'y' : (step % 4 === 0 ? 'x' : 'z');
        const platGeom = new THREE.BoxGeometry(2.8, 0.6, 2.8);
        const moveMesh = new THREE.Mesh(platGeom, this.yellowMetalMat);
        moveMesh.position.set(px, py, pz);
        moveMesh.receiveShadow = true;
        moveMesh.castShadow = true;
        group.add(moveMesh);

        // Glowing indicator on moving platform
        const indGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16);
        const indMesh = new THREE.Mesh(indGeom, this.wallRunMat);
        indMesh.position.set(0, 0.35, 0);
        moveMesh.add(indMesh);

        const obsData: ObstacleData = {
          type: 'moving_platform',
          position: [px, py, pz],
          size: [2.8, 0.6, 2.8],
          movementAxis: moveAxis,
          movementRange: isElevator ? 4.0 : 5.0,
          speed: 1.2 + (level.id * 0.05),
        };
        obstacles.push(obsData);
        obstacleMeshes.push({ data: obsData, mesh: moveMesh, initialPos: new THREE.Vector3(px, py, pz) });
        // Initial bounding box
        colliderBoxes.push(new THREE.Box3().setFromObject(moveMesh));

      } else if (stepType === 3) {
        // Pipe balance or Glass Beam
        const pipeGeom = new THREE.CylinderGeometry(0.35, 0.35, 6.0, 16);
        const pipeMesh = new THREE.Mesh(pipeGeom, this.metalMat);
        pipeMesh.position.set(px, py, pz);
        pipeMesh.rotation.z = Math.PI / 2;
        pipeMesh.rotation.y = currentAngle;
        pipeMesh.receiveShadow = true;
        group.add(pipeMesh);

        const pipeBox = new THREE.Box3().setFromObject(pipeMesh);
        colliderBoxes.push(pipeBox);

        // Spinning hazard beam in harder stages
        if (level.id >= 8 && step % 3 === 0) {
          const barGeom = new THREE.BoxGeometry(5.0, 0.3, 0.3);
          const barMesh = new THREE.Mesh(barGeom, this.hazardMat);
          barMesh.position.set(px, py + 1.2, pz);
          group.add(barMesh);

          const barObs: ObstacleData = {
            type: 'rotating_beam',
            position: [px, py + 1.2, pz],
            size: [5.0, 0.3, 0.3],
            rotationAxis: 'y',
            rotationSpeed: 1.5 + (level.id * 0.1),
          };
          obstacles.push(barObs);
          obstacleMeshes.push({ data: barObs, mesh: barMesh, initialPos: barMesh.position.clone() });
        }

      } else if (stepType === 6) {
        // Crane Arm or Girders
        const craneGeom = new THREE.BoxGeometry(8.0, 0.8, 1.4);
        const craneMesh = new THREE.Mesh(craneGeom, this.yellowMetalMat);
        craneMesh.position.set(px, py, pz);
        craneMesh.rotation.y = currentAngle + 0.3;
        craneMesh.receiveShadow = true;
        craneMesh.castShadow = true;
        group.add(craneMesh);
        colliderBoxes.push(new THREE.Box3().setFromObject(craneMesh));

        // Laser obstacle on top of crane arm in advanced stages
        if (level.id >= 10 && step % 4 === 0) {
          const laserGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 8);
          const laserMesh = new THREE.Mesh(laserGeom, this.laserMat);
          laserMesh.position.set(px, py + 1.2, pz);
          laserMesh.rotation.z = Math.PI / 2;
          group.add(laserMesh);

          const laserObs: ObstacleData = {
            type: 'laser_barrier',
            position: [px, py + 1.2, pz],
            size: [3.5, 0.3, 0.3],
          };
          obstacles.push(laserObs);
          obstacleMeshes.push({ data: laserObs, mesh: laserMesh, initialPos: laserMesh.position.clone() });
        }

      } else {
        // Glass or Concrete stepped pad
        const padGeom = new THREE.BoxGeometry(2.6, 0.5, 2.6);
        const padMesh = new THREE.Mesh(padGeom, this.glassMat);
        padMesh.position.set(px, py, pz);
        group.add(padMesh);
        colliderBoxes.push(new THREE.Box3().setFromObject(padMesh));
      }

      // Checkpoint placement
      if (step === nextCheckpointStep && cpId <= level.checkpointsCount) {
        const cpPos: [number, number, number] = [px, py + 0.5, pz];
        const cpData: CheckpointData = {
          id: cpId,
          position: cpPos,
          rotationY: currentAngle,
          reached: false,
        };
        checkpoints.push(cpData);

        // Checkpoint 3D visual pylon
        const cpGroup = new THREE.Group();
        cpGroup.position.set(px, py + 0.4, pz);

        const basePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 1.8, 16), this.metalMat);
        basePillar.position.y = 0.9;
        cpGroup.add(basePillar);

        const ringGeom = new THREE.TorusGeometry(0.85, 0.08, 12, 32);
        const ringMesh = new THREE.Mesh(ringGeom, this.checkpointInactiveMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 1.2;
        cpGroup.add(ringMesh);

        const beaconLight = new THREE.PointLight(0xf97316, 2.0, 8);
        beaconLight.position.y = 1.6;
        cpGroup.add(beaconLight);

        group.add(cpGroup);
        checkpointMeshes.push({ data: cpData, mesh: cpGroup, light: beaconLight, ring: ringMesh });

        nextCheckpointStep += checkpointInterval;
        cpId++;
      }

      // Place collectible coins on challenging spots
      if (step % Math.max(2, Math.floor(totalSteps / level.totalCoins)) === 0 && coinId <= level.totalCoins) {
        const coinPos: [number, number, number] = [px, py + 1.4, pz];
        const cData: CollectibleCoin = {
          id: coinId,
          position: coinPos,
          collected: false,
          value: 10,
        };
        coins.push(cData);

        const coinGroup = new THREE.Group();
        coinGroup.position.set(px, py + 1.4, pz);

        // Octagonal energetic shard / coin
        const coinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 8), this.coinMat);
        coinMesh.rotation.x = Math.PI / 2;
        coinGroup.add(coinMesh);

        const coinLight = new THREE.PointLight(0xfbbf24, 0.8, 3.5);
        coinGroup.add(coinLight);

        group.add(coinGroup);
        coinMeshes.push({ data: cData, mesh: coinGroup });
        coinId++;
      }
    }

    // 4. THE SUMMIT PLATFORM & FLAG
    const summitY = level.height;
    const summitPlatGeom = new THREE.CylinderGeometry(5.0, 5.5, 1.8, 32);
    const summitPlatMesh = new THREE.Mesh(summitPlatGeom, this.concreteMat);
    summitPlatMesh.position.set(0, summitY, 0);
    summitPlatMesh.receiveShadow = true;
    summitPlatMesh.castShadow = true;
    group.add(summitPlatMesh);
    colliderBoxes.push(new THREE.Box3().setFromObject(summitPlatMesh));

    // Summit decorative neon ring
    const summitRingGeom = new THREE.TorusGeometry(4.8, 0.15, 16, 48);
    const summitRingMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
    });
    const summitRing = new THREE.Mesh(summitRingGeom, summitRingMat);
    summitRing.rotation.x = Math.PI / 2;
    summitRing.position.set(0, summitY + 0.95, 0);
    group.add(summitRing);

    // Giant Flag Pole & Cloth
    const flagGroup = new THREE.Group();
    flagGroup.position.set(0, summitY + 0.9, 0);

    // Base stand
    const flagBaseGeom = new THREE.CylinderGeometry(0.8, 1.2, 0.6, 16);
    const flagBase = new THREE.Mesh(flagBaseGeom, this.metalMat);
    flagBase.position.y = 0.3;
    flagGroup.add(flagBase);

    // Pole
    const poleHeight = 7.0;
    const poleGeom = new THREE.CylinderGeometry(0.1, 0.12, poleHeight, 16);
    const poleMesh = new THREE.Mesh(poleGeom, this.yellowMetalMat);
    poleMesh.position.y = poleHeight / 2 + 0.3;
    flagGroup.add(poleMesh);

    // Golden Finial Sphere on top
    const finialGeom = new THREE.SphereGeometry(0.28, 16, 16);
    const finialMesh = new THREE.Mesh(finialGeom, this.coinMat);
    finialMesh.position.y = poleHeight + 0.3;
    flagGroup.add(finialMesh);

    // Waving Cloth Flag
    const clothGeom = new THREE.PlaneGeometry(2.4, 1.5, 12, 8);
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      side: THREE.DoubleSide,
      emissive: 0x991b1b,
      emissiveIntensity: 0.3,
    });
    const flagCloth = new THREE.Mesh(clothGeom, clothMat);
    flagCloth.position.set(1.2, poleHeight - 0.7, 0);
    flagGroup.add(flagCloth);

    // Summit Beacon Light
    const summitBeacon = new THREE.PointLight(0xfbbf24, 4.0, 20);
    summitBeacon.position.set(0, poleHeight + 1.0, 0);
    flagGroup.add(summitBeacon);

    group.add(flagGroup);

    // 5. Ambient Weather Particles (Rain / Cyber Dust / Embers)
    let particlesGroup: THREE.Points | null = null;
    const particleCount = level.theme === 'rain' || level.theme === 'storm' ? 1200 : 400;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = Math.random() * (level.height + 40);
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: level.theme === 'storm' || level.theme === 'rain' ? 0x93c5fd : 0xfef08a,
      size: level.theme === 'storm' ? 0.35 : 0.2,
      transparent: true,
      opacity: 0.6,
    });
    particlesGroup = new THREE.Points(particleGeom, particleMat);
    group.add(particlesGroup);

    // 6. Distant background skyline silhouettes for AAA atmospheric depth
    this.addBackgroundCity(group, level.height, level.theme);

    return {
      group,
      colliderBoxes,
      wallRunPlanes,
      checkpoints,
      coins,
      obstacles,
      obstacleMeshes,
      checkpointMeshes,
      coinMeshes,
      flagMesh: flagGroup,
      flagPosition: new THREE.Vector3(0, summitY + 0.9, 0),
      flagCloth,
      particlesGroup,
      spawnPoint,
    };
  }

  private addBackgroundCity(group: THREE.Group, towerHeight: number, theme: string) {
    const bgGroup = new THREE.Group();
    const buildingMat = new THREE.MeshBasicMaterial({
      color: theme === 'cyberpunk' ? 0x0f172a : (theme === 'night' ? 0x020617 : 0x334155),
      transparent: true,
      opacity: 0.45,
    });

    // Ring of 28 distant skyscrapers
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const dist = 75 + (i % 4) * 15;
      const bHeight = 40 + Math.random() * (towerHeight * 1.2);
      const bWidth = 14 + Math.random() * 12;
      const bDepth = 14 + Math.random() * 12;

      const bGeom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bMesh = new THREE.Mesh(bGeom, buildingMat);
      bMesh.position.set(
        Math.cos(angle) * dist,
        bHeight / 2 - 15,
        Math.sin(angle) * dist
      );
      bgGroup.add(bMesh);

      // Window glowing slit in cyberpunk/night
      if (theme === 'cyberpunk' || theme === 'night') {
        const winMat = new THREE.MeshBasicMaterial({
          color: (i % 2 === 0) ? 0x06b6d4 : 0xf43f5e,
          transparent: true,
          opacity: 0.6,
        });
        const winGeom = new THREE.BoxGeometry(bWidth * 0.8, 0.4, bDepth + 0.2);
        const win = new THREE.Mesh(winGeom, winMat);
        win.position.set(bMesh.position.x, bHeight * 0.7, bMesh.position.z);
        bgGroup.add(win);
      }
    }

    group.add(bgGroup);
  }
}
