import React from 'react';
import { ArrowLeft, Lock, Star, Clock, Coins, Flame, Trophy } from 'lucide-react';
import { LevelDefinition, LevelStats } from '../types';
import { LEVELS } from '../game/levelsData';

interface LevelSelectProps {
  levelsStats: Record<number, LevelStats>;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  levelsStats,
  onSelectLevel,
  onBack,
}) => {
  const getDifficultyColor = (diff: LevelDefinition['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Hard':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Extreme':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Hardcore':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  return (
    <div id="level-select-screen" className="fixed inset-0 z-40 bg-neutral-950/95 backdrop-blur-xl flex flex-col p-6 md:p-10 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-4">
          <button
            id="level-select-back-btn"
            onClick={onBack}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              STAGE DIRECTORY
            </span>
            <h2 className="text-3xl font-extrabold font-display text-white tracking-wide">
              SELECT LEVEL
            </h2>
          </div>
        </div>

        <div className="text-sm font-semibold text-neutral-400">
          20 TOTAL STAGES • THE SUMMIT AT LEVEL 20
        </div>
      </div>

      {/* Levels Grid */}
      <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pr-2 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEVELS.map((level) => {
            const stats = levelsStats[level.id] || {
              unlocked: level.id === 1,
              completed: false,
              bestTime: null,
              stars: 0,
              fewestDeaths: null,
              coinsCollected: 0,
              totalCoins: level.totalCoins,
            };

            const isLocked = !stats.unlocked;

            const bestMinutes = stats.bestTime ? Math.floor(stats.bestTime / 60) : 0;
            const bestSeconds = stats.bestTime ? Math.floor(stats.bestTime % 60) : 0;
            const bestFormatted = stats.bestTime
              ? `${String(bestMinutes).padStart(2, '0')}:${String(bestSeconds).padStart(2, '0')}`
              : '--:--';

            return (
              <div
                key={level.id}
                id={`level-card-${level.id}`}
                onClick={() => {
                  if (!isLocked) onSelectLevel(level.id);
                }}
                className={`group relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isLocked
                    ? 'bg-neutral-900/40 border-neutral-800/80 opacity-60 cursor-not-allowed'
                    : 'bg-neutral-900/90 hover:bg-neutral-850 border-neutral-700/80 hover:border-amber-500/70 hover:shadow-xl hover:shadow-amber-500/10 active:scale-[0.98] cursor-pointer'
                }`}
              >
                {/* Level Top Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black tracking-widest text-neutral-400 font-mono">
                      LVL {String(level.id).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getDifficultyColor(
                        level.difficulty
                      )}`}
                    >
                      {level.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white group-hover:text-amber-400 transition-colors">
                    {level.name}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                    {level.subtitle}
                  </p>
                </div>

                {/* Altitude & Star Rating */}
                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-bold text-neutral-300">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{level.height}m</span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 ${
                          starIdx <= stats.stars
                            ? 'text-amber-400 fill-current'
                            : 'text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Best Time & Coins */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    {bestFormatted}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Coins className="w-3 h-3" />
                    {stats.coinsCollected}/{level.totalCoins}
                  </span>
                </div>

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-neutral-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 z-10">
                    <Lock className="w-6 h-6 text-neutral-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      LOCKED
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
