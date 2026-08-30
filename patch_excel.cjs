const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

// Add XLSX import
if (!code.includes("import * as XLSX")) {
    code = code.replace(
        /import React, \{ useState, useEffect \} from 'react';/,
        `import React, { useState, useEffect } from 'react';\nimport * as XLSX from 'xlsx';`
    );
}

// Replace handleExportCSV with handleExportExcel
code = code.replace(
  /const handleExportCSV = \(\) => \{[\s\S]*?document\.body\.removeChild\(link\);\n  \};/,
  `const handleExportExcel = () => {
    // Menyiapkan data dengan urutan kolom sesuai permintaan
    const excelData = verifiedData.map(item => ({
      'Tanggal Daftar': item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '',
      'Nomor Peserta': item.nomorPeserta || '',
      'Nomor Registrasi': item.nomorRegistrasi || '',
      'Nama Lengkap': item.namaLengkap || '',
      'Jenjang': item.jenjangName || item.jenjang || '',
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
      { wch: 20 }, // Tanggal Daftar
      { wch: 18 }, // Nomor Peserta
      { wch: 18 }, // Nomor Registrasi
      { wch: 25 }, // Nama Lengkap
      { wch: 15 }, // Jenjang
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
    XLSX.utils.book_append_sheet(wb, ws, "Data Pendaftar");

    // Menyimpan dan mengunduh file Excel
    XLSX.writeFile(wb, \`Data_Pendaftar_Terverifikasi_\${new Date().getTime()}.xlsx\`);
  };`
);

// Replace button onClick and label
code = code.replace(
  /onClick=\{handleExportCSV\}\s*className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"\s*>\s*<Download size=\{14\} \/> Download Excel \(CSV\)/g,
  `onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <Download size={14} /> Download Excel (.xlsx)`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
