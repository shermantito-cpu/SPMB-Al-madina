const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
content = content.replace("import React from 'react';", "import React, { useState } from 'react';\nimport RegistrationInfo from './RegistrationInfo';");

// 2. Add state
content = content.replace("function App() {", "function App() {\n  const [selectedJenjang, setSelectedJenjang] = useState<string | null>(null);\n\n  if (selectedJenjang) {\n    return <RegistrationInfo jenjang={selectedJenjang} onBack={() => setSelectedJenjang(null)} />;\n  }\n");

// 3. Add Daftar buttons to jenjangs
function replaceJenjangButton(id, title, img, iconName) {
  const regex = new RegExp(`{/\\* Jenjang \\d: .*? \\*/}[\\s\\S]*?<button[\\s\\S]*?<h4.*?>(.*?)</h4>[\\s\\S]*?</button>`, 'g');
  // Actually, standard regex might be risky. Let's just do targeted replaces.
}
