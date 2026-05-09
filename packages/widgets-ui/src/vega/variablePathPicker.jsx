import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { FiX, FiCode, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { VariableExplorer, extractWorkflowSchema } from "./variableExplorer";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

const TRANSFORM_TYPES = [
  { value: '', label: 'None' },
  { value: 'map', label: 'Map (extract field)' },
  { value: 'filter', label: 'Filter (condition)' },
  { value: 'slice', label: 'Slice (limit items)' },
  { value: 'sort', label: 'Sort' },
  { value: 'aggregate', label: 'Aggregate (sum, avg, etc.)' },
  { value: 'format', label: 'Format (date, number, etc.)' },
];

const FORMAT_TYPES = [
  { value: 'date:short', label: 'Date (Short)' },
  { value: 'date:long', label: 'Date (Long)' },
  { value: 'date:time', label: 'Time' },
  { value: 'date:datetime', label: 'Date & Time' },
  { value: 'number:currency', label: 'Currency' },
  { value: 'number:percent', label: 'Percentage' },
  { value: 'number:decimal', label: 'Decimal (2 places)' },
  { value: 'number:compact', label: 'Compact (1K, 1M, etc.)' },
  { value: 'string:uppercase', label: 'Uppercase' },
  { value: 'string:lowercase', label: 'Lowercase' },
  { value: 'string:capitalize', label: 'Capitalize' },
  { value: 'string:truncate', label: 'Truncate (50 chars)' },
];

const AGGREGATION_TYPES = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
];

