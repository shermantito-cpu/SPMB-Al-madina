import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Clock, CheckCircle, ArrowLeft, Printer, Info } from 'lucide-react';

export default function Dashboard({ onBack, onPrintCard }: { onBack: () => void, onPrintCard: (jenjang: string, regNumber: string) => void }) {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'public_registrations'), where('uid', '==', currentUser.uid)); // OrderBy requires composite index so we will just sort in memory
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })).sort((a: any, b: any) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
        setRegistrations(data);

        
      } catch (err) {
        console.error("Gagal mengambil data pendaftaran", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium mb-6">
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold uppercase">{currentUser?.email?.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Dasbor Saya</h2>
              <p className="text-gray-500">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Riwayat Pendaftaran</h3>
        
        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat data...</div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-800 mb-2">Belum ada pendaftaran</h4>
            <p className="text-gray-500 mb-6">Anda belum pernah melakukan pendaftaran.</p>
            <button onClick={onBack} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
              Mulai Mendaftar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {registrations.map((reg) => {
              const isVerified = reg.statusVerifikasi?.toLowerCase().includes('terverifikasi');
              
              return (
              <div key={reg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                          {reg.jenjangName || reg.jenjang}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(reg.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{reg.namaLengkap}</h4>
                      <p className="text-sm font-mono text-gray-500 mt-1">No. Registrasi: {reg.id}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <div className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border ${isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {isVerified ? <CheckCircle size={18} /> : <Clock size={18} />}
                        {reg.statusVerifikasi || 'Menunggu Verifikasi'}
                      </div>
                      
                      {isVerified && (
                        <button 
                          onClick={() => onPrintCard(reg.jenjang, reg.id)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
                        >
                          <Printer size={16} />
                          Cetak Kartu Ujian
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rincian Biaya SPMB khusus Wustho atau Ulya */}
                {(reg.jenjang === 'Wustho' || reg.jenjang === 'Ulya') && (
                  <div className="bg-slate-50 border-t border-gray-100 p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-slate-800">Rincian Biaya SPMB ({reg.jenjangName || reg.jenjang})</h5>
                        <p className="text-sm text-slate-500 mt-1">Estimasi biaya pendaftaran dan daftar ulang jika dinyatakan lulus.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <table className="w-full text-sm text-slate-600">
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="py-2">Infak Bangunan</td>
                            <td className="py-2 text-right font-medium">Rp. {reg.jenjang === 'Wustho' ? '7.250.000' : '7.500.000'}</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2">Sarpras <span className="text-xs text-gray-400 block sm:inline">(1x sampai selesai)</span></td>
                            <td className="py-2 text-right font-medium">Rp. {reg.jenjang === 'Wustho' ? '3.250.000' : '3.500.000'}</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2">Alat Asrama <span className="text-xs text-gray-400 block sm:inline">(1x sampai selesai)</span></td>
                            <td className="py-2 text-right font-medium">Rp. 1.000.000</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2">Infak Kegiatan & Kesehatan</td>
                            <td className="py-2 text-right font-medium">Rp. {reg.jenjang === 'Wustho' ? '1.250.000' : '1.550.000'}</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2">Uang Seragam</td>
                            <td className="py-2 text-right font-medium">Rp. 1.000.000</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-2">Uang Syahriah/Bulanan <span className="text-xs text-gray-400 block">(SPP, Asrama, Makan 3x, laundry)</span></td>
                            <td className="py-2 text-right font-medium">Rp. {reg.jenjang === 'Wustho' ? '1.400.000' : '1.500.000'}</td>
                          </tr>
                          <tr className="bg-emerald-50">
                            <td className="py-3 px-2 font-bold text-emerald-800">TOTAL BIAYA</td>
                            <td className="py-3 px-2 text-right font-bold text-emerald-800 text-base">
                              Rp. {reg.jenjang === 'Wustho' ? '15.150.000' : '16.050.000'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
