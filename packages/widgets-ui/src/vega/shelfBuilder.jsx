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
} from "./chartSpecGenerator";
import { getSuggestionsFromStateTree } from '../intellisense/suggestionEngine';

import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { ChevronDown, ChevronRight, Database, TrendingUp, Layers, Palette } from 'lucide-react';

const PRIMARY_SHELVES = ['x', 'y', 'color', 'size'];
const SECONDARY_SHELVES = ['row', 'column', 'shape', 'opacity', 'detail', 'text'];

/**
 * ShelfBuilder — Inline collapsible Vega-Lite visual builder.
 * Designed for narrow sidebar rendering (~300px wide).
 * 
 * Layout: Data Source → Fields → Encoding Shelves → Style (all stacked vertically).
 */
export const ShelfBuilder = ({
  widgetEditorForm,
  workflowContext,
  workflows,
  queryResults,
}) => {

  // Initialize shelf spec from form or defaults
  const [shelfSpec, setShelfSpec] = useState(() => {
    let savedSpec = widgetEditorForm.values.widgetConfig?.shelfSpec;
    if (typeof savedSpec === 'string') {
      try {
        savedSpec = JSON.parse(savedSpec);
      } catch (e) {
        savedSpec = null;
      }
    }
    return savedSpec || getDefaultShelfSpec();
  });
  
  // Update local state if the form async loads the widget config from API
  useEffect(() => {
    let savedSpec = widgetEditorForm.values.widgetConfig?.shelfSpec;
    if (savedSpec) {
      if (typeof savedSpec === 'string') {
        try { savedSpec = JSON.parse(savedSpec); } catch (e) { return; }
      }
      // If the incoming loaded spec is different from our local spec, update it.
      // We check via JSON stringify to avoid infinite loops since we also push back to form.
      if (JSON.stringify(savedSpec) !== JSON.stringify(shelfSpec)) {
        setShelfSpec(savedSpec);
      }
    }
  }, [widgetEditorForm.values.widgetConfig?.shelfSpec]);

  const [showSecondary, setShowSecondary] = useState(false);
  const [showStyle, setShowStyle] = useState(false);

  // Selected workflow
  const selectedWorkflow = useMemo(() => {
    const wID = widgetEditorForm.values.workflowID;
    if (!wID || !workflows) return null;
    return workflows.find(w => String(w.workflowID) === String(wID));
  }, [widgetEditorForm.values.workflowID, workflows]);

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

  // ── Centralized suggestions from state tree ──
  const stateTreeSuggestions = useMemo(
    () => getSuggestionsFromStateTree(workflowContext),
    [workflowContext]
  );

  // Discover array paths for data source picker
  const discoveredArrayPaths = useMemo(() => {
    return stateTreeSuggestions
      .filter(s => s.valueType === 'array')
      .map(s => {
        const bracePath = `{{${s.value}}}`;
        return {
          path: bracePath,  // {{state.queries.alias.data}}
          label: bracePath,  // {{state.queries.alias.data}}
          description: s.detail,
        };
      });
  }, [stateTreeSuggestions]);

  // Quick fallback if no data source available
  const hasDataSources = discoveredArrayPaths.length > 0;
  const isWorkflowSelected = !!selectedWorkflow;
  const hasAnyData = isWorkflowSelected || hasDataSources;

  // Active encoding count
  const activeCount = [...PRIMARY_SHELVES, ...SECONDARY_SHELVES].filter(ch => shelfSpec.encoding[ch]?.field).length;

  return (
    <div className="w-full">
      {/* ── Collapsible Header ── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md border border-border bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors text-left"
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
        <div className="mt-1.5 rounded-md border border-border bg-card overflow-hidden">

          {!hasAnyData ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Database className="w-7 h-7 mb-2 text-muted-foreground/30" />
              <p className="text-xs font-medium text-foreground mb-0.5">No Data Source</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
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
                <Select value={shelfSpec.dataSource || ''} onValueChange={(val) => handleDataSourceChange(val)}>
                  <SelectTrigger className="h-7 text-[11px] font-mono">
                    <SelectValue placeholder="Select data input..." />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {selectedWorkflow && (
                      <SelectItem value={`{{state.workflows.${selectedWorkflow.alias}.data}}`}>
                        Workflow: {selectedWorkflow.alias}
                      </SelectItem>
                    )}
                    {discoveredArrayPaths.map((arr) => (
                      <SelectItem key={arr.path} value={arr.path}>
                        {arr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Section: Discovered Fields ── */}
              <div className="border-b border-border/50 max-h-[220px] overflow-y-auto">
                <DataFieldPanel
                  workflowContext={workflowContext}
                  queryResults={queryResults}
                  dataSource={shelfSpec.dataSource}
                  onDataSourceChange={handleDataSourceChange}
                  onFieldClick={handleFieldQuickAdd}
                  workflow={selectedWorkflow}
                  compact
                />
              </div>

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

                    {/* Title */}
                    <div>
                      <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Title</Label>
                      <Input
                        type="text"
                        value={shelfSpec.config?.title || ''}
                        onChange={(e) => handleConfigChange('title', e.target.value)}
                        placeholder="Untitled"
                        className="w-full text-[11px] h-7"
                      />
                    </div>

                    {/* Color Scheme */}
                    <div>
                      <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Colors</Label>
                      <Select value={shelfSpec.config?.colorScheme || 'tableau10'} onValueChange={(val) => handleConfigChange('colorScheme', val)}>
                        <SelectTrigger className="text-[11px] h-7"><SelectValue /></SelectTrigger>
                        <SelectContent className="z-[200]">
                          {COLOR_SCHEMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Width + Height */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Width</Label>
                        <Select value={shelfSpec.config?.width === 'container' ? 'container' : 'custom'} onValueChange={(val) => handleConfigChange('width', val === 'container' ? 'container' : 400)}>
                          <SelectTrigger className="text-[11px] h-7"><SelectValue /></SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="container">Fill</SelectItem>
                            <SelectItem value="custom">Fixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Height</Label>
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
  workflowContext: PropTypes.object,
  workflows: PropTypes.array,
  queryResults: PropTypes.object,
};
