import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { FiX, FiCode, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { VariableExplorer, extractWorkflowSchema } from "./variableExplorer";

/**
 * Transform type options
 */
const TRANSFORM_TYPES = [
  { value: '', label: 'None' },
  { value: 'map', label: 'Map (extract field)' },
  { value: 'filter', label: 'Filter (condition)' },
  { value: 'slice', label: 'Slice (limit items)' },
  { value: 'sort', label: 'Sort' },
  { value: 'aggregate', label: 'Aggregate (sum, avg, etc.)' },
  { value: 'format', label: 'Format (date, number, etc.)' },
];

/**
 * Format type options
 */
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

/**
 * Aggregation options
 */
const AGGREGATION_TYPES = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
];

/**
 * Variable Path Picker Component
 * 
 * Allows users to select a variable path from workflow schema and configure transforms
 */
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
  
  // Parse current value
  const parsedValue = useMemo(() => {
    if (!value) return { variablePath: '', transform: null, fallback: undefined };
    if (typeof value === 'string') return { variablePath: value, transform: null, fallback: undefined };
    return value;
  }, [value]);
  
  // Extract schema for quick suggestions
  const schema = useMemo(() => {
    return extractWorkflowSchema(workflow);
  }, [workflow]);
  
  // All available variables as flat list for suggestions
  const allVariables = useMemo(() => {
    return [
      ...schema.inputs,
      ...schema.nodeOutputs,
      ...schema.workflowOutputs,
    ];
  }, [schema]);
  
  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    const currentPath = parsedValue.variablePath?.toLowerCase() || '';
    if (!currentPath) return allVariables.slice(0, 8);
    
    return allVariables.filter(v => 
      v.path.toLowerCase().includes(currentPath) ||
      v.name.toLowerCase().includes(currentPath)
    ).slice(0, 8);
  }, [allVariables, parsedValue.variablePath]);
  
  // Handle path change
  const handlePathChange = useCallback((path) => {
    const newValue = {
      ...parsedValue,
      variablePath: path,
    };
    
    // If no transforms, just return path string
    if (!newValue.transform && newValue.fallback === undefined) {
      onChange(path);
    } else {
      onChange(newValue);
    }
    setShowSuggestions(false);
  }, [parsedValue, onChange]);
  
  // Handle input change with suggestions
  const handleInputChange = useCallback((e) => {
    handlePathChange(e.target.value);
    if (e.target.value && allVariables.length > 0) {
      setShowSuggestions(true);
    }
  }, [handlePathChange, allVariables]);
  
  // Handle variable select from explorer
  const handleVariableSelect = useCallback((path) => {
    handlePathChange(path);
    setShowExplorer(false);
  }, [handlePathChange]);
  
  // Handle suggestion click
  const handleSuggestionClick = useCallback((variable) => {
    handlePathChange(variable.path);
  }, [handlePathChange]);
  
  // Handle transform change
  const handleTransformChange = useCallback((transformUpdate) => {
    const newTransform = parsedValue.transform 
      ? { ...parsedValue.transform, ...transformUpdate }
      : transformUpdate;
    
    // Clean up empty transform
    const cleanTransform = newTransform.type ? newTransform : null;
    
    onChange({
      ...parsedValue,
      transform: cleanTransform,
    });
  }, [parsedValue, onChange]);
  
  // Handle fallback change
  const handleFallbackChange = useCallback((fallback) => {
    onChange({
      ...parsedValue,
      fallback: fallback || undefined,
    });
  }, [parsedValue, onChange]);
  
  // Handle focus
  const handleInputFocus = useCallback(() => {
    if (allVariables.length > 0) {
      setShowSuggestions(true);
    }
    if (onFocus) onFocus();
  }, [allVariables, onFocus]);
  
  // Handle blur
  const handleInputBlur = useCallback(() => {
    // Delay to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-slate-500">{label}</label>
      )}
      
      {/* Path input row */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={parsedValue.variablePath}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded block py-1.5 px-2 pr-8 focus:outline-none focus:border-slate-400"
          />
          
          {parsedValue.variablePath && (
            <button
              onClick={() => handlePathChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
              type="button"
            >
              <FiX className="w-3 h-3" />
            </button>
          )}
          
          {/* Quick Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-auto">
              {filteredSuggestions.map((variable) => (
                <button
                  key={variable.path}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(variable)}
                  className="w-full px-2 py-1.5 text-left text-xs hover:bg-slate-50 flex items-center justify-between gap-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{variable.path}</span>
                    {variable.nodeTitle && (
                      <span className="text-[10px] text-slate-400">from {variable.nodeTitle}</span>
                    )}
                  </div>
                  <span className="text-[10px] px-1 py-0.5 bg-slate-100 rounded text-slate-500">
                    {variable.category === 'input' ? 'input' : variable.category === 'nodeOutput' ? 'node' : 'output'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Browse button */}
        {allVariables.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowExplorer(!showExplorer);
              setShowSuggestions(false);
            }}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs border rounded whitespace-nowrap ${
              showExplorer 
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
            title="Browse variables"
          >
            {showExplorer ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
            Browse
          </button>
        )}
        
        {/* Transform button */}
        {showTransforms && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs border rounded whitespace-nowrap ${
              showAdvanced || parsedValue.transform 
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FiCode className="w-3 h-3" />
            Transform
            {parsedValue.transform && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
          </button>
        )}
      </div>
      
      {/* Variable Explorer Inline */}
      {showExplorer && (
        <div className="border border-slate-200 rounded bg-slate-50">
          <VariableExplorer
            workflow={workflow}
            onSelect={handleVariableSelect}
            selectedPath={parsedValue.variablePath}
            showSearch={true}
            className="border-0"
          />
        </div>
      )}
      
      {/* Transform options */}
      {showAdvanced && (
        <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-3">
          {/* Transform type */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Transform Type</label>
            <select
              value={parsedValue.transform?.type || ''}
              onChange={(e) => handleTransformChange({ type: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-400 text-slate-700"
            >
              {TRANSFORM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          
          {/* Map transform options */}
          {parsedValue.transform?.type === 'map' && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Extract Field Path</label>
              <input
                type="text"
                value={parsedValue.transform?.mapPath || ''}
                onChange={(e) => handleTransformChange({ mapPath: e.target.value })}
                placeholder="e.g., value or nested.field"
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400"
              />
            </div>
          )}
          
          {/* Filter transform options */}
          {parsedValue.transform?.type === 'filter' && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Filter Condition</label>
              <input
                type="text"
                value={parsedValue.transform?.filterCondition || ''}
                onChange={(e) => handleTransformChange({ filterCondition: e.target.value })}
                placeholder='e.g., item.status === "active"'
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400"
              />
            </div>
          )}
          
          {/* Slice transform options */}
          {parsedValue.transform?.type === 'slice' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Start</label>
                <input
                  type="number"
                  value={parsedValue.transform?.start || 0}
                  onChange={(e) => handleTransformChange({ start: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">End</label>
                <input
                  type="number"
                  value={parsedValue.transform?.end || ''}
                  onChange={(e) => handleTransformChange({ end: parseInt(e.target.value) || undefined })}
                  placeholder="All"
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}
          
          {/* Sort transform options */}
          {parsedValue.transform?.type === 'sort' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Sort By</label>
                <input
                  type="text"
                  value={parsedValue.transform?.sortPath || ''}
                  onChange={(e) => handleTransformChange({ sortPath: e.target.value })}
                  placeholder="e.g., value"
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Order</label>
                <select
                  value={parsedValue.transform?.ascending ? 'asc' : 'desc'}
                  onChange={(e) => handleTransformChange({ ascending: e.target.value === 'asc' })}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Aggregate transform options */}
          {parsedValue.transform?.type === 'aggregate' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Aggregation</label>
                <select
                  value={parsedValue.transform?.aggregation || 'sum'}
                  onChange={(e) => handleTransformChange({ aggregation: e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700"
                >
                  {AGGREGATION_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Field Path</label>
                <input
                  type="text"
                  value={parsedValue.transform?.path || ''}
                  onChange={(e) => handleTransformChange({ path: e.target.value })}
                  placeholder="e.g., amount"
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}
          
          {/* Format transform options */}
          {parsedValue.transform?.type === 'format' && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Format Type</label>
              <select
                value={parsedValue.transform?.formatType || ''}
                onChange={(e) => handleTransformChange({ formatType: e.target.value })}
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-700"
              >
                <option value="">Select format...</option>
                {FORMAT_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Fallback value */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Fallback Value (if path not found)</label>
            <input
              type="text"
              value={parsedValue.fallback || ''}
              onChange={(e) => handleFallbackChange(e.target.value)}
              placeholder="Optional default value"
              className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400"
            />
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
