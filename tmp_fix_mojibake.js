const fs = require('fs');
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node tmp_fix_mojibake.js <file1> <file2> ...');
  process.exit(1);
}
files.forEach((file) => {
  const data = fs.readFileSync(file, 'utf8');
  const fixed = Buffer.from(data, 'latin1').toString('utf8');
  fs.writeFileSync(file, fixed, 'utf8');
  console.log('fixed', file);
});
