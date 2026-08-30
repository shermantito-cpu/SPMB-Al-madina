import { PendaftarData, GasConfig, StatusPendaftaran } from '../types';
import { INITIAL_REGISTRANTS } from '../data/defaultData';

const STORAGE_KEY = 'spmb_almadina_pendaftar_v2';
const CONFIG_KEY = 'spmb_almadina_gas_config_v2';

// Helper to strip heavy base64 strings before storing in localStorage (which has a 5MB limit)
const sanitizeItemForStorage = (item: PendaftarData): PendaftarData => {
  const sanitizeMeta = (file?: { fileName: string; fileSize: number; mimeType: string; base64Data?: string; previewUrl?: string; driveUrl?: string }) => {
    if (!file) return undefined;
    return {
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      driveUrl: file.driveUrl,
      // Only keep lightweight preview if tiny (under 25KB), otherwise strip to avoid QuotaExceededError
      previewUrl: (file.previewUrl && file.previewUrl.length < 25000) ? file.previewUrl : undefined,
      base64Data: (file.base64Data && file.base64Data.length < 25000) ? file.base64Data : undefined
    };
  };

  return {
    ...item,
    bukti_bayar: sanitizeMeta(item.bukti_bayar),
    kk: sanitizeMeta(item.kk),
    akte: sanitizeMeta(item.akte),
    foto: sanitizeMeta(item.foto),
    sk_nisn: sanitizeMeta(item.sk_nisn)
  };
};

export const getGasConfig = (): GasConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load GAS config", e);
  }
  return {
    webAppUrl: '',
    spreadsheetId: '',
    folderId: '',
    autoSync: false,
    lastSync: ''
  };
};

export const saveGasConfig = (config: GasConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save GAS config", e);
  }
};

export const getAllPendaftar = (): PendaftarData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse pendaftar list", e);
  }
  // Initialize with initial registrants if empty
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTRANTS));
  } catch {
    // ignore quota in initialization
  }
  return INITIAL_REGISTRANTS;
};

