const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

// 1. Add Download import
code = code.replace(
  /import \{ ArrowLeft, /g,
  `import { Download, ArrowLeft, `
);

// 2. Add Export function
code = code.replace(
  /const getCountByJenjang = \(j: string\) => data\.filter\(d => \(d\.jenjangName \|\| d\.jenjang \|\| ''\)\.toLowerCase\(\)\.includes\(j\.toLowerCase\(\)\) && \(d\.statusVerifikasi \|\| ''\)\.toLowerCase\(\)\.includes\('terverifikasi'\)\)\.length;/,
  `const getCountByJenjang = (j: string) => data.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(j.toLowerCase()) && (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi')).length;

  const handleExportCSV = () => {
    const headers = [
      'Nomor Peserta',
      'Nomor Registrasi',
      'Nama Lengkap',
      'Jenjang',
      'NIK',
      'NISN',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Jenis Kelamin',
      'Anak Ke',
      'Asal Sekolah',
      'Tahun Lulus',
      'Nama Ayah',
      'Nama Ibu',
      'No. WhatsApp',
      'Pekerjaan Utama',
      'Gaji Perbulan',
      'Alamat Lengkap',
      'Metode Pembayaran',
      'Status Verifikasi',
      'Tanggal Daftar'
    ];

    const escapeCSV = (str: any) => {
      if (str === null || str === undefined) return '';
      const s = String(str).replace(/"/g, '""');
      if (s.search(/("|,|\\n)/g) >= 0) {
        return \`"\${s}"\`;
      }
      return s;
    };

    const rows = verifiedData.map(item => [
      escapeCSV(item.nomorPeserta),
      escapeCSV(item.nomorRegistrasi),
      escapeCSV(item.namaLengkap),
      escapeCSV(item.jenjangName || item.jenjang),
      escapeCSV(item.nik),
      escapeCSV(item.nisn),
      escapeCSV(item.tempatLahir),
      escapeCSV(item.tanggalLahir),
      escapeCSV(item.jenisKelamin),
      escapeCSV(item.anakKe),
      escapeCSV(item.asalSekolah),
      escapeCSV(item.tahunLulus),
      escapeCSV(item.namaAyah),
      escapeCSV(item.namaIbu),
      escapeCSV(item.noWhatsapp || item.noWA),
      escapeCSV(item.pekerjaanUtama),
      escapeCSV(item.gajiPerbulan),
      escapeCSV(item.alamatLengkap),
      escapeCSV(item.metodePembayaran),
      escapeCSV(item.statusVerifikasi),
      escapeCSV(item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', \`Data_Pendaftar_Terverifikasi_\${new Date().getTime()}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`
);

// 3. Add Export button
code = code.replace(
  /<h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">\s*<CheckCircle size=\{20\} className="text-emerald-500" \/> Pendaftar Terverifikasi\s*<\/h3>/,
  `<h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" /> Pendaftar Terverifikasi
            </h3>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <Download size={14} /> Download Excel (CSV)
            </button>`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
