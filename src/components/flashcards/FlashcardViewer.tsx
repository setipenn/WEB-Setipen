import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Material } from '../../types';
import { sounds, speakWord } from '../SoundEffects';
import { calculateSrsReview } from '../../utils/gamification';
import {
  Volume2,
  RotateCw,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  BookmarkPlus,
  Check,
} from 'lucide-react';

interface FlashcardViewerProps {
  material: Material;
  onClose: () => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ material, onClose }) => {
  const { saveWordBankItem, addXp, lang } = useApp();
  const items = material.vocab_items || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <div className="p-6 text-center bg-white dark:bg-slate-800 rounded-3xl max-w-md mx-auto">
        <p className="text-slate-600 dark:text-slate-300">
          Belum ada kartu kosakata di materi ini.
        </p>
        <button
          onClick={onClose}
          className="mt-3 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold"
        >
          Kembali
        </button>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    sounds.playPop();
  };

  const handleNextCard = (isKnown: boolean) => {
    if (isKnown) {
      setKnownCount((prev) => prev + 1);
      sounds.playCorrect();
      addXp(5, 'Flashcard mastered');
    } else {
      setLearningCount((prev) => prev + 1);
      sounds.playPop();
    }

    setIsFlipped(false);
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop or finished
      setCurrentIndex(0);
    }
  };

  const handleSaveToBank = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveWordBankItem({
      word: currentItem.word,
      phonetic: currentItem.phonetic,
      part_of_speech: 'Vocab',
      indonesian: currentItem.indonesian,
      example_sentence: currentItem.context,
      example_translation: '',
      major: material.major,
      mastery_status: 'learning',
      notes: `Dari materi ${material.title}`,
    });
    setSavedWords((prev) => ({ ...prev, [currentItem.word]: true }));
  };

  const isSaved = savedWords[currentItem.word];

  return (
    <div className="max-w-md mx-auto px-4 py-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'id' ? 'Selesai Belajar' : 'Finish Study'}</span>
        </button>

        <span className="text-xs font-extrabold text-slate-400">
          {currentIndex + 1} / {items.length} Kartu
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full h-80 rounded-3xl cursor-pointer perspective-1000 relative shadow-xl select-none"
      >
        <div
          className={`w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d relative ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT OF CARD (English Word) */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-white to-sky-50 dark:from-slate-800 dark:to-slate-900 border-2 border-sky-300 dark:border-sky-800 p-6 flex flex-col justify-between backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {material.major} • English
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentItem.word);
                }}
                className="p-2 rounded-full bg-sky-100 dark:bg-slate-700 text-sky-600 dark:text-sky-400 hover:scale-110 transition-transform"
                title="Dengar Audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center my-auto">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentItem.word}
              </h2>
              <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 mt-1">
                {currentItem.phonetic}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={handleSaveToBank}
                disabled={isSaved}
                className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Tersimpan' : '+ Simpan ke Bank Kata'}</span>
              </button>
              <span className="flex items-center gap-1 italic text-[11px]">
                <RotateCw className="w-3 h-3" /> Ketuk untuk membalik
              </span>
            </div>
          </div>

          {/* BACK OF CARD (Indonesian Meaning & Context) */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 border-2 border-teal-300 dark:border-teal-800 p-6 flex flex-col justify-between backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                Arti Bahasa Indonesia
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentItem.word);
                }}
                className="p-2 rounded-full bg-teal-100 dark:bg-slate-700 text-teal-600 dark:text-teal-400 hover:scale-110 transition-transform"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center my-auto">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {currentItem.indonesian}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-teal-200/50 dark:border-teal-900/50 italic leading-relaxed">
                "{currentItem.context}"
              </p>
            </div>

            <div className="flex items-center justify-center text-[11px] text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Ketuk untuk kembali ke depan</span>
            </div>
          </div>
        </div>
      </div>

      {/* SRS Spaced Repetition Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={() => handleNextCard(false)}
          className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{lang === 'id' ? 'Masih Belajar (Ulangi)' : 'Still Learning'}</span>
        </button>

        <button
          onClick={() => handleNextCard(true)}
          className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{lang === 'id' ? 'Sudah Hafal (+5 XP)' : 'Mastered (+5 XP)'}</span>
        </button>
      </div>

      {/* Session Progress Stats */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
        <span className="text-emerald-600">✓ {knownCount} Hafal</span>
        <span>•</span>
        <span className="text-amber-600">↺ {learningCount} Perlu Diulang</span>
      </div>
    </div>
  );
};
