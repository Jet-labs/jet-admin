import React from 'react';
import PropTypes from 'prop-types';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { CollapseComponent } from '@jet-admin/ui';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

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
  // Optional with no value → show "Add" affordance
  if (!value && isOptional) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange({ field: '', type: 'nominal' })}
        className="w-full h-auto py-1.5 px-3 border-dashed text-xs text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5"
      >
        + Add {label || channelName}
      </Button>
    );
  }

  const safeValue = value || { field: '', type: 'nominal' };
  const handleChange = (update) => onChange({ ...safeValue, ...update });

  return (
    /* ✅ Correct: bg-card / border-border instead of bg-slate-50 / border-slate-200 */
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-semibold text-foreground capitalize">
          {label || channelName}
        </span>
        {isOptional && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Remove
          </Button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Field Name */}
        <div className="space-y-1">
          {/* ✅ Correct: Label from @jet-admin/ui instead of raw <label> */}
          <Label className="text-[10px] font-medium text-muted-foreground">Field Name (Column)</Label>
          <Input
            type="text"
            value={safeValue.field}
            onChange={(e) => handleChange({ field: e.target.value })}
            placeholder="e.g., amount, category..."
            list={`fields-list-${channelName}`}
            className="text-xs"
          />
          {availableFields.length > 0 && (
            <datalist id={`fields-list-${channelName}`}>
              {availableFields.map(f => <option key={f} value={f} />)}
            </datalist>
          )}
        </div>

        {/* Type + Aggregation */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">Data Type</Label>
            <Select value={safeValue.type || 'nominal'} onValueChange={(val) => handleChange({ type: val })}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ENCODING_TYPES.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">Aggregation</Label>
            <Select value={safeValue.aggregate || 'none'} onValueChange={(val) => handleChange({ aggregate: val === 'none' ? undefined : val })}>
              <SelectTrigger className="text-xs">
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

        {/* Advanced (Title, Sort) */}
        <CollapseComponent
          showButtonText="Advanced Options"
          hideButtonText="Hide Options"
          className="mt-2 border-t border-border pt-2"
          containerClass="p-0"
          buttonClass="text-[10px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 w-full justify-start"
          content={() => (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Axis/Legend Title</Label>
                <Input
                  type="text"
                  value={safeValue.title || ''}
                  onChange={(e) => handleChange({ title: e.target.value || undefined })}
                  placeholder="Auto"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Sort Direction</Label>
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