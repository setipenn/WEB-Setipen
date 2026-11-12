import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, Quiz, QuizAttempt } from '../../types';
import { calculateScore, isAnswerCorrect } from '../../utils/gamification';
import { sounds, speakWord } from '../SoundEffects';
import confetti from 'canvas-confetti';
import {
  Heart,
  Clock,
  Zap,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ChevronRight,
  Flame,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface QuizPlayerProps {
  quiz: Quiz;
  onFinish: () => void;
  onExit: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onFinish, onExit }) => {
  const {
    questions: allQuestions,
    user,
    recordQuizAttempt,
    addXp,
    addCoins,
    usePowerUp,
    saveWordBankItem,
    lang,
  } = useApp();

  // Filter quiz questions
  const initialQuestions = React.useMemo(() => {
    const list = allQuestions.filter((q) => quiz.question_ids.includes(q.id));
    return quiz.shuffle_options ? [...list].sort(() => Math.random() - 0.5) : list;
  }, [quiz, allQuestions]);

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Power-up states
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_seconds || 20);
  const [hearts, setHearts] = useState(3);
  const [streakInQuiz, setStreakInQuiz] = useState(0);

  // Matching Question State
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [eng: string]: string }>({});

  // Drag & Drop / Scramble Token State
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // Result tracking
  const [answersLog, setAnswersLog] = useState<
    { question_id: string; user_answer: string; is_correct: boolean; time_taken: number }[]
  >([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [timeSpentTotal, setTimeSpentTotal] = useState(0);
  const [savedToBank, setSavedToBank] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTime = useRef<number>(Date.now());

  const currentQ = questions[currentIndex];

  // Setup question state
  useEffect(() => {
    if (!currentQ || quizFinished) return;

    setSelectedOption(null);
    setTypedAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setDisabledOptions([]);
    setSelectedEnglish(null);
    setMatchedPairs({});
    setTimeLeft(quiz.time_limit_seconds || 20);
    questionStartTime.current = Date.now();

    // Setup tokens for drag_drop or word_scramble
    if (currentQ.type === 'drag_drop' && currentQ.drag_tokens) {
      setAvailableTokens([...currentQ.drag_tokens].sort(() => Math.random() - 0.5));
      setSelectedTokens([]);
    } else if (currentQ.type === 'word_scramble') {
      const letters = currentQ.correct_answer.toUpperCase().split('');
      setAvailableTokens([...letters].sort(() => Math.random() - 0.5));
      setSelectedTokens([]);
    }

    // Auto-pronounce listening questions
    if (currentQ.type === 'listening' && currentQ.audio_word) {
      setTimeout(() => {
        speakWord(currentQ.audio_word!);
      }, 400);
    }

    // Timer countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentQ, quizFinished]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    submitAnswer('__timeout__');
  };

  const submitAnswer = (userAns: string) => {
    if (isAnswered || !currentQ) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Math.max(1, Math.round((Date.now() - questionStartTime.current) / 1000));
    setTimeSpentTotal((prev) => prev + timeTaken);

    let correct = false;
    if (currentQ.type === 'matching') {
      // Matching is verified when all pairs match
      const totalPairs = currentQ.matching_pairs?.length || 0;
      correct = Object.keys(matchedPairs).length >= totalPairs;
    } else if (currentQ.type === 'drag_drop') {
      correct = isAnswerCorrect(selectedTokens.join(' '), currentQ.correct_answer);
    } else if (currentQ.type === 'word_scramble') {
      correct = isAnswerCorrect(selectedTokens.join(''), currentQ.correct_answer);
    } else {
      correct = isAnswerCorrect(userAns, currentQ.correct_answer);
    }

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      const newStreak = streakInQuiz + 1;
      setStreakInQuiz(newStreak);
      const scoreRes = calculateScore(10, quiz.time_limit_seconds || 20, timeTaken, newStreak);
      setTotalXpEarned((prev) => prev + scoreRes.totalXp);
    } else {
      sounds.playWrong();
      setStreakInQuiz(0);
      setHearts((prev) => Math.max(0, prev - 1));
    }

    setAnswersLog((prev) => [
      ...prev,
      {
        question_id: currentQ.id,
        user_answer: userAns,
        is_correct: correct,
        time_taken: timeTaken,
      },
    ]);
  };

  // Next question or finish
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizFinished(true);

    const correctCount = answersLog.filter((a) => a.is_correct).length + (isCorrect ? 1 : 0);
    const score = Math.round((correctCount / questions.length) * 100);

    const attempt: QuizAttempt = {
      id: `att_${Date.now()}`,
      quiz_id: quiz.id,
      user_id: user.id,
      score,
      xp_earned: totalXpEarned,
      total_questions: questions.length,
      correct_count: correctCount,
      completed_at: new Date().toISOString(),
      time_spent_seconds: timeSpentTotal,
      answers: answersLog,
    };

    recordQuizAttempt(attempt);
    addXp(totalXpEarned, `Kuis: ${quiz.title}`);
    addCoins(Math.round(totalXpEarned * 0.2));

    if (score >= quiz.passing_score) {
      sounds.playLevelUp();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  // Power-up 1: 50/50
  const handleFiftyFifty = () => {
    if (!currentQ || currentQ.type !== 'multiple_choice' || !currentQ.options) return;
    if (disabledOptions.length > 0) return;
    if (usePowerUp('fifty_fifty')) {
      const wrong = currentQ.options.filter(
        (o) => !isAnswerCorrect(o, currentQ.correct_answer)
      );
      const toDisable = wrong.slice(0, 2);
      setDisabledOptions(toDisable);
    }
  };

  // Power-up 2: Extra Time (+15s)
  const handleExtraTime = () => {
    if (isAnswered) return;
    if (usePowerUp('extra_time')) {
      setTimeLeft((prev) => prev + 15);
    }
  };

  // Power-up 3: Skip Question
  const handleSkip = () => {
    if (isAnswered) return;
    if (usePowerUp('skip')) {
      handleNext();
    }
  };

  // Save difficult word to word bank
  const handleSaveToWordBank = (q: Question) => {
    const word = q.audio_word || q.correct_answer;
    saveWordBankItem({
      word,
      phonetic: '',
      part_of_speech: 'Vocab',
      indonesian: q.prompt_id || q.explanation,
      example_sentence: q.prompt,
      example_translation: q.explanation,
      major: q.major,
      mastery_status: 'learning',
      notes: `Disimpan dari kuis ${quiz.title}`,
    });
    setSavedToBank((prev) => ({ ...prev, [q.id]: true }));
  };

  // Retry only wrong questions
  const handleRetryWrong = () => {
    const wrongIds = answersLog.filter((a) => !a.is_correct).map((a) => a.question_id);
    const wrongQuestions = allQuestions.filter((q) => wrongIds.includes(q.id));
    if (wrongQuestions.length > 0) {
      setQuestions(wrongQuestions);
      setCurrentIndex(0);
      setAnswersLog([]);
      setQuizFinished(false);
      setHearts(3);
    }
  };

  if (!currentQ && !quizFinished) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl max-w-md mx-auto shadow-sm">
        <p className="text-slate-600 dark:text-slate-300">
          {lang === 'id' ? 'Soal untuk kuis ini sedang dipersiapkan.' : 'Questions are being prepared for this quiz.'}
        </p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold"
        >
          {lang === 'id' ? 'Kembali' : 'Go Back'}
        </button>
      </div>
    );
  }

  // ---------------- RESULT SCREEN ----------------
  if (quizFinished) {
    const correctCount = answersLog.filter((a) => a.is_correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const isPassed = score >= quiz.passing_score;

    return (
      <div className="max-w-xl mx-auto px-4 py-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
          {/* Header Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white shadow-lg mx-auto mb-4">
            {isPassed ? <Award className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>

          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            {isPassed
              ? lang === 'id'
                ? 'Luar Biasa! Kuis Selesai!'
                : 'Awesome! Quiz Complete!'
              : lang === 'id'
              ? 'Terus Berjuang! Jangan Menyerah!'
              : 'Keep Trying! Do Not Give Up!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {quiz.title} • {quiz.major}
          </p>

          {/* Score & XP Cards */}
          <div className="grid grid-cols-3 gap-2.5 my-6">
            <div className="bg-sky-50 dark:bg-sky-950/40 p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800">
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                {lang === 'id' ? 'Nilai' : 'Score'}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-300">
                {score}
              </p>
              <span className="text-[10px] text-slate-400">
                {correctCount} / {questions.length} Benar
              </span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                +XP Earned
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                +{totalXpEarned}
              </p>
              <span className="text-[10px] text-slate-400">
                +{Math.round(totalXpEarned * 0.2)} Koin
              </span>
            </div>

            <div className="bg-teal-50 dark:bg-teal-950/40 p-3.5 rounded-2xl border border-teal-200 dark:border-teal-800">
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                {lang === 'id' ? 'Waktu' : 'Time'}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-300">
                {timeSpentTotal}s
              </p>
              <span className="text-[10px] text-slate-400">
                {Math.round(timeSpentTotal / Math.max(1, questions.length))}s / soal
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {answersLog.some((a) => !a.is_correct) && (
              <button
                onClick={handleRetryWrong}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'id' ? 'Ulangi Soal Salah' : 'Retry Wrong Answers'}</span>
              </button>
            )}

            <button
              onClick={onFinish}
              className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{lang === 'id' ? 'Kembali ke Menu' : 'Back to Dashboard'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Wrong Answers Review Accordion */}
          {answersLog.some((a) => !a.is_correct) && (
            <div className="mt-8 text-left border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>{lang === 'id' ? 'Pembahasan Soal yang Perlu Dikuasai:' : 'Review Missed Questions:'}</span>
              </h3>
              <div className="space-y-3">
                {answersLog
                  .filter((a) => !a.is_correct)
                  .map((log, i) => {
                    const qItem = allQuestions.find((q) => q.id === log.question_id);
                    if (!qItem) return null;
                    const isSaved = savedToBank[qItem.id];

                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {qItem.prompt}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-2 text-[11px]">
                          <span className="text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded font-medium">
                            {lang === 'id' ? 'Jawabanmu:' : 'Your answer:'} {log.user_answer || '(Waktu Habis)'}
                          </span>
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
                            {lang === 'id' ? 'Kunci Benar:' : 'Correct:'} {qItem.correct_answer}
                          </span>
                        </div>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 italic">
                          💡 {qItem.explanation}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between">
                          <button
                            onClick={() => speakWord(qItem.audio_word || qItem.correct_answer)}
                            className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{lang === 'id' ? 'Dengar Pelafalan' : 'Listen'}</span>
                          </button>
                          <button
                            onClick={() => handleSaveToWordBank(qItem)}
                            disabled={isSaved}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              isSaved
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-200'
                            }`}
                          >
                            {isSaved
                              ? lang === 'id'
                                ? '✓ Tersimpan di Bank Kata'
                                : '✓ Saved'
                              : lang === 'id'
                              ? '+ Simpan ke Bank Kata'
                              : '+ Save to Word Bank'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- ACTIVE QUESTION SCREEN ----------------
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 animate-fade-in pb-24">
      {/* Quiz Top Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={onExit}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold px-2 py-1 rounded-lg"
        >
          {lang === 'id' ? '✕ Keluar' : '✕ Exit'}
        </button>

        {/* Progress bar */}
        <div className="flex-1 mx-2">
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Lives / Hearts */}
        <div className="flex items-center gap-1 text-red-500">
          {[1, 2, 3].map((h) => (
            <Heart
              key={h}
              className={`w-4 h-4 ${
                h <= hearts ? 'fill-red-500 text-red-500' : 'text-slate-300 dark:text-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Timer & Power-ups Row */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        {/* Countdown Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
            timeLeft <= 5
              ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 animate-pulse'
              : 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}s</span>
        </div>

        {/* In-quiz streak */}
        {streakInQuiz >= 2 && (
          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
            <Flame className="w-4 h-4 fill-amber-500 animate-bounce" />
            <span>{streakInQuiz}x Streak!</span>
          </div>
        )}

        {/* Power-up buttons */}
        <div className="flex items-center gap-1.5">
          {/* 50/50 */}
          {currentQ.type === 'multiple_choice' && (
            <button
              onClick={handleFiftyFifty}
              disabled={user.power_ups.fifty_fifty <= 0 || disabledOptions.length > 0 || isAnswered}
              className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[10px] font-black text-amber-600 hover:bg-amber-100 disabled:opacity-40 transition-colors"
              title="50/50: Buang 2 Pilihan Salah"
            >
              50/50 ({user.power_ups.fifty_fifty})
            </button>
          )}

          {/* Extra Time (+15s) */}
          <button
            onClick={handleExtraTime}
            disabled={user.power_ups.extra_time <= 0 || isAnswered}
            className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[10px] font-black text-teal-600 hover:bg-teal-100 disabled:opacity-40 transition-colors flex items-center gap-0.5"
            title="+15 Detik Waktu Tambahan"
          >
            <Zap className="w-3 h-3" />
            <span>+15s ({user.power_ups.extra_time})</span>
          </button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            disabled={user.power_ups.skip <= 0 || isAnswered}
            className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 transition-colors"
            title="Lewati Soal Tanpa Penalti"
          >
            Skip ({user.power_ups.skip})
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-700 relative">
        <div className="flex items-center justify-between mb-3 text-[11px] font-bold text-slate-400">
          <span className="uppercase tracking-wider">
            {lang === 'id' ? 'Soal' : 'Question'} {currentIndex + 1} / {questions.length} •{' '}
            <span className="text-sky-600 dark:text-sky-400">{currentQ.type.replace('_', ' ')}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 capitalize">
            {currentQ.difficulty}
          </span>
        </div>

        {/* Question Prompt */}
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-snug">
          {currentQ.prompt}
        </h3>
        {currentQ.prompt_id && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
            ({currentQ.prompt_id})
          </p>
        )}

        {/* Audio Speaker Button (For Listening type or words with pronunciation) */}
        {(currentQ.type === 'listening' || currentQ.audio_word) && (
          <div className="my-4 flex items-center justify-center">
            <button
              onClick={() => speakWord(currentQ.audio_word || currentQ.correct_answer)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span>{lang === 'id' ? 'Dengarkan Audio Kosakata' : 'Listen Audio Word'}</span>
            </button>
          </div>
        )}

        {/* ---------------- QUESTION TYPE RENDERING ---------------- */}

        {/* 1. Multiple Choice */}
        {currentQ.type === 'multiple_choice' && currentQ.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
            {currentQ.options.map((opt, i) => {
              const isDisabled = disabledOptions.includes(opt);
              const isSelected = selectedOption === opt;
              let btnStyle =
                'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800';

              if (isAnswered) {
                if (isAnswerCorrect(opt, currentQ.correct_answer)) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600';
                } else if (isSelected) {
                  btnStyle = 'bg-red-500 text-white border-red-600';
                } else {
                  btnStyle = 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400';
                }
              } else if (isSelected) {
                btnStyle = 'bg-sky-100 border-sky-400 text-sky-800';
              }

              return (
                <button
                  key={i}
                  disabled={isDisabled || isAnswered}
                  onClick={() => {
                    setSelectedOption(opt);
                    submitAnswer(opt);
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left font-semibold text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle} ${
                    isDisabled ? 'opacity-20 pointer-events-none' : ''
                  }`}
                >
                  <span>{opt}</span>
                  {isAnswered && isAnswerCorrect(opt, currentQ.correct_answer) && (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isAnswerCorrect(opt, currentQ.correct_answer) && (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. True / False */}
        {currentQ.type === 'true_false' && (
          <div className="grid grid-cols-2 gap-3 mt-5">
            {['True (Benar)', 'False (Salah)'].map((opt) => {
              const isSelected = selectedOption === opt;
              let style =
                'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-sky-50';

              if (isAnswered) {
                if (isAnswerCorrect(opt, currentQ.correct_answer)) {
                  style = 'bg-emerald-500 text-white border-emerald-600';
                } else if (isSelected) {
                  style = 'bg-red-500 text-white border-red-600';
                } else {
                  style = 'opacity-40 bg-slate-100';
                }
              }

              return (
                <button
                  key={opt}
                  disabled={isAnswered}
                  onClick={() => {
                    setSelectedOption(opt);
                    submitAnswer(opt);
                  }}
                  className={`py-4 rounded-2xl border-2 font-bold text-sm text-center transition-all ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Fill in the Blank */}
        {currentQ.type === 'fill_blank' && (
          <div className="mt-5 space-y-3">
            <input
              type="text"
              disabled={isAnswered}
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && typedAnswer.trim()) {
                  submitAnswer(typedAnswer);
                }
              }}
              placeholder={lang === 'id' ? 'Ketik jawaban kosakata di sini...' : 'Type your answer here...'}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:border-sky-500 focus:outline-none"
            />
            {!isAnswered && (
              <button
                disabled={!typedAnswer.trim()}
                onClick={() => submitAnswer(typedAnswer)}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                {lang === 'id' ? 'Kirim Jawaban' : 'Submit Answer'}
              </button>
            )}
          </div>
        )}

        {/* 4. Listening Question */}
        {currentQ.type === 'listening' && currentQ.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              let btnStyle =
                'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-sky-50';

              if (isAnswered) {
                if (isAnswerCorrect(opt, currentQ.correct_answer)) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600';
                } else if (isSelected) {
                  btnStyle = 'bg-red-500 text-white border-red-600';
                } else {
                  btnStyle = 'opacity-40';
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => {
                    setSelectedOption(opt);
                    submitAnswer(opt);
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left font-semibold text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isAnswerCorrect(opt, currentQ.correct_answer) && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 5. Matching Pairs */}
        {currentQ.type === 'matching' && currentQ.matching_pairs && (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-slate-500 italic">
              {lang === 'id'
                ? 'Klik kata Bahasa Inggris di kiri, lalu klik artinya di kanan:'
                : 'Click an English word on the left, then its Indonesian match on the right:'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Left Column: English Words */}
              <div className="space-y-2">
                {currentQ.matching_pairs.map((pair, idx) => {
                  const isMatched = !!matchedPairs[pair.english];
                  const isSelected = selectedEnglish === pair.english;

                  return (
                    <button
                      key={idx}
                      disabled={isMatched || isAnswered}
                      onClick={() => setSelectedEnglish(pair.english)}
                      className={`w-full p-2.5 rounded-xl border-2 text-xs font-bold transition-all text-left ${
                        isMatched
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                          : isSelected
                          ? 'bg-sky-100 dark:bg-sky-950 border-sky-500 text-sky-800 dark:text-sky-200 ring-2 ring-sky-400'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {pair.english}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Indonesian Meanings */}
              <div className="space-y-2">
                {[...currentQ.matching_pairs]
                  .sort((a, b) => a.indonesian.localeCompare(b.indonesian))
                  .map((pair, idx) => {
                    const matchedEng = Object.keys(matchedPairs).find(
                      (k) => matchedPairs[k] === pair.indonesian
                    );
                    const isMatched = !!matchedEng;

                    return (
                      <button
                        key={idx}
                        disabled={isMatched || isAnswered || !selectedEnglish}
                        onClick={() => {
                          if (!selectedEnglish) return;
                          // Verify if this is the correct match
                          const correctPair = currentQ.matching_pairs?.find(
                            (p) => p.english === selectedEnglish
                          );
                          if (correctPair && correctPair.indonesian === pair.indonesian) {
                            sounds.playCorrect();
                            const updated = { ...matchedPairs, [selectedEnglish]: pair.indonesian };
                            setMatchedPairs(updated);
                            setSelectedEnglish(null);

                            if (
                              Object.keys(updated).length >= (currentQ.matching_pairs?.length || 0)
                            ) {
                              submitAnswer('matched_all');
                            }
                          } else {
                            sounds.playWrong();
                            setSelectedEnglish(null);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border-2 text-xs font-medium transition-all text-left ${
                          isMatched
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {pair.indonesian}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* 6. Drag & Drop / Sentence Reorder & 7. Word Scramble */}
        {(currentQ.type === 'drag_drop' || currentQ.type === 'word_scramble') && (
          <div className="mt-5 space-y-4">
            {/* Slot Area */}
            <div className="min-h-14 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap gap-2 items-center">
              {selectedTokens.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  {lang === 'id' ? 'Ketuk token di bawah untuk menyusun:' : 'Tap tokens below to assemble:'}
                </span>
              ) : (
                selectedTokens.map((tok, idx) => (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => {
                      // Remove token from selected and return to available
                      setSelectedTokens((prev) => prev.filter((_, i) => i !== idx));
                      setAvailableTokens((prev) => [...prev, tok]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-xs hover:bg-red-500 transition-colors"
                  >
                    {tok} ✕
                  </button>
                ))
              )}
            </div>

            {/* Available Tokens */}
            <div className="flex flex-wrap gap-2">
              {availableTokens.map((tok, idx) => (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => {
                    setSelectedTokens((prev) => [...prev, tok]);
                    setAvailableTokens((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs hover:border-sky-500 hover:scale-105 transition-all"
                >
                  {tok}
                </button>
              ))}
            </div>

            {!isAnswered && (
              <button
                disabled={selectedTokens.length === 0}
                onClick={() =>
                  submitAnswer(
                    currentQ.type === 'word_scramble'
                      ? selectedTokens.join('')
                      : selectedTokens.join(' ')
                  )
                }
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                {lang === 'id' ? 'Periksa Jawaban' : 'Check Answer'}
              </button>
            )}
          </div>
        )}

        {/* ---------------- INSTANT FEEDBACK CARD ---------------- */}
        {isAnswered && (
          <div
            className={`mt-6 p-4 rounded-2xl border-2 transition-all ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">
                    {lang === 'id' ? 'Benar Sekali!' : 'Spot On! Excellent!'}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-extrabold text-sm text-red-700 dark:text-red-300">
                    {lang === 'id' ? 'Kurang Tepat!' : 'Incorrect'}
                  </span>
                </>
              )}
            </div>

            {!isCorrect && (
              <p className="text-xs text-red-800 dark:text-red-200 font-semibold mb-1">
                {lang === 'id' ? 'Jawaban Benar:' : 'Correct Answer:'}{' '}
                <span className="underline">{currentQ.correct_answer}</span>
              </p>
            )}

            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              💡 {currentQ.explanation}
            </p>

            {/* Pronunciation & Next Button */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => speakWord(currentQ.audio_word || currentQ.correct_answer)}
                className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                <Volume2 className="w-4 h-4" />
                <span>{lang === 'id' ? 'Dengar Pelafalan' : 'Pronounce'}</span>
              </button>

              <button
                onClick={handleNext}
                className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <span>
                  {currentIndex + 1 < questions.length
                    ? lang === 'id'
                      ? 'Lanjut'
                      : 'Next'
                    : lang === 'id'
                    ? 'Lihat Hasil'
                    : 'View Results'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
