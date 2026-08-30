const fs = require('fs');
let content = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf-8');

content = content.replace(
  /return this\.props\.children;/,
  "return (this as any).props.children;"
);

fs.writeFileSync('src/components/ErrorBoundary.tsx', content);
