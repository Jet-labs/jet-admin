const fs = require('fs');
const path = require('path');
const dir = 'd:/PROJECTS/PERSONAL/jet-admin/packages/workflow-nodes/src/nodes';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes('bg-blue-500 rounded-full')) {
    content = content.replace(/bg-blue-500 rounded-full/g, 'bg-primary rounded-full');
    changed = true;
  }
  if (content.includes('bg-green-500 rounded-full')) {
    content = content.replace(/bg-green-500 rounded-full/g, 'bg-primary rounded-full');
    changed = true;
  }
  if (content.includes('bg-red-500 rounded-full')) {
    content = content.replace(/bg-red-500 rounded-full/g, 'bg-primary rounded-full');
    changed = true;
  }
  
  if (changed && content.includes('text-white')) {
    content = content.replace(/className="w-3 h-3 text-white"/g, 'className="w-3 h-3 text-foreground"');
    content = content.replace(/className="w-5 h-5 text-white"/g, 'className="w-5 h-5 text-foreground"');
  }

  const buttonRegex = /className="px-3 py-1\.5 text-sm text-[a-zA-Z-]+ bg-\[#646cff\] rounded-sm hover:bg-\[#5558dd\] focus:ring-4 focus:outline-none focus:ring-\[#646cff\]\/30"/g;
  if (buttonRegex.test(content)) {
    content = content.replace(buttonRegex, 'className="w-full"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
}
