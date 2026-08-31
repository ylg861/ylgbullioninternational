const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('á€') || line.includes('â') || line.includes('Â©')) {
      if (!found) {
        console.log('---', file);
        found = true;
      }
      console.log(i + 1, line);
    }
  }
  if (found) console.log();
}
