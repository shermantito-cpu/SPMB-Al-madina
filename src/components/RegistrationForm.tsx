import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  CreditCard, 
  User, 
  BookOpen, 
  Users, 
  Building, 
  Sparkles,
  ShieldCheck,
  Phone,
  Trash2,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { JenjangType, MetodeBayar, UploadedFileMeta, PendaftarData, GasConfig } from '../types';
import { JENJANG_LIST, BANK_ACCOUNTS } from '../data/defaultData';
import { addPendaftar } from '../services/apiService';

interface RegistrationFormProps {
  gasConfig: GasConfig;
  onRegistrationSuccess: (pendaftar: PendaftarData) => void;
  onGoToStatus: (nik: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  gasConfig,
  onRegistrationSuccess,
  onGoToStatus
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  // Form State
  const [jenjang, setJenjang] = useState<JenjangType>("Salafiyah Wustho (SMP)");
  
  // Data Santri
  const [nama, setNama] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [tempatLahir, setTempatLahir] = useState<string>('');
  const [tglLahir, setTglLahir] = useState<string>('');
  const [jk, setJk] = useState<"Laki-laki" | "Perempuan" | "">('Laki-laki');
  const [anakKe, setAnakKe] = useState<string>('1');
  const [jmlSaudara, setJmlSaudara] = useState<string>('3');
  const [golDarah, setGolDarah] = useState<string>('O');
  const [riwayatPenyakit, setRiwayatPenyakit] = useState<string>('Tidak ada');

  // Data Pendidikan
  const [asalSekolah, setAsalSekolah] = useState<string>('');
  const [nisn, setNisn] = useState<string>('');
  const [tahunLulus, setTahunLulus] = useState<string>('2026');

  // Data Orang Tua
  const [namaAyah, setNamaAyah] = useState<string>('');
  const [namaIbu, setNamaIbu] = useState<string>('');
  const [noWa, setNoWa] = useState<string>('');
  const [pekerjaan, setPekerjaan] = useState<string>('');
  const [gaji, setGaji] = useState<string>('Rp 3.000.001 - Rp 5.000.000');
  const [alamat, setAlamat] = useState<string>('');
  const [kabKota, setKabKota] = useState<string>('Kota Prabumulih');
  const [provinsi, setProvinsi] = useState<string>('Sumatera Selatan');

  // Administrasi & Uploads
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayar>('Transfer Bank');
  const [fileBukti, setFileBukti] = useState<UploadedFileMeta | null>(null);
  const [fileKk, setFileKk] = useState<UploadedFileMeta | null>(null);
  const [fileAkte, setFileAkte] = useState<UploadedFileMeta | null>(null);
  const [fileFoto, setFileFoto] = useState<UploadedFileMeta | null>(null);
  const [fileSkNisn, setFileSkNisn] = useState<UploadedFileMeta | null>(null);

  // Review & Agreement
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [successData, setSuccessData] = useState<PendaftarData | null>(null);
  const [copiedBank, setCopiedBank] = useState<string>('');

  // Selected Jenjang Info
  const selectedJenjangInfo = JENJANG_LIST.find(j => j.id === jenjang) || JENJANG_LIST[2];
  const isNisnStrict = jenjang.includes('Wustho') || jenjang.includes('Ulya');

  const handleCopy = (text: string, bank: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(''), 2500);
  };

