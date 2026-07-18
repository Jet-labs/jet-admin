import React, { useState } from 'react';
import { Check, Copy, FileJson } from 'lucide-react';
import PropTypes from 'prop-types';

import { Button, CodeEditor, Label } from "@jet-admin/ui";
import { StringUtils } from "../../../utils/string";

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
  const [isTruncated, setIsTruncated] = useState(true);

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
      <div className="flex items-center justify-between px-3 py-1 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <FileJson className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Context</span>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
              <span className="size-1.5 bg-blue-950/400 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              Live
            </span>
          )}
          {!isEmpty && (
            <span className="text-xs text-muted-foreground/60 font-bold uppercase tracking-wider">
              {contextKeys.length} {contextKeys.length !== 1 ? 'Variables' : 'Variable'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Label className="flex items-center gap-1.5 cursor-pointer" title="Truncate massive arrays/strings to prevent browser freeze">
            <input 
              type="checkbox" 
              checked={isTruncated} 
              onChange={(e) => setIsTruncated(e.target.checked)}
              className="w-3 h-3 accent-primary"
            />
            Truncate
          </Label>
          <Button
            onClick={handleCopyAll}
            type='button'
            disabled={isEmpty}
            variant="ghost"
            size="sm"
            square
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Copy all context"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
      </div>

      {/* Context tree */}
      <div className="flex-1 overflow-hidden bg-background/50">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full text-muted-foreground/50 italic text-center px-4">
            <span>No context data yet. Run the workflow to see variables.</span>
          </div>
        ) : (
          <CodeEditor
            language="json"
            value={StringUtils.safeJsonStringify(
              displayContext,
              isTruncated ? 50 : Infinity,
              isTruncated ? 1000 : Infinity,
              isTruncated ? 5000 : Infinity
            )}
            readOnly={true}
            height="100%"
            showHeader={false}
            className="h-full border-0 rounded-none bg-transparent"
          />
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div className="px-4 py-2 bg-muted/20 border-t border-border text-xs text-muted-foreground/70 font-medium italic">
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
