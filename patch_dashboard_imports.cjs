const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

content = content.replace(
  /import \{ collection, query, getDocs, orderBy \} from 'firebase\/firestore';/,
  "import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';"
);

content = content.replace(
  /const data = querySnapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\)\.sort\(\(a,b\) => new Date\(b\.createdAt\)\.getTime\(\) - new Date\(a\.createdAt\)\.getTime\(\)\);/,
  "const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());"
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
