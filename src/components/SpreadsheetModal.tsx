import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Link2,
  Send,
  RefreshCw
} from 'lucide-react';
import { GasConfig } from '../types';
import { saveGasConfig, testGasConnection, sendTestRowToSpreadsheet } from '../services/apiService';
import { MODERN_GAS_CODE } from '../data/defaultData';

interface SpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GasConfig;
  onConfigUpdated: (newConfig: GasConfig) => void;
}

export const SpreadsheetModal: React.FC<SpreadsheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated
}) => {
  const [webAppUrl, setWebAppUrl] = useState<string>(config.webAppUrl || '');
  const [spreadsheetId, setSpreadsheetId] = useState<string>(config.spreadsheetId || '');
  const [folderId, setFolderId] = useState<string>(config.folderId || '');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [isSendingTestRow, setIsSendingTestRow] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(MODERN_GAS_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSave = () => {
    const updated: GasConfig = {
      webAppUrl: webAppUrl.trim(),
      spreadsheetId: spreadsheetId.trim(),
      folderId: folderId.trim(),
      autoSync: true,
      lastSync: new Date().toLocaleString('id-ID')
    };
    saveGasConfig(updated);
    onConfigUpdated(updated);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim() || !webAppUrl.startsWith('http')) {
      setTestStatus('error');
      setTestMessage('Masukkan URL Web App Google Apps Script yang valid terlebih dahulu (berawalan https://script.google.com/macros/s/...).');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Menghubungi endpoint Google Apps Script...');

    const res = await testGasConnection(webAppUrl.trim());
    if (res.success) {
      setTestStatus('success');
      setTestMessage(res.message);
    } else {
      setTestStatus('error');
      setTestMessage(res.message);
    }
  };

  const handleSendTestRow = async () => {
    if (!webAppUrl.trim() || !webAppUrl.startsWith('http')) {
      alert("Masukkan URL Web App Google Apps Script terlebih dahulu!");
      return;
    }

    setIsSendingTestRow(true);
    const res = await sendTestRowToSpreadsheet(webAppUrl.trim());
    setIsSendingTestRow(false);
    
    if (res.success) {
      setTestStatus('success');
      setTestMessage(res.message);
    } else {
      setTestStatus('error');
      setTestMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Koneksi Google Spreadsheet & Apps Script
              </h3>
              <p className="text-xs text-gray-500">
                Penyebab utama data belum masuk: URL Web App belum dimasukkan atau izin akses belum diatur ke "Anyone (Siapa saja)".
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>Mengapa Data Belum Masuk ke Spreadsheet?</span>
          </div>
          <p className="leading-relaxed">
            Aplikasi web membutuhkan <strong>URL Web App Google Apps Script</strong> milik Anda untuk mengirim data formulir ke Google Sheet.
            Jika Anda belum memasukkan URL di bawah ini, seluruh pendaftaran disimpan di database lokal browser.
          </p>
        </div>

        {/* Input Configuration Form */}
        <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-emerald-700" />
              URL Web App Deployment Google Apps Script (Wajib Diisi)
            </label>
            <input
              type="url"
              id="input-gas-url"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
            />
            <p className="text-[11px] text-gray-600 mt-1">
              Didapatkan dari menu <strong>Deploy &gt; New Deployment &gt; Web App</strong> pada script spreadsheet Anda.
            </p>
          </div>

          {/* Test Status Banner */}
          {testStatus !== 'idle' && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              testStatus === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
              testStatus === 'error' ? 'bg-red-100 text-red-900 border border-red-300' :
              'bg-blue-100 text-blue-900'
            }`}>
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />}
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 text-blue-700 animate-spin flex-shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{testMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              id="btn-test-gas-connection"
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>1. Uji Koneksi</span>
            </button>

            <button
              type="button"
              onClick={handleSendTestRow}
              disabled={isSendingTestRow}
              id="btn-send-test-row"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>2. Kirim 1 Baris Uji Coba ke Sheet</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              id="btn-save-gas-config"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all ml-auto"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>

        {/* 5-Step Deployment Guide */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-700" />
              Kode Backend Google Apps Script (GAS) v2.5 Siap Pakai:
            </h4>

            <button
              type="button"
              onClick={handleCopyScript}
              id="btn-copy-gas-script"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              {copiedScript ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Script Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Seluruh Kode GAS</span>
                </>
              )}
            </button>
          </div>

          {/* Quick 5-Step Instructions */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs space-y-2 text-gray-700">
            <p className="font-bold text-gray-900 text-xs">Cara Pasang ke Google Spreadsheet Anda (Hanya 2 Menit):</p>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
              <li>Buka file <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">Google Sheets</a> baru Anda.</li>
              <li>Klik menu <strong>Extensions (Ekstensi) &gt; Apps Script</strong>.</li>
              <li>Hapus semua teks yang ada di editor Apps Script, lalu klik tombol <strong>"Salin Seluruh Kode GAS"</strong> di atas dan tempelkan (Paste).</li>
              <li>Klik tombol <strong>Deploy (Terapkan) &gt; New deployment (Deployment baru)</strong> di kanan atas.</li>
              <li>Pilih icon roda gigi (Select type) &gt; <strong>Web App (Aplikasi Web)</strong>, lalu pastikan:
                <ul className="list-disc list-inside pl-4 text-emerald-950 font-bold bg-amber-100/60 p-2 rounded-lg my-1">
                  <li>Execute as (Jalankan sebagai): <span className="text-emerald-800">Me (Email Anda)</span></li>
                  <li>Who has access (Siapa yang memiliki akses): <span className="text-red-700 underline">Anyone (Siapa saja)</span> <em>&larr; Wajib dipilih agar web bisa mengirim data!</em></li>
                </ul>
              </li>
              <li>Klik <strong>Deploy</strong>, izinkan akses akun (Review permissions &gt; Advanced &gt; Go to script), lalu salin <strong>Web App URL</strong> yang berakhiran <code>/exec</code> dan tempelkan di form di atas!</li>
            </ol>
          </div>

          {/* Code Viewer Box */}
          <div className="relative rounded-2xl bg-gray-900 text-gray-100 p-4 font-mono text-[11px] max-h-52 overflow-y-auto border border-gray-800">
            <pre>{MODERN_GAS_CODE}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
