import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Home, Download, ArrowLeft, Users, CreditCard, Banknote, Filter, RefreshCw, CheckCircle, FileText, Check, Clock, PenTool } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, onSnapshot, setDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard({ onLogout, onGoHome }: { onLogout: () => void, onGoHome: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterJenjang, setFilterJenjang] = useState('Semua');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState<any>(null);
  const [chartPeriod, setChartPeriod] = useState('Keseluruhan'); // 'Harian', 'Pekanan', 'Keseluruhan'
  const [isWusthoUlyaOpen, setIsWusthoUlyaOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'registrationControl'), (docSnap) => {
      if (docSnap.exists()) {
        setIsWusthoUlyaOpen(docSnap.data().wusthoUlyaOpen !== false);
      } else {
        setIsWusthoUlyaOpen(true);
      }
    }, (err) => {
      console.error("Failed to fetch settings", err);
    });
    return () => unsub();
  }, []);

  const togglePortal = async () => {
    try {
      const ref = doc(db, 'settings', 'registrationControl');
      await setDoc(ref, { wusthoUlyaOpen: !isWusthoUlyaOpen }, { merge: true });
    } catch (e) {
      console.error('Error toggling portal', e);
      alert('Gagal merubah status portal');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'public_registrations')); // Fetch all, then sort in memory to avoid missing index errors
      const snapshot = await getDocs(q);
      const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
      setData(fetchedData);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data dari Firebase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyAction = async (action: 'terima' | 'tolak') => {
    if (!verifyingUser) return;
    const { id, jenjang, uid } = verifyingUser;
    const isTerima = action === 'terima';
    // Removed window.confirm since we already use a custom modal for confirmation

    try {
      let newNomorPeserta = '';
      let newStatus = isTerima ? 'Terverifikasi' : 'Ditolak';

      if (isTerima) {
        const currentYear = new Date().getFullYear() + 1;
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const prefix = (jenjang || 'PMB').substring(0,3).toUpperCase();
        newNomorPeserta = `PMB-${currentYear}-${prefix}-${randomDigits}`;
      }

      // Update Firestore for public_registrations
      await updateDoc(doc(db, 'public_registrations', id), {
        statusVerifikasi: newStatus,
        ...(isTerima ? { nomorPeserta: newNomorPeserta } : {})
      });

      // Update for users/uid/registrations if uid exists
      if (uid) {
         try {
            await updateDoc(doc(db, 'users', uid, 'registrations', id), {
               statusVerifikasi: newStatus,
               ...(isTerima ? { nomorPeserta: newNomorPeserta } : {})
            });
         } catch(e) {
            console.warn("Failed to update user private subcollection:", e);
         }
      }

      console.log(isTerima ? 'Pendaftar berhasil diverifikasi!' : 'Pendaftar ditolak.');
      
      // Update state locally immediately for instant feedback
      setData(prev => prev.map(item => item.id === id ? { ...item, statusVerifikasi: newStatus, ...(isTerima ? { nomorPeserta: newNomorPeserta } : {}) } : item));
      setVerifyingUser(null);
    } catch (err: any) {
      console.error("Error during verification:", err);
      console.error('Gagal memproses pendaftar: ' + err.message);
    }
  };

  // Filter Data
  const filteredData = filterJenjang === 'Semua' 
    ? data 
    : data.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(filterJenjang.toLowerCase()));

  const verifiedData = filteredData.filter(d => (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi'));
  const pendingData = filteredData.filter(d => {
    const status = (d.statusVerifikasi || '').toLowerCase();
    return !status.includes('terverifikasi') && !status.includes('ditolak');
  });

  const getCountByJenjang = (j: string) => data.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(j.toLowerCase()) && (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi')).length;

  // Chart Data Calculation
  const getChartData = () => {
    const now = new Date();
    
    // Helper to check if a date is within a timeframe
    const isWithinPeriod = (dateStr: string, period: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      
      if (period === 'Keseluruhan') return true;
      
      if (period === 'Harian') {
        return d.getDate() === now.getDate() && 
               d.getMonth() === now.getMonth() && 
               d.getFullYear() === now.getFullYear();
      }
      
      if (period === 'Pekanan') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return d >= oneWeekAgo && d <= now;
      }
      return true;
    };

    // Filter by period
    const periodData = data.filter(d => isWithinPeriod(d.createdAt, chartPeriod));
    
    // Group by Jenjang
    const getCount = (jKey: string) => periodData.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(jKey)).length;
    
    return [
      { name: 'RA (TK)', total: getCount('ra') || getCount('raudhatul') },
      { name: 'Ula (SD)', total: getCount('ula') },
      { name: 'Wustho (SMP)', total: getCount('wustho') },
      { name: 'Ulya (SMA)', total: getCount('ulya') },
      { name: 'Ma\'had Aly', total: getCount('aly') }
    ];
  };
  
  const chartData = getChartData();


  const handleExportExcel = (jenjangToExport: string) => {
    let dataToExport = data.filter(d => (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi'));
    if (jenjangToExport !== 'Semua') {
      dataToExport = dataToExport.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(jenjangToExport.toLowerCase()));
    }

    // Menyiapkan data dengan urutan kolom sesuai permintaan
    const excelData = dataToExport.map(item => ({
      'Tanggal Daftar': item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '',
      'Nomor Registrasi': item.nomorRegistrasi || '',
      'Nama Lengkap': item.namaLengkap || '',
      'NIK': item.nik || '',
      'Tempat Lahir': item.tempatLahir || '',
      'Tanggal Lahir': item.tanggalLahir || '',
      'Jenis Kelamin': item.jenisKelamin || '',
      'Anak Ke-': item.anakKe || '',
      'Asal Sekolah': item.asalSekolah || '',
      'NISN': item.nisn || '',
      'Tahun Lulus': item.tahunLulus || '',
      'Nama Ayah': item.namaAyah || '',
      'Nama Ibu': item.namaIbu || '',
      'No WhatsApp': item.noWhatsapp || item.noWA || '',
      'Pekerjaan Utama': item.pekerjaanUtama || '',
      'Gaji Perbulan': item.gajiPerbulan || '',
      'Alamat Lengkap': item.alamatLengkap || '',
      'Metode Pembayaran': item.metodePembayaran || '',
      'Link Bukti Bayar': item.buktiPembayaranUrl || ''
    }));

    // Membuat worksheet baru dari data
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Mengatur lebar kolom agar rapi saat dibuka di Excel
    const colWidths = [
      { wch: 20 }, // Tanggal Daftar
      { wch: 18 }, // Nomor Registrasi
      { wch: 25 }, // Nama Lengkap
      { wch: 20 }, // NIK
      { wch: 15 }, // Tempat Lahir
      { wch: 15 }, // Tanggal Lahir
      { wch: 15 }, // Jenis Kelamin
      { wch: 10 }, // Anak Ke-
      { wch: 20 }, // Asal Sekolah
      { wch: 15 }, // NISN
      { wch: 12 }, // Tahun Lulus
      { wch: 20 }, // Nama Ayah
      { wch: 20 }, // Nama Ibu
      { wch: 18 }, // No WhatsApp
      { wch: 20 }, // Pekerjaan Utama
      { wch: 20 }, // Gaji Perbulan
      { wch: 35 }, // Alamat Lengkap
      { wch: 18 }, // Metode Pembayaran
      { wch: 30 }  // Link Bukti Bayar
    ];
    ws['!cols'] = colWidths;

    // Membuat workbook baru dan menambahkan worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pendaftar");

    // Menyimpan dan mengunduh file Excel
    const fileName = jenjangToExport === 'Semua' ? 'Semua_Jenjang' : jenjangToExport.replace('/', '_');
    XLSX.writeFile(wb, `Data_Pendaftar_Terverifikasi_${fileName}_${new Date().getTime()}.xlsx`);
  };
  
  const transferCount = filteredData.filter(d => (d.metodePembayaran || '').toLowerCase() === 'transfer').length;
  const tunaiCount = filteredData.filter(d => (d.metodePembayaran || '').toLowerCase() !== 'transfer').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Admin */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { localStorage.removeItem('isAdminLoggedIn'); onLogout(); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Portal Administrator</h1>
              <p className="text-xs text-slate-400">Pusat Data SPMB Ponpes Al-Madina Prabumulih</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onGoHome}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Website Utama</span>
            </button>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{loading ? 'Memuat...' : 'Segarkan'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Control Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Kontrol Portal Pendaftaran</h2>
            <p className="text-sm text-slate-500">SPMB Ponpes Al-Madina Prabumulih</p>
          </div>
          <button 
            onClick={togglePortal} 
            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${isWusthoUlyaOpen ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
          >
            {isWusthoUlyaOpen ? 'Tutup Pendaftaran Wustho/Ulya/Mahad Aly' : 'Buka Pendaftaran Wustho/Ulya/Mahad Aly'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-6">
          <Filter size={20} className="text-slate-400" />
          <select 
            value={filterJenjang} 
            onChange={(e) => setFilterJenjang(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 font-medium shadow-sm"
          >
            <option value="Semua">Semua Jenjang</option>
            <option value="Ulya">Salafiyah Ulya (SMA)</option>
            <option value="Wustho">Salafiyah Wustho (SMP)</option>
            <option value="Ula">Salafiyah Ula (SD)</option>
            <option value="Aly">Tadribud Du'at/Ma'had Aly (D3/S1)</option>
            <option value="Raudhatul">Raudhatul Athfal (RA/TK)</option>
          </select>
        </div>

        {/* Ringkasan & Statistik Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20"><Users size={80} /></div>
            <p className="text-emerald-100 font-semibold mb-1 relative z-10">Total Terverifikasi</p>
            <h2 className="text-5xl font-extrabold relative z-10">{verifiedData.length}</h2>
            <p className="text-sm text-emerald-100 mt-2 relative z-10">Filter: {filterJenjang}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:col-span-3">
            <h3 className="text-slate-800 font-bold mb-4">Sebaran Jenjang (Terverifikasi)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">RA (TK)</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('RA')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">Ula (SD)</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('Ula')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">Wustho (SMP)</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('Wustho')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">Ulya (SMA)</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('Ulya')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">Ma'had Aly</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('Mahad')}</p>
              </div>
            </div>
          </div>
        </div>

        
        {/* Grafik Pendaftar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-xl font-bold text-slate-800">Grafik Pendaftar Berdasarkan Jenjang</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['Harian', 'Pekanan', 'Keseluruhan'].map(period => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                    chartPeriod === period 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-72 sm:h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} name="Total Pendaftar" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <h3 className="text-xl font-bold text-slate-800 mb-4">Administrasi Metode Pembayaran</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <CreditCard size={32} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold mb-1">Transfer Bank</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-slate-800">{transferCount}</h3>
                <span className="text-sm text-slate-400 font-medium">pendaftar</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Banknote size={32} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold mb-1">Tunai / Langsung</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-slate-800">{tunaiCount}</h3>
                <span className="text-sm text-slate-400 font-medium">pendaftar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mb-8">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-yellow-50/50 rounded-t-[1.5rem]">
            <h3 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
              <Clock size={20} /> Menunggu Verifikasi ({pendingData.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4">No. Reg</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Jenjang</th>
                  <th className="px-6 py-4">Bukti</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada pendaftar yang menunggu verifikasi.
                    </td>
                  </tr>
                ) : (
                  pendingData.map((row, idx) => (
                    <tr key={idx} className="bg-white border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-slate-900">{row.nomorRegistrasi || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{row.namaLengkap || '-'}</td>
                      <td className="px-6 py-4">{row.jenjang || row.jenjangName || '-'}</td>
                      <td className="px-6 py-4">
                        {row.buktiPembayaranBase64 ? (
                          <button 
                            onClick={() => setSelectedImage(row.buktiPembayaranBase64)}
                            className="text-emerald-600 font-semibold hover:underline text-xs flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                          >
                            <FileText size={14} /> Lihat
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setVerifyingUser({ id: row.id, jenjang: row.jenjangName || row.jenjang || 'PMB', uid: row.uid, namaLengkap: row.namaLengkap, noReg: row.nomorRegistrasi })}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                        >
                          <Check size={14} /> Verifikasi
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Data Terverifikasi */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[1.5rem]">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" /> Pendaftar Terverifikasi
            </h3>
            <div className="relative inline-block">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                <Download size={14} /> Download Excel (.xlsx)
              </button>
              
              {showDownloadMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-[60] overflow-hidden">
                  <div className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border-b border-slate-100">
                    Pilih Jenjang:
                  </div>
                  {[
                    { label: 'Semua Jenjang', value: 'Semua' },
                    { label: 'Salafiyah Ulya (SMA)', value: 'Ulya' },
                    { label: 'Salafiyah Wustho (SMP)', value: 'Wustho' },
                    { label: 'Salafiyah Ula (SD)', value: 'Ula' },
                    { label: 'Tadribud Du\'at/Ma\'had Aly (D3/S1)', value: 'Aly' },
                    { label: 'Raudhatul Athfal (RA/TK)', value: 'Raudhatul' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleExportExcel(opt.value);
                        setShowDownloadMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4">No. Peserta</th>
                  <th className="px-6 py-4">No. Reg</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Jenjang</th>
                  <th className="px-6 py-4">Metode Bayar</th>
                </tr>
              </thead>
              <tbody>
                {verifiedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Belum ada data pendaftar terverifikasi untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  verifiedData.map((row, idx) => (
                    <tr key={idx} className="bg-white border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">{row.nomorPeserta || '-'}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{row.nomorRegistrasi || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{row.namaLengkap || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100">
                          {row.jenjangName || row.jenjang || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5">
                          {(row.metodePembayaran || '').toLowerCase() === 'transfer' ? <CreditCard size={14} className="text-blue-500" /> : <Banknote size={14} className="text-emerald-500" />}
                          {row.metodePembayaran || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    
      {verifyingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Verifikasi Pendaftar</h3>
            <p className="text-sm text-gray-600 mb-6">
              Anda akan memverifikasi pendaftar <strong>{verifyingUser.namaLengkap}</strong> ({verifyingUser.noReg}). Apakah pendaftar ini diterima atau ditolak?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => handleVerifyAction('terima')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
              >
                Terima
              </button>
              <button 
                onClick={() => handleVerifyAction('tolak')}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
              >
                Tolak
              </button>
            </div>
            <button 
              onClick={() => setVerifyingUser(null)}
              className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* File/Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            {selectedImage.startsWith('data:application/pdf') ? (
              <div className="w-full h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Pratinjau Dokumen PDF</span>
                  <a href={selectedImage} download="Bukti_Pembayaran.pdf" className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Unduh File Asli
                  </a>
                </div>
                <iframe 
                  src={selectedImage} 
                  className="flex-1 w-full bg-slate-50"
                  title="Pratinjau PDF"
                />
              </div>
            ) : (
              <img 
                src={selectedImage} 
                alt="Bukti Pembayaran" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
