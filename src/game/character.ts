import * as THREE from 'three';
import { MovementState, PlayerCustomization } from '../types';

export class CharacterModel {
  public group: THREE.Group;
  
  // Skeleton parts
  private hips: THREE.Group;
  private spine: THREE.Group;
  private chest: THREE.Group;
  private head: THREE.Group;
  private leftUpperArm: THREE.Group;
  private leftForearm: THREE.Group;
  private rightUpperArm: THREE.Group;
  private rightForearm: THREE.Group;
  private leftThigh: THREE.Group;
  private leftShin: THREE.Group;
  private rightThigh: THREE.Group;
  private rightShin: THREE.Group;

  // Meshes for dynamic color customization
  private shirtMeshes: THREE.Mesh[] = [];
  private pantsMeshes: THREE.Mesh[] = [];
  private shoesMeshes: THREE.Mesh[] = [];
  private glovesMeshes: THREE.Mesh[] = [];
  private maskMeshes: THREE.Mesh[] = [];
  private hairMeshes: THREE.Mesh[] = [];
  private headgearGroup: THREE.Group;

  // Animation state
  private animTimer = 0;
  private currentState: MovementState = 'idle';
  private rollAngle = 0;
  private pullUpProgress = 0;

  // Speed Trail
  private trailPoints: THREE.Vector3[] = [];
  private trailLine: THREE.Line | null = null;
  private trailMaterial: THREE.LineBasicMaterial | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'player_character';

    // Build articulated body
    this.hips = new THREE.Group();
    this.hips.position.y = 0.95;
    this.group.add(this.hips);

    // Pelvis mesh
    const pelvisGeom = new THREE.BoxGeometry(0.38, 0.2, 0.26);
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const pelvisMesh = new THREE.Mesh(pelvisGeom, pantsMat);
    pelvisMesh.castShadow = true;
    this.hips.add(pelvisMesh);
    this.pantsMeshes.push(pelvisMesh);

    // Spine & Chest
    this.spine = new THREE.Group();
    this.spine.position.y = 0.12;
    this.hips.add(this.spine);

    this.chest = new THREE.Group();
    this.chest.position.y = 0.28;
    this.spine.add(this.chest);

    const chestGeom = new THREE.BoxGeometry(0.44, 0.38, 0.3);
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const chestMesh = new THREE.Mesh(chestGeom, shirtMat);
    chestMesh.position.y = 0.19;
    chestMesh.castShadow = true;
    this.chest.add(chestMesh);
    this.shirtMeshes.push(chestMesh);

    // Head & Neck
    this.head = new THREE.Group();
    this.head.position.y = 0.42;
    this.chest.add(this.head);

