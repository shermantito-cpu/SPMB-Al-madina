const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

const regex = /const fileToBase64 = \(file: File\): Promise<string> => \{[\s\S]*?\n\s*\};/;
const replacement = `const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString() || '');
      reader.onerror = error => reject(error);
    });
  };`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/MultiStepForm.tsx', content);
