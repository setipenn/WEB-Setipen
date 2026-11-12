import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Sparkles, ArrowRight } from 'lucide-react';

export const LevelUpModal: React.FC = () => {
  const { levelUpData, clearLevelUp, lang } = useApp();

  if (!levelUpData) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={clearLevelUp}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center border-2 border-amber-400 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-400 mx-auto flex items-center justify-center text-4xl shadow-xl animate-bounce mb-3">
          ⭐
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
          LEVEL UP CELEBRATION!
        </span>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
          LEVEL {levelUpData.newLevel}!
        </h2>

        <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-1">
          {lang === 'id' ? levelUpData.rankTitleId : levelUpData.rankTitleEn}
        </p>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3">
          {lang === 'id'
            ? 'Hebat! Konsistensi belajarmu membawa kemampuan Bahasa Inggris ke level berikutnya!'
            : 'Outstanding! Your dedication leveled up your vocational English mastery!'}
        </p>

        <button
          onClick={clearLevelUp}
          className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-black text-sm shadow-md hover:scale-103 active:scale-97 transition-transform"
        >
          {lang === 'id' ? 'Lanjutkan Belajar!' : 'Keep Going!'}
        </button>
      </div>
    </div>
  );
};
