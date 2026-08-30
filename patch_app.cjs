const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /onClick=\{[^}]*navigateTo\('login'\)[^}]*\}/,
  `onClick={() => {
                  if (localStorage.getItem('isAdminLoggedIn') === 'true') {
                    navigateTo('admin_dashboard');
                  } else {
                    navigateTo('login');
                  }
                }}`
);

fs.writeFileSync('src/App.tsx', code);
