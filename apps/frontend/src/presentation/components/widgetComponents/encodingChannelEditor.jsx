import React from 'react';
import PropTypes from 'prop-types';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { CollapseComponent } from '../ui/collapseComponent';

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
const ENCODING_TYPES = [
  { value: 'nominal', label: 'Nominal (Category)', desc: 'Discrete, unordered categories' },
  { value: 'ordinal', label: 'Ordinal (Rank)', desc: 'Discrete, ordered categories' },
  { value: 'quantitative', label: 'Quantitative (Number)', desc: 'Continuous numerical values' },
  { value: 'temporal', label: 'Temporal (Date/Time)', desc: 'Time-based values' },
];

const AGGREGATE_OPTIONS = [
  { value: 'none', label: 'No Aggregation' },
  { value: 'sum', label: 'Sum' },
  { value: 'count', label: 'Count' },
  { value: 'mean', label: 'Average (Mean)' },
  { value: 'median', label: 'Median' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
];

export const EncodingChannelEditor = ({
  channelName,
  label,
  value,
  onChange,
  onRemove,
  isOptional = false,
  availableFields = [],
}) => {
  // If value is null/undefined and optional, show add button
  if (!value && isOptional) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange({ field: '', type: 'nominal' })}
        className="w-full h-auto py-1.5 px-3 border-dashed border-slate-300 text-xs text-slate-500 hover:text-primary hover:border-primary hover:bg-blue-50"
      >
        <span>+ Add</span> {label || channelName}
      </Button>
    );
  }

  // Ensure value exists
  const safeValue = value || { field: '', type: 'nominal' };

  const handleChange = (update) => {
    onChange({ ...safeValue, ...update });
  };

  return (
    <div className="border border-slate-200 rounded bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-700 capitalize">
          {label || channelName}
        </span>
        {isOptional && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 hover:underline"
          >
            Remove
          </Button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Field Name Input */}
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-1">Field Name (Column)</label>
          <Input
            type="text"
            value={safeValue.field}
            onChange={(e) => handleChange({ field: e.target.value })}
            placeholder="e.g., amount, category..."
            list={`fields-list-${channelName}`}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
          />
          {/* Native datalist for basic autocomplete if fields known */}
          {availableFields.length > 0 && (
            <datalist id={`fields-list-${channelName}`}>
              {availableFields.map(f => (
                <option key={f} value={f} />
              ))}
            </datalist>
          )}
        </div>

        {/* Data Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Data Type</label>
            <Select value={safeValue.type || 'nominal'} onValueChange={(val) => handleChange({ type: val })}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ENCODING_TYPES.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Aggregation</label>
            <Select value={safeValue.aggregate || 'none'} onValueChange={(val) => handleChange({ aggregate: val === 'none' ? undefined : val })}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select aggregation" />
              </SelectTrigger>
              <SelectContent>
                {AGGREGATE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Options (Title, Sort) */}
        <CollapseComponent
          showButtonText="Advanced Options"
          hideButtonText="Hide Options"
          className="mt-2 border-t border-slate-100 pt-2"
          containerClass="p-0"
          buttonClass="text-[10px] text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 w-full justify-start"
          content={() => (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Axis/Legend Title</label>
                <Input
                  type="text"
                  value={safeValue.title || ''}
                  onChange={(e) => handleChange({ title: e.target.value || undefined })}
                  placeholder="Auto"
                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Sort Direction</label>
                <Select value={safeValue.sort || 'none'} onValueChange={(val) => handleChange({ sort: val === 'none' ? undefined : val })}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default</SelectItem>
                    <SelectItem value="ascending">Ascending</SelectItem>
                    <SelectItem value="descending">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

EncodingChannelEditor.propTypes = {
  channelName: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  isOptional: PropTypes.bool,
  availableFields: PropTypes.arrayOf(PropTypes.string),
};
