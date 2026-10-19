import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'floating' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running as installed standalone app, do not show
  if (isInstalled) {
    return null;
  }

  // If neither installable (via beforeinstallprompt) nor iOS, don't show or show a helpful fallback
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full shadow transition-all duration-300 ${
          variant === 'header'
            ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 hover:shadow-amber-400/30'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
        title="Pasang aplikasi SPMB di HP Anda"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{isIOS ? 'Install di iPhone' : 'Install Aplikasi'}</span>
        <Download className="w-3 h-3 ml-0.5" />
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 text-slate-800">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">Install di iPhone / iPad</h3>
                <p className="text-xs text-emerald-600 font-medium">Buka lewat browser Safari</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <p className="leading-snug">
                  Ketuk tombol <strong className="text-slate-800 inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5 text-blue-500" /> Bagikan (Share)</strong> pada bilah bawah browser Safari.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <p className="leading-snug">
                  Gulir ke bawah dan pilih <strong className="text-slate-800 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-slate-700" /> Tambahkan ke Layar Utama</strong> (<em>Add to Home Screen</em>).
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <p className="leading-snug">
                  Ketuk <strong className="text-slate-800">Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi SPMB Al-Madina akan langsung muncul di layar utama iPhone Anda!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl transition shadow"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
