const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/pipelines/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('"') || l.includes("'")) {
    console.log((i+1) + ': ' + l.trim());
  }
});