    const headGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b5, roughness: 0.6 });
    const headMesh = new THREE.Mesh(headGeom, skinMat);
    headMesh.position.y = 0.16;
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Hair
    const hairGeom = new THREE.BoxGeometry(0.32, 0.12, 0.34);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.8 });
    const hairMesh = new THREE.Mesh(hairGeom, hairMat);
    hairMesh.position.set(0, 0.26, -0.02);
    this.head.add(hairMesh);
    this.hairMeshes.push(hairMesh);

    // Visor / Mask
    const maskGeom = new THREE.BoxGeometry(0.3, 0.1, 0.16);
    const maskMat = new THREE.MeshStandardMaterial({ 
      color: 0x0284c7, 
      roughness: 0.2, 
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4 
    });
    const maskMesh = new THREE.Mesh(maskGeom, maskMat);
    maskMesh.position.set(0, 0.16, 0.12);
    this.head.add(maskMesh);
    this.maskMeshes.push(maskMesh);

    this.headgearGroup = new THREE.Group();
    this.head.add(this.headgearGroup);

    // Arms (Left & Right)
    const upperArmGeom = new THREE.BoxGeometry(0.14, 0.3, 0.14);
    const forearmGeom = new THREE.BoxGeometry(0.12, 0.28, 0.12);
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    // Left Arm
    this.leftUpperArm = new THREE.Group();
    this.leftUpperArm.position.set(-0.28, 0.32, 0);
    this.chest.add(this.leftUpperArm);
    const lArmMesh = new THREE.Mesh(upperArmGeom, shirtMat);
    lArmMesh.position.y = -0.15;
    lArmMesh.castShadow = true;
    this.leftUpperArm.add(lArmMesh);
    this.shirtMeshes.push(lArmMesh);

    this.leftForearm = new THREE.Group();
    this.leftForearm.position.y = -0.3;
    this.leftUpperArm.add(this.leftForearm);
    const lForearmMesh = new THREE.Mesh(forearmGeom, gloveMat);
    lForearmMesh.position.y = -0.14;
    lForearmMesh.castShadow = true;
    this.leftForearm.add(lForearmMesh);
    this.glovesMeshes.push(lForearmMesh);

    // Right Arm
    this.rightUpperArm = new THREE.Group();
    this.rightUpperArm.position.set(0.28, 0.32, 0);
    this.chest.add(this.rightUpperArm);
    const rArmMesh = new THREE.Mesh(upperArmGeom, shirtMat);
    rArmMesh.position.y = -0.15;
    rArmMesh.castShadow = true;
    this.rightUpperArm.add(rArmMesh);
    this.shirtMeshes.push(rArmMesh);

    this.rightForearm = new THREE.Group();
    this.rightForearm.position.y = -0.3;
    this.rightUpperArm.add(this.rightForearm);
    const rForearmMesh = new THREE.Mesh(forearmGeom, gloveMat);
    rForearmMesh.position.y = -0.14;
    rForearmMesh.castShadow = true;
    this.rightForearm.add(rForearmMesh);
    this.glovesMeshes.push(rForearmMesh);

    // Legs (Left & Right)
    const thighGeom = new THREE.BoxGeometry(0.16, 0.42, 0.16);
    const shinGeom = new THREE.BoxGeometry(0.14, 0.4, 0.14);
    const shoeGeom = new THREE.BoxGeometry(0.16, 0.12, 0.26);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

    // Left Leg
    this.leftThigh = new THREE.Group();
    this.leftThigh.position.set(-0.14, -0.05, 0);
    this.hips.add(this.leftThigh);
    const lThighMesh = new THREE.Mesh(thighGeom, pantsMat);
    lThighMesh.position.y = -0.21;
    lThighMesh.castShadow = true;
    this.leftThigh.add(lThighMesh);
    this.pantsMeshes.push(lThighMesh);

    this.leftShin = new THREE.Group();
    this.leftShin.position.y = -0.42;
    this.leftThigh.add(this.leftShin);
    const lShinMesh = new THREE.Mesh(shinGeom, pantsMat);
    lShinMesh.position.y = -0.2;
    lShinMesh.castShadow = true;
    this.leftShin.add(lShinMesh);
    this.pantsMeshes.push(lShinMesh);

    const lShoeMesh = new THREE.Mesh(shoeGeom, shoeMat);
    lShoeMesh.position.set(0, -0.38, 0.05);
    lShoeMesh.castShadow = true;
    this.leftShin.add(lShoeMesh);
    this.shoesMeshes.push(lShoeMesh);

    // Right Leg
    this.rightThigh = new THREE.Group();
    this.rightThigh.position.set(0.14, -0.05, 0);
    this.hips.add(this.rightThigh);
    const rThighMesh = new THREE.Mesh(thighGeom, pantsMat);
    rThighMesh.position.y = -0.21;
    rThighMesh.castShadow = true;
    this.rightThigh.add(rThighMesh);
    this.pantsMeshes.push(rThighMesh);

    this.rightShin = new THREE.Group();
    this.rightShin.position.y = -0.42;
    this.rightThigh.add(this.rightShin);
    const rShinMesh = new THREE.Mesh(shinGeom, pantsMat);
    rShinMesh.position.y = -0.2;
    rShinMesh.castShadow = true;
    this.rightShin.add(rShinMesh);
    this.pantsMeshes.push(rShinMesh);

    const rShoeMesh = new THREE.Mesh(shoeGeom, shoeMat);
    rShoeMesh.position.set(0, -0.38, 0.05);
    rShoeMesh.castShadow = true;
    this.rightShin.add(rShoeMesh);
    this.shoesMeshes.push(rShoeMesh);

    // Build neon speed trail
    this.setupSpeedTrail();
  }

  private setupSpeedTrail() {
    const maxTrailPoints = 16;
    for (let i = 0; i < maxTrailPoints; i++) {
      this.trailPoints.push(new THREE.Vector3());
    }
    const geom = new THREE.BufferGeometry().setFromPoints(this.trailPoints);
    this.trailMaterial = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
      linewidth: 3,
    });
    this.trailLine = new THREE.Line(geom, this.trailMaterial);
    this.trailLine.frustumCulled = false;
  }

  public getTrailMesh(): THREE.Line | null {
    return this.trailLine;
  }

  public applyCustomization(c: PlayerCustomization) {
    const sCol = new THREE.Color(c.shirtColor);
    const pCol = new THREE.Color(c.pantsColor);
    const shCol = new THREE.Color(c.shoesColor);
    const gCol = new THREE.Color(c.glovesColor);
    const mCol = new THREE.Color(c.maskColor);
    const hCol = new THREE.Color(c.hairColor);
    const trCol = new THREE.Color(c.trailColor);

    this.shirtMeshes.forEach(m => (m.material as THREE.MeshStandardMaterial).color.copy(sCol));
    this.pantsMeshes.forEach(m => (m.material as THREE.MeshStandardMaterial).color.copy(pCol));
    this.shoesMeshes.forEach(m => (m.material as THREE.MeshStandardMaterial).color.copy(shCol));
    this.glovesMeshes.forEach(m => (m.material as THREE.MeshStandardMaterial).color.copy(gCol));
    this.maskMeshes.forEach(m => {
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.color.copy(mCol);
      mat.emissive.copy(mCol);
    });
    this.hairMeshes.forEach(m => (m.material as THREE.MeshStandardMaterial).color.copy(hCol));
    if (this.trailMaterial) {
      this.trailMaterial.color.copy(trCol);
    }

    // Update headgear accessory
    while (this.headgearGroup.children.length > 0) {
      this.headgearGroup.remove(this.headgearGroup.children[0]);
    }

    if (c.headgear === 'headband') {
      const bandGeom = new THREE.BoxGeometry(0.38, 0.08, 0.38);
      const bandMat = new THREE.MeshStandardMaterial({ color: sCol, roughness: 0.5 });
      const band = new THREE.Mesh(bandGeom, bandMat);
      band.position.set(0, 0.22, 0);
      this.headgearGroup.add(band);
    } else if (c.headgear === 'cap') {
      const capGeom = new THREE.CylinderGeometry(0.19, 0.21, 0.1, 16);
      const capBrimGeom = new THREE.BoxGeometry(0.28, 0.03, 0.22);
      const capMat = new THREE.MeshStandardMaterial({ color: pCol, roughness: 0.6 });
      const cap = new THREE.Mesh(capGeom, capMat);
      cap.position.set(0, 0.3, 0);
      const brim = new THREE.Mesh(capBrimGeom, capMat);
      brim.position.set(0, 0.26, 0.18);
      this.headgearGroup.add(cap);
      this.headgearGroup.add(brim);
    } else if (c.headgear === 'ninja_hood') {
      const hoodGeom = new THREE.SphereGeometry(0.24, 16, 16);
      const hoodMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const hood = new THREE.Mesh(hoodGeom, hoodMat);
      hood.position.set(0, 0.18, -0.04);
      this.headgearGroup.add(hood);
    }
  }

  public updateAnimation(
    state: MovementState, 
    speed: number, 
    delta: number, 
    worldPos: THREE.Vector3
  ) {
    this.currentState = state;
    this.animTimer += delta * (state === 'sprint' ? 14 : state === 'run' ? 9 : 5);

    // Reset base transforms lerped
    const lerpFactor = Math.min(1.0, delta * 15);

    // Default target rotations
    let targetHipsY = 0.95;
    let targetHipsRotX = 0;
    let targetHipsRotZ = 0;
    let targetSpineRotX = 0;
    let targetChestRotY = 0;
    let targetLThighX = 0;
    let targetRThighX = 0;
    let targetLShinX = 0;
    let targetRShinX = 0;
    let targetLArmX = 0;
    let targetRArmX = 0;
    let targetLArmZ = 0;
    let targetRArmZ = 0;
    let targetLForearmX = 0;
    let targetRForearmX = 0;

    switch (state) {
      case 'idle': {
        const breath = Math.sin(this.animTimer * 0.4) * 0.03;
        targetHipsY = 0.95 + breath;
        targetChestRotY = Math.sin(this.animTimer * 0.2) * 0.04;
        targetLArmZ = 0.1;
        targetRArmZ = -0.1;
        targetLArmX = 0.05;
        targetRArmX = 0.05;
        break;
      }

      case 'walk':
      case 'run':
      case 'sprint': {
        const isSprint = state === 'sprint';
        const stride = Math.sin(this.animTimer);
        const armStride = Math.cos(this.animTimer);
        const amp = isSprint ? 1.1 : (state === 'run' ? 0.8 : 0.45);

        // Forward lean
        targetHipsRotX = isSprint ? 0.35 : 0.18;
        targetSpineRotX = isSprint ? 0.25 : 0.12;

        // Running leg drive
        targetLThighX = stride * amp;
        targetRThighX = -stride * amp;

        targetLShinX = stride > 0 ? stride * amp * 1.2 : 0.1;
        targetRShinX = stride < 0 ? -stride * amp * 1.2 : 0.1;

        // Pumping arms
        targetLArmX = -armStride * amp * 1.2;
        targetRArmX = armStride * amp * 1.2;
        targetLForearmX = -0.6 - Math.abs(armStride) * 0.4;
        targetRForearmX = -0.6 - Math.abs(armStride) * 0.4;

        targetHipsY = 0.95 + Math.abs(Math.sin(this.animTimer * 2)) * (isSprint ? 0.09 : 0.05);
        break;
      }

      case 'jump': {
        // Tucked athletic leap pose
        targetHipsY = 1.0;
        targetLThighX = -0.6;
        targetRThighX = 0.3;
        targetLShinX = 0.8;
        targetRShinX = 0.5;
        targetLArmX = -1.2;
        targetRArmX = -0.9;
        targetLArmZ = 0.3;
        targetRArmZ = -0.3;
        break;
      }

      case 'fall': {
        // Free fall aerodynamic spread
        targetHipsY = 0.95;
        targetLThighX = 0.2;
        targetRThighX = -0.2;
        targetLShinX = 0.4;
        targetRShinX = 0.4;
        targetLArmX = 0.4;
        targetRArmX = 0.4;
        targetLArmZ = 0.7;
        targetRArmZ = -0.7;
        targetHipsRotX = 0.15;
        break;
      }

      case 'wall_run_left': {
        // Tilted left running against wall on left side
        targetHipsRotZ = 0.32;
        targetHipsRotX = 0.2;
        const stride = Math.sin(this.animTimer * 1.3);
        targetLThighX = stride * 0.9;
        targetRThighX = -stride * 0.9;
        targetLArmX = -1.0;
        targetRArmX = 0.8;
        targetLArmZ = 0.4;
        break;
      }

      case 'wall_run_right': {
        // Tilted right running against wall on right side
        targetHipsRotZ = -0.32;
        targetHipsRotX = 0.2;
        const stride = Math.sin(this.animTimer * 1.3);
        targetLThighX = stride * 0.9;
        targetRThighX = -stride * 0.9;
        targetLArmX = 0.8;
        targetRArmX = -1.0;
        targetRArmZ = -0.4;
        break;
      }

      case 'ledge_grab': {
        // Hanging onto edge: arms up, body dangling
        targetHipsY = 0.7;
        targetLArmX = -2.8;
        targetRArmX = -2.8;
        targetLForearmX = -0.2;
        targetRForearmX = -0.2;
        targetLThighX = 0.3;
        targetRThighX = 0.1;
        targetLShinX = 0.5;
        targetRShinX = 0.3;
        break;
      }

      case 'pull_up': {
        this.pullUpProgress = Math.min(1.0, this.pullUpProgress + delta * 3.5);
        targetHipsY = 0.7 + this.pullUpProgress * 0.6;
        targetLArmX = -2.8 + this.pullUpProgress * 2.0;
        targetRArmX = -2.8 + this.pullUpProgress * 2.0;
        targetLThighX = -0.5 * this.pullUpProgress;
        targetRThighX = 0.2 * this.pullUpProgress;
        break;
      }

      case 'slide': {
        // Low baseball slide
        targetHipsY = 0.45;
        targetHipsRotX = -0.7;
        targetLThighX = 1.2;
        targetLShinX = 0.1;
        targetRThighX = -0.8;
        targetRShinX = 1.3;
        targetLArmX = -0.6;
        targetRArmX = 0.5;
        targetLArmZ = 0.5;
        targetRArmZ = -0.5;
        break;
      }

      case 'roll': {
        // Landing roll rotation
        this.rollAngle += delta * 15;
        targetHipsY = 0.5;
        targetLThighX = 1.2;
        targetRThighX = 1.2;
        targetLShinX = 1.4;
        targetRShinX = 1.4;
        targetLArmX = -1.5;
        targetRArmX = -1.5;
        break;
      }

      case 'victory': {
        // Triumphant double arm fist pump
        targetHipsY = 0.95;
        targetLArmX = -2.7;
        targetRArmX = -2.7;
        targetLArmZ = 0.5;
        targetRArmZ = -0.5;
        targetSpineRotX = -0.15;
        break;
      }
    }

    if (state !== 'pull_up') {
      this.pullUpProgress = 0;
    }

    // Apply smooth interpolation
    this.hips.position.y = THREE.MathUtils.lerp(this.hips.position.y, targetHipsY, lerpFactor);
    this.hips.rotation.x = THREE.MathUtils.lerp(this.hips.rotation.x, targetHipsRotX, lerpFactor);
    this.hips.rotation.z = THREE.MathUtils.lerp(this.hips.rotation.z, targetHipsRotZ, lerpFactor);

    if (state === 'roll') {
      this.hips.rotation.x = this.rollAngle;
    }

    this.spine.rotation.x = THREE.MathUtils.lerp(this.spine.rotation.x, targetSpineRotX, lerpFactor);
    this.chest.rotation.y = THREE.MathUtils.lerp(this.chest.rotation.y, targetChestRotY, lerpFactor);

    this.leftThigh.rotation.x = THREE.MathUtils.lerp(this.leftThigh.rotation.x, targetLThighX, lerpFactor);
    this.rightThigh.rotation.x = THREE.MathUtils.lerp(this.rightThigh.rotation.x, targetRThighX, lerpFactor);

    this.leftShin.rotation.x = THREE.MathUtils.lerp(this.leftShin.rotation.x, targetLShinX, lerpFactor);
    this.rightShin.rotation.x = THREE.MathUtils.lerp(this.rightShin.rotation.x, targetRShinX, lerpFactor);

    this.leftUpperArm.rotation.x = THREE.MathUtils.lerp(this.leftUpperArm.rotation.x, targetLArmX, lerpFactor);
    this.rightUpperArm.rotation.x = THREE.MathUtils.lerp(this.rightUpperArm.rotation.x, targetRArmX, lerpFactor);

    this.leftUpperArm.rotation.z = THREE.MathUtils.lerp(this.leftUpperArm.rotation.z, targetLArmZ, lerpFactor);
    this.rightUpperArm.rotation.z = THREE.MathUtils.lerp(this.rightUpperArm.rotation.z, targetRArmZ, lerpFactor);

    this.leftForearm.rotation.x = THREE.MathUtils.lerp(this.leftForearm.rotation.x, targetLForearmX, lerpFactor);
    this.rightForearm.rotation.x = THREE.MathUtils.lerp(this.rightForearm.rotation.x, targetRForearmX, lerpFactor);

    // Update Speed Trail when sprinting, wall running or sliding
    if (this.trailLine && this.trailMaterial) {
      const showTrail = speed > 13 || state === 'wall_run_left' || state === 'wall_run_right' || state === 'slide';
      this.trailMaterial.opacity = showTrail ? 0.65 : 0.0;

      if (showTrail) {
        // Shift trail points
        for (let i = this.trailPoints.length - 1; i > 0; i--) {
          this.trailPoints[i].copy(this.trailPoints[i - 1]);
        }
        this.trailPoints[0].copy(worldPos).add(new THREE.Vector3(0, 0.9, 0));
        const posAttr = this.trailLine.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < this.trailPoints.length; i++) {
          posAttr.setXYZ(i, this.trailPoints[i].x, this.trailPoints[i].y, this.trailPoints[i].z);
        }
        posAttr.needsUpdate = true;
      }
    }
  }

  public resetRoll() {
    this.rollAngle = 0;
  }
}
