const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const regex = /\/\/ Fetch real-time status from Spreadsheet[\s\S]*?setRegistrations\(updatedData\);/g;
content = content.replace(regex, '');
fs.writeFileSync('src/pages/Dashboard.tsx', content);
