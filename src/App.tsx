import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameStorage } from './game/storage';
import { LEVELS } from './game/levelsData';
import { 
  LevelDefinition, 
  GameSettings, 
  PlayerCustomization, 
  GameMode, 
  MovementState, 
  LevelStats, 
  LevelRecord 
} from './types';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { PauseModal } from './components/PauseModal';
import { DeathModal } from './components/DeathModal';
import { VictoryModal } from './components/VictoryModal';
import { LevelSelect } from './components/LevelSelect';
import { Customizer } from './components/Customizer';
import { Leaderboard } from './components/Leaderboard';
import { SettingsModal } from './components/SettingsModal';

type AppScreen = 
  | 'menu' 
  | 'playing' 
  | 'paused' 
  | 'dead' 
  | 'victory' 
  | 'level_select' 
  | 'customizer' 
  | 'leaderboard' 
  | 'settings';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // App & Flow State
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [gameMode, setGameMode] = useState<GameMode>('3D');

  // Dynamic HUD States
  const [gameTime, setGameTime] = useState<number>(0);
  const [altitude, setAltitude] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [movementState, setMovementState] = useState<MovementState>('idle');
  const [checkpointId, setCheckpointId] = useState<number | null>(null);
  const [levelCoins, setLevelCoins] = useState<number>(0);

  // Victory / Death Data
  const [victoryData, setVictoryData] = useState<{
    time: number;
    deaths: number;
    coins: number;
    stars: number;
    isNewRecord: boolean;
    bestTime: number | null;
  } | null>(null);

  const [deathAltitude, setDeathAltitude] = useState<number>(0);

  // Persistent User Data
  const [settings, setSettings] = useState<GameSettings>(() => GameStorage.getSettings());
  const [customization, setCustomization] = useState<PlayerCustomization>(() => GameStorage.getCustomization());
  const [levelsStats, setLevelsStats] = useState<Record<number, LevelStats>>(() => GameStorage.getLevelsStats());
  const [totalCoins, setTotalCoins] = useState<number>(() => GameStorage.getCoins());
  const [records, setRecords] = useState<LevelRecord[]>(() => GameStorage.getRecords());
  const [isMobileTouch, setIsMobileTouch] = useState<boolean>(false);

  const currentLevel: LevelDefinition = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Initialize Three.js Game Engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Detect touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobileTouch(isTouch);

    const engine = new GameEngine(
      canvasContainerRef.current,
      settings,
      customization,
      {
        onTimeUpdate: (t) => setGameTime(t),
        onAltitudeUpdate: (a) => setAltitude(a),
        onSpeedUpdate: (s) => setSpeed(s),
        onStateUpdate: (st) => setMovementState(st),
        onCheckpointReached: (cpId) => setCheckpointId(cpId),
        onCoinCollected: (cId, total) => {
          setLevelCoins(total);
          setTotalCoins(GameStorage.addCoins(10));
        },
        onDeath: (alt) => {
          setDeathAltitude(alt);
          setScreen('dead');
        },
        onVictory: (time, deaths, coins) => {
          const result = GameStorage.saveLevelCompletion(currentLevelId, time, deaths, coins);
          const updatedStats = GameStorage.getLevelsStats();
          setLevelsStats(updatedStats);
          setTotalCoins(GameStorage.getCoins());
          setRecords(GameStorage.getRecords());

          setVictoryData({
            time,
            deaths,
            coins,
            stars: result.starsEarned,
            isNewRecord: result.isNewRecord,
            bestTime: updatedStats[currentLevelId]?.bestTime || time,
          });

          setScreen('victory');
        },
      }
    );

    engineRef.current = engine;
    engine.loadLevel(currentLevel);
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update Game Mode
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setGameMode(gameMode);
    }
  }, [gameMode]);

  // Update Settings
  const handleUpdateSettings = useCallback((updated: GameSettings) => {
    setSettings(updated);
    GameStorage.saveSettings(updated);
    if (engineRef.current) {
      engineRef.current.applySettings(updated);
    }
  }, []);

  // Update Customization
  const handleUpdateCustomization = useCallback((updated: PlayerCustomization) => {
    setCustomization(updated);
    GameStorage.saveCustomization(updated);
    if (engineRef.current) {
      engineRef.current.applyCustomization(updated);
    }
  }, []);

  // Level Selection
  const handleSelectLevel = useCallback((levelId: number) => {
    setCurrentLevelId(levelId);
    setCheckpointId(null);
    setLevelCoins(0);
    setGameTime(0);
    setScreen('playing');

    const lvl = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    if (engineRef.current) {
      engineRef.current.loadLevel(lvl);
      engineRef.current.pause(false);
    }
  }, []);

  // Keyboard Input Handlers
  useEffect(() => {
    const keysDown = new Set<string>();

    const updateMovementVector = () => {
      if (!engineRef.current) return;
      let forward = 0;
      let right = 0;

      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) forward += 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) forward -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) right += 1;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) right -= 1;

      engineRef.current.input.moveForward = forward;
      engineRef.current.input.moveRight = right;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      keysDown.add(e.code);

      if (!engineRef.current) return;

      if (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'KeyA' || e.code === 'KeyD' ||
          e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        updateMovementVector();
      }

      if (e.code === 'Space') {
        engineRef.current.input.jump = true;
        engineRef.current.input.jumpJustPressed = true;
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engineRef.current.input.sprint = true;
      }

      if (e.code === 'ControlLeft' || e.code === 'ControlRight' || e.code === 'KeyC') {
        engineRef.current.input.slide = true;
      }

      if (e.code === 'KeyE') {
        engineRef.current.input.interact = true;
      }

      if (e.code === 'KeyR' && screen === 'playing') {
        engineRef.current.respawn();
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (screen === 'playing') {
          engineRef.current.pause(true);
          setScreen('paused');
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
        } else if (screen === 'paused') {
          engineRef.current.pause(false);
          setScreen('playing');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      if (!engineRef.current) return;

      if (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'KeyA' || e.code === 'KeyD' ||
          e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        updateMovementVector();
      }

      if (e.code === 'Space') {
        engineRef.current.input.jump = false;
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engineRef.current.input.sprint = false;
      }

      if (e.code === 'ControlLeft' || e.code === 'ControlRight' || e.code === 'KeyC') {
        engineRef.current.input.slide = false;
      }

      if (e.code === 'KeyE') {
        engineRef.current.input.interact = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  // Pointer Lock & Mouse Look for 3D Camera
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement && screen === 'playing' && engineRef.current) {
        engineRef.current.handleMouseMove(e.movementX, e.movementY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [screen]);

  // Touch Camera Drag for Mobile (right side of screen)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (screen !== 'playing') return;
    const touch = e.touches[0];
    // Only capture touch for camera if it starts on the right half of the screen
    if (touch.clientX > window.innerWidth * 0.4) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || screen !== 'playing' || !engineRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    engineRef.current.handleTouchPan(dx, dy);
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleCanvasClick = () => {
    if (screen === 'playing' && !document.pointerLockElement && !isMobileTouch) {
      canvasContainerRef.current?.requestPointerLock();
    }
  };

  // Actions
  const handleStartPlay = () => {
    // Find highest unlocked level
    let highestUnlocked = 1;
    for (let i = 1; i <= 20; i++) {
      if (levelsStats[i]?.unlocked) highestUnlocked = i;
    }
    handleSelectLevel(highestUnlocked);
  };

  const handleResume = () => {
    setScreen('playing');
    if (engineRef.current) {
      engineRef.current.pause(false);
    }
    if (!isMobileTouch) {
      canvasContainerRef.current?.requestPointerLock();
    }
  };

  const handleRestart = () => {
    setCheckpointId(null);
    setLevelCoins(0);
    setGameTime(0);
    setScreen('playing');
    if (engineRef.current) {
      engineRef.current.restartLevel();
      engineRef.current.pause(false);
    }
    if (!isMobileTouch) {
      canvasContainerRef.current?.requestPointerLock();
    }
  };

  const handleRespawn = () => {
    setScreen('playing');
    if (engineRef.current) {
      engineRef.current.respawn();
      engineRef.current.pause(false);
    }
    if (!isMobileTouch) {
      canvasContainerRef.current?.requestPointerLock();
    }
  };

  const handleNextLevel = () => {
    if (currentLevelId < 20) {
      handleSelectLevel(currentLevelId + 1);
    } else {
      setScreen('level_select');
    }
  };

  const handleReturnToMainMenu = () => {
    setScreen('menu');
    if (engineRef.current) {
      engineRef.current.pause(false);
      engineRef.current.loadLevel(LEVELS[0]);
    }
  };

  // Count total stars
  const totalStars = Object.values(levelsStats).reduce((acc, s) => acc + s.stars, 0);
  const unlockedCount = Object.values(levelsStats).filter((s) => s.unlocked).length;

  return (
    <div 
      id="game-root" 
      className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans select-none"
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Three.js Canvas Container */}
      <div 
        ref={canvasContainerRef} 
        id="webgl-canvas-container" 
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* 1. Main Menu Overlay */}
      {screen === 'menu' && (
        <MainMenu
          onPlay={handleStartPlay}
          onLevelSelect={() => setScreen('level_select')}
          onCustomize={() => setScreen('customizer')}
          onLeaderboard={() => setScreen('leaderboard')}
          onSettings={() => setScreen('settings')}
          gameMode={gameMode}
          onToggleGameMode={() => setGameMode((m) => (m === '3D' ? '2D' : '3D'))}
          coins={totalCoins}
          unlockedLevelCount={unlockedCount}
          totalStars={totalStars}
        />
      )}

      {/* 2. Active Game HUD */}
      {screen === 'playing' && engineRef.current && (
        <HUD
          level={currentLevel}
          time={gameTime}
          altitude={altitude}
          speed={speed}
          state={movementState}
          checkpointId={checkpointId}
          coins={levelCoins}
          settings={settings}
          onPause={() => {
            engineRef.current?.pause(true);
            setScreen('paused');
          }}
          onRespawn={handleRespawn}
          playerInput={engineRef.current.input}
          isMobileTouch={isMobileTouch}
        />
      )}

      {/* 3. Pause Screen */}
      {screen === 'paused' && (
        <PauseModal
          level={currentLevel}
          onResume={handleResume}
          onRestart={handleRestart}
          onSettings={() => setScreen('settings')}
          onLevelSelect={() => setScreen('level_select')}
          onMainMenu={handleReturnToMainMenu}
        />
      )}

      {/* 4. Death Screen */}
      {screen === 'dead' && (
        <DeathModal
          level={currentLevel}
          altitude={deathAltitude}
          checkpointId={checkpointId}
          onRespawn={handleRespawn}
          onRestart={handleRestart}
          onMainMenu={handleReturnToMainMenu}
        />
      )}

      {/* 5. Victory Summit Screen */}
      {screen === 'victory' && victoryData && (
        <VictoryModal
          level={currentLevel}
          time={victoryData.time}
          deaths={victoryData.deaths}
          coins={victoryData.coins}
          starsEarned={victoryData.stars}
          isNewRecord={victoryData.isNewRecord}
          bestTime={victoryData.bestTime}
          onNextLevel={handleNextLevel}
          onReplay={handleRestart}
          onLevelSelect={() => setScreen('level_select')}
          hasNextLevel={currentLevelId < 20}
        />
      )}

      {/* 6. Level Select Screen */}
      {screen === 'level_select' && (
        <LevelSelect
          levelsStats={levelsStats}
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen(engineRef.current && !engineRef.current ? 'playing' : 'menu')}
        />
      )}

      {/* 7. Character Customizer */}
      {screen === 'customizer' && (
        <Customizer
          customization={customization}
          onUpdateCustomization={handleUpdateCustomization}
          onBack={() => setScreen('menu')}
          coins={totalCoins}
        />
      )}

      {/* 8. Leaderboard & Records */}
      {screen === 'leaderboard' && (
        <Leaderboard
          levelsStats={levelsStats}
          records={records}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* 9. Settings Screen */}
      {screen === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setScreen(screen === 'settings' && engineRef.current ? 'menu' : 'paused')}
        />
      )}
    </div>
  );
}
