const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /'Jenjang': item.jenjangName \|\| item.jenjang \|\| '',\n      'NIK': item.nik \|\| '',/g,
  `'NIK': item.nik || '',`
);

code = code.replace(
  /\{ wch: 15 \}, \/\/ Jenjang\n      \{ wch: 20 \}, \/\/ NIK/g,
  `{ wch: 20 }, // NIK`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
