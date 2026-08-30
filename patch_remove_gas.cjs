const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const regex = /\/\/ Update Spreadsheet[\s\S]*?\} catch\(e\) \{[\s\S]*?console\.warn\("Gagal sinkronisasi ke spreadsheet:", e\);\n      \}/;
content = content.replace(regex, "");

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);

let formContent = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');
const formRegex = /\/\/ 4\. Sinkronisasi ke Spreadsheet \(Background\)[\s\S]*?catch \(e\) \{[\s\S]*?console\.warn\("Gagal sinkronisasi ke spreadsheet:", e\);\n      \}/;
formContent = formContent.replace(formRegex, "");

fs.writeFileSync('src/MultiStepForm.tsx', formContent);
