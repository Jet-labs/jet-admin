const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'packages', 'datasource-types', 'src');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === 'queryConfig.json') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/"args"\s*:/g, '"inputDefinitions":');
      content = content.replace(/"#\/properties\/args"/g, '"#/properties/inputDefinitions"');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${fullPath}`);
    }
  }
}

processDir(srcDir);
