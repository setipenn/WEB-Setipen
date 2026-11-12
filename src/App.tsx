/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { LearnView } from './components/materials/LearnView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileView } from './components/profile/ProfileView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { QuizPlayer } from './components/quiz/QuizPlayer';
import { LiveQuizHostAndJoin } from './components/livequiz/LiveQuizHostAndJoin';
import { GeminiTutorModal } from './components/ai/GeminiTutorModal';
import { VirtualShopModal } from './components/shop/VirtualShopModal';
import { CertificateModal } from './components/certificate/CertificateModal';
import { LevelUpModal } from './components/modals/LevelUpModal';
import { BadgeUnlockedToast } from './components/modals/BadgeUnlockedToast';
import { Quiz, Major } from './types';
import { MAJOR_LIST } from './data/seedData';
import {
  Layers,
  Clock,
  Play,
  Zap,
  Sparkles,
  Users,
  Search,
  BookOpen,
} from 'lucide-react';

function AppContent() {
  const { user, role, quizzes, lang } = useApp();

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Modals
  const [showShop, setShowShop] = useState(false);
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [showLiveQuiz, setShowLiveQuiz] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Quiz Tab Filtering
  const [quizMajorFilter, setQuizMajorFilter] = useState<string>('ALL');
  const [quizSearch, setQuizSearch] = useState('');

  // If a quiz is actively being played, display full-screen QuizPlayer
  if (activeQuiz) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <QuizPlayer
          quiz={activeQuiz}
          onFinish={() => setActiveQuiz(null)}
          onExit={() => setActiveQuiz(null)}
        />
        <LevelUpModal />
        <BadgeUnlockedToast />
      </div>
    );
  }

  // Quizzes list for the "quiz" tab
  const filteredQuizzes = quizzes.filter((q) => {
    const matchMajor = quizMajorFilter === 'ALL' || q.major === quizMajorFilter || q.major === 'UMUM';
    const matchSearch =
      q.title.toLowerCase().includes(quizSearch.toLowerCase()) ||
      q.description.toLowerCase().includes(quizSearch.toLowerCase());
    return matchMajor && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenShop={() => setShowShop(true)}
        onOpenAiTutor={() => setShowAiTutor(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-6">
        {/* TAB 1: HOME */}
        {currentTab === 'home' && (
          <>
            {role === 'teacher' || role === 'admin' ? (
              <TeacherDashboard />
            ) : (
              <StudentDashboard
                onStartQuiz={(q) => setActiveQuiz(q)}
                onNavigateTab={(t) => setCurrentTab(t)}
                onOpenLiveQuiz={() => setShowLiveQuiz(true)}
                onOpenAiTutor={() => setShowAiTutor(true)}
              />
            )}
          </>
        )}

        {/* TAB 2: LEARN (Materials & Flashcards) */}
        {currentTab === 'learn' && <LearnView />}

        {/* TAB 3: QUIZ CATALOG */}
        {currentTab === 'quiz' && (
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-5 animate-fade-in pb-20">
            {/* Header with Live Quiz Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner shrink-0">
                  ⚡
                </div>
                <div>
                  <h2 className="text-lg font-black">
                    {lang === 'id' ? 'Live Quiz Room (Kahoot-Style)' : 'Live Interactive Quiz'}
                  </h2>
                  <p className="text-xs text-amber-100">
                    {lang === 'id'
                      ? 'Tanding bersama teman sekelas atau buat room baru untuk muridmu!'
                      : 'Compete in realtime with classmates!'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLiveQuiz(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white text-amber-950 font-black text-xs shadow-md hover:bg-amber-50 transition-all hover:scale-105 active:scale-95"
              >
                {lang === 'id' ? 'Buka Live Quiz' : 'Launch Live Room'}
              </button>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  placeholder={lang === 'id' ? 'Cari judul kuis...' : 'Search quizzes...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <select
                value={quizMajorFilter}
                onChange={(e) => setQuizMajorFilter(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">{lang === 'id' ? 'Semua Jurusan' : 'All Majors'}</option>
                {MAJOR_LIST.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.nameId}
                  </option>
                ))}
              </select>
            </div>

            {/* Quiz Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950">
                        {quiz.major}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {quiz.time_limit_seconds}s / soal
                      </span>
                    </div>

                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">
                      {quiz.question_ids.length} Soal • KKM {quiz.passing_score}
                    </span>

                    <button
                      onClick={() => setActiveQuiz(quiz)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 hover:scale-103 active:scale-97 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{lang === 'id' ? 'Mulai Kuis' : 'Start'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD */}
        {currentTab === 'leaderboard' && <LeaderboardView />}

        {/* TAB 5: PROFILE & WORD BANK */}
        {currentTab === 'profile' && (
          <ProfileView
            onOpenCertificate={() => setShowCertificate(true)}
            onOpenShop={() => setShowShop(true)}
          />
        )}

        {/* TAB 6: TEACHER DASHBOARD */}
        {currentTab === 'teacher' && <TeacherDashboard />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(t) => setCurrentTab(t)}
        onOpenAiTutor={() => setShowAiTutor(true)}
      />

      {/* Global Modals & Overlays */}
      {showAiTutor && <GeminiTutorModal onClose={() => setShowAiTutor(false)} />}
      {showShop && <VirtualShopModal onClose={() => setShowShop(false)} />}
      {showLiveQuiz && <LiveQuizHostAndJoin onClose={() => setShowLiveQuiz(false)} />}
      {showCertificate && <CertificateModal onClose={() => setShowCertificate(false)} />}
      <LevelUpModal />
      <BadgeUnlockedToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
