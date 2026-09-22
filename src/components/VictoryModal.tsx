import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Grid, Clock, Coins, Skull, Sparkles } from 'lucide-react';
import { LevelDefinition } from '../types';

interface VictoryModalProps {
  level: LevelDefinition;
  time: number;
  deaths: number;
  coins: number;
  starsEarned: number;
  isNewRecord: boolean;
  bestTime: number | null;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  time,
  deaths,
  coins,
  starsEarned,
  isNewRecord,
  bestTime,
  onNextLevel,
  onReplay,
  onLevelSelect,
  hasNextLevel,
}) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.floor((time % 1) * 100);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;

  const bestMinutes = bestTime ? Math.floor(bestTime / 60) : 0;
  const bestSeconds = bestTime ? Math.floor(bestTime % 60) : 0;
  const bestMilliseconds = bestTime ? Math.floor((bestTime % 1) * 100) : 0;
  const formattedBestTime = bestTime
    ? `${String(bestMinutes).padStart(2, '0')}:${String(bestSeconds).padStart(2, '0')}.${String(bestMilliseconds).padStart(2, '0')}`
    : '--:--';

  return (
    <div id="victory-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="bg-neutral-900 border-2 border-amber-500/70 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl flex flex-col items-center gap-5 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center">
          <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-400">
            <Trophy className="w-9 h-9 animate-bounce" />
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            SUMMIT CONQUERED • {level.height}M
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-wider mt-1">
            SUMMIT REACHED!
          </h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            {level.name}
          </p>
        </div>

        {/* 3-Star Rating Display */}
        <div className="flex items-center gap-3 my-1">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2 rounded-2xl border transition-all duration-300 ${
                starIdx <= starsEarned
                  ? 'bg-amber-500/20 border-amber-400 text-amber-400 scale-110 shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-800/40 border-neutral-700 text-neutral-600'
              }`}
            >
              <Star className={`w-8 h-8 ${starIdx <= starsEarned ? 'fill-current' : ''}`} />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              FINISH TIME
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-white">
                {formattedTime}
              </span>
              {isNewRecord && (
                <span className="text-[10px] font-extrabold bg-amber-500 text-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                  RECORD!
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              PERSONAL BEST
            </span>
            <span className="text-xl font-bold font-mono text-neutral-300 mt-0.5">
              {formattedBestTime}
            </span>
          </div>

          <div className="flex flex-col border-t border-neutral-800/60 pt-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Skull className="w-3 h-3 text-red-400" />
              DEATHS
            </span>
            <span className="text-lg font-bold text-white mt-0.5">
              {deaths}
            </span>
          </div>

          <div className="flex flex-col border-t border-neutral-800/60 pt-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              COINS COLLECTED
            </span>
            <span className="text-lg font-bold text-amber-400 mt-0.5">
              +{coins * 10} ({coins}/{level.totalCoins})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          {hasNextLevel && (
            <button
              id="victory-next-level-btn"
              onClick={onNextLevel}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-98 cursor-pointer"
            >
              NEXT LEVEL
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="flex gap-2 w-full">
            <button
              id="victory-replay-btn"
              onClick={onReplay}
              className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              RETRY LEVEL
            </button>

            <button
              id="victory-levels-btn"
              onClick={onLevelSelect}
              className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98 cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              LEVEL SELECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
