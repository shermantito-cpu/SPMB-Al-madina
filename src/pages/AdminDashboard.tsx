import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Home, Download, ArrowLeft, Users, CreditCard, Banknote, Filter, RefreshCw, CheckCircle, FileText, Check, Clock, PenTool, ChevronLeft, ChevronRight, Layers, RotateCcw, Trash2, Calendar, AlertTriangle, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';

export default function AdminDashboard({ onLogout, onGoHome }: { onLogout: () => void, onGoHome: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterJenjang, setFilterJenjang] = useState('Semua');
  const [filterGelombang, setFilterGelombang] = useState<'Semua' | '1' | '2'>('Semua');
  const [filterTahunAjaran, setFilterTahunAjaran] = useState<string>('2027/2028');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState<any>(null);
  const [chartPeriod, setChartPeriod] = useState('Keseluruhan'); // 'Harian', 'Pekanan', 'Keseluruhan'
  const [isWusthoUlyaOpen, setIsWusthoUlyaOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPageVerified, setCurrentPageVerified] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTahunAjaran, setDeleteTahunAjaran] = useState<'2027/2028' | '2028/2029' | '2029/2030'>('2027/2028');
  const [deleteGelombang, setDeleteGelombang] = useState<'1' | '2' | 'Semua'>('1');
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cancelingUser, setCancelingUser] = useState<any | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const ITEMS_PER_PAGE = 15;

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(curr => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPageVerified(1);
  }, [filterJenjang, filterGelombang, filterTahunAjaran]);

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
      showToast('info', `Portal pendaftaran berhasil di-${!isWusthoUlyaOpen ? 'buka' : 'tutup'}.`);
    } catch (e) {
      console.error('Error toggling portal', e);
      showToast('error', 'Gagal merubah status portal');
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

  // Helper to extract Jenjang code for Nomor Peserta (SA for SMA/Ulya, SW for SMP/Wustho, etc.)
  const getJenjangParticipantCode = (jenjangInput: string = ''): string => {
    const str = jenjangInput.toLowerCase();
    if (str.includes('ulya') || str.includes('sma') || str.includes('aliyah') || str.includes('sa')) return 'SA';
    if (str.includes('wustho') || str.includes('wustha') || str.includes('smp') || str.includes('sw')) return 'SW';
    if (str.includes('ula') || str.includes('sd') || str.includes('su')) return 'SU';
    if (str.includes('ra') || str.includes('raudhatul') || str.includes('tk') || str.includes('sr')) return 'SR';
    if (str.includes('aly') || str.includes('mahad') || str.includes('sm')) return 'SM';
    return 'SA';
  };

  // Helper to parse exact registration time in milliseconds
  const getRegTimestamp = (item: any): number => {
    if (item?.createdAt) {
      if (typeof item.createdAt === 'object' && item.createdAt.seconds) {
        return item.createdAt.seconds * 1000;
      }
      const t = new Date(item.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (item?.tanggalDaftar) {
      const parts = item.tanggalDaftar.split('/');
      if (parts.length === 3) {
        const d = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T00:00:00Z`);
        if (!isNaN(d.getTime())) return d.getTime();
      }
    }
    return 0;
  };

  // Helper to determine registration wave (Gelombang 1: s/d 30 Okt 2026, Gelombang 2: di atas 30 Okt 2026)
  const getRegistrationWave = (item: any): 1 | 2 => {
    if (!item) return 1;

    // Check exact registration timestamp: pendaftar di atas 30 Oktober 2026 adalah Gelombang 2
    const ts = getRegTimestamp(item);
    if (ts > 0) {
      const d = new Date(ts);
      if (d.getFullYear() > 2026) return 2;
      if (d.getFullYear() === 2026) {
        if (d.getMonth() > 9) return 2; // Bulan November (10), Desember (11) adalah Gelombang 2
        if (d.getMonth() === 9 && d.getDate() > 30) return 2; // Di atas tanggal 30 Oktober adalah Gelombang 2
      }
      return 1;
    }

    // Check if nomorPeserta starts with SPMB2- or SPMB1-
    if (typeof item.nomorPeserta === 'string') {
      if (item.nomorPeserta.startsWith('SPMB2-')) return 2;
      if (item.nomorPeserta.startsWith('SPMB1-')) return 1;
    }

    if (item.gelombang === 2 || item.gelombang === '2' || item.gelombang === 'Gelombang 2') return 2;
    if (item.gelombang === 1 || item.gelombang === '1' || item.gelombang === 'Gelombang 1') return 1;

    return 1;
  };

  // Helper to extract academic year (Tahun Ajaran)
  const getTahunAjaran = (item: any): string => {
    if (item?.tahunAjaran) return item.tahunAjaran;
    if (item?.nomorPeserta) {
      if (item.nomorPeserta.includes('2829')) return '2028/2029';
      if (item.nomorPeserta.includes('2930')) return '2029/2030';
      if (item.nomorPeserta.includes('2728')) return '2027/2028';
    }
    // Data SPMB saat ini default 2027/2028
    return '2027/2028';
  };

  const getTahunAjaranCode = (ta: string): string => {
    if (ta === '2028/2029') return '2829';
    if (ta === '2029/2030') return '2930';
    return '2728';
  };

  // Function to compute Nomor Peserta based on chronological order of registration per jenjang, per gelombang, and per tahun ajaran
  const generateNomorPesertaByTime = (targetUser: any, currentAllData: any[]): string => {
    if (!targetUser) return '';
    const jenjangCode = getJenjangParticipantCode(targetUser.jenjangName || targetUser.jenjang || '');
    const wave = getRegistrationWave(targetUser);
    const ta = getTahunAjaran(targetUser);
    const taCode = getTahunAjaranCode(ta);
    
    // Filter all records in the same jenjang, same wave, and same Tahun Ajaran
    const sameGroup = currentAllData.filter(d => {
      const code = getJenjangParticipantCode(d.jenjangName || d.jenjang || '');
      const w = getRegistrationWave(d);
      const itemTa = getTahunAjaran(d);
      return code === jenjangCode && w === wave && itemTa === ta;
    });

    // Sort ascending by registration time (earliest registered gets lowest sequence index)
    sameGroup.sort((a, b) => {
      const timeA = getRegTimestamp(a);
      const timeB = getRegTimestamp(b);
      if (timeA !== timeB) return timeA - timeB;
      return (a.nomorRegistrasi || a.id || '').localeCompare(b.nomorRegistrasi || b.id || '');
    });

    const targetId = targetUser.id || targetUser.noReg || targetUser.nomorRegistrasi;
    const index = sameGroup.findIndex(d => (d.id || d.nomorRegistrasi) === targetId);
    const seq = index !== -1 ? index + 1 : sameGroup.length + 1;
    const padded = String(seq).padStart(3, '0');

    // Contoh TA 2027/2028: SPMB1-SA2728001 (Gel 1) atau SPMB2-SA2728001 (Gel 2)
    return `SPMB${wave}-${jenjangCode}${taCode}${padded}`;
  };

  const handleVerifyAction = async (action: 'terima' | 'tolak') => {
    if (!verifyingUser) return;
    const { id, uid } = verifyingUser;
    const isTerima = action === 'terima';

    try {
      let newNomorPeserta = '';
      let newStatus = isTerima ? 'Terverifikasi' : 'Ditolak';
      const wave = getRegistrationWave(verifyingUser);
      const ta = getTahunAjaran(verifyingUser);

      if (isTerima) {
        const targetItem = data.find(item => item.id === id || item.nomorRegistrasi === (verifyingUser.noReg || id)) || verifyingUser;
        newNomorPeserta = generateNomorPesertaByTime(targetItem, data);
      }

      // Update Firestore for public_registrations
      await updateDoc(doc(db, 'public_registrations', id), {
        statusVerifikasi: newStatus,
        ...(isTerima ? { nomorPeserta: newNomorPeserta, gelombang: wave, tahunAjaran: ta } : {})
      });

      // Update for users/uid/registrations if uid exists
      if (uid) {
         try {
            await updateDoc(doc(db, 'users', uid, 'registrations', id), {
               statusVerifikasi: newStatus,
               ...(isTerima ? { nomorPeserta: newNomorPeserta, gelombang: wave, tahunAjaran: ta } : {})
            });
         } catch(e) {
            console.warn("Failed to update user private subcollection:", e);
         }
      }

      console.log(isTerima ? `Pendaftar berhasil diverifikasi dengan Nomor Peserta: ${newNomorPeserta}` : 'Pendaftar ditolak.');
      
      // Update state locally immediately for instant feedback
      setData(prev => prev.map(item => item.id === id ? { ...item, statusVerifikasi: newStatus, ...(isTerima ? { nomorPeserta: newNomorPeserta, gelombang: wave, tahunAjaran: ta } : {}) } : item));
      setVerifyingUser(null);
      showToast('success', isTerima ? `Pendaftar ${verifyingUser.namaLengkap || ''} berhasil diverifikasi dengan No. Peserta: ${newNomorPeserta}` : 'Pendaftar telah ditolak.');
    } catch (err: any) {
      console.error("Error during verification:", err);
      showToast('error', 'Gagal memproses pendaftar: ' + (err.message || 'Terjadi kesalahan sistem.'));
    }
  };

  // Batalkan status verifikasi dan kembalikan ke menu Menunggu Verifikasi
  const confirmCancelVerification = async () => {
    if (!cancelingUser) return;
    const docId = cancelingUser.id || cancelingUser.nomorRegistrasi || cancelingUser.noReg;
    const nama = cancelingUser.namaLengkap || cancelingUser.nomorRegistrasi || 'pendaftar ini';

    setIsCanceling(true);
    try {
      if (docId) {
        // Update public_registrations
        await updateDoc(doc(db, 'public_registrations', docId), {
          statusVerifikasi: 'Menunggu Verifikasi',
          nomorPeserta: ''
        });
      }

      // Update user private subcollection if uid exists
      if (cancelingUser.uid && docId) {
        try {
          await updateDoc(doc(db, 'users', cancelingUser.uid, 'registrations', docId), {
            statusVerifikasi: 'Menunggu Verifikasi',
            nomorPeserta: ''
          });
        } catch (e) {
          console.warn("Failed to update private user doc on cancel verification:", e);
        }
      }

      // Update local state immediately
      setData(prev => prev.map(item => {
        const itemId = item.id || item.nomorRegistrasi;
        if (itemId === docId || (cancelingUser.nomorRegistrasi && item.nomorRegistrasi === cancelingUser.nomorRegistrasi)) {
          return { ...item, statusVerifikasi: 'Menunggu Verifikasi', nomorPeserta: '' };
        }
        return item;
      }));
      setCancelingUser(null);
      showToast('success', `Verifikasi untuk "${nama}" berhasil dibatalkan dan telah kembali ke menu Menunggu Verifikasi.`);
    } catch (err: any) {
      console.error("Gagal membatalkan verifikasi:", err);
      showToast('error', 'Gagal membatalkan verifikasi: ' + (err.message || 'Terjadi kesalahan.'));
    } finally {
      setIsCanceling(false);
    }
  };

  // Hapus Data secara massal berdasarkan Tahun Ajaran & Gelombang pilihan
  const handleBatchDelete = async () => {
    if (itemsToDelete.length === 0) {
      showToast('error', "Tidak ada data pendaftar yang cocok untuk Tahun Ajaran dan Gelombang yang dipilih.");
      return;
    }

    const gelombangLabel = deleteGelombang === '1' ? 'Gelombang Pertama' : deleteGelombang === '2' ? 'Gelombang Kedua' : 'Semua Gelombang';

    setIsDeleting(true);
    try {
      const deleteIds = itemsToDelete.map(item => item.id || item.nomorRegistrasi).filter(Boolean);
      
      for (const item of itemsToDelete) {
        const docId = item.id || item.nomorRegistrasi;
        if (docId) {
          try {
            await deleteDoc(doc(db, 'public_registrations', docId));
          } catch (e) {
            console.error("Gagal menghapus public_registrations doc:", docId, e);
          }
        }
        if (item.uid && docId) {
          try {
            await deleteDoc(doc(db, 'users', item.uid, 'registrations', docId));
          } catch (e) {
            console.warn("Could not delete from user subcollection:", e);
          }
        }
      }

      // Hapus data dari state lokal
      setData(prev => prev.filter(item => {
        const itemId = item.id || item.nomorRegistrasi;
        return !deleteIds.includes(itemId) && !deleteIds.includes(item.nomorRegistrasi);
      }));
      setShowDeleteModal(false);
      setConfirmDeleteChecked(false);
      showToast('success', `Berhasil menghapus ${deleteIds.length} data pendaftar untuk Tahun Ajaran ${deleteTahunAjaran} (${gelombangLabel})!`);
    } catch (err: any) {
      console.error("Gagal menghapus data:", err);
      showToast('error', "Gagal menghapus data: " + (err.message || 'Terjadi kesalahan.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to sync and re-sequence all verified participants based on their registration time and wave
  const handleExecuteSync = async () => {
    setShowSyncModal(false);
    setIsSyncing(true);
    try {
      const updates: { id: string; uid?: string; nomorPeserta: string; gelombang: number }[] = [];
      const waves: (1 | 2)[] = [1, 2];
      const jenjangCodes = ['SA', 'SW', 'SU', 'SR', 'SM'];

      for (const wave of waves) {
        for (const code of jenjangCodes) {
          // Find all records in this jenjang and wave
          const groupAll = data.filter(d => 
            getJenjangParticipantCode(d.jenjangName || d.jenjang || '') === code && 
            getRegistrationWave(d) === wave
          );
          
          // Sort by registration time ascending
          groupAll.sort((a, b) => {
            const timeA = getRegTimestamp(a);
            const timeB = getRegTimestamp(b);
            if (timeA !== timeB) return timeA - timeB;
            return (a.nomorRegistrasi || a.id || '').localeCompare(b.nomorRegistrasi || b.id || '');
          });

          // For each applicant in this wave & jenjang, calculate their chronological number
          groupAll.forEach((item, index) => {
            const isVerified = (item.statusVerifikasi || '').toLowerCase().includes('terverifikasi');
            if (isVerified) {
              const seq = index + 1;
              const newNo = `SPMB${wave}-${code}2728${String(seq).padStart(3, '0')}`;
              if (item.nomorPeserta !== newNo || item.gelombang !== wave) {
                updates.push({ id: item.id, uid: item.uid, nomorPeserta: newNo, gelombang: wave });
              }
            }
          });
        }
      }

      if (updates.length === 0) {
        showToast('info', "Semua Nomor Peserta pendaftar terverifikasi sudah terurut rapi sesuai gelombang!");
        return;
      }

      // Execute updates in Firestore
      for (const upd of updates) {
        await updateDoc(doc(db, 'public_registrations', upd.id), {
          nomorPeserta: upd.nomorPeserta,
          gelombang: upd.gelombang
        });
        if (upd.uid) {
          try {
            await updateDoc(doc(db, 'users', upd.uid, 'registrations', upd.id), {
              nomorPeserta: upd.nomorPeserta,
              gelombang: upd.gelombang
            });
          } catch(e) {}
        }
      }

      // Update state locally
      setData(prev => prev.map(item => {
        const found = updates.find(u => u.id === item.id);
        return found ? { ...item, nomorPeserta: found.nomorPeserta, gelombang: found.gelombang } : item;
      }));

      showToast('success', `Berhasil memperbarui ${updates.length} Nomor Peserta sesuai urutan waktu dan gelombang pendaftaran!`);
    } catch (err: any) {
      console.error("Gagal sinkronisasi nomor peserta:", err);
      showToast('error', "Gagal menyinkronkan nomor peserta: " + (err.message || 'Terjadi kesalahan.'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter Data by Tahun Ajaran
  const taFilteredData = data.filter(d => {
    if (filterTahunAjaran === 'Semua') return true;
    return getTahunAjaran(d) === filterTahunAjaran;
  });

  // Filter Data by Gelombang
  const waveFilteredData = taFilteredData.filter(d => {
    if (filterGelombang === 'Semua') return true;
    return getRegistrationWave(d) === Number(filterGelombang);
  });

  // Filter Data by Jenjang
  const filteredData = waveFilteredData.filter(d => {
    if (filterJenjang === 'Semua') return true;
    return (d.jenjangName || d.jenjang || '').toLowerCase().includes(filterJenjang.toLowerCase());
  });

  const verifiedData = filteredData.filter(d => (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi'));
  const pendingData = filteredData.filter(d => {
    const status = (d.statusVerifikasi || '').toLowerCase();
    return !status.includes('terverifikasi') && !status.includes('ditolak');
  });

  const getCountByJenjang = (...keys: string[]) => waveFilteredData.filter(d => {
    const jenjangStr = (d.jenjangName || d.jenjang || '').toLowerCase();
    const isTerverifikasi = (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi');
    return keys.some(key => jenjangStr.includes(key)) && isTerverifikasi;
  }).length;

  // Data targeted for deletion in the batch delete modal
  const itemsToDelete = data.filter(item => {
    const itemTa = getTahunAjaran(item);
    if (itemTa !== deleteTahunAjaran) return false;
    const itemWave = getRegistrationWave(item);
    if (deleteGelombang === 'Semua') return true;
    return itemWave === Number(deleteGelombang);
  });

  // Chart Data Calculation
  const getChartData = () => {
    const now = new Date();
    
    // Helper to check if a date is within a timeframe
    const isWithinPeriod = (dateVal: any, period: string) => {
      if (period === 'Keseluruhan') return true;
      if (!dateVal) return false;
      
      let d: Date;
      if (typeof dateVal === 'object' && dateVal.seconds) {
        // Handle Firestore Timestamp object
        d = new Date(dateVal.seconds * 1000);
      } else {
        d = new Date(dateVal);
      }
      
      if (isNaN(d.getTime())) return false;
      
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
    const periodData = waveFilteredData.filter(d => {
      let dateVal = d.createdAt;
      
      if (!dateVal && d.tanggalDaftar) {
        // Fallback to tanggalDaftar (format typically DD/MM/YYYY or similar)
        // This is a naive split for common Indonesian formats
        const parts = d.tanggalDaftar.split('/');
        if (parts.length === 3) {
          // Attempt parsing if DD/MM/YYYY
          if (parts[0].length <= 2 && parts[1].length <= 2) {
             dateVal = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T00:00:00Z`);
          }
        }
      }
      return isWithinPeriod(dateVal, chartPeriod);
    });
    
    // Group by Jenjang
    const getCount = (...keys: string[]) => periodData.filter(d => {
      const jenjangStr = (d.jenjangName || d.jenjang || '').toLowerCase();
      return keys.some(key => jenjangStr.includes(key));
    }).length;
    
    return [
      { name: 'RA (TK)', total: getCount('ra', 'raudhatul', 'tk') },
      { name: 'Ula (SD)', total: getCount('ula', 'sd') },
      { name: 'Wustho (SMP)', total: getCount('wustho', 'smp') },
      { name: 'Ulya (SMA)', total: getCount('ulya', 'sma') },
      { name: 'Ma\'had Aly', total: getCount('aly', 'mahad') }
    ];
  };
  
  const chartData = getChartData();

  const getAsalSekolahChartData = () => {
    // Group by asalSekolah using filteredData (so it respects the selected filterJenjang)
    const schools: Record<string, { name: string, total: number, [key: string]: any }> = {};

    // Helper to normalize school names for better grouping
    const normalizeSchoolName = (name: string) => {
      let normalized = name.toLowerCase().trim();

      // Known canonical mappings (aliases)
      if (normalized.includes('zaadul') || normalized.includes('zadul') || normalized.includes("ma'ad") || normalized.includes('maad')) {
        return "PPS Zaadul Ma'ad Palembang";
      }
      if (normalized.includes('izzah')) {
        return "PPTQ AL-IZZAH PALEMBANG";
      }
      if (normalized.includes('faza') || normalized.includes('fasa')) {
        if (normalized.includes('smp')) return "SMP Islam Faza Palembang";
        if (normalized.includes('sd')) return "SD Islam Faza Palembang";
      }
      if (normalized.includes('istiqomah')) {
        if (normalized.includes('smp')) return "SMP IT AL ISTIQOMAH Prabumulih";
        if (normalized.includes('sd')) return "SD IT AL ISTIQOMAH Prabumulih";
      }
      if (normalized.includes('mutiara sunnah')) {
        return "PPTQ Mutiara Sunnah Palembang";
      }
      if (normalized.includes('darussalam') && (normalized.includes('tanjung') || normalized.includes('telang') || normalized.includes('pesantren'))) {
        return "Ponpes Darussalam Tanjung Telang";
      }

      // Remove common punctuation and extra spaces
      normalized = normalized.replace(/[.-]/g, ' ').replace(/\s+/g, ' ').trim();
      // Normalize common abbreviations
      normalized = normalized.replace(/\bsd it\b/g, 'sdit');
      normalized = normalized.replace(/\bsmp it\b/g, 'smpit');
      normalized = normalized.replace(/\bsma it\b/g, 'smait');
      return normalized;
    };

    const CANONICAL_NAMES = [
      "PPS Zaadul Ma'ad Palembang",
      "PPTQ AL-IZZAH PALEMBANG",
      "SMP Islam Faza Palembang",
      "SD Islam Faza Palembang",
      "SMP IT AL ISTIQOMAH Prabumulih",
      "SD IT AL ISTIQOMAH Prabumulih",
      "PPTQ Mutiara Sunnah Palembang",
      "Ponpes Darussalam Tanjung Telang"
    ];

    // Keep track of the original names to use the most common one for display
    const originalNamesMap: Record<string, Record<string, number>> = {};

    filteredData.forEach(d => {
      let rawSekolah = (d.asalSekolah || d.asal_sekolah || '-').trim();
      if (!rawSekolah || rawSekolah === '-') rawSekolah = 'Tidak Diketahui';
      
      const normalizedSekolah = rawSekolah === 'Tidak Diketahui' ? rawSekolah : normalizeSchoolName(rawSekolah);
      
      // Track original names to pick the best representation later
      if (!originalNamesMap[normalizedSekolah]) {
        originalNamesMap[normalizedSekolah] = {};
      }
      originalNamesMap[normalizedSekolah][rawSekolah] = (originalNamesMap[normalizedSekolah][rawSekolah] || 0) + 1;
      
      const rawJenjang = d.jenjangName || d.jenjang || '';
      let j = rawJenjang.trim();
      if (!j) j = 'Lainnya';
      
      if (!schools[normalizedSekolah]) {
        schools[normalizedSekolah] = { name: normalizedSekolah, total: 0 };
      }
      
      if (!schools[normalizedSekolah][j]) {
        schools[normalizedSekolah][j] = 0;
      }
      
      schools[normalizedSekolah][j] += 1;
      schools[normalizedSekolah].total += 1;
    });

    // Pick the most common original name for each normalized group
    Object.keys(schools).forEach(normKey => {
      if (normKey !== 'Tidak Diketahui') {
        if (CANONICAL_NAMES.includes(normKey)) {
          schools[normKey].name = normKey;
        } else {
          const originalCounts = originalNamesMap[normKey];
          // Sort by count descending, then pick the first (most common) original name
          const mostCommonName = Object.keys(originalCounts).sort((a, b) => originalCounts[b] - originalCounts[a])[0];
          // Capitalize words nicely if it looks messy, but for now we'll just use the user-typed one
          schools[normKey].name = mostCommonName;
        }
      }
    });

    // Convert to array and sort by total descending, take top 5
    return Object.values(schools)
      .filter(s => s.name !== 'Tidak Diketahui')
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const asalSekolahChartData = getAsalSekolahChartData();

  // Get unique jenjang keys for the stacked bar
  const jenjangKeysForChart = Array.from(
    new Set(
      asalSekolahChartData.flatMap(item => 
        Object.keys(item).filter(k => k !== 'name' && k !== 'total')
      )
    )
  );

  // Generate colors for jenjang keys
  const getJenjangColor = (jenjang: string) => {
    const l = jenjang.toLowerCase();
    if (l.includes('wustho')) return '#10b981';
    if (l.includes('ulya')) return '#3b82f6';
    if (l.includes('ula')) return '#f59e0b';
    if (l.includes('raudhatul')) return '#ec4899';
    if (l.includes('aly')) return '#8b5cf6';
    return '#64748b';
  };

  const handleExportExcel = (jenjangToExport: string) => {
    let dataToExport = waveFilteredData.filter(d => (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi'));
    if (jenjangToExport !== 'Semua') {
      dataToExport = dataToExport.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(jenjangToExport.toLowerCase()));
    }

    // Sort by Nomor Peserta or registration time ascending
    dataToExport.sort((a, b) => {
      if (a.nomorPeserta && b.nomorPeserta) {
        return a.nomorPeserta.localeCompare(b.nomorPeserta);
      }
      return getRegTimestamp(a) - getRegTimestamp(b);
    });

    // Menyiapkan data dengan urutan kolom sesuai permintaan (menyertakan Tahun Ajaran, Gelombang & Nomor Peserta SPMB)
    const excelData = dataToExport.map(item => ({
      'Tahun Ajaran': getTahunAjaran(item),
      'Gelombang': `Gelombang ${getRegistrationWave(item)}`,
      'Nomor Peserta': item.nomorPeserta || '',
      'Tanggal Daftar': item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : (item.tanggalDaftar || ''),
      'Nomor Registrasi': item.nomorRegistrasi || '',
      'Jenjang': item.jenjangName || item.jenjang || '',
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
      { wch: 15 }, // Tahun Ajaran
      { wch: 15 }, // Gelombang
      { wch: 22 }, // Nomor Peserta
      { wch: 20 }, // Tanggal Daftar
      { wch: 18 }, // Nomor Registrasi
      { wch: 18 }, // Jenjang
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
    const sheetName = filterGelombang === 'Semua' ? 'Data Pendaftar' : `Gelombang ${filterGelombang}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Menyimpan dan mengunduh file Excel
    const waveTag = filterGelombang === 'Semua' ? 'Semua_Gelombang' : `Gelombang_${filterGelombang}`;
    const fileName = jenjangToExport === 'Semua' ? 'Semua_Jenjang' : jenjangToExport.replace('/', '_');
    XLSX.writeFile(wb, `Data_Pendaftar_Terverifikasi_${waveTag}_${fileName}_${new Date().getTime()}.xlsx`);
  };
  
  const transferCount = filteredData.filter(d => (d.metodePembayaran || '').toLowerCase() === 'transfer').length;
  const tunaiCount = filteredData.filter(d => (d.metodePembayaran || '').toLowerCase() !== 'transfer').length;

  const totalGelombang1 = taFilteredData.filter(d => getRegistrationWave(d) === 1).length;
  const totalGelombang2 = taFilteredData.filter(d => getRegistrationWave(d) === 2).length;

  // Pagination Logic
  const totalPagesVerified = Math.ceil(verifiedData.length / ITEMS_PER_PAGE);
  const paginatedVerifiedData = verifiedData.slice(
    (currentPageVerified - 1) * ITEMS_PER_PAGE,
    currentPageVerified * ITEMS_PER_PAGE
  );

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

        {/* Kontrol Filter Gelombang, Tahun Ajaran & Jenjang */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/80 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Segmented Wave Switcher with Icon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0" title="Filter Gelombang">
              <Layers size={18} />
            </div>
            <div className="inline-flex p-1 bg-slate-100/90 rounded-xl gap-1 shrink-0">
              <button
                onClick={() => setFilterGelombang('Semua')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterGelombang === 'Semua'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Semua Gelombang</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${filterGelombang === 'Semua' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-200 text-slate-700'}`}>
                  {taFilteredData.length}
                </span>
              </button>

              <button
                onClick={() => setFilterGelombang('1')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterGelombang === '1'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Gelombang 1</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${filterGelombang === '1' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'}`}>
                  {totalGelombang1}
                </span>
              </button>

              <button
                onClick={() => setFilterGelombang('2')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterGelombang === '2'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Gelombang 2</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${filterGelombang === '2' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  {totalGelombang2}
                </span>
              </button>
            </div>
          </div>

          {/* Filters: Tahun Ajaran & Jenjang */}
          <div className="flex flex-wrap items-center gap-2 self-end md:self-auto shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <Calendar size={14} className="text-slate-400" />
              <select
                value={filterTahunAjaran}
                onChange={(e) => setFilterTahunAjaran(e.target.value)}
                className="bg-transparent text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                title="Filter Tahun Ajaran"
              >
                <option value="2027/2028">TA 2027/2028</option>
                <option value="2028/2029">TA 2028/2029</option>
                <option value="2029/2030">TA 2029/2030</option>
                <option value="Semua">Semua TA</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={filterJenjang} 
                onChange={(e) => setFilterJenjang(e.target.value)}
                className="bg-transparent text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                title="Filter Jenjang"
              >
                <option value="Semua">Semua Jenjang</option>
                <option value="Ulya">Salafiyah Ulya (SMA)</option>
                <option value="Wustho">Salafiyah Wustho (SMP)</option>
                <option value="Ula">Salafiyah Ula (SD)</option>
                <option value="Aly">Tadribud Du'at/Ma'had Aly (D3/S1)</option>
                <option value="Raudhatul">Raudhatul Athfal (RA/TK)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ringkasan & Statistik Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20"><Users size={80} /></div>
            <p className="text-emerald-100 font-semibold mb-1 relative z-10">Total Terverifikasi</p>
            <h2 className="text-5xl font-extrabold relative z-10">{verifiedData.length}</h2>
            <p className="text-sm text-emerald-100 mt-2 relative z-10">
              Filter: {filterGelombang === 'Semua' ? '' : `Gel. ${filterGelombang} • `}{filterJenjang}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:col-span-3">
            <h3 className="text-slate-800 font-bold mb-4">Sebaran Jenjang (Terverifikasi)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">RA (TK)</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('ra', 'raudhatul', 'tk')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">Ula (SD)</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('ula', 'sd')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">Wustho (SMP)</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('wustho', 'smp')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">Ulya (SMA)</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('ulya', 'sma')}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-semibold mb-1">Ma'had Aly</p>
                <p className="text-2xl font-bold text-slate-800">{getCountByJenjang('aly', 'mahad')}</p>
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

        {/* Grafik Asal Sekolah */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Top 5 Sekolah Asal Pendaftar</h3>
            <p className="text-sm text-slate-500">Berdasarkan jenjang yang dipilih: {filterJenjang === 'Semua' ? 'Semua Jenjang' : filterJenjang}</p>
          </div>
          
          <div className="h-72 sm:h-96 w-full mt-4">
            {asalSekolahChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={asalSekolahChartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 11}} 
                    dy={10} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {jenjangKeysForChart.map((key, index) => {
                    const isLast = index === jenjangKeysForChart.length - 1;
                    return (
                      <Bar 
                        key={key} 
                        dataKey={key} 
                        name={key} 
                        stackId="a" 
                        fill={getJenjangColor(key)} 
                        radius={isLast ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                      >
                        {isLast && (
                          <LabelList dataKey="total" position="top" fill="#64748b" fontSize={14} fontWeight="bold" />
                        )}
                      </Bar>
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                Belum ada data pendaftar dari sekolah asal
              </div>
            )}
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
                  <th className="px-6 py-4">Gelombang</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Jenjang</th>
                  <th className="px-6 py-4">Bukti</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada pendaftar yang menunggu verifikasi.
                    </td>
                  </tr>
                ) : (
                  pendingData.map((row, idx) => (
                    <tr key={idx} className="bg-white border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-slate-900">{row.nomorRegistrasi || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getRegistrationWave(row) === 2 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                          Gel. {getRegistrationWave(row)}
                        </span>
                      </td>
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
                          onClick={() => setVerifyingUser({ ...row, id: row.id, jenjang: row.jenjangName || row.jenjang || 'PMB', uid: row.uid, namaLengkap: row.namaLengkap, noReg: row.nomorRegistrasi })}
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
          <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap gap-3 justify-between items-center bg-slate-50/50 rounded-t-[1.5rem]">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" /> Pendaftar Terverifikasi
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSyncModal(true)}
                disabled={isSyncing}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 border border-slate-200 cursor-pointer"
                title="Sinkronkan Nomor Peserta agar urut sesuai tanggal & waktu pendaftaran masing-masing perangkat"
              >
                <RefreshCw size={13} className={isSyncing ? "animate-spin text-emerald-600" : "text-slate-600"} />
                <span className="hidden sm:inline">{isSyncing ? 'Menyinkronkan...' : 'Urutkan No. Peserta'}</span>
                <span className="sm:hidden">Urutkan</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-rose-200"
                title="Hapus data pendaftar berdasarkan Tahun Ajaran dan Gelombang"
              >
                <Trash2 size={13} className="text-rose-600" />
                <span className="hidden sm:inline">Hapus Data</span>
                <span className="sm:hidden">Hapus</span>
              </button>

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
                    Pilih Jenjang ({filterGelombang === 'Semua' ? 'Semua Gel.' : `Gel. ${filterGelombang}`}):
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
        </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4">No. Peserta</th>
                  <th className="px-6 py-4">Gelombang</th>
                  <th className="px-6 py-4">No. Reg</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Jenjang</th>
                  <th className="px-6 py-4">Metode Bayar</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {verifiedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Belum ada data pendaftar terverifikasi untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  paginatedVerifiedData.map((row, idx) => (
                    <tr key={idx} className="bg-white border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">{row.nomorPeserta || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getRegistrationWave(row) === 2 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                          Gel. {getRegistrationWave(row)}
                        </span>
                      </td>
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
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setCancelingUser(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Batalkan verifikasi (kembalikan ke antrean Menunggu Verifikasi)"
                        >
                          <RotateCcw size={12} className="text-amber-600" />
                          <span>Batalkan</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPagesVerified > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 rounded-b-[1.5rem]">
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                Menampilkan {(currentPageVerified - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPageVerified * ITEMS_PER_PAGE, verifiedData.length)} dari {verifiedData.length} Data
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPageVerified(p => Math.max(1, p - 1))}
                  disabled={currentPageVerified === 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPagesVerified }).map((_, i) => {
                    const page = i + 1;
                    // Show only some pages on mobile or desktop to be minimal
                    if (
                      page === 1 || 
                      page === totalPagesVerified || 
                      (page >= currentPageVerified - 1 && page <= currentPageVerified + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPageVerified(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            currentPageVerified === page
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPageVerified - 2 || 
                      page === currentPageVerified + 2
                    ) {
                      return <span key={page} className="text-slate-400 px-1 text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPageVerified(p => Math.min(totalPagesVerified, p + 1))}
                  disabled={currentPageVerified === totalPagesVerified}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    
      {verifyingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Verifikasi Pendaftar</h3>
            <p className="text-sm text-gray-600 mb-4">
              Anda akan memverifikasi pendaftar <strong>{verifyingUser.namaLengkap}</strong> ({verifyingUser.noReg}).
            </p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-5 text-left">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-emerald-800 font-semibold">Nomor Peserta yang Diterbitkan:</p>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getRegistrationWave(verifyingUser) === 2 ? 'bg-emerald-200 text-emerald-900' : 'bg-blue-200 text-blue-900'}`}>
                  Gelombang {getRegistrationWave(verifyingUser)}
                </span>
              </div>
              <p className="text-base font-mono font-bold text-emerald-900 tracking-wide">
                {generateNomorPesertaByTime(verifyingUser, data)}
              </p>
              <p className="text-[10px] text-emerald-600 mt-1">
                *Otomatis berurutan sesuai waktu pendaftaran perangkat ({verifyingUser.jenjang || verifyingUser.jenjangName || 'Semua'})
              </p>
            </div>

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

      {/* Modal Hapus Data Berdasarkan Tahun Ajaran & Gelombang */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-950">Hapus Data Pendaftaran</h3>
                  <p className="text-xs text-rose-700/80">Filter berdasarkan Tahun Ajaran & Gelombang</p>
                </div>
              </div>
              <button 
                onClick={() => !isDeleting && setShowDeleteModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-rose-100/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* 1. Pilih Tahun Ajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-500" />
                  <span>1. Pilih Tahun Ajaran:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['2027/2028', '2028/2029', '2029/2030'] as const).map(ta => (
                    <button
                      key={ta}
                      type="button"
                      onClick={() => setDeleteTahunAjaran(ta)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        deleteTahunAjaran === ta
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ta}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Pilih Gelombang */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers size={14} className="text-slate-500" />
                  <span>2. Pilih Gelombang (T.A. {deleteTahunAjaran}):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteGelombang('1')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 ${
                      deleteGelombang === '1'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-blue-50/60 text-blue-800 border-blue-200 hover:bg-blue-100/60'
                    }`}
                  >
                    <span>Gelombang Pertama</span>
                    <span className={`text-[10px] ${deleteGelombang === '1' ? 'text-blue-100' : 'text-blue-600'}`}>
                      ({data.filter(d => getTahunAjaran(d) === deleteTahunAjaran && getRegistrationWave(d) === 1).length} Data)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteGelombang('2')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 ${
                      deleteGelombang === '2'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30'
                        : 'bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                    }`}
                  >
                    <span>Gelombang Kedua</span>
                    <span className={`text-[10px] ${deleteGelombang === '2' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                      ({data.filter(d => getTahunAjaran(d) === deleteTahunAjaran && getRegistrationWave(d) === 2).length} Data)
                    </span>
                  </button>
                </div>
              </div>

              {/* Ringkasan Data Target */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Data yang akan dihapus:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {itemsToDelete.length} Pendaftar
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-2 border-t border-slate-200">
                  <span>Terverifikasi: <strong>{itemsToDelete.filter(d => (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi')).length}</strong></span>
                  <span>Menunggu: <strong>{itemsToDelete.filter(d => !(d.statusVerifikasi || '').toLowerCase().includes('terverifikasi') && !(d.statusVerifikasi || '').toLowerCase().includes('ditolak')).length}</strong></span>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                <p>
                  Data yang dihapus <strong>tidak dapat dikembalikan</strong>. Pastikan Anda telah mengunduh rekap Excel sebelum melanjutkan.
                </p>
              </div>

              {/* Checkbox Konfirmasi */}
              {itemsToDelete.length > 0 && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-rose-800 font-semibold p-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={confirmDeleteChecked}
                    onChange={e => setConfirmDeleteChecked(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer shrink-0"
                  />
                  <span>Saya mengerti dan yakin ingin menghapus permanen {itemsToDelete.length} data pendaftar ini.</span>
                </label>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDeleteChecked(false);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBatchDelete}
                disabled={isDeleting || itemsToDelete.length === 0 || !confirmDeleteChecked}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm shadow-rose-600/30 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Hapus {itemsToDelete.length} Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Batalkan Verifikasi */}
      {cancelingUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <RotateCcw size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Batalkan Verifikasi?</h3>
                  <p className="text-amber-100 text-xs">Kembalikan ke antrean Menunggu Verifikasi</p>
                </div>
              </div>
              <button
                onClick={() => setCancelingUser(null)}
                disabled={isCanceling}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 space-y-2">
                <div className="text-xs">
                  <span className="font-semibold text-amber-800">Nama Lengkap:</span>
                  <p className="font-bold text-sm text-slate-800 mt-0.5">{cancelingUser.namaLengkap || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-amber-200/60">
                  <div>
                    <span className="text-amber-800 font-semibold">No. Registrasi:</span>
                    <p className="font-mono font-bold text-slate-700 mt-0.5">{cancelingUser.nomorRegistrasi || '-'}</p>
                  </div>
                  <div>
                    <span className="text-amber-800 font-semibold">No. Peserta:</span>
                    <p className="font-mono font-bold text-emerald-700 mt-0.5">{cancelingUser.nomorPeserta || '-'}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Status pendaftar akan dipindahkan kembali ke menu <strong>Menunggu Verifikasi</strong> dan Nomor Peserta akan dikosongkan. Anda dapat memverifikasi ulang pendaftar ini kapan saja.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelingUser(null)}
                disabled={isCanceling}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmCancelVerification}
                disabled={isCanceling}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm shadow-amber-600/30 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isCanceling ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Membatalkan...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    <span>Ya, Batalkan Verifikasi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sinkronisasi Nomor Peserta */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <RefreshCw size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Urutkan Nomor Peserta</h3>
                  <p className="text-slate-300 text-xs">Sinkronkan nomor urut pendaftar</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Fitur ini akan memperbarui dan menyinkronkan seluruh Nomor Peserta pendaftar terverifikasi agar urutan 3 angka terakhir sesuai dengan <strong>tanggal & waktu pendaftaran masing-masing</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                <li>Gelombang 1: format <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">SPMB1-...</code></li>
                <li>Gelombang 2: format <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">SPMB2-...</code></li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteSync}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-slate-900/30"
              >
                <RefreshCw size={14} />
                <span>Mulai Sinkronkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4 animate-in slide-in-from-top-4 duration-200">
          <div className={`rounded-2xl p-4 shadow-xl border flex items-start gap-3 backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/30'
              : toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-950/30'
              : 'bg-slate-900/90 text-slate-100 border-slate-700 shadow-slate-900/30'
          }`}>
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
              {toast.type === 'error' && <AlertTriangle size={18} className="text-rose-400" />}
              {toast.type === 'info' && <RefreshCw size={18} className="text-blue-400" />}
            </div>
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            >
              <X size={14} />
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
