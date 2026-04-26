import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FieldPill } from './fieldPill';
import { inferFieldsFromData } from './chartSpecGenerator';
import { extractWorkflowSchema } from './variableExplorer';
import { FiSearch, FiDatabase, FiPlus, FiZap } from 'react-icons/fi';
import { BiGitMerge } from 'react-icons/bi';
import { MdOutput } from 'react-icons/md';

import { Button, Input, Label } from "@jet-admin/ui";
/**
 * Recursively walk context and collect all array paths.
 */
const collectArrayPaths = (obj, prefix = 'ctx', depth = 0, maxDepth = 4) => {
  const results = [];
  if (!obj || typeof obj !== 'object' || depth > maxDepth) return results;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullPath = `${prefix}.${key}`;

    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      results.push({
        path: `{{${fullPath}}}`,
        label: fullPath.replace(/^ctx\./, ''),
        sampleKeys: Object.keys(val[0]),
        rowCount: val.length,
      });
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      results.push(...collectArrayPaths(val, fullPath, depth + 1, maxDepth));
    }
  }
  return results;
};

/**
 * DataFieldPanel — Left sidebar showing workflow data fields.
 * Tableau-style data panel with auto-discovery and suggestions.
 * Uses scoped CSS classes to prevent dark-theme bleed.
 */
