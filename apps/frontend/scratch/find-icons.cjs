const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const srcDir = path.join(__dirname, '../src');
console.log('Searching in:', srcDir);
const files = walk(srcDir);
const icons = new Map();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/([^'"]+)['"]/g);
  for (const match of matches) {
    const symbols = match[1].split(',').map(s => s.trim()).filter(Boolean);
    const set = match[2];
    symbols.forEach(sym => {
      const key = `${set}:${sym}`;
      if (!icons.has(key)) {
        icons.set(key, []);
      }
      icons.get(key).push(path.relative(path.join(__dirname, '..'), file));
    });
  }
});

const sortedIcons = Array.from(icons.keys()).sort();
sortedIcons.forEach(key => {
  const [set, sym] = key.split(':');
  console.log(`${set}\t${sym}\t(${icons.get(key).length} files)`);
});
