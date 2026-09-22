import React, { useEffect } from 'react';
import { RotateCcw, Home, Skull, ArrowUp } from 'lucide-react';
import { LevelDefinition } from '../types';

interface DeathModalProps {
  level: LevelDefinition;
  altitude: number;
  checkpointId: number | null;
  onRespawn: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({
  level,
  altitude,
  checkpointId,
  onRespawn,
  onRestart,
  onMainMenu,
}) => {
  // Listen for Spacebar or Enter to instantly respawn!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyR' || e.code === 'Enter') {
        e.preventDefault();
        onRespawn();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRespawn]);

  return (
    <div id="death-modal" className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="bg-neutral-900/95 border-2 border-red-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/20 animate-bounce">
          <Skull className="w-8 h-8" />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold font-display text-red-500 tracking-wider">
            YOU FELL
          </h2>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-semibold">
            {level.name} • SUMMIT {level.height}M
          </p>
        </div>

        <div className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-3 flex justify-around text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Altitude Reached</div>
            <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
              <ArrowUp className="w-4 h-4 text-amber-500" />
              {Math.max(0, Math.round(altitude))}m
            </div>
          </div>
          <div className="w-px bg-neutral-800" />
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Respawn Point</div>
            <div className="text-lg font-bold text-emerald-400">
              {checkpointId ? `Checkpoint ${checkpointId}` : 'Tower Base'}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5 mt-1">
          <button
            id="death-respawn-btn"
            onClick={onRespawn}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            RESPAWN AT CHECKPOINT
            <span className="text-[10px] bg-red-800/80 px-1.5 py-0.5 rounded text-red-200 ml-1">
              SPACE
            </span>
          </button>

          <button
            id="death-restart-btn"
            onClick={onRestart}
            className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART FROM GROUND
          </button>

          <button
            id="death-main-menu-btn"
            onClick={onMainMenu}
            className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-semibold rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
