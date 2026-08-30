const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /XLSX\.writeFile\(wb, \`Data_Pendaftar_Terverifikasi_\$\{new Date\(\)\.getTime\(\)\}\.xlsx\`\);/,
  `const fileName = jenjangToExport === 'Semua' ? 'Semua_Jenjang' : jenjangToExport.replace('/', '_');\n    XLSX.writeFile(wb, \`Data_Pendaftar_Terverifikasi_\${fileName}_\${new Date().getTime()}.xlsx\`);`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
