import React from 'react';
import PropTypes from 'prop-types';
import { Button } from "@jet-admin/ui";

// ─── SVG chart icons ──────────────────────────────────────────────────────────

const ChartIcons = {
  bar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  line: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  area: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 20H2v-6l4-4 4 4 4-8 8 8v6z" />
    </svg>
  ),
  pie: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  donut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
      <path d="M22 12c0-5.52-4.48-10-10-10" />
    </svg>
  ),
  scatter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" strokeWidth="0" className="w-5 h-5">
      <circle cx="6" cy="18" r="2.5" /><circle cx="12" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" />
      <circle cx="17" cy="16" r="2" /><circle cx="7" cy="9" r="2" />
    </svg>
  ),
  heatmap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="3" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="3" y="9" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="15" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
    </svg>
  ),
  histogram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="14" width="3" height="6" /><rect x="8" y="8" width="3" height="12" />
      <rect x="13" y="11" width="3" height="9" /><rect x="18" y="5" width="3" height="15" />
      <line x1="2" y1="20" x2="22" y2="20" />
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
    <div className="grid grid-cols-4 gap-1.5">
      {CHART_TYPES.map((type) => {
        const Icon = ChartIcons[type.id];
        const isSelected = value === type.id;

        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            title={type.description}
            className={`
              flex flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-3
              border text-xs font-medium transition-all
              ${isSelected
                /* ✅ Correct: semantic primary tokens */
                ? 'bg-primary/10 border-primary text-primary shadow-sm'
                : 'bg-white border-border text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'
              }
            `}
          >
            <div className={`transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
              <Icon />
            </div>
            <span className={`text-[10px] font-semibold tracking-wide transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
              {type.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

ChartTypeSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};