const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

content = content.replace(/setStep\(6\);/g, "setIsSubmitted(true);");

fs.writeFileSync('src/MultiStepForm.tsx', content);
