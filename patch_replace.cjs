const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

content = content.replace(/nisn: resultData\.nisn\?\.toString\(\)\.replace\(\/\^'\/\, ''\) \|\| prev\.nisn,/g, "nisn: (resultData.nisn ? resultData.nisn.toString().replace(/^'/, '') : prev.nisn),");
content = content.replace(/nisn: result\.data\.nisn\?\.toString\(\)\.replace\(\/\^'\/\, ''\) \|\| prev\.nisn,/g, "nisn: (result.data.nisn ? result.data.nisn.toString().replace(/^'/, '') : prev.nisn),");

fs.writeFileSync('src/MultiStepForm.tsx', content);
