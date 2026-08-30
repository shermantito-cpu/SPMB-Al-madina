import React, { useState } from 'react';
import { ArrowLeft, Calendar, FileText, Users, DollarSign, Download, ArrowRight, Info, X } from 'lucide-react';
import MultiStepForm from './MultiStepForm';

interface RegistrationInfoProps {
  jenjang: string;
  onBack: () => void;
  printRegNumber?: string | null;
}

const getJenjangDetails = (id: string) => {
  switch (id) {
    case 'RA': return { name: 'Raudhatul Athfal (TK)', price: 'Rp 250.000', kuota: 36 };
    case 'Ula': return { name: 'Raudhatul Salafiyah Ula (SD)', price: 'Rp 250.000', kuota: 56 };
    case 'Wustho': return { name: 'Salafiyah Wustho (SMP)', price: 'Rp 350.000', kuota: 56 };
    case 'Ulya': return { name: 'Salafiyah Ulya (SMA)', price: 'Rp 350.000', kuota: 32 };
    case 'Mahad_Aly': return { name: "Ma'had Aly/Tadribud Du'at (D3/S1)", price: 'Rp 200.000', kuota: 28 };
    default: return { name: 'Jenjang', price: 'Rp -', kuota: 0 };
  }
};

export default function RegistrationInfo({ jenjang, onBack, printRegNumber }: RegistrationInfoProps) {
  const [showForm, setShowForm] = useState(!!printRegNumber);
  const [isCheckMode, setIsCheckMode] = useState(!!printRegNumber);
  const [showFeeModal, setShowFeeModal] = useState(false);
  
  React.useEffect(() => {
    if (printRegNumber) {
      setShowForm(true);
      setIsCheckMode(true);
    }
  }, [printRegNumber]);

  const details = getJenjangDetails(jenjang);

  if (showForm) {
    return <MultiStepForm jenjang={jenjang} jenjangName={details.name} onBack={() => { setShowForm(false); setIsCheckMode(false); }} initialCheckMode={isCheckMode} initialRegNumber={printRegNumber || null} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Kembali</span>
          </button>
          <div className="mx-auto text-center font-bold text-gray-800 text-lg hidden sm:block">
            Informasi Pendaftaran {details.name}
          </div>
          <div className="w-20 hidden sm:block"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        
        {/* Title Mobile */}
        <h2 className="text-2xl font-bold text-gray-800 mb-8 sm:hidden text-center">
          Informasi Pendaftaran<br/>
          <span className="text-emerald-600">{details.name}</span>
        </h2>

        {/* Desktop Title Header */}
        <div className="hidden sm:block text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            Detail Informasi Pendaftaran
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Jenjang {details.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Jadwal Pelaksanaan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:row-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-3">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Jadwal Pelaksanaan</h3>
            </div>
            
            <div className="space-y-6 flex-1">
              {/* Gelombang 1 */}
              <div>
                <h4 className="font-bold text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-md mb-3 text-sm">
                  Gelombang 1
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Pendaftaran</span>
                    <span className="font-semibold text-gray-800 text-right">9 Sep - 30 Okt 2026</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Tes Seleksi</span>
                    <span className="font-semibold text-gray-800 text-right">1 November 2026</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Pengumuman</span>
                    <span className="font-semibold text-gray-800 text-right">9 November 2026</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="pr-4">Daftar Ulang <span className="text-xs text-gray-400 block">(Batas Pelunasan)</span></span>
                    <span className="font-semibold text-gray-800 text-right">16 November 2026</span>
                  </li>
                </ul>
              </div>

              {/* Gelombang 2 */}
              <div>
                <h4 className="font-bold text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-md mb-3 text-sm">
                  Gelombang 2
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Pendaftaran</span>
                    <span className="font-semibold text-gray-800 text-right">10 Nov - 26 Mar 2027</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Tes Seleksi</span>
                    <span className="font-semibold text-gray-800 text-right">28 Maret 2027</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Pengumuman</span>
                    <span className="font-semibold text-gray-800 text-right">5 April 2027</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="pr-4">Daftar Ulang <span className="text-xs text-gray-400 block">(Batas Pelunasan)</span></span>
                    <span className="font-semibold text-gray-800 text-right">12 April 2027</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Biaya Pendaftaran */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mr-3">
                <DollarSign size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Biaya Pendaftaran</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center py-4 text-center">
              <span className="text-gray-500 text-sm mb-1">Total Biaya Pendaftaran Formulir</span>
              <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">{details.price}</span>
              <p className="text-xs text-gray-400 mt-3 max-w-xs leading-relaxed mb-4">
                (Biaya tersebut belum termasuk biaya daftar ulang dan seragam saat dinyatakan lulus)
              </p>
              {(jenjang === 'Wustho' || jenjang === 'Ulya') && (
                <button 
                  onClick={() => setShowFeeModal(true)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold py-2 px-4 rounded-lg flex items-center transition-colors border border-emerald-200"
                >
                  <Info size={16} className="mr-2" />
                  Lihat Biaya Daftar Ulang
                </button>
              )}
            </div>
          </div>

          {/* Kuota & Brosur */}
          <div className="flex gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-center">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mr-3">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Kuota Penerimaan</h3>
              </div>
              <div className="pl-13 mt-2 flex-1 flex flex-col justify-center">
                <div className="text-4xl font-extrabold text-gray-800">{details.kuota} <span className="text-lg font-medium text-gray-500">Santri</span></div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">Kuota terbatas, pendaftaran ditutup jika kuota telah terpenuhi.</p>
              </div>
            </div>
          </div>

          {/* Berkas Administrasi */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mr-3">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Berkas Administrasi</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-600 list-disc pl-5">
              <li>Bukti Pembayaran Pendaftaran</li>
            </ul>
          </div>
          
        </div>

        {/* Action Button */}
        <div className="mt-12 mb-16 text-center">
          <p className="text-gray-500 text-sm mb-4">Ingin mengetahui informasi lebih detail?</p>
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto mb-8">
            <a 
              href="https://drive.google.com/file/d/1HVFp2sfUCUghIQVPBKuWgA1PAQxQeKsW/view?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold py-3 px-8 rounded-full border border-blue-200 transition-all flex items-center justify-center text-base"
            >
              <Download size={20} className="mr-2" />
              Download Brosur SPMB
            </a>
          </div>
          
          <p className="text-gray-500 text-sm mb-4">Sudah membaca dan menyiapkan berkas?</p>
          <div className="flex flex-col items-center gap-3 md:gap-4 max-w-md mx-auto w-full px-4 sm:px-0">
            <button 
              onClick={() => { setIsCheckMode(false); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 md:py-4 px-6 md:px-8 rounded-full shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-base md:text-lg"
            >
              Isi Formulir Sekarang
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Fee Modal */}
        {showFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Biaya Daftar Ulang</h3>
                  <p className="text-sm text-gray-500 mt-1">Jenjang {jenjang === 'Wustho' ? 'Salafiyah Wustho (SMP)' : 'Salafiyah Ulya (SMA)'}</p>
                </div>
                <button 
                  onClick={() => setShowFeeModal(false)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {jenjang === 'Wustho' && (
                    <>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Infak Bangunan</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 7.250.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Sarpras</span>
                          <span className="block text-xs text-gray-400 mt-0.5">(1x sampai selesai)</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 3.250.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Alat Asrama</span>
                          <span className="block text-xs text-gray-400 mt-0.5">(1x sampai selesai)</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 1.000.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Infak Kegiatan & Kesehatan</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 1.250.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Uang Seragam</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 1.000.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Uang Syahriah/Bulanan</span>
                          <span className="block text-xs text-gray-400 mt-0.5">(SPP, Asrama, Makan 3x, laundry)</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 1.400.000</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-800 text-lg">TOTAL</span>
                        <span className="font-extrabold text-emerald-600 text-xl">Rp 15.150.000</span>
                      </div>
                    </>
                  )}
                  {jenjang === 'Ulya' && (
                    <>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Infak Bangunan</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 7.500.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Sarpras</span>
                          <span className="block text-xs text-gray-400 mt-0.5">(1x sampai selesai)</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 3.500.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Alat Asrama</span>
                          <span className="block text-xs text-gray-400 mt-0.5">(1x sampai selesai)</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 1.000.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Infak Kegiatan & Kesehatan</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 1.550.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Uang Seragam</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 1.000.000</span>
                      </div>
                      <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <span className="block font-medium text-gray-700">Uang Syahriah/Bulanan</span>
                          <span className="block text-xs text-gray-400 mt-0.5">(SPP, Asrama, Makan 3x, laundry)</span>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap ml-4">Rp 1.500.000</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-800 text-lg">TOTAL</span>
                        <span className="font-extrabold text-emerald-600 text-xl">Rp 16.050.000</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 text-center rounded-b-2xl">
                <button 
                  onClick={() => setShowFeeModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
