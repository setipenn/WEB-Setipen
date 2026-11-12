import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Badge,
  ClassRoom,
  DailyMission,
  Major,
  Material,
  Question,
  Quiz,
  QuizAttempt,
  UserProfile,
  UserRole,
  WordBankItem,
} from '../types';
import {
  DEMO_USERS,
  SEED_BADGES,
  SEED_CLASSES,
  SEED_DAILY_MISSIONS,
  SEED_MATERIALS,
  SEED_QUESTIONS,
  SEED_QUIZZES,
  SEED_WORD_BANK,
} from '../data/seedData';
import { getLevelFromXp } from '../utils/gamification';
import { sounds } from '../components/SoundEffects';
import confetti from 'canvas-confetti';

interface LevelUpInfo {
  oldLevel: number;
  newLevel: number;
  rankTitleId: string;
  rankTitleEn: string;
}

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  lang: 'id' | 'en';
  toggleLang: () => void;
  theme: 'light' | 'dark' | 'contrast';
  setTheme: (t: 'light' | 'dark' | 'contrast') => void;
  isMuted: boolean;
  toggleSound: () => void;
  quizzes: Quiz[];
  questions: Question[];
  materials: Material[];
  classes: ClassRoom[];
  wordBank: WordBankItem[];
  dailyMissions: DailyMission[];
  badges: Badge[];
  unlockedBadgeIds: string[];
  newlyEarnedBadge: Badge | null;
  clearNewBadge: () => void;
  levelUpData: LevelUpInfo | null;
  clearLevelUp: () => void;
  addXp: (amount: number, reason?: string) => void;
  addCoins: (amount: number) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  saveWordBankItem: (item: Omit<WordBankItem, 'id' | 'user_id' | 'created_at'>) => void;
  removeWordBankItem: (id: string) => void;
  updateWordMastery: (id: string, status: 'new' | 'learning' | 'mastered') => void;
  claimDailyMission: (id: string) => void;
  joinClassWithCode: (code: string) => { success: boolean; message: string };
  createClass: (name: string, grade: string, major: Major) => ClassRoom;
  addQuestion: (q: Omit<Question, 'id'>) => Question;
  bulkAddQuestions: (questions: Omit<Question, 'id'>[]) => number;
  createQuiz: (quiz: Omit<Quiz, 'id' | 'created_at'>) => Quiz;
  usePowerUp: (type: 'fifty_fifty' | 'extra_time' | 'skip') => boolean;
  buyShopItem: (itemType: string, cost: number, itemId: string) => boolean;
  attempts: QuizAttempt[];
  updateUserMajor: (major: Major) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language & Theme
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('vocasmk_lang') as 'id' | 'en') || 'id';
  });

  const [theme, setThemeState] = useState<'light' | 'dark' | 'contrast'>(() => {
    return (localStorage.getItem('vocasmk_theme') as any) || 'light';
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());

  // 2. User Profile & Role
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vocasmk_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEMO_USERS.student;
  });

  // 3. App State Collections
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('vocasmk_quizzes');
    return saved ? JSON.parse(saved) : SEED_QUIZZES;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('vocasmk_questions');
    return saved ? JSON.parse(saved) : SEED_QUESTIONS;
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('vocasmk_materials');
    return saved ? JSON.parse(saved) : SEED_MATERIALS;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('vocasmk_classes');
    return saved ? JSON.parse(saved) : SEED_CLASSES;
  });

  const [wordBank, setWordBank] = useState<WordBankItem[]>(() => {
    const saved = localStorage.getItem('vocasmk_wordbank');
    return saved ? JSON.parse(saved) : SEED_WORD_BANK;
  });

  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    const saved = localStorage.getItem('vocasmk_missions');
    return saved ? JSON.parse(saved) : SEED_DAILY_MISSIONS;
  });

  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('vocasmk_user_badges');
    return saved ? JSON.parse(saved) : ['b_first_quiz', 'b_speed_demon'];
  });

  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem('vocasmk_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpInfo | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vocasmk_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('vocasmk_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('vocasmk_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('vocasmk_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('vocasmk_wordbank', JSON.stringify(wordBank));
  }, [wordBank]);

  useEffect(() => {
    localStorage.setItem('vocasmk_missions', JSON.stringify(dailyMissions));
  }, [dailyMissions]);

  useEffect(() => {
    localStorage.setItem('vocasmk_user_badges', JSON.stringify(unlockedBadgeIds));
  }, [unlockedBadgeIds]);

  useEffect(() => {
    localStorage.setItem('vocasmk_attempts', JSON.stringify(attempts));
  }, [attempts]);

  // Apply Theme Classes to HTML root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'contrast-mode');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'contrast') {
      root.classList.add('contrast-mode');
    }
    localStorage.setItem('vocasmk_theme', theme);
  }, [theme]);

  const setTheme = (t: 'light' | 'dark' | 'contrast') => {
    setThemeState(t);
  };

  const toggleLang = () => {
    const next = lang === 'id' ? 'en' : 'id';
    setLang(next);
    localStorage.setItem('vocasmk_lang', next);
    sounds.playPop();
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playPop();
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'student') {
      setUser(DEMO_USERS.student);
    } else if (newRole === 'teacher') {
      setUser(DEMO_USERS.teacher);
    } else {
      setUser(DEMO_USERS.admin);
    }
    sounds.playPop();
  };

  const unlockBadge = (badgeId: string) => {
    if (unlockedBadgeIds.includes(badgeId)) return;
    const badge = SEED_BADGES.find((b) => b.id === badgeId);
    if (badge) {
      setUnlockedBadgeIds((prev) => [...prev, badgeId]);
      setNewlyEarnedBadge(badge);
      sounds.playLevelUp();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      // award badge XP
      addXp(badge.xp_reward, `Badge: ${badge.name}`);
    }
  };

  const addXp = (amount: number, reason?: string) => {
    setUser((prev) => {
      const oldLevelInfo = getLevelFromXp(prev.xp);
      const newTotalXp = prev.xp + amount;
      const newLevelInfo = getLevelFromXp(newTotalXp);

      if (newLevelInfo.level > oldLevelInfo.level) {
        // Trigger Level-Up Celebration
        setLevelUpData({
          oldLevel: oldLevelInfo.level,
          newLevel: newLevelInfo.level,
          rankTitleId: newLevelInfo.rankTitleId,
          rankTitleEn: newLevelInfo.rankTitleEn,
        });
        sounds.playLevelUp();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (newLevelInfo.level >= 10) unlockBadge('b_level_10');
        if (newLevelInfo.level >= 25) unlockBadge('b_level_25');
        if (newLevelInfo.level >= 50) unlockBadge('b_level_50');
      }

      return {
        ...prev,
        xp: newTotalXp,
        level: newLevelInfo.level,
        title: newLevelInfo.rankTitleId,
      };
    });
  };

  const addCoins = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  };

  const recordQuizAttempt = (attempt: QuizAttempt) => {
    setAttempts((prev) => [attempt, ...prev]);

    // Check Badges
    unlockBadge('b_first_quiz');
    if (attempt.score === 100) {
      unlockBadge('b_perfect_score');
    }
    if (attempts.length + 1 >= 10) {
      unlockBadge('b_quiz_marathon');
    }

    // Check for speed demon
    const fastCorrect = attempt.answers.some((a) => a.is_correct && a.time_taken <= 3);
    if (fastCorrect) {
      unlockBadge('b_speed_demon');
    }

    // Update daily missions
    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.id === 'mis_1') {
          const newCurr = m.current + attempt.correct_count;
          return {
            ...m,
            current: newCurr,
            completed: newCurr >= m.goal,
          };
        }
        if (m.id === 'mis_3' && attempt.score >= 70) {
          return {
            ...m,
            current: 1,
            completed: true,
          };
        }
        return m;
      })
    );
  };

  const saveWordBankItem = (item: Omit<WordBankItem, 'id' | 'user_id' | 'created_at'>) => {
    const newItem: WordBankItem = {
      ...item,
      id: `wb_${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString().split('T')[0],
    };
    setWordBank((prev) => [newItem, ...prev]);
    sounds.playPop();

    // Check vocab collector badges
    if (wordBank.length + 1 >= 25) {
      unlockBadge('b_vocab_collector');
    }
    if (wordBank.length + 1 >= 100) {
      unlockBadge('b_vocab_100');
    }

    // Update mission 2
    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.id === 'mis_2') {
          const newCurr = Math.min(m.goal, m.current + 1);
          return { ...m, current: newCurr, completed: newCurr >= m.goal };
        }
        return m;
      })
    );
  };

  const removeWordBankItem = (id: string) => {
    setWordBank((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWordMastery = (id: string, status: 'new' | 'learning' | 'mastered') => {
    setWordBank((prev) =>
      prev.map((w) => (w.id === id ? { ...w, mastery_status: status } : w))
    );
  };

  const claimDailyMission = (id: string) => {
    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.id === id && m.completed && !m.claimed) {
          addXp(m.xp_reward, `Mission: ${m.title}`);
          addCoins(m.coins_reward);
          sounds.playCorrect();
          return { ...m, claimed: true };
        }
        return m;
      })
    );
  };

  const joinClassWithCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const foundClass = classes.find((c) => c.code === trimmed);

    if (!foundClass) {
      return {
        success: false,
        message: lang === 'id' ? 'Kode kelas tidak ditemukan. Mohon cek kembali ke Guru Anda.' : 'Class code not found. Please verify with your teacher.',
      };
    }

    // Update user class
    setUser((prev) => ({
      ...prev,
      class_id: foundClass.id,
      class_name: foundClass.name,
      school_name: foundClass.school_name,
      major: foundClass.major,
    }));

    // Update class student roster
    setClasses((prev) =>
      prev.map((c) =>
        c.id === foundClass.id && !c.student_ids.includes(user.id)
          ? { ...c, student_ids: [...c.student_ids, user.id] }
          : c
      )
    );

    sounds.playCorrect();
    return {
      success: true,
      message:
        lang === 'id'
          ? `Berhasil bergabung ke ${foundClass.name} (${foundClass.school_name})!`
          : `Successfully joined ${foundClass.name}!`,
    };
  };

  const createClass = (name: string, grade: string, major: Major): ClassRoom => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    const newClass: ClassRoom = {
      id: `class_${Date.now()}`,
      code,
      name,
      grade,
      major,
      school_name: user.school_name || 'SMK Negeri 1 Jakarta',
      teacher_id: user.id,
      teacher_name: user.name,
      student_ids: [],
      created_at: new Date().toISOString().split('T')[0],
    };

    setClasses((prev) => [newClass, ...prev]);
    sounds.playCorrect();
    return newClass;
  };

  const addQuestion = (q: Omit<Question, 'id'>): Question => {
    const newQ: Question = {
      ...q,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_by: user.id,
    };
    setQuestions((prev) => [newQ, ...prev]);
    sounds.playPop();
    return newQ;
  };

  const bulkAddQuestions = (newQs: Omit<Question, 'id'>[]): number => {
    const formatted = newQs.map((q, idx) => ({
      ...q,
      id: `q_${Date.now()}_${idx}`,
      created_by: user.id,
    }));
    setQuestions((prev) => [...formatted, ...prev]);
    sounds.playCorrect();
    return formatted.length;
  };

  const createQuiz = (quizData: Omit<Quiz, 'id' | 'created_at'>): Quiz => {
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz_${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    setQuizzes((prev) => [newQuiz, ...prev]);
    sounds.playCorrect();
    return newQuiz;
  };

  const usePowerUp = (type: 'fifty_fifty' | 'extra_time' | 'skip'): boolean => {
    if (user.power_ups[type] > 0) {
      setUser((prev) => ({
        ...prev,
        power_ups: {
          ...prev.power_ups,
          [type]: prev.power_ups[type] - 1,
        },
      }));
      sounds.playPowerUp();
      return true;
    }
    return false;
  };

  const buyShopItem = (itemType: string, cost: number, itemId: string): boolean => {
    if (user.coins < cost) {
      sounds.playWrong();
      return false;
    }
    setUser((prev) => {
      let updated = { ...prev, coins: prev.coins - cost };
      if (itemType === 'frame') {
        updated.avatar_frame = itemId;
      } else if (itemType === 'power_up') {
        const pKey = itemId as 'fifty_fifty' | 'extra_time' | 'skip';
        updated.power_ups = {
          ...updated.power_ups,
          [pKey]: updated.power_ups[pKey] + 1,
        };
      } else if (itemType === 'title') {
        updated.title = itemId;
      }
      return updated;
    });
    sounds.playCorrect();
    confetti({ particleCount: 30, spread: 50 });
    return true;
  };

  const updateUserMajor = (major: Major) => {
    setUser((prev) => ({ ...prev, major }));
    sounds.playPop();
  };

  const badges = SEED_BADGES.map((b) => ({
    ...b,
    unlocked_at: unlockedBadgeIds.includes(b.id) ? '2026-11-10' : undefined,
  }));

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        role: user.role,
        switchRole,
        lang,
        toggleLang,
        theme,
        setTheme,
        isMuted,
        toggleSound,
        quizzes,
        questions,
        materials,
        classes,
        wordBank,
        dailyMissions,
        badges,
        unlockedBadgeIds,
        newlyEarnedBadge,
        clearNewBadge: () => setNewlyEarnedBadge(null),
        levelUpData,
        clearLevelUp: () => setLevelUpData(null),
        addXp,
        addCoins,
        recordQuizAttempt,
        saveWordBankItem,
        removeWordBankItem,
        updateWordMastery,
        claimDailyMission,
        joinClassWithCode,
        createClass,
        addQuestion,
        bulkAddQuestions,
        createQuiz,
        usePowerUp,
        buyShopItem,
        attempts,
        updateUserMajor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
