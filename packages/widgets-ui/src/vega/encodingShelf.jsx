import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { FieldPill } from './fieldPill';
import { FIELD_TYPES, AGGREGATE_TYPES } from './chartSpecGenerator';

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
const CHANNEL_LABELS = {
  x: 'X Axis',
  y: 'Y Axis',
  color: 'Color',
  size: 'Size',
  shape: 'Shape',
  opacity: 'Opacity',
  row: 'Row',
  column: 'Column',
  detail: 'Detail',
  text: 'Text',
  strokeDash: 'Dash',
};

const CHANNEL_ICONS = {
  x: '↔',
  y: '↕',
  color: '🎨',
  size: '◉',
  shape: '◆',
  opacity: '◐',
  row: '▦',
  column: '▥',
  detail: '⊙',
  text: 'T',
  strokeDash: '╌',
};

/**
 * EncodingShelf — A drop zone for an encoding channel.
 * Accepts dragged FieldPills and shows inline configuration.
 * Uses scoped CSS classes to prevent dark-theme bleed.
 */
export const EncodingShelf = ({
  channel,
  value,
  onChange,
  onRemove,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef(null);

  const label = CHANNEL_LABELS[channel] || channel;
  const icon = CHANNEL_ICONS[channel] || '•';

  // Drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.name) {
        let defaultAggregate = undefined;
        if ((channel === 'y' || channel === 'size' || channel === 'opacity') && data.type === 'quantitative') {
          defaultAggregate = 'sum';
        }

        onChange({
          field: data.name,
          type: data.type || 'nominal',
          aggregate: defaultAggregate,
          title: '',
          sort: null,
        });
      }
    } catch (err) {
      // ignore invalid drag data
    }
  }, [channel, onChange]);

  // Inline config handlers
  const handleTypeChange = useCallback((newType) => {
    if (value) onChange({ ...value, type: newType });
  }, [value, onChange]);

  const handleAggChange = useCallback((newAgg) => {
    if (value) onChange({ ...value, aggregate: newAgg === 'none' ? undefined : newAgg });
  }, [value, onChange]);

  const handleSortToggle = useCallback(() => {
    if (!value) return;
    const sortStates = [null, 'ascending', 'descending'];
    const current = sortStates.indexOf(value.sort);
    const next = sortStates[(current + 1) % sortStates.length];
    onChange({ ...value, sort: next });
  }, [value, onChange]);

  const isEmpty = !value || !value.field;

  const shelfClass = [
    'flex items-center w-full min-h-[36px] bg-brand-dark border border-border rounded-md p-1 gap-2 transition-colors',
    isEmpty ? 'border-dashed border-border bg-muted/30' : '',
    isDragOver ? 'border-primary bg-primary/5 shadow-inner' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={dropRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={shelfClass}
    >
      {/* Channel label */}
      <div className="flex items-center justify-start w-24 shrink-0 px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest gap-2 border-r border-border">
        <span className="text-muted-foreground/50 text-sm">{icon}</span>
        <span className="truncate">{label}</span>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0 pr-1">
        {isEmpty ? (
          <span className="text-xs text-muted-foreground italic px-2">
            {isDragOver ? 'Release to assign' : 'Drop a field here'}
          </span>
        ) : (
          <>
            {/* Field Pill */}
            <FieldPill
              field={{ ...value, name: value.field }}
              onRemove={onRemove}
              isCompact
            />

            {/* Inline type select */}
            <Select value={value.type || 'nominal'} onValueChange={(val) => handleTypeChange(val)}>
              <SelectTrigger className="h-6 px-1.5 py-0.5 text-[11px]" title="Data type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {FIELD_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Aggregate (for quantitative) */}
            {(value.type === 'quantitative' || value.aggregate) && (
              <Select value={value.aggregate || 'none'} onValueChange={(val) => handleAggChange(val)}>
                <SelectTrigger className="h-6 px-1.5 py-0.5 text-[11px]" title="Aggregation">
                  <SelectValue placeholder="Select agg" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="none">no agg</SelectItem>
                  {AGGREGATE_TYPES.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSortToggle}
              className="ml-auto h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/5 text-xs"
              title={`Sort: ${value.sort || 'default'}`}
            >
              {value.sort === 'ascending' ? '↑' : value.sort === 'descending' ? '↓' : '↕'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

EncodingShelf.propTypes = {
  channel: PropTypes.string.isRequired,
  value: PropTypes.shape({
    field: PropTypes.string,
    type: PropTypes.string,
    aggregate: PropTypes.string,
    sort: PropTypes.string,
    title: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  className: PropTypes.string,
};
