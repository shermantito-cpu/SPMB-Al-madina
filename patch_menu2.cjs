const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /const handleExportExcel = \(\) => \{[\s\S]*?const excelData = verifiedData\.map\(item => \(\{/,
  `const handleExportExcel = (jenjangToExport: string) => {
    let dataToExport = data.filter(d => (d.statusVerifikasi || '').toLowerCase().includes('terverifikasi'));
    if (jenjangToExport !== 'Semua') {
      dataToExport = dataToExport.filter(d => (d.jenjangName || d.jenjang || '').toLowerCase().includes(jenjangToExport.toLowerCase()));
    }

    // Menyiapkan data dengan urutan kolom sesuai permintaan
    const excelData = dataToExport.map(item => ({`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
