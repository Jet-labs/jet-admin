import React from 'react';
import { TbRefresh } from 'react-icons/tb';

/**
 * Status indicator icon component for workflow nodes
 * Shows a spinning refresh icon when running, checkmark when completed, X when failed
 */
export const StatusIndicator = ({ executionStatus }) => {
  if (executionStatus === 'running') {
    return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10">
        <TbRefresh className="w-3 h-3 text-white" />
      </div>
    );
  }
  if (executionStatus === 'completed') {
    return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (executionStatus === 'failed') {
    return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      return `border-slate-200 hover:border-${defaultHoverColor} hover:shadow-md`;
  }
};

/**
 * Returns icon color class based on execution status
 * @param {string} executionStatus - The execution status
 * @param {string} defaultColor - The default color class (e.g., 'text-blue-500')
 * @returns {string} Tailwind CSS color class
 */
export const getIconColor = (executionStatus, defaultColor) => {
  switch (executionStatus) {
    case 'running':
      return 'text-blue-600';
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
 * @param {string} defaultBg - The default background class (e.g., 'bg-blue-50 border-blue-100')
 * @returns {string} Tailwind CSS background classes
 */
export const getStatusBgColor = (executionStatus, defaultBg) => {
  switch (executionStatus) {
    case 'running':
      return 'bg-blue-100 border-blue-200';
    case 'completed':
      return 'bg-green-50 border-green-100';
    case 'failed':
      return 'bg-red-50 border-red-100';
    default:
      return defaultBg;
  }
};
