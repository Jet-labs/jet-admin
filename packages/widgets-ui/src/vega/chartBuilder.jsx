import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ChartTypeSelector } from './chartTypeSelector';
import { EncodingChannelEditor } from './encodingChannelEditor';
import { VariablePathPicker } from './variablePathPicker';
import { CollapseComponent } from '../ui/collapseComponent';
import { generateVegaLiteSpec, getDefaultChartConfig } from './chartSpecGenerator';
import { Input, Label, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { getValueByPath } from '@jet-admin/expression-engine';

// ─── Section card wrapper (matches UI_GUIDELINES_V3 section card pattern) ────

function Section({ title, description, children }) {
  return (
    <div className="rounded-md border border-border bg-card p-3 space-y-3">
      {(title || description) && (
        <div>
          {title && (
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {title}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export const ChartBuilder = ({ widgetEditorForm, workflowContext, workflows }) => {
  const [builderSpec, setBuilderSpec] = useState(() => {
    return widgetEditorForm.values.widgetConfig?.chartBuilderSpec || getDefaultChartConfig('bar');
  });

  useEffect(() => {
    const savedSpec = widgetEditorForm.values.widgetConfig?.chartBuilderSpec;
    if (savedSpec && JSON.stringify(savedSpec) !== JSON.stringify(builderSpec)) {
      setBuilderSpec(savedSpec);
    }
  }, [widgetEditorForm.values.widgetConfig?.chartBuilderSpec]);

  const availableFields = useMemo(() => {
    if (!workflowContext || !builderSpec.data?.source) return [];
    
    // Extract the inner path from {{...}}
    const match = builderSpec.data.source.match(/\{\{([^}]+)\}\}/);
    const rawPath = match ? match[1] : builderSpec.data.source;

    const resolved = getValueByPath(workflowContext, rawPath, { allowedRoots: ['state'] });
    if (Array.isArray(resolved) && resolved.length > 0 && typeof resolved[0] === 'object') {
      return Object.keys(resolved[0]);
    }
    return [];
  }, [workflowContext, builderSpec.data?.source]);

  const hasDataSources = useMemo(() => {
    return widgetEditorForm.values.widgetConfig?.dataSources?.length > 0;
  }, [widgetEditorForm.values.widgetConfig?.dataSources]);

  const handleSpecChange = (updatePath, newValue) => {
    setBuilderSpec(prev => {
      const nextSpec = JSON.parse(JSON.stringify(prev));
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const vegaSpec = generateVegaLiteSpec(builderSpec);
      widgetEditorForm.setFieldValue('widgetConfig.chartBuilderSpec', builderSpec);
      widgetEditorForm.setFieldValue('widgetConfig.vegaSpec', vegaSpec);
    }, 300);
    return () => clearTimeout(timer);
  }, [builderSpec, widgetEditorForm]);

  const handleChartTypeChange = (newType) => {
    if (newType === builderSpec.chartType) return;
    const newDefaults = getDefaultChartConfig(newType);
    setBuilderSpec(prev => ({
      ...newDefaults,
      data: { ...prev.data },
      encoding: {
        ...newDefaults.encoding,
        x: newDefaults.encoding.x && prev.encoding.x ? { ...newDefaults.encoding.x, field: prev.encoding.x.field } : newDefaults.encoding.x,
        y: newDefaults.encoding.y && prev.encoding.y ? { ...newDefaults.encoding.y, field: prev.encoding.y.field } : newDefaults.encoding.y,
        color: newDefaults.encoding.color && prev.encoding.color ? { ...newDefaults.encoding.color, field: prev.encoding.color.field } : newDefaults.encoding.color,
      },
      style: { ...prev.style },
    }));
  };

  if (!hasDataSources) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center rounded-md border border-dashed border-border bg-muted/20">
        <p className="text-sm font-medium text-foreground mb-1">No Data Source Selected</p>
        <p className="text-xs text-muted-foreground">Please add a Data Source in the Data tab first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── 1. Chart Type ─────────────────────────────────────────────────── */}
      <Section title="Chart Type">
        <ChartTypeSelector value={builderSpec.chartType} onChange={handleChartTypeChange} />
      </Section>

      {/* ── 2. Data Source ────────────────────────────────────────────────── */}
      <Section title="Data Source">
        <VariablePathPicker
          value={builderSpec.data?.source || ''}
          onChange={(val) => handleSpecChange('data.source', typeof val === 'string' ? val : val.variablePath)}
          placeholder="e.g., {{get_drivers}}"
          showTransforms={true}
        />
        {availableFields.length > 0 && (
          <p className="text-[10px] text-emerald-600">
            ✓ Data structure detected. Found {availableFields.length} columns.
          </p>
        )}
      </Section>

      {/* ── 3. Data Mapping ───────────────────────────────────────────────── */}
      <Section title="Data Mapping">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {builderSpec.encoding.x !== undefined && (
            <EncodingChannelEditor
              channelName="x"
              label={builderSpec.chartType === 'pie' || builderSpec.chartType === 'donut' ? 'Category Setup' : 'X-Axis'}
              value={builderSpec.encoding.x}
              onChange={(val) => handleSpecChange('encoding.x', val)}
              availableFields={availableFields}
            />
          )}
          {builderSpec.encoding.y !== undefined && (
            <EncodingChannelEditor
              channelName="y"
              label={builderSpec.chartType === 'pie' || builderSpec.chartType === 'donut' ? 'Value/Size' : 'Y-Axis'}
              value={builderSpec.encoding.y}
              onChange={(val) => handleSpecChange('encoding.y', val)}
              availableFields={availableFields}
            />
          )}
          {builderSpec.chartType !== 'pie' && builderSpec.chartType !== 'donut' && builderSpec.chartType !== 'histogram' && (
            <>
              <EncodingChannelEditor
                channelName="color"
                label="Group By (Color)"
                value={builderSpec.encoding.color}
                onChange={(val) => handleSpecChange('encoding.color', val)}
                onRemove={() => handleSpecChange('encoding.color', null)}
                isOptional={true}
                availableFields={availableFields}
              />
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
      </Section>

      {/* ── 4. Appearance ─────────────────────────────────────────────────── */}
      <Section title="Appearance">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            {/* ✅ Correct: Label from @jet-admin/ui, not raw <label> */}
            <Label className="text-[10px] font-medium text-muted-foreground">Chart Title</Label>
            <Input
              type="text"
              value={builderSpec.style?.title || ''}
              onChange={(e) => handleSpecChange('style.title', e.target.value)}
              placeholder="Optional chart title"
              className="text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">Color Palette</Label>
            <Select value={builderSpec.style?.colorScheme || 'tableau10'} onValueChange={(val) => handleSpecChange('style.colorScheme', val)}>
              <SelectTrigger className="text-xs"><SelectValue placeholder="Select palette" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categorical</SelectLabel>
                  <SelectItem value="tableau10">Tableau 10</SelectItem>
                  <SelectItem value="category10">Category 10</SelectItem>
                  <SelectItem value="category20">Category 20</SelectItem>
                  <SelectItem value="dark2">Dark 2</SelectItem>
                  <SelectItem value="set1">Set 1</SelectItem>
                  <SelectItem value="set2">Set 2</SelectItem>
                  <SelectItem value="pastel1">Pastel 1</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Sequential</SelectLabel>
                  <SelectItem value="blues">Blues</SelectItem>
                  <SelectItem value="greens">Greens</SelectItem>
                  <SelectItem value="reds">Reds</SelectItem>
                  <SelectItem value="purples">Purples</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Diverging</SelectLabel>
                  <SelectItem value="viridis">Viridis</SelectItem>
                  <SelectItem value="magma">Magma</SelectItem>
                  <SelectItem value="spectral">Spectral</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">Height (px)</Label>
            <Input
              type="number"
              value={builderSpec.style?.height || 300}
              onChange={(e) => handleSpecChange('style.height', parseInt(e.target.value) || 300)}
              className="text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">Width</Label>
            <Select
              value={builderSpec.style?.width === 'container' ? 'container' : 'custom'}
              onValueChange={(val) => handleSpecChange('style.width', val === 'container' ? 'container' : 400)}
            >
              <SelectTrigger className="text-xs"><SelectValue placeholder="Select width" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="container">Fill Container (Responsive)</SelectItem>
                <SelectItem value="custom">Fixed Width</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>
    </div>
  );
};

ChartBuilder.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  workflowContext: PropTypes.object,
  workflows: PropTypes.array,
};