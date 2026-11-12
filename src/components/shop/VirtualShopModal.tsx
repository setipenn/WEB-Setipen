import React from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, Sparkles, Zap, Shield, Crown, Check } from 'lucide-react';

interface ShopModalProps {
  onClose: () => void;
}

export const VirtualShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
  const { user, buyShopItem, lang } = useApp();

  const frames = [
    { id: 'frame_gold', name: 'Bingkai Emas Berkilau', cost: 100, icon: '🌟' },
    { id: 'frame_neon', name: 'Cyberpunk Neon Glow', cost: 150, icon: '⚡' },
    { id: 'frame_crown', name: 'Mahkota Juara Vokasi', cost: 250, icon: '👑' },
  ];

  const powerUps = [
    {
      id: 'fifty_fifty',
      name: 'Power-Up 50/50 (+1)',
      desc: 'Buang 2 opsi salah di kuis',
      cost: 30,
      icon: '🎯',
    },
    {
      id: 'extra_time',
      name: 'Waktu Tambahan +15s (+1)',
      desc: 'Tambah 15 detik pada hitung mundur',
      cost: 25,
      icon: '⚡',
    },
    {
      id: 'skip',
      name: 'Kartu Skip Soal (+1)',
      desc: 'Lewati soal sulit tanpa penalti',
      cost: 40,
      icon: '⏭️',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Toko Koin VocaSMK</span>
            </h2>
            <p className="text-xs text-slate-500">
              Gunakan koin hasil rajin belajar untuk membeli frame avatar dan power-up!
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-950/60 border border-yellow-200 text-yellow-700 dark:text-yellow-400 text-xs font-black">
            <Coins className="w-4 h-4 fill-yellow-500 text-yellow-600" />
            <span>{user.coins} Koin</span>
          </div>
        </div>

        {/* Section 1: Power-ups */}
        <div className="mt-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
            Bahan Bantu Kuis (Power-Ups)
          </h3>
          <div className="space-y-2">
            {powerUps.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => buyShopItem('power_up', p.cost, p.id)}
                  disabled={user.coins < p.cost}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-amber-950 font-black text-xs shadow-xs transition-colors"
                >
                  Beli {p.cost} Koin
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Avatar Frames */}
        <div className="mt-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
            Bingkai Avatar Profil
          </h3>
          <div className="space-y-2">
            {frames.map((f) => {
              const isOwned = user.avatar_frame === f.id;
              return (
                <div
                  key={f.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{f.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white">{f.name}</h4>
                      <p className="text-[11px] text-slate-500">Tampilan profil lebih keren</p>
                    </div>
                  </div>

                  {isOwned ? (
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Terpakai
                    </span>
                  ) : (
                    <button
                      onClick={() => buyShopItem('frame', f.cost, f.id)}
                      disabled={user.coins < f.cost}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-black text-xs shadow-xs transition-colors"
                    >
                      Beli {f.cost} Koin
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
        >
          Selesai Belanja
        </button>
      </div>
    </div>
  );
};
