/**
 * Script to replace raw <button> elements with <Button> from @jet-admin/ui
 * across packages/workflow-nodes, packages/workflow-edges, and packages/json-forms-renderers.
 * 
 * Run with: node migrate_buttons_packages.js
 */
const fs = require('fs');
const path = require('path');

const files = [
  // workflow-nodes
  'packages/workflow-nodes/src/nodes/delayNode.jsx',
  'packages/workflow-nodes/src/nodes/dataQueryNode.jsx',
  'packages/workflow-nodes/src/nodes/conditionNode.jsx',
  'packages/workflow-nodes/src/nodes/startNode.jsx',
  'packages/workflow-nodes/src/nodes/loopNode.jsx',
  'packages/workflow-nodes/src/nodes/javascriptNode.jsx',
  'packages/workflow-nodes/src/nodes/endNode.jsx',
  // workflow-edges
  'packages/workflow-edges/src/edges/DeletableEdge.jsx',
  // json-forms-renderers
  'packages/json-forms-renderers/src/renderers/CustomStringArrayRenderer.jsx',
  'packages/json-forms-renderers/src/renderers/CustomSuggestionInput.jsx',
  'packages/json-forms-renderers/src/renderers/CustomTabRenderer.jsx',
  'packages/json-forms-renderers/src/renderers/CustomSelectInput.jsx',
  'packages/json-forms-renderers/src/renderers/DynamicArgsControl.jsx',
  'packages/json-forms-renderers/src/renderers/CustomKeyValueTypeArrayRenderer.jsx',
  'packages/json-forms-renderers/src/renderers/CustomFieldOperatorValueArrayRenderer.jsx',
  'packages/json-forms-renderers/src/renderers/CustomKeyValueArrayRenderer.jsx',
  'packages/json-forms-renderers/src/renderers/CustomKeyTypeArrayRenderer.jsx',
];

const ROOT = path.resolve(__dirname);

let totalReplacements = 0;

for (const relPath of files) {
  const absPath = path.join(ROOT, relPath);
  if (!fs.existsSync(absPath)) {
    console.log(`SKIP (not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(absPath, 'utf-8');
  const original = content;

  // Step 1: Replace <button with <Button and </button> with </Button>
  const buttonOpenCount = (content.match(/<button[\s>]/g) || []).length;
  
  if (buttonOpenCount === 0) {
    console.log(`SKIP (no buttons): ${relPath}`);
    continue;
  }

  content = content.replace(/<button([\s>])/g, '<Button$1');
  content = content.replace(/<\/button>/g, '</Button>');

  // Step 2: Add import if not already present
  if (!content.includes("from '@jet-admin/ui'") && !content.includes('from "@jet-admin/ui"')) {
    // Find the last import statement and add after it
    const importRegex = /^import\s+.+$/gm;
    let lastImportMatch;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      // handle multi-line imports
      let endIdx = match.index + match[0].length;
      // Check if import continues on the next lines (multi-line import)
      while (content[endIdx] === '\r' || content[endIdx] === '\n') endIdx++;
      lastImportMatch = { index: match.index, end: endIdx, text: match[0] };
    }

    if (lastImportMatch) {
      // Find the end of the last import line (including semicolon and newline)
      let insertPos = content.indexOf('\n', lastImportMatch.index);
      // Handle multi-line imports by finding the semicolon
      let searchFrom = lastImportMatch.index;
      let semiPos = content.indexOf(';', searchFrom);
      if (semiPos > insertPos) {
        insertPos = content.indexOf('\n', semiPos);
      }
      if (insertPos === -1) insertPos = content.length;
      else insertPos += 1; // after the newline
      
      const importLine = "import { Button } from '@jet-admin/ui';\r\n";
      content = content.slice(0, insertPos) + importLine + content.slice(insertPos);
    }
  }

  if (content !== original) {
    fs.writeFileSync(absPath, content, 'utf-8');
    console.log(`UPDATED: ${relPath} (${buttonOpenCount} buttons replaced)`);
    totalReplacements += buttonOpenCount;
  }
}

console.log(`\nTotal: ${totalReplacements} buttons replaced across ${files.length} files.`);
