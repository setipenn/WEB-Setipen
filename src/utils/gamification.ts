/**
 * Gamification & Scoring Logic for VocaSMK
 * Pure calculation functions decoupled from UI components
 */

export interface ScoreCalculationResult {
  totalXp: number;
  baseXp: number;
  speedBonus: number;
  streakMultiplier: number;
}

/**
 * Calculates XP for a correct answer based on base points, speed, and streak.
 */
export function calculateScore(
  baseXp: number = 10,
  timeLimitSeconds: number = 20,
  timeSpentSeconds: number = 5,
  currentStreak: number = 1
): ScoreCalculationResult {
  // Speed bonus calculation
  let speedBonus = 0;
  if (timeSpentSeconds <= 3) {
    speedBonus = 10; // Speed Demon bonus
  } else if (timeSpentSeconds <= timeLimitSeconds * 0.4) {
    speedBonus = 6;
  } else if (timeSpentSeconds <= timeLimitSeconds * 0.7) {
    speedBonus = 3;
  } else {
    speedBonus = 1;
  }

  // Streak multiplier
  let streakMultiplier = 1.0;
  if (currentStreak >= 10) {
    streakMultiplier = 2.0;
  } else if (currentStreak >= 5) {
    streakMultiplier = 1.5;
  } else if (currentStreak >= 3) {
    streakMultiplier = 1.25;
  }

  const rawPoints = (baseXp + speedBonus) * streakMultiplier;
  const totalXp = Math.round(rawPoints);

  return {
    totalXp,
    baseXp,
    speedBonus,
    streakMultiplier,
  };
}

/**
 * Cumulative XP required to reach a specific level (1 - 50)
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Level 2: 100 XP, Level 3: ~245 XP, Level 10: ~2,500 XP, Level 50: ~50,000 XP
  return Math.floor(75 * Math.pow(level - 1, 1.45) + 25 * (level - 1));
}

export interface LevelInfo {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPct: number;
  rankTitleId: string;
  rankTitleEn: string;
  badgeIcon: string;
}

export function getRankTitle(level: number): { id: string; en: string; icon: string } {
  if (level >= 41) {
    return { id: 'Legenda Kata SMK', en: 'SMK Word Legend', icon: '👑' };
  }
  if (level >= 31) {
    return { id: 'Ahli Kosakata', en: 'Vocab Master', icon: '🎓' };
  }
  if (level >= 21) {
    return { id: 'Pendekar Bahasa', en: 'Vocab Warrior', icon: '⚔️' };
  }
  if (level >= 13) {
    return { id: 'Pemburu Kata', en: 'Word Hunter', icon: '🏹' };
  }
  if (level >= 6) {
    return { id: 'Penjelajah Kosakata', en: 'Word Explorer', icon: '🧭' };
  }
  return { id: 'Pemula Kejuruan', en: 'Vocational Newbie', icon: '🌱' };
}

/**
 * Derives current level, rank title, and progress percentage from total accumulated XP.
 */
export function getLevelFromXp(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, totalXp);
  let level = 1;

  while (level < 50 && safeXp >= xpForLevel(level + 1)) {
    level++;
  }

  const currentLevelBaseXp = xpForLevel(level);
  const nextLevelBaseXp = xpForLevel(level + 1);
  const xpInCurrentLevel = safeXp - currentLevelBaseXp;
  const xpNeededForNextLevel = Math.max(1, nextLevelBaseXp - currentLevelBaseXp);
  const progressPct = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  const rank = getRankTitle(level);

  return {
    level,
    currentLevelXp: currentLevelBaseXp,
    nextLevelXp: nextLevelBaseXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPct,
    rankTitleId: rank.id,
    rankTitleEn: rank.en,
    badgeIcon: rank.icon,
  };
}

/**
 * Normalizes user typed answers for comparison.
 */
export function cleanAnswer(answer: string): string {
  if (!answer) return '';
  return answer
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Evaluates answer correctness with fuzzy support for small typos.
 */
export function isAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  const cleanedUser = cleanAnswer(userAnswer);
  const cleanedCorrect = cleanAnswer(correctAnswer);

  if (!cleanedUser || !cleanedCorrect) return false;
  if (cleanedUser === cleanedCorrect) return true;

  // If answer contains slashes or commas as alternative accepted answers (e.g. "cable / wire")
  const alternatives = correctAnswer
    .split(/[\/,|]/)
    .map((a) => cleanAnswer(a))
    .filter(Boolean);

  if (alternatives.includes(cleanedUser)) {
    return true;
  }

  return false;
}

/**
 * Simple Spaced Repetition (SRS) interval calculator
 */
export function calculateSrsReview(
  isKnown: boolean,
  currentRepetitions: number = 0,
  currentEaseFactor: number = 2.5
): { nextIntervalDays: number; repetitions: number; easeFactor: number } {
  let repetitions = currentRepetitions;
  let easeFactor = currentEaseFactor;
  let nextIntervalDays = 1;

  if (isKnown) {
    repetitions += 1;
    if (repetitions === 1) {
      nextIntervalDays = 1;
    } else if (repetitions === 2) {
      nextIntervalDays = 3;
    } else {
      nextIntervalDays = Math.round(3 * Math.pow(easeFactor, repetitions - 2));
    }
    easeFactor = Math.min(3.0, easeFactor + 0.1);
  } else {
    repetitions = 0;
    nextIntervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  return {
    nextIntervalDays,
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
  };
}
