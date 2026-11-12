import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../types';
import { Award, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const BadgeGallery: React.FC = () => {
  const { badges, unlockedBadgeIds, lang } = useApp();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredBadges = badges.filter((b) => {
    const isUnlocked = unlockedBadgeIds.includes(b.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const unlockedCount = unlockedBadgeIds.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{lang === 'id' ? 'Galeri Lencana & Prestasi' : 'Badge Gallery'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'id'
              ? `${unlockedCount} dari ${badges.length} lencana telah kamu buka!`
              : `${unlockedCount} of ${badges.length} badges unlocked!`}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'unlocked'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Terbuka ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'locked'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Terkunci
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);

          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between hover:scale-102 ${
                isUnlocked
                  ? 'bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-800 dark:to-slate-800/80 border-amber-200 dark:border-amber-900/60 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 grayscale'
              }`}
            >
              <div className="relative my-2">
                <span className="text-4xl select-none">{badge.icon}</span>
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                  {lang === 'id' ? badge.nameId : badge.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {lang === 'id' ? badge.descId : badge.description}
                </p>
              </div>

              <div className="mt-2 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                +{badge.xp_reward} XP
              </div>
            </button>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200 dark:border-slate-700 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-5xl shadow-lg mb-3">
              {selectedBadge.icon}
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {lang === 'id' ? selectedBadge.nameId : selectedBadge.name}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {lang === 'id' ? selectedBadge.descId : selectedBadge.description}
            </p>

            <div className="my-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Hadiah: +{selectedBadge.xp_reward} XP</span>
            </div>

            <div className="text-[11px] text-slate-400 mb-4">
              {unlockedBadgeIds.includes(selectedBadge.id) ? (
                <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Telah kamu raih!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Selesaikan syarat untuk membuka lencana ini.
                </span>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
