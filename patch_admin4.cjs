const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /onClick=\{onLogout\}/,
  `onClick={() => { localStorage.removeItem('isAdminLoggedIn'); onLogout(); }}`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
