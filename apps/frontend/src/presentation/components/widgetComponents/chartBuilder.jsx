import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ChartTypeSelector } from './chartTypeSelector';
import { EncodingChannelEditor } from './encodingChannelEditor';
import { VariablePathPicker } from './variablePathPicker';
import { CollapseComponent } from '../ui/collapseComponent';
import { generateVegaLiteSpec, getDefaultChartConfig } from '@jet-admin/widgets-logic';
import { Input, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@jet-admin/ui";


export const ChartBuilder = ({ widgetEditorForm, workflowContext, workflows }) => {
  // Local state for the builder configuration
  // We sync this to widgetEditorForm.values.widgetConfig.chartBuilderSpec
  const [builderSpec, setBuilderSpec] = useState(() => {
    // Initialize from form state if it exists, otherwise use default
    return widgetEditorForm.values.widgetConfig?.chartBuilderSpec || getDefaultChartConfig('bar');
  });

  // Update local state if the form async loads the widget config from API
  useEffect(() => {
    const savedSpec = widgetEditorForm.values.widgetConfig?.chartBuilderSpec;
    if (savedSpec && JSON.stringify(savedSpec) !== JSON.stringify(builderSpec)) {
      setBuilderSpec(savedSpec);
    }
  }, [widgetEditorForm.values.widgetConfig?.chartBuilderSpec]);

  // Derived available fields based on selected data source path and context
  const availableFields = useMemo(() => {
    if (!workflowContext || !builderSpec.data?.source) return [];
    
    // Extract property path from mustache tag, e.g., '{{ctx.queryResult.rows}}' -> 'queryResult.rows'
    const match = builderSpec.data.source.match(/\{\{ctx\.([^}]+)\}\}/);
    if (!match) return [];
    
    const path = match[1];
    const pathParts = path.split('.');
    
    // Traverse context to find the data array
    let current = workflowContext;
    for (const part of pathParts) {
      if (current === undefined || current === null) break;
      current = current[part];
    }
    
    // If it's an array of objects, extract the keys from the first object
    if (Array.isArray(current) && current.length > 0 && typeof current[0] === 'object') {
      return Object.keys(current[0]);
    }
    
    return [];
  }, [workflowContext, builderSpec.data?.source]);

  // Selected workflow object for variable picker
  const selectedWorkflow = useMemo(() => {
    const workflowID = widgetEditorForm.values.workflowID;
    if (!workflowID || !workflows) return null;
    return workflows.find(w => String(w.workflowID) === String(workflowID));
  }, [widgetEditorForm.values.workflowID, workflows]);

  // Handle changes to any part of the builder spec
  const handleSpecChange = (updatePath, newValue) => {
    setBuilderSpec(prev => {
      // Deep clone and update
      const nextSpec = JSON.parse(JSON.stringify(prev));
      
      // Navigate to the target path and apply update
      const pathParts = updatePath.split('.');
      let current = nextSpec;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) current[pathParts[i]] = {};
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = newValue;
      
      return nextSpec;
    });
  };

  // Sync builderSpec -> form spec whenever it changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Generate the raw Vega-Lite spec from our visual config
      const vegaSpec = generateVegaLiteSpec(builderSpec);
      
      // Update form values
      widgetEditorForm.setFieldValue('widgetConfig.chartBuilderSpec', builderSpec);
      widgetEditorForm.setFieldValue('widgetConfig.vegaSpec', vegaSpec);
    }, 300); // Small debounce to avoid typing lag
    
    return () => clearTimeout(timer);
  }, [builderSpec, widgetEditorForm]);

  // Handle chart type change (swaps out defaults if completely new)
  const handleChartTypeChange = (newType) => {
    if (newType === builderSpec.chartType) return;
    
    // Keep data and fields if possible, but swap the general structure
    const newDefaults = getDefaultChartConfig(newType);
    
    setBuilderSpec(prev => ({
      ...newDefaults,
      data: { ...prev.data },
      encoding: {
        ...newDefaults.encoding,
        // Try to keep user's mapped fields if the new chart type supports them
        x: newDefaults.encoding.x && prev.encoding.x ? { ...newDefaults.encoding.x, field: prev.encoding.x.field } : newDefaults.encoding.x,
        y: newDefaults.encoding.y && prev.encoding.y ? { ...newDefaults.encoding.y, field: prev.encoding.y.field } : newDefaults.encoding.y,
        color: newDefaults.encoding.color && prev.encoding.color ? { ...newDefaults.encoding.color, field: prev.encoding.color.field } : newDefaults.encoding.color,
      },
      style: {
        ...prev.style, // preserve user chosen title/colors
      }
    }));
  };

  // If no workflow is selected, prompt user to select one first
  if (!selectedWorkflow) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center bg-white border border-dashed border-slate-300 rounded">
        <p className="text-sm font-medium text-slate-600 mb-1">No Data Source Selected</p>
        <p className="text-xs text-slate-500">Please select a Workflow Data Source above to start building your chart.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Chart Type */}
      <div className="bg-white border border-slate-200 p-3 rounded">
        <h3 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Chart Type</h3>
        <ChartTypeSelector 
          value={builderSpec.chartType} 
          onChange={handleChartTypeChange} 
        />
      </div>

      {/* 2. Data Source */}
      <div className="bg-white border border-slate-200 p-3 rounded">
        <h3 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Data Source</h3>
        <VariablePathPicker
          value={builderSpec.data?.source || ''}
          onChange={(val) => handleSpecChange('data.source', typeof val === 'string' ? val : val.variablePath)}
          workflow={selectedWorkflow}
          placeholder="e.g., {{ctx.queryResult.rows}}"
          showTransforms={true}
        />
        {availableFields.length > 0 && (
          <p className="text-[10px] text-green-600 mt-1">
            ✓ Data structure detected. Found {availableFields.length} columns.
          </p>
        )}
      </div>

      {/* 3. Encoding Channels */}
      <div className="bg-white border border-slate-200 p-3 rounded">
        <h3 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Data Mapping</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* X Axis (or Color for Pie) */}
          {builderSpec.encoding.x !== undefined && (
            <EncodingChannelEditor
              channelName="x"
              label={builderSpec.chartType === 'pie' || builderSpec.chartType === 'donut' ? 'Category Setup' : 'X-Axis'}
              value={builderSpec.encoding.x}
              onChange={(val) => handleSpecChange('encoding.x', val)}
              availableFields={availableFields}
            />
          )}

          {/* Y Axis (or Value for Pie) */}
          {builderSpec.encoding.y !== undefined && (
            <EncodingChannelEditor
              channelName="y"
              label={builderSpec.chartType === 'pie' || builderSpec.chartType === 'donut' ? 'Value/Size' : 'Y-Axis'}
              value={builderSpec.encoding.y}
              onChange={(val) => handleSpecChange('encoding.y', val)}
              availableFields={availableFields}
            />
          )}

          {/* Optional Channels */}
          {builderSpec.chartType !== 'pie' && builderSpec.chartType !== 'donut' && builderSpec.chartType !== 'histogram' && (
            <>
              {/* Color */}
              <EncodingChannelEditor
                channelName="color"
                label="Group By (Color)"
                value={builderSpec.encoding.color}
                onChange={(val) => handleSpecChange('encoding.color', val)}
                onRemove={() => handleSpecChange('encoding.color', null)}
                isOptional={true}
                availableFields={availableFields}
              />
              
              {/* Size (only scatter ideally, but allow anyway) */}
              {(builderSpec.chartType === 'scatter' || builderSpec.encoding.size !== undefined) && (
                <EncodingChannelEditor
                  channelName="size"
                  label="Point Size"
                  value={builderSpec.encoding.size}
                  onChange={(val) => handleSpecChange('encoding.size', val)}
                  onRemove={() => handleSpecChange('encoding.size', null)}
                  isOptional={true}
                  availableFields={availableFields}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. Appearance & Style */}
      <CollapseComponent
        showButtonText="Chart Appearance"
        hideButtonText="Hide Appearance"
        className="bg-white border border-slate-200 rounded"
        containerClass="p-3"
        buttonClass="w-full text-xs font-semibold text-slate-700 p-3 uppercase tracking-wide flex justify-between items-center outline-none bg-slate-50 hover:bg-slate-100 rounded-t"
        content={() => (
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Chart Title</label>
              <Input
                type="text"
                value={builderSpec.style?.title || ''}
                onChange={(e) => handleSpecChange('style.title', e.target.value)}
                placeholder="Optional chart title"
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Color Palette</label>
              <Select value={builderSpec.style?.colorScheme || 'tableau10'} onValueChange={(val) => handleSpecChange('style.colorScheme', val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select palette" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categorical</SelectLabel>
                    <SelectItem value="tableau10">Tableau 10</SelectItem>
                    <SelectItem value="category10">Category 10</SelectItem>
                    <SelectItem value="category20">Category 20</SelectItem>
                    <SelectItem value="dark2">Dark 2</SelectItem>
                    <SelectItem value="set1">Set 1</SelectItem>
                    <SelectItem value="set2">Set 2</SelectItem>
                    <SelectItem value="set3">Set 3</SelectItem>
                    <SelectItem value="pastel1">Pastel 1</SelectItem>
                    <SelectItem value="pastel2">Pastel 2</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Sequential</SelectLabel>
                    <SelectItem value="blues">Blues</SelectItem>
                    <SelectItem value="greens">Greens</SelectItem>
                    <SelectItem value="oranges">Oranges</SelectItem>
                    <SelectItem value="purples">Purples</SelectItem>
                    <SelectItem value="reds">Reds</SelectItem>
                    <SelectItem value="greys">Greys</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Diverging</SelectLabel>
                    <SelectItem value="viridis">Viridis</SelectItem>
                    <SelectItem value="magma">Magma</SelectItem>
                    <SelectItem value="inferno">Inferno</SelectItem>
                    <SelectItem value="plasma">Plasma</SelectItem>
                    <SelectItem value="spectral">Spectral</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Height (px)</label>
              <Input
                type="number"
                value={builderSpec.style?.height || 300}
                onChange={(e) => handleSpecChange('style.height', parseInt(e.target.value) || 300)}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Width</label>
              <Select value={builderSpec.style?.width === 'container' ? 'container' : 'custom'} onValueChange={(val) => handleSpecChange('style.width', val === 'container' ? 'container' : 400)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="container">Fill Container (Responsive)</SelectItem>
                  <SelectItem value="custom">Fixed Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      />
    </div>
  );
};

ChartBuilder.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  workflowContext: PropTypes.object,
  workflows: PropTypes.array,
};
