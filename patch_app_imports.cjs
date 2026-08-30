const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add imports at the top
if (!content.includes("import { collection, query, where, getDocs } from 'firebase/firestore';")) {
  content = content.replace(
    "import { useAuth } from './contexts/AuthContext';",
    "import { useAuth } from './contexts/AuthContext';\nimport { collection, query, where, getDocs } from 'firebase/firestore';\nimport { db } from './lib/firebase';"
  );
}

// Remove dynamic imports inside handleGlobalCheck
content = content.replace(
  "      // Import the needed Firestore functions (make sure they are imported in App.tsx or use window object? Better yet, I'll use a dynamic import to avoid altering the top of the file since I'm patching)\n      const { collection, query, where, getDocs } = await import('firebase/firestore');\n      const { db } = await import('./lib/firebase');",
  ""
);

fs.writeFileSync('src/App.tsx', content);
