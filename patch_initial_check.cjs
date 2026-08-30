const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

// Replace performCheck
content = content.replace(/const performCheck = async \(\) => \{[\s\S]*?(?=\s*performCheck\(\);)/, `const performCheck = async () => {
        setCheckLoading(true);
        setCheckMessage('');
        try {
          const q = query(collection(db, 'public_registrations'), where('nomorRegistrasi', '==', initialRegNumber));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const resultData = querySnapshot.docs[0].data();
            if (resultData.statusVerifikasi === 'Terverifikasi' || resultData.statusVerifikasi?.toLowerCase().includes('terverifikasi')) {
              setFormData(prev => ({
                ...prev,
                namaLengkap: resultData.namaLengkap || prev.namaLengkap,
                tempatLahir: resultData.tempatLahir || prev.tempatLahir,
                tanggalLahir: resultData.tanggalLahir || prev.tanggalLahir,
                asalSekolah: resultData.asalSekolah || prev.asalSekolah,
                nisn: resultData.nisn?.toString().replace(/^'/, '') || prev.nisn,
                namaAyah: resultData.namaAyah || prev.namaAyah,
                namaIbu: resultData.namaIbu || prev.namaIbu,
              }));
              setIsVerified(true);
              setNomorPeserta(resultData.nomorPeserta || '-');
              setCheckMessage('Status: Terverifikasi. Silakan cetak Lembar Peserta Tes Anda.');
            } else {
              setIsVerified(false);
              setCheckMessage(\`Status: \${resultData.statusVerifikasi || 'Menunggu Verifikasi'}. Berkas Anda sedang dalam pengecekan.\`);
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
      `);
fs.writeFileSync('src/MultiStepForm.tsx', content);
