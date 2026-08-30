const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

// Replace handleSubmit
content = content.replace(/const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?(?=\s*const handlePrint =)/, `const handleSubmit = async (e: React.FormEvent) => {
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
        const docRef = doc(db, 'public_registrations', foundDuplicateRegNumber);
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
    const newNomorRegistrasi = \`REG-\${currentYear}-\${randomDigits}\`;
    setNomorRegistrasi(newNomorRegistrasi);
    
    try {
      // 1. Convert file to Base64 (jika ada bukti pembayaran)
      let buktiBase64 = '';
      if (formData.buktiPembayaran) {
        // Kita simpan dalam base64 di Firestore saja untuk kesederhanaan saat ini (jika < 1MB)
        // Atau idealnya bisa diupload ke Firebase Storage
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
      
      setStep(6);
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  `);
fs.writeFileSync('src/MultiStepForm.tsx', content);
