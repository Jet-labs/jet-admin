/**
 * Migration script to centralize all UI components into @jet-admin/ui
 * 
 * This script:
 * 1. Copies all UI components from apps/frontend/src/components/ui/ to packages/ui/src/components/
 * 2. Fixes internal imports (cn from @/lib/utils -> ../lib/utils)
 * 3. Generates the barrel index.js with all componentExports
 * 4. Rewrites all frontend imports from @/components/ui/* to @jet-admin/ui
 * 
 * Run with: node centralize_ui.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const SRC_DIR = path.join(ROOT, 'apps/frontend/src/components/ui');
const DEST_DIR = path.join(ROOT, 'packages/ui/src/components');
const FRONTEND_SRC = path.join(ROOT, 'apps/frontend/src');

// ============================================================================
// Step 1: Copy components and fix internal imports
// ============================================================================
console.log('=== Step 1: Copying UI components ===');

const componentFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.jsx'));
console.log(`Found ${componentFiles.length} component files`);

// Ensure dest dir exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

for (const file of componentFiles) {
  const srcPath = path.join(SRC_DIR, file);
  const destPath = path.join(DEST_DIR, file);
  
  let content = fs.readFileSync(srcPath, 'utf-8');
  
  // Fix cn import: @/lib/utils -> ../lib/utils
  content = content.replace(/from\s+["']@\/lib\/utils["']/g, 'from "../lib/utils"');
  
  fs.writeFileSync(destPath, content, 'utf-8');
  console.log(`  Copied: ${file}`);
}

// ============================================================================
// Step 2: Generate barrel index.js
// ============================================================================
console.log('\n=== Step 2: Generating barrel index.js ===');

// Build export map: parse each component file for exported names
const componentExports = [];

for (const file of componentFiles) {
  const filePath = path.join(DEST_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const baseName = file.replace('.jsx', '');
  
  // Find all exported const/function names
  const exportedNames = [];
  
  // Match: export const Name or export function Name
  const directExports = content.matchAll(/export\s+(?:const|function)\s+(\w+)/g);
  for (const m of directExports) {
    exportedNames.push(m[1]);
  }
  
  // Match: export { Name1, Name2 }
  const namedExports = content.matchAll(/export\s*\{\s*([^}]+)\}/g);
  for (const m of namedExports) {
    const names = m[1].split(',').map(n => n.trim()).filter(n => n && !n.includes(' as '));
    exportedNames.push(...names);
    // Also handle "Name as Alias" patterns
    const aliasMatches = m[1].matchAll(/(\w+)\s+as\s+(\w+)/g);
    for (const am of aliasMatches) {
      exportedNames.push(am[2]); // use the alias
    }
  }
  
  if (exportedNames.length > 0) {
    // Deduplicate
    const uniqueNames = [...new Set(exportedNames)];
    componentExports.push({
      file: baseName,
      names: uniqueNames,
    });
    console.log(`  ${baseName}: ${uniqueNames.join(', ')}`);
  } else {
    console.log(`  ${baseName}: (no named componentExports found, skipping)`);
  }
}

// Generate index.js content
let indexContent = "// Auto-generated barrel file for @jet-admin/ui\n";
indexContent += "// Do not edit manually - regenerate with centralize_ui.js\n\n";

// Always export cn utility
indexContent += "export { cn } from './lib/utils';\n\n";

for (const exp of componentExports) {
  indexContent += `export { ${exp.names.join(', ')} } from './components/${exp.file}';\n`;
}

const indexPath = path.join(ROOT, 'packages/ui/src/index.js');
fs.writeFileSync(indexPath, indexContent, 'utf-8');
console.log(`\nGenerated index.js with ${componentExports.reduce((s, e) => s + e.names.length, 0)} componentExports`);

// ============================================================================
// Step 3: Rewrite frontend imports
// ============================================================================
console.log('\n=== Step 3: Rewriting frontend imports ===');

// Build a map of component name -> which file it's from
const componentNameToFile = {};
for (const exp of componentExports) {
  for (const name of exp.names) {
    componentNameToFile[name] = exp.file;
  }
}

// Find all .jsx and .js files in frontend src
function getAllFiles(dir, extensions = ['.jsx', '.js']) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      // Skip node_modules and the ui directory itself
      if (item.name === 'node_modules') continue;
      results.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const frontendFiles = getAllFiles(FRONTEND_SRC);
let totalFilesModified = 0;
let totalImportsRewritten = 0;

for (const filePath of frontendFiles) {
  // Skip files in the components/ui directory itself
  if (filePath.startsWith(SRC_DIR)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // Match imports like:
  // import { Button } from "@/components/ui/button"
  // import { Dialog, DialogContent } from "@/components/ui/dialog"
  // import { Button, buttonVariants } from '@/components/ui/button'
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*["']@\/components\/ui\/[^"']+["'];?\r?\n?/g;
  
  const matches = [...content.matchAll(importRegex)];
  if (matches.length === 0) continue;
  
  // Collect all imported names from @/components/ui/*
  const allImportedNames = new Set();
  
  for (const match of matches) {
    const names = match[1].split(',').map(n => n.trim()).filter(n => n);
    names.forEach(n => allImportedNames.add(n));
  }
  
  // Remove all old imports
  content = content.replace(importRegex, '');
  
  // Add single consolidated import from @jet-admin/ui
  if (allImportedNames.size > 0) {
    const sortedNames = [...allImportedNames].sort();
    const newImport = `import { ${sortedNames.join(', ')} } from "@jet-admin/ui";\n`;
    
    // Find the first import statement and insert before or after it
    const firstImportIdx = content.search(/^import\s/m);
    if (firstImportIdx !== -1) {
      // Find the end of the last import block to insert there
      let lastImportEnd = 0;
      const importLines = content.matchAll(/^import\s.+$/gm);
      for (const m of importLines) {
        const lineEnd = m.index + m[0].length;
        if (lineEnd > lastImportEnd) lastImportEnd = lineEnd;
      }
      // Handle semicolons on next line
      while (content[lastImportEnd] === '\r' || content[lastImportEnd] === '\n') lastImportEnd++;
      
      content = content.slice(0, lastImportEnd) + newImport + content.slice(lastImportEnd);
    } else {
      // No existing imports, add at top
      content = newImport + content;
    }
  }
  
  // Clean up any double blank lines created by removal
  content = content.replace(/\n{3,}/g, '\n\n');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    const relPath = path.relative(ROOT, filePath);
    console.log(`  Updated: ${relPath} (${allImportedNames.size} imports consolidated)`);
    totalFilesModified++;
    totalImportsRewritten += allImportedNames.size;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Components copied: ${componentFiles.length}`);
console.log(`Frontend files modified: ${totalFilesModified}`);
console.log(`Total imports rewritten: ${totalImportsRewritten}`);
console.log(`\nNext steps:`);
console.log(`1. Delete apps/frontend/src/components/ui/ directory`);
console.log(`2. Run: npm run build in packages/ui`);
console.log(`3. Verify: npm run build in apps/frontend`);
