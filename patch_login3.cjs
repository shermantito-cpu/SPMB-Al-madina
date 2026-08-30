const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

code = code.replace(
  "if (email === 'Admin$PMB' && password === 'SPMB27') {",
  "if (email === 'Admin$PMB' && password === 'SPMB27') {\\n      localStorage.setItem('isAdminLoggedIn', 'true');"
);

fs.writeFileSync('src/pages/Login.tsx', code);
