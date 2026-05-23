import { useState, useCallback } from "react";
import { getStorage, setStorage, STORAGE_KEYS } from "@/lib/storage";

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastReadDate: string | null;
  khatamCount: number;
  totalAyahRead: number;
  readDates: string[];
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastReadDate: null,
  khatamCount: 0,
  totalAyahRead: 0,
  readDates: [],
};

export function getXPForLevel(level: number): number {
  return level * 500;
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  let threshold = 0;
  while (threshold + getXPForLevel(level) <= xp) {
    threshold += getXPForLevel(level);
    level++;
  }
  return level;
}

export function getXPProgress(xp: number): { current: number; max: number; percent: number } {
  let level = 1;
  let threshold = 0;
  while (threshold + getXPForLevel(level) <= xp) {
    threshold += getXPForLevel(level);
    level++;
  }
  const current = xp - threshold;
  const max = getXPForLevel(level);
  return { current, max, percent: Math.round((current / max) * 100) };
}

export function useProgress() {
  const [progress, setProgressState] = useState<UserProgress>(() =>
    getStorage<UserProgress>(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS)
  );

  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setProgressState(prev => {
      if (prev.lastReadDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = prev.lastReadDate === yesterday ? prev.streak + 1 : 1;
      const readDates = [...new Set([...prev.readDates, today])];
      const updated = { ...prev, streak: newStreak, lastReadDate: today, readDates };
      setStorage(STORAGE_KEYS.PROGRESS, updated);
      return updated;
    });
  }, []);

  const addXP = useCallback((amount: number) => {
    setProgressState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = getLevelFromXP(newXP);
      const updated = { ...prev, xp: newXP, level: newLevel, totalAyahRead: prev.totalAyahRead + 1 };
      setStorage(STORAGE_KEYS.PROGRESS, updated);
      return updated;
    });
    updateStreak();
  }, [updateStreak]);

  const incrementKhatam = useCallback(() => {
    setProgressState(prev => {
      const updated = { ...prev, khatamCount: prev.khatamCount + 1, xp: prev.xp + 5000 };
      setStorage(STORAGE_KEYS.PROGRESS, updated);
      return updated;
    });
  }, []);

  return { progress, addXP, updateStreak, incrementKhatam };
}