export const VariablePathPicker = ({
  value,
  onChange,
  workflow,
  label,
  placeholder = "Select or enter variable path",
  showTransforms = true,
  onFocus,
  className = "",
}) => {
  const [showExplorer, setShowExplorer] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const parsedValue = useMemo(() => {
    if (!value) return { variablePath: '', transform: null, fallback: undefined };
    if (typeof value === 'string') return { variablePath: value, transform: null, fallback: undefined };
    return value;
  }, [value]);

  const schema = useMemo(() => extractWorkflowSchema(workflow), [workflow]);

  const allVariables = useMemo(() => [
    ...schema.inputs,
    ...schema.nodeOutputs,
    ...schema.workflowOutputs,
  ], [schema]);

  const filteredSuggestions = useMemo(() => {
    const currentPath = parsedValue.variablePath?.toLowerCase() || '';
    if (!currentPath) return allVariables.slice(0, 8);
    return allVariables.filter(v =>
      v.path.toLowerCase().includes(currentPath) ||
      v.name.toLowerCase().includes(currentPath)
    ).slice(0, 8);
  }, [allVariables, parsedValue.variablePath]);

  const handlePathChange = useCallback((path) => {
    const newValue = { ...parsedValue, variablePath: path };
    if (!newValue.transform && newValue.fallback === undefined) {
      onChange(path);
    } else {
      onChange(newValue);
    }
    setShowSuggestions(false);
  }, [parsedValue, onChange]);

  const handleInputChange = useCallback((e) => {
    handlePathChange(e.target.value);
    if (e.target.value && allVariables.length > 0) setShowSuggestions(true);
  }, [handlePathChange, allVariables]);

  const handleVariableSelect = useCallback((path) => {
    handlePathChange(path);
    setShowExplorer(false);
  }, [handlePathChange]);

  const handleSuggestionClick = useCallback((variable) => {
    handlePathChange(variable.path);
  }, [handlePathChange]);

  const handleTransformChange = useCallback((transformUpdate) => {
    const newTransform = parsedValue.transform
      ? { ...parsedValue.transform, ...transformUpdate }
      : transformUpdate;
    const cleanTransform = newTransform.type ? newTransform : null;
    onChange({ ...parsedValue, transform: cleanTransform });
  }, [parsedValue, onChange]);

  const handleFallbackChange = useCallback((fallback) => {
    onChange({ ...parsedValue, fallback: fallback || undefined });
  }, [parsedValue, onChange]);

  const handleInputFocus = useCallback(() => {
    if (allVariables.length > 0) setShowSuggestions(true);
    if (onFocus) onFocus();
  }, [allVariables, onFocus]);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const hasTransform = !!parsedValue.transform;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      )}

      {/* Path input row */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 relative">
          {/* ✅ Correct: uses shared Input, no raw slate overrides */}
          <Input
            type="text"
            value={parsedValue.variablePath}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="w-full text-xs font-mono pr-7"
          />

          {parsedValue.variablePath && (
            <Button
              onClick={() => handlePathChange('')}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5"
              type="button"
            >
              <FiX className="w-3 h-3" />
            </Button>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-brand-dark border border-border rounded-md shadow-lg max-h-48 overflow-auto">
              {filteredSuggestions.map((variable) => (
                <div
                  key={variable.path}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(variable)}
                  className="w-full px-2 py-1.5 text-left text-xs hover:bg-muted flex items-center justify-between gap-2 border-b border-border last:border-0 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground font-mono">{variable.path}</span>
                    {variable.nodeTitle && (
                      <span className="text-[10px] text-muted-foreground">from {variable.nodeTitle}</span>
                    )}
                  </div>
                  <span className="text-[10px] px-1 py-0.5 bg-muted rounded-sm text-muted-foreground shrink-0">
                    {variable.category === 'input' ? 'input' : variable.category === 'nodeOutput' ? 'node' : 'output'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Browse button */}
        {allVariables.length > 0 && (
          <Button
            type="button"
            variant={showExplorer ? 'primary-ghost' : 'outline'}
            size="sm"
            onClick={() => { setShowExplorer(!showExplorer); setShowSuggestions(false); }}
            className="shrink-0"
            title="Browse variables"
          >
            {showExplorer ? <FiChevronDown className="w-3 h-3 mr-1" /> : <FiChevronRight className="w-3 h-3 mr-1" />}
            Browse
          </Button>
        )}

        {/* Transform toggle */}
        {showTransforms && (
          <Button
            type="button"
            variant={showAdvanced || hasTransform ? 'primary-ghost' : 'outline'}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="shrink-0"
          >
            <FiCode className="w-3 h-3 mr-1" />
            Transform
            {hasTransform && <span className="w-1.5 h-1.5 bg-primary rounded-full ml-1" />}
          </Button>
        )}
      </div>

      {/* Variable Explorer inline */}
      {showExplorer && (
        <div className="border border-border rounded-md overflow-hidden bg-muted/20">
          <VariableExplorer
            workflow={workflow}
            onSelect={handleVariableSelect}
            selectedPath={parsedValue.variablePath}
            showSearch={true}
            className="border-0 rounded-none"
          />
        </div>
      )}

      {/* Transform options */}
      {showAdvanced && (
        <div className="p-3 rounded-md border border-border bg-muted/30 space-y-3">
          {/* Transform type */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Transform Type</p>
            <Select value={parsedValue.transform?.type || ''} onValueChange={(val) => handleTransformChange({ type: val })}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {TRANSFORM_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Map */}
          {parsedValue.transform?.type === 'map' && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Extract Field Path</p>
              <Input type="text" value={parsedValue.transform?.mapPath || ''} onChange={(e) => handleTransformChange({ mapPath: e.target.value })} placeholder="e.g., value or nested.field" className="text-xs" />
            </div>
          )}

          {/* Filter */}
          {parsedValue.transform?.type === 'filter' && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Filter Condition</p>
              <Input type="text" value={parsedValue.transform?.filterCondition || ''} onChange={(e) => handleTransformChange({ filterCondition: e.target.value })} placeholder='e.g., item.status === "active"' className="text-xs font-mono" />
            </div>
          )}

          {/* Slice */}
          {parsedValue.transform?.type === 'slice' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Start</p>
                <Input type="number" value={parsedValue.transform?.start || 0} onChange={(e) => handleTransformChange({ start: parseInt(e.target.value) || 0 })} className="text-xs" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">End</p>
                <Input type="number" value={parsedValue.transform?.end || ''} onChange={(e) => handleTransformChange({ end: parseInt(e.target.value) || undefined })} placeholder="All" className="text-xs" />
              </div>
            </div>
          )}

          {/* Sort */}
          {parsedValue.transform?.type === 'sort' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Sort By</p>
                <Input type="text" value={parsedValue.transform?.sortPath || ''} onChange={(e) => handleTransformChange({ sortPath: e.target.value })} placeholder="e.g., value" className="text-xs" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Order</p>
                <Select value={parsedValue.transform?.ascending ? 'asc' : 'desc'} onValueChange={(val) => handleTransformChange({ ascending: val === 'asc' })}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Aggregate */}
          {parsedValue.transform?.type === 'aggregate' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Aggregation</p>
                <Select value={parsedValue.transform?.aggregation || 'sum'} onValueChange={(val) => handleTransformChange({ aggregation: val })}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AGGREGATION_TYPES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Field Path</p>
                <Input type="text" value={parsedValue.transform?.path || ''} onChange={(e) => handleTransformChange({ path: e.target.value })} placeholder="e.g., amount" className="text-xs" />
              </div>
            </div>
          )}

          {/* Format */}
          {parsedValue.transform?.type === 'format' && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Format Type</p>
              <Select value={parsedValue.transform?.formatType || ''} onValueChange={(val) => handleTransformChange({ formatType: val })}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Select format..." /></SelectTrigger>
                <SelectContent>
                  {FORMAT_TYPES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fallback */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Fallback Value (if path not found)</p>
            <Input type="text" value={parsedValue.fallback || ''} onChange={(e) => handleFallbackChange(e.target.value)} placeholder="Optional default value" className="text-xs" />
          </div>
        </div>
      )}
    </div>
  );
};

VariablePathPicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func.isRequired,
  workflow: PropTypes.object,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  showTransforms: PropTypes.bool,
  onFocus: PropTypes.func,
  className: PropTypes.string,
};

export default VariablePathPicker;