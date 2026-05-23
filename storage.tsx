export const setStorage = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting localStorage", error);
  }
};

export const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error getting localStorage", error);
    return defaultValue;
  }
};

export const STORAGE_KEYS = {
  LAST_READ: "quranai_lastRead",
  BOOKMARKS: "quranai_bookmarks",
  PROGRESS: "quranai_progress",
  SETTINGS: "quranai_settings",
  TASBIH: "quranai_tasbih",
  IBADAH_TRACKER: "quranai_ibadah_tracker",
  HAFALAN: "quranai_hafalan",
  LEARNING_PATH: "quranai_learning_path",
  SPACED_REP: "quranai_spaced_rep",
  JOURNEY_GOALS: "quranai_journey_goals",
  REFLECTIONS: "quranai_reflections",
  EMOTIONAL_LOG: "quranai_emotional_log",
  GRATITUDE: "quranai_gratitude",
  ACHIEVEMENTS: "quranai_achievements",
  STREAK_EXT: "quranai_streak_ext",
  MICRO_LEARNING: "quranai_micro_learning",
  HABITS: "quranai_habits",
  SPIRITUAL_ID: "quranai_spiritual_id",
  READING_SPEED: "quranai_reading_speed",
  TAJWID: "quranai_tajwid",
  SEASON_RANK: "quranai_season_rank",
  AI_MESSAGES: "quranai_ai_messages",
  DAILY_PLAN: "quranai_daily_plan",
  MOOD_LOG: "quranai_mood_log",
  HEALING_MODE: "quranai_healing_mode",
  BADGES: "quranai_badges",
};
