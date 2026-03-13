import React from 'react';
import PropTypes from 'prop-types';

import { Button } from "@jet-admin/ui";
// Simple SVG icons for chart types
const ChartIcons = {
  bar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  line: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  area: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M22 20H2v-6l4-4 4 4 4-8 8 8v6z"></path>
      <path d="M22 20v-6l-8-8-4 8-4-4-4 4v6"></path>
    </svg>
  ),
  pie: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  ),
  donut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M22 12c0-5.52-4.48-10-10-10"></path>
    </svg>
  ),
  scatter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" strokeWidth="0" className="w-6 h-6">
      <circle cx="6" cy="18" r="2.5"></circle>
      <circle cx="12" cy="12" r="2.5"></circle>
      <circle cx="18" cy="6" r="2.5"></circle>
      <circle cx="17" cy="16" r="2"></circle>
      <circle cx="7" cy="9" r="2"></circle>
    </svg>
  ),
  heatmap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="3" width="6" height="6" rx="1"></rect>
      <rect x="15" y="3" width="6" height="6" rx="1"></rect>
      <rect x="9" y="3" width="6" height="6" rx="1" fill="currentColor"></rect>
      <rect x="3" y="9" width="6" height="6" rx="1" fill="currentColor"></rect>
      <rect x="15" y="9" width="6" height="6" rx="1"></rect>
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"></rect>
      <rect x="3" y="15" width="6" height="6" rx="1"></rect>
      <rect x="15" y="15" width="6" height="6" rx="1" fill="currentColor"></rect>
      <rect x="9" y="15" width="6" height="6" rx="1"></rect>
    </svg>
  ),
  histogram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="14" width="3" height="6"></rect>
      <rect x="8" y="8" width="3" height="12"></rect>
      <rect x="13" y="11" width="3" height="9"></rect>
      <rect x="18" y="5" width="3" height="15"></rect>
      <line x1="2" y1="20" x2="22" y2="20"></line>
    </svg>
  ),
};

const CHART_TYPES = [
  { id: 'bar', label: 'Bar', description: 'Compare categories' },
  { id: 'line', label: 'Line', description: 'Trends over time' },
  { id: 'area', label: 'Area', description: 'Volume over time' },
  { id: 'pie', label: 'Pie', description: 'Part of whole' },
  { id: 'donut', label: 'Donut', description: 'Part of whole' },
  { id: 'scatter', label: 'Scatter', description: 'Correlation' },
  { id: 'histogram', label: 'Histogram', description: 'Distribution' },
  { id: 'heatmap', label: 'Heatmap', description: 'Density matrix' },
];

export const ChartTypeSelector = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CHART_TYPES.map((type) => {
        const Icon = ChartIcons[type.id];
        const isSelected = value === type.id;
        
        return (
          <Button
            key={type.id}
            type="button"
            variant={isSelected ? "outline" : "ghost"}
            onClick={() => onChange(type.id)}
            className={`
              h-auto flex-col items-center justify-center p-3 rounded-lg ${isSelected ? 'bg-blue-50 border-primary text-primary shadow-sm hover:text-primary hover:bg-blue-100' : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}
            `}
            title={type.description}
          >
            <div className={`mb-2 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
              <Icon />
            </div>
            <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
              {type.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

ChartTypeSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
