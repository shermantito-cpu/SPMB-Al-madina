import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Printer, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Building2, 
  HelpCircle,
  Share2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { PendaftarData, GasConfig } from '../types';
import { findPendaftarByNikOrReg } from '../services/apiService';
import { ExamCard } from './ExamCard';

interface CheckStatusProps {
  gasConfig: GasConfig;
  initialQuery?: string;
  onOpenExamCard?: (pendaftar: PendaftarData) => void;
}

export const CheckStatus: React.FC<CheckStatusProps> = ({
  gasConfig,
  initialQuery = '',
  onOpenExamCard
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchedPendaftar, setSearchedPendaftar] = useState<PendaftarData | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showExamCardView, setShowExamCardView] = useState<boolean>(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);

    // 1. Try local storage first
    let result = findPendaftarByNikOrReg(q);

    // 2. If not found locally & GAS URL is configured, try fetching live from GAS
    if (!result && gasConfig.webAppUrl && gasConfig.webAppUrl.startsWith('http')) {
      try {
        const gasEndpoint = `${gasConfig.webAppUrl}?action=cekStatus&nik=${encodeURIComponent(q)}`;
        const res = await fetch(gasEndpoint);
        const json = await res.json();
        if (json && json.ditemukan) {
          result = {
            id: `gas-${json.nik}`,
            nomorRegistrasi: json.nomorRegistrasi || `SPMB-2027-${json.nik.slice(-4)}`,
            timestamp: json.tglDaftar || new Date().toISOString(),
            jenjang: json.jenjang,
            nama: json.nama,
            nik: json.nik,
            tempat_lahir: "-",
            tgl_lahir: "-",
            jk: "Laki-laki",
            anak_ke: 1,
            asal_sekolah: "-",
            nisn: "-",
            tahun_lulus: 2026,
            nama_ayah: "-",
            nama_ibu: "-",
            no_wa: "-",
            pekerjaan: "-",
            gaji: "-",
            alamat: "-",
            metode_bayar: "Transfer Bank",
            status: json.status || "Menunggu Verifikasi",
            noUjian: json.noUjian,
            jadwalUjian: json.jadwalUjian,
            linkKartuPdf: json.urlKartu
          };
        }
      } catch (err) {
        console.warn("GAS live lookup fallback error", err);
      }
    }

    setSearchedPendaftar(result);
    setIsSearching(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleQuickSearch = (nik: string) => {
    setSearchQuery(nik);
    performSearch(nik);
  };

  // If user selected to view the full Exam Card
  if (showExamCardView && searchedPendaftar) {
    return (
      <ExamCard
        pendaftar={searchedPendaftar}
        onBack={() => setShowExamCardView(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Search Header Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            Lacak Status Registrasi
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Cek Status Pendaftaran & Kartu Ujian
          </h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Masukkan 16 digit NIK Santri atau Kode Registrasi (Contoh: <code>SPMB-2027-...</code>) untuk melihat status verifikasi.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                id="input-search-nik"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan 16 Digit NIK atau No. Registrasi"
                className="w-full pl-4 pr-10 py-3.5 rounded-2xl border-2 border-emerald-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all shadow-inner"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>

            <button
              type="submit"
              id="btn-do-search"
              disabled={isSearching}
              className="px-7 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Cek Status</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Contoh Uji Coba:</span>
            <button
              type="button"
              id="demo-nik-verified"
              onClick={() => handleQuickSearch("1671012304080001")}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-mono transition-colors"
            >
              NIK Terverifikasi: 1671012304080001
            </button>
            <button
              type="button"
              id="demo-nik-pending"
              onClick={() => handleQuickSearch("1671012304080002")}
              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-mono transition-colors"
            >
              NIK Menunggu: 1671012304080002
            </button>
            <button
              type="button"
              id="demo-nik-cash"
              onClick={() => handleQuickSearch("1671012304080003")}
              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-mono transition-colors"
            >
              NIK Tunai: 1671012304080003
            </button>
          </div>
        </div>
      </div>

      {/* Result Container */}
      {hasSearched && (
        <>
          {searchedPendaftar ? (
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8 animate-in fade-in duration-300">
              
              {/* Status Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">
                    Hasil Pencarian Santri:
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    {searchedPendaftar.nama}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-600">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-800">
                      {searchedPendaftar.nomorRegistrasi}
                    </span>
                    <span>&bull;</span>
                    <span className="font-semibold text-emerald-800">{searchedPendaftar.jenjang}</span>
                    <span>&bull;</span>
                    <span className="text-gray-500 font-mono">NIK: {searchedPendaftar.nik}</span>
                  </div>
                </div>

                <div>
                  {searchedPendaftar.status === 'Terverifikasi / Lunas' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <span>Terverifikasi / Lunas</span>
                    </div>
                  )}

                  {searchedPendaftar.status === 'Menunggu Verifikasi' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-sm">
                      <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                      <span>Menunggu Verifikasi Panitia</span>
                    </div>
                  )}

                  {searchedPendaftar.status === 'Menunggu Pembayaran Tunai' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-100 text-blue-900 border border-blue-300 font-bold text-sm">
                      <Clock className="w-5 h-5 text-blue-700" />
                      <span>Menunggu Pembayaran Tunai</span>
                    </div>
                  )}

                  {searchedPendaftar.status === 'Perlu Perbaikan Berkas' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-100 text-red-900 border border-red-300 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 text-red-700" />
                      <span>Perlu Perbaikan Berkas</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Flow Steps */}
              <div className="py-6 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
                  Tahapan Alur Pendaftaran Santri:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>1. Formulir Dikirim</span>
                    </div>
                    <p className="text-gray-500 text-[11px]">{searchedPendaftar.timestamp}</p>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    searchedPendaftar.status === 'Terverifikasi / Lunas'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1 text-gray-900">
                      {searchedPendaftar.status === 'Terverifikasi / Lunas' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      )}
                      <span>2. Verifikasi Data</span>
                    </div>
                    <p className="text-gray-500 text-[11px]">
                      {searchedPendaftar.status === 'Terverifikasi / Lunas' ? 'Selesai & Valid' : 'Proses Pengecekan TU'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    searchedPendaftar.status === 'Terverifikasi / Lunas'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1 text-gray-900">
                      {searchedPendaftar.status === 'Terverifikasi / Lunas' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">3</div>
                      )}
                      <span>3. Kartu Ujian Terbit</span>
                    </div>
                    <p className="text-gray-500 text-[11px]">
                      {searchedPendaftar.noUjian ? `No. ${searchedPendaftar.noUjian}` : 'Menunggu Verifikasi'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500">
                    <div className="flex items-center gap-2 font-bold mb-1 text-gray-900">
                      <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">4</div>
                      <span>4. Tes & Seleksi</span>
                    </div>
                    <p className="text-gray-500 text-[11px]">10 Januari 2027</p>
                  </div>
                </div>
              </div>

              {/* Verified Exam Details Callout */}
              {searchedPendaftar.status === 'Terverifikasi / Lunas' ? (
                <div className="py-6 space-y-4">
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Kartu Ujian Siap Dicetak
                      </div>
                      <h4 className="text-xl font-black">Nomor Ujian: {searchedPendaftar.noUjian || 'WST-2027-0101'}</h4>
                      <p className="text-xs text-emerald-200 mt-0.5">
                        Jadwal: {searchedPendaftar.jadwalUjian || 'Ahad, 10 Januari 2027 | 08.00 - 12.00 WIB'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowExamCardView(true)}
                      id="btn-view-exam-card"
                      className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak Kartu Ujian Resmi</span>
                    </button>
                  </div>

                  {searchedPendaftar.catatanPanitia && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <strong>Pesan Panitia SPMB:</strong> {searchedPendaftar.catatanPanitia}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs leading-relaxed space-y-2">
                    <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                      Data Anda Sedang Dalam Proses Verifikasi Panitia
                    </p>
                    <p>
                      Panitia SPMB Pondok Pesantren Al-Madina sedang memverifikasi data dan bukti pembayaran Anda. Pengecekan mutasi bank dan validasi berkas membutuhkan waktu maksimal 1x24 jam kerja.
                    </p>
                    {searchedPendaftar.metode_bayar === 'Tunai di Kantor (Khusus Domisili Dekat)' && (
                      <p className="font-semibold text-blue-900 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                        📌 Anda memilih pembayaran tunai. Harap segera datang ke kantor Tata Usaha Ponpes Al-Madina Prabumulih pada hari kerja (Senin - Sabtu, 08.00 - 15.00 WIB) untuk melunasi infaq formulir pendaftaran.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Compact Information Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700 pt-2">
                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h5 className="font-bold uppercase text-[11px] text-gray-900">Informasi Santri:</h5>
                  <div><span className="text-gray-500">Asal Sekolah:</span> <strong>{searchedPendaftar.asal_sekolah}</strong></div>
                  <div><span className="text-gray-500">NISN:</span> <strong>{searchedPendaftar.nisn || '-'}</strong></div>
                  <div><span className="text-gray-500">Metode Bayar:</span> <strong>{searchedPendaftar.metode_bayar}</strong></div>
                </div>

                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h5 className="font-bold uppercase text-[11px] text-gray-900">Kontak Orang Tua:</h5>
                  <div><span className="text-gray-500">Nama Ayah / Ibu:</span> {searchedPendaftar.nama_ayah} / {searchedPendaftar.nama_ibu}</div>
                  <div><span className="text-gray-500">No. WhatsApp:</span> <strong className="font-mono text-emerald-800">{searchedPendaftar.no_wa}</strong></div>
                  <div><span className="text-gray-500">Alamat:</span> {searchedPendaftar.alamat}</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Data Pendaftar Tidak Ditemukan</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
                Tidak ada data pendaftar yang cocok dengan kata kunci "<strong>{searchQuery}</strong>". Pastikan Anda memasukkan 16 digit NIK atau Nomor Registrasi yang benar.
              </p>
              <a 
                href="https://wa.me/6281278901234?text=Bismillah%20Panitia%20SPMB,%20saya%20mencari%20data%20NIK%20namun%20belum%20ditemukan"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Hubungi Panitia SPMB via WhatsApp</span>
              </a>
            </div>
          )}
        </>
      )}

    </div>
  );
};
