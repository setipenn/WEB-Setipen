import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaderboardEntry } from '../../types';
import {
  Trophy,
  Crown,
  Flame,
  Users,
  Building,
  Layers,
  Calendar,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { user, lang } = useApp();

  type TabType = 'class' | 'school' | 'major' | 'weekly' | 'all_time';
  const [activeTab, setActiveTab] = useState<TabType>('class');
  const [hideRealNames, setHideRealNames] = useState(false);

  // Generate realistic leaderboard entries
  const mockEntries: LeaderboardEntry[] = [
    {
      user_id: 'u_1',
      name: 'Aditya Pratama',
      nickname: 'AditCyber',
      avatar: '👨‍💻',
      avatar_frame: 'frame_crown',
      title: 'Pendekar Bahasa',
      major: 'TKJ',
      class_name: 'X TKJ 1',
      school_name: 'SMK Negeri 1 Jakarta',
      xp: 2840,
      level: 14,
      streak: 12,
      rank: 1,
    },
    {
      user_id: 'u_2',
      name: 'Dewi Anggraini',
      nickname: 'DewiAccount',
      avatar: '👩‍💼',
      avatar_frame: 'frame_gold',
      title: 'Pemburu Kata',
      major: 'AKUNTANSI',
      class_name: 'XI Akuntansi 1',
      school_name: 'SMK Negeri 1 Jakarta',
      xp: 2310,
      level: 11,
      streak: 9,
      rank: 2,
    },
    {
      user_id: 'u_3',
      name: 'Fauzan Ramadhan',
      nickname: 'ZanMechanic',
      avatar: '👨‍🔧',
      avatar_frame: 'frame_neon',
      title: 'Pemburu Kata',
      major: 'OTOMOTIF',
      class_name: 'X Otomotif 2',
      school_name: 'SMK Negeri 1 Jakarta',
      xp: 1950,
      level: 9,
      streak: 7,
      rank: 3,
    },
    {
      user_id: user.id, // Current user
      name: user.name,
      nickname: user.nickname || 'BudiTech',
      avatar: user.avatar,
      avatar_frame: user.avatar_frame,
      title: user.title || 'Penjelajah Kosakata',
      major: user.major,
      class_name: user.class_name || 'X TKJ 1',
      school_name: user.school_name || 'SMK Negeri 1 Jakarta',
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      rank: 4,
      is_current_user: true,
    },
    {
      user_id: 'u_5',
      name: 'Siti Rahmawati',
      nickname: 'SitiHospitality',
      avatar: '👩‍🍳',
      title: 'Penjelajah Kosakata',
      major: 'PERHOTELAN',
      class_name: 'XII Perhotelan',
      school_name: 'SMK Negeri 1 Jakarta',
      xp: 1280,
      level: 6,
      streak: 4,
      rank: 5,
    },
    {
      user_id: 'u_6',
      name: 'Bambang Irawan',
      nickname: 'BambangCoder',
      avatar: '👨‍💻',
      title: 'Penjelajah Kosakata',
      major: 'RPL',
      class_name: 'X RPL 1',
      school_name: 'SMK Negeri 1 Jakarta',
      xp: 990,
      level: 5,
      streak: 3,
      rank: 6,
    },
    {
      user_id: 'u_7',
      name: 'Nur Aisyah',
      nickname: 'NurseAisyah',
      avatar: '👩‍⚕️',
      title: 'Pemula Kejuruan',
      major: 'KEPERAWATAN',
      class_name: 'XI Keperawatan',
      school_name: 'SMK Negeri 1 Jakarta',
      xp: 820,
      level: 4,
      streak: 2,
      rank: 7,
    },
  ];

  // Re-sort based on active user's actual XP
  const sortedEntries = [...mockEntries]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

  const top3 = sortedEntries.slice(0, 3);
  const remaining = sortedEntries.slice(3);
  const currentUserEntry = sortedEntries.find((e) => e.is_current_user);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>{lang === 'id' ? 'Papan Peringkat Vokasi' : 'Vocational Leaderboard'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'id'
              ? 'Tunjukkan konsistensi belajar kosakata Bahasa Inggris dan raih posisi teratas!'
              : 'Compete for the top vocational English ranking!'}
          </p>
        </div>

        {/* Privacy Toggle (Nicknames only) */}
        <button
          onClick={() => setHideRealNames(!hideRealNames)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors self-start sm:self-auto"
          title="Mode Anonim / Nickname Only"
        >
          {hideRealNames ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{hideRealNames ? 'Hanya Nickname' : 'Nama Lengkap'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'class', labelId: 'Kelas', labelEn: 'Class', icon: Users },
          { id: 'school', labelId: 'Sekolah', labelEn: 'School', icon: Building },
          { id: 'major', labelId: 'Jurusan', labelEn: 'Major', icon: Layers },
          { id: 'weekly', labelId: 'Mingguan', labelEn: 'Weekly', icon: Calendar },
          { id: 'all_time', labelId: 'Sepanjang Waktu', labelEn: 'All Time', icon: Crown },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? tab.labelId : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium Display */}
      {top3.length >= 3 && (
        <div className="pt-8 pb-4">
          <div className="flex items-end justify-center gap-2 sm:gap-4 max-w-md mx-auto">
            {/* 2nd Place (Silver) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                <span className="text-3xl">{top3[1].avatar}</span>
                <span className="absolute -top-3 -right-2 text-lg">🥈</span>
              </div>
              <p className="font-extrabold text-xs text-slate-800 dark:text-white truncate max-w-[90px] text-center">
                {hideRealNames ? top3[1].nickname : top3[1].name}
              </p>
              <span className="text-[10px] font-bold text-slate-400">
                {top3[1].xp} XP
              </span>
              <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600 h-24 rounded-t-2xl flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-xl shadow-inner mt-2">
                2
              </div>
            </div>

            {/* 1st Place (Gold) - Elevated */}
            <div className="flex-1 flex flex-col items-center -mt-6">
              <div className="relative mb-2">
                <Crown className="w-6 h-6 text-amber-500 fill-amber-400 mx-auto animate-bounce" />
                <span className="text-4xl">{top3[0].avatar}</span>
                <span className="absolute -top-1 -right-2 text-xl">🥇</span>
              </div>
              <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[110px] text-center">
                {hideRealNames ? top3[0].nickname : top3[0].name}
              </p>
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                {top3[0].xp} XP
              </span>
              <div className="w-full bg-gradient-to-t from-amber-400 to-yellow-300 dark:from-amber-600 dark:to-yellow-500 h-32 rounded-t-2xl flex items-center justify-center font-black text-amber-950 dark:text-white text-2xl shadow-lg mt-2">
                1
              </div>
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                <span className="text-3xl">{top3[2].avatar}</span>
                <span className="absolute -top-3 -right-2 text-lg">🥉</span>
              </div>
              <p className="font-extrabold text-xs text-slate-800 dark:text-white truncate max-w-[90px] text-center">
                {hideRealNames ? top3[2].nickname : top3[2].name}
              </p>
              <span className="text-[10px] font-bold text-slate-400">
                {top3[2].xp} XP
              </span>
              <div className="w-full bg-gradient-to-t from-amber-700/40 to-amber-600/30 dark:from-amber-900 dark:to-amber-800 h-18 rounded-t-2xl flex items-center justify-center font-black text-amber-900 dark:text-amber-200 text-xl shadow-inner mt-2">
                3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranked List (Positions 4+) */}
      <div className="space-y-2">
        {remaining.map((entry) => {
          const isCurrentUser = entry.is_current_user;
          return (
            <div
              key={entry.user_id}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isCurrentUser
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-700 shadow-sm ring-2 ring-sky-300 dark:ring-sky-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-xs sm:text-sm text-slate-400">
                  #{entry.rank}
                </span>
                <span className="text-2xl">{entry.avatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                      {hideRealNames ? entry.nickname : entry.name}
                    </p>
                    {isCurrentUser && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-sky-600 text-white">
                        {lang === 'id' ? 'Kamu' : 'You'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {entry.class_name} • {entry.major} • Lvl {entry.level}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  {entry.xp} XP
                </p>
                <div className="flex items-center justify-end gap-1 text-[11px] text-amber-600 font-bold">
                  <Flame className="w-3 h-3 fill-amber-500" />
                  <span>{entry.streak}d</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Rank if user is outside top */}
      {currentUserEntry && currentUserEntry.rank > 3 && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-500 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm">Peringkat #{currentUserEntry.rank}</span>
            <span className="text-xs opacity-90">• Tingkatkan XP untuk tembus 3 besar!</span>
          </div>
          <span className="font-black text-sm">{currentUserEntry.xp} XP</span>
        </div>
      )}
    </div>
  );
};
