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
  let originalContent = content;

  // Remove frontend and backend placeholders
  const frontendRegex = /\n\n!\[.*?\]\(\/img\/placeholder-frontend\.png\)\n\n/g;
  const backendRegex = /\n\n!\[.*?\]\(\/img\/placeholder-backend\.png\)\n\n/g;
  content = content.replace(frontendRegex, '');
  content = content.replace(backendRegex, '');
  
  // also check without newlines just in case
  const frontendRegex2 = /!\[.*?\]\(\/img\/placeholder-frontend\.png\)/g;
  const backendRegex2 = /!\[.*?\]\(\/img\/placeholder-backend\.png\)/g;
  content = content.replace(frontendRegex2, '');
  content = content.replace(backendRegex2, '');

  // Rename overview placeholders
  const overviewRegex = /!\[(.*?)\]\(\/img\/placeholder-overview\.png\)/g;
  if (overviewRegex.test(content)) {
    // get parent directory name
    const parentDir = path.basename(path.dirname(filePath));
    content = content.replace(overviewRegex, `![$1](/img/placeholder-${parentDir}-overview.png)`);
  }

  // Rename index placeholders since they act like overview
  const indexRegex = /!\[(.*?)\]\(\/img\/placeholder-index\.png\)/g;
  if (indexRegex.test(content)) {
    const parentDir = path.basename(path.dirname(filePath));
    content = content.replace(indexRegex, `![$1](/img/placeholder-${parentDir}-index.png)`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

processDirectory(path.join(__dirname, 'docs', 'docs', 'features'));
console.log('Finished processing placeholders.');
