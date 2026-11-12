import React from 'react';

export type MascotMood = 'happy' | 'thinking' | 'cheering' | 'worried' | 'proud';

interface MascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'happy',
  size = 'md',
  message,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform hover:scale-105 duration-200`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Owl Body */}
          <ellipse cx="60" cy="65" rx="42" ry="46" fill="#0284c7" />
          <ellipse cx="60" cy="70" rx="32" ry="36" fill="#e0f2fe" />

          {/* Feathers / Chest Pattern */}
          <path d="M52 64 Q60 70 68 64" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 74 Q60 80 70 74" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M54 84 Q60 90 66 84" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

          {/* Owl Ear Tufts */}
          <polygon points="30,30 20,10 44,22" fill="#0369a1" />
          <polygon points="90,30 100,10 76,22" fill="#0369a1" />

          {/* Wings */}
          {mood === 'cheering' ? (
            <>
              {/* Wings raised */}
              <path d="M22 65 C10 40 25 25 35 45" fill="#0284c7" />
              <path d="M98 65 C110 40 95 25 85 45" fill="#0284c7" />
            </>
          ) : (
            <>
              {/* Normal Wings */}
              <ellipse cx="22" cy="70" rx="9" ry="24" fill="#0369a1" transform="rotate(15 22 70)" />
              <ellipse cx="98" cy="70" rx="9" ry="24" fill="#0369a1" transform="rotate(-15 98 70)" />
            </>
          )}

          {/* Feet */}
          <ellipse cx="48" cy="110" rx="8" ry="4" fill="#f59e0b" />
          <ellipse cx="72" cy="110" rx="8" ry="4" fill="#f59e0b" />

          {/* Eyes Base */}
          <circle cx="44" cy="46" r="15" fill="#ffffff" stroke="#0369a1" strokeWidth="3" />
          <circle cx="76" cy="46" r="15" fill="#ffffff" stroke="#0369a1" strokeWidth="3" />

          {/* Eye Pupils based on Mood */}
          {mood === 'cheering' ? (
            <>
              {/* Star / Excited Eyes */}
              <path d="M44 38 L46 44 L52 46 L46 48 L44 54 L42 48 L36 46 L42 44 Z" fill="#f59e0b" />
              <path d="M76 38 L78 44 L84 46 L78 48 L76 54 L74 48 L68 46 L74 44 Z" fill="#f59e0b" />
            </>
          ) : mood === 'worried' ? (
            <>
              <circle cx="44" cy="44" r="7" fill="#1e293b" />
              <circle cx="76" cy="44" r="7" fill="#1e293b" />
              {/* Sweat drop */}
              <path d="M96 32 C96 28 92 24 92 24 C92 24 88 28 88 32 C88 34.2 89.8 36 92 36 C94.2 36 96 34.2 96 32 Z" fill="#38bdf8" />
            </>
          ) : mood === 'thinking' ? (
            <>
              {/* Looking up right */}
              <circle cx="48" cy="42" r="6" fill="#1e293b" />
              <circle cx="80" cy="42" r="6" fill="#1e293b" />
              <circle cx="49" cy="40" r="2" fill="#ffffff" />
              <circle cx="81" cy="40" r="2" fill="#ffffff" />
            </>
          ) : (
            <>
              {/* Happy Eyes */}
              <circle cx="45" cy="46" r="7" fill="#1e293b" />
              <circle cx="75" cy="46" r="7" fill="#1e293b" />
              <circle cx="43" cy="44" r="2.5" fill="#ffffff" />
              <circle cx="73" cy="44" r="2.5" fill="#ffffff" />
            </>
          )}

          {/* Safety Glasses / Vocational Specs */}
          <rect x="26" y="38" width="34" height="18" rx="8" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
          <rect x="60" y="38" width="34" height="18" rx="8" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
          <line x1="58" y1="46" x2="62" y2="46" stroke="#f59e0b" strokeWidth="3" />

          {/* Beak */}
          <polygon points="60,52 54,62 66,62" fill="#f97316" />

          {/* Proud Crown */}
          {mood === 'proud' && (
            <path
              d="M45 18 L50 28 L60 20 L70 28 L75 18 L72 32 L48 32 Z"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      {message && (
        <div className="relative bg-white dark:bg-slate-800 border-2 border-sky-200 dark:border-sky-900 rounded-2xl px-3.5 py-2 text-xs md:text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm max-w-xs animate-fade-in">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-white dark:border-r-slate-800 border-b-6 border-b-transparent"></div>
          {message}
        </div>
      )}
    </div>
  );
};
