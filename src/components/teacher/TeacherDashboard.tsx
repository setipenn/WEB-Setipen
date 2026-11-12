import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom, Major, Question, QuestionType, Quiz } from '../../types';
import { MAJOR_LIST } from '../../data/seedData';
import {
  Users,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    user,
    classes,
    createClass,
    questions,
    addQuestion,
    bulkAddQuestions,
    quizzes,
    createQuiz,
    materials,
    attempts,
    lang,
  } = useApp();

  type TeacherTab = 'classes' | 'questions' | 'quiz_builder' | 'analytics';
  const [activeTab, setActiveTab] = useState<TeacherTab>('classes');

  // 1. Create Class Form State
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('10');
  const [newClassMajor, setNewClassMajor] = useState<Major>('TKJ');

  // 2. Add Question Form State
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qType, setQType] = useState<QuestionType>('multiple_choice');
  const [qPrompt, setQPrompt] = useState('');
  const [qPromptId, setQPromptId] = useState('');
  const [qCorrect, setQCorrect] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qExplanation, setQExplanation] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [qMajor, setQMajor] = useState<Major>('TKJ');
  const [qAudioWord, setQAudioWord] = useState('');

  // 3. Bulk CSV Import State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState<{
    valid: boolean;
    errors: string[];
    rows: any[];
  } | null>(null);

  // 4. Quiz Builder State
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizMajor, setQuizMajor] = useState<Major>('TKJ');
  const [quizTimer, setQuizTimer] = useState(20);
  const [quizPassing, setQuizPassing] = useState(75);
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);

  // ---------------- CLASS HANDLERS ----------------
  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    createClass(newClassName.trim(), newClassGrade, newClassMajor);
    setNewClassName('');
    setShowCreateClass(false);
  };

  // ---------------- QUESTION HANDLERS ----------------
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qPrompt.trim() || !qCorrect.trim()) return;

    addQuestion({
      type: qType,
      prompt: qPrompt.trim(),
      prompt_id: qPromptId.trim() || undefined,
      correct_answer: qCorrect.trim(),
      options: qType === 'multiple_choice' ? qOptions.filter((o) => o.trim()) : undefined,
      explanation: qExplanation.trim(),
      difficulty: qDifficulty,
      topic_id: `top_${qMajor.toLowerCase()}_custom`,
      major: qMajor,
      audio_word: qAudioWord.trim() || undefined,
    });

    setQPrompt('');
    setQPromptId('');
    setQCorrect('');
    setQOptions(['', '', '', '']);
    setQExplanation('');
    setShowAddQuestion(false);
  };

  // ---------------- CSV BULK IMPORT VALIDATOR ----------------
  const parseAndValidateCsv = (raw: string) => {
    const lines = raw.trim().split('\n');
    if (lines.length < 2) {
      setCsvPreview({
        valid: false,
        errors: ['CSV minimal harus memiliki header dan setidaknya 1 baris soal.'],
        rows: [],
      });
      return;
    }

    const rows: any[] = [];
    const errors: string[] = [];

    // Header: type,prompt,prompt_id,correct_answer,option1,option2,option3,option4,explanation,difficulty,major
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

      if (cols.length < 5) {
        errors.push(`Baris ${i + 1}: Format kolom tidak lengkap (minimal 5 kolom).`);
        continue;
      }

      const [type, prompt, prompt_id, correct_answer, opt1, opt2, opt3, opt4, explanation, difficulty, major] = cols;

      const validTypes: QuestionType[] = ['multiple_choice', 'fill_blank', 'true_false', 'listening', 'word_scramble', 'matching', 'drag_drop'];
      if (!validTypes.includes(type as any)) {
        errors.push(`Baris ${i + 1}: Tipe soal "${type}" tidak valid.`);
      }

      rows.push({
        type: (type as QuestionType) || 'multiple_choice',
        prompt,
        prompt_id,
        correct_answer,
        options: [opt1, opt2, opt3, opt4].filter(Boolean),
        explanation: explanation || 'Penjelasan kuis teknis',
        difficulty: (difficulty as any) || 'medium',
        major: (major as Major) || 'TKJ',
        topic_id: 'top_bulk_import',
      });
    }

    setCsvPreview({
      valid: errors.length === 0,
      errors,
      rows,
    });
  };

  const handleApplyCsv = () => {
    if (!csvPreview || !csvPreview.valid || csvPreview.rows.length === 0) return;
    bulkAddQuestions(csvPreview.rows);
    setShowCsvModal(false);
    setCsvText('');
    setCsvPreview(null);
  };

  const downloadCsvTemplate = () => {
    const template = `type,prompt,prompt_id,correct_answer,option1,option2,option3,option4,explanation,difficulty,major
multiple_choice,"What hardware directs packets between networks?","Perangkat pengarah paket data",Router,Router,Switch,Hub,Monitor,"Router routes IP traffic",easy,TKJ
fill_blank,"Amounts owed to suppliers are called accounts ________.","Utang usaha",payable,,,,,"Accounts payable is owed debt",medium,AKUNTANSI
listening,"Listen and pick the part","Dengarkan audio",Spark Plug,Spark Plug,Brake Pad,Caliper,Piston,"Spark plug ignites mixture",easy,OTOMOTIF`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Template_Soal_VocaSMK.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------- QUIZ BUILDER HANDLER ----------------
  const handleCreateQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || selectedQIds.length === 0) return;

    createQuiz({
      title: quizTitle.trim(),
      description: quizDesc.trim() || 'Kuis kosakata kejuruan SMK',
      topic_id: `top_${quizMajor.toLowerCase()}`,
      major: quizMajor,
      time_limit_seconds: Number(quizTimer),
      passing_score: Number(quizPassing),
      max_attempts: 3,
      shuffle_options: true,
      question_ids: selectedQIds,
      assigned_class_ids: assignedClassIds,
    });

    setQuizTitle('');
    setQuizDesc('');
    setSelectedQIds([]);
    setShowCreateQuiz(false);
  };

  // ---------------- EXPORT SCORES TO CSV ----------------
  const exportScoresCsv = () => {
    const header = 'Student_ID,Quiz_Title,Score,XP_Earned,Correct_Count,Total_Questions,Date\n';
    const rows = attempts
      .map((a) => {
        const qz = quizzes.find((q) => q.id === a.quiz_id);
        return `"${a.user_id}","${qz?.title || 'Quiz'}","${a.score}","${a.xp_earned}","${a.correct_count}","${a.total_questions}","${a.completed_at}"`;
      })
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nilai_Siswa_VocaSMK_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6 pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-amber-400 text-amber-950">
            {lang === 'id' ? 'Panel Pendidik & Guru' : 'Teacher Portal'}
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            {user.name}
          </h1>
          <p className="text-xs text-sky-200 mt-0.5">
            {user.school_name || 'SMK Negeri 1 Jakarta'} • {classes.length} Kelas Aktif
          </p>
        </div>

        <button
          onClick={exportScoresCsv}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{lang === 'id' ? 'Ekspor Nilai Siswa (CSV)' : 'Export Scores'}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'classes', label: 'Manajemen Kelas', icon: Users },
          { id: 'questions', label: 'Bank Soal (Semua Tipe)', icon: Layers },
          { id: 'quiz_builder', label: 'Quiz Builder', icon: BookOpen },
          { id: 'analytics', label: 'Analisis & Heatmap Lemah', icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TeacherTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- 1. CLASS MANAGEMENT ---------------- */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
              Daftar Kelas & Kode Akses 6-Karakter
            </h2>
            <button
              onClick={() => setShowCreateClass(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Kelas Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-extrabold text-sky-600 uppercase">
                      {cls.major}
                    </span>
                    <span className="text-slate-400">Kelas {cls.grade}</span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {cls.school_name}
                  </p>

                  {/* 6-Character Class Code Display */}
                  <div className="my-3 p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Kode Masuk Siswa:
                      </span>
                      <p className="font-mono font-black text-base text-sky-700 dark:text-sky-300 tracking-widest">
                        {cls.code}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(cls.code);
                        alert(`Kode ${cls.code} disalin ke clipboard!`);
                      }}
                      className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900"
                      title="Salin Kode Kelas"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    {cls.student_ids.length} Siswa Terdaftar
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold">Aktif</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Create Class */}
          {showCreateClass && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setShowCreateClass(false)}
            >
              <div
                className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
                  + Buat Kelas Baru (Kode Auto 6-Digit)
                </h3>

                <form onSubmit={handleCreateClassSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nama Kelas (Contoh: X TKJ 2 / XI Akuntansi 1)
                    </label>
                    <input
                      type="text"
                      required
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="X TKJ 2"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Tingkat
                      </label>
                      <select
                        value={newClassGrade}
                        onChange={(e) => setNewClassGrade(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value="10">Kelas 10</option>
                        <option value="11">Kelas 11</option>
                        <option value="12">Kelas 12</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Jurusan
                      </label>
                      <select
                        value={newClassMajor}
                        onChange={(e) => setNewClassMajor(e.target.value as Major)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                      >
                        {MAJOR_LIST.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateClass(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-sky-600 text-white text-xs font-extrabold shadow-sm"
                    >
                      Generate Kelas
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 2. QUESTION BANK & BULK CSV ---------------- */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Bank Soal Vokasi ({questions.length} Soal Tersedia)
              </h2>
              <p className="text-xs text-slate-500">
                Mendukung 7 tipe: Pilihan ganda, Isian, Menjodohkan, Susun kalimat, B/S, Listening, Scramble
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadCsvTemplate}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template CSV</span>
              </button>
              <button
                onClick={() => setShowCsvModal(true)}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Soal Manual</span>
              </button>
            </div>
          </div>

          {/* Question List Table / Cards */}
          <div className="space-y-2.5">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 text-center font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-sky-100 text-sky-800 uppercase">
                        {q.major}
                      </span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                        {q.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Level: {q.difficulty}
                      </span>
                    </div>

                    <p className="font-extrabold text-slate-800 dark:text-slate-100">
                      {q.prompt}
                    </p>
                    <p className="text-emerald-600 font-bold mt-0.5">
                      Kunci: {q.correct_answer}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 text-[11px] shrink-0 self-end sm:self-center">
                  💡 {q.explanation.slice(0, 45)}...
                </div>
              </div>
            ))}
          </div>

          {/* Modal Manual Add Question */}
          {showAddQuestion && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowAddQuestion(false)}
            >
              <div
                className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
                  + Tambah Soal Kosakata Baru
                </h3>

                <form onSubmit={handleAddQuestionSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Tipe Soal
                      </label>
                      <select
                        value={qType}
                        onChange={(e) => setQType(e.target.value as QuestionType)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value="multiple_choice">Pilihan Ganda (4 Opsi)</option>
                        <option value="fill_blank">Isian Singkat (Typing)</option>
                        <option value="true_false">Benar / Salah (True/False)</option>
                        <option value="listening">Audio Listening</option>
                        <option value="word_scramble">Susun Huruf Acak</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Jurusan Target
                      </label>
                      <select
                        value={qMajor}
                        onChange={(e) => setQMajor(e.target.value as Major)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                      >
                        {MAJOR_LIST.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Pertanyaan (Bahasa Inggris) *
                    </label>
                    <input
                      type="text"
                      required
                      value={qPrompt}
                      onChange={(e) => setQPrompt(e.target.value)}
                      placeholder="e.g. Which tool is used to tighten cylinder bolts?"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Terjemahan / Konteks Bahasa Indonesia
                    </label>
                    <input
                      type="text"
                      value={qPromptId}
                      onChange={(e) => setQPromptId(e.target.value)}
                      placeholder="e.g. Alat apa yang digunakan untuk mengencangkan baut silinder?"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kunci Jawaban Benar *
                    </label>
                    <input
                      type="text"
                      required
                      value={qCorrect}
                      onChange={(e) => setQCorrect(e.target.value)}
                      placeholder="e.g. Torque Wrench"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-emerald-600"
                    />
                  </div>

                  {qType === 'multiple_choice' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        4 Pilihan Opsi
                      </label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {qOptions.map((opt, i) => (
                          <input
                            key={i}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...qOptions];
                              updated[i] = e.target.value;
                              setQOptions(updated);
                            }}
                            placeholder={`Pilihan ${i + 1}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kata Audio Pelafalan (Opsional TTS)
                    </label>
                    <input
                      type="text"
                      value={qAudioWord}
                      onChange={(e) => setQAudioWord(e.target.value)}
                      placeholder="e.g. Torque Wrench"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Pembahasan & Penjelasan Soal
                    </label>
                    <textarea
                      rows={2}
                      value={qExplanation}
                      onChange={(e) => setQExplanation(e.target.value)}
                      placeholder="e.g. Kunci torsi digunakan agar kekencangan baut sesuai spesifikasi pabrik."
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddQuestion(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-sky-600 text-white text-xs font-extrabold shadow-sm"
                    >
                      Simpan ke Bank Soal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Bulk CSV Import */}
          {showCsvModal && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowCsvModal(false)}
            >
              <div
                className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                    <span>Import Soal Masal (Bulk CSV/Excel)</span>
                  </h3>
                  <button
                    onClick={downloadCsvTemplate}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    Unduh Format CSV
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-2">
                  Tempelkan isi file CSV atau ketik langsung di kotak teks berikut. Sistem akan memvalidasi kolom secara otomatis sebelum disimpan.
                </p>

                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    parseAndValidateCsv(e.target.value);
                  }}
                  placeholder="type,prompt,prompt_id,correct_answer,option1,option2,option3,option4,explanation,difficulty,major..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                />

                {/* Validation Preview */}
                {csvPreview && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
                    {csvPreview.valid ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Validasi Berhasil: {csvPreview.rows.length} soal siap diimport!</span>
                      </div>
                    ) : (
                      <div className="space-y-1 text-red-600">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-4 h-4" />
                          <span>Ditemukan {csvPreview.errors.length} Kesalahan:</span>
                        </div>
                        {csvPreview.errors.map((err, i) => (
                          <p key={i} className="text-[11px] pl-5">• {err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowCsvModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    disabled={!csvPreview || !csvPreview.valid || csvPreview.rows.length === 0}
                    onClick={handleApplyCsv}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-sm"
                  >
                    Simpan Semua ({csvPreview?.rows?.length || 0} Soal)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 3. QUIZ BUILDER ---------------- */}
      {activeTab === 'quiz_builder' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Quiz Builder & Distribusi Kelas
              </h2>
              <p className="text-xs text-slate-500">
                Pilih soal dari bank soal, atur durasi, skor kelulusan, dan tugaskan ke kelas
              </p>
            </div>

            <button
              onClick={() => setShowCreateQuiz(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Kuis Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-extrabold text-sky-600 uppercase">
                      {quiz.major}
                    </span>
                    <span className="text-slate-400">
                      KKM: {quiz.passing_score} / 100
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {quiz.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{quiz.question_ids.length} Soal Terpilih</span>
                  <span>{quiz.time_limit_seconds}s / Soal</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Quiz Builder */}
          {showCreateQuiz && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowCreateQuiz(false)}
            >
              <div
                className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
                  + Buat Kuis Baru untuk Siswa
                </h3>

                <form onSubmit={handleCreateQuizSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Judul Kuis *
                    </label>
                    <input
                      type="text"
                      required
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="e.g. Ulangan Harian Hardware & Networking"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Deskripsi Kuis
                    </label>
                    <input
                      type="text"
                      value={quizDesc}
                      onChange={(e) => setQuizDesc(e.target.value)}
                      placeholder="e.g. Ujian kosakata teknis modul 1"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Jurusan
                      </label>
                      <select
                        value={quizMajor}
                        onChange={(e) => setQuizMajor(e.target.value as Major)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                      >
                        {MAJOR_LIST.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Waktu / Soal
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={60}
                        value={quizTimer}
                        onChange={(e) => setQuizTimer(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Passing (KKM)
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={quizPassing}
                        onChange={(e) => setQuizPassing(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Pick Questions from Bank */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Pilih Soal ({selectedQIds.length} Terpilih):</span>
                      <button
                        type="button"
                        onClick={() => setSelectedQIds(questions.map((q) => q.id))}
                        className="text-sky-600 text-[10px] hover:underline"
                      >
                        Pilih Semua
                      </button>
                    </label>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-900">
                      {questions.map((q) => {
                        const isChecked = selectedQIds.includes(q.id);
                        return (
                          <label
                            key={q.id}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedQIds((prev) => [...prev, q.id]);
                                } else {
                                  setSelectedQIds((prev) => prev.filter((id) => id !== q.id));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="font-bold text-[10px] text-sky-600 uppercase">
                              [{q.major}]
                            </span>
                            <span className="truncate flex-1 text-slate-800 dark:text-slate-200">
                              {q.prompt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateQuiz(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={selectedQIds.length === 0}
                      className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-sm"
                    >
                      Publikasikan Kuis
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 4. ANALYTICS & WEAK-TOPIC HEATMAP ---------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Rata-rata Nilai Siswa
              </span>
              <p className="text-3xl font-black text-sky-600 mt-1">84.5</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                +6% dibanding minggu lalu
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Tingkat Partisipasi
              </span>
              <p className="text-3xl font-black text-teal-600 mt-1">92%</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                32 dari 35 siswa aktif
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Total Pengerjaan Kuis
              </span>
              <p className="text-3xl font-black text-amber-500 mt-1">
                {attempts.length + 48}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Kuis terkirim bulan ini
              </p>
            </div>
          </div>

          {/* Weak-Topic Heatmap */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1">
              🔥 Heatmap Pemahaman Topik & Kosakata (Kelemahan Siswa)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Menunjukkan topik yang sering salah dijawab siswa untuk bahan remedial di kelas:
            </p>

            <div className="space-y-3">
              {[
                { topic: 'Subnetting & Gateway Configuration', major: 'TKJ', missRate: 42, severity: 'high' },
                { topic: 'Accrual vs Cash Basis Accounting', major: 'AKUNTANSI', missRate: 36, severity: 'medium' },
                { topic: 'Torque Wrench Calibration & Specs', major: 'OTOMOTIF', missRate: 28, severity: 'medium' },
                { topic: 'Concierge Telephone Handling Etiquette', major: 'PERHOTELAN', missRate: 15, severity: 'low' },
                { topic: 'Object-Oriented Programming (Polymorphism)', major: 'RPL', missRate: 12, severity: 'low' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      [{item.major}] {item.topic}
                    </span>
                    <span className="font-extrabold text-red-500">
                      {item.missRate}% Salah Jawab
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.severity === 'high'
                          ? 'bg-red-500'
                          : item.severity === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.missRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
