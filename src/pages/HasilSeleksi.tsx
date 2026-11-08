import React from 'react';
import { ArrowLeft, ExternalLink, FileText, GraduationCap, Home, Calendar, CheckCircle2, ShieldCheck, Bell, AlertCircle } from 'lucide-react';

interface HasilSeleksiProps {
  onBack: () => void;
}

export default function HasilSeleksi({ onBack }: HasilSeleksiProps) {
  const linkWustha = "https://drive.google.com/file/d/1fBQum_1OZLHcX9ey4zRvzphKPrYn1h0a/view?usp=sharing";
  const linkUlya = "https://drive.google.com/file/d/12FK1F9FsSvzVf78cfGop--c0x79z6Ymu/view?usp=sharing";

  return (
    <div className="min-h-screen bg-[#e7ecf0] py-4 sm:py-8 px-3 sm:px-6 font-sans text-slate-800 flex flex-col justify-between">
      {/* Top Navigation */}
      <div className="max-w-xl mx-auto w-full mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl text-xs sm:text-sm font-semibold shadow-sm border border-slate-200/80 transition-all hover:-translate-y-0.5 cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft size={16} className="text-emerald-700" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-xs">
          <Calendar size={14} className="text-blue-600" />
          <span>T.A. 2027/2028</span>
        </div>
      </div>

      {/* Main Card Container Matching User Reference Mockup */}
      <main className="max-w-xl mx-auto w-full bg-[#f4f7f9] rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Top Campus Building Photo */}
        <div className="relative w-full h-56 sm:h-72 bg-slate-900 overflow-hidden">
          <img
            src="/pondok.jpeg"
            alt="Kampus Pondok Pesantren Al-Madina Al-Islami Prabumulih"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Center Circular Logo Overlapping the bottom of photo */}
        <div className="relative flex justify-center -mt-16 sm:-mt-20 px-4">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-1.5 shadow-xl border-4 border-white flex items-center justify-center z-10 transition-transform duration-300 hover:scale-105">
            <img
              src="/logp.png"
              alt="Logo Ponpes Al-Madina"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 sm:px-8 pt-4 pb-8 sm:pb-10 flex flex-col items-center text-center">
          {/* Institution Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Ponpes Al-Madina Al-Islami<br />Prabumulih
          </h1>

          {/* Tagline / Motto */}
          <p className="italic text-slate-600 text-xs sm:text-sm font-medium mt-2 max-w-md leading-relaxed">
            Menjadi lembaga pendidikan yang berkualitas dengan berlandaskan Al-Qur'an dan Sunnah
          </p>

          {/* Action Buttons Section */}
          <div className="w-full mt-6 sm:mt-8 space-y-4">
            {/* Tombol 1: Jenjang Wustha (SMP) */}
            <a
              href={linkWustha}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full bg-[#1d4ed8] hover:bg-[#1e40af] active:bg-[#1b3a97] text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-blue-900/20 border border-blue-400/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-extrabold text-xs sm:text-sm md:text-[15px] uppercase tracking-wide leading-snug">
                  PENGUMUMAN HASIL SELEKSI SPMB GELOMBANG PERTAMA JENJANG WUSTHA (SMP) TAHUN AJARAN 2027/2028
                </span>
                <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-blue-100 bg-white/15 px-3 py-1 rounded-full border border-white/20 group-hover:bg-white group-hover:text-blue-900 transition-colors">
                  <FileText size={13} />
                  <span>Buka Dokumen PDF di Google Drive</span>
                  <ExternalLink size={12} />
                </span>
              </div>
            </a>

            {/* Tombol 2: Jenjang Ulya (SMA) */}
            <a
              href={linkUlya}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full bg-[#475569] hover:bg-[#334155] active:bg-[#1e293b] text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/20 border border-slate-400/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-extrabold text-xs sm:text-sm md:text-[15px] uppercase tracking-wide leading-snug">
                  PENGUMUMAN HASIL SELEKSI SPMB GELOMBANG PERTAMA JENJANG ULYA (SMA) TAHUN AJARAN 2027/2028
                </span>
                <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-200 bg-white/15 px-3 py-1 rounded-full border border-white/20 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                  <FileText size={13} />
                  <span>Buka Dokumen PDF di Google Drive</span>
                  <ExternalLink size={12} />
                </span>
              </div>
            </a>
          </div>

          {/* Notif Pengingat Informasi Penting */}
          <div className="w-full mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-left flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
              <Bell size={18} />
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-2 flex-1">
              <p className="font-bold text-amber-900 text-sm">
                Informasi Penting !
              </p>
              <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed">
                Bapak ibu calon Wali santri dapat melihat, mengunduh, dan mencetak surat penetapan kelulusan tersebut pada hari <strong>Senin, 9 November 2026</strong>
              </p>
              <div className="pt-2 border-t border-amber-200/70 text-slate-700 space-y-0.5">
                <p className="italic font-medium text-amber-900">baarakallahu Fiikum,</p>
                <p className="font-bold text-slate-800">panitia SPMB Ponpes Al-Madina Prabumulih</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bottom */}
      <footer className="max-w-xl mx-auto w-full text-center mt-6 text-xs text-slate-500">
        <p>SPMB Online &copy; 2026 Pondok Pesantren Al-Madina Al-Islami Prabumulih</p>
      </footer>
    </div>
  );
}
