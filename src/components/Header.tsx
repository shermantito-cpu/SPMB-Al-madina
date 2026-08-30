import React from 'react';
import { 
  GraduationCap, 
  FileText, 
  Search, 
  Info, 
  ShieldCheck, 
  Database,
  PhoneCall,
  Calendar,
  Sparkles
} from 'lucide-react';
import { GasConfig } from '../types';

interface HeaderProps {
  activeTab: 'daftar' | 'status' | 'info' | 'admin';
  setActiveTab: (tab: 'daftar' | 'status' | 'info' | 'admin') => void;
  openSpreadsheetModal: () => void;
  gasConfig: GasConfig;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openSpreadsheetModal,
  gasConfig
}) => {
  return (
    <header className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl border-b border-emerald-700/40 relative overflow-hidden">
      {/* Subtle Islamic geometric pattern background overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Top Banner Info */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-4 py-1.5 text-xs text-emerald-200">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-100">Gelombang I SPMB 2027/2028 Resmi Dibuka</span>
            <span className="hidden sm:inline text-emerald-400/60">|</span>
            <span className="hidden sm:inline text-emerald-300">Kuota Terbatas Tiap Jenjang</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button 
              onClick={openSpreadsheetModal}
              id="btn-open-gas-config"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/40 transition-colors"
              title="Koneksi Google Spreadsheet & Apps Script"
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>{gasConfig.webAppUrl ? 'Database Terhubung (GAS)' : 'Koneksi Spreadsheet'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${gasConfig.webAppUrl ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            </button>

            <a 
              href="https://wa.me/6281278901234?text=Bismillah,%20Admin%20SPMB%20Al-Madina,%20saya%20ingin%20bertanya%20mengenai%20pendaftaran" 
              target="_blank" 
              rel="noreferrer"
              className="hidden md:flex items-center gap-1 text-emerald-200 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>Hotline: +62 812-7890-1234</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Brand Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo Emblem */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-1 shadow-lg shadow-emerald-950/40 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-xl bg-emerald-900 border border-amber-300/40 flex flex-col items-center justify-center text-amber-300">
                <GraduationCap className="w-8 h-8 text-amber-300" />
                <span className="text-[9px] font-bold tracking-widest uppercase">Al-Madina</span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-[11px] font-semibold text-amber-300 mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                SISTEM PENERIMAAN MURID BARU (SPMB)
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Pondok Pesantren Al-Madina
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-0.5">
                Tahun Ajaran 2027/2028 &bull; Kota Prabumulih, Sumatera Selatan
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-xl p-3 text-right">
              <div className="text-[11px] text-emerald-300 font-medium flex items-center justify-end gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Periode Pendaftaran
              </div>
              <div className="text-sm font-bold text-white">Gelombang 1: Okt - Des 2026</div>
              <div className="text-[11px] text-amber-300 font-medium">Tes Masuk: 10 Januari 2027</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar border-t border-emerald-800/60 pt-4">
          <button
            id="tab-pendaftaran"
            onClick={() => setActiveTab('daftar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'daftar'
                ? 'bg-amber-400 text-emerald-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Formulir Pendaftaran</span>
          </button>

          <button
            id="tab-cek-status"
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'status'
                ? 'bg-amber-400 text-emerald-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Cek Status & Cetak Kartu</span>
          </button>

          <button
            id="tab-info"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-amber-400 text-emerald-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Informasi & Biaya</span>
          </button>

          <button
            id="tab-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ml-auto ${
              activeTab === 'admin'
                ? 'bg-emerald-700 text-white font-bold border border-emerald-500 shadow-md'
                : 'text-emerald-200 hover:bg-emerald-800/60 hover:text-white border border-emerald-700/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Panitia & Spreadsheet</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
