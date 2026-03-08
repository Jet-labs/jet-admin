import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DataFieldPanel } from './dataFieldPanel';
import { EncodingShelf } from './encodingShelf';
import { MarkSelector } from './markSelector';
import { generateVegaLiteSpec, getDefaultShelfSpec, inferMarkType, COLOR_SCHEMES } from '@jet-admin/widgets-logic';
import { FiSettings, FiChevronDown, FiChevronRight, FiDatabase } from 'react-icons/fi';
import { MdOutlineAutoGraph } from 'react-icons/md';

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
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

  // Quick fallback if no workflow selected
  const isWorkflowSelected = !!selectedWorkflow;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 hover:!text-indigo-600 ml-auto bg-white border-slate-200 text-slate-600 shadow-sm"
        title="Map Data Fields"
      >
        <MdOutlineAutoGraph className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-800/40 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white rounded shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2 text-slate-800">
                <MdOutlineAutoGraph className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold">Visual Chart Editor</h3>
              </div>
              <Button 
                onClick={() => setIsOpen(false)} 
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden bg-slate-50/50 flex p-5 gap-5">
              
              {!isWorkflowSelected ? (
                <div className="flex flex-col items-center justify-center w-full h-full text-center border-2 border-dashed border-slate-300 rounded bg-white">
                  <FiDatabase className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600 mb-1">No Data Source Selected</p>
                  <p className="text-xs text-slate-400">Select a Workflow in the configuration panel to start building your chart.</p>
                </div>
              ) : (
                <>
                  {/* PANE 1: Data Dictionary */}
                  <div className="flex flex-col w-64 shrink-0 bg-white border border-slate-100 rounded shadow-sm overflow-hidden h-full">
                    <div className="p-3 border-b border-slate-100 bg-white">
                      <Select value={shelfSpec.dataSource || ''} onValueChange={(val) => handleDataSourceChange(val)}>
                        <SelectTrigger className="text-xs font-medium">
                          <SelectValue placeholder="Select Data Input" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {selectedWorkflow && <SelectItem value="workflow">Workflow Output</SelectItem>}
                          {workflowContext && Object.keys(workflowContext).map(key => (
                            <SelectItem key={key} value={`{{ctx.${key}}}`}>{`ctx.${key}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 overflow-y-auto outline-none">
                      <DataFieldPanel
                        workflowContext={workflowContext}
                        dataSource={shelfSpec.dataSource}
                        onDataSourceChange={handleDataSourceChange}
                        onFieldClick={handleFieldQuickAdd}
                        workflow={selectedWorkflow}
                        className="h-full"
                      />
                    </div>
                  </div>

                  {/* PANE 2: Encoding Shelves */}
                  <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2 gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">Encoding Shelves</label>
                    
                    {/* Core Shelves */}
                    <div className="bg-white border border-slate-100 rounded shadow-sm p-4 flex flex-col gap-4">
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
                    <div className="bg-white border border-slate-100 rounded shadow-sm mt-3">
                      <div
                        onClick={() => setShowSecondary(!showSecondary)}
                        className="w-full flex items-center justify-start p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors focus:outline-none bg-white font-medium cursor-pointer"
                      >
                        {showSecondary ? <FiChevronDown className="w-4 h-4 mr-2 text-slate-400" /> : <FiChevronRight className="w-4 h-4 mr-2 text-slate-400" />}
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          More Encoding Channels <span className="text-indigo-500 ml-1">({SECONDARY_SHELVES.filter(ch => shelfSpec.encoding[ch]?.field).length} active)</span>
                        </span>
                      </div>
                      
                      {showSecondary && (
                        <div className="p-4 pt-3 flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50">
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
                  <div className="flex flex-col w-72 shrink-0 h-full overflow-y-auto pl-2 gap-1.5">
                    <div
                      onClick={() => setShowStyle(!showStyle)}
                      className="flex items-center gap-2 p-1 text-slate-500 hover:text-slate-800 focus:outline-none transition-colors mb-1 bg-transparent cursor-pointer"
                    >
                      {showStyle ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                      <span className="text-[11px] font-bold uppercase tracking-widest">Chart Style & Settings</span>
                    </div>
                    
                    {showStyle && (
                      <div className="bg-white border border-slate-100 rounded shadow-sm p-4 space-y-6">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Marks</label>
                          <div className="bg-slate-50 border border-slate-100 rounded p-2">
                            <MarkSelector value={shelfSpec.mark || 'auto'} onChange={handleMarkChange} />
                            {shelfSpec.mark === 'auto' && (
                              <div className="text-[10px] text-slate-400 italic p-1.5 text-center mt-1.5">
                                Auto-resolved to: <span className="font-semibold text-slate-600 not-italic ml-1">{resolvedMark}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-5 space-y-4">
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Appearance</label>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Chart Title</label>
                            <Input
                              type="text"
                              value={shelfSpec.config?.title || ''}
                              onChange={(e) => handleConfigChange('title', e.target.value)}
                              placeholder="Untitled Chart"
                              className="w-full px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Color Palette</label>
                            <Select value={shelfSpec.config?.colorScheme || 'tableau10'} onValueChange={(val) => handleConfigChange('colorScheme', val)}>
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent className="z-[200]">
                                {COLOR_SCHEMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Width</label>
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
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Height</label>
                              <Input
                                type="number"
                                value={shelfSpec.config?.height || 300}
                                onChange={(e) => handleConfigChange('height', parseInt(e.target.value) || 300)}
                                className="w-full px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
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
            <div className="flex items-center justify-end px-5 py-3 border-t border-slate-100 bg-white shrink-0">
               <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
              >
                Done
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

ShelfBuilder.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  workflowContext: PropTypes.object,
  workflows: PropTypes.array,
};
