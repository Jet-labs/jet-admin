import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { FieldPill } from './fieldPill';
import { FIELD_TYPES, AGGREGATE_TYPES } from './chartSpecGenerator';
import { MoveHorizontal, MoveVertical, Palette, Circle, Diamond, Contrast, Rows, Columns, CircleDot, Type, Minus, ArrowUpDown } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

const CHANNEL_CONFIG = {
  x:          { label: 'X',       Icon: MoveHorizontal },
  y:          { label: 'Y',       Icon: MoveVertical },
  color:      { label: 'Color',   Icon: Palette },
  size:       { label: 'Size',    Icon: Circle },
  shape:      { label: 'Shape',   Icon: Diamond },
  opacity:    { label: 'Opacity', Icon: Contrast },
  row:        { label: 'Row',     Icon: Rows },
  column:     { label: 'Col',     Icon: Columns },
  detail:     { label: 'Detail',  Icon: CircleDot },
  text:       { label: 'Text',    Icon: Type },
  strokeDash: { label: 'Dash',    Icon: Minus },
};

/**
 * EncodingShelf — A drop zone for an encoding channel.
 * Compact vertical layout for sidebar rendering.
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

  const config = CHANNEL_CONFIG[channel] || { label: channel, Icon: CircleDot };
  const { label, Icon } = config;

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

  return (
    <div
      ref={dropRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'flex items-center w-full min-h-[32px] rounded border transition-colors gap-1.5 px-2 py-1',
        isEmpty
          ? 'border-dashed border-border/60 bg-muted/20'
          : 'border-border bg-card',
        isDragOver ? 'border-primary bg-primary/5 shadow-inner' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Channel icon + label */}
      <div className="flex items-center gap-1.5 w-14 shrink-0">
        <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">{label}</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-nowrap items-center gap-1 min-w-0 overflow-hidden">
        {isEmpty ? (
          <span className="text-xs text-muted-foreground/60 italic">
            {isDragOver ? 'Release' : 'Drop field'}
          </span>
        ) : (
          <>
            {/* Field Pill */}
            <FieldPill
              field={{ ...value, name: value.field }}
              onRemove={onRemove}
              isCompact
              className="flex-1 min-w-0"
            />

            {/* Type select */}
            <Select value={value.type || 'nominal'} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-5 w-auto min-w-0 px-1 text-xs border-border/50 bg-transparent gap-0.5 shrink-0" title="Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {FIELD_TYPES.map(t => (
                  <SelectItem key={t} value={t} className="text-[11px]">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Aggregate */}
            {(value.type === 'quantitative' || value.aggregate) && (
              <Select value={value.aggregate || 'none'} onValueChange={handleAggChange}>
                  <SelectTrigger className="h-5 w-auto min-w-0 px-1 text-xs border-border/50 bg-transparent gap-0.5 shrink-0" title="Aggregate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="none" className="text-[11px]">raw</SelectItem>
                  {AGGREGATE_TYPES.map(a => (
                    <SelectItem key={a} value={a} className="text-[11px]">{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort */}
            <button
              type="button"
              onClick={handleSortToggle}
              className="ml-auto h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
              title={`Sort: ${value.sort || 'default'}`}
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
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
