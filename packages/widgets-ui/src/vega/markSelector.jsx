import React from 'react';
import PropTypes from 'prop-types';
import { BarChart3, TrendingUp, AreaChart, ScatterChart, PieChart, CircleDot, Grid3X3, GripVertical, Circle, Sparkles } from 'lucide-react';

const MARK_OPTIONS = [
  { key: 'auto',   label: 'Auto',    Icon: Sparkles,     desc: 'Best fit' },
  { key: 'bar',    label: 'Bar',     Icon: BarChart3,    desc: 'Compare' },
  { key: 'line',   label: 'Line',    Icon: TrendingUp,   desc: 'Trends' },
  { key: 'area',   label: 'Area',    Icon: AreaChart,    desc: 'Volume' },
  { key: 'point',  label: 'Scatter', Icon: ScatterChart, desc: 'Correlate' },
  { key: 'arc',    label: 'Pie',     Icon: PieChart,     desc: 'Parts' },
  { key: 'donut',  label: 'Donut',   Icon: CircleDot,    desc: 'Ring' },
  { key: 'rect',   label: 'Heat',    Icon: Grid3X3,      desc: 'Density' },
  { key: 'tick',   label: 'Tick',    Icon: GripVertical,  desc: 'Dist' },
  { key: 'circle', label: 'Bubble',  Icon: Circle,       desc: 'Sized' },
];

/**
 * MarkSelector — Compact grid-based chart type picker with Lucide icons.
 */
export const MarkSelector = ({ value, onChange, className = '' }) => {
  return (
    <div className={`grid grid-cols-5 gap-1.5 ${className}`}>
      {MARK_OPTIONS.map((opt) => {
        const isSelected = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded py-1.5 px-1 transition-colors ${
              isSelected
                ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title={`${opt.label}: ${opt.desc}`}
          >
            <opt.Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : ''}`} />
            <span className="text-[8px] font-medium leading-none">{opt.label}</span>
          </button>
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
