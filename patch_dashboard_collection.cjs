const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// Replace query
content = content.replace(/const q = query\(collection\(db, 'users', currentUser\.uid, 'registrations'\), orderBy\('createdAt', 'desc'\)\);/, 
  "const q = query(collection(db, 'public_registrations'), where('uid', '==', currentUser.uid)); // OrderBy requires composite index so we will just sort in memory");

content = content.replace(/const data = querySnapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);/,
  "const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());");

fs.writeFileSync('src/pages/Dashboard.tsx', content);
