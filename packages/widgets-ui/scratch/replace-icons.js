const fs = require('fs');
const path = require('path');

const mapping = {
  'TbRepeat': 'Repeat',
  'VscDebugDisconnect': 'Ban',
  'IoMdArrowDropright': 'ChevronRight',
  'VscDebugStart': 'Play',
  'IoMdTime': 'Clock',
  'TbRefresh': 'RefreshCw',
  'BiErrorCircle': 'AlertCircle',
  'VscDebugStop': 'Square',
  'FaCheck': 'Check',
  'FaTimes': 'X',
  'FaExclamationTriangle': 'AlertTriangle',
  'FaPlus': 'Plus',
  'FaTrash': 'Trash2',
  'IoMdArrowDropleft': 'ChevronLeft',
  'FaChartBar': 'BarChart',
  'MdOutlineSmartButton': 'Component',
  'MdOutlineTableChart': 'Table',
  'FiAlertTriangle': 'AlertTriangle',
  'FiSettings': 'Settings',
  'FiX': 'X',
  'FiCode': 'Code',
  'FiChevronDown': 'ChevronDown',
  'FiChevronRight': 'ChevronRight',
  'FiDatabase': 'Database',
  'MdOutlineAutoGraph': 'TrendingUp',
  'FiCopy': 'Copy',
  'FiCheck': 'Check',
  'BiGitMerge': 'GitMerge',
  'MdInput': 'ArrowRightToLine',
  'MdOutput': 'ArrowRightFromLine',
  'FaCode': 'Code',
  'FaChartLine': 'LineChart',
  'FaChartPie': 'PieChart',
  'BiScatterChart': 'ScatterChart',
  'MdChevronLeft': 'ChevronLeft',
  'MdChevronRight': 'ChevronRight',
  'MdFirstPage': 'ChevronsLeft',
  'MdLastPage': 'ChevronsRight',
  'FaJs': 'FileCode'
};

const files = [
  'packages/workflow-nodes/src/nodes/loopNode.jsx',
  'packages/workflow-nodes/src/nodes/startNode.jsx',
  'packages/workflow-nodes/src/nodes/javascriptNode.jsx',
  'packages/workflow-nodes/src/nodes/endNode.jsx',
  'packages/workflow-nodes/src/StatusIndicator.jsx',
  'packages/widgets-ui/src/widget.map.js',
  'packages/widgets-ui/src/vega/vegaConfigEditor.jsx',
  'packages/widgets-ui/src/vega/variablePathPicker.jsx',
  'packages/widgets-ui/src/vega/shelfBuilder.jsx',
  'packages/widgets-ui/src/vega/variableExplorer.jsx',
  'packages/widgets-ui/src/vega/dataFieldPanel.jsx',
  'packages/widgets-ui/src/vega/vegaSpecEditor.jsx',
  'packages/widgets-ui/src/table/tableWidget.jsx'
];

files.forEach(file => {
  const filePath = path.resolve(__dirname, '../../..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let usedLucideIcons = [];

  // Replace component names and collect used Lucide icons
  Object.entries(mapping).forEach(([reactIcon, lucideIcon]) => {
    if (content.includes(reactIcon)) {
      content = content.replace(new RegExp(reactIcon, 'g'), lucideIcon);
      if (!usedLucideIcons.includes(lucideIcon)) {
        usedLucideIcons.push(lucideIcon);
      }
    }
  });

  // Remove react-icons imports
  content = content.replace(/^import\s+.*?from\s+['"]react-icons\/.*?['"];?\r?\n/gm, '');

  // Add lucide-react import if icons were used
  if (usedLucideIcons.length > 0) {
    const importStatement = `import { ${usedLucideIcons.join(', ')} } from 'lucide-react';\n`;
    // Insert after the last import or at the top
    const lastImportIndex = content.lastIndexOf('import');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
    } else {
      content = importStatement + content;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${file}`);
});