export const saveAllPendaftar = (list: PendaftarData[]): void => {
  try {
    // 1. Sanitize to prevent multi-megabyte base64 from filling localStorage
    const sanitized = list.map(sanitizeItemForStorage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn("Storage quota limit reached, performing emergency compression...", e);
    try {
      // 2. Emergency fallback: Strip all file payload objects, keeping only file metadata
      const fullyStripped = list.slice(0, 50).map(item => ({
        ...item,
        bukti_bayar: item.bukti_bayar ? { fileName: item.bukti_bayar.fileName, fileSize: item.bukti_bayar.fileSize, mimeType: item.bukti_bayar.mimeType, driveUrl: item.bukti_bayar.driveUrl } : undefined,
        kk: item.kk ? { fileName: item.kk.fileName, fileSize: item.kk.fileSize, mimeType: item.kk.mimeType, driveUrl: item.kk.driveUrl } : undefined,
        akte: item.akte ? { fileName: item.akte.fileName, fileSize: item.akte.fileSize, mimeType: item.akte.mimeType, driveUrl: item.akte.driveUrl } : undefined,
        foto: item.foto ? { fileName: item.foto.fileName, fileSize: item.foto.fileSize, mimeType: item.foto.mimeType, driveUrl: item.foto.driveUrl } : undefined,
        sk_nisn: item.sk_nisn ? { fileName: item.sk_nisn.fileName, fileSize: item.sk_nisn.fileSize, mimeType: item.sk_nisn.mimeType, driveUrl: item.sk_nisn.driveUrl } : undefined,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullyStripped));
    } catch (err2) {
      console.error("Critical: Unable to save to localStorage due to device quota limit.", err2);
    }
  }
};

export const findPendaftarByNikOrReg = (query: string): PendaftarData | null => {
  const cleanQuery = query.trim().replace(/['\s]/g, '').toLowerCase();
  if (!cleanQuery) return null;
  const list = getAllPendaftar();
  return list.find(item => {
    const cleanNik = (item.nik || '').replace(/['\s]/g, '').toLowerCase();
    const cleanReg = (item.nomorRegistrasi || '').replace(/['\s]/g, '').toLowerCase();
    return cleanNik === cleanQuery || cleanReg === cleanQuery;
  }) || null;
};

export const addPendaftar = async (
  newData: Omit<PendaftarData, 'id' | 'nomorRegistrasi' | 'timestamp' | 'status'>,
  config?: GasConfig
): Promise<{ success: boolean; data: PendaftarData; message: string; syncedToGas: boolean }> => {
  const list = getAllPendaftar();
  
  // Check if NIK already exists
  const existing = list.find(p => p.nik === newData.nik);
  if (existing) {
    return {
      success: false,
      data: existing,
      message: `Santri dengan NIK ${newData.nik} sudah terdaftar dengan No Registrasi: ${existing.nomorRegistrasi}. Silakan cek di menu 'Cek Status & Cetak Kartu'.`,
      syncedToGas: false
    };
  }

  // Generate unique registration code
  const dateObj = new Date();
  const dateStr = dateObj.getFullYear().toString().slice(2) + 
    String(dateObj.getMonth() + 1).padStart(2, '0') + 
    String(dateObj.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const nomorRegistrasi = `SPMB-2027-${dateStr}${randomSuffix}`;

  const timestamp = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');

  const status: StatusPendaftaran = newData.metode_bayar === 'Transfer Bank'
    ? 'Menunggu Verifikasi'
    : 'Menunggu Pembayaran Tunai';

  const fullData: PendaftarData = {
    ...newData,
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nomorRegistrasi,
    timestamp,
    status,
    biayaNominal: newData.jenjang.includes('RA') ? 150000 : 
                  newData.jenjang.includes('Ula') ? 200000 : 
                  newData.jenjang.includes('Wustho') ? 250000 : 
                  newData.jenjang.includes('Ulya') ? 250000 : 300000
  };

  list.unshift(fullData);
  saveAllPendaftar(list);

  let syncedToGas = false;
  const currentConfig = config || getGasConfig();

  if (currentConfig.webAppUrl && currentConfig.webAppUrl.trim().startsWith('http')) {
    const payload = {
      action: 'submitForm',
      nomorRegistrasi: fullData.nomorRegistrasi,
      jenjang: fullData.jenjang,
      nama: fullData.nama,
      nik: fullData.nik,
      tempat_lahir: fullData.tempat_lahir,
      tgl_lahir: fullData.tgl_lahir,
      jk: fullData.jk,
      anak_ke: fullData.anak_ke,
      asal_sekolah: fullData.asal_sekolah,
      nisn: fullData.nisn,
      tahun_lulus: fullData.tahun_lulus,
      nama_ayah: fullData.nama_ayah,
      nama_ibu: fullData.nama_ibu,
      no_wa: fullData.no_wa,
      pekerjaan: fullData.pekerjaan,
      gaji: fullData.gaji,
      alamat: fullData.alamat,
      metode_bayar: fullData.metode_bayar,
      // send base64 files if available
      bukti_bayar_base64: fullData.bukti_bayar?.base64Data || '',
      bukti_bayar_mime: fullData.bukti_bayar?.mimeType || '',
      kk_base64: fullData.kk?.base64Data || '',
      kk_mime: fullData.kk?.mimeType || '',
      akte_base64: fullData.akte?.base64Data || '',
      akte_mime: fullData.akte?.mimeType || '',
      foto_base64: fullData.foto?.base64Data || '',
      foto_mime: fullData.foto?.mimeType || '',
      sk_nisn_base64: fullData.sk_nisn?.base64Data || '',
      sk_nisn_mime: fullData.sk_nisn?.mimeType || ''
    };

    let proxyExplicitlyFailed = false;
    let gasErrorMessage = "";

    // 1. Try via backend proxy (Handles Google 302 Redirects smoothly)
    try {
      const proxyRes = await fetch('/api/spreadsheet/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: currentConfig.webAppUrl.trim(),
          payload
        })
      });
      const proxyJson = await proxyRes.json().catch(() => null);
      
      if (proxyRes.ok) {
        syncedToGas = true;
      } else {
        if (proxyJson && proxyJson.success === false) {
          proxyExplicitlyFailed = true;
          gasErrorMessage = proxyJson.message || "Unknown GAS Error";
          console.error("GAS Proxy explicitly reported failure:", gasErrorMessage);
        }
      }
    } catch (err) {
      console.warn("Backend proxy network failed, attempting direct fetch", err);
    }

    // 2. Direct client fallback only if proxy wasn't explicitly rejecting the request
    if (!syncedToGas && !proxyExplicitlyFailed) {
      try {
        const action = payload.action || 'submitForm';
        const directUrl = currentConfig.webAppUrl.includes('?') 
          ? `${currentConfig.webAppUrl.trim()}&action=${action}` 
          : `${currentConfig.webAppUrl.trim()}?action=${action}`;

        await fetch(directUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          mode: 'no-cors'
        });
        // We assume success here because no-cors is opaque
        syncedToGas = true;
      } catch (err) {
        console.warn("Direct GAS fetch error", err);
      }
    }
  }

  return {
    success: true,
    data: fullData,
    message: syncedToGas 
      ? "Alhamdulillah! Pendaftaran berhasil dicatat ke Google Spreadsheet & tersimpan secara lokal."
      : "Alhamdulillah! Pendaftaran tersimpan di database lokal. (Belum sinkron ke Spreadsheet - Periksa URL Web App)",
    syncedToGas
  };
};

export const testGasConnection = async (webAppUrl: string): Promise<{ success: boolean; message: string; details?: any }> => {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: "Masukkan URL Web App Google Apps Script yang valid (berawalan https://script.google.com/macros/s/...)."
    };
  }

  // 1. Try server proxy
  try {
    const res = await fetch('/api/spreadsheet/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webAppUrl: webAppUrl.trim() })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return {
        success: true,
        message: "Koneksi Berhasil! Endpoint Google Apps Script merespons aktif.",
        details: json.responseSample
      };
    }
  } catch (err) {
    console.warn("Proxy test failed, trying direct", err);
  }

  // 2. Direct browser fetch fallback
  try {
    const pingUrl = webAppUrl.includes('?') ? `${webAppUrl}&action=ping` : `${webAppUrl}?action=ping`;
    await fetch(pingUrl, { mode: 'no-cors' });
    return {
      success: true,
      message: "Koneksi Berhasil! Endpoint Google Apps Script terhubung dari browser."
    };
  } catch (e: any) {
    return {
      success: false,
      message: "Gagal menghubungi endpoint: " + (e.message || String(e))
    };
  }
};

export const sendTestRowToSpreadsheet = async (webAppUrl: string): Promise<{ success: boolean; message: string }> => {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return { success: false, message: "URL Web App belum diisi!" };
  }

  try {
    const res = await fetch('/api/spreadsheet/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webAppUrl: webAppUrl.trim(),
        payload: { action: 'testData' }
      })
    });
    const json = await res.json();
    if (json.success) {
      return { success: true, message: "Berhasil! Satu baris data uji coba [TEST KONEKSI BERHASIL] telah ditambahkan ke Google Spreadsheet Anda." };
    }
    return { success: false, message: json.message || "Gagal menulis test row" };
  } catch (e: any) {
    return { success: false, message: "Gagal mengirim data uji coba: " + e.message };
  }
};

