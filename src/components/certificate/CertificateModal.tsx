import React from 'react';
import { useApp } from '../../context/AppContext';
import { getLevelFromXp } from '../../utils/gamification';
import { Printer, Download, Award, ShieldCheck, X } from 'lucide-react';

interface CertificateProps {
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateProps> = ({ onClose }) => {
  const { user, lang } = useApp();
  const levelInfo = getLevelFromXp(user.xp);
  const certId = `VOCASMK-${user.major}-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-4 border-amber-400 shadow-2xl relative text-slate-900 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Outer Border Styling */}
        <div className="border-2 border-dashed border-amber-300 p-6 sm:p-8 rounded-2xl text-center relative bg-gradient-to-b from-amber-50/30 to-white">
          {/* Header Seal */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center mx-auto shadow-md mb-2">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-xs font-black uppercase tracking-widest text-amber-700">
            KEMENTERIAN PENDIDIKAN VOKASI & PELATIHAN KERJA
          </h3>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 mt-1">
            SERTIFIKAT KELULUSAN KOSAKATA
          </h1>
          <p className="text-xs text-slate-500 tracking-wider">
            Certificate of Vocational English Competency
          </p>

          <div className="my-6">
            <p className="text-xs text-slate-500 italic">Diberikan kepada siswa berprestasi:</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-800 tracking-tight mt-1 underline decoration-amber-400 decoration-2 underline-offset-4">
              {user.name}
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-1">
              {user.school_name || 'SMK Negeri 1 Jakarta'} • Jurusan {user.major}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
            Telah berhasil menyelesaikan rangkaian ujian kompetensi kosakata teknis Bahasa Inggris tingkat kejuruan dan meraih peringkat{' '}
            <strong className="text-slate-900">{levelInfo.rankTitleId}</strong> dengan total capaian <strong>{user.xp} XP</strong>.
          </p>

          {/* Verification Stamp & Signature */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Verifikasi Digital:
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">
                  {certId}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <p className="text-xs font-black text-slate-800 mt-1">
                Dewan Pembina VocaSMK Indonesia
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
