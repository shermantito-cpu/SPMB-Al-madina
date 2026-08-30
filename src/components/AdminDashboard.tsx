import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Phone, 
  Eye, 
  Trash2, 
  Database, 
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Users,
  CreditCard,
  Building2,
  Lock,
  Unlock,
  Sparkles,
  X
} from 'lucide-react';
import { PendaftarData, JenjangType, StatusPendaftaran, GasConfig } from '../types';
import { 
  getAllPendaftar, 
  updatePendaftarStatus, 
  deletePendaftar, 
  exportToCsv 
} from '../services/apiService';
import { JENJANG_LIST } from '../data/defaultData';
import { ExamCard } from './ExamCard';

interface AdminDashboardProps {
  gasConfig: GasConfig;
  openSpreadsheetModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  gasConfig,
  openSpreadsheetModal
}) => {
  const [pendaftarList, setPendaftarList] = useState<PendaftarData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  
  // Selected registrant for inspection or exam card modal
  const [inspectPendaftar, setInspectPendaftar] = useState<PendaftarData | null>(null);
  const [examCardPendaftar, setExamCardPendaftar] = useState<PendaftarData | null>(null);
  
  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadData = () => {
    const list = getAllPendaftar();
    setPendaftarList(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = (pendaftar: PendaftarData) => {
    const updated = updatePendaftarStatus(pendaftar.id, 'Terverifikasi / Lunas');
    if (updated) {
      loadData();
      showToast(`Pendaftar ${pendaftar.nama} berhasil DIVERIFIKASI & No. Ujian diterbitkan!`);
      if (inspectPendaftar?.id === pendaftar.id) {
        setInspectPendaftar(updated);
      }
    }
  };

  const handleReject = (pendaftar: PendaftarData) => {
    const reason = prompt("Masukkan catatan revisi untuk santri:", "Mohon unggah ulang bukti transfer yang jelas");
    if (reason) {
      const updated = updatePendaftarStatus(pendaftar.id, 'Perlu Perbaikan Berkas', { catatanPanitia: reason });
      if (updated) {
        loadData();
        showToast(`Status pendaftar diubah menjadi Perlu Perbaikan Berkas`);
        if (inspectPendaftar?.id === pendaftar.id) {
          setInspectPendaftar(updated);
        }
      }
    }
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data santri "${nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deletePendaftar(id);
      loadData();
      showToast(`Data santri berhasil dihapus.`);
      if (inspectPendaftar?.id === id) {
        setInspectPendaftar(null);
      }
    }
  };

  const handleSendWa = (pendaftar: PendaftarData) => {
    let msg = "";
    if (pendaftar.status === 'Terverifikasi / Lunas') {
      msg = `*KONFIRMASI VERIFIKASI SPMB AL-MADINA 2027/2028*\n\n` +
        `Assalamu'alaikum Wr. Wb.\n` +
        `Yth. Bapak/Ibu Wali dari *${pendaftar.nama}*,\n\n` +
        `Alhamdulillah, berkas pendaftaran dan pembayaran formulir SPMB Pondok Pesantren Al-Madina telah *TERVERIFIKASI / LUNAS*.\n\n` +
        `📋 *No. Registrasi:* ${pendaftar.nomorRegistrasi}\n` +
        `🎫 *No. Ujian:* ${pendaftar.noUjian || 'WST-2027-0101'}\n` +
        `🏫 *Jenjang:* ${pendaftar.jenjang}\n` +
        `📅 *Jadwal Tes Masuk:* ${pendaftar.jadwalUjian || 'Ahad, 10 Januari 2027'}\n` +
        `🏛️ *Ruang Ujian:* ${pendaftar.ruangUjian || 'Ruang 04'}\n\n` +
        `Silakan cetak Kartu Peserta Ujian melalui website SPMB. Syukron Katsiron.\n\n` +
        `_Panitia SPMB Ponpes Al-Madina Prabumulih_`;
    } else if (pendaftar.status === 'Menunggu Pembayaran Tunai') {
      msg = `*PEMBERITAHUAN SPMB AL-MADINA 2027/2028*\n\n` +
        `Assalamu'alaikum Wr. Wb.\n` +
        `Yth. Bapak/Ibu Wali dari *${pendaftar.nama}*,\n\n` +
        `Terima kasih telah mendaftar di Pondok Pesantren Al-Madina. Status pendaftaran Anda saat ini adalah *Menunggu Pembayaran Tunai*.\n\n` +
        `Harap segera menyelesaikan pembayaran di kantor Tata Usaha maksimal 3 hari kerja untuk penerbitan Kartu Ujian.\n\n` +
        `_Panitia SPMB Al-Madina_`;
    } else {
      msg = `*STATUS SPMB AL-MADINA 2027/2028*\n\n` +
        `Assalamu'alaikum Wr. Wb.\n` +
        `Yth. Bapak/Ibu Wali dari *${pendaftar.nama}*,\n\n` +
        `Berkas pendaftaran Anda (${pendaftar.nomorRegistrasi}) sedang dalam verifikasi panitia SPMB. Kami akan segera menginfokan setelah validasi selesai.\n\n` +
        `_Panitia SPMB Al-Madina_`;
    }

    const cleanNumber = (pendaftar.no_wa || '').replace(/[^\d]/g, '').replace(/^0/, '62');
    window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filter Data
  const filteredList = pendaftarList.filter(item => {
    const matchQuery = 
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nik.includes(searchQuery) ||
      item.nomorRegistrasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asal_sekolah.toLowerCase().includes(searchQuery.toLowerCase());

    const matchJenjang = selectedJenjang === 'Semua' || item.jenjang === selectedJenjang;
    const matchStatus = selectedStatus === 'Semua' || item.status === selectedStatus;

    return matchQuery && matchJenjang && matchStatus;
  });

  // Calculate Metrics
  const totalPendaftar = pendaftarList.length;
  const totalVerified = pendaftarList.filter(p => p.status === 'Terverifikasi / Lunas').length;
  const totalPending = pendaftarList.filter(p => p.status === 'Menunggu Verifikasi').length;
  const totalCashPending = pendaftarList.filter(p => p.status === 'Menunggu Pembayaran Tunai').length;
  const totalRevenue = pendaftarList
    .filter(p => p.status === 'Terverifikasi / Lunas')
    .reduce((sum, p) => sum + (p.biayaNominal || 200000), 0);

  if (examCardPendaftar) {
    return (
      <ExamCard
        pendaftar={examCardPendaftar}
        onBack={() => setExamCardPendaftar(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Stats */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Portal Panitia SPMB 2027/2028
            </div>
            <h2 className="text-2xl font-black text-gray-900">Dasbor Verifikasi & Google Spreadsheet</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Kelola verifikasi berkas santri, penerbitan nomor ujian, dan integrasi Google Apps Script.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openSpreadsheetModal}
              id="btn-spreadsheet-config-dash"
              className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{gasConfig.webAppUrl ? 'Pengaturan Spreadsheet' : 'Hubungkan Spreadsheet'}</span>
            </button>

            <button
              onClick={() => exportToCsv(filteredList)}
              id="btn-export-csv"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Rekap Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Stats 4-Card Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>TOTAL PENDAFTAR</span>
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950">{totalPendaftar}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Santri terdata di sistem</div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>TERVERIFIKASI</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{totalVerified}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Kartu ujian aktif diterbitkan</div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>MENUNGGU VERIFIKASI</span>
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800">{totalPending}</div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Perlu pengecekan transfer</div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
              <span>MENUNGGU TUNAI</span>
              <CreditCard className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-800">{totalCashPending}</div>
            <div className="text-[11px] text-blue-700 mt-0.5 font-medium">Infaq formulir belum setor</div>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 space-y-4">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              id="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama santri, NIK, No. Registrasi, atau Asal Sekolah..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedJenjang}
              onChange={(e) => setSelectedJenjang(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Jenjang</option>
              {JENJANG_LIST.map(j => (
                <option key={j.id} value={j.id}>{j.shortName}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terverifikasi / Lunas">Terverifikasi / Lunas</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Menunggu Pembayaran Tunai">Menunggu Pembayaran Tunai</option>
              <option value="Perlu Perbaikan Berkas">Perlu Perbaikan Berkas</option>
            </select>
          </div>
        </div>

        {/* Registrant Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Registrasi</th>
                <th className="py-3 px-4">Nama Santri & NIK</th>
                <th className="py-3 px-4">Jenjang</th>
                <th className="py-3 px-4">Asal Sekolah</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">No. Ujian</th>
                <th className="py-3 px-4 text-center">Aksi Panitia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {item.nomorRegistrasi}
                      <span className="block text-[10px] text-gray-500 font-normal">{item.timestamp}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{item.nama}</div>
                      <div className="font-mono text-gray-500 text-[11px]">{item.nik} ({item.jk})</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-800">{item.jenjang}</span>
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      <div>{item.asal_sekolah}</div>
                      <span className="text-[10px] text-gray-400">NISN: {item.nisn || '-'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-gray-700">{item.metode_bayar}</span>
                    </td>

                    <td className="py-3 px-4">
                      {item.status === 'Terverifikasi / Lunas' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Terverifikasi
                        </span>
                      )}
                      {item.status === 'Menunggu Verifikasi' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Menunggu Verif
                        </span>
                      )}
                      {item.status === 'Menunggu Pembayaran Tunai' && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                          Tunai
                        </span>
                      )}
                      {item.status === 'Perlu Perbaikan Berkas' && (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                          Revisi Berkas
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-emerald-900">
                      {item.noUjian || '-'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setInspectPendaftar(item)}
                          title="Lihat Detail & Berkas"
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {item.status !== 'Terverifikasi / Lunas' && (
                          <button
                            onClick={() => handleVerify(item)}
                            title="Verifikasi & Terbitkan No. Ujian"
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          </button>
                        )}

                        {item.status === 'Terverifikasi / Lunas' && (
                          <button
                            onClick={() => setExamCardPendaftar(item)}
                            title="Cetak Kartu Ujian"
                            className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-700" />
                          </button>
                        )}

                        <button
                          onClick={() => handleSendWa(item)}
                          title="Kirim Notifikasi WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          title="Hapus Data Santri"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Tidak ada pendaftar yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect / Document Modal */}
      {inspectPendaftar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block">
                  Detail Santri & Berkas Lampiran
                </span>
                <h3 className="text-xl font-bold text-gray-900">{inspectPendaftar.nama}</h3>
                <p className="text-xs text-gray-500 font-mono">{inspectPendaftar.nomorRegistrasi} &bull; NIK: {inspectPendaftar.nik}</p>
              </div>

              <button
                onClick={() => setInspectPendaftar(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
              {inspectPendaftar.status !== 'Terverifikasi / Lunas' ? (
                <button
                  onClick={() => handleVerify(inspectPendaftar)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Setujui</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const p = inspectPendaftar;
                    setInspectPendaftar(null);
                    setExamCardPendaftar(p);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Buka Kartu Ujian</span>
                </button>
              )}

              <button
                onClick={() => handleReject(inspectPendaftar)}
                className="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200"
              >
                Minta Revisi
              </button>

              <button
                onClick={() => handleSendWa(inspectPendaftar)}
                className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hubungi WA ({inspectPendaftar.no_wa})</span>
              </button>
            </div>

            {/* Complete Biodata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 uppercase">Biodata:</h5>
                <div><span className="text-gray-500">TTL:</span> {inspectPendaftar.tempat_lahir}, {inspectPendaftar.tgl_lahir}</div>
                <div><span className="text-gray-500">Jenis Kelamin:</span> {inspectPendaftar.jk}</div>
                <div><span className="text-gray-500">Anak Ke:</span> {inspectPendaftar.anak_ke} dari {inspectPendaftar.jml_saudara || 3} saudara</div>
                <div><span className="text-gray-500">Golongan Darah:</span> {inspectPendaftar.gol_darah || '-'}</div>
                <div><span className="text-gray-500">Riwayat Penyakit:</span> {inspectPendaftar.riwayat_penyakit || 'Tidak ada'}</div>
              </div>

              <div className="space-y-1.5 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 uppercase">Orang Tua & Alamat:</h5>
                <div><span className="text-gray-500">Ayah / Ibu:</span> {inspectPendaftar.nama_ayah} / {inspectPendaftar.nama_ibu}</div>
                <div><span className="text-gray-500">Pekerjaan:</span> {inspectPendaftar.pekerjaan}</div>
                <div><span className="text-gray-500">Gaji:</span> {inspectPendaftar.gaji}</div>
                <div><span className="text-gray-500">No WA:</span> {inspectPendaftar.no_wa}</div>
                <div><span className="text-gray-500">Alamat:</span> {inspectPendaftar.alamat}</div>
              </div>
            </div>

            {/* Uploaded Documents Preview Section */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Berkas Terlampir:
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Bukti Transfer */}
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="font-bold text-gray-800 mb-1">Bukti Transfer</div>
                  {inspectPendaftar.bukti_bayar?.base64Data ? (
                    inspectPendaftar.bukti_bayar.mimeType.startsWith('image/') ? (
                      <img 
                        src={`data:${inspectPendaftar.bukti_bayar.mimeType};base64,${inspectPendaftar.bukti_bayar.base64Data}`}
                        alt="Bukti Transfer"
                        className="w-full h-32 object-contain rounded-lg bg-white border"
                      />
                    ) : (
                      <div className="p-4 bg-white rounded border text-center text-gray-600">Dokumen PDF Terlampir ({inspectPendaftar.bukti_bayar.fileName})</div>
                    )
                  ) : (
                    <div className="text-gray-400 italic">Belum diunggah / Tunai</div>
                  )}
                </div>

                {/* Pas Foto */}
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="font-bold text-gray-800 mb-1">Pas Foto Santri</div>
                  {inspectPendaftar.foto?.base64Data ? (
                    <img 
                      src={`data:${inspectPendaftar.foto.mimeType};base64,${inspectPendaftar.foto.base64Data}`}
                      alt="Pas Foto"
                      className="w-full h-32 object-contain rounded-lg bg-white border"
                    />
                  ) : (
                    <div className="text-gray-400 italic">Belum diunggah</div>
                  )}
                </div>

                {/* KK & Akta */}
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 sm:col-span-2">
                  <div className="font-bold text-gray-800 mb-1">Kartu Keluarga & Akta</div>
                  <p className="text-gray-600 text-[11px]">
                    Status KK: {inspectPendaftar.kk ? `Tersedia (${inspectPendaftar.kk.fileName})` : 'Belum diunggah'} &bull; 
                    Akta: {inspectPendaftar.akte ? `Tersedia (${inspectPendaftar.akte.fileName})` : 'Belum diunggah'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setInspectPendaftar(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-800 font-semibold text-xs hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
