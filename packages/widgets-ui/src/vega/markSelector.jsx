import React from 'react';
import PropTypes from 'prop-types';

import { Button } from "@jet-admin/ui";
const MARK_OPTIONS = [
  { key: 'auto', label: 'Auto', icon: '✦', desc: 'Best fit based on field types' },
  { key: 'bar', label: 'Bar', icon: '▥', desc: 'Compare categories' },
  { key: 'line', label: 'Line', icon: '⟋', desc: 'Trends over time' },
  { key: 'area', label: 'Area', icon: '▤', desc: 'Volume over time' },
  { key: 'point', label: 'Scatter', icon: '⊙', desc: 'Correlation' },
  { key: 'arc', label: 'Pie', icon: '◕', desc: 'Part of whole' },
  { key: 'donut', label: 'Donut', icon: '◑', desc: 'Part of whole (ring)' },
  { key: 'rect', label: 'Heat', icon: '▦', desc: 'Density matrix' },
  { key: 'tick', label: 'Tick', icon: '|', desc: 'Distribution marks' },
  { key: 'circle', label: 'Bubble', icon: '●', desc: 'Sized circles' },
];

/**
 * MarkSelector — Compact toolbar chart type picker.
 * Uses Tailwind CSS to match the minimalist flat aesthetic.
 */
export const MarkSelector = ({ value, onChange, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-1 w-full ${className}`}>
      {MARK_OPTIONS.map((opt) => {
        const isSelected = value === opt.key;
        return (
          <Button
            key={opt.key}
            type="button"
            variant={isSelected ? "outline" : "ghost"}
            size="sm"
            onClick={() => onChange(opt.key)}
            className={`h-auto py-1.5 flex-1 min-w-[60px] px-2 text-xs font-medium ${
              isSelected 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm hover:text-indigo-800 hover:bg-indigo-100' 
                : 'text-[#1c1c1e] border-transparent hover:bg-slate-100'
            }`}
            title={`${opt.label}: ${opt.desc}`}
          >
            <span className={`mr-1.5 ${isSelected ? 'text-indigo-500' : 'text-[#1c1c1e]'}`}>{opt.icon}</span>
            <span className="hidden lg:inline">{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

MarkSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
