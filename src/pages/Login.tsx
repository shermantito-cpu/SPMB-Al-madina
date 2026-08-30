import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, ArrowLeft, Shield } from 'lucide-react';

export default function Login({ onSwitchToRegister, onBack, onAdminLogin }: { onSwitchToRegister: () => void, onBack: () => void, onAdminLogin?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Admin Hardcoded Bypass (As requested)
    if (email === 'Admin$PMB' && password === 'SPMB27') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      if (onAdminLogin) onAdminLogin();
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Email atau password salah, atau akun tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError('Gagal login dengan Google.');
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
            <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Login Administrator</h2>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-slate-200"></div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Portal SPMB</span>
              <div className="h-px w-10 bg-slate-200"></div>
            </div>
          </div>
          
          {error && <div className="mb-6 bg-red-50/80 border border-red-100 text-red-700 p-4 rounded-xl text-sm flex items-center shadow-sm">
            <span className="block sm:inline">{error}</span>
          </div>}
          
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username Admin</label>
              <input required type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 bg-white/50 backdrop-blur-sm transition-all sm:text-sm font-medium" placeholder="Masukkan username" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 bg-white/50 backdrop-blur-sm transition-all sm:text-sm font-medium" placeholder="••••••••" />
            </div>
            <div className="pt-2">
              <button disabled={loading} type="submit" className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 disabled:opacity-70 transition-all hover:shadow-lg active:scale-[0.98]">
                {loading ? 'Memproses...' : 'Masuk ke Dasbor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
