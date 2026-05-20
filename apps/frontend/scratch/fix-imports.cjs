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
const files = walk(srcDir);

const PREFIXES = {
  'fa': 'Fa',
  'fi': 'Fi',
  'md': 'Md',
  'io': 'Io',
  'tb': 'Tb',
  'vsc': 'Vsc',
  'si': 'Si',
  'bi': 'Bi',
  'pi': 'Pi',
  'go': 'Go',
  'ai': 'Ai',
  'lu': 'Lu',
  'ri': 'Ri',
  'fa6': 'Fa'
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/([^'"]+)['"];?\s*/g;
  const matches = [...content.matchAll(importRegex)];

  matches.forEach(match => {
    const symbolsStr = match[1];
    const symbols = symbolsStr.split(',').map(s => s.trim()).filter(Boolean);
    const set = match[2];
    const expectedPrefix = PREFIXES[set] || '';

    const corruptedSymbols = [];
    symbols.forEach(sym => {
      if (!sym.startsWith(expectedPrefix)) {
        corruptedSymbols.push(sym);
      }
    });

    if (corruptedSymbols.length > 0) {
      const remainingSymbols = symbols.filter(s => !corruptedSymbols.includes(s));
      if (remainingSymbols.length === 0) {
        // Remove line
        content = content.replace(match[0], '');
      } else {
        // Reconstruct
        const newImport = `import { ${remainingSymbols.join(', ')} } from "react-icons/${set}";\n`;
        content = content.replace(match[0], newImport);
      }
      modified = true;
      console.log(`Fixed import in ${path.relative(srcDir, file)}: removed ${corruptedSymbols.join(', ')}`);
    }
  });

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Done!');
