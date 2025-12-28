import React, { useRef, useEffect } from 'react';
import { FaPlay, FaCheck, FaTimes, FaSpinner, FaClock, FaArrowRight } from 'react-icons/fa';
import { VscTerminal, VscClearAll } from 'react-icons/vsc';
import { IoClose } from 'react-icons/io5';

/**
 * WorkflowConsole - Modern terminal-style console for workflow execution logs
 */
export const WorkflowConsole = ({ 
  logs = [], 
  isRunning = false, 
  onClear,
  onClose,
  className = '',
}) => {
  const logsEndRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Get icon and color for log type
  const getLogStyle = (log) => {
    switch (log.type) {
      case 'start':
        return { icon: FaPlay, color: 'text-green-400', bgColor: 'bg-green-500/10' };
      case 'node_start':
        return { icon: FaArrowRight, color: 'text-blue-400', bgColor: 'bg-blue-500/10' };
      case 'node_complete':
        return { icon: FaCheck, color: 'text-green-400', bgColor: 'bg-green-500/10' };
      case 'node_error':
        return { icon: FaTimes, color: 'text-red-400', bgColor: 'bg-red-500/10' };
      case 'workflow_complete':
        return { icon: FaCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
      case 'workflow_error':
        return { icon: FaTimes, color: 'text-red-400', bgColor: 'bg-red-500/10' };
      case 'info':
        return { icon: FaClock, color: 'text-slate-400', bgColor: '' };
      default:
        return { icon: FaClock, color: 'text-slate-500', bgColor: '' };
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
    <div className={`flex flex-col bg-slate-900 rounded-lg border border-slate-700 shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <VscTerminal className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Workflow Console</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <FaSpinner className="w-3 h-3 animate-spin" />
              Running
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onClear && (
            <button
              onClick={onClear}
              type='button'
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
              title="Clear logs"
            >
              <VscClearAll className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              type='button'
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
              title="Close console"
            >
              <IoClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Logs area */}
      <div className="flex-1 overflow-y-auto p-3 min-h-[200px] max-h-[400px] font-mono text-xs">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <span>No logs yet. Click "Test Run" to start.</span>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => {
              const { icon: Icon, color, bgColor } = getLogStyle(log);
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 py-1.5 px-2 rounded ${bgColor} group hover:bg-slate-800/50 transition-colors`}
                >
                  {/* Timestamp */}
                  <span className="text-slate-500 whitespace-nowrap shrink-0">
                    [{formatTime(log.timestamp)}]
                  </span>
                  
                  {/* Icon */}
                  <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${color}`} />
                  
                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <span className={`${color} font-medium`}>{log.label}</span>
                    {log.message && (
                      <span className="text-slate-400 ml-2">{log.message}</span>
                    )}
                    {log.nodeId && (
                      <span className="text-slate-600 ml-2 text-[10px]">
                        ({log.nodeId.substring(0, 8)}...)
                      </span>
                    )}
                    {log.output && (
                      <div className="mt-1 p-2 bg-slate-800/50 rounded border border-slate-700 text-slate-400 overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-all">
                          {typeof log.output === 'object' 
                            ? JSON.stringify(log.output, null, 2) 
                            : String(log.output)}
                        </pre>
                      </div>
                    )}
                    {log.error && (
                      <div className="mt-1 p-2 bg-red-950/30 rounded border border-red-900/30 text-red-400 overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-all">{log.error}</pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {logs.length > 0 && (
        <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700 text-xs text-slate-500">
          <span>{logs.length} log{logs.length !== 1 ? 's' : ''}</span>
          <span className="mx-2">•</span>
          <span>
            {logs.filter(l => l.type === 'node_complete').length} completed, {' '}
            {logs.filter(l => l.type === 'node_error').length} failed
          </span>
        </div>
      )}
    </div>
  );
};

export default WorkflowConsole;
