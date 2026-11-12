import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mascot } from '../Mascot';
import { speakWord } from '../SoundEffects';
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  Camera,
  Brain,
  Volume2,
  BookmarkPlus,
  RotateCcw,
  Bot,
  User,
  Check,
  Zap,
} from 'lucide-react';

interface GeminiTutorProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const GeminiTutorModal: React.FC<GeminiTutorProps> = ({ onClose }) => {
  const { user, saveWordBankItem, lang } = useApp();

  type TabMode = 'chat' | 'image_scanner' | 'deep_thinking';
  const [activeTab, setActiveTab] = useState<TabMode>('chat');

  // 1. Multi-Turn Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      role: 'model',
      content: `Halo ${user.nickname || user.name}! Aku **Kak Voca**, mentor Bahasa Inggris interaktif khusus untuk siswa SMK jurusan **${user.major}**. 

Ada istilah teknis yang bingung, grammar yang bikin pusing, atau butuh contoh percakapan di tempat PKL/magang industri? Tanyakan saja padaku!`,
      timestamp: 'Baru saja',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 2. Image Scanner State (multimodal gemini-4-argon)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [scanResult, setScanResult] = useState<{
    overallSummary?: string;
    items?: {
      english: string;
      phonetic: string;
      indonesian: string;
      partOfSpeech: string;
      sentence: string;
      sentenceTranslation: string;
      workplaceTip: string;
    }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Deep Thinking State (gemini-4-carbon with ThinkingLevel.HIGH)
  const [thinkingQuery, setThinkingQuery] = useState('');
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle Multi-Turn Chat Send
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newMsgList: ChatMessage[] = [
      ...messages,
      {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(newMsgList);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgList.map((m) => ({ role: m.role, content: m.content })),
          major: user.major,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memanggil Gemini API');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          role: 'model',
          content: data.text || 'Maaf, Kak Voca tidak dapat merespons saat ini.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'model',
          content: `⚠️ Oops! Terjadi kendala: ${err.message}. Pastikan API key Anda aktif di panel Secrets.`,
          timestamp: 'Gagal',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Image Upload & Analysis
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!imagePreview || analyzingImage) return;
    setAnalyzingImage(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageFile?.type || 'image/jpeg',
          major: user.major,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menganalisis foto');
      }

      setScanResult(data);
    } catch (err: any) {
      alert(`Gagal menganalisis: ${err.message}`);
    } finally {
      setAnalyzingImage(false);
    }
  };

