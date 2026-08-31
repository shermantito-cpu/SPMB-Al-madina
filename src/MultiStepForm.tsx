import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Save, CheckSquare, Download, Clock, MapPin, Calendar, Share2, Copy } from 'lucide-react';

import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

import { useAuth } from './contexts/AuthContext';
import { db } from './lib/firebase';
import { doc, setDoc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore';

interface MultiStepFormProps {
  jenjang: string;
  jenjangName: string;
  onBack: () => void;
  initialCheckMode?: boolean;
  initialRegNumber?: string | null;
}

const formatTanggalIndonesia = (dateStr: string) => {
  if (!dateStr) return '-';
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const hari = parseInt(parts[2], 10);
    const bln = bulan[parseInt(parts[1], 10) - 1];
    const thn = parts[0];
    return `${hari} ${bln} ${thn}`;
  }
  return dateStr;
};

const getContactNumber = (j: string) => {
  switch (j) {
    case 'Wustho': return '0821-8433-1107';
    case 'Ulya': return '085273216532';
    case 'Ula': return '0821-8039-8550';
    default: return '085273216532';
  }
};

export default function MultiStepForm({ jenjang, jenjangName, onBack, initialCheckMode = false, initialRegNumber = null }: MultiStepFormProps) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(initialCheckMode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  
    
  // Simulasi verifikasi admin
  const [isVerified, setIsVerified] = useState(false);
  const [nomorPeserta, setNomorPeserta] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time listener for registration status
  React.useEffect(() => {
    if (isSubmitted && nomorRegistrasi && !isVerified) {
      const unsubscribe = onSnapshot(doc(db, 'public_registrations', nomorRegistrasi), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.statusVerifikasi === 'Terverifikasi' || data.statusVerifikasi?.toLowerCase().includes('terverifikasi')) {
            setNomorPeserta(data.nomorPeserta || 'PMB-2027-' + Math.floor(1000 + Math.random() * 9000));
            setIsVerified(true);
            setIsCheckingFormVisible(false);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [isSubmitted, nomorRegistrasi, isVerified]);

  const STORAGE_KEY = `spmb_draft_${jenjang}`;

  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Never restore file objects since they can't be easily serialized
          return { ...parsed, buktiPembayaran: null };
        } catch (e) {
          console.error('Failed to load draft:', e);
        }
      }
    }
    return {
      namaLengkap: '',
      nik: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: '',
      anakKe: '',
      asalSekolah: '',
      nisn: '',
      tahunLulus: '',
      namaAyah: '',
      namaIbu: '',
      noWhatsapp: '',
      pekerjaanUtama: '',
      gajiPerbulan: '',
      alamatLengkap: '',
      metodePembayaran: '',
      buktiPembayaran: null as File | null,
    };
  });

  // Auto-Save Effect
  useEffect(() => {
    if (!isSubmitted) {
      const dataToSave = { ...formData, buktiPembayaran: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [formData, isSubmitted, STORAGE_KEY]);

  const [isCheckingFormVisible, setIsCheckingFormVisible] = useState(initialCheckMode);
  const [inputRegNumber, setInputRegNumber] = useState(initialRegNumber || '');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');
  const [showDuplicateError, setShowDuplicateError] = useState(false);
  const [showNextStepsPopup, setShowNextStepsPopup] = useState(false);

  useEffect(() => {
    if (isSubmitted && !isVerified && !isCheckingFormVisible) {
      const timer = setTimeout(() => {
        setShowNextStepsPopup(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, isVerified, isCheckingFormVisible]);

  const formDataRef = React.useRef(formData);
  formDataRef.current = formData;

  // Auto trigger check status if initialRegNumber is provided
  React.useEffect(() => {
    if (initialCheckMode && initialRegNumber) {
      const performCheck = async () => {
        setCheckLoading(true);
        setCheckMessage('');
        try {
          const q = query(collection(db, 'public_registrations'), where('nomorRegistrasi', '==', initialRegNumber));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const resultData = querySnapshot.docs[0].data();
            setFormData(prev => ({
                ...prev,
                namaLengkap: resultData.namaLengkap || prev.namaLengkap,
                tempatLahir: resultData.tempatLahir || prev.tempatLahir,
                tanggalLahir: resultData.tanggalLahir || prev.tanggalLahir,
                asalSekolah: resultData.asalSekolah || prev.asalSekolah,
                nisn: (resultData.nisn ? resultData.nisn.toString().replace(/^'/, '') : prev.nisn),
                namaAyah: resultData.namaAyah || prev.namaAyah,
                namaIbu: resultData.namaIbu || prev.namaIbu,
              }));
              setNomorRegistrasi(resultData.nomorRegistrasi);
              setIsSubmitted(true);
              setIsCheckingFormVisible(false);

              if (resultData.statusVerifikasi === 'Terverifikasi' || resultData.statusVerifikasi?.toLowerCase().includes('terverifikasi')) {
                setIsVerified(true);
                setNomorPeserta(resultData.nomorPeserta || '-');
                setCheckMessage('Status: Terverifikasi. Silakan cetak Lembar Peserta Tes Anda.');
              } else {
                setIsVerified(false);
                setCheckMessage(`Status: ${resultData.statusVerifikasi || 'Menunggu Verifikasi'}. Berkas Anda sedang dalam pengecekan.`);
              }
          } else {
            setCheckMessage('Nomor registrasi tidak ditemukan. Pastikan Anda mendaftar pada jenjang yang benar.');
          }
        } catch (error) {
          console.error(error);
          setCheckMessage('Terjadi kesalahan saat mengecek status.');
        } finally {
          setCheckLoading(false);
        }
      };
      
      performCheck();
    }
  }, [initialCheckMode, initialRegNumber, jenjang]);

  const handleCheckStatus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCheckLoading(true);
    setCheckMessage('');
    
    try {
      const q = query(collection(db, 'public_registrations'), where('nomorRegistrasi', '==', inputRegNumber));
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.empty ? { found: false } : { found: true, statusVerifikasi: querySnapshot.docs[0].data().statusVerifikasi, data: querySnapshot.docs[0].data() };
      
      if (result.found) {
        setFormData(prev => ({
            ...prev,
            namaLengkap: result.data.namaLengkap || prev.namaLengkap,
            tempatLahir: result.data.tempatLahir || prev.tempatLahir,
            tanggalLahir: result.data.tanggalLahir || prev.tanggalLahir,
            asalSekolah: result.data.asalSekolah || prev.asalSekolah,
            nisn: (result.data.nisn ? result.data.nisn.toString().replace(/^'/, '') : prev.nisn),
            namaAyah: result.data.namaAyah || prev.namaAyah,
            namaIbu: result.data.namaIbu || prev.namaIbu,
          }));
          setNomorRegistrasi(result.data.nomorRegistrasi);
          setIsSubmitted(true);
          setIsCheckingFormVisible(false);

          if (result.statusVerifikasi === 'Terverifikasi' || result.statusVerifikasi?.toLowerCase().includes('terverifikasi')) {
            setNomorPeserta(result.data.nomorPeserta || `PMB-2027-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsVerified(true);
          } else {
            setIsVerified(false);
          }
      } else {
        setCheckMessage("Nomor Registrasi tidak ditemukan.");
      }
    } catch (error) {
      console.error(error);
      if (inputRegNumber === nomorRegistrasi) {
        setCheckMessage("Pendaftaran Masih Menunggu Verifikasi (Simulasi Lokal)");
      } else {
        setCheckMessage("Terjadi kesalahan. Pastikan skrip GAS Anda sudah memiliki fungsi doGet untuk checkStatus.");
      }
    } finally {
      setCheckLoading(false);
    }
  };

  const captureCardImage = async () => {
    const element = document.getElementById('print-area');
    if (!element) return null;
    
    const parent = element.parentElement;
    const originalParentOverflow = parent ? parent.style.overflow : '';
    
    // Save original styles
    const originalStyles = {
      transform: element.style.transform,
      boxShadow: element.style.boxShadow,
      border: element.style.border,
      margin: element.style.margin,
    };
    
    try {
      if (parent) {
        // Prevent parent from clipping the captured element
        parent.style.overflow = 'visible';
      }
      
      // Temporarily remove shadow and border for clean capture
      element.style.transform = 'none';
      element.style.boxShadow = 'none';
      element.style.border = 'none';
      element.style.margin = '0';
      
      const captureWidth = element.scrollWidth;
      const captureHeight = element.scrollHeight;
      
      const dataUrl = await toJpeg(element, { 
        quality: 1.0, 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: captureWidth,
        height: captureHeight,
        style: {
          margin: '0',
          transform: 'none'
        }
      });
      return dataUrl;
    } catch (error) {
      console.error('Capture error:', error);
      return null;
    } finally {
      // Restore styles immediately
      element.style.transform = originalStyles.transform;
      element.style.boxShadow = originalStyles.boxShadow;
      element.style.border = originalStyles.border;
      element.style.margin = originalStyles.margin;
      
      if (parent) {
        parent.style.overflow = originalParentOverflow;
      }
    }
  };

  const handleShare = async () => {
    const dataUrl = await captureCardImage();
    if (!dataUrl) {
      alert('Gagal membagikan kartu ujian.');
      return;
    }
    
    try {
      // Convert base64 to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `Kartu_Ujian_${formDataRef.current.namaLengkap || 'Peserta'}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Kartu Peserta Ujian SPMB Al-Madina',
          text: `Berikut adalah Kartu Peserta Ujian a.n ${formDataRef.current.namaLengkap} (No. Reg: ${nomorRegistrasi})`,
          files: [file]
        });
      } else if (navigator.share) {
        // Fallback for browsers that support share but not files
        await navigator.share({
          title: 'Kartu Peserta Ujian SPMB Al-Madina',
          text: `Kartu Peserta Ujian a.n ${formDataRef.current.namaLengkap} (No. Reg: ${nomorRegistrasi})\n\nSilakan login ke sistem untuk mengunduh.`,
          url: window.location.href,
        });
      } else {
        alert('Fitur share file tidak didukung di perangkat/browser ini.');
      }
    } catch (error) {
      console.error('Error sharing', error);
      alert('Gagal membagikan kartu ujian.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    if (name === 'nik') {
      value = value.replace(/\D/g, '').slice(0, 16);
      setErrors(prev => ({ ...prev, nik: '' }));
    }
    if (name === 'nisn') {
      value = value.replace(/\D/g, '').slice(0, 10);
      setErrors(prev => ({ ...prev, nisn: '' }));
    }
    if (name === 'noWhatsapp') {
      value = value.replace(/\D/g, '').slice(0, 13);
      setErrors(prev => ({ ...prev, noWhatsapp: '' }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, buktiPembayaran: e.target.files![0] }));
    }
  };

  const validateStep = () => {
    let newErrors: Record<string, string> = {};
    let valid = true;

    if (step === 1) {
      if (formData.nik.length !== 16) {
        newErrors.nik = "NIK harus berjumlah tepat 16 digit";
        valid = false;
      }
    } else if (step === 2) {
      if (formData.nisn.length !== 10) {
        newErrors.nisn = "NISN harus berjumlah tepat 10 digit";
        valid = false;
      }
    } else if (step === 3) {
      if (formData.noWhatsapp.length < 10 || formData.noWhatsapp.length > 13) {
        newErrors.noWhatsapp = "No WhatsApp harus antara 10 hingga 13 digit";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let foundDuplicateRegNumber = null;
      
      // Cek duplicate via public_registrations di Firestore
      if (formData.nik) {
        const qNik = query(collection(db, 'public_registrations'), where('nik', '==', formData.nik));
        const snapNik = await getDocs(qNik);
        if (!snapNik.empty) {
          foundDuplicateRegNumber = snapNik.docs[0].id;
        }
      }
      
      if (!foundDuplicateRegNumber && formData.nisn) {
        const qNisn = query(collection(db, 'public_registrations'), where('nisn', '==', formData.nisn));
        const snapNisn = await getDocs(qNisn);
        if (!snapNisn.empty) {
          foundDuplicateRegNumber = snapNisn.docs[0].id;
        }
      }
      
      if (foundDuplicateRegNumber) {
        // Cek status di Firestore langsung
        const docSnap = await getDocs(query(collection(db, 'public_registrations'), where('__name__', '==', foundDuplicateRegNumber)));
        if (!docSnap.empty) {
           const data = docSnap.docs[0].data();
           const statusVerifikasi = (data.statusVerifikasi || '').toLowerCase();
           if (statusVerifikasi.includes('terverifikasi') || statusVerifikasi.includes('valid')) {
             setShowDuplicateError(true);
             setIsSubmitting(false);
             return;
           }
        }
      }
    } catch (e) {
      console.warn("Gagal melakukan pengecekan duplikasi, melanjutkan proses pendaftaran...", e);
    }
    
    // Generate Nomor Registrasi
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const newNomorRegistrasi = `REG-${currentYear}-${randomDigits}`;
    setNomorRegistrasi(newNomorRegistrasi);
    
    try {
      // 1. Convert file to Base64 (jika ada bukti pembayaran)
      let buktiBase64 = '';
      if (formData.buktiPembayaran) {
        buktiBase64 = await fileToBase64(formData.buktiPembayaran);
      }

      // 2. Siapkan Data Payload ke Firestore
      const { buktiPembayaran, ...payloadWithoutFile } = formData;
      const firestoreData = {
        ...payloadWithoutFile,
        buktiPembayaranBase64: buktiBase64,
        nomorRegistrasi: newNomorRegistrasi,
        jenjang: jenjang,
        jenjangName: jenjangName,
        createdAt: new Date().toISOString(),
        tanggalDaftar: new Date().toLocaleDateString('id-ID'),
        statusVerifikasi: 'Menunggu Verifikasi',
        nomorPeserta: '', // Akan diisi admin saat verifikasi
        uid: currentUser?.uid || '',
        akunEmail: currentUser?.email || ''
      };

      // 3. Simpan ke Firestore
      await setDoc(doc(db, 'public_registrations', newNomorRegistrasi), firestoreData);

      
      
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid, 'registrations', newNomorRegistrasi), firestoreData);
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const handlePrint = async () => {
    const dataUrl = await captureCardImage();
    if (!dataUrl) {
      alert('Gagal membuat PDF. Silakan coba cetak manual dengan tombol Cetak A4.');
      return;
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate height maintaining aspect ratio
      const imgProps = pdf.getImageProperties(dataUrl);
      let imgWidth = pdfWidth;
      let imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Scale down if image height exceeds page height to prevent truncation
      if (imgHeight > pageHeight) {
        const ratio = pageHeight / imgHeight;
        imgHeight = pageHeight;
        imgWidth = imgWidth * ratio;
      }
      
      // Center horizontally
      const xOffset = (pdfWidth - imgWidth) / 2;
      
      pdf.addImage(dataUrl, 'JPEG', xOffset, 0, imgWidth, imgHeight);
      pdf.save(`Kartu_Ujian_${formDataRef.current.namaLengkap || 'Peserta'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Gagal membuat PDF. Silakan coba cetak manual dengan tombol Cetak A4.');
    }
  };

  const jadwalTes = jenjang === 'RA' || jenjang === 'Ula' 
    ? 'Ahad, 28 Maret 2027' 
    : 'Ahad, 1 November 2026';

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:pb-0">
        
        {!isVerified ? (
          // VIEW 1: BELUM VERIFIKASI
          <div className="flex flex-col items-center justify-center pt-20 px-4 print:hidden">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
              {!isCheckingFormVisible ? (
                <>
                  <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Menunggu Verifikasi</h2>
                  
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 mt-4">
                    <p className="text-sm text-emerald-800 font-medium mb-1">Nomor Registrasi Anda:</p>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-3xl font-mono font-bold text-emerald-900 tracking-wider">{nomorRegistrasi}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(nomorRegistrasi);
                          alert('Nomor registrasi berhasil disalin!');
                        }}
                        className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
                      >
                        <Copy size={14} /> Salin Nomor Registrasi
                      </button>
                    </div>
                    <p className="text-xs text-emerald-700 mt-3 leading-relaxed">
                      Harap simpan atau <i>screenshot</i> nomor ini untuk mengecek status kelulusan dan verifikasi pendaftaran Anda nanti.
                    </p>
                  </div>

                  <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                    Alhamdulillah Ananda <strong>{formData.namaLengkap}</strong>, data telah kami terima.<br/> 
                    Admin sedang memverifikasi berkas dan pembayaran. silahkan klik tombol "Cek Pendaftaran" untuk cetak kartu peserta ujian.<br/><br/>
                    Baarakallahu Fiikum, Semoga Allah mudahkan
                  </p>
                  <button 
                    onClick={onBack}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors mb-3"
                  >
                    Kembali ke Beranda
                  </button>
                  <button 
                    onClick={() => setIsCheckingFormVisible(true)}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 px-6 rounded-xl transition-colors border border-emerald-200"
                  >
                    Cek Pendaftaran
                  </button>
                </>
              ) : (
                <form onSubmit={handleCheckStatus} className="text-left animate-in fade-in zoom-in duration-300">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Masukkan Nomor Registrasi</label>
                    <input 
                      required 
                      type="text" 
                      value={inputRegNumber} 
                      onChange={(e) => setInputRegNumber(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-center font-mono font-bold text-lg uppercase" 
                      placeholder="REG-XX-XXXXX" 
                    />
                  </div>
                  
                  {checkMessage && (
                    <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg mb-4 text-center border border-yellow-200 font-medium">
                      {checkMessage}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsCheckingFormVisible(false);
                        setCheckMessage('');
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={checkLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center"
                    >
                      {checkLoading ? 'Memeriksa...' : 'Cari Data'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          // VIEW 2: TERVERIFIKASI (KARTU UJIAN)
          <div className="pt-8 px-4 print:pt-0 print:px-0">
            
            {/* Tombol Aksi (Sembunyi saat print) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
              <button onClick={onBack} className="text-gray-500 hover:text-emerald-600 flex items-center font-medium self-start sm:self-auto">
                <ArrowLeft size={18} className="mr-2" /> Kembali
              </button>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
                <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center shadow-sm transition-colors text-sm">
                  <Download size={18} className="mr-2" /> Download PDF
                </button>
                <button onClick={handleShare} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center shadow-sm transition-colors text-sm">
                  <Share2 size={18} className="mr-2" /> Bagikan
                </button>
              </div>
            </div>

            {/* KARTU UJIAN - A4 Layout wrapper (memaksa lebar A4 agar tidak rusak di layar kecil) */}
            <div className="w-full overflow-x-auto overflow-y-auto pb-8 print:pb-0 print:overflow-visible flex lg:justify-center" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
              <div id="print-area" className="w-[210mm] min-h-[297mm] bg-white p-10 shadow-2xl print:shadow-none print:w-full print:m-0 print:p-4 text-gray-800 border border-gray-200 print:border-none shrink-0 origin-top-left" style={{ boxSizing: 'border-box' }}>
              
              {/* Kop Surat */}
              <div className="flex items-center justify-between border-b-4 border-emerald-800 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <img src="/logp.png" alt="Logo Pondok" className="w-24 h-24 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                  <div>
                    <h1 className="text-2xl font-extrabold text-emerald-900 tracking-tight">PONDOK PESANTREN AL-MADINA</h1>
                    <p className="text-sm text-gray-600 font-medium">Panitia Penerimaan Santri Baru (SPMB) Tahun 2027</p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-xl font-bold uppercase underline underline-offset-4 mb-1">LEMBAR PESERTA TES</h2>
                <p className="text-sm font-semibold">No. Registrasi: {nomorPeserta}</p>
              </div>

              {/* Data Siswa & Foto */}
              <div className="flex justify-between items-start mb-10 gap-6">
                <div className="flex-1">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Nama Lengkap', formData.namaLengkap || '-'],
                        ['Tempat, Tanggal Lahir', `${formData.tempatLahir || '-'}, ${formatTanggalIndonesia(formData.tanggalLahir)}`],
                        ['Jenjang Pilihan', jenjangName],
                        ['Asal Sekolah', formData.asalSekolah || '-'],
                        ['NISN', formData.nisn || '-'],
                        ['Nama Orang Tua/Wali', formData.namaAyah || formData.namaIbu || '-'],
                      ].map(([label, value], idx) => (
                        <tr key={idx}>
                          <td className="py-2 font-semibold w-1/3 align-top">{label}</td>
                          <td className="py-2 px-2 align-top">:</td>
                          <td className="py-2 align-top uppercase font-bold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Kotak Foto 3x4 */}
                <div className="w-[3cm] h-[4cm] border-2 border-gray-400 border-dashed flex items-center justify-center bg-gray-50 shrink-0">
                  <span className="text-xs text-gray-400 text-center font-medium px-2">Tempel Pas Foto 3x4 disini</span>
                </div>
              </div>

              {/* Jadwal & Ruangan */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mb-8 text-sm flex flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center text-emerald-800 font-bold mb-1"><Calendar size={16} className="mr-2"/> Jadwal Tes</div>
                  <p className="pl-6 font-semibold">{jadwalTes}</p>
                  <p className="pl-6 text-emerald-700">Waktu: 07.30 WIB - Selesai</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center text-emerald-800 font-bold mb-1"><MapPin size={16} className="mr-2"/> Lokasi & Gedung</div>
                  <p className="pl-6 font-semibold">Pondok Pesantren Al Madina Prabumulih</p>
                  <p className="pl-6 text-emerald-700">Ruang: Akan diinformasikan Panitia</p>
                </div>
              </div>

              {/* Materi & Dokumen */}
              <div className="mb-8 text-sm">
                <h3 className="font-bold text-base mb-3 bg-emerald-800 text-white px-3 py-1.5 inline-block">B. MATERI TES & PERSYARATAN DOKUMEN</h3>
                <table className="w-full border-collapse border border-gray-800">
                  <thead>
                    <tr>
                      <th className="border border-gray-800 p-2 bg-gray-100 text-left w-1/2">Persyaratan Dokumen (Dibawa Fisik)</th>
                      <th className="border border-gray-800 p-2 bg-gray-100 text-left w-1/2">Materi Ujian</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-800 p-3 align-top leading-relaxed">
                        <b>Identitas Calon & Wali</b>
                        <ul className="list-disc pl-4 mb-3 text-gray-700">
                          <li>Printout Lembar Peserta Tes</li>
                          <li>Pas Photo 3x4 (1 lembar)</li>
                          <li>Fotocopy Kartu Keluarga (1 Lembar)</li>
                          <li>Fotocopy KTP Orangtua (1 Lembar)</li>
                          <li>Fotocopy Akte Kelahiran (1 lembar)</li>
                          <li>Surat Pernyataan Ditempel Materai 10.000 (Format surat download di laman Website SPMB)</li>
                        </ul>
                        <b>Dokumen Sekolah Asal</b>
                        <ul className="list-disc pl-4 mb-3 text-gray-700">
                          <li>Fotocopy Nilai Rapor Dua Semester Terakhir</li>
                          <li>Fotokopi Ijazah Terakhir (boleh menyusul)</li>
                          <li>Surat Keterangan Lulus</li>
                          <li>Surat Keterangan Valid NISN</li>
                        </ul>
                        <b>Kelengkapan Lainnya</b>
                        <ul className="list-disc pl-4 text-gray-700">
                          {jenjang === 'Wustho' && <li>Map Biru</li>}
                          {(jenjang === 'Ulya' || jenjang === 'Mahad_Aly') && <li>Map Hijau</li>}
                        </ul>
                      </td>
                      <td className="border border-gray-800 p-3 align-top leading-relaxed">
                        <b>1. Mata Pelajaran Dinniyah</b>
                        <ul className="list-disc pl-4 mb-3 text-gray-700">
                          <li>Wawasan Dasar Islam</li>
                          <li>Akidah</li>
                        </ul>
                        <b>2. Mata Pelajaran Umum</b>
                        <ul className="list-disc pl-4 mb-3 text-gray-700">
                          <li>Matematika</li>
                          <li>Bahasa Indonesia</li>
                          <li>Bahasa Inggris</li>
                        </ul>
                        <b>3. Tes Bacaan Al-Qur'an</b>
                        <ul className="list-disc pl-4 mb-3 text-gray-700">
                          <li>Tajwid dan Makharijul Huruf</li>
                          <li>Hafalan Al-Qur'an</li>
                          {(jenjang === 'Ulya' || jenjang === 'Mahad_Aly') && <li>Baca Kitab Gundul (Khusus SMA/Ulya)</li>}
                        </ul>
                        <b>4. Sesi Wawancara</b>
                        <ul className="list-disc pl-4 text-gray-700">
                          <li>Wawancara Calon Santri</li>
                          <li>Wawancara Calon Wali Santri</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tata Tertib */}
              <div className="text-sm mb-10">
                <h3 className="font-bold text-base mb-2">C. TATA TERTIB & KETENTUAN PESERTA</h3>
                <ol className="list-decimal pl-5 space-y-1.5 text-gray-700">
                  <li>Calon Santri & Wali Santri wajib hadir secara fisik di lokasi paling lambat 30 menit sebelum jadwal ujian dimulai.</li>
                  <li>Calon Santri wajib melakukan registrasi sebelum pelaksanaan tes.</li>
                  <li>Wajib membawa lembar fisik peserta tes ini hasil unduhan serta dokumen persyaratan lainnya.</li>
                  <li>Calon Santri dan Wali Santri wajib mengenakan pakaian muslim / muslimah yang rapi, sopan, serta menutup aurat secara sempurna.</li>
                  <li>Membawa peralatan tulis pribadi secara lengkap (pensil, pulpen, penghapus, dll).</li>
                  <li>Calon Santri dan Wali santri Wajib Mengikuti Sesi Wawancara.</li>
                </ol>
              </div>

              {/* Footer Kontak */}
              <div className="border-t-2 border-emerald-800 pt-4 text-center mt-auto">
                <p className="font-bold text-emerald-900 mb-1">LAYANAN KONTAK & INFORMASI</p>
                <p className="text-xs font-semibold text-gray-600">Panitia SPMB {jenjangName}: {getContactNumber(jenjang)}</p>
              </div>
            </div>
            </div>

            {/* Action Buttons Below Exam Card (Only Visible if Verified) */}
            <div className="max-w-4xl mx-auto mt-6 flex flex-col gap-3 print:hidden px-4">
              <button onClick={handlePrint} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-center shadow-md transition-colors flex items-center justify-center gap-2">
                <Download size={20} />
                Download Lembar Peserta Tes
              </button>
              <a href="https://drive.google.com/file/d/1XAXKV3w0kqtLpWqpBc7lLI-uAWyxYfLt/view" target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-center shadow-md transition-colors flex items-center justify-center gap-2">
                <Download size={20} />
                Download Surat Pernyataan
              </a>
              {jenjang === 'Wustho' && (
                <a href="https://chat.whatsapp.com/Lbk3izpCAbE7k8vErvWdbY" target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-center shadow-md transition-colors flex items-center justify-center gap-2">
                  Gabung Grup WA (Khusus Pendaftar Salafiyah Wustho)
                </a>
              )}
              {jenjang === 'Ulya' && (
                <a href="https://chat.whatsapp.com/JePUvLXBVIu4w3D8ain9zo" target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-center shadow-md transition-colors flex items-center justify-center gap-2">
                  Gabung Grup WA (Salafiyah Ulya)
                </a>
              )}
            </div>

          </div>
        )}

      {/* Next Steps Popup (Shown after 6 seconds while waiting for verification) */}
      {showNextStepsPopup && !isVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col max-w-md w-full relative">
            <button 
              onClick={() => setShowNextStepsPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 leading-tight">3 Langkah Penting Setelah Pendaftaran Terverifikasi</h3>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-gray-800">Download Lembar Peserta Tes</p>
                  <p className="text-sm text-gray-500">Akan tersedia di halaman ini setelah diverifikasi.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-gray-800">Download Berkas Persyaratan</p>
                  <p className="text-sm text-gray-500">Termasuk Surat Pernyataan dan dokumen lain.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-semibold text-gray-800">Bergabung Ke Grup Whatsapp</p>
                  <p className="text-sm text-gray-500">Untuk mendapatkan info terbaru SPMB Al-Madina.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowNextStepsPopup(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-12">
      {/* Header Form */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <button onClick={onBack} className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium hidden sm:inline">Batal</span>
          </button>
          <div className="mx-auto text-center font-bold text-gray-800 text-lg">
            Formulir Pendaftaran
          </div>
          <div className="w-10 sm:w-20"></div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 mt-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm font-medium">
              <Save size={14} />
              Draft Tersimpan Otomatis
            </div>
          </div>
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex-1 h-2 mx-1 rounded-full ${step >= i ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-center text-sm font-medium text-emerald-600">
            Langkah {step} dari 5: 
            {step === 1 && " Data Santri"}
            {step === 2 && " Data Pendidikan"}
            {step === 3 && " Data Orang Tua"}
            {step === 4 && " Pratinjau Data"}
            {step === 5 && " Administrasi"}
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={step === 5 ? handleSubmit : handleNextSubmit}>
            
            {/* STEP 1: DATA SANTRI */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">1. Data Calon Santri</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</label>
                  <input required type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Sesuai Akte Kelahiran" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">NIK (16 Digit) *</label>
                  <input required type="text" name="nik" value={formData.nik} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-colors ${errors.nik ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-emerald-500'}`} placeholder="Contoh: 16730..." />
                  {errors.nik && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nik}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tempat Lahir *</label>
                    <input required type="text" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Kota/Kabupaten" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir *</label>
                    <input required type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin *</label>
                    <select required name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                      <option value="" disabled>Pilih...</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Anak Ke- *</label>
                    <input required type="number" name="anakKe" min="1" value={formData.anakKe} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: 1" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DATA PENDIDIKAN */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">2. Data Pendidikan</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Asal Sekolah *</label>
                  <input required type="text" name="asalSekolah" value={formData.asalSekolah} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nama instansi pendidikan sebelumnya" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">NISN (10 Digit) *</label>
                  <input required type="text" name="nisn" value={formData.nisn} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-colors ${errors.nisn ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-emerald-500'}`} placeholder="Contoh: 00987..." />
                  {errors.nisn && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nisn}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun Lulus *</label>
                  <input required type="number" name="tahunLulus" value={formData.tahunLulus} onChange={handleChange} min="2000" max="2100" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: 2026" />
                </div>
              </div>
            )}

            {/* STEP 3: DATA ORANG TUA */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">3. Data Orang Tua / Wali</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Ayah *</label>
                    <input required type="text" name="namaAyah" value={formData.namaAyah} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Ibu *</label>
                    <input required type="text" name="namaIbu" value={formData.namaIbu} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No WhatsApp *</label>
                    <input required type="tel" name="noWhatsapp" value={formData.noWhatsapp} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-colors ${errors.noWhatsapp ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-emerald-500'}`} placeholder="08..." />
                    {errors.noWhatsapp && <p className="text-red-500 text-xs mt-1 font-medium">{errors.noWhatsapp}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan Utama *</label>
                    <select required name="pekerjaanUtama" value={formData.pekerjaanUtama} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                      <option value="" disabled>Pilih pekerjaan...</option>
                      <option value="PNS/ASN">PNS/ASN</option>
                      <option value="TNI">TNI</option>
                      <option value="Polri">Polri</option>
                      <option value="Pegawai BUMN / BUMD">Pegawai BUMN / BUMD</option>
                      <option value="Pejabat Negara">Pejabat Negara</option>
                      <option value="Karyawan Swasta">Karyawan Swasta</option>
                      <option value="Guru / Dosen">Guru / Dosen</option>
                      <option value="Dokter / Bidan / Perawat">Dokter / Bidan / Perawat</option>
                      <option value="Wiraswasta / Pengusaha">Wiraswasta / Pengusaha</option>
                      <option value="Pedagang">Pedagang</option>
                      <option value="Petani">Petani</option>
                      <option value="Buruh">Buruh</option>
                      <option value="Sopir">Sopir</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gaji/Penghasilan Perbulan *</label>
                  <select required name="gajiPerbulan" value={formData.gajiPerbulan} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                    <option value="" disabled>Pilih rentang...</option>
                    <option value="Rp 2.000.000 - Rp 5.000.000">Rp 2.000.000 - Rp 5.000.000</option>
                    <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                    <option value="Lebih dari Rp 10.000.000">&gt; Rp 10.000.000</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap *</label>
                  <textarea required name="alamatLengkap" value={formData.alamatLengkap} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Jalan, RT/RW, Desa/Kelurahan, Kecamatan, Kota/Kabupaten" />
                </div>
              </div>
            )}

            {/* STEP 4: PREVIEW DATA */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">4. Pratinjau Data Isian</h3>
                
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-sm space-y-6">
                  
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">Data Santri</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                      <div className="text-gray-500">Nama Lengkap: <span className="font-semibold text-gray-800 block">{formData.namaLengkap}</span></div>
                      <div className="text-gray-500">NIK: <span className="font-semibold text-gray-800 block">{formData.nik}</span></div>
                      <div className="text-gray-500">Tempat, Tgl Lahir: <span className="font-semibold text-gray-800 block">{formData.tempatLahir}, {formatTanggalIndonesia(formData.tanggalLahir)}</span></div>
                      <div className="text-gray-500">Jenis Kelamin: <span className="font-semibold text-gray-800 block">{formData.jenisKelamin}</span></div>
                      <div className="text-gray-500">Anak Ke-: <span className="font-semibold text-gray-800 block">{formData.anakKe}</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">Data Pendidikan</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                      <div className="text-gray-500">Asal Sekolah: <span className="font-semibold text-gray-800 block">{formData.asalSekolah}</span></div>
                      <div className="text-gray-500">NISN: <span className="font-semibold text-gray-800 block">{formData.nisn}</span></div>
                      <div className="text-gray-500">Tahun Lulus: <span className="font-semibold text-gray-800 block">{formData.tahunLulus}</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">Data Orang Tua</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                      <div className="text-gray-500">Nama Ayah: <span className="font-semibold text-gray-800 block">{formData.namaAyah}</span></div>
                      <div className="text-gray-500">Nama Ibu: <span className="font-semibold text-gray-800 block">{formData.namaIbu}</span></div>
                      <div className="text-gray-500">No WhatsApp: <span className="font-semibold text-gray-800 block">{formData.noWhatsapp}</span></div>
                      <div className="text-gray-500">Pekerjaan Utama: <span className="font-semibold text-gray-800 block">{formData.pekerjaanUtama}</span></div>
                      <div className="text-gray-500 sm:col-span-2">Penghasilan: <span className="font-semibold text-gray-800 block">{formData.gajiPerbulan}</span></div>
                      <div className="text-gray-500 sm:col-span-2">Alamat Lengkap: <span className="font-semibold text-gray-800 block">{formData.alamatLengkap}</span></div>
                    </div>
                  </div>

                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 mt-6 cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
                  <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border ${isAgreed ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'}`}>
                    {isAgreed && <CheckSquare size={14} className="text-white" />}
                  </div>
                  <p className="text-sm text-emerald-800 font-medium select-none">
                    Data yang saya isi sudah benar dan dapat dipertanggungjawabkan.
                  </p>
                </div>

              </div>
            )}

            {/* STEP 5: ADMINISTRASI */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">5. Administrasi & Berkas</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.metodePembayaran === 'Transfer' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-emerald-300'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="metodePembayaran" value="Transfer" checked={formData.metodePembayaran === 'Transfer'} onChange={handleChange} className="w-5 h-5 text-emerald-600" required />
                        <span className="font-bold text-gray-800">Transfer Bank</span>
                      </div>
                    </label>
                    
                    <label className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.metodePembayaran === 'Tunai' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-emerald-300'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="metodePembayaran" value="Tunai" checked={formData.metodePembayaran === 'Tunai'} onChange={handleChange} className="w-5 h-5 text-emerald-600" required />
                        <div>
                          <span className="font-bold text-gray-800 block">Tunai</span>
                          <span className="text-xs text-gray-500">Datang langsung ke pondok</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.metodePembayaran === 'Transfer' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
                      <p className="text-sm text-blue-800 font-medium">Silakan transfer biaya pendaftaran ke Rekening BCA Syariah: <strong>0647777903</strong> a.n Pendidikan Ponpes Al Madina.</p>
                    </div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Bukti Pembayaran *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-3">
                          <Upload size={24} />
                        </div>
                        <span className="text-emerald-600 font-semibold mb-1">Pilih File</span>
                        <span className="text-xs text-gray-500">Format didukung: JPG, PNG, PDF. Maksimal 2MB.</span>
                        {formData.buktiPembayaran && (
                          <span className="mt-3 text-sm text-gray-800 font-medium bg-gray-200 px-3 py-1 rounded-full">
                            File terpilih: {formData.buktiPembayaran.name}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="px-5 md:px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center text-sm md:text-base">
                  <ArrowLeft size={18} className="mr-1 md:mr-2" />
                  Kembali
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button type="submit" disabled={step === 4 && !isAgreed} className="px-5 md:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-xl transition-colors flex items-center shadow-md text-sm md:text-base">
                  Lanjutkan
                  <ArrowRight size={18} className="ml-1 md:ml-2" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="px-5 md:px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors flex items-center shadow-lg text-sm md:text-base">
                  <Save size={18} className="mr-1 md:mr-2" />
                  {isSubmitting ? 'Memeriksa & Mengirim...' : 'Kirim Pendaftaran'}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Duplicate NIK/NISN Error Modal */}
      {showDuplicateError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pendaftaran Ditolak</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Mohon maaf, NIK atau NISN ini sudah terdaftar dan statusnya <strong className="text-emerald-700">Terverifikasi</strong> di sistem kami.
            </p>
            <button 
              onClick={() => setShowDuplicateError(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-11/12">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Memproses Data</h3>
            <p className="text-sm text-gray-500 text-center">Mohon tunggu sebentar, sistem sedang melakukan verifikasi data dan menyimpan pendaftaran Anda...</p>
          </div>
        </div>
      )}
    </div>
  );
}
