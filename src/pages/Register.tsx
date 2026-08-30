import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function Register({ onSwitchToLogin, onBack }: { onSwitchToLogin: () => void, onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Buat dokumen pengguna di firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError('Gagal membuat akun. Mungkin email sudah digunakan.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Upsert user doc
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
    } catch (err: any) {
      setError('Gagal mendaftar dengan Google.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button onClick={onBack} className="text-emerald-700 hover:text-emerald-900 flex items-center font-semibold text-sm mb-6 mx-auto sm:mx-0 transition-colors">
          <ArrowLeft size={16} className="mr-1.5" /> Kembali ke Beranda
        </button>
        
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-white/50">
          <div className="flex flex-col items-center mb-8">
            <img src="/logp.png" alt="Logo Al-Madina" className="w-20 h-20 object-contain drop-shadow-md mb-4" onError={(e) => e.currentTarget.style.display = 'none'} />
            <h2 className="text-center text-3xl font-extrabold text-slate-800 tracking-tight">Daftar Akun Baru</h2>
            <p className="mt-2 text-center text-sm text-slate-500 font-medium">Buat akun untuk memulai pendaftaran SPMB</p>
          </div>
          
          {error && <div className="mb-6 bg-red-50/80 border border-red-100 text-red-700 p-4 rounded-xl text-sm flex items-center shadow-sm">
            <span className="block sm:inline">{error}</span>
          </div>}
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white/50 backdrop-blur-sm transition-all sm:text-sm" placeholder="nama@email.com" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white/50 backdrop-blur-sm transition-all sm:text-sm" placeholder="Minimal 6 karakter" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password</label>
              <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white/50 backdrop-blur-sm transition-all sm:text-sm" placeholder="Ulangi password" />
            </div>

            <div className="pt-2">
              <button disabled={loading} type="submit" className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all hover:shadow-lg active:scale-[0.98]">
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500 font-medium">Atau daftar dengan</span>
              </div>
            </div>

            <div className="mt-6">
              <button onClick={handleGoogleLogin} className="w-full flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 active:scale-[0.98]">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Akun Google
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-600 font-medium">Sudah punya akun? </span>
            <button onClick={onSwitchToLogin} className="text-emerald-600 hover:text-emerald-700 font-bold ml-1 hover:underline decoration-2 underline-offset-2">
              Masuk di sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
