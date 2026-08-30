const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const regex = /alert\('Pendaftar berhasil diverifikasi!'\);\n      fetchData\(\); \/\/ Refresh data/g;
const replacement = `alert('Pendaftar berhasil diverifikasi!');
      // Update state locally immediately for instant feedback
      setData(prev => prev.map(item => item.id === id ? { ...item, statusVerifikasi: 'Terverifikasi', nomorPeserta: newNomorPeserta } : item));`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
