import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Material } from '../../types';
import { FlashcardViewer } from '../flashcards/FlashcardViewer';
import { speakWord } from '../SoundEffects';
import { MAJOR_LIST } from '../../data/seedData';
import {
  BookOpen,
  Volume2,
  BookmarkPlus,
  PlayCircle,
  FileText,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';

export const LearnView: React.FC = () => {
  const { materials, user, saveWordBankItem, lang } = useApp();

  const [selectedMajor, setSelectedMajor] = useState<string>(user.major);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    const matchMajor = selectedMajor === 'ALL' || m.major === selectedMajor || m.major === 'UMUM';
    const matchQuery =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMajor && matchQuery;
  });

  const handleSaveWord = (item: { word: string; phonetic: string; indonesian: string; context: string }, mat: Material) => {
    saveWordBankItem({
      word: item.word,
      phonetic: item.phonetic,
      part_of_speech: 'Vocab',
      indonesian: item.indonesian,
      example_sentence: item.context,
      example_translation: '',
      major: mat.major,
      mastery_status: 'learning',
      notes: `Dari materi ${mat.title}`,
    });
    setSavedWords((prev) => ({ ...prev, [item.word]: true }));
  };

  // If flashcard mode is active
  if (showFlashcards && activeMaterial) {
    return (
      <FlashcardViewer
        material={activeMaterial}
        onClose={() => setShowFlashcards(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-sky-600" />
          <span>{lang === 'id' ? 'Materi & Bank Kosakata SMK' : 'SMK Learning Materials'}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {lang === 'id'
            ? 'Pelajari glosarium teknis kejuruan, dengarkan pelafalan, dan latih ingatan dengan flashcard interaktif.'
            : 'Study vocational glossaries, listen to pronunciations, and train with interactive flashcards.'}
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'id' ? 'Cari judul materi atau kosakata...' : 'Search materials or vocabulary...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-sky-500 shadow-xs"
          />
        </div>

        {/* Major Selector Dropdown / Pills */}
        <select
          value={selectedMajor}
          onChange={(e) => setSelectedMajor(e.target.value)}
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

      {/* Material Cards */}
      <div className="space-y-4">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                    {mat.major}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {mat.vocab_items?.length || 0} {lang === 'id' ? 'Istilah Wajib' : 'Key Terms'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  {mat.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {mat.description}
                </p>
              </div>

              {/* Flashcard Trigger Button */}
              {mat.vocab_items && mat.vocab_items.length > 0 && (
                <button
                  onClick={() => {
                    setActiveMaterial(mat);
                    setShowFlashcards(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 hover:scale-103 active:scale-97 transition-all shrink-0"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Buka Mode Flashcard' : 'Flashcard Mode'}</span>
                </button>
              )}
            </div>

            {/* Vocab Items List */}
            {mat.vocab_items && mat.vocab_items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {mat.vocab_items.map((item, idx) => {
                  const isSaved = savedWords[item.word];
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{item.word}</span>
                            <span className="text-[11px] font-normal text-slate-400">
                              {item.phonetic}
                            </span>
                          </h4>
                          <button
                            onClick={() => speakWord(item.word)}
                            className="p-1 rounded-lg text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-800"
                            title="Dengar Suara"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                          {item.indonesian}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 leading-snug">
                          "{item.context}"
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex justify-end">
                        <button
                          onClick={() => handleSaveWord(item, mat)}
                          disabled={isSaved}
                          className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          {isSaved ? <Check className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
                          <span>{isSaved ? 'Tersimpan' : '+ Simpan ke Bank Kata'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {filteredMaterials.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              Tidak ada materi yang sesuai dengan pencarian atau jurusan yang dipilih.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
