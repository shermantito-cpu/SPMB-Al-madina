const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

const regex = /import \{ doc, setDoc, getDocs, collection, query, where \} from 'firebase\/firestore';/;
const replacement = `import { doc, setDoc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore';`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/MultiStepForm.tsx', content);
