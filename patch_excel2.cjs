const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /'Tanggal Daftar': item.createdAt \? new Date\(item\.createdAt\)\.toLocaleString\('id-ID'\) : '',\n      'Nomor Peserta': item.nomorPeserta \|\| '',/g,
  `'Tanggal Daftar': item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '',`
);

// We need to update the colWidths as well to remove the Nomor Peserta width
code = code.replace(
  /\{ wch: 20 \}, \/\/ Tanggal Daftar\n      \{ wch: 18 \}, \/\/ Nomor Peserta/g,
  `{ wch: 20 }, // Tanggal Daftar`
);


fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
