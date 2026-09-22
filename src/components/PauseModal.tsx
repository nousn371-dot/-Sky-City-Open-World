import React from 'react';
import { Play, RotateCcw, Settings, Grid, Home } from 'lucide-react';
import { LevelDefinition } from '../types';

interface PauseModalProps {
  level: LevelDefinition;
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  onResume,
  onRestart,
  onSettings,
  onLevelSelect,
  onMainMenu,
}) => {
  return (
    <div id="pause-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            LEVEL {level.id} • {level.difficulty}
          </span>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-wide mt-1">
            GAME PAUSED
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {level.name}
          </p>
        </div>

        <div className="w-full flex flex-col gap-2.5 mt-2">
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            RESUME
          </button>

          <button
            id="pause-restart-btn"
            onClick={onRestart}
            className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART LEVEL
          </button>

          <button
            id="pause-settings-btn"
            onClick={onSettings}
            className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            SETTINGS
          </button>

          <button
            id="pause-level-select-btn"
            onClick={onLevelSelect}
            className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            LEVEL SELECT
          </button>

          <button
            id="pause-main-menu-btn"
            onClick={onMainMenu}
            className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
