import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DataFieldPanel } from './dataFieldPanel';
import { EncodingShelf } from './encodingShelf';
import { MarkSelector } from './markSelector';
import {
  generateVegaLiteSpec,
  getDefaultShelfSpec,
  inferMarkType,
  COLOR_SCHEMES,
  INTERPOLATE_TYPES,
} from "./chartSpecGenerator";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, TemplateAutocompleteInput, Switch } from "@jet-admin/ui";
import { ChevronDown, ChevronRight, Database, TrendingUp, Layers, Palette, AlertTriangle } from 'lucide-react';
import { getValueByPath } from '@jet-admin/expression-engine';

const PRIMARY_SHELVES = ['x', 'y', 'color', 'size'];
const SECONDARY_SHELVES = ['row', 'column', 'shape', 'opacity', 'detail', 'text', 'strokeDash'];

/**
 * ShelfBuilder — Inline collapsible Vega-Lite visual builder.
 * Designed for narrow sidebar rendering (~300px wide).
 * 
 * Layout: Data Source → Fields → Encoding Shelves → Style (all stacked vertically).
 */
export const ShelfBuilder = ({
  widgetEditorForm,
  queryResults,
  stateTree,
  liveStateTree,
}) => {

  // Initialize shelf spec from form or defaults (normalize older saved specs
  // that lack markProps / interaction / newer encoding channels).
  const normalizeShelfSpec = (spec) => {
    const defaults = getDefaultShelfSpec();
    if (!spec || typeof spec !== 'object') return defaults;
    return {
      ...defaults,
      ...spec,
      encoding: { ...defaults.encoding, ...(spec.encoding || {}) },
      markProps: { ...defaults.markProps, ...(spec.markProps || {}) },
      interaction: { ...defaults.interaction, ...(spec.interaction || {}) },
      config: { ...defaults.config, ...(spec.config || {}) },
    };
  };

  const [shelfSpec, setShelfSpec] = useState(() => {
    let savedSpec = widgetEditorForm.values.widgetConfig?.shelfSpec;
    if (typeof savedSpec === 'string') {
      try {
        savedSpec = JSON.parse(savedSpec);
      } catch (e) {
        savedSpec = null;
      }
    }
    return normalizeShelfSpec(savedSpec);
  });

  // Update local state if the form async loads the widget config from API
  useEffect(() => {
    let savedSpec = widgetEditorForm.values.widgetConfig?.shelfSpec;
    if (savedSpec) {
      if (typeof savedSpec === 'string') {
        try { savedSpec = JSON.parse(savedSpec); } catch (e) { return; }
      }
      const normalized = normalizeShelfSpec(savedSpec);
      // If the incoming loaded spec is different from our local spec, update it.
      // We check via JSON stringify to avoid infinite loops since we also push back to form.
      if (JSON.stringify(normalized) !== JSON.stringify(shelfSpec)) {
        setShelfSpec(normalized);
      }
    }
  }, [widgetEditorForm.values.widgetConfig?.shelfSpec]);

  const [showSecondary, setShowSecondary] = useState(false);
  const [showStyle, setShowStyle] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);

  // Resolved mark type for display
  const resolvedMark = useMemo(() => {
    if (shelfSpec.mark === 'auto' || !shelfSpec.mark) {
      return inferMarkType(shelfSpec.encoding);
    }
    return shelfSpec.mark;
  }, [shelfSpec.mark, shelfSpec.encoding]);

  // Update a single encoding channel
  const handleChannelChange = useCallback((channel, value) => {
    setShelfSpec(prev => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: value,
      },
    }));
  }, []);

  // Remove a channel's field
  const handleChannelRemove = useCallback((channel) => {
    setShelfSpec(prev => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: null,
      },
    }));
  }, []);

  // Update mark
  const handleMarkChange = useCallback((mark) => {
    setShelfSpec(prev => ({ ...prev, mark }));
  }, []);

  // Update interaction flags (drill-down selections)
  const handleInteractionChange = useCallback((key, value) => {
    setShelfSpec(prev => ({
      ...prev,
      interaction: { ...(prev.interaction || {}), [key]: value },
    }));
  }, []);

  // Update data source
  const handleDataSourceChange = useCallback((newSource) => {
    setShelfSpec(prev => ({ ...prev, dataSource: newSource }));
  }, []);

  // Update config/style
  const handleConfigChange = useCallback((key, value) => {
    setShelfSpec(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  }, []);

  // Update mark props (point overlay, interpolation, cornerRadius, opacity)
  const handleMarkPropChange = useCallback((key, value) => {
    setShelfSpec(prev => ({
      ...prev,
      markProps: { ...(prev.markProps || {}), [key]: value },
    }));
  }, []);

  // Tooltip is a multi-field array channel
  const tooltipFields = useMemo(() => {
    const t = shelfSpec.encoding?.tooltip;
    if (Array.isArray(t)) return t.filter(Boolean);
    if (t?.field) return [t];
    return [];
  }, [shelfSpec.encoding?.tooltip]);

  const handleTooltipAdd = useCallback((field) => {
    setShelfSpec(prev => {
      const cur = Array.isArray(prev.encoding?.tooltip)
        ? prev.encoding.tooltip
        : prev.encoding?.tooltip?.field ? [prev.encoding.tooltip] : [];
      if (cur.some(c => c?.field === field.name)) return prev;
      return {
        ...prev,
        encoding: {
          ...prev.encoding,
          tooltip: [...cur, { field: field.name, type: field.type }],
        },
      };
    });
  }, []);

  const handleTooltipRemove = useCallback((fieldName) => {
    setShelfSpec(prev => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        tooltip: (Array.isArray(prev.encoding?.tooltip) ? prev.encoding.tooltip : []).filter(c => c?.field !== fieldName),
      },
    }));
  }, []);

  // Quick-add field: auto-assign to the best empty shelf
  const handleFieldQuickAdd = useCallback((field) => {
    setShelfSpec(prev => {
      const enc = { ...prev.encoding };

      if (!enc.x?.field) {
        enc.x = { field: field.name, type: field.type };
      } else if (!enc.y?.field) {
        const agg = field.type === 'quantitative' ? 'sum' : undefined;
        enc.y = { field: field.name, type: field.type, aggregate: agg };
      } else if (!enc.color?.field) {
        enc.color = { field: field.name, type: field.type };
      } else if (!enc.size?.field) {
        enc.size = { field: field.name, type: field.type };
      }

      return { ...prev, encoding: enc };
    });
  }, []);

  // Expand/collapse state
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync shelfSpec → form's vegaSpec (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const vegaSpec = generateVegaLiteSpec(shelfSpec);
      // Ensure the generated spec carries the actual data source variable path
      if (shelfSpec.dataSource) {
         vegaSpec.data = { values: shelfSpec.dataSource };
      }
      widgetEditorForm.setFieldValue('widgetConfig.shelfSpec', shelfSpec);
      widgetEditorForm.setFieldValue('widgetConfig.vegaSpec', vegaSpec);
    }, 200);
    return () => clearTimeout(timer);
  }, [shelfSpec]); // eslint-disable-line react-hooks/exhaustive-deps

  // Quick fallback if no data source available
  const hasAnyData = true; // Always true now since it's an input

  // Active encoding count
  const activeCount = [...PRIMARY_SHELVES, ...SECONDARY_SHELVES].filter(ch => shelfSpec.encoding[ch]?.field).length + tooltipFields.length;

  // Live builder warnings (empty data source, missing axes, unresolved binding)
  const builderWarnings = useMemo(() => {
    const warns = [];
    const ds = shelfSpec.dataSource || '';
    const dsMatch = ds.match(/\{\{([^}]+)\}\}/);
    if (!ds) {
      warns.push('No data source — bind {{ state.queries.*.data }} above.');
    } else if (!dsMatch && !Array.isArray(shelfSpec.inlineValues)) {
      warns.push('Data source is not a {{ }} binding — chart may show no live data.');
    } else if (dsMatch) {
      // Resolve the binding against live state to catch typos / empty results
      const rawPath = dsMatch[1].trim();
      let resolved;
      try {
        resolved = getValueByPath(liveStateTree || stateTree, rawPath, { allowedRoots: ['state'] });
        if (resolved === undefined && stateTree && liveStateTree) {
          // liveStateTree is { state: tree }; also try the raw tree
          resolved = getValueByPath(stateTree, rawPath, { allowedRoots: ['state'] });
        }
      } catch { resolved = undefined; }
      if (resolved === undefined) {
        warns.push(`Binding ${ds} resolves to undefined — check the path or run the query.`);
      } else if (Array.isArray(resolved) && resolved.length === 0) {
        warns.push('Data source returned 0 rows — chart will render empty.');
      }
    }
    const hasX = !!shelfSpec.encoding?.x?.field;
    const hasY = !!shelfSpec.encoding?.y?.field;
    const mark = shelfSpec.mark === 'auto' ? resolvedMark : shelfSpec.mark;
    if (!hasX && !hasY && mark !== 'text') {
      warns.push('Drop a field onto X or Y to render marks.');
    }
    if ((mark === 'arc' || mark === 'donut') && !hasY) {
      warns.push('Pie/Donut needs a Y (theta) measure.');
    }
    // Reference line binding check
    const refVal = shelfSpec.config?.referenceLine?.value;
    if (refVal && typeof refVal === 'string' && refVal.includes('{{')) {
      const m = refVal.match(/\{\{([^}]+)\}\}/);
      if (m) {
        let r;
        try { r = getValueByPath(liveStateTree || stateTree, m[1].trim(), { allowedRoots: ['state'] }); } catch { r = undefined; }
        if (r === undefined) warns.push('Reference line value resolves to undefined — check the binding.');
      }
    }
    return warns;
  }, [shelfSpec.dataSource, shelfSpec.encoding, shelfSpec.mark, shelfSpec.inlineValues, shelfSpec.config?.referenceLine, resolvedMark, liveStateTree, stateTree]);

  return (
    <div className="w-full">
      {/* ── Collapsible Header ── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded border border-border bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors text-left"
      >
        {isExpanded
          ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        }
        <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-xs font-medium text-foreground flex-1">Mappings</span>
        {activeCount > 0 && (
          <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Expanded Content ── */}
      {isExpanded && (
        <div className="mt-1.5 rounded border border-border bg-card overflow-hidden">

          {!hasAnyData ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Database className="w-7 h-7 mb-2 text-muted-foreground/30" />
              <p className="text-xs font-medium text-foreground mb-0.5">No Data Source</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add a Data Source in the Data tab and run a Test, or select a Workflow.
              </p>
            </div>
          ) : (
            <>
              {/* ── Section: Data Source Select ── */}
              <div className="px-2.5 py-2 border-b border-border/50 bg-muted/20">
                <Label className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Data Source
                </Label>
                <TemplateAutocompleteInput
                  value={shelfSpec.dataSource || ''}
                  onChange={(val) => handleDataSourceChange(val)}
                  placeholder="e.g. {{ state.queries.my_query.data }}"
                  liveStateTree={liveStateTree}
                />
              </div>

              {/* ── Section: Discovered Fields ── */}
              <div className="border-b border-border/50 max-h-[220px] overflow-y-auto">
                <DataFieldPanel
                  queryResults={queryResults}
                  stateTree={stateTree}
                  liveStateTree={liveStateTree}
                  dataSource={shelfSpec.dataSource}
                  onDataSourceChange={handleDataSourceChange}
                  onFieldClick={handleFieldQuickAdd}
                  onTooltipAdd={handleTooltipAdd}
                  compact
                />
              </div>

              {/* ── Builder warnings ── */}
              {builderWarnings.length > 0 && (
                <div className="px-2.5 py-2 border-b border-amber-200/60 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/20 flex flex-col gap-1">
                  {builderWarnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="w-3 h-3 mt-px shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Section: Encoding Shelves ── */}
              <div className="border-b border-border/50">
                <div className="px-2.5 py-1.5 bg-muted/20 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Encodings
                  </span>
                </div>
                <div className="p-2 flex flex-col gap-1.5">
                  {PRIMARY_SHELVES.map(ch => (
                    <EncodingShelf
                      key={ch}
                      channel={ch}
                      value={shelfSpec.encoding[ch]}
                      onChange={(val) => handleChannelChange(ch, val)}
                      onRemove={() => handleChannelRemove(ch)}
                    />
                  ))}
                </div>

                {/* Secondary shelves */}
                <div className="border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowSecondary(!showSecondary)}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/10 hover:bg-muted/30 transition-colors text-left"
                  >
                    {showSecondary
                      ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      : <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    }
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">
                      More Channels
                    </span>
                    <span className="text-[9px] text-primary font-bold">
                      {SECONDARY_SHELVES.filter(ch => shelfSpec.encoding[ch]?.field).length} active
                    </span>
                  </button>
                  {showSecondary && (
                    <div className="p-2 flex flex-col gap-1.5">
                      {SECONDARY_SHELVES.map(ch => (
                        <EncodingShelf
                          key={ch}
                          channel={ch}
                          value={shelfSpec.encoding[ch]}
                          onChange={(val) => handleChannelChange(ch, val)}
                          onRemove={() => handleChannelRemove(ch)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Tooltip multi-field channel */}
                <div className="border-t border-border/50 px-2.5 py-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Tooltip {tooltipFields.length > 0 && `(${tooltipFields.length})`}
                    </span>
                    <span className="text-[9px] text-muted-foreground/70">T+ on a field, or drop below</span>
                  </div>
                  {tooltipFields.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {tooltipFields.map(t => (
                        <span key={t.field} className="inline-flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono">
                          {t.field}
                          <button type="button" onClick={() => handleTooltipRemove(t.field)} className="text-muted-foreground hover:text-destructive" title="Remove">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      try {
                        const data = JSON.parse(e.dataTransfer.getData('application/json'));
                        if (data?.name) handleTooltipAdd(data);
                      } catch { /* ignore */ }
                    }}
                    className="rounded border border-dashed border-border/60 bg-muted/20 px-2 py-1.5 text-[10px] text-muted-foreground/70 italic text-center"
                  >
                    Drop field for tooltip
                  </div>
                </div>
              </div>

              {/* ── Section: Interactivity / Drill-down ── */}
              <div className="border-b border-border/50">
                <button
                  type="button"
                  onClick={() => setShowInteraction(!showInteraction)}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/10 hover:bg-muted/30 transition-colors text-left"
                >
                  {showInteraction
                    ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    : <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  }
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">
                    Interactivity
                  </span>
                  {(shelfSpec.interaction?.pointSelection || shelfSpec.interaction?.intervalBrush) && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                      on
                    </span>
                  )}
                </button>
                {showInteraction && (
                  <div className="p-2.5 space-y-2 border-t border-border/50">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-medium text-foreground">Mark click</div>
                        <div className="text-[10px] text-muted-foreground">Fires onMarkClick with {"{{ event.datum }}"}</div>
                      </div>
                      <Switch
                        className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5"
                        checked={!!shelfSpec.interaction?.pointSelection}
                        onCheckedChange={(v) => handleInteractionChange('pointSelection', !!v)}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-medium text-foreground">Brush select</div>
                        <div className="text-[10px] text-muted-foreground">Fires onBrush with {"{{ event.value }}"}</div>
                      </div>
                      <Switch
                        className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5"
                        checked={!!shelfSpec.interaction?.intervalBrush}
                        onCheckedChange={(v) => handleInteractionChange('intervalBrush', !!v)}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                      Chain in widget Events: onMarkClick → SET_VARIABLE (e.g. selectedCategory = {"{{ event.datum.category }}"}) → EXECUTE_QUERY for drill-down.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Section: Chart Style ── */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowStyle(!showStyle)}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/10 hover:bg-muted/30 transition-colors text-left"
                >
                  {showStyle
                    ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    : <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  }
                  <Palette className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Style
                  </span>
                </button>
                {showStyle && (
                  <div className="p-2.5 space-y-2.5 border-t border-border/50">
                    {/* Mark type */}
                    <div>
                      <Label className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 block">Mark Type</Label>
                      <MarkSelector value={shelfSpec.mark || 'auto'} onChange={handleMarkChange} />
                      {shelfSpec.mark === 'auto' && (
                        <div className="text-[9px] text-muted-foreground italic mt-0.5">
                          Resolved: <span className="font-medium text-foreground not-italic">{resolvedMark}</span>
                        </div>
                      )}
                    </div>

                    {/* Mark props: point overlay / interpolation / bar + opacity */}
                    <div className="rounded border border-border/50 bg-muted/20 p-2 space-y-2">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground block">Mark Props</span>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[11px] text-muted-foreground">Points on line/area</Label>
                        <Switch
                          className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5"
                          checked={!!shelfSpec.markProps?.point}
                          onCheckedChange={(v) => handleMarkPropChange('point', v || undefined)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[11px] text-muted-foreground mb-0.5 block">Interpolate</Label>
                          <Select value={shelfSpec.markProps?.interpolate || 'none'} onValueChange={(v) => handleMarkPropChange('interpolate', v === 'none' ? undefined : v)}>
                            <SelectTrigger className="text-[11px] h-7"><SelectValue placeholder="linear" /></SelectTrigger>
                            <SelectContent className="z-[200]">
                              <SelectItem value="none">default</SelectItem>
                              {INTERPOLATE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground mb-0.5 block">Opacity</Label>
                          <Input
                            type="number" min="0" max="1" step="0.1"
                            value={shelfSpec.markProps?.opacity ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              handleMarkPropChange('opacity', v === '' ? undefined : Number(v));
                            }}
                            placeholder="0–1"
                            className="w-full text-[11px] h-7"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[11px] text-muted-foreground mb-0.5 block">Bar radius</Label>
                          <Input
                            type="number" min="0" max="20"
                            value={shelfSpec.markProps?.cornerRadius ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              handleMarkPropChange('cornerRadius', v === '' ? undefined : Number(v));
                            }}
                            placeholder="0"
                            className="w-full text-[11px] h-7"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground mb-0.5 block">Line width</Label>
                          <Input
                            type="number" min="1" max="8"
                            value={shelfSpec.markProps?.lineWidth ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              handleMarkPropChange('lineWidth', v === '' ? undefined : Number(v));
                            }}
                            placeholder="2"
                            className="w-full text-[11px] h-7"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title + subtitle (bindings supported, e.g. {{ state.variables.region }}) */}
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-0.5 block">Title</Label>
                        <TemplateAutocompleteInput
                          value={shelfSpec.config?.title || ''}
                          onChange={(val) => handleConfigChange('title', val)}
                          placeholder="Untitled"
                          liveStateTree={liveStateTree}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-0.5 block">Subtitle</Label>
                        <TemplateAutocompleteInput
                          value={shelfSpec.config?.subtitle || ''}
                          onChange={(val) => handleConfigChange('subtitle', val)}
                          placeholder="Optional subtitle"
                          liveStateTree={liveStateTree}
                        />
                      </div>
                    </div>

                    {/* Color Scheme */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-0.5 block">Colors</Label>
                      <Select value={shelfSpec.config?.colorScheme || 'tableau10'} onValueChange={(val) => handleConfigChange('colorScheme', val)}>
                        <SelectTrigger className="text-[11px] h-7"><SelectValue /></SelectTrigger>
                        <SelectContent className="z-[200]">
                          {COLOR_SCHEMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Axes + legend chrome */}
                    <div className="rounded border border-border/50 bg-muted/20 p-2 space-y-2">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground block">Axes & Legend</span>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[11px] text-muted-foreground">Gridlines</Label>
                        <Switch
                          className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5"
                          checked={shelfSpec.config?.showGrid !== false}
                          onCheckedChange={(v) => handleConfigChange('showGrid', !!v)}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[11px] text-muted-foreground">Legend</Label>
                        <Switch
                          className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5"
                          checked={shelfSpec.config?.showLegend !== false}
                          onCheckedChange={(v) => handleConfigChange('showLegend', !!v)}
                        />
                      </div>
                      {shelfSpec.config?.showLegend !== false && (
                        <div>
                          <Label className="text-[11px] text-muted-foreground mb-0.5 block">Legend position</Label>
                          <Select value={shelfSpec.config?.legendPosition || 'right'} onValueChange={(v) => handleConfigChange('legendPosition', v)}>
                            <SelectTrigger className="text-[11px] h-7"><SelectValue /></SelectTrigger>
                            <SelectContent className="z-[200]">
                              {['right', 'left', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'none'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[11px] text-muted-foreground">Data labels</Label>
                        <Switch
                          className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5"
                          checked={!!shelfSpec.config?.showDataLabels}
                          onCheckedChange={(v) => handleConfigChange('showDataLabels', !!v)}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[11px] text-muted-foreground">Trend line</Label>
                        <Switch
                          className="h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5"
                          checked={!!shelfSpec.config?.trendLine}
                          onCheckedChange={(v) => handleConfigChange('trendLine', !!v)}
                        />
                      </div>
                    </div>

                    {/* Reference line */}
                    <div className="rounded border border-border/50 bg-muted/20 p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Reference line</span>
                        {shelfSpec.config?.referenceLine && (
                          <button
                            type="button"
                            onClick={() => handleConfigChange('referenceLine', null)}
                            className="text-[10px] text-muted-foreground hover:text-destructive"
                          >
                            remove
                          </button>
                        )}
                      </div>
                      {!shelfSpec.config?.referenceLine ? (
                        <Button
                          type="button" variant="outline" size="sm"
                          className="h-6 text-[11px] w-full"
                          onClick={() => handleConfigChange('referenceLine', { value: '', label: '', color: '#ef4444', axis: 'y' })}
                        >
                          + Add reference line
                        </Button>
                      ) : (
                        <>
                          <div>
                            <Label className="text-[11px] text-muted-foreground mb-0.5 block">Value (number or {"{{ binding }}"})</Label>
                            <TemplateAutocompleteInput
                              value={shelfSpec.config.referenceLine.value ?? ''}
                              onChange={(val) => handleConfigChange('referenceLine', { ...shelfSpec.config.referenceLine, value: val })}
                              placeholder="e.g. 100 or {{ state.variables.target }}"
                              liveStateTree={liveStateTree}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[11px] text-muted-foreground mb-0.5 block">Label</Label>
                              <Input
                                value={shelfSpec.config.referenceLine.label || ''}
                                onChange={(e) => handleConfigChange('referenceLine', { ...shelfSpec.config.referenceLine, label: e.target.value })}
                                placeholder="Target"
                                className="w-full text-[11px] h-7"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px] text-muted-foreground mb-0.5 block">Axis</Label>
                              <Select value={shelfSpec.config.referenceLine.axis || 'y'} onValueChange={(v) => handleConfigChange('referenceLine', { ...shelfSpec.config.referenceLine, axis: v })}>
                                <SelectTrigger className="text-[11px] h-7"><SelectValue /></SelectTrigger>
                                <SelectContent className="z-[200]">
                                  <SelectItem value="y">horizontal (y)</SelectItem>
                                  <SelectItem value="x">vertical (x)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label className="text-[11px] text-muted-foreground mb-0.5 block">Color</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={/^#[0-9a-fA-F]{6}$/.test(shelfSpec.config.referenceLine.color || '') ? shelfSpec.config.referenceLine.color : '#ef4444'}
                                onChange={(e) => handleConfigChange('referenceLine', { ...shelfSpec.config.referenceLine, color: e.target.value })}
                                className="h-7 w-9 rounded border border-border bg-background p-0.5"
                              />
                              <Input
                                value={shelfSpec.config.referenceLine.color || '#ef4444'}
                                onChange={(e) => handleConfigChange('referenceLine', { ...shelfSpec.config.referenceLine, color: e.target.value })}
                                className="w-full text-[11px] h-7 font-mono"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Width + Height */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                          <Label className="text-xs font-medium text-muted-foreground mb-0.5 block">Width</Label>
                        <Select value={shelfSpec.config?.width === 'container' ? 'container' : 'custom'} onValueChange={(val) => handleConfigChange('width', val === 'container' ? 'container' : 400)}>
                          <SelectTrigger className="text-[11px] h-7"><SelectValue /></SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="container">Fill</SelectItem>
                            <SelectItem value="custom">Fixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                          <Label className="text-xs font-medium text-muted-foreground mb-0.5 block">Height</Label>
                        <Input
                          type="number"
                          value={shelfSpec.config?.height || 300}
                          onChange={(e) => handleConfigChange('height', parseInt(e.target.value) || 300)}
                          className="w-full text-[11px] h-7"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

ShelfBuilder.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  queryResults: PropTypes.object,
  stateTree: PropTypes.object,
  liveStateTree: PropTypes.object,
};
