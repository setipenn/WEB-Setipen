import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getLevelFromXp } from '../../utils/gamification';
import { Mascot } from '../Mascot';
import { speakWord } from '../SoundEffects';
import { MAJOR_LIST, WORD_OF_THE_DAY } from '../../data/seedData';
import { Quiz, Major } from '../../types';
import {
  Flame,
  Award,
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Play,
  Users,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';

interface StudentDashboardProps {
  onStartQuiz: (quiz: Quiz) => void;
  onNavigateTab: (tab: any) => void;
  onOpenLiveQuiz: () => void;
  onOpenAiTutor: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartQuiz,
  onNavigateTab,
  onOpenLiveQuiz,
  onOpenAiTutor,
}) => {
  const {
    user,
    quizzes,
    dailyMissions,
    claimDailyMission,
    joinClassWithCode,
    updateUserMajor,
    saveWordBankItem,
    addXp,
    lang,
  } = useApp();

  const [classCodeInput, setClassCodeInput] = useState('');
  const [classJoinStatus, setClassJoinStatus] = useState<{
    show: boolean;
    success: boolean;
    msg: string;
  } | null>(null);

  // Word of the day mini quiz
  const [wotdSelected, setWotdSelected] = useState<string | null>(null);
  const [wotdAnswered, setWotdAnswered] = useState(false);

  const levelInfo = getLevelFromXp(user.xp);

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    const res = joinClassWithCode(classCodeInput);
    setClassJoinStatus({ show: true, success: res.success, msg: res.message });
    if (res.success) {
      setClassCodeInput('');
    }
  };

  const handleWotdAnswer = (option: string) => {
    if (wotdAnswered) return;
    setWotdSelected(option);
    setWotdAnswered(true);
    if (option === WORD_OF_THE_DAY.quiz_correct) {
      addXp(20, 'Word of the day mini-quiz');
    }
  };

  const handleSaveWotd = () => {
    saveWordBankItem({
      word: WORD_OF_THE_DAY.word,
      phonetic: WORD_OF_THE_DAY.phonetic,
      part_of_speech: WORD_OF_THE_DAY.part_of_speech,
      indonesian: WORD_OF_THE_DAY.indonesian,
      example_sentence: WORD_OF_THE_DAY.example_sentence,
      example_translation: WORD_OF_THE_DAY.example_translation,
      major: user.major,
      mastery_status: 'learning',
      notes: 'Kata Hari Ini (Word of the Day)',
    });
  };

  // Filter quizzes for the active major
  const majorQuizzes = quizzes.filter(
    (q) => q.major === user.major || q.major === 'UMUM'
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6 pb-20">
      {/* 1. Mascot Greeting & Level Progress Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-700 to-teal-700 text-white p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Mascot mood="happy" size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-sky-100">
                  {user.class_name || 'Siswa SMK'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold">
                  {user.streak} {lang === 'id' ? 'Hari Streak 🔥' : 'Days Streak 🔥'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">
                {lang === 'id' ? `Halo, ${user.nickname || user.name}!` : `Hi, ${user.nickname || user.name}!`}
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 mt-0.5">
                {lang === 'id'
                  ? `Siap kuasai kosakata Bahasa Inggris untuk jurusan ${user.major}?`
                  : `Ready to master vocational English for ${user.major}?`}
              </p>
            </div>
          </div>

          {/* AI Tutor Callout Button */}
          <button
            onClick={onOpenAiTutor}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-amber-950" />
            <span>{lang === 'id' ? 'Tanya Kak Voca AI' : 'Ask Kak Voca AI'}</span>
          </button>
        </div>

        {/* Level XP Bar inside Hero */}
        <div className="mt-5 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{levelInfo.badgeIcon}</span>
              <span className="text-amber-300 font-extrabold">
                Level {levelInfo.level}
              </span>
              <span className="text-white/80 font-medium">
                • {lang === 'id' ? levelInfo.rankTitleId : levelInfo.rankTitleEn}
              </span>
            </div>
            <span className="text-white/90">
              {levelInfo.xpInCurrentLevel} / {levelInfo.xpNeededForNextLevel} XP
            </span>
          </div>

          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-inner"
              style={{ width: `${levelInfo.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Join Class with Code Card (Compact) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>{lang === 'id' ? 'Gabung Kelas Kejuruan' : 'Join Vocational Class'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.class_name
                ? lang === 'id'
                  ? `Kamu terdaftar di ${user.class_name} (${user.school_name || 'SMK'}). Ingin pindah kelas?`
                  : `Enrolled in ${user.class_name}. Want to join another class?`
                : lang === 'id'
                ? 'Masukkan 6 karakter kode kelas dari guru (contoh: TKJ10A, AKU11A)'
                : 'Enter 6-character code from your teacher'}
            </p>
          </div>

          <form onSubmit={handleJoinClass} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              maxLength={6}
              value={classCodeInput}
              onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
              placeholder="KODE: TKJ10A"
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white tracking-widest uppercase focus:outline-none focus:border-sky-500 w-32"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              {lang === 'id' ? 'Gabung' : 'Join'}
            </button>
          </form>
        </div>

        {classJoinStatus?.show && (
          <div
            className={`mt-2.5 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              classJoinStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200'
            }`}
          >
            {classJoinStatus.success ? <CheckCircle2 className="w-4 h-4" /> : '✕'}
            <span>{classJoinStatus.msg}</span>
          </div>
        )}
      </div>

      {/* 3. Major (Jurusan) Selector Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>{lang === 'id' ? 'Pilih Paket Kosakata Jurusan:' : 'Vocational Major Packs:'}</span>
          </h2>
          <span className="text-[11px] text-slate-500">
            {lang === 'id' ? 'Aktif:' : 'Active:'} <strong className="text-sky-600">{user.major}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MAJOR_LIST.map((m) => {
            const isActive = user.major === m.id;
            return (
              <button
                key={m.id}
                onClick={() => updateUserMajor(m.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-102'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.id}</span>
                {isActive && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Two-Column Layout: Word of the Day + Daily Missions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Word of the Day */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl p-5 border border-amber-200/80 dark:border-slate-700 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500 text-white">
              {lang === 'id' ? 'Kata Hari Ini' : 'Word of the Day'}
            </span>
            <button
              onClick={() => speakWord(WORD_OF_THE_DAY.word)}
              className="p-1.5 rounded-full bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs hover:scale-110 transition-transform"
              title="Dengar Pelafalan"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {WORD_OF_THE_DAY.word}
              </h3>
              <span className="text-xs text-slate-500 italic">
                {WORD_OF_THE_DAY.phonetic} • {WORD_OF_THE_DAY.part_of_speech}
              </span>
            </div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              {WORD_OF_THE_DAY.indonesian}
            </p>

            <div className="mt-2.5 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-100 dark:border-slate-700/60 text-xs">
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                "{WORD_OF_THE_DAY.example_sentence}"
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 italic">
                {WORD_OF_THE_DAY.example_translation}
              </p>
            </div>

            {/* Mini Quiz within Word of the Day */}
            <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-700">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                🎯 {WORD_OF_THE_DAY.quiz_question}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {WORD_OF_THE_DAY.quiz_options.map((opt) => {
                  const isSelected = wotdSelected === opt;
                  let style = 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200';
                  if (wotdAnswered) {
                    if (opt === WORD_OF_THE_DAY.quiz_correct) {
                      style = 'bg-emerald-500 text-white font-bold';
                    } else if (isSelected) {
                      style = 'bg-red-500 text-white';
                    } else {
                      style = 'opacity-40';
                    }
                  }
                  return (
                    <button
                      key={opt}
                      disabled={wotdAnswered}
                      onClick={() => handleWotdAnswer(opt)}
                      className={`p-1.5 rounded-lg border border-amber-200/50 dark:border-slate-600 text-[11px] font-semibold text-center transition-all ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 flex justify-end">
                <button
                  onClick={handleSaveWotd}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>+ Simpan ke Bank Kataku</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Missions */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              {lang === 'id' ? 'Misi Harian' : 'Daily Missions'}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">
              Reset 24:00 WIB
            </span>
          </div>

          <div className="space-y-3">
            {dailyMissions.map((m) => {
              const progressPct = Math.min(100, Math.round((m.current / m.goal) * 100));
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {lang === 'id' ? m.title_id : m.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {m.current}/{m.goal}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    {m.claimed ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" />
                        {lang === 'id' ? 'Klaim' : 'Done'}
                      </span>
                    ) : m.completed ? (
                      <button
                        onClick={() => claimDailyMission(m.id)}
                        className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-[11px] shadow-xs animate-bounce"
                      >
                        Klaim +{m.xp_reward}XP
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        +{m.xp_reward}XP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Quiz Banner */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  {lang === 'id' ? 'Kuis Live Kelas (Kahoot-Style)' : 'Live Class Quiz'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {lang === 'id' ? 'Tanding bareng teman sekelas dengan PIN' : 'Join live room with 6-digit PIN'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenLiveQuiz}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
            >
              {lang === 'id' ? 'Masuk PIN' : 'Enter PIN'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Assigned & Major Quizzes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {lang === 'id' ? `Daftar Kuis Jurusan ${user.major}` : `${user.major} Quiz Pack`}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'id' ? 'Uji pemahaman kosakata teknismu dan raih XP' : 'Test your technical vocabulary'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('quiz')}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>{lang === 'id' ? 'Lihat Semua Kuis' : 'View All'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {majorQuizzes.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    {q.major}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {q.time_limit_seconds}s / soal
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  {q.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {q.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {q.question_ids.length} {lang === 'id' ? 'Soal Variatif' : 'Questions'}
                </span>

                <button
                  onClick={() => onStartQuiz(q)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 hover:scale-103 active:scale-97 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{lang === 'id' ? 'Mulai Kuis' : 'Start'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
