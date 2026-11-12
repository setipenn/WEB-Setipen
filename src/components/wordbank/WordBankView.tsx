import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WordBankItem, Major } from '../../types';
import { speakWord } from '../SoundEffects';
import {
  Bookmark,
  Volume2,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Filter,
} from 'lucide-react';

export const WordBankView: React.FC = () => {
  const {
    wordBank,
    saveWordBankItem,
    removeWordBankItem,
    updateWordMastery,
    user,
    lang,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Word Form State
  const [newWord, setNewWord] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newIndonesian, setNewIndonesian] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredItems = wordBank.filter((item) => {
    const matchStatus = filterStatus === 'all' || item.mastery_status === filterStatus;
    const matchSearch =
      item.word.toLowerCase().includes(search.toLowerCase()) ||
      item.indonesian.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newIndonesian.trim()) return;

    saveWordBankItem({
      word: newWord.trim(),
      phonetic: newPhonetic.trim() || `/${newWord.toLowerCase()}/`,
      part_of_speech: 'Vocab',
      indonesian: newIndonesian.trim(),
      example_sentence: newExample.trim(),
      example_translation: '',
      major: user.major,
      mastery_status: 'learning',
      notes: newNotes.trim(),
    });

    setNewWord('');
    setNewPhonetic('');
    setNewIndonesian('');
    setNewExample('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const exportWordBankText = () => {
    const content = wordBank
      .map(
        (w, i) =>
          `${i + 1}. ${w.word} (${w.phonetic}) = ${w.indonesian}\n   Contoh: ${w.example_sentence}\n   Catatan: ${w.notes || '-'}`
      )
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bank_Kata_SMK_${user.nickname || user.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Add & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Bookmark className="w-5 h-5 text-sky-600 fill-sky-600" />
            <span>{lang === 'id' ? 'Bank Kataku (Personal Word Bank)' : 'My Word Bank'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'id'
              ? `${wordBank.length} kosakata sulit yang kamu simpan untuk dihafal`
              : `${wordBank.length} vocabulary words saved for practice`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportWordBankText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kata</span>
          </button>
        </div>
      </div>

      {/* Search and Status Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kata atau arti..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold overflow-x-auto">
          {(['all', 'learning', 'mastered', 'new'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg capitalize transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {st === 'all' ? 'Semua' : st === 'learning' ? 'Sedang Belajar' : st === 'mastered' ? 'Hafal' : 'Baru'}
            </button>
          ))}
        </div>
      </div>

      {/* Word List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {item.word}
                    </h4>
                    <span className="text-[10px] text-slate-400">{item.phonetic}</span>
                  </div>
                  <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    {item.indonesian}
                  </p>
                </div>

                <button
                  onClick={() => speakWord(item.word)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-700"
                  title="Dengar Audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {item.example_sentence && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 italic leading-snug">
                  "{item.example_sentence}"
                </p>
              )}

              {item.notes && (
                <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
                  📝 {item.notes}
                </p>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
              {/* Mastery Status Toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateWordMastery(item.id, 'learning')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.mastery_status === 'learning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Belajar
                </button>
                <button
                  onClick={() => updateWordMastery(item.id, 'mastered')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.mastery_status === 'mastered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Hafal
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => removeWordBankItem(item.id)}
                className="text-slate-400 hover:text-red-500 p-1 rounded"
                title="Hapus dari Bank Kata"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="sm:col-span-2 p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              Belum ada kosakata yang cocok di Bank Katamu.
            </p>
          </div>
        )}
      </div>

      {/* Add Word Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              + Tambah Kosakata Baru ke Bank Kata
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Bahasa Inggris *
                </label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="e.g. Bandwidth / Maintenance"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Arti Bahasa Indonesia *
                </label>
                <input
                  type="text"
                  required
                  value={newIndonesian}
                  onChange={(e) => setNewIndonesian(e.target.value)}
                  placeholder="e.g. Kapasitas pengiriman data"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Contoh Kalimat Kejuruan
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="e.g. Perform scheduled maintenance on the server."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Catatan Pribadi / Tips Hafalan
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Sering keluar di ujian kompetensi!"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white text-xs font-extrabold shadow-sm"
                >
                  Simpan Kata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
