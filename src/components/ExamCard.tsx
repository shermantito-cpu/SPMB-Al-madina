import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Building2, 
  ShieldCheck, 
  Share2,
  FileCheck,
  GraduationCap
} from 'lucide-react';
import { PendaftarData } from '../types';

interface ExamCardProps {
  pendaftar: PendaftarData;
  onBack?: () => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ pendaftar, onBack }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateQr = async () => {
      try {
        const qrPayload = JSON.stringify({
          app: "SPMB_AL_MADINA_2027_2028",
          reg: pendaftar.nomorRegistrasi,
          noUjian: pendaftar.noUjian || "WST-2027-0101",
          nama: pendaftar.nama,
          nik: pendaftar.nik,
          jenjang: pendaftar.jenjang,
          status: pendaftar.status,
          verified: true
        });
        const url = await QRCode.toDataURL(qrPayload, {
          width: 180,
          margin: 1,
          color: {
            dark: '#064e3b',
            light: '#ffffff'
          }
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR Code", err);
      }
    };
    generateQr();
  }, [pendaftar]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*KARTU UJIAN SPMB AL-MADINA 2027/2028*\n\n` +
      `*Nama:* ${pendaftar.nama}\n` +
      `*No. Ujian:* ${pendaftar.noUjian || '-'}\n` +
      `*No. Registrasi:* ${pendaftar.nomorRegistrasi}\n` +
      `*Jenjang:* ${pendaftar.jenjang}\n` +
      `*Jadwal:* ${pendaftar.jadwalUjian || 'Ahad, 10 Januari 2027'}\n` +
      `*Ruang:* ${pendaftar.ruangUjian || 'Ruang 04'}\n` +
      `*Lokasi:* ${pendaftar.lokasiUjian || 'Kampus Utama Ponpes Al-Madina Prabumulih'}\n\n` +
      `_Status: TERVERIFIKASI / LUNAS_`;
    const waUrl = `https://api.whatsapp.com/send?phone=62${(pendaftar.no_wa || '').replace(/^0/, '')}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Control Bar - Hidden when printing */}
      <div className="print:hidden bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              id="btn-back-to-status"
              className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-gray-900">Kartu Tanda Peserta Ujian Masuk</h2>
            <p className="text-xs text-gray-500">Silakan cetak atau simpan PDF untuk dibawa saat hari pelaksanaan ujian.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            id="btn-share-wa"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-sm font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim Ringkasan ke WA</span>
          </button>

          <button
            onClick={handlePrint}
            id="btn-print-card"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-sm font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Exam Card Container */}
      <div 
        ref={cardRef} 
        id="printable-exam-card"
        className="bg-white rounded-2xl shadow-xl border-2 border-emerald-700 p-6 sm:p-8 max-w-3xl mx-auto relative overflow-hidden text-gray-800 print:shadow-none print:border-2 print:border-black print:p-4 print:max-w-full"
      >
        {/* Background Seal Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <GraduationCap className="w-96 h-96 text-emerald-900" />
        </div>

        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-emerald-900 pb-4 mb-5 text-center relative">
          <div className="flex items-center justify-between gap-4">
            <div className="w-16 h-16 rounded-xl bg-emerald-800 text-amber-300 flex flex-col items-center justify-center p-1 flex-shrink-0 border border-amber-400">
              <Building2 className="w-8 h-8" />
              <span className="text-[8px] font-bold tracking-widest uppercase">MADINA</span>
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-bold tracking-widest uppercase text-emerald-800">YAYASAN PONDOK PESANTREN AL-MADINA</h4>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">PANITIA PENERIMAAN MURID BARU (SPMB)</h2>
              <p className="text-xs font-semibold text-emerald-700">TAHUN AJARAN 2027/2028</p>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                Jl. Jenderal Sudirman KM 6, Karang Raja, Kec. Prabumulih Timur, Kota Prabumulih, Sumsel 31121<br />
                Website: almadina-prabumulih.ponpes.id &bull; Email: spmb@almadina.ponpes.id &bull; Hotline: 0812-7890-1234
              </p>
            </div>

            <div className="w-16 h-16 rounded-xl bg-amber-500 text-emerald-950 flex flex-col items-center justify-center p-1 flex-shrink-0 border border-emerald-800">
              <ShieldCheck className="w-8 h-8" />
              <span className="text-[8px] font-bold tracking-widest uppercase">TERAKREDITASI</span>
            </div>
          </div>
        </div>

        {/* Title Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-emerald-800 text-white px-6 py-1.5 rounded-full text-sm font-extrabold uppercase tracking-wide shadow-sm print:bg-black print:text-white">
            KARTU TANDA PESERTA UJIAN SELEKSI MASUK
          </div>
        </div>

        {/* Main Card Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mb-6">
          {/* Photo & QR Section */}
          <div className="md:col-span-1 flex flex-col items-center gap-3">
            {/* Santri Photo Box */}
            <div className="w-32 h-40 rounded-lg border-2 border-dashed border-gray-400 bg-gray-50 flex flex-col items-center justify-center overflow-hidden relative shadow-sm">
              {pendaftar.foto?.base64Data ? (
                <img 
                  src={`data:${pendaftar.foto.mimeType};base64,${pendaftar.foto.base64Data}`} 
                  alt="Pas Foto Santri" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                  <User className="w-12 h-12 text-gray-300 mb-1" />
                  <span className="text-[10px] font-semibold">PAS FOTO</span>
                  <span className="text-[9px]">3 x 4 cm</span>
                </div>
              )}
            </div>

            {/* QR Code Validation */}
            {qrDataUrl && (
              <div className="text-center">
                <img src={qrDataUrl} alt="QR Code Verifikasi" className="w-24 h-24 mx-auto border border-emerald-200 rounded p-1 bg-white" />
                <span className="text-[9px] font-semibold text-emerald-800 uppercase tracking-wider block mt-0.5">
                  Validasi Otentik Panitia
                </span>
              </div>
            )}
          </div>

          {/* Student & Exam Details Table */}
          <div className="md:col-span-3 space-y-4">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">NOMOR UJIAN:</span>
                <span className="font-mono text-base font-black text-emerald-900 tracking-wider">
                  {pendaftar.noUjian || 'WST-2027-0101'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">NO. REGISTRASI:</span>
                <span className="font-mono text-sm font-bold text-gray-800">
                  {pendaftar.nomorRegistrasi}
                </span>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 font-semibold text-gray-600 w-36">Nama Lengkap</td>
                  <td className="py-1.5 font-bold text-gray-900 uppercase">: {pendaftar.nama}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 font-semibold text-gray-600">NIK Calon Santri</td>
                  <td className="py-1.5 font-mono text-gray-800">: {pendaftar.nik}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 font-semibold text-gray-600">Tempat, Tgl Lahir</td>
                  <td className="py-1.5 text-gray-800">: {pendaftar.tempat_lahir}, {pendaftar.tgl_lahir}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 font-semibold text-gray-600">Jenis Kelamin</td>
                  <td className="py-1.5 text-gray-800">: {pendaftar.jk}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 font-semibold text-gray-600">Jenjang Pilihan</td>
                  <td className="py-1.5 font-bold text-emerald-800">: {pendaftar.jenjang}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 font-semibold text-gray-600">Asal Sekolah</td>
                  <td className="py-1.5 text-gray-800">: {pendaftar.asal_sekolah} (NISN: {pendaftar.nisn || '-'})</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 font-semibold text-gray-600">Nama Orang Tua / Wali</td>
                  <td className="py-1.5 text-gray-800">: {pendaftar.nama_ayah} / {pendaftar.nama_ibu}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-gray-600">No. WhatsApp Wali</td>
                  <td className="py-1.5 text-gray-800">: {pendaftar.no_wa}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule & Room Box */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-xl p-4 mb-5 print:bg-none print:text-black print:border print:border-black">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-300" />
            JADWAL & LOKASI PELAKSANAAN UJIAN MASUK
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-200 block text-[10px]">Waktu Ujian:</span>
                <span className="font-bold">{pendaftar.jadwalUjian || 'Ahad, 10 Januari 2027 | 08.00 - 12.00 WIB'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-200 block text-[10px]">Ruangan:</span>
                <span className="font-bold">{pendaftar.ruangUjian || 'Ruang 04 (Gedung Umar bin Khattab)'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-200 block text-[10px]">Lokasi:</span>
                <span className="font-bold">{pendaftar.lokasiUjian || 'Kampus Utama Ponpes Al-Madina Prabumulih'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Rules & Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs items-end">
          {/* Rules */}
          <div className="md:col-span-8 space-y-1 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <h5 className="font-bold text-gray-800 uppercase text-[10px] flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
              TATA TERTIB & PERLENGKAPAN PESERTA:
            </h5>
            <ol className="list-decimal list-inside space-y-0.5 text-[10px] leading-relaxed">
              <li>Membawa cetakan <strong>Kartu Ujian</strong> ini dan identitas asli (KK/Akta).</li>
              <li>Wajib hadir di lokasi ujian 30 menit sebelum jadwal dimulai.</li>
              <li>Mengenakan pakaian muslim rapi dan sopan (Putra: Baju koko/kemeja putih + celana kain gelap + peci; Putri: Busana muslimah syar'i).</li>
              <li>Membawa alat tulis (Pensil 2B, pulpen hitam, dan papan ujian).</li>
              <li>Materi tes: Baca & Tahfidz Al-Qur'an, Wawancara Wali, serta Tes Potensi Akademik.</li>
            </ol>
          </div>

          {/* Signature Box */}
          <div className="md:col-span-4 text-center">
            <p className="text-[11px] text-gray-600">Prabumulih, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-[11px] font-bold text-gray-800">Ketua Panitia SPMB Al-Madina,</p>
            
            {/* Signature & Stamp Placeholder */}
            <div className="h-16 flex items-center justify-center relative">
              <div className="w-20 h-14 border-2 border-emerald-600/40 rounded-full flex items-center justify-center text-[9px] font-black text-emerald-700 uppercase transform -rotate-12 border-dashed">
                CAP RESMI SPMB
              </div>
              <span className="font-serif italic text-emerald-900 font-bold text-base absolute">Ust. H. Syahrul, Lc., M.Ag</span>
            </div>

            <p className="text-[11px] font-bold text-gray-900 border-t border-gray-400 pt-1">
              Ust. H. Syahrul, Lc., M.Ag
            </p>
            <p className="text-[9px] text-gray-500">NIP. 19840315 200912 1 002</p>
          </div>
        </div>
      </div>
    </div>
  );
};
