import React, { useRef, useState, useEffect } from 'react';
import { 
  Pause, 
  Flag, 
  Clock, 
  Coins, 
  Footprints, 
  ArrowUp, 
  Zap, 
  RotateCcw,
  Sparkles,
  ChevronUp
} from 'lucide-react';
import { LevelDefinition, MovementState, GameSettings } from '../types';
import { PlayerInput } from '../game/physicsEngine';

interface HUDProps {
  level: LevelDefinition;
  time: number;
  altitude: number;
  speed: number;
  state: MovementState;
  checkpointId: number | null;
  coins: number;
  settings: GameSettings;
  onPause: () => void;
  onRespawn: () => void;
  playerInput: PlayerInput;
  isMobileTouch: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  time,
  altitude,
  speed,
  state,
  checkpointId,
  coins,
  settings,
  onPause,
  onRespawn,
  playerInput,
  isMobileTouch,
}) => {
  // Format MM:SS.ms
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.floor((time % 1) * 100);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;

  const altPercent = Math.min(100, Math.max(0, (altitude / level.height) * 100));

  // Virtual Joystick State
  const joystickRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    setIsDraggingJoystick(true);
    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;
    setStickPos({ x: stickX, y: stickY });

    // Normalize -1 to 1 for physics
    playerInput.moveRight = stickX / maxRadius;
    playerInput.moveForward = -(stickY / maxRadius);
  };

  const handleJoystickTouchEnd = () => {
    setIsDraggingJoystick(false);
    setStickPos({ x: 0, y: 0 });
    playerInput.moveForward = 0;
    playerInput.moveRight = 0;
  };

  // State Badge text & color
  const getStateBadge = () => {
    switch (state) {
      case 'sprint':
        return { text: 'SPRINTING', color: 'bg-amber-500/80 text-black border-amber-400' };
      case 'wall_run_left':
      case 'wall_run_right':
        return { text: 'WALL RUN', color: 'bg-cyan-500/80 text-black border-cyan-400' };
      case 'slide':
        return { text: 'SLIDING', color: 'bg-emerald-500/80 text-black border-emerald-400' };
      case 'ledge_grab':
        return { text: 'LEDGE HANG', color: 'bg-purple-500/80 text-white border-purple-400' };
      case 'pull_up':
        return { text: 'PULLING UP', color: 'bg-purple-500/80 text-white border-purple-400' };
      case 'jump':
        return { text: 'AIRBORNE', color: 'bg-blue-500/80 text-white border-blue-400' };
      case 'roll':
        return { text: 'ROLL RECOVERY', color: 'bg-orange-500/80 text-black border-orange-400' };
      default:
        return null;
    }
  };

  const stateBadge = getStateBadge();

  return (
    <div id="game-hud" className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Level Name & Badge */}
        <div className="flex flex-col gap-1 bg-neutral-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-neutral-700/60 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded tracking-wider uppercase">
              LEVEL {level.id}
            </span>
            <h2 className="text-lg md:text-xl font-bold font-display text-white tracking-wide">
              {level.name}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1 text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              {coins} / {level.totalCoins}
            </span>
            <span>
              CP: {checkpointId ? `${checkpointId} / ${level.checkpointsCount}` : `0 / ${level.checkpointsCount}`}
            </span>
          </div>
        </div>

        {/* Speedrun Timer & Target */}
        <div className="flex flex-col items-center bg-neutral-900/85 backdrop-blur-md px-5 py-2.5 rounded-xl border border-neutral-700/60 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>TIME</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-white drop-shadow">
            {formattedTime}
          </div>
          <div className="text-[10px] text-neutral-400 font-semibold mt-0.5">
            3★ TARGET: {level.targetTime3Stars}s
          </div>
        </div>

        {/* Pause & Quick Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="hud-respawn-btn"
            onClick={onRespawn}
            title="Respawn at checkpoint (R)"
            className="bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white p-2.5 rounded-xl border border-neutral-700/60 shadow-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            id="hud-pause-btn"
            onClick={onPause}
            className="bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white p-2.5 rounded-xl border border-neutral-700/60 shadow-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle Center Crosshair & Active State Pill */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Subtle Crosshair for precision parkour leap targeting */}
        <div className="w-2 h-2 rounded-full border border-white/50 bg-white/30" />

        {/* Active Movement State Notification */}
        {stateBadge && (
          <div className={`mt-12 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider border shadow-lg uppercase animate-pulse ${stateBadge.color}`}>
            {stateBadge.text}
          </div>
        )}
      </div>

      {/* Altitude Vertical Progress Bar (Right Side) */}
      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-neutral-900/80 backdrop-blur-md p-2 rounded-2xl border border-neutral-700/60 shadow-xl pointer-events-none">
        <Flag className="w-4 h-4 text-amber-400" />
        <div className="w-2 h-36 md:h-48 bg-neutral-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-neutral-700">
          <div 
            className="w-full bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-150"
            style={{ height: `${altPercent}%` }}
          />
        </div>
        <div className="text-[11px] font-bold text-neutral-300">
          {Math.round(altitude)}m
        </div>
      </div>

      {/* Bottom Area: Controls & Mobile Virtual Touch Buttons */}
      <div className="w-full flex items-end justify-between">
        {/* Desktop Controls Hint (hidden when mobile touch active) */}
        {!isMobileTouch && (
          <div className="hidden md:flex items-center gap-3 bg-neutral-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-neutral-800 text-xs text-neutral-300">
            <span className="font-semibold text-amber-400">WASD</span> Move
            <span className="text-neutral-600">|</span>
            <span className="font-semibold text-amber-400">SPACE</span> Jump
            <span className="text-neutral-600">|</span>
            <span className="font-semibold text-amber-400">SHIFT</span> Sprint
            <span className="text-neutral-600">|</span>
            <span className="font-semibold text-amber-400">CTRL</span> Slide
            <span className="text-neutral-600">|</span>
            <span className="font-semibold text-amber-400">E</span> Grab / Pull
            <span className="text-neutral-600">|</span>
            <span className="font-semibold text-amber-400">R</span> Respawn
          </div>
        )}

        {/* Speedometer */}
        <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{speed.toFixed(1)} m/s</span>
        </div>

        {/* Mobile Virtual Joystick & Touch Controls */}
        {settings.showMobileControls && (
          <div 
            className="w-full flex items-end justify-between pointer-events-auto"
            style={{ 
              opacity: settings.mobileButtonOpacity,
              transform: `scale(${settings.mobileButtonScale})`,
              transformOrigin: 'bottom center'
            }}
          >
            {/* Virtual Analog Joystick */}
            <div
              id="virtual-joystick"
              ref={joystickRef}
              onTouchStart={handleJoystickTouchStart}
              onTouchMove={handleJoystickMove}
              onTouchEnd={handleJoystickTouchEnd}
              className="relative w-28 h-28 rounded-full bg-neutral-900/60 border-2 border-neutral-600 backdrop-blur-sm flex items-center justify-center touch-none select-none cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-full bg-amber-500/80 border border-amber-300 shadow-lg transform transition-transform pointer-events-none"
                style={{
                  transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
                }}
              />
            </div>

            {/* Mobile Parkour Action Buttons */}
            <div className="flex flex-col gap-2 items-end">
              {/* Row 1: Slide & Sprint */}
              <div className="flex gap-2">
                <button
                  id="btn-mobile-slide"
                  onTouchStart={(e) => { e.preventDefault(); playerInput.slide = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); playerInput.slide = false; }}
                  className="w-14 h-14 rounded-full bg-neutral-800/80 border border-neutral-600 text-white font-bold text-xs flex flex-col items-center justify-center active:bg-amber-500 active:text-black shadow-lg"
                >
                  <ChevronUp className="w-5 h-5 rotate-180" />
                  SLIDE
                </button>

                <button
                  id="btn-mobile-sprint"
                  onTouchStart={(e) => { e.preventDefault(); playerInput.sprint = !playerInput.sprint; }}
                  className={`w-14 h-14 rounded-full border text-white font-bold text-xs flex flex-col items-center justify-center shadow-lg transition-colors ${
                    playerInput.sprint ? 'bg-amber-500 text-black border-amber-300' : 'bg-neutral-800/80 border-neutral-600'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  SPRINT
                </button>
              </div>

              {/* Row 2: Grab & Jump */}
              <div className="flex gap-2">
                <button
                  id="btn-mobile-grab"
                  onTouchStart={(e) => { e.preventDefault(); playerInput.interact = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); playerInput.interact = false; }}
                  className="w-14 h-14 rounded-full bg-neutral-800/80 border border-neutral-600 text-white font-bold text-xs flex flex-col items-center justify-center active:bg-purple-600 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  GRAB
                </button>

                <button
                  id="btn-mobile-jump"
                  onTouchStart={(e) => { 
                    e.preventDefault(); 
                    playerInput.jump = true; 
                    playerInput.jumpJustPressed = true; 
                  }}
                  onTouchEnd={(e) => { e.preventDefault(); playerInput.jump = false; }}
                  className="w-18 h-18 rounded-full bg-amber-500 border-2 border-amber-300 text-black font-extrabold text-sm flex flex-col items-center justify-center active:bg-yellow-300 shadow-2xl"
                >
                  <ArrowUp className="w-7 h-7" />
                  JUMP
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
