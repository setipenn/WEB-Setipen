import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveParticipant, LiveRoom, Question } from '../../types';
import { sounds, speakWord } from '../SoundEffects';
import confetti from 'canvas-confetti';
import {
  Users,
  Play,
  Flame,
  Award,
  Crown,
  Sparkles,
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface LiveQuizProps {
  onClose: () => void;
}

export const LiveQuizHostAndJoin: React.FC<LiveQuizProps> = ({ onClose }) => {
  const { user, questions, quizzes, role, addXp, lang } = useApp();

  const [mode, setMode] = useState<'lobby' | 'host' | 'student'>('lobby');
  const [pinInput, setPinInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState(user.nickname || user.name);

  // Live Room State
  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || '');
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15);
  const [userAnswered, setUserAnswered] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  // Questions for current quiz
  const activeQuiz = quizzes.find((q) => q.id === (room?.quiz_id || selectedQuizId));
  const activeQuestions = questions.filter((q) => activeQuiz?.question_ids.includes(q.id));
  const currentQ: Question | undefined = room
    ? activeQuestions[room.current_question_index]
    : undefined;

  // 1. Host creates room
  const handleHostCreateRoom = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const newRoom: LiveRoom = {
      pin: randomPin,
      title: activeQuiz?.title || 'Live Vocational Vocab Quiz',
      host_id: user.id,
      host_name: user.name,
      quiz_id: selectedQuizId,
      status: 'waiting',
      current_question_index: 0,
      participants: [
        {
          user_id: user.id,
          nickname: `${user.name} (Host)`,
          avatar: user.avatar,
          score: 0,
          streak: 0,
        },
        // Pre-joined simulated classmates for rich live demo
        {
          user_id: 'p_2',
          nickname: 'Siti_Akuntansi',
          avatar: '👩‍💼',
          score: 0,
          streak: 0,
        },
        {
          user_id: 'p_3',
          nickname: 'Rizky_Otomotif',
          avatar: '👨‍🔧',
          score: 0,
          streak: 0,
        },
        {
          user_id: 'p_4',
          nickname: 'Ahmad_TKJ',
          avatar: '👨‍💻',
          score: 0,
          streak: 0,
        },
      ],
    };

    setRoom(newRoom);
    setMode('host');
    sounds.playCorrect();
  };

  // 2. Student joins room
  const handleStudentJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    // Create or join room
    const joinedRoom: LiveRoom = {
      pin: pinInput.trim(),
      title: activeQuiz?.title || 'Live Vocational Vocab Quiz',
      host_id: 'teacher_host',
      host_name: 'Pak Hendra (Guru)',
      quiz_id: quizzes[0]?.id || '',
      status: 'waiting',
      current_question_index: 0,
      participants: [
        {
          user_id: 'p_1',
          nickname: 'Bambang_TKJ',
          avatar: '👨‍💻',
          score: 450,
          streak: 2,
        },
        {
          user_id: user.id,
          nickname: nicknameInput.trim() || user.name,
          avatar: user.avatar,
          score: 0,
          streak: 0,
        },
        {
          user_id: 'p_3',
          nickname: 'Dewi_Finance',
          avatar: '👩‍💼',
          score: 320,
          streak: 1,
        },
      ],
    };

    setRoom(joinedRoom);
    setMode('student');
    sounds.playCorrect();
  };

  // Host starts the game
  const handleStartGame = () => {
    if (!room) return;
    setRoom((prev) => (prev ? { ...prev, status: 'question', current_question_index: 0 } : null));
    setQuestionTimeLeft(15);
    setUserAnswered(null);
    sounds.playLevelUp();
  };

  // Question Timer
  useEffect(() => {
    if (!room || room.status !== 'question') return;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleShowScoreboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.status, room?.current_question_index]);

  const handleStudentAnswer = (option: string) => {
    if (userAnswered || !currentQ) return;
    setUserAnswered(option);

    const isCorrect = option.toLowerCase() === currentQ.correct_answer.toLowerCase();
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      sounds.playCorrect();
      const points = 100 + questionTimeLeft * 10;
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user_id === user.id
              ? {
                  ...p,
                  score: p.score + points,
                  streak: p.streak + 1,
                  last_answer_correct: true,
                }
              : p
          ),
        };
      });
    } else {
      sounds.playWrong();
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user_id === user.id
              ? {
                  ...p,
                  streak: 0,
                  last_answer_correct: false,
                }
              : p
          ),
        };
      });
    }
  };

  const handleShowScoreboard = () => {
    setRoom((prev) => {
      if (!prev) return null;
      // Simulate bots getting scores
      const updatedParticipants = prev.participants.map((p) => {
        if (p.user_id !== user.id) {
          const gotCorrect = Math.random() > 0.35;
          return {
            ...p,
            score: gotCorrect ? p.score + Math.floor(80 + Math.random() * 50) : p.score,
            streak: gotCorrect ? p.streak + 1 : 0,
          };
        }
        return p;
      });

      return {
        ...prev,
        status: 'scoreboard',
        participants: updatedParticipants,
      };
    });
  };

  const handleNextQuestion = () => {
    if (!room) return;
    if (room.current_question_index + 1 < activeQuestions.length) {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              status: 'question',
              current_question_index: prev.current_question_index + 1,
            }
          : null
      );
      setQuestionTimeLeft(15);
      setUserAnswered(null);
    } else {
      // Finished
      setRoom((prev) => (prev ? { ...prev, status: 'finished' } : null));
      sounds.playLevelUp();
      confetti({ particleCount: 150, spread: 90 });
      addXp(150, 'Live Quiz completed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
        >
          ✕ Tutup
        </button>

        {/* ---------------- 1. LOBBY SELECTOR ---------------- */}
        {mode === 'lobby' && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto text-3xl shadow-lg">
              ⚡
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Live Quiz Vokasi (Kahoot-Style)
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Main bareng secara realtime! Tampilkan PIN di layar kelas/proyektor, siswa menjawab serentak di ponsel masing-masing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Join as Student */}
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-left">
                <h3 className="font-bold text-sm text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Siswa (Gabung Room)</span>
                </h3>
                <form onSubmit={handleStudentJoin} className="mt-3 space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="PIN 6-DIGIT (e.g. 834192)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 text-xs font-mono font-bold tracking-widest text-center uppercase"
                  />
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    placeholder="Nickname Kamu"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 text-xs font-semibold"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-xs"
                  >
                    Masuk Kuis Live
                  </button>
                </form>
              </div>

              {/* Host as Teacher */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>Guru / Host (Mulai Room)</span>
                  </h3>
                  <div className="mt-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Pilih Paket Kuis:
                    </label>
                    <select
                      value={selectedQuizId}
                      onChange={(e) => setSelectedQuizId(e.target.value)}
                      className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-xs font-bold"
                    >
                      {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                          [{q.major}] {q.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleHostCreateRoom}
                  className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs"
                >
                  Generate Room & PIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. WAITING LOBBY (PIN DISPLAY) ---------------- */}
        {room && room.status === 'waiting' && (
          <div className="text-center space-y-4 py-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800">
              Menunggu Siswa Bergabung
            </span>

            <div>
              <p className="text-xs text-slate-400">PIN Game Kuis:</p>
              <h2 className="text-4xl font-black font-mono tracking-widest text-sky-600 dark:text-sky-400 my-1">
                {room.pin}
              </h2>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {room.title}
              </p>
            </div>

            {/* Participants in Lobby */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-500 mb-2">
                Peserta di Lobby ({room.participants.length}):
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {room.participants.map((p, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold shadow-xs animate-bounce"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <span>{p.avatar}</span>
                    <span>{p.nickname}</span>
                  </span>
                ))}
              </div>
            </div>

            {mode === 'host' ? (
              <button
                onClick={handleStartGame}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Pertandingan Sekarang!</span>
              </button>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Menunggu Host / Guru memulai kuis...
              </p>
            )}
          </div>
        )}

        {/* ---------------- 3. LIVE QUESTION VIEW ---------------- */}
        {room && room.status === 'question' && currentQ && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">
                Soal {room.current_question_index + 1} / {activeQuestions.length}
              </span>
              <span className="flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {questionTimeLeft}s
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
              {currentQ.prompt}
            </h3>

            {/* Multiple Choice Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {(currentQ.options || [currentQ.correct_answer, 'Incorrect 1', 'Incorrect 2', 'Incorrect 3']).map(
                (opt, i) => {
                  const colors = [
                    'bg-red-500 hover:bg-red-600',
                    'bg-blue-500 hover:bg-blue-600',
                    'bg-amber-500 hover:bg-amber-600',
                    'bg-emerald-500 hover:bg-emerald-600',
                  ];
                  const isSelected = userAnswered === opt;

                  return (
                    <button
                      key={i}
                      disabled={userAnswered !== null}
                      onClick={() => handleStudentAnswer(opt)}
                      className={`min-h-20 p-3 rounded-2xl text-white font-extrabold text-xs sm:text-sm text-center shadow-md transition-all flex items-center justify-center ${
                        colors[i % 4]
                      } ${isSelected ? 'ring-4 ring-white scale-103' : ''}`}
                    >
                      {opt}
                    </button>
                  );
                }
              )}
            </div>

            {userAnswered && (
              <div
                className={`p-3 rounded-xl text-center text-xs font-black ${
                  isAnswerCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isAnswerCorrect ? '✓ Jawaban Masuk! Cepat Sekali!' : '✕ Jawaban Kurang Tepat!'}
              </div>
            )}

            {mode === 'host' && (
              <div className="pt-2 text-right">
                <button
                  onClick={handleShowScoreboard}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  Tampilkan Papan Skor
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------------- 4. REALTIME SCOREBOARD ---------------- */}
        {room && room.status === 'scoreboard' && (
          <div className="space-y-4 py-2">
            <h3 className="text-center text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>Papan Skor Sementara</span>
            </h3>

            <div className="space-y-2">
              {[...room.participants]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.user_id}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      p.user_id === user.id
                        ? 'bg-sky-50 dark:bg-sky-950 border-sky-400 font-extrabold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-black w-5 text-slate-400">#{idx + 1}</span>
                      <span className="text-xl">{p.avatar}</span>
                      <span className="text-slate-900 dark:text-white">{p.nickname}</span>
                      {p.streak >= 2 && (
                        <span className="flex items-center text-[10px] text-amber-600 font-bold">
                          <Flame className="w-3 h-3 fill-amber-500" /> {p.streak}x
                        </span>
                      )}
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">
                      {p.score} pts
                    </span>
                  </div>
                ))}
            </div>

            <div className="pt-3">
              <button
                onClick={handleNextQuestion}
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5"
              >
                <span>
                  {room.current_question_index + 1 < activeQuestions.length
                    ? 'Soal Berikutnya'
                    : 'Lihat Podium Juara!'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 5. FINAL PODIUM FINISH ---------------- */}
        {room && room.status === 'finished' && (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-3xl shadow-lg">
              🏆
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Pertandingan Selesai!
            </h2>
            <p className="text-xs text-slate-500">
              Selamat kepada para juara kosakata Bahasa Inggris hari ini!
            </p>

            <div className="space-y-2 max-w-sm mx-auto my-4">
              {[...room.participants]
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((p, idx) => (
                  <div
                    key={p.user_id}
                    className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs font-extrabold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <span>{p.nickname}</span>
                    </div>
                    <span className="text-amber-700 dark:text-amber-300">{p.score} pts</span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => {
                setRoom(null);
                setMode('lobby');
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