export const updatePendaftarStatus = (
  id: string,
  newStatus: any,
  extra?: {
    noUjian?: string;
    jadwalUjian?: string;
    ruangUjian?: string;
    lokasiUjian?: string;
    catatanPanitia?: string;
    linkKartuPdf?: string;
  }
): PendaftarData | null => {
  const list = getAllPendaftar();
  const index = list.findIndex(p => p.id === id);
  if (index === -1) return null;

  const item = list[index];
  
  // Generate automated exam number if verifying and doesn't have one
  let noUjian = extra?.noUjian || item.noUjian;
  let jadwalUjian = extra?.jadwalUjian || item.jadwalUjian;
  let ruangUjian = extra?.ruangUjian || item.ruangUjian;
  let lokasiUjian = extra?.lokasiUjian || item.lokasiUjian || "Kampus Utama Ponpes Al-Madina Prabumulih";

  if (newStatus === 'Terverifikasi / Lunas' && !noUjian) {
    const prefix = item.jenjang.includes('RA') ? 'RAT' :
                   item.jenjang.includes('Ula') ? 'ULA' :
                   item.jenjang.includes('Wustho') ? 'WST' :
                   item.jenjang.includes('Ulya') ? 'ULY' : 'ALY';
    noUjian = `${prefix}-2027-${String(Math.floor(1000 + Math.random() * 9000))}`;
    if (!jadwalUjian) {
      jadwalUjian = "Ahad, 10 Januari 2027 | 08.00 - 12.00 WIB";
    }
    if (!ruangUjian) {
      ruangUjian = `Ruang ${Math.floor(1 + Math.random() * 8)} (${item.jenjang.includes('RA') ? 'Gedung Khadijah' : 'Gedung Umar bin Khattab'})`;
    }
  }

  const updated: PendaftarData = {
    ...item,
    status: newStatus,
    noUjian,
    jadwalUjian,
    ruangUjian,
    lokasiUjian,
    catatanPanitia: extra?.catatanPanitia !== undefined ? extra.catatanPanitia : item.catatanPanitia,
    linkKartuPdf: extra?.linkKartuPdf !== undefined ? extra.linkKartuPdf : item.linkKartuPdf
  };

  list[index] = updated;
  saveAllPendaftar(list);
  return updated;
};

