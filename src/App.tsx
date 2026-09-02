import React, { useState, useEffect } from 'react';
import RegistrationInfo from './RegistrationInfo';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { 
  FileText, 
  Search, 
  Upload, 
  CheckCircle, 
  BookOpen, 
  GraduationCap, 
  Library, 
  School,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Shield
} from 'lucide-react';

export default function App() {
  const [selectedJenjang, setSelectedJenjang] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'login' | 'register' | 'dashboard' | 'admin_dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isAdminRoute = window.location.pathname === '/admin' || urlParams.get('admin') === 'true' || window.location.hash === '#admin';
      if (isAdminRoute) {
        return localStorage.getItem('isAdminLoggedIn') === 'true' ? 'admin_dashboard' : 'login';
      }
    }
    return 'home';
  });
  const [showClosedNotif, setShowClosedNotif] = useState(false);
  const [isWusthoUlyaOpen, setIsWusthoUlyaOpen] = useState(true);
  const { currentUser, logout } = useAuth();

  const [printRegNumber, setPrintRegNumber] = useState<string | null>(null);

  const [globalRegNum, setGlobalRegNum] = useState('');
  const [isCheckingGlobal, setIsCheckingGlobal] = useState(false);
  const [globalCheckMessage, setGlobalCheckMessage] = useState('');

  const handleGlobalCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalRegNum) return;
    setIsCheckingGlobal(true);
    setGlobalCheckMessage('');

    try {

      
      const q = query(collection(db, 'public_registrations'), where('nomorRegistrasi', '==', globalRegNum));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
         const data = querySnapshot.docs[0].data();
         let jenjangCode = data.jenjang || '';
         if (!jenjangCode) {
            const name = (data.jenjangName || '').toLowerCase();
            if (name.includes('wustho')) jenjangCode = 'Wustho';
            else if (name.includes('ulya')) jenjangCode = 'Ulya';
            else if (name.includes('ula')) jenjangCode = 'Ula';
            else if (name.includes('ra') || name.includes('raudhatul')) jenjangCode = 'RA';
            else if (name.includes('aly') || name.includes('mahad')) jenjangCode = 'Mahad_Aly';
            else jenjangCode = 'Wustho';
         }
         navigateTo('home', jenjangCode, data.nomorRegistrasi);
         setGlobalRegNum(''); // reset on success
      } else {
         setGlobalCheckMessage('Nomor Registrasi tidak ditemukan.');
      }
    } catch (err) {
       console.error(err);
       setGlobalCheckMessage('Terjadi kesalahan koneksi.');
    } finally {
       setIsCheckingGlobal(false);
    }
  };

  

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

  useEffect(() => {
    // Cek rute rahasia untuk Admin
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminRoute = window.location.pathname === '/admin' || urlParams.get('admin') === 'true' || window.location.hash === '#admin';
    
    if (isAdminRoute) {
      if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        setView('admin_dashboard');
        window.history.replaceState({ view: 'admin_dashboard', selectedJenjang: null, printRegNumber: null }, '', '/');
      } else {
        setView('login');
        window.history.replaceState({ view: 'login', selectedJenjang: null, printRegNumber: null }, '', '/');
      }
    } else {
      // Sync initial state to history on mount
      window.history.replaceState({ view: 'home', selectedJenjang: null, printRegNumber: null }, '', '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setView(event.state.view);
        setSelectedJenjang(event.state.selectedJenjang);
        setPrintRegNumber(event.state.printRegNumber || null);
      } else {
        setView('home');
        setSelectedJenjang(null);
        setPrintRegNumber(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView: typeof view, jenjang: string | null = null, printNum: string | null = null) => {
    window.history.pushState({ view: newView, selectedJenjang: jenjang, printRegNumber: printNum }, '', '');
    setView(newView);
    setSelectedJenjang(jenjang);
    setPrintRegNumber(printNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectJenjang = (jenjang: string) => {
    if (jenjang === 'RA' || jenjang === 'Ula') {
      setShowClosedNotif(true);
      return;
    }
    if ((jenjang === 'Wustho' || jenjang === 'Ulya' || jenjang === 'Mahad_Aly') && !isWusthoUlyaOpen) {
      setShowClosedNotif(true);
      return;
    }
    navigateTo('home', jenjang);
  };

  if (view === 'login') {
    return <Login onSwitchToRegister={() => navigateTo('register', selectedJenjang)} onBack={() => navigateTo('home')} onAdminLogin={() => navigateTo('admin_dashboard')} />;
  }
  
  if (view === 'admin_dashboard') {
    return <AdminDashboard onLogout={() => navigateTo('home')} onGoHome={() => navigateTo('home')} />;
  }

  // Jika jenjang sudah terpilih
  if (selectedJenjang) {
    return (
      <>
        <RegistrationInfo jenjang={selectedJenjang} onBack={() => navigateTo('home')} printRegNumber={printRegNumber} />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logp.png" 
              alt="Logo Al-Madina" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain cursor-pointer"
              title="Portal SPMB"
              onDoubleClick={() => {
                if (localStorage.getItem('isAdminLoggedIn') === 'true') {
                  navigateTo('admin_dashboard');
                } else {
                  navigateTo('login');
                }
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-emerald-800">SPMB Online</h1>
              <div className="text-xs text-emerald-600 font-medium mt-0.5">
                Pondok Pesantren Al-Madina Al-Islami Prabumulih
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => navigateTo('admin_dashboard')}
                  className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 sm:px-4 rounded-xl transition-colors"
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Dasbor Panitia</span>
                  <span className="sm:hidden">Dasbor</span>
                </button>
                <button 
                  onClick={logout}
                  className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 sm:px-4 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section 
        className="relative text-white py-24 md:py-32 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/pondok.jpeg")' }}
      >
        <div className="absolute inset-0 bg-emerald-900/85"></div>
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white drop-shadow-md">
            Sistem Penerimaan Murid Baru (SPMB) <br className="hidden lg:block" />
            <span className="text-emerald-300 block mt-3 text-3xl md:text-4xl lg:text-5xl">Pondok Pesantren Al-Madina Prabumulih</span>
          </h2>
          <div className="inline-block bg-emerald-800/80 text-emerald-100 px-6 py-2 rounded-full text-sm md:text-lg font-semibold tracking-widest mb-8 border border-emerald-500/30 backdrop-blur-sm shadow-lg">
            TAHUN AJARAN 2027 / 2028
          </div>
          <p className="text-lg md:text-xl text-emerald-50/90 leading-relaxed max-w-4xl mx-auto font-medium drop-shadow-sm mt-2">
            Situs ini dipersiapkan sebagai pusat informasi dan pengolahan seleksi data murid peserta SPMB Pondok Pesantren Al-Madina Prabumulih secara online real time process untuk pelaksanaan SPMB Online.
          </p>
        </div>
      </section>

      {/* CEK PENDAFTARAN GLOBAL WIDGET */}
      <section className="relative z-20 -mt-10 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Search className="text-emerald-600" size={24} />
                Cek Status Pendaftaran
              </h3>
              <p className="text-sm text-gray-500">
                Sudah mendaftar? Masukkan nomor registrasi Anda untuk mengecek status dan mengunduh kartu ujian.
              </p>
            </div>
            <form onSubmit={handleGlobalCheck} className="flex-1 w-full flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                required
                value={globalRegNum}
                onChange={(e) => setGlobalRegNum(e.target.value.toUpperCase())}
                placeholder="REG-XX-XXXXX" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase text-center sm:text-left"
              />
              <button 
                type="submit"
                disabled={isCheckingGlobal}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap shadow-md"
              >
                {isCheckingGlobal ? 'Mencari...' : 'Cari Data'}
              </button>
            </form>
          </div>
          {globalCheckMessage && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100">
              {globalCheckMessage}
            </div>
          )}
        </div>
      </section>

      {/* ALUR PENDAFTARAN */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Alur Pendaftaran</h3>
          <div className="w-16 h-1 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-emerald-100 -z-10 transform -translate-y-1/2"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative z-10">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm ring-4 ring-white">
              <FileText size={28} />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">1. Pengisian Form</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Mengisi formulir pendaftaran secara online sesuai jenjang.</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative z-10">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm ring-4 ring-white">
              <Search size={28} />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">2. Cek Data</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Memeriksa kembali kebenaran data yang telah diinputkan.</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative z-10">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm ring-4 ring-white">
              <Upload size={28} />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">3. Upload Berkas</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Mengunggah dokumen atau bukti pembayaran yang diminta.</p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative z-10">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm ring-4 ring-white">
              <CheckCircle size={28} />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">4. Cek Status</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Memantau status validasi pendaftaran dan kelulusan.</p>
          </div>
        </div>
      </section>

      {/* PILIHAN JENJANG */}
      <section className="bg-gray-100 py-16 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Pilih Jenjang Pendaftaran</h3>
            <p className="text-gray-500 mt-2">Silakan pilih jenjang pendidikan tujuan untuk memulai pendaftaran.</p>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            
            {/* Jenjang 1: RA */}
            <div className="group flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-300">
                <img src="/TK.jpg" alt="Logo RA" className="w-full h-full object-contain rounded-full shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <div className="hidden w-full h-full bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <Library size={40} strokeWidth={1.5} />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors mb-4">Raudhatul Athfal (TK)</h4>
              <button onClick={() => handleSelectJenjang('RA')} className="mt-auto px-8 py-2.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full font-semibold transition-colors">
                Daftar
              </button>
            </div>

            {/* Jenjang 2: Ula */}
            <div className="group flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-300">
                <img src="/ULA.jpg" alt="Logo Ula" className="w-full h-full object-contain rounded-full shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <div className="hidden w-full h-full bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <BookOpen size={40} strokeWidth={1.5} />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors mb-4">Salafiyah Ula (SD)</h4>
              <button onClick={() => handleSelectJenjang('Ula')} className="mt-auto px-8 py-2.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full font-semibold transition-colors">
                Daftar
              </button>
            </div>

            {/* Jenjang 3: Wustho */}
            <div className="group flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-300">
                <img src="/smp.jpg" alt="Logo Wustho" className="w-full h-full object-contain rounded-full shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <div className="hidden w-full h-full bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <School size={40} strokeWidth={1.5} />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors mb-4">Salafiyah Wustho (SMP)</h4>
              <button onClick={() => handleSelectJenjang('Wustho')} className="mt-auto px-8 py-2.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full font-semibold transition-colors">
                Daftar
              </button>
            </div>

            {/* Jenjang 4: Ulya */}
            <div className="lg:col-start-2 group flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-300">
                <img src="/sma.jpg" alt="Logo Ulya" className="w-full h-full object-contain rounded-full shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <div className="hidden w-full h-full bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <School size={40} strokeWidth={1.5} />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors mb-4">Salafiyah Ulya (SMA)</h4>
              <button onClick={() => handleSelectJenjang('Ulya')} className="mt-auto px-8 py-2.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full font-semibold transition-colors">
                Daftar
              </button>
            </div>

            {/* Jenjang 5: Ma'had Aly */}
            <div className="group flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-300">
                <img src="/logp.png" alt="Logo Ma'had Aly" className="w-full h-full object-contain rounded-full shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <div className="hidden w-full h-full bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <GraduationCap size={40} strokeWidth={1.5} />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors mb-4">Ma'had Aly/Tadribud Du'at<br/>(D3/S1)</h4>
              <button onClick={() => handleSelectJenjang('Mahad_Aly')} className="mt-auto px-8 py-2.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full font-semibold transition-colors">
                Daftar
              </button>
            </div>

          </div>
        </div>
      </section>

      <footer className="bg-white py-8 border-t border-gray-200 text-center relative">
        <p className="text-sm text-gray-500">
          SPMB Online &copy; 2026 Al-Madina Apps
        </p>
      </footer>
      
      {/* Registration Closed Modal */}
      {showClosedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Informasi</h3>
            {!isWusthoUlyaOpen ? (
              <div className="text-sm text-gray-600 mb-6 leading-relaxed text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="font-bold text-center mb-2 text-emerald-600">📣 SEGERA DIBUKA!</p>
                <p className="text-center font-bold mb-4 text-gray-800">SPMB (Sistem Penerimaan Murid Baru)</p>
                <p className="mb-2">✨ Gelombang Pertama:<br/>📅 09 September 2026</p>
                <p>📌 Yuk, persiapkan segera dan jangan sampai ketinggalan pendaftaran gelombang pertama!</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Mohon Maaf, Pendaftaran untuk jenjang ini belum dibuka.
              </p>
            )}
            <button 
              onClick={() => setShowClosedNotif(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