  const processFile = (file: File): Promise<UploadedFileMeta> => {
    return new Promise((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`Ukuran file "${file.name}" melebihi 2MB! Mohon kompres file Anda.`);
        return reject(new Error("File too large"));
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          base64Data,
          previewUrl: file.type.startsWith('image/') ? result : undefined
        });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (meta: UploadedFileMeta | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const meta = await processFile(e.target.files[0]);
        setter(meta);
      } catch (err) {
        console.error("Upload error", err);
      }
    }
  };

  const validateStep = (step: number): boolean => {
    setSubmitError('');
    if (step === 1) {
      if (!jenjang) {
        setSubmitError('Silakan pilih salah satu jenjang pendidikan tujuan.');
        return false;
      }
    } else if (step === 2) {
      if (!nama.trim()) { setSubmitError('Nama lengkap santri wajib diisi.'); return false; }
      if (!nik.trim() || nik.length !== 16 || !/^\d+$/.test(nik)) {
        setSubmitError('NIK wajib 16 digit angka sesuai Kartu Keluarga.');
        return false;
      }
      if (!tempatLahir.trim()) { setSubmitError('Tempat lahir wajib diisi.'); return false; }
      if (!tglLahir) { setSubmitError('Tanggal lahir wajib diisi.'); return false; }
      if (!jk) { setSubmitError('Jenis kelamin wajib dipilih.'); return false; }
    } else if (step === 3) {
      if (!asalSekolah.trim()) { setSubmitError('Asal sekolah/madrasah wajib diisi.'); return false; }
      
      const cleanNisn = nisn.trim();
      if (isNisnStrict) {
        if (!cleanNisn) {
          setSubmitError('NISN wajib diisi.');
          return false;
        }
        if (cleanNisn.length !== 10) {
          setSubmitError('NISN Harus 10 Digit.');
          return false;
        }
      }

      if (!tahunLulus) { setSubmitError('Tahun lulus wajib diisi.'); return false; }
    } else if (step === 4) {
      if (!namaAyah.trim()) { setSubmitError('Nama ayah wajib diisi.'); return false; }
      if (!namaIbu.trim()) { setSubmitError('Nama ibu wajib diisi.'); return false; }
      if (!noWa.trim() || noWa.length < 9) {
        setSubmitError('Nomor WhatsApp aktif wajib diisi untuk verifikasi & kirim informasi.');
        return false;
      }
      if (!pekerjaan.trim()) { setSubmitError('Pekerjaan orang tua wajib diisi.'); return false; }
      if (!alamat.trim()) { setSubmitError('Alamat lengkap tempat tinggal wajib diisi.'); return false; }
    } else if (step === 5) {
      // Validasi berkas upload dihapus sementara untuk keperluan uji coba
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setSubmitError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementChecked) {
      setSubmitError('Harap centang pernyataan persetujuan kebenaran data sebelum mengirim.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await addPendaftar({
        jenjang,
        nama,
        nik,
        tempat_lahir: tempatLahir,
        tgl_lahir: tglLahir,
        jk,
        anak_ke: anakKe,
        jml_saudara: jmlSaudara,
        gol_darah: golDarah,
        riwayat_penyakit: riwayatPenyakit,
        asal_sekolah: asalSekolah,
        nisn: nisn || '-',
        tahun_lulus: tahunLulus,
        nama_ayah: namaAyah,
        nama_ibu: namaIbu,
        no_wa: noWa,
        pekerjaan,
        gaji,
        alamat,
        kab_kota: kabKota,
        provinsi,
        metode_bayar: metodeBayar,
        bukti_bayar: fileBukti || undefined,
        kk: fileKk || undefined,
        akte: fileAkte || undefined,
        foto: fileFoto || undefined,
        sk_nisn: fileSkNisn || undefined
      }, gasConfig);

      if (result.success) {
        setSuccessData(result.data);
        onRegistrationSuccess(result.data);

        // Fire celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if confetti fails
        }
      } else {
        setSubmitError(result.message);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan sistem saat menyimpan pendaftaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If Registration was submitted successfully, display Celebration Card
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 sm:p-12 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-14 h-14 text-emerald-600" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-emerald-800 mb-4 uppercase tracking-tight">
          ALHAMDULILLAH,
        </h1>
        
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-8 leading-relaxed uppercase">
          PENDAFTARAN SPMB ANANDA <span className="text-emerald-700 underline decoration-emerald-300 decoration-4 underline-offset-4">{successData.nama}</span><br />
          KE PONDOK PESANTREN AL MADINA BERHASIL
        </h2>

        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 mb-8 text-center shadow-xl transform hover:scale-[1.02] transition-transform">
          <div className="text-sm text-emerald-200 font-medium mb-2 tracking-widest uppercase">NOMOR REGISTRASI PENDAFTARAN:</div>
          <div className="font-mono text-3xl sm:text-4xl font-black text-amber-300 tracking-wider">
            {successData.nomorRegistrasi}
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8">
          <p className="text-gray-700 text-sm leading-relaxed font-medium">
            Silahkan salin nomor registrasi SPMB untuk mengecek status dan mencetak kartu peserta ujian ananda.
          </p>
        </div>

        <p className="text-lg font-bold text-emerald-900 italic mb-8">
          Jazakumullahu Khoiron, Semoga Allah Mudahkan
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onGoToStatus(successData.nik)}
            id="btn-goto-check-status"
            className="px-6 py-3 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
          >
            <span>Cek Status & Kartu Ujian</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSuccessData(null);
              setCurrentStep(1);
              setNama('');
              setNik('');
              setFileBukti(null);
            }}
            id="btn-register-another"
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Daftar Santri Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-emerald-100/80 p-5 sm:p-8 md:p-10 relative">
      
      {/* Wizard Step Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative mb-2">
          {/* Background Connecting Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 rounded-full z-0"></div>
          {/* Active Fill Line */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-emerald-600 rounded-full z-0 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>

          {[
            { step: 1, label: "Jenjang" },
            { step: 2, label: "Data Santri" },
            { step: 3, label: "Pendidikan" },
            { step: 4, label: "Orang Tua" },
            { step: 5, label: "Berkas" },
            { step: 6, label: "Konfirmasi" }
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div key={item.step} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md'
                      : isCurrent
                      ? 'bg-amber-400 text-emerald-950 ring-4 ring-amber-100 shadow-lg font-black scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : item.step}
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold mt-1.5 hidden sm:block ${
                  isCurrent ? 'text-emerald-900 font-bold' : isCompleted ? 'text-emerald-700' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Mohon Periksa Kembali:</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* ========================================================================= */}
        {/* STEP 1: PILIH JENJANG */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                Langkah 1 dari 6
              </div>
              <h2 className="text-2xl font-black text-gray-900">Pilih Jenjang Pendidikan Santri</h2>
              <p className="text-gray-500 text-sm mt-1">
                Pilih jenjang sekolah yang dituju untuk tahun ajaran 2027/2028.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {JENJANG_LIST.map((item) => {
                const isSelected = jenjang === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setJenjang(item.id)}
                    className={`rounded-2xl p-5 cursor-pointer border-2 transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/30'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50/70'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 rounded-bl-xl text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Terpilih
                      </div>
                    )}

                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                          {item.badge}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">{item.shortName}</h3>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.deskripsi}</p>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-500 block text-[10px]">Infaq Formulir:</span>
                            <span className="font-bold text-emerald-800">Rp {item.biayaFormulir.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-500 block text-[10px]">Kuota Tersedia:</span>
                            <span className="font-semibold text-gray-700">{item.kuota - item.terdaftar} dari {item.kuota} Kursi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Summary Card */}
            <div className="bg-emerald-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-300 font-semibold uppercase">Pilihan Anda:</span>
                <h4 className="text-lg font-bold text-amber-300">{selectedJenjangInfo.shortName}</h4>
                <p className="text-xs text-emerald-100 mt-0.5">Biaya Pendaftaran: Rp {selectedJenjangInfo.biayaFormulir.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedJenjangInfo.programUnggulan.slice(0, 2).map((prog, idx) => (
                  <span key={idx} className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-100 border border-emerald-700">
                    {prog}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DATA SANTRI */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Langkah 2 dari 6
              </div>
              <h2 className="text-2xl font-black text-gray-900">Biodata Lengkap Calon Santri</h2>
              <p className="text-gray-500 text-sm mt-1">
                Isi data pribadi calon santri sesuai dengan dokumen Akta Kelahiran dan Kartu Keluarga (KK).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nama Lengkap Santri <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Muhammad Rayhan Al-Fatih"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-nik"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="Contoh: 1671012304080001"
                  required
                  maxLength={16}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono tracking-wider font-semibold"
                />
                <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                  <span>Lihat NIK di Kartu Keluarga (KK)</span>
                  <span className={nik.length === 16 ? "text-emerald-600 font-bold" : "text-amber-600"}>
                    {nik.length}/16 Digit
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-tempat-lahir"
                  value={tempatLahir}
                  onChange={(e) => setTempatLahir(e.target.value)}
                  placeholder="Contoh: Prabumulih"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="input-tgl-lahir"
                  value={tglLahir}
                  onChange={(e) => setTglLahir(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  id="input-jk"
                  value={jk}
                  onChange={(e) => setJk(e.target.value as any)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                >
                  <option value="Laki-laki">Laki-laki (Ikhwan)</option>
                  <option value="Perempuan">Perempuan (Akhwat)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Anak Ke- & Jumlah Saudara <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="input-anak-ke"
                    min="1"
                    value={anakKe}
                    onChange={(e) => setAnakKe(e.target.value)}
                    required
                    placeholder="Ke"
                    className="w-1/2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-center"
                  />
                  <span className="text-xs text-gray-500">dari</span>
                  <input
                    type="number"
                    id="input-jml-saudara"
                    min="1"
                    value={jmlSaudara}
                    onChange={(e) => setJmlSaudara(e.target.value)}
                    placeholder="Bersaudara"
                    className="w-1/2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Golongan Darah (Opsional)
                </label>
                <select
                  id="input-gol-darah"
                  value={golDarah}
                  onChange={(e) => setGolDarah(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                >
                  <option value="A">Golongan A</option>
                  <option value="B">Golongan B</option>
                  <option value="AB">Golongan AB</option>
                  <option value="O">Golongan O</option>
                  <option value="Tidak Tahu">Belum Tahu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Riwayat Alergi / Penyakit (Opsional)
                </label>
                <input
                  type="text"
                  id="input-riwayat-penyakit"
                  value={riwayatPenyakit}
                  onChange={(e) => setRiwayatPenyakit(e.target.value)}
                  placeholder="Contoh: Asma ringan, Alergi kacang, atau Tidak ada"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DATA PENDIDIKAN ASAL */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Langkah 3 dari 6
              </div>
              <h2 className="text-2xl font-black text-gray-900">Riwayat Pendidikan Sebelumnya</h2>
              <p className="text-gray-500 text-sm mt-1">
                Informasi sekolah asal calon santri untuk verifikasi database Kemendikbudristek / Kemenag.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nama Asal Sekolah / Madrasah / TK <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-asal-sekolah"
                  value={asalSekolah}
                  onChange={(e) => setAsalSekolah(e.target.value)}
                  placeholder="Contoh: SDIT Al-Hikmah Prabumulih atau TK Kemala Bhayangkari"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Nomor Induk Siswa Nasional (NISN) {isNisnStrict && <span className="text-red-500">*</span>}
                  </label>
                  {!isNisnStrict && (
                    <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      Opsional untuk Jenjang Ini
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  id="input-nisn"
                  value={nisn}
                  onChange={(e) => {
                    setSubmitError(''); // Clear general submit error if they are typing
                    setNisn(isNisnStrict ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value.replace(/\D/g, '').slice(0, 20));
                  }}
                  placeholder={!isNisnStrict ? "Opsional (Kosongkan jika belum memiliki)" : "Contoh: 0134567890 (10 Digit)"}
                  required={isNisnStrict}
                  className={`w-full px-4 py-3 rounded-xl border ${isNisnStrict && nisn.length > 0 && nisn.length < 10 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'} focus:ring-2 text-sm font-mono font-medium`}
                />
                
                {isNisnStrict && nisn.length > 0 && nisn.length < 10 && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-semibold animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>NISN Harus 10 Digit. (Kurang {10 - nisn.length} digit lagi)</span>
                  </div>
                )}
                
                <div className="flex justify-between text-[11px] mt-1">
                  <span className="text-gray-500">NISN tertera pada raport sekolah asal atau surat keterangan NISN aktif.</span>
                  {isNisnStrict && (
                    <span className={nisn.length === 10 ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                      {nisn.length}/10 Digit
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Tahun Kelulusan Dari Sekolah Asal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="input-tahun-lulus"
                  min="2000"
                  max="2028"
                  value={tahunLulus}
                  onChange={(e) => setTahunLulus(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: DATA ORANG TUA / WALI */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Langkah 4 dari 6
              </div>
              <h2 className="text-2xl font-black text-gray-900">Data Orang Tua / Wali Santri</h2>
              <p className="text-gray-500 text-sm mt-1">
                Data kontak wali yang dapat dihubungi secara aktif untuk konfirmasi kelulusan dan panggilan ujian.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nama Lengkap Ayah / Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-nama-ayah"
                  value={namaAyah}
                  onChange={(e) => setNamaAyah(e.target.value)}
                  placeholder="Contoh: H. Ahmad Dahlan, S.Pd.I"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nama Lengkap Ibu Kandung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-nama-ibu"
                  value={namaIbu}
                  onChange={(e) => setNamaIbu(e.target.value)}
                  placeholder="Contoh: Hj. Siti Aisyah, S.E"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nomor WhatsApp Aktif Wali <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="input-no-wa"
                    value={noWa}
                    onChange={(e) => setNoWa(e.target.value.replace(/[^\d+]/g, ''))}
                    placeholder="Contoh: 081278901234"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-mono font-medium"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Kartu ujian & notifikasi jadwal akan dikirimkan ke nomor ini.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Pekerjaan Utama Ayah / Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-pekerjaan"
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  placeholder="Contoh: PNS / Guru / Pedagang / Wiraswasta"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Penghasilan / Gaji Gabungan Orang Tua Perbulan <span className="text-red-500">*</span>
                </label>
                <select
                  id="input-gaji"
                  value={gaji}
                  onChange={(e) => setGaji(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                >
                  <option value="< Rp 1.000.000">&lt; Rp 1.000.000 / Bulan (Keluarga Pra-Sejahtera)</option>
                  <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000 / Bulan</option>
                  <option value="Rp 3.000.001 - Rp 5.000.000">Rp 3.000.001 - Rp 5.000.000 / Bulan</option>
                  <option value="Rp 5.000.001 - Rp 10.000.000">Rp 5.000.001 - Rp 10.000.000 / Bulan</option>
                  <option value="> Rp 10.000.000">&gt; Rp 10.000.000 / Bulan</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Alamat Lengkap Tempat Tinggal <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="input-alamat"
                  rows={3}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. / Dusun, RT/RW, Kelurahan/Desa, Kecamatan, Kota/Kabupaten"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: ADMINISTRASI & UPLOAD BERKAS */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Langkah 5 dari 6
              </div>
              <h2 className="text-2xl font-black text-gray-900">Pembayaran & Unggah Berkas</h2>
              <p className="text-gray-500 text-sm mt-1">
                Pilih metode pembayaran biaya pendaftaran dan unggah berkas persyaratan administrasi santri.
              </p>
            </div>

            {/* Infaq Formulir Fee Info Banner */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-lg border border-emerald-700/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs text-emerald-300 font-semibold uppercase">Biaya Formulir & Tes Masuk:</span>
                  <div className="text-2xl font-black text-amber-300">
                    Rp {selectedJenjangInfo.biayaFormulir.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-emerald-200 font-medium">Jenjang: {selectedJenjangInfo.shortName}</span>
                </div>

                <div className="bg-emerald-800/80 px-3.5 py-1.5 rounded-xl border border-emerald-600 text-xs font-medium">
                  Tahun Ajaran 2027/2028
                </div>
              </div>

              <div className="border-t border-emerald-800 pt-4">
                <span className="text-xs text-emerald-200 block mb-2 font-bold uppercase tracking-wide">
                  Pilihan Rekening Resmi Pesantren:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {BANK_ACCOUNTS.map((bank, bIdx) => (
                    <div key={bIdx} className="bg-emerald-950/70 border border-emerald-700/60 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-emerald-100">{bank.bankName}</div>
                        <div className="font-mono text-sm font-bold text-amber-300 mt-1">{bank.accountNumber}</div>
                        <div className="text-[10px] text-emerald-300/80 truncate">a.n {bank.accountHolder}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(bank.accountNumber, bank.bankName)}
                        className="mt-2.5 w-full text-[11px] font-bold py-1 px-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 flex items-center justify-center gap-1 transition-colors"
                      >
                        {copiedBank === bank.bankName ? (
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Disalin!
                          </span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Salin No. Rek
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Metode Pembayaran Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Pilih Metode Pembayaran Biaya Pendaftaran <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  metodeBayar === 'Transfer Bank' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="metode_bayar"
                    value="Transfer Bank"
                    checked={metodeBayar === 'Transfer Bank'}
                    onChange={() => setMetodeBayar('Transfer Bank')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-gray-900">Transfer Bank / M-Banking / ATM</div>
                    <div className="text-xs text-gray-500 mt-0.5">Transfer ke rekening resmi BSI/Mandiri/BRI dan lampirkan struk bukti.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  metodeBayar === 'Tunai di Kantor (Khusus Domisili Dekat)' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="metode_bayar"
                    value="Tunai di Kantor (Khusus Domisili Dekat)"
                    checked={metodeBayar === 'Tunai di Kantor (Khusus Domisili Dekat)'}
                    onChange={() => setMetodeBayar('Tunai di Kantor (Khusus Domisili Dekat)')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-gray-900">Tunai Langsung di Kantor TU</div>
                    <div className="text-xs text-gray-500 mt-0.5">Pembayaran langsung ke panitia di Pondok maksimal 3 hari kerja.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Alert if Tunai is picked */}
            {metodeBayar === 'Tunai di Kantor (Khusus Domisili Dekat)' && (
              <div className="p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Catatan Pembayaran Tunai:</strong> Setelah formulir ini dikirim, status Anda adalah <em>"Menunggu Pembayaran Tunai"</em>. Harap selesaikan pembayaran di kantor Tata Usaha Ponpes Al-Madina agar panitia dapat memverifikasi dan menerbitkan kartu ujian.
                </div>
              </div>
            )}

            {/* File Upload Grid */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  Unggah Berkas Persyaratan (Format: JPG, PNG, PDF maks 2MB)
                </h3>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Otomatis Terenkripsi Base64
                </span>
              </div>

              {/* Upload Item 1: Bukti Transfer */}
              {metodeBayar === 'Transfer Bank' && (
                <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          Bukti Transfer Pembayaran <span className="text-gray-400 font-normal text-xs ml-1">(Opsional)</span>
                        </div>
                        <p className="text-xs text-gray-500">Struk ATM / Screenshot M-Banking jelas & terbaca.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {fileBukti ? (
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="max-w-[140px] truncate">{fileBukti.fileName}</span>
                          <button
                            type="button"
                            onClick={() => setFileBukti(null)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Berkas</span>
                          <input
                            type="file"
                            id="file-bukti"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload(e, setFileBukti)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Item 2: Pas Foto Santri */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        Pas Foto Calon Santri (Ukuran 3x4) <span className="text-gray-400 font-normal text-xs ml-1">(Opsional)</span>
                      </div>
                      <p className="text-xs text-gray-500">Foto resmi berpakaian rapi / berpeci / berjilbab.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fileFoto ? (
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-semibold text-emerald-800">
                        {fileFoto.previewUrl && (
                          <img src={fileFoto.previewUrl} alt="Preview" className="w-6 h-6 rounded object-cover" />
                        )}
                        <span className="max-w-[140px] truncate">{fileFoto.fileName}</span>
                        <button
                          type="button"
                          onClick={() => setFileFoto(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-gray-600" />
                        <span>Upload Foto</span>
                        <input
                          type="file"
                          id="file-foto"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setFileFoto)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Item 3: Kartu Keluarga (KK) */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        Scan / Foto Kartu Keluarga (KK) <span className="text-gray-400 font-normal text-xs ml-1">(Opsional)</span>
                      </div>
                      <p className="text-xs text-gray-500">Scan dokumen asli atau fotokopi legalisir.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fileKk ? (
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="max-w-[140px] truncate">{fileKk.fileName}</span>
                        <button
                          type="button"
                          onClick={() => setFileKk(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-gray-600" />
                        <span>Upload KK</span>
                        <input
                          type="file"
                          id="file-kk"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, setFileKk)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Item 4: Akta Kelahiran */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        Scan / Foto Akta Kelahiran <span className="text-gray-400 font-normal text-xs ml-1">(Opsional)</span>
                      </div>
                      <p className="text-xs text-gray-500">Dokumen bukti tempat dan tanggal kelahiran santri.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fileAkte ? (
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="max-w-[140px] truncate">{fileAkte.fileName}</span>
                        <button
                          type="button"
                          onClick={() => setFileAkte(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-gray-600" />
                        <span>Upload Akta</span>
                        <input
                          type="file"
                          id="file-akte"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, setFileAkte)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Item 5: SK NISN */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        Surat Keterangan Validasi NISN / Rapor <span className="text-gray-400 font-normal text-xs ml-1">(Opsional)</span>
                      </div>
                      <p className="text-xs text-gray-500">Scan surat keterangan NISN atau halaman depan rapor.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fileSkNisn ? (
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="max-w-[140px] truncate">{fileSkNisn.fileName}</span>
                        <button
                          type="button"
                          onClick={() => setFileSkNisn(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-gray-600" />
                        <span>Upload Dokumen</span>
                        <input
                          type="file"
                          id="file-sk-nisn"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, setFileSkNisn)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: REVIEW & KONFIRMASI DATA */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Langkah 6 dari 6
              </div>
              <h2 className="text-2xl font-black text-gray-900">Periksa Ringkasan Formulir</h2>
              <p className="text-gray-500 text-sm mt-1">
                Pastikan data yang dimasukkan sudah benar sebelum data dikirimkan ke panitia SPMB.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[11px]">Jenjang Yang Dituju:</span>
                  <span className="text-base font-extrabold text-emerald-900">{jenjang}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[11px]">Biaya Pendaftaran:</span>
                  <span className="text-sm font-bold text-amber-800">
                    Rp {selectedJenjangInfo.biayaFormulir.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-gray-800 uppercase text-[11px] mb-2 text-emerald-800">
                    Data Santri:
                  </h4>
                  <ul className="space-y-1.5 text-gray-700">
                    <li><span className="text-gray-500 w-24 inline-block">Nama:</span> <strong>{nama}</strong></li>
                    <li><span className="text-gray-500 w-24 inline-block">NIK:</span> <strong className="font-mono">{nik}</strong></li>
                    <li><span className="text-gray-500 w-24 inline-block">TTL:</span> {tempatLahir}, {tglLahir}</li>
                    <li><span className="text-gray-500 w-24 inline-block">Kelamin:</span> {jk}</li>
                    <li><span className="text-gray-500 w-24 inline-block">Anak ke:</span> {anakKe} dari {jmlSaudara} bersaudara</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 uppercase text-[11px] mb-2 text-emerald-800">
                    Data Pendidikan & Wali:
                  </h4>
                  <ul className="space-y-1.5 text-gray-700">
                    <li><span className="text-gray-500 w-24 inline-block">Asal Sekolah:</span> {asalSekolah}</li>
                    <li><span className="text-gray-500 w-24 inline-block">NISN:</span> <span className="font-mono">{nisn || '-'}</span></li>
                    <li><span className="text-gray-500 w-24 inline-block">Ayah / Ibu:</span> {namaAyah} / {namaIbu}</li>
                    <li><span className="text-gray-500 w-24 inline-block">No. WhatsApp:</span> <strong className="font-mono text-emerald-800">{noWa}</strong></li>
                    <li><span className="text-gray-500 w-24 inline-block">Metode Bayar:</span> <strong className="text-emerald-800">{metodeBayar}</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Statement of Truth Checkbox */}
            <div className="bg-emerald-50/80 border-2 border-emerald-300/80 rounded-2xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="checkbox-agreement"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-xs text-emerald-950 font-medium leading-relaxed">
                  <strong>Pernyataan Kebenaran Data:</strong> Saya menyatakan bahwa seluruh data dan dokumen yang saya isikan adalah benar dan dapat dipertanggungjawabkan. Saya bersedia mengikuti seluruh tata tertib dan prosedur seleksi SPMB Pondok Pesantren Al-Madina.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              id="btn-prev-step"
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              id="btn-next-step"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition-all flex items-center gap-2 shadow-md shadow-emerald-700/20"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              id="btn-submit-registration"
              disabled={isSubmitting || !agreementChecked}
              className={`px-8 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all shadow-lg ${
                isSubmitting || !agreementChecked
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-emerald-700/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan ke Spreadsheet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kirim Formulir Pendaftaran</span>
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
