import React from 'react';
import { ArrowLeft, Trophy, Clock, Skull, Calendar, Star, Medal } from 'lucide-react';
import { LevelRecord, LevelStats } from '../types';
import { LEVELS } from '../game/levelsData';

interface LeaderboardProps {
  levelsStats: Record<number, LevelStats>;
  records: LevelRecord[];
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  levelsStats,
  records,
  onBack,
}) => {
  return (
    <div id="leaderboard-screen" className="fixed inset-0 z-40 bg-neutral-950/95 backdrop-blur-xl flex flex-col p-6 md:p-10 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-4">
          <button
            id="leaderboard-back-btn"
            onClick={onBack}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              HALL OF FAME
            </span>
            <h2 className="text-3xl font-extrabold font-display text-white tracking-wide">
              SPEEDRUN LEADERBOARD
            </h2>
          </div>
        </div>

        <div className="text-xs text-neutral-400 font-semibold bg-neutral-900 px-3.5 py-1.5 rounded-xl border border-neutral-800">
          LOCAL HARDWARE RECORDS
        </div>
      </div>

      {/* Main Table / Grid */}
      <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pr-2 pb-6">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 md:p-6">
          <h3 className="text-base font-bold font-display text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Medal className="w-4 h-4 text-amber-500" />
            Stage Best Times & Stars
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-xs uppercase">
                  <th className="pb-3 pl-2">Stage</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Height</th>
                  <th className="pb-3">Stars</th>
                  <th className="pb-3">Best Time</th>
                  <th className="pb-3">Fewest Deaths</th>
                  <th className="pb-3 pr-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-medium">
                {LEVELS.map((level) => {
                  const stat = levelsStats[level.id];
                  const hasTime = stat && stat.bestTime !== null;
                  const minutes = hasTime ? Math.floor(stat.bestTime! / 60) : 0;
                  const seconds = hasTime ? Math.floor(stat.bestTime! % 60) : 0;
                  const ms = hasTime ? Math.floor((stat.bestTime! % 1) * 100) : 0;
                  const timeFormatted = hasTime
                    ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
                    : '--:--';

                  return (
                    <tr key={level.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3.5 pl-2 font-mono font-bold text-amber-400">
                        #{String(level.id).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 font-bold text-white">
                        {level.name}
                      </td>
                      <td className="py-3.5 text-neutral-400">
                        {level.height}m
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                stat && s <= stat.stars
                                  ? 'text-amber-400 fill-current'
                                  : 'text-neutral-700'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-neutral-200">
                        {timeFormatted}
                      </td>
                      <td className="py-3.5 text-neutral-300">
                        {stat && stat.fewestDeaths !== null ? stat.fewestDeaths : '-'}
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        {stat?.completed ? (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                            COMPLETED
                          </span>
                        ) : stat?.unlocked ? (
                          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                            AVAILABLE
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-neutral-600 bg-neutral-800 px-2 py-0.5 rounded-full uppercase">
                            LOCKED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Run History Log */}
        {records.length > 0 && (
          <div className="mt-6 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 md:p-6">
            <h3 className="text-base font-bold font-display text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Summit Climbs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {records.slice(0, 9).map((rec, i) => {
                const lvl = LEVELS.find((l) => l.id === rec.levelId);
                const minutes = Math.floor(rec.time / 60);
                const seconds = Math.floor(rec.time % 60);
                const ms = Math.floor((rec.time % 1) * 100);
                const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;

                return (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        LVL {rec.levelId}
                      </span>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rec.date}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {lvl?.name || `Level ${rec.levelId}`}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-neutral-400 font-mono">
                      <span className="text-emerald-400 font-bold">{timeStr}</span>
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Skull className="w-3 h-3 text-red-400" />
                        {rec.deaths} deaths
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
