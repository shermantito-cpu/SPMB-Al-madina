const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "const [verifyingUser, setVerifyingUser] = useState<any>(null);",
  "const [verifyingUser, setVerifyingUser] = useState<any>(null);\n  const [chartPeriod, setChartPeriod] = useState('Keseluruhan'); // 'Harian', 'Pekanan', 'Keseluruhan'"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
