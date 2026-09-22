import { LevelStats, PlayerCustomization, GameSettings, LevelRecord } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_CUSTOMIZATION } from './constants';
import { LEVELS } from './levelsData';

const STORAGE_KEYS = {
  LEVELS_STATS: 'cttf_level_stats',
  CUSTOMIZATION: 'cttf_customization',
  SETTINGS: 'cttf_settings',
  COINS: 'cttf_coins',
  RECORDS: 'cttf_records',
};

export class GameStorage {
  public static getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }

  public static getCustomization(): PlayerCustomization {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMIZATION);
      if (data) return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(data) };
    } catch (e) {}
    return DEFAULT_CUSTOMIZATION;
  }

  public static saveCustomization(customization: PlayerCustomization) {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMIZATION, JSON.stringify(customization));
    } catch (e) {}
  }

  public static getCoins(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COINS);
      if (data) return parseInt(data, 10) || 0;
    } catch (e) {}
    return 0;
  }

  public static addCoins(amount: number): number {
    const current = this.getCoins();
    const updated = current + amount;
    try {
      localStorage.setItem(STORAGE_KEYS.COINS, updated.toString());
    } catch (e) {}
    return updated;
  }

  public static getLevelsStats(): Record<number, LevelStats> {
    const stats: Record<number, LevelStats> = {};
    
    // Default initial states
    LEVELS.forEach(l => {
      stats[l.id] = {
        unlocked: l.id === 1,
        completed: false,
        bestTime: null,
        stars: 0,
        fewestDeaths: null,
        coinsCollected: 0,
        totalCoins: l.totalCoins,
      };
    });

    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEVELS_STATS);
      if (data) {
        const parsed = JSON.parse(data);
        Object.keys(parsed).forEach(k => {
          const id = parseInt(k, 10);
          if (stats[id]) {
            stats[id] = { ...stats[id], ...parsed[id] };
          }
        });
      }
    } catch (e) {}

    return stats;
  }

  public static saveLevelCompletion(
    levelId: number,
    time: number,
    deaths: number,
    coinsEarned: number
  ): { isNewRecord: boolean; starsEarned: number } {
    const allStats = this.getLevelsStats();
    const current = allStats[levelId];
    const levelDef = LEVELS.find(l => l.id === levelId);

    // Calculate stars:
    // 3 Stars: fast time <= targetTime3Stars and 0 deaths
    // 2 Stars: time <= targetTime2Stars
    // 1 Star: any completion
    let stars = 1;
    if (levelDef) {
      if (time <= levelDef.targetTime3Stars && deaths === 0) {
        stars = 3;
      } else if (time <= levelDef.targetTime2Stars) {
        stars = 2;
      }
    }

    let isNewRecord = false;
    if (current.bestTime === null || time < current.bestTime) {
      isNewRecord = true;
      current.bestTime = time;
    }

    current.completed = true;
    current.stars = Math.max(current.stars, stars);
    if (current.fewestDeaths === null || deaths < current.fewestDeaths) {
      current.fewestDeaths = deaths;
    }
    current.coinsCollected = Math.max(current.coinsCollected, coinsEarned);

    // Unlock next level
    if (allStats[levelId + 1]) {
      allStats[levelId + 1].unlocked = true;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.LEVELS_STATS, JSON.stringify(allStats));
    } catch (e) {}

    // Add coins to wallet
    this.addCoins(coinsEarned * 10);

    // Save record entry
    this.addRecord({
      levelId,
      time,
      deaths,
      date: new Date().toLocaleDateString(),
    });

    return { isNewRecord, starsEarned: stars };
  }

  public static getRecords(): LevelRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  }

  public static addRecord(record: LevelRecord) {
    const records = this.getRecords();
    records.unshift(record);
    // Keep last 50
    if (records.length > 50) records.pop();
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {}
  }
}
