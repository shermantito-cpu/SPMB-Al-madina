const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

// replace lines 391-393
content = content.replace(/      reader\.onerror = error => reject\(error\);\n    \}\);\n  \};\n      reader\.onerror = error => reject\(error\);\n    \}\);\n  \};/, 
  "      reader.onerror = error => reject(error);\n    });\n  };");

fs.writeFileSync('src/MultiStepForm.tsx', content);