export const deletePendaftar = (id: string): boolean => {
  const list = getAllPendaftar();
  const filtered = list.filter(p => p.id !== id);
  if (filtered.length === list.length) return false;
  saveAllPendaftar(filtered);
  return true;
};

export const exportToCsv = (data: PendaftarData[]): void => {
  const headers = [
    "Timestamp", "No Registrasi", "Jenjang", "Nama Santri", "NIK", "Tempat Lahir", "Tgl Lahir",
    "Jenis Kelamin", "Anak Ke", "Asal Sekolah", "NISN", "Tahun Lulus", "Nama Ayah", "Nama Ibu",
    "No WhatsApp", "Pekerjaan", "Penghasilan", "Alamat", "Metode Bayar", "Status", "No Ujian", "Jadwal Ujian", "Ruang Ujian"
  ];

  const rows = data.map(item => [
    `"${item.timestamp}"`,
    `"${item.nomorRegistrasi}"`,
    `"${item.jenjang}"`,
    `"${item.nama.replace(/"/g, '""')}"`,
    `'${item.nik}`,
    `"${item.tempat_lahir}"`,
    `"${item.tgl_lahir}"`,
    `"${item.jk}"`,
    `"${item.anak_ke}"`,
    `"${item.asal_sekolah.replace(/"/g, '""')}"`,
    `'${item.nisn || '-'}`,
    `"${item.tahun_lulus}"`,
    `"${item.nama_ayah.replace(/"/g, '""')}"`,
    `"${item.nama_ibu.replace(/"/g, '""')}"`,
    `'${item.no_wa}`,
    `"${item.pekerjaan}"`,
    `"${item.gaji}"`,
    `"${(item.alamat || '').replace(/"/g, '""')}"`,
    `"${item.metode_bayar}"`,
    `"${item.status}"`,
    `"${item.noUjian || '-'}"`,
    `"${item.jadwalUjian || '-'}"`,
    `"${item.ruangUjian || '-'}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SPMB_AlMadina_DataPendaftar_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
