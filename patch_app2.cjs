const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<AdminDashboard onLogout=\{\(\) => navigateTo\('home'\)\} \/>/,
  `<AdminDashboard onLogout={() => navigateTo('home')} onGoHome={() => navigateTo('home')} />`
);

fs.writeFileSync('src/App.tsx', code);
