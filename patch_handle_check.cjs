const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

const regex = /if \(result\.statusVerifikasi === 'Terverifikasi' \|\| result\.statusVerifikasi\?\.toLowerCase\(\)\.includes\('terverifikasi'\)\) \{[\s\S]*?\} else \{[\s\S]*?setCheckMessage\("Pendaftaran Masih Menunggu Verifikasi"\);\n        \}/;

const replacement = `setFormData(prev => ({
            ...prev,
            namaLengkap: result.data.namaLengkap || prev.namaLengkap,
            tempatLahir: result.data.tempatLahir || prev.tempatLahir,
            tanggalLahir: result.data.tanggalLahir || prev.tanggalLahir,
            asalSekolah: result.data.asalSekolah || prev.asalSekolah,
            nisn: result.data.nisn?.toString().replace(/^'/, '') || prev.nisn,
            namaAyah: result.data.namaAyah || prev.namaAyah,
            namaIbu: result.data.namaIbu || prev.namaIbu,
          }));
          setNomorRegistrasi(result.data.nomorRegistrasi);
          setIsSubmitted(true);
          setIsCheckingFormVisible(false);

          if (result.statusVerifikasi === 'Terverifikasi' || result.statusVerifikasi?.toLowerCase().includes('terverifikasi')) {
            setNomorPeserta(result.data.nomorPeserta || \`PMB-2027-\${Math.floor(1000 + Math.random() * 9000)}\`);
            setIsVerified(true);
          } else {
            setIsVerified(false);
          }`;

content = content.replace(regex, replacement);

const regex2 = /if \(resultData\.statusVerifikasi === 'Terverifikasi' \|\| resultData\.statusVerifikasi\?\.toLowerCase\(\)\.includes\('terverifikasi'\)\) \{[\s\S]*?\} else \{[\s\S]*?setIsVerified\(false\);\n              setCheckMessage\(\`Status: \$\{resultData\.statusVerifikasi \|\| 'Menunggu Verifikasi'\}\. Berkas Anda sedang dalam pengecekan\.\`\);\n            \}/;

const replacement2 = `setFormData(prev => ({
                ...prev,
                namaLengkap: resultData.namaLengkap || prev.namaLengkap,
                tempatLahir: resultData.tempatLahir || prev.tempatLahir,
                tanggalLahir: resultData.tanggalLahir || prev.tanggalLahir,
                asalSekolah: resultData.asalSekolah || prev.asalSekolah,
                nisn: resultData.nisn?.toString().replace(/^'/, '') || prev.nisn,
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
                setCheckMessage(\`Status: \${resultData.statusVerifikasi || 'Menunggu Verifikasi'}. Berkas Anda sedang dalam pengecekan.\`);
              }`;

content = content.replace(regex2, replacement2);

fs.writeFileSync('src/MultiStepForm.tsx', content);
