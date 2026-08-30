import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Sistem menemukan versi aplikasi yang tidak sinkron atau terjadi kesalahan jaringan. 
              Silakan muat ulang halaman untuk mendapatkan versi terbaru.
            </p>
            <button
              onClick={() => {
                // Clear all caches just in case
                if ('caches' in window) {
                  caches.keys().then((names) => {
                    names.forEach(name => caches.delete(name));
                  });
                }
                // Reload the page bypassing cache
                window.location.reload();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl w-full transition-colors shadow-sm"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}