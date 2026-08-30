const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';",
  "import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';\nimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
