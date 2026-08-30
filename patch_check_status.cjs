const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

const regex = /const GAS_URL = "https:\/\/script\.google\.com\/macros\/s\/AKfycbwyRnmLIF4gZAvhaKmmr2CW_RsApM6Bgv8TxxIOPXfRyvEYXJN18Ho_E-xNt9np8IDKxw\/exec"; \s+const response = await fetch\(\`\$\{GAS_URL\}\?action=checkStatus&nomorRegistrasi=\$\{inputRegNumber\}\`\);\s+const result = await response\.json\(\);/;

const replacement = `const q = query(collection(db, 'public_registrations'), where('nomorRegistrasi', '==', inputRegNumber));
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.empty ? { found: false } : { found: true, statusVerifikasi: querySnapshot.docs[0].data().statusVerifikasi, data: querySnapshot.docs[0].data() };`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/MultiStepForm.tsx', content);
