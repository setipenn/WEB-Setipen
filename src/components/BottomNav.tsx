import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  BookOpen,
  Trophy,
  Award,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';

export type NavTab = 'home' | 'learn' | 'quiz' | 'leaderboard' | 'profile' | 'teacher';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAiTutor: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenAiTutor,
}) => {
  const { lang, role } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden transition-colors">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto relative">
        {/* Beranda */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            currentTab === 'home'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-1">{lang === 'id' ? 'Beranda' : 'Home'}</span>
        </button>

        {/* Belajar */}
        <button
          onClick={() => onTabChange('learn')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            currentTab === 'learn'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${currentTab === 'learn' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-1">{lang === 'id' ? 'Belajar' : 'Learn'}</span>
        </button>

        {/* Floating Center AI Tutor / Quick Action */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            onClick={onOpenAiTutor}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 via-teal-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all"
            title="Tutor AI Kak Voca"
            aria-label="Buka Kak Voca AI Tutor"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
          </button>
          <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">Kak Voca</span>
        </div>

        {/* Kuis */}
        <button
          onClick={() => onTabChange('quiz')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            currentTab === 'quiz'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Layers className={`w-5 h-5 ${currentTab === 'quiz' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-1">{lang === 'id' ? 'Kuis' : 'Quiz'}</span>
        </button>

        {/* Peringkat / Teacher */}
        {role === 'teacher' || role === 'admin' ? (
          <button
            onClick={() => onTabChange('teacher')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              currentTab === 'teacher'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <GraduationCap className={`w-5 h-5 ${currentTab === 'teacher' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] mt-1">{lang === 'id' ? 'Kelola' : 'Manage'}</span>
          </button>
        ) : (
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              currentTab === 'leaderboard'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Trophy className={`w-5 h-5 ${currentTab === 'leaderboard' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] mt-1">{lang === 'id' ? 'Peringkat' : 'Rank'}</span>
          </button>
        )}

        {/* Profil & Bank Kata */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            currentTab === 'profile'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Award className={`w-5 h-5 ${currentTab === 'profile' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-1">{lang === 'id' ? 'Profil' : 'Profile'}</span>
        </button>
      </div>
    </nav>
  );
};
