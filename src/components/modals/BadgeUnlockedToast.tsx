import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Sparkles, X } from 'lucide-react';

export const BadgeUnlockedToast: React.FC = () => {
  const { newlyEarnedBadge, clearNewBadge, lang } = useApp();

  useEffect(() => {
    if (newlyEarnedBadge) {
      const timer = setTimeout(() => {
        clearNewBadge();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyEarnedBadge, clearNewBadge]);

  if (!newlyEarnedBadge) return null;

  return (
    <div className="fixed top-18 right-4 z-50 animate-bounce max-w-xs">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 p-4 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-3">
        <span className="text-3xl shrink-0">{newlyEarnedBadge.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {lang === 'id' ? 'Lencana Baru Terbuka!' : 'Badge Unlocked!'}
            </span>
          </div>
          <h4 className="font-black text-xs">
            {lang === 'id' ? newlyEarnedBadge.nameId : newlyEarnedBadge.name}
          </h4>
          <p className="text-[10px] text-amber-900 line-clamp-1">
            +{newlyEarnedBadge.xp_reward} XP
          </p>
        </div>
        <button onClick={clearNewBadge} className="p-1 hover:opacity-75">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