export const DataFieldPanel = ({
  workflowContext,
  queryResults,
  dataSource,
  onDataSourceChange,
  onFieldClick,
  workflow,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualField, setManualField] = useState('');
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Schema suggestions (static)
  const schemaSuggestions = useMemo(() => {
    if (!workflow) return [];
    const schema = extractWorkflowSchema(workflow);
    const suggestions = [];

    for (const nodeOut of schema.nodeOutputs) {
      suggestions.push({
        path: nodeOut.path,
        label: nodeOut.name,
        description: nodeOut.description,
        category: 'node',
        nodeTitle: nodeOut.nodeTitle,
        nodeType: nodeOut.nodeType,
      });
    }

    for (const wfOut of schema.workflowOutputs) {
      suggestions.push({
        path: wfOut.path,
        label: wfOut.name,
        description: wfOut.description,
        category: 'output',
      });
    }

    return suggestions;
  }, [workflow]);

  // Runtime ctx array paths
  const ctxArrayPaths = useMemo(() => {
    if (!workflowContext) return [];
    return collectArrayPaths(workflowContext);
  }, [workflowContext]);

  // Query result array paths
  const queryResultPaths = useMemo(() => {
    if (!queryResults) return [];
    return collectArrayPaths(queryResults, 'qr');
  }, [queryResults]);

  // All suggestions combined
  const allSuggestions = useMemo(() => {
    const seen = new Set();
    const combined = [];

    for (const arr of ctxArrayPaths) {
      if (!seen.has(arr.path)) {
        seen.add(arr.path);
        combined.push({
          ...arr,
          source: 'runtime',
          description: `${arr.rowCount} rows, fields: ${arr.sampleKeys.slice(0, 4).join(', ')}${arr.sampleKeys.length > 4 ? '...' : ''}`,
        });
      }
    }

    // Add query result paths
    if (queryResults) {
      for (const alias of Object.keys(queryResults)) {
        const data = queryResults[alias];
        const isArray = Array.isArray(data);
        const arrayData = isArray ? data : (data?.data && Array.isArray(data.data) ? data.data : null);
        if (arrayData && arrayData.length > 0) {
          const path = isArray ? `{{${alias}}}` : `{{${alias}.data}}`;
          if (!seen.has(path)) {
            seen.add(path);
            combined.push({
              path,
              label: `${alias} (Data Source)`,
              sampleKeys: Object.keys(arrayData[0]),
              rowCount: arrayData.length,
              source: 'datasource',
              description: `${arrayData.length} rows, fields: ${Object.keys(arrayData[0]).slice(0, 4).join(', ')}`,
            });
          }
        }
      }
    }

    for (const s of schemaSuggestions) {
      if (!seen.has(s.path)) {
        seen.add(s.path);
        combined.push({ ...s, source: 'schema' });
      }
    }

    return combined;
  }, [ctxArrayPaths, queryResultPaths, schemaSuggestions, queryResults]);

  // Resolve fields from selected data source
  const fields = useMemo(() => {
    // Try resolving from workflowContext (legacy path)
    if (workflowContext && dataSource) {
      const match = dataSource.match(/\{\{ctx\.([^}]+)\}\}/);
      if (match) {
        const path = match[1];
        const parts = path.split('.');
        let current = workflowContext;

        for (const part of parts) {
          if (current === undefined || current === null) break;
          const arrMatch = part.match(/^(.+)\[(\d+)\]$/);
          if (arrMatch) {
            current = current[arrMatch[1]]?.[parseInt(arrMatch[2])];
          } else {
            current = current[part];
          }
        }

        if (Array.isArray(current)) {
          return inferFieldsFromData(current);
        }
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          return Object.keys(current).map(key => ({
            name: key,
            type: typeof current[key] === 'number' ? 'quantitative' : 'nominal',
            icon: typeof current[key] === 'number' ? '#' : 'Abc',
          }));
        }
      }
    }

    // Try resolving from queryResults (new data source path)
    if (queryResults && dataSource) {
      // Match patterns like {{alias.data}} or {{alias}}
      const match = dataSource.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const fullPath = match[1];
        const parts = fullPath.split('.');
        let current = queryResults;

        for (const part of parts) {
          if (current === undefined || current === null) break;
          current = current[part];
        }

        if (Array.isArray(current) && current.length > 0) {
          return inferFieldsFromData(current);
        }
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          return Object.keys(current).map(key => ({
            name: key,
            type: typeof current[key] === 'number' ? 'quantitative' : 'nominal',
            icon: typeof current[key] === 'number' ? '#' : 'Abc',
          }));
        }
      }
    }

    return [];
  }, [workflowContext, queryResults, dataSource]);

  // Filter fields
  const filteredFields = useMemo(() => {
    if (!searchTerm) return fields;
    const lower = searchTerm.toLowerCase();
    return fields.filter(f => f.name.toLowerCase().includes(lower));
  }, [fields, searchTerm]);

  // Categorize
  const quantFields = useMemo(() => filteredFields.filter(f => f.type === 'quantitative'), [filteredFields]);
  const catFields = useMemo(() => filteredFields.filter(f => f.type === 'nominal' || f.type === 'ordinal'), [filteredFields]);
  const tempFields = useMemo(() => filteredFields.filter(f => f.type === 'temporal'), [filteredFields]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    onDataSourceChange?.(suggestion.path);
    setShowSuggestions(false);
  }, [onDataSourceChange]);

  const handleAddManualField = useCallback(() => {
    if (!manualField.trim()) return;
    if (onFieldClick) {
      onFieldClick({ name: manualField.trim(), type: 'nominal', icon: 'Abc' });
    }
    setManualField('');
    setShowManualAdd(false);
  }, [manualField, onFieldClick]);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'node': return <BiGitMerge className="w-3 h-3 shrink-0 text-emerald-600" />;
      case 'output': return <MdOutput className="w-3 h-3 shrink-0 text-fuchsia-600" />;
      case 'runtime': return <FiZap className="w-3 h-3 shrink-0 text-amber-600" />;
      case 'datasource': return <FiDatabase className="w-3 h-3 shrink-0 text-blue-600" />;
      default: return <FiDatabase className="w-3 h-3 shrink-0 text-[#1c1c1e]" />;
    }
  };

  const renderFieldGroup = (groupFields, label, colorClass) => {
    if (groupFields.length === 0) return null;
    return (
      <div className="mb-4">
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${colorClass}`}>
          {label} ({groupFields.length})
        </div>
        <div className="flex flex-col gap-1.5 px-1">
          {groupFields.map((field) => (
            <FieldPill
              key={field.name}
              field={field}
              onClick={() => onFieldClick?.(field)}
              className="w-full justify-start hover:scale-[1.02] transition-transform"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="p-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
          <FiDatabase className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Data Source</span>
        </div>

        {/* Data source picker with suggestions */}
        <div className="relative" ref={suggestionsRef}>
          <Input
            type="text"
            value={dataSource || ''}
            onChange={(e) => onDataSourceChange?.(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Select or type a data path..."
            className="w-full text-xs font-mono"
            title="Workflow data source path"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && allSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-md shadow-xl z-50 max-h-60 overflow-y-auto w-80">
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border bg-muted sticky top-0">
                Available Variables ({allSuggestions.length})
              </div>
              {allSuggestions.map((s, i) => (
                <div
                  key={`${s.path}-${i}`}
                  onClick={() => handleSelectSuggestion(s)}
                  className={`w-full text-left px-3 py-1.5 text-xs border-b border-border/50 flex items-start gap-2 transition-colors cursor-pointer ${dataSource === s.path ? 'bg-primary/5 border-l-2 border-l-primary' : 'bg-white hover:bg-muted'}`}
                >
                  <div className="mt-0.5">{getCategoryIcon(s.source || s.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-foreground font-mono truncate">
                      {s.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5" title={s.description}>
                      {s.description}
                    </div>
                    {s.nodeTitle && (
                      <div className="text-[9px] text-emerald-600 mt-1 uppercase tracking-wider font-semibold">
                        from: {s.nodeTitle}
                      </div>
                    )}
                  </div>
                  {s.source === 'runtime' && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">LIVE</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show selected source info */}
        {dataSource && fields.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-fit border border-emerald-100">
            <FiZap className="w-3 h-3" />
            {fields.length} fields detected
          </div>
        )}
      </div>

      {/* Search */}
      {fields.length > 5 && (
        <div className="px-2.5 py-1.5 border-b border-border bg-white">
          <div className="flex items-center gap-2 bg-muted/50 border border-border rounded px-2 py-1 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-shadow">
            <FiSearch className="w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter fields..."
              className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground border-none shadow-none focus-visible:ring-0 h-6 p-0"
            />
          </div>
        </div>
      )}

      {/* Field List */}
      <div className="flex-1 overflow-y-auto p-2.5 min-h-0">
        {fields.length > 0 ? (
          <>
            {renderFieldGroup(quantFields, 'Measures', 'text-emerald-600')}
            {renderFieldGroup(catFields, 'Dimensions', 'text-blue-600')}
            {renderFieldGroup(tempFields, 'Temporal', 'text-amber-600')}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center px-3">
            <FiDatabase className="w-8 h-8 mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {dataSource
                ? 'Run the workflow to detect fields from the data'
                : 'Choose a data source above or type a ctx path'}
            </p>
            {!dataSource && allSuggestions.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowSuggestions(true)}
                className="h-7 px-3 text-[10px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 uppercase tracking-wider"
              >
                Browse {allSuggestions.length} Variables
              </Button>
            )}
          </div>
        )}

        {/* Manual field add */}
        <div className="mt-3 pt-3 border-t border-border">
          {showManualAdd ? (
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                value={manualField}
                onChange={(e) => setManualField(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManualField()}
                placeholder="Type field_name & press Enter..."
                className="w-full text-xs font-mono"
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualAdd(false)}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddManualField}
                  className="h-6 px-2 text-xs font-semibold"
                >
                  Add Field
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManualAdd(true)}
              className="w-full h-auto py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 border-dashed border-border hover:bg-muted hover:text-foreground"
            >
              <FiPlus className="w-3.5 h-3.5 mr-1" />
              <span>Add Field Manually</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

DataFieldPanel.propTypes = {
  workflowContext: PropTypes.object,
  queryResults: PropTypes.object,
  dataSource: PropTypes.string,
  onDataSourceChange: PropTypes.func,
  onFieldClick: PropTypes.func,
  workflow: PropTypes.object,
  className: PropTypes.string,
};
