const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const regex = /const q = query\(collection\(db, 'public_registrations'\), orderBy\('createdAt', 'desc'\)\);/;
const replacement = `const q = query(collection(db, 'public_registrations')); // Fetch all, then sort in memory to avoid missing index errors`;

content = content.replace(regex, replacement);

const regex2 = /const fetchedData = snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);/;
const replacement2 = `const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());`;

content = content.replace(regex2, replacement2);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
