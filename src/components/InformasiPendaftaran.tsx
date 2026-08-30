import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  FileCheck, 
  MapPin, 
  Phone, 
  HelpCircle, 
  Sparkles,
  BookOpen,
  Award,
  GraduationCap
} from 'lucide-react';
import { JENJANG_LIST, BANK_ACCOUNTS } from '../data/defaultData';

interface InformasiPendaftaranProps {
  onStartRegistration: () => void;
}

export const InformasiPendaftaran: React.FC<InformasiPendaftaranProps> = ({
  onStartRegistration
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Tahun Ajaran 2027/2028
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Penerimaan Murid Baru (SPMB) Pondok Pesantren Al-Madina
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Membina generasi shalih & shalihah dengan kurikulum terpadu: Tahfidzul Qur'an mutqin, bahasa Arab & Inggris aktif, pendalaman kitab salaf, serta penguasaan sains modern.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onStartRegistration}
              id="btn-info-start-register"
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2"
            >
              <span>Daftar Sekarang Online</span>
              <GraduationCap className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/6281278901234?text=Bismillah,%20Admin%20SPMB,%20mohon%20info%20brosur%20lengkap%20SPMB%20Al-Madina"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-600 transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>Chat CS Panitia</span>
            </a>
          </div>
        </div>
      </div>

      {/* Jadwal Pelaksanaan Gelombang */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Jadwal & Agenda Penting SPMB 2027/2028</h3>
            <p className="text-xs text-gray-500">Catat tanggal-tanggal penting seleksi penerimaan santri baru</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 relative">
            <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Sedang Berlangsung
            </span>
            <h4 className="text-base font-extrabold text-emerald-900">GELOMBANG 1 (Utama)</h4>
            <ul className="mt-3 space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div><strong>Pendaftaran Online:</strong> 1 Oktober - 31 Desember 2026</div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div><strong>Pelaksanaan Tes Seleksi:</strong> Ahad, 10 Januari 2027</div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div><strong>Pengumuman Kelulusan:</strong> Rabu, 13 Januari 2027</div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div><strong>Daftar Ulang:</strong> 14 - 25 Januari 2027</div>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/70">
            <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-full float-right">
              Dibuka Jika Kuota Masih Ada
            </span>
            <h4 className="text-base font-bold text-gray-900">GELOMBANG 2 (Lanjutan)</h4>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div><strong>Pendaftaran Online:</strong> 1 Februari - 31 Maret 2027</div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div><strong>Pelaksanaan Tes Seleksi:</strong> Ahad, 11 April 2027</div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div><strong>Pengumuman Kelulusan:</strong> Rabu, 14 April 2027</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Rincian Jenjang & Biaya Pendidikan */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Pilihan Jenjang & Biaya Pendidikan</h3>
            <p className="text-xs text-gray-500">Transparan tanpa biaya tersembunyi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JENJANG_LIST.map((j) => (
            <div key={j.id} className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  {j.badge}
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-1">{j.shortName}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{j.deskripsi}</p>
                
                <div className="my-3 py-2 border-y border-gray-100 text-xs">
                  <div className="flex justify-between py-0.5">
                    <span className="text-gray-500">Infaq Formulir:</span>
                    <strong className="text-emerald-800">Rp {j.biayaFormulir.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-gray-500">Uang Pangkal/Gedung:</span>
                    <strong className="text-gray-900">{j.biayaMasuk}</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Program Unggulan:</span>
                  {j.programUnggulan.slice(0, 3).map((p, idx) => (
                    <div key={idx} className="text-[11px] text-gray-700 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onStartRegistration}
                className="mt-4 w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white text-xs font-bold transition-all"
              >
                Pilih Jenjang Ini
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Syarat Pendaftaran & Dokumen */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Persyaratan & Berkas Pendaftaran</h3>
            <p className="text-xs text-gray-500">Siapkan dokumen-dokumen berikut sebelum mengisi formulir</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <h4 className="font-bold text-gray-900 uppercase text-[11px] text-emerald-900">Persyaratan Umum:</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Muslim / Muslimah berakhlak mulia dan sanggup mematuhi tata tertib pesantren.</li>
              <li>Memiliki kemauan kuat untuk belajar ilmu agama dan menghafal Al-Qur'an.</li>
              <li>Lulus dari jenjang sebelumnya (TK untuk SD, SD/MI untuk SMP, SMP/MTs untuk SMA).</li>
              <li>Sehat jasmani dan rohani serta bebas dari penyakit menular berat.</li>
              <li>Bersedia tinggal di asrama (khusus jenjang SMP, SMA & Ma'had Aly).</li>
            </ul>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <h4 className="font-bold text-gray-900 uppercase text-[11px] text-emerald-900">Berkas Yang Perlu Diunggah:</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Bukti transfer biaya formulir pendaftaran (jika via transfer).</li>
              <li>Pas foto calon santri ukuran 3x4 berwarna dengan latar polos.</li>
              <li>Scan / foto Kartu Keluarga (KK) yang masih berlaku.</li>
              <li>Scan / foto Akta Kelahiran santri.</li>
              <li>Surat keterangan NISN aktif atau scan halaman depan raport sekolah asal.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lokasi & Kontak */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block mb-1">Sekretariat Panitia</span>
            <h3 className="text-xl font-black">Pondok Pesantren Al-Madina Prabumulih</h3>
            <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
              Jl. Jenderal Sudirman KM 6, Karang Raja, Kec. Prabumulih Timur, Kota Prabumulih, Sumatera Selatan 31121
            </p>
            <div className="mt-4 space-y-1 text-xs text-emerald-200">
              <div>⏰ <strong>Jam Kerja TU:</strong> Senin - Sabtu (08.00 - 15.00 WIB)</div>
              <div>📞 <strong>Hotline SPMB:</strong> 0812-7890-1234 / 0813-9988-7766</div>
              <div>✉️ <strong>Email Resmi:</strong> spmb@almadina.ponpes.id</div>
            </div>
          </div>

          <div className="bg-emerald-950/70 p-5 rounded-2xl border border-emerald-700/60 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-amber-300 text-sm mb-1">Punya Pertanyaan Seputar Pendaftaran?</h4>
              <p className="text-xs text-emerald-100">
                Panitia kami siap membantu Anda memberikan informasi asrama, program beasiswa tahfidz, dan jadwal observasi langsung ke pondok.
              </p>
            </div>

            <a
              href="https://wa.me/6281278901234?text=Bismillah,%20saya%20ingin%20berkonsultasi%20mengenai%20SPMB%20Al-Madina"
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Hubungi CS Panitia via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
