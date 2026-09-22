import { GameSettings, PlayerCustomization } from '../types';

export const PHYSICS = {
  GRAVITY: 28.0,
  WALK_SPEED: 7.0,
  RUN_SPEED: 11.0,
  SPRINT_SPEED: 16.5,
  SLIDE_SPEED: 18.0,
  SLIDE_DECELERATION: 12.0,
  AIR_ACCELERATION: 18.0,
  GROUND_ACCELERATION: 45.0,
  GROUND_FRICTION: 12.0,
  JUMP_VELOCITY: 12.8,
  DOUBLE_JUMP_VELOCITY: 11.0,
  WALL_RUN_GRAVITY: 4.5,
  WALL_RUN_SPEED: 13.5,
  WALL_RUN_DURATION: 1.8,
  WALL_JUMP_HORIZONTAL: 10.5,
  WALL_JUMP_VERTICAL: 11.5,
  LEDGE_GRAB_DISTANCE: 1.2,
  MAX_FALL_SPEED: 45.0,
  ROLL_THRESHOLD_FALL_VELOCITY: -16.0,
  DEATH_FALL_Y: -20.0,
  PLAYER_HEIGHT: 1.8,
  PLAYER_RADIUS: 0.45,
  SLIDE_HEIGHT: 0.9,
};

export const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'high',
  targetFPS: 60,
  masterVolume: 0.8,
  sfxVolume: 0.85,
  musicVolume: 0.65,
  mouseSensitivity: 1.0,
  invertY: false,
  fov: 75,
  showMobileControls: true,
  mobileButtonScale: 1.0,
  mobileButtonOpacity: 0.75,
  motionBlur: true,
  cameraShake: true,
};

export const DEFAULT_CUSTOMIZATION: PlayerCustomization = {
  shirtColor: '#ef4444', // Red athletic parkour hoodie
  pantsColor: '#1e293b', // Slate dark track pants
  shoesColor: '#f59e0b', // Amber running sneakers
  glovesColor: '#0f172a', // Fingerless black gloves
  maskColor: '#0284c7', // Neon cyan runner bandana/mask
  hairColor: '#f3f4f6', // Platinum white athletic hair
  trailColor: '#06b6d4', // Cyan neon speed trail
  headgear: 'cyber_mask',
};

export const COLOR_PALETTES = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#ffffff', '#94a3b8', '#334155', '#0f172a', '#172554'
];

export const HEADGEAR_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'headband', label: 'Runner Headband' },
  { id: 'cap', label: 'Street Cap' },
  { id: 'cyber_mask', label: 'Cyber Visor' },
  { id: 'ninja_hood', label: 'Shinobi Hood' },
] as const;
