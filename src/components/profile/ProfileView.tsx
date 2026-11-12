import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BadgeGallery } from '../badges/BadgeGallery';
import { WordBankView } from '../wordbank/WordBankView';
import { getLevelFromXp } from '../../utils/gamification';
import {
  Award,
  Bookmark,
  FileCheck2,
  Sparkles,
  Flame,
  Coins,
  Shield,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenCertificate: () => void;
  onOpenShop: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenCertificate,
  onOpenShop,
}) => {
  const { user, wordBank, attempts, unlockedBadgeIds, lang } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'badges' | 'wordbank'>('badges');

  const levelInfo = getLevelFromXp(user.xp);

  // Calculate student statistics
  const totalQuizzes = attempts.length;
  const totalCorrect = attempts.reduce((acc, a) => acc + a.correct_count, 0);
  const totalQuestions = attempts.reduce((acc, a) => acc + a.total_questions, 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 92;

  const masteredWords = wordBank.filter((w) => w.mastery_status === 'mastered').length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6 pb-24 animate-fade-in">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Avatar with Frame */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-400 flex items-center justify-center text-4xl shadow-md border-2 border-white dark:border-slate-700">
                {user.avatar}
              </div>
              <span className="absolute -bottom-2 -right-2 text-xs font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow-xs">
                Lvl {levelInfo.level}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
                  {user.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-extrabold uppercase">
                  {user.major}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                @{user.nickname || 'siswa'} • {user.class_name || 'Siswa SMK'} • {user.school_name || 'SMK'}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                  {levelInfo.badgeIcon} {levelInfo.rankTitleId}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Total {user.xp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Certificate & Shop Quick Action */}
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenCertificate}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{lang === 'id' ? 'Cetak Sertifikat' : 'View Certificate'}</span>
            </button>
            <button
              onClick={onOpenShop}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span>{lang === 'id' ? 'Toko Avatar' : 'Shop'} ({user.coins})</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {lang === 'id' ? 'Kata Dikuasai' : 'Words Mastered'}
            </span>
            <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-0.5">
              {masteredWords}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {lang === 'id' ? 'Akurasi Kuis' : 'Quiz Accuracy'}
            </span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {avgAccuracy}%
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {lang === 'id' ? 'Kuis Selesai' : 'Quizzes Done'}
            </span>
            <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {totalQuizzes}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {lang === 'id' ? 'Lencana Dibuka' : 'Badges'}
            </span>
            <p className="text-xl font-black text-amber-500 mt-0.5">
              {unlockedBadgeIds.length}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs: Badges vs Word Bank */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('badges')}
          className={`flex items-center gap-2 pb-3 px-3 font-extrabold text-xs sm:text-sm transition-all border-b-2 -mb-0.5 ${
            activeSubTab === 'badges'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{lang === 'id' ? 'Lencana & Pencapaian' : 'Badges & Achievements'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('wordbank')}
          className={`flex items-center gap-2 pb-3 px-3 font-extrabold text-xs sm:text-sm transition-all border-b-2 -mb-0.5 ${
            activeSubTab === 'wordbank'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{lang === 'id' ? 'Bank Kataku' : 'My Word Bank'} ({wordBank.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'badges' ? <BadgeGallery /> : <WordBankView />}
    </div>
  );
};
