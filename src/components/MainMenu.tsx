import React from 'react';
import { 
  Play, 
  Grid, 
  User, 
  Trophy, 
  Settings as SettingsIcon, 
  Coins, 
  Flame, 
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import { GameMode } from '../types';

interface MainMenuProps {
  onPlay: () => void;
  onLevelSelect: () => void;
  onCustomize: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
  gameMode: GameMode;
  onToggleGameMode: () => void;
  coins: number;
  unlockedLevelCount: number;
  totalStars: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onLevelSelect,
  onCustomize,
  onLeaderboard,
  onSettings,
  gameMode,
  onToggleGameMode,
  coins,
  unlockedLevelCount,
  totalStars,
}) => {
  return (
    <div id="main-menu" className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-10 select-none overflow-y-auto pointer-events-auto bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-transparent">
      {/* Top Bar with Wallet & Stats */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs tracking-wider uppercase">
            <Flame className="w-3.5 h-3.5" />
            HARDCORE 3D PARKOUR
          </span>
          <button
            id="menu-mode-toggle"
            onClick={onToggleGameMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            MODE: {gameMode}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-amber-400 font-bold text-sm shadow-md">
            <Coins className="w-4 h-4" />
            <span>{coins}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-yellow-300 font-bold text-sm shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>{totalStars} ★</span>
          </div>
        </div>
      </div>

      {/* Hero Title & Main Navigation */}
      <div className="flex flex-col max-w-xl my-auto py-8">
        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm tracking-widest uppercase mb-1">
          <Compass className="w-4 h-4" />
          ASCEND TO THE SUMMIT
        </div>

        <h1 className="text-5xl md:text-7xl font-black font-display text-white tracking-tight leading-none drop-shadow-2xl">
          CLIMB TO <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500">
            THE FLAG
          </span>
        </h1>

        <p className="text-sm md:text-base text-neutral-300 mt-4 leading-relaxed font-medium max-w-md">
          Conquer 20 colossal vertical monoliths. Master wall-running, precision ledge grabs, slide jumps, and laser evasion to plant the flag at the peak.
        </p>

        {/* Menu Buttons */}
        <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
          <button
            id="menu-play-btn"
            onClick={onPlay}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-lg rounded-2xl flex items-center justify-between shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer group"
          >
            <span className="flex items-center gap-3">
              <Play className="w-6 h-6 fill-current" />
              PLAY LEVEL {unlockedLevelCount}
            </span>
            <span className="text-xs bg-black/20 px-2.5 py-1 rounded-lg uppercase tracking-wider font-bold">
              START
            </span>
          </button>

          <button
            id="menu-levels-btn"
            onClick={onLevelSelect}
            className="w-full py-3.5 px-5 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-base rounded-2xl flex items-center gap-3 border border-neutral-700/80 shadow-lg transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
          >
            <Grid className="w-5 h-5 text-amber-400" />
            LEVEL SELECT (20 STAGES)
          </button>

          <button
            id="menu-customize-btn"
            onClick={onCustomize}
            className="w-full py-3.5 px-5 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-base rounded-2xl flex items-center gap-3 border border-neutral-700/80 shadow-lg transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
          >
            <User className="w-5 h-5 text-cyan-400" />
            CUSTOMIZE ATHLETE
          </button>

          <button
            id="menu-leaderboard-btn"
            onClick={onLeaderboard}
            className="w-full py-3.5 px-5 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-base rounded-2xl flex items-center gap-3 border border-neutral-700/80 shadow-lg transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            LEADERBOARD & RECORDS
          </button>

          <button
            id="menu-settings-btn"
            onClick={onSettings}
            className="w-full py-3.5 px-5 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-base rounded-2xl flex items-center gap-3 border border-neutral-700/80 shadow-lg transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
          >
            <SettingsIcon className="w-5 h-5 text-neutral-400" />
            SETTINGS & GRAPHICS
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full max-w-7xl mx-auto text-xs text-neutral-400 gap-2 border-t border-neutral-800/80 pt-4">
        <div>
          CLIMB TO THE FLAG • 3D HARDCORE VERTICAL PARKOUR
        </div>
        <div className="flex items-center gap-4">
          <span>Move: <strong className="text-neutral-200">WASD</strong></span>
          <span>Sprint: <strong className="text-neutral-200">Shift</strong></span>
          <span>Jump: <strong className="text-neutral-200">Space</strong></span>
          <span>Wall Run: <strong className="text-neutral-200">Approach Wall</strong></span>
          <span>Ledge Grab: <strong className="text-neutral-200">Auto / E</strong></span>
        </div>
      </div>
    </div>
  );
};
