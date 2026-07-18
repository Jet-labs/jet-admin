import React, { useRef, useEffect } from 'react';
import { ArrowRight, Check, Clock, Eraser, Loader, Play, Terminal, X } from 'lucide-react';
import PropTypes from 'prop-types';

import { Button } from "@jet-admin/ui";

/**
 * WorkflowConsole - Terminal-style console for workflow execution logs
 * Standardized for semantic design tokens and dark mode support.
 */
export const WorkflowConsole = ({ 
  logs = [], 
  isRunning = false, 
  onClear,
  className = '',
}) => {
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive, using local container scroll to prevent page-level leaps
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Get icon and color for log type
  const getLogStyle = (log) => {
    switch (log.type) {
      case 'start':
        return { icon: Play, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
      case 'node_start':
        return { icon: ArrowRight, color: 'text-blue-500', bgColor: 'bg-blue-950/400/10' };
      case 'node_complete':
        return { icon: Check, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
      case 'node_error':
        return { icon: X, color: 'text-destructive', bgColor: 'bg-destructive/10' };
      case 'workflow_complete':
        return { icon: Check, color: 'text-emerald-600', bgColor: 'bg-emerald-600/10' };
      case 'workflow_error':
        return { icon: X, color: 'text-destructive', bgColor: 'bg-destructive/10' };
      case 'info':
        return { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-transparent' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-transparent' };
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className={`flex flex-col bg-background overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Console</span>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
              <Loader className="size-3 animate-spin" />
              Running
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onClear && (
            <Button
              onClick={onClear}
              type='button'
              variant="ghost"
              size="sm"
              square
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Clear logs"
            >
              <Eraser className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Logs area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs bg-background/50">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground/60">
            <span>No logs yet. Click "Test Run" to start.</span>
          </div>
        ) : (
            <div className="space-y-1">
            {logs.map((log, index) => {
              const { icon: Icon, color, bgColor } = getLogStyle(log);
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 py-1.5 px-2.5 rounded ${bgColor} group transition-colors`}
                >
                  {/* Timestamp */}
                  <span className="text-muted-foreground/50 whitespace-nowrap shrink-0 font-medium">
                    [{formatTime(log.timestamp)}]
                  </span>
                  
                  {/* Icon */}
                  <Icon className={`size-3 mt-0.5 shrink-0 ${color}`} />
                  
                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <span className={`${color} font-semibold`}>{log.label}</span>
                    {log.message && (
                      <span className="text-foreground/80 ml-2">{log.message}</span>
                    )}
                    {log.nodeId && (
                      <span className="text-muted-foreground/60 ml-2 text-xs">
                        ({log.nodeId.substring(0, 8)}...)
                      </span>
                    )}
                    {log.output && (
                      <div className="mt-1.5 p-2.5 bg-background/80 rounded border border-border text-foreground/90 overflow-x-auto shadow-sm">
                        <pre className="whitespace-pre-wrap break-all leading-relaxed">
                          {typeof log.output === 'object' 
                            ? JSON.stringify(log.output, null, 2) 
                            : String(log.output)}
                        </pre>
                      </div>
                    )}
                    {log.error && (
                      <div className="mt-1.5 p-2.5 bg-destructive/5 rounded border border-destructive/20 text-destructive overflow-x-auto shadow-sm">
                        <pre className="whitespace-pre-wrap break-all font-semibold leading-relaxed">{log.error}</pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {logs.length > 0 && (
        <div className="px-4 py-2 bg-muted/20 border-t border-border text-xs text-muted-foreground font-medium flex items-center">
          <span>{logs.length} log{logs.length !== 1 ? 's' : ''}</span>
          <span className="mx-2 opacity-30">•</span>
          <span>
            {logs.filter(l => l.type === 'node_complete').length} completed, {' '}
            <span className={logs.filter(l => l.type === 'node_error').length > 0 ? 'text-destructive' : ''}>
              {logs.filter(l => l.type === 'node_error').length} failed
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

WorkflowConsole.propTypes = {
  logs: PropTypes.array,
  isRunning: PropTypes.bool,
  onClear: PropTypes.func,
  className: PropTypes.string,
};

export default WorkflowConsole;
