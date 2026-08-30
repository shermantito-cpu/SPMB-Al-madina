const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /const confirmMessage = isTerima \? 'Terima pendaftar ini dan buatkan nomor ujian\?' : 'Tolak pendaftar ini\?';\n\s*if \(\!window\.confirm\(confirmMessage\)\) return;/g,
  `// Removed window.confirm since we already use a custom modal for confirmation`
);

// Also remove alert() since it can also be blocked in some iframes, although usually it's just annoying.
// Instead of alert, we'll just let it update the UI.

code = code.replace(
  /alert\(isTerima \? 'Pendaftar berhasil diverifikasi!' : 'Pendaftar ditolak\.'\);/g,
  `console.log(isTerima ? 'Pendaftar berhasil diverifikasi!' : 'Pendaftar ditolak.');`
);

code = code.replace(
  /alert\('Gagal memproses pendaftar: ' \+ err\.message\);/g,
  `console.error('Gagal memproses pendaftar: ' + err.message);`
);


fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
