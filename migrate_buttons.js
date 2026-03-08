const fs = require('fs');
const path = require('path');

const directory = 'apps/frontend/src';

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const allJsx = walkSync(directory);

let modifiedCount = 0;
for (const file of allJsx) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Check if file has any raw buttons
  const hasRawButton = /<button[\s>]/g.test(content) || /<\/button>/g.test(content);
  
  if (hasRawButton) {
    // Replace <button with <Button and </button> with </Button>
    content = content.replace(/<button([\s>])/g, '<Button$1');
    content = content.replace(/<\/button>/g, '</Button>');
    
    // Add import if not present
    if (!content.includes('import { Button }')) {
      // Find the last import statement
      const importRegex = /^import\s+[\s\S]*?(?:from\s+['"].*?['"]|['"].*?['"]);?/gm;
      let lastIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastIndex = match.index + match[0].length;
      }
      
      const importStatement = '\nimport { Button } from "@/components/ui/button";';
      if (lastIndex > 0) {
        content = content.slice(0, lastIndex) + importStatement + content.slice(lastIndex);
      } else {
        content = importStatement + '\n' + content;
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`Replaced buttons in ${modifiedCount} files.`);