  // Handle Deep Thinking
  const handleDeepThinking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thinkingQuery.trim() || isThinking) return;

    setIsThinking(true);
    setThinkingResult(null);

    try {
      const response = await fetch('/api/gemini/deep-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: thinkingQuery.trim(),
          major: user.major,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses mode berpikir');
      }

      setThinkingResult(data.explanation);
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full h-[90vh] max-h-[750px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Mascot mood="happy" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base">Kak Voca AI Mentor</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase">
                  {user.major}
                </span>
              </div>
              <p className="text-[11px] text-sky-100 -mt-0.5">
                AI Vocational English Specialist Powered by Gemini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕ Tutup
          </button>
        </div>

        {/* Feature Sub-Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'chat'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chat Percakapan</span>
          </button>

          <button
            onClick={() => setActiveTab('image_scanner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'image_scanner'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Foto Bengkel/Alat (gemini-4-argon)</span>
          </button>

          <button
            onClick={() => setActiveTab('deep_thinking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'deep_thinking'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>High Thinking (gemini-4-carbon)</span>
          </button>
        </div>

        {/* ---------------- TAB 1: MULTI-TURN CHAT ---------------- */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
            {/* Model Selector Bar */}
            <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold">Model AI:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent font-bold text-sky-600 dark:text-sky-400 focus:outline-none"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (General / Fast)</option>
                <option value="gemini-4-argon">gemini-4-argon (Complex Interactive)</option>
                <option value="gemini-4-carbon">gemini-4-carbon (Deep Reasoning)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
              </select>
            </div>

            {/* Scrollable Message Thread */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 max-w-[85%] ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-sky-600 text-white'
                          : 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-sky-600 text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block px-1">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-2.5 items-center mr-auto">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-white flex items-center justify-center text-xs font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
                    <span>Kak Voca sedang mengetik...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                `Kosakata penting ${user.major} saat PKL`,
                'Contoh dialog sapaan sopan bahasa Inggris',
                'Perbedaan istilah teknis yang sering keliru',
                'Tips interview magang di perusahaan asing',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMessage(chip);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanyakan kosakata, grammar, atau percakapan kejuruan..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold transition-transform active:scale-95 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ---------------- TAB 2: IMAGE SCANNER (gemini-4-argon) ---------------- */}
        {activeTab === 'image_scanner' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-600" />
                <span>Vocational Photo Scanner (Powered by gemini-4-argon)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ambil foto atau unggah gambar peralatan bengkel, server lab, formulir keuangan, atau meja hotel. AI akan mendeteksi kosakata bahasa Inggris teknis dan cara penggunaannya di dunia kerja.
              </p>
            </div>

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-6 text-center hover:border-sky-500 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    className="max-h-48 mx-auto rounded-xl object-contain shadow-md"
                  />
                  <p className="text-xs font-bold text-sky-600">
                    Klik untuk mengganti foto
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 mx-auto flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Klik untuk Mengunggah Foto Alat / Peralatan Kejuruan
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Mendukung JPG, PNG, WebP (Maksimal 15MB)
                  </p>
                </div>
              )}
            </div>

            {imagePreview && (
              <button
                onClick={handleAnalyzeImage}
                disabled={analyzingImage}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
              >
                {analyzingImage ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Objek dengan gemini-4-argon...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Deteksi Kosakata Bahasa Inggris</span>
                  </>
                )}
              </button>
            )}

            {/* Scan Results Display */}
            {scanResult && scanResult.items && (
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-white">
                  🔍 Kosakata Teknis Terdeteksi ({scanResult.items.length} Istilah):
                </h4>

                {scanResult.overallSummary && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200">
                    {scanResult.overallSummary}
                  </p>
                )}

                <div className="space-y-2.5">
                  {scanResult.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <h5 className="font-black text-sm text-slate-900 dark:text-white">
                              {item.english}
                            </h5>
                            <span className="text-[10px] text-slate-400">
                              {item.phonetic} • {item.partOfSpeech}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-teal-600 mt-0.5">
                            {item.indonesian}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => speakWord(item.english)}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700"
                            title="Dengar Audio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              saveWordBankItem({
                                word: item.english,
                                phonetic: item.phonetic,
                                part_of_speech: item.partOfSpeech,
                                indonesian: item.indonesian,
                                example_sentence: item.sentence,
                                example_translation: item.sentenceTranslation,
                                major: user.major,
                                mastery_status: 'learning',
                                notes: item.workplaceTip,
                              });
                              alert(`"${item.english}" disimpan ke Bank Kataku!`);
                            }}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700"
                            title="Simpan ke Bank Kata"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 italic">
                        "{item.sentence}"
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.sentenceTranslation}
                      </p>
                      {item.workplaceTip && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 font-semibold">
                          💡 Tips Kerja: {item.workplaceTip}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- TAB 3: HIGH THINKING (gemini-4-carbon) ---------------- */}
        {activeTab === 'deep_thinking' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-sm sm:text-base text-slate-800 dark:text-white">
                  High Thinking Mode (Powered by gemini-4-carbon)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengaktifkan penalaran mendalam (`ThinkingLevel.HIGH`) untuk membedah nuansa rumit tata bahasa, perbedaan istilah mirip (confusing words), atau menyusun email formal kejuruan.
              </p>
            </div>

            <form onSubmit={handleDeepThinking} className="space-y-3">
              <textarea
                rows={3}
                value={thinkingQuery}
                onChange={(e) => setThinkingQuery(e.target.value)}
                placeholder="Contoh: Jelaskan perbedaan 'Maintenance' vs 'Troubleshooting' di dokumen SOP teknis, atau bagaimana cara menulis email komplain profesional ke vendor luar negeri..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={!thinkingQuery.trim() || isThinking}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
              >
                {isThinking ? (
                  <>
                    <Brain className="w-4 h-4 animate-pulse" />
                    <span>Sedang Melakukan Deep Reasoning (ThinkingLevel.HIGH)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Mulai Analisis Mendalam</span>
                  </>
                )}
              </button>
            </form>

            {thinkingResult && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50">
                <h4 className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                  Hasil Penjelasan Mendalam:
                </h4>
                <div className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {thinkingResult}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
