import React, { useState } from 'react';
import { VscJson, VscChevronRight, VscChevronDown } from 'react-icons/vsc';
import { FiCopy, FiCheck } from 'react-icons/fi';
import PropTypes from 'prop-types';

import { Button } from "@jet-admin/ui";

/**
 * Collapsible JSON node for rendering nested objects/arrays
 * Standardized for semantic design tokens and dark mode support.
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
    let colorClass = 'text-foreground/80';
    
    if (typeof value === 'string') {
      displayValue = `"${value}"`;
      colorClass = 'text-emerald-500 font-medium';
    } else if (typeof value === 'number') {
      displayValue = String(value);
      colorClass = 'text-amber-500 font-medium';
    } else if (typeof value === 'boolean') {
      displayValue = String(value);
      colorClass = 'text-indigo-500 font-medium';
    } else if (value === null) {
      displayValue = 'null';
      colorClass = 'text-muted-foreground/60 italic';
    } else {
      displayValue = String(value);
    }

    return (
      <div className="flex items-center py-0.5 group" style={{ paddingLeft: `${depth * 16}px` }}>
        {name && (
          <span className="text-blue-500 font-medium mr-1.5">{name}:</span>
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
        className="flex items-center py-0.5 cursor-pointer hover:bg-muted/50 rounded-sm transition-colors group"
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => !isEmpty && setIsExpanded(!isExpanded)}
      >
        {!isEmpty && (
          isExpanded 
            ? <VscChevronDown className="size-3.5 text-muted-foreground shrink-0" />
            : <VscChevronRight className="size-3.5 text-muted-foreground shrink-0" />
        )}
        {isEmpty && <span className="size-3.5 shrink-0" />}
        
        {name && (
          <span className="text-blue-500 font-semibold ml-1 mr-1.5">{name}:</span>
        )}
        
        {isEmpty ? (
          <span className="text-muted-foreground/50 font-mono">{brackets[0]}{brackets[1]}</span>
        ) : !isExpanded ? (
            <span className="text-muted-foreground font-mono">
            {brackets[0]}...{brackets[1]} 
              <span className="text-[10px] text-muted-foreground font-sans ml-2 opacity-60 uppercase tracking-tighter">{typeLabel}</span>
          </span>
        ) : (
              <span className="text-muted-foreground font-mono">
            {brackets[0]}
                <span className="text-[10px] text-muted-foreground font-sans ml-2 opacity-60 uppercase tracking-tighter">{typeLabel}</span>
          </span>
        )}

        {/* Copy button */}
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="icon"
          className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all duration-200"
          title="Copy value"
        >
          {copied ? <FiCheck className="size-3 text-emerald-500" /> : <FiCopy className="size-3" />}
        </Button>
      </div>

      {isExpanded && !isEmpty && (
        <div className="border-l border-border/10 ml-1.5">
          {keys.map((key) => (
            <JsonNode 
              key={key} 
              name={isArray ? undefined : key} 
              value={value[key]} 
              depth={depth + 1} 
            />
          ))}
          <div style={{ paddingLeft: `${depth * 16}px` }} className="text-muted-foreground/50 font-mono py-0.5">
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
 * Standardized for semantic design tokens and dark mode support.
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
    <div className={`flex flex-col bg-background overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <VscJson className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Context</span>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
              <span className="size-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              Live
            </span>
          )}
          {!isEmpty && (
            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">
              {contextKeys.length} {contextKeys.length !== 1 ? 'Variables' : 'Variable'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleCopyAll}
            type='button'
            disabled={isEmpty}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Copy all context"
          >
            {copied ? <FiCheck className="size-3.5 text-emerald-500" /> : <FiCopy className="size-3.5" />}
          </Button>
        </div>
      </div>

      {/* Context tree */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-background/50">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full text-muted-foreground/50 italic text-center px-4">
            <span>No context data yet. Run the workflow to see variables.</span>
          </div>
        ) : (
            <div className="space-y-1">
            {contextKeys.map((key) => (
              <JsonNode key={key} name={key} value={displayContext[key]} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div className="px-4 py-2 bg-muted/20 border-t border-border text-[10px] text-muted-foreground/70 font-medium italic">
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
