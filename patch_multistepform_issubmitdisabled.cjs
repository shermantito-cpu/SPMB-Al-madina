const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

content = content.replace(/disabled=\{isSubmitDisabled\}/g, "disabled={isSubmitting}");

fs.writeFileSync('src/MultiStepForm.tsx', content);
