import React, { useState } from 'react';
import { VscJson, VscChevronRight, VscChevronDown } from 'react-icons/vsc';
import { FiCopy, FiCheck } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * Collapsible JSON node for rendering nested objects/arrays
 * Uses light theme styling
 */
const JsonNode = ({ name, value, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value).length === 0;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Render primitive values
  if (!isObject) {
    let displayValue;
    let colorClass = 'text-slate-700';
    
    if (typeof value === 'string') {
      displayValue = `"${value}"`;
      colorClass = 'text-emerald-600';
    } else if (typeof value === 'number') {
      displayValue = String(value);
      colorClass = 'text-amber-600';
    } else if (typeof value === 'boolean') {
      displayValue = String(value);
      colorClass = 'text-purple-600';
    } else if (value === null) {
      displayValue = 'null';
      colorClass = 'text-slate-400';
    } else {
      displayValue = String(value);
    }

    return (
      <div className="flex items-center py-0.5" style={{ paddingLeft: `${depth * 16}px` }}>
        {name && (
          <span className="text-blue-600 mr-1">{name}:</span>
        )}
        <span className={colorClass}>{displayValue}</span>
      </div>
    );
  }

  // Render object/array
  const keys = Object.keys(value);
  const brackets = isArray ? ['[', ']'] : ['{', '}'];
  const typeLabel = isArray ? `Array(${keys.length})` : `Object`;

  return (
    <div>
      <div 
        className="flex items-center py-0.5 cursor-pointer hover:bg-slate-100 rounded group"
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => !isEmpty && setIsExpanded(!isExpanded)}
      >
        {!isEmpty && (
          isExpanded 
            ? <VscChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            : <VscChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        {isEmpty && <span className="w-3.5" />}
        
        {name && (
          <span className="text-blue-600 ml-1 mr-1">{name}:</span>
        )}
        
        {isEmpty ? (
          <span className="text-slate-400">{brackets[0]}{brackets[1]}</span>
        ) : !isExpanded ? (
            <span className="text-slate-400">
            {brackets[0]}...{brackets[1]} 
              <span className="text-xs text-slate-400 ml-1">{typeLabel}</span>
          </span>
        ) : (
              <span className="text-slate-400">
            {brackets[0]}
                <span className="text-xs text-slate-400 ml-1">{typeLabel}</span>
          </span>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="ml-2 p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
          title="Copy value"
        >
          {copied ? <FiCheck className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3" />}
        </button>
      </div>

      {isExpanded && !isEmpty && (
        <div>
          {keys.map((key) => (
            <JsonNode 
              key={key} 
              name={isArray ? undefined : key} 
              value={value[key]} 
              depth={depth + 1} 
            />
          ))}
          <div style={{ paddingLeft: `${depth * 16}px` }} className="text-slate-400">
            {brackets[1]}
          </div>
        </div>
      )}
    </div>
  );
};

JsonNode.propTypes = {
  name: PropTypes.string,
  value: PropTypes.any,
  depth: PropTypes.number,
};

/**
 * WorkflowContextPanel - Panel to display workflow context during test runs
 * Uses light theme to match project styling
 */
export const WorkflowContextPanel = ({ 
  context = {}, 
  isRunning = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Filter out internal properties (starting with __)
  const displayContext = Object.entries(context).reduce((acc, [key, value]) => {
    if (!key.startsWith('__')) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const contextKeys = Object.keys(displayContext);
  const isEmpty = contextKeys.length === 0;

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(displayContext, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex flex-col bg-white overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <VscJson className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Context</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
          {!isEmpty && (
            <span className="text-xs text-slate-400">
              ({contextKeys.length} variable{contextKeys.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(
            <button
              onClick={handleCopyAll}
              type='button'
              disabled={isEmpty}
              className="p-1 text-slate-400 bg-white hover:text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center gap-1"
              title="Copy all context"
            >
              {copied ? <FiCheck className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Context tree */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs bg-slate-50/50">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <span>No context data yet. Run the workflow to see variables.</span>
          </div>
        ) : (
          <div className="space-y-0.5">
            {contextKeys.map((key) => (
              <JsonNode key={key} name={key} value={displayContext[key]} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          <span>Context contains results from completed nodes</span>
        </div>
      )}
    </div>
  );
};

WorkflowContextPanel.propTypes = {
  context: PropTypes.object,
  isRunning: PropTypes.bool,
  className: PropTypes.string,
};

export default WorkflowContextPanel;

