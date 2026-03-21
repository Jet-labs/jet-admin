const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.md')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if it already has a placeholder image right below the first H1
  // Or just has any image at all (like we added manually in the new files)
  if (content.includes('![') && content.includes('/img/placeholder-')) {
    return;
  }

  // Find the first H1 (# Title)
  const lines = content.split('\n');
  let h1Index = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('# ')) {
      h1Index = i;
      break;
    }
  }

  // If we found an H1 and the next few lines don't contain an image
  if (h1Index !== -1) {
    // Check next few lines
    let hasImage = false;
    for (let i = h1Index + 1; i < Math.min(h1Index + 5, lines.length); i++) {
      if (lines[i].includes('![')) {
        hasImage = true;
        break;
      }
    }

    if (!hasImage) {
      const featureName = path.basename(filePath, '.md');
      const placeholderLine = `\n\n![Placeholder for Demo](/img/placeholder-${featureName}.png)\n\n`;
      lines.splice(h1Index + 1, 0, placeholderLine);
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Added placeholder to ${filePath}`);
    }
  }
}

processDirectory(path.join(__dirname, 'docs', 'docs', 'features'));
console.log('Finished processing.');
