import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLevelFromXp } from '../utils/gamification';
import {
  Flame,
  Coins,
  Volume2,
  VolumeX,
  Globe,
  Sun,
  Moon,
  Eye,
  UserCheck,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenShop: () => void;
  onOpenAiTutor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShop, onOpenAiTutor }) => {
  const {
    user,
    role,
    switchRole,
    lang,
    toggleLang,
    theme,
    setTheme,
    isMuted,
    toggleSound,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const levelInfo = getLevelFromXp(user.xp);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-15 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <span className="text-xl font-black">V</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-sky-600 via-teal-600 to-amber-500 bg-clip-text text-transparent">
                VocaSMK
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                {user.major}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-1">
              {lang === 'id' ? 'Bahasa Inggris Vokasi' : 'Vocational English'}
            </p>
          </div>
        </div>

        {/* Gamification Stats: Streak, Coins, XP */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Flame */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs"
            title={`${user.streak} ${lang === 'id' ? 'Hari Streak Belajar' : 'Day Streak'}`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{user.streak}</span>
          </div>

          {/* Virtual Coins */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/60 border border-yellow-200 dark:border-yellow-800/60 text-yellow-700 dark:text-yellow-400 text-xs font-bold shadow-xs hover:scale-105 transition-transform"
            title={lang === 'id' ? 'Koin Voca (Buka Toko)' : 'Voca Coins (Open Shop)'}
          >
            <Coins className="w-3.5 h-3.5 fill-yellow-500 text-yellow-600" />
            <span>{user.coins}</span>
          </button>

          {/* XP & Level Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-bold text-sky-600 dark:text-sky-400">
              Lvl {levelInfo.level}
            </span>
            <div className="w-14 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPct}%` }}
              />
            </div>
          </div>

          {/* AI Tutor Quick Access Button */}
          <button
            onClick={onOpenAiTutor}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            title="Tutor AI Kak Voca"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kak Voca AI</span>
          </button>

          {/* Controls: Sound, Language, Theme */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              title={isMuted ? 'Suara Mati' : 'Suara Aktif'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Ganti Bahasa / Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                if (theme === 'light') setTheme('dark');
                else if (theme === 'dark') setTheme('contrast');
                else setTheme('light');
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Mode: ${theme}`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-sky-400" />
              ) : (
                <Eye className="w-4 h-4 text-emerald-500" />
              )}
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 text-xs font-semibold text-sky-700 dark:text-sky-300 transition-colors"
              >
                <span className="text-sm">{user.avatar}</span>
                <span className="capitalize">{role === 'student' ? (lang === 'id' ? 'Siswa' : 'Student') : role === 'teacher' ? (lang === 'id' ? 'Guru' : 'Teacher') : 'Admin'}</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">
                      {lang === 'id' ? 'Ganti Peran Akun' : 'Switch Account Role'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      switchRole('student');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      role === 'student' ? 'text-sky-600 font-bold bg-sky-50 dark:bg-slate-700/50' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>👨‍🎓 Siswa (Budi Pratama)</span>
                    {role === 'student' && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('teacher');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      role === 'teacher' ? 'text-sky-600 font-bold bg-sky-50 dark:bg-slate-700/50' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>👨‍🏫 Guru (Pak Hendra)</span>
                    {role === 'teacher' && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      role === 'admin' ? 'text-sky-600 font-bold bg-sky-50 dark:bg-slate-700/50' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>🛡️ Administrator SMK</span>
                    {role === 'admin' && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
