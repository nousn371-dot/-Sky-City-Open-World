export type GameScreen = 'menu' | 'playing' | 'level_select' | 'customize' | 'leaderboard' | 'settings';

export type GameMode = '3D' | '2D';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export type TargetFPS = 30 | 60;

export interface PlayerCustomization {
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
  glovesColor: string;
  maskColor: string;
  hairColor: string;
  trailColor: string;
  headgear: 'none' | 'headband' | 'cap' | 'cyber_mask' | 'ninja_hood';
}

export interface GameSettings {
  graphicsQuality: GraphicsQuality;
  targetFPS: TargetFPS;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  mouseSensitivity: number;
  invertY: boolean;
  fov: number;
  showMobileControls: boolean;
  mobileButtonScale: number;
  mobileButtonOpacity: number;
  motionBlur: boolean;
  cameraShake: boolean;
}

export interface LevelStats {
  unlocked: boolean;
  completed: boolean;
  bestTime: number | null; // seconds
  stars: number; // 0 to 3
  fewestDeaths: number | null;
  coinsCollected: number;
  totalCoins: number;
}

export interface LevelRecord {
  levelId: number;
  time: number;
  deaths: number;
  date: string;
}

export type WeatherType = 'sunny' | 'sunset' | 'night' | 'cyberpunk' | 'rain' | 'storm' | 'fog' | 'industrial' | 'cloudy';

export interface LevelDefinition {
  id: number;
  name: string;
  subtitle: string;
  theme: WeatherType;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme' | 'Hardcore';
  height: number; // meters
  targetTime3Stars: number; // in seconds
  targetTime2Stars: number;
  checkpointsCount: number;
  totalCoins: number;
  ambientLight: number;
  directionalLightColor: string;
  skyColorTop: string;
  skyColorBottom: string;
  fogColor: string;
  fogDensity: number;
  description: string;
}

export type MovementState = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'sprint'
  | 'jump'
  | 'fall'
  | 'wall_run_left'
  | 'wall_run_right'
  | 'ledge_grab'
  | 'pull_up'
  | 'slide'
  | 'roll'
  | 'swing'
  | 'dodge'
  | 'death'
  | 'victory';

export interface CheckpointData {
  id: number;
  position: [number, number, number];
  rotationY: number;
  reached: boolean;
}

export interface CollectibleCoin {
  id: number;
  position: [number, number, number];
  collected: boolean;
  value: number;
}

export interface ObstacleData {
  type: 
    | 'moving_platform'
    | 'rotating_beam'
    | 'falling_platform'
    | 'laser_barrier'
    | 'swing_bar'
    | 'wind_zone'
    | 'disappearing_platform';
  position: [number, number, number];
  size: [number, number, number];
  movementAxis?: 'x' | 'y' | 'z';
  movementRange?: number;
  speed?: number;
  rotationAxis?: 'x' | 'y' | 'z';
  rotationSpeed?: number;
  timerInterval?: number;
  color?: string;
}
