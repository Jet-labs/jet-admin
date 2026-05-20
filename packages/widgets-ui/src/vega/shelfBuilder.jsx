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

import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@jet-admin/ui";
import { Settings, ChevronDown, ChevronRight, Database, TrendingUp } from 'lucide-react';
// Widget-specific string constants (inlined since this is a shared package)
const VEGA_STRINGS = {
  WIDGET_DATASET_FIELD_MAPPING_BUTTON: "Mappings",
};
const PRIMARY_SHELVES = ['x', 'y', 'color', 'size'];
const SECONDARY_SHELVES = ['row', 'column', 'shape', 'opacity', 'detail', 'text'];

/**
 * ShelfBuilder — The main Tableau/Voyager-style visual builder.
 * Three-panel layout: Data Fields | Encoding Shelves | (Preview handled externally)
 *
 * Uses scoped CSS classes to prevent dark-theme bleed.
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

  // Modal state
  const [isOpen, setIsOpen] = useState(false);

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
  const hasDataSources = !!(queryResults && Object.keys(queryResults).length > 0);
  const isWorkflowSelected = !!selectedWorkflow;
  const hasAnyData = isWorkflowSelected || hasDataSources;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            <TrendingUp className="inline-block h-3 w-3 mr-2" />
            {VEGA_STRINGS.WIDGET_DATASET_FIELD_MAPPING_BUTTON}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-6xl w-[95vw] h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-brand-dark border-border shadow-2xl">
          {/* Modal Header */}
          <DialogHeader className="flex flex-row items-center px-4 py-3 border-b border-border bg-brand-dark shrink-0 space-y-0">
            <div className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              <DialogTitle className="text-base font-bold m-0 p-0 text-left">Visual Chart Editor</DialogTitle>
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-hidden bg-muted/30 flex p-3 gap-3 min-h-0">
              
              {!hasAnyData ? (
                <div className="flex flex-col items-center justify-center w-full h-full text-center border-2 border-dashed border-border rounded-sm bg-brand-dark">
                  <Database className="w-10 h-10 mb-3 text-muted-foreground/40" />
                  <p className="text-sm font-semibold text-foreground mb-1">No Data Source Selected</p>
                  <p className="text-xs text-muted-foreground">Add a Data Source in the Data tab and run a Test, or select a Workflow.</p>
                </div>
              ) : (
                <>
                  {/* PANE 1: Data Dictionary */}
                  <div className="flex flex-col w-56 shrink-0 bg-brand-dark border border-border rounded-md overflow-hidden min-h-0 h-full">
                    <div className="p-2 border-b border-border bg-brand-dark">
                      <Select value={shelfSpec.dataSource || ''} onValueChange={(val) => handleDataSourceChange(val)}>
                        <SelectTrigger className="text-xs font-medium">
                          <SelectValue placeholder="Select Data Input" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {selectedWorkflow && <SelectItem value="workflow">Workflow Output</SelectItem>}
                          {workflowContext && Object.keys(workflowContext).map(key => (
                            <SelectItem key={key} value={`{{ctx.${key}}}`}>{`ctx.${key}`}</SelectItem>
                          ))}
                          {queryResults && Object.keys(queryResults).map(alias => (
                            <SelectItem key={`qr-${alias}`} value={`{{${alias}.data}}`}>{alias} (Data Source)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 overflow-hidden outline-none min-h-0">
                      <DataFieldPanel
                        workflowContext={workflowContext}
                        queryResults={queryResults}
                        dataSource={shelfSpec.dataSource}
                        onDataSourceChange={handleDataSourceChange}
                        onFieldClick={handleFieldQuickAdd}
                        workflow={selectedWorkflow}
                        className="h-full"
                      />
                    </div>
                  </div>

                  {/* PANE 2: Encoding Shelves */}
                  <div className="flex-1 flex flex-col h-full overflow-y-auto min-h-0 pr-1 gap-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Encoding Shelves</Label>
                    
                    {/* Core Shelves */}
                    <div className="bg-brand-dark border border-border rounded-md p-3 flex flex-col gap-3">
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

                    {/* Dynamic Secondary Shelves */}
                    <div className="bg-brand-dark border border-border rounded-md mt-2">
                      <div
                        onClick={() => setShowSecondary(!showSecondary)}
                        className="w-full flex items-center justify-start p-2.5 border-b border-border hover:bg-muted transition-colors focus:outline-none bg-brand-dark font-medium cursor-pointer"
                      >
                        {showSecondary ? <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                          More Channels <span className="text-primary ml-1">({SECONDARY_SHELVES.filter(ch => shelfSpec.encoding[ch]?.field).length} active)</span>
                        </span>
                      </div>
                      
                      {showSecondary && (
                        <div className="p-3 flex flex-col gap-3 bg-muted/30">
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

                  {/* PANE 3: Marks & Configuration */}
                  <div className="flex flex-col w-64 shrink-0 h-full overflow-y-auto min-h-0 pl-1 gap-1.5 pb-4">
                    <div
                      onClick={() => setShowStyle(!showStyle)}
                      className="flex items-center gap-2 p-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors bg-transparent cursor-pointer"
                    >
                      {showStyle ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">Chart Style & Settings</span>
                    </div>
                    
                    {showStyle && (
                      <div className="bg-brand-dark border border-border rounded-md p-3 space-y-4">
                        <div>
                          <Label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Marks</Label>
                          <div className="bg-muted/30 border border-border rounded-md p-2">
                            <MarkSelector value={shelfSpec.mark || 'auto'} onChange={handleMarkChange} />
                            {shelfSpec.mark === 'auto' && (
                              <div className="text-[10px] text-muted-foreground italic p-1 text-center mt-1">
                                Auto-resolved to: <span className="font-semibold text-foreground not-italic ml-1">{resolvedMark}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 space-y-3">
                          <Label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Appearance</Label>
                          <div>
                            <Label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Chart Title</Label>
                            <Input
                              type="text"
                              value={shelfSpec.config?.title || ''}
                              onChange={(e) => handleConfigChange('title', e.target.value)}
                              placeholder="Untitled Chart"
                              className="w-full text-xs"
                            />
                          </div>
                          <div>
                            <Label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Color Palette</Label>
                            <Select value={shelfSpec.config?.colorScheme || 'tableau10'} onValueChange={(val) => handleConfigChange('colorScheme', val)}>
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent className="z-[200]">
                                {COLOR_SCHEMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Width</Label>
                              <Select value={shelfSpec.config?.width === 'container' ? 'container' : 'custom'} onValueChange={(val) => handleConfigChange('width', val === 'container' ? 'container' : 400)}>
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent className="z-[200]">
                                  <SelectItem value="container">Fill</SelectItem>
                                  <SelectItem value="custom">Fixed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Height</Label>
                              <Input
                                type="number"
                                value={shelfSpec.config?.height || 300}
                                onChange={(e) => handleConfigChange('height', parseInt(e.target.value) || 300)}
                                className="w-full text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <DialogFooter className="px-4 py-2.5 bg-brand-dark shrink-0 mt-2">
               <Button
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

ShelfBuilder.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  workflowContext: PropTypes.object,
  workflows: PropTypes.array,
  queryResults: PropTypes.object,
};
