const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');
content = content.replace(
  /new Date\(b\.createdAt\)\.getTime\(\) - new Date\(a\.createdAt\)\.getTime\(\)/,
  "(b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)"
);
fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
