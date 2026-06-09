import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Status indicator icon component for workflow nodes
 * Shows a spinning refresh icon when running, checkmark when completed, X when failed
 */
export const StatusIndicator = ({ executionStatus }) => {
  if (executionStatus === 'running') {
    return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-spin z-10">
        <RefreshCw className="w-3 h-3 text-foreground" />
      </div>
    );
  }
  if (executionStatus === 'completed') {
    return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10">
        <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (executionStatus === 'failed') {
    return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
        <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return null;
};

/**
 * Returns Tailwind classes for node border styling based on execution status
 * @param {string} executionStatus - The execution status ('idle', 'running', 'completed', 'failed', 'skipped')
 * @param {string} defaultHoverColor - The default hover border color (e.g., 'blue-400', 'yellow-400')
 * @returns {string} Tailwind CSS classes
 */
export const getStatusStyles = (executionStatus, defaultHoverColor = 'blue-400') => {
  switch (executionStatus) {
    case 'running':
      return 'border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse';
    case 'completed':
      return 'border-green-400 ring-2 ring-green-300 ring-opacity-50';
    case 'failed':
      return 'border-red-400 ring-2 ring-red-300 ring-opacity-50';
    case 'skipped':
      return 'border-orange-300 opacity-60';
    default:
      return `border-brand-border hover:border-${defaultHoverColor} hover:shadow-md`;
  }
};

/**
 * Returns icon color class based on execution status
 * @param {string} executionStatus - The execution status
 * @param {string} defaultColor - The default color class (e.g., 'text-primary')
 * @returns {string} Tailwind CSS color class
 */
export const getIconColor = (executionStatus, defaultColor) => {
  switch (executionStatus) {
    case 'running':
      return 'text-primary';
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    default:
      return defaultColor;
  }
};

/**
 * Returns background color class based on execution status
 * @param {string} executionStatus - The execution status
 * @param {string} defaultBg - The default background class (e.g., 'bg-primary/10/40 border-blue-800')
 * @returns {string} Tailwind CSS background classes
 */
export const getStatusBgColor = (executionStatus, defaultBg) => {
  switch (executionStatus) {
    case 'running':
      return 'bg-primary/10/40 border-blue-800';
    case 'completed':
      return 'bg-green-950/40 border-green-800';
    case 'failed':
      return 'bg-red-950/40 border-red-800';
    default:
      return defaultBg;
  }
};
