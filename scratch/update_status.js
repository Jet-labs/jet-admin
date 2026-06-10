const fs = require('fs');
const filePath = 'd:/PROJECTS/PERSONAL/jet-admin/packages/workflow-nodes/src/StatusIndicator.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/bg-blue-500 rounded-full/g, 'bg-primary rounded-full');
content = content.replace(/bg-green-500 rounded-full/g, 'bg-primary rounded-full');
content = content.replace(/bg-red-500 rounded-full/g, 'bg-primary rounded-full');

content = content.replace(/className="w-3 h-3 text-white"/g, 'className="w-3 h-3 text-foreground"');
content = content.replace(/className="w-5 h-5 text-white"/g, 'className="w-5 h-5 text-foreground"');

fs.writeFileSync(filePath, content);
console.log('Updated StatusIndicator.jsx');
