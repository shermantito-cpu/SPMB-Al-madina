const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /const \[filterJenjang, setFilterJenjang\] = useState\('Semua'\);/,
  `const [filterJenjang, setFilterJenjang] = useState('Semua');\n  const [showDownloadMenu, setShowDownloadMenu] = useState(false);`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
