const fs = require('fs');
const path = require('path');

const MAPPING = {
  'AiOutlineFullscreen': 'Maximize2',
  'BiCalendar': 'Calendar',
  'BiChevronDown': 'ChevronDown',
  'BiChevronUp': 'ChevronUp',
  'FaArrowRight': 'ArrowRight',
  'FaCalendarAlt': 'Calendar',
  'FaCheck': 'Check',
  'FaChevronDown': 'ChevronDown',
  'FaChevronRight': 'ChevronRight',
  'FaChevronUp': 'ChevronUp',
  'FaClock': 'Clock',
  'FaCode': 'Code',
  'FaCodeBranch': 'GitBranch',
  'FaCog': 'Settings',
  'FaCopy': 'Copy',
  'FaEnvelope': 'Mail',
  'FaKey': 'Key',
  'FaPaperPlane': 'Send',
  'FaPlay': 'Play',
  'FaPlus': 'Plus',
  'FaRegClone': 'Copy',
  'FaSignOutAlt': 'LogOut',
  'FaSpinner': 'Loader',
  'FaStop': 'Square',
  'FaStoreAlt': 'Store',
  'FaTimes': 'X',
  'FaTrash': 'Trash2',
  'FaUserCircle': 'UserCircle',
  'FiCheck': 'Check',
  'FiChevronDown': 'ChevronDown',
  'FiChevronRight': 'ChevronRight',
  'FiClock': 'Clock',
  'FiCode': 'Code',
  'FiCopy': 'Copy',
  'FiExternalLink': 'ExternalLink',
  'FiLoader': 'Loader',
  'FiMaximize': 'Maximize',
  'FiMinimize': 'Minimize',
  'FiPlus': 'Plus',
  'FiRefreshCw': 'RefreshCw',
  'FiTrash2': 'Trash2',
  'GoGrabber': 'GripVertical',
  'IoClose': 'X',
  'IoCodeOutline': 'Code',
  'IoKeyOutline': 'Key',
  'IoSettingsOutline': 'Settings',
  'IoMdDownload': 'Download',
  'IoMdTime': 'Clock',
  'LuPinOff': 'PinOff',
  'LuWorkflow': 'Workflow',
  'MdAccessTime': 'Clock',
  'MdCheckCircleOutline': 'CheckCircle',
  'MdDeleteOutline': 'Trash2',
  'MdErrorOutline': 'AlertCircle',
  'MdOutlineCancel': 'XCircle',
  'MdOutlineErrorOutline': 'AlertCircle',
  'MdOutlineInput': 'ArrowRightToLine',
  'MdOutlineLockPerson': 'Lock',
  'MdOutlineSpaceDashboard': 'LayoutDashboard',
  'PiFileCssFill': 'FileCode',
  'RiCalendarScheduleLine': 'CalendarClock',
  'TbApi': 'Webhook',
  'TbBraces': 'Braces',
  'TbCloudDataConnection': 'Cloud',
  'TbDatabase': 'Database',
  'TbLayoutDistributeHorizontal': 'Columns',
  'TbPlugConnected': 'Unplug',
  'TbPlugConnectedX': 'Unplug',
  'TbRepeat': 'Repeat',
  'TbWorldWww': 'Globe',
  'VscChevronDown': 'ChevronDown',
  'VscChevronRight': 'ChevronRight',
  'VscClearAll': 'Eraser',
  'VscJson': 'FileJson',
  'VscTerminal': 'Terminal'
};

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

files.forEach(file => {
  if (file.includes('datasourceIcon.jsx')) {
    console.log('Skipping datasourceIcon.jsx');
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  const lucideImports = new Set();

  // Find all react-icons imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/([^'"]+)['"];?\s*/g;
  const matches = [...content.matchAll(importRegex)];

  if (matches.length === 0) return;

  matches.forEach(match => {
    const symbolsStr = match[1];
    const symbols = symbolsStr.split(',').map(s => s.trim()).filter(Boolean);
    const set = match[2];

    const symbolsToRemove = [];
    symbols.forEach(sym => {
      if (MAPPING[sym]) {
        lucideImports.add(MAPPING[sym]);
        symbolsToRemove.push(sym);
        
        // Replace usage
        const usageRegex = new RegExp(`\\b${sym}\\b`, 'g');
        content = content.replace(usageRegex, MAPPING[sym]);
        modified = true;
      }
    });

    if (symbolsToRemove.length === symbols.length) {
      // Remove entire import block
      content = content.replace(match[0], '');
    } else if (symbolsToRemove.length > 0) {
      // Reconstruct import with remaining symbols
      const remainingSymbols = symbols.filter(s => !symbolsToRemove.includes(s));
      const newImport = `import { ${remainingSymbols.join(', ')} } from "react-icons/${set}";\n`;
      content = content.replace(match[0], newImport);
    }
  });

  if (modified && lucideImports.size > 0) {
    // Add lucide-react import
    const lucideImportStr = `import { ${Array.from(lucideImports).sort().join(', ')} } from 'lucide-react';\n`;
    
    // Insert after the first import or at the top
    const firstImportMatch = content.match(/^import\s+.*?from\s+.*?;\r?\n/m);
    if (firstImportMatch) {
      content = content.replace(firstImportMatch[0], firstImportMatch[0] + lucideImportStr);
    } else {
      content = lucideImportStr + content;
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed: ${path.relative(srcDir, file)}`);
  }
});

console.log('Done!');
