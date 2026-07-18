import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FieldPill } from './fieldPill';
import { inferFieldsFromData } from './chartSpecGenerator';

import { Button, Input } from "@jet-admin/ui";
import { Database, GitMerge, ArrowRightFromLine, Zap, Search, Plus } from 'lucide-react';
import { getJsSuggestions, getValueByPath } from '@jet-admin/expression-engine';

/**
 * DataFieldPanel — Inline field list for Vega visual builder.
 * 
 * compact=true  → Slim mode for inside ShelfBuilder (no header/source picker).
 * compact=false → Full panel with data source picker header.
 */
export const DataFieldPanel = ({
  queryResults,
  dataSource,
  onDataSourceChange,
  onFieldClick,
  workflow,
  className = '',
  compact = false,
  stateTree,
  liveStateTree,
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

  // All suggestions from the live state tree
  const allSuggestions = useMemo(() => {
    const seen = new Set();
    const combined = [];
    const stateTreeSuggestions = getJsSuggestions({
      stateTree: liveStateTree
    });
    const arraySuggestions = stateTreeSuggestions.filter(s => s.type === 'array');
    
    for (const arr of arraySuggestions) {
      let bracePath = arr.value;
      if (!bracePath.startsWith('{{')) {
        bracePath = `{{${bracePath}}}`;
      }
      if (!seen.has(bracePath)) {
        seen.add(bracePath);
        combined.push({
          path: bracePath,
          label: bracePath,
          source: 'runtime',
          description: arr.detail || 'Runtime data array',
        });
      }
    }
    return combined;
  }, [liveStateTree]);

  // Resolve fields from selected data source
  const fields = useMemo(() => {
    if (!dataSource) return [];
    const match = dataSource.match(/\{\{([^}]+)\}\}/);
    if (!match) return [];
    const rawPath = match[1];

    const toFields = (data) => {
      if (Array.isArray(data) && data.length > 0) return inferFieldsFromData(data);
      if (data && typeof data === 'object' && !Array.isArray(data)) return inferFieldsFromData([data]);
      return null;
    };

    if (stateTree) {
      const resolved = getValueByPath(stateTree, rawPath, { allowedRoots: ['state'] });
      const result = toFields(resolved);
      if (result) return result;
    }
    if (queryResults) {
      const resolved = getValueByPath(queryResults, rawPath, { allowedRoots: ['state'] });
      const result = toFields(resolved);
      if (result) return result;
    }
    return [];
  }, [stateTree, queryResults, dataSource]);

  const filteredFields = useMemo(() => {
    if (!searchTerm) return fields;
    const lower = searchTerm.toLowerCase();
    return fields.filter(f => f.name.toLowerCase().includes(lower));
  }, [fields, searchTerm]);

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
      case 'node': return <GitMerge className="w-3 h-3 shrink-0 text-emerald-500" />;
      case 'output': return <ArrowRightFromLine className="w-3 h-3 shrink-0 text-fuchsia-500" />;
      case 'runtime': return <Zap className="w-3 h-3 shrink-0 text-amber-500" />;
      case 'datasource': return <Database className="w-3 h-3 shrink-0 text-blue-500" />;
      default: return <Database className="w-3 h-3 shrink-0 text-muted-foreground" />;
    }
  };

  const renderFieldGroup = (groupFields, label, colorClass) => {
    if (groupFields.length === 0) return null;
    return (
      <div className="mb-2.5 last:mb-0">
        <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 px-0.5 ${colorClass}`}>
          {label} <span className="opacity-60">({groupFields.length})</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {groupFields.map((field) => (
            <FieldPill
              key={field.name}
              field={field}
              onClick={() => onFieldClick?.(field)}
              className="w-full justify-start"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-background ${className}`}>
      {/* Header — full mode only */}
      {!compact && (
        <div className="px-2.5 py-2 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Database className="w-3 h-3 text-muted-foreground" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Data Source</span>
          </div>
          <div className="relative" ref={suggestionsRef}>
            <Input
              type="text"
              value={dataSource || ''}
              onChange={(e) => onDataSourceChange?.(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Select or type a data path..."
              className="w-full text-[11px] font-mono h-7"
              title="Workflow data source path"
            />
            {showSuggestions && allSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded shadow-xl z-50 max-h-48 overflow-y-auto">
                <div className="px-2.5 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/50 sticky top-0">
                  Variables ({allSuggestions.length})
                </div>
                {allSuggestions.map((s, i) => (
                  <div
                    key={`${s.path}-${i}`}
                    onClick={() => handleSelectSuggestion(s)}
                    className={`w-full text-left px-2.5 py-1.5 text-[11px] border-b border-border/30 flex items-center gap-2 transition-colors cursor-pointer ${dataSource === s.path ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted'}`}
                  >
                    {getCategoryIcon(s.source || s.category)}
                    <span className="font-mono truncate flex-1 min-w-0 text-foreground">{s.label}</span>
                    {s.source === 'runtime' && (
                      <span className="text-[8px] font-bold text-amber-500 bg-amber-500/15 px-1 py-px rounded shrink-0 uppercase tracking-wider">LIVE</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {dataSource && fields.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold text-primary">
              <Zap className="w-2.5 h-2.5" />
              {fields.length} fields
            </div>
          )}
        </div>
      )}

      {/* Compact header */}
      {compact && fields.length > 0 && (
        <div className="px-2.5 py-1.5 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-muted-foreground" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fields</span>
          </div>
          <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
            {fields.length}
          </span>
        </div>
      )}

      {/* Search */}
      {fields.length > 5 && (
        <div className="px-2.5 py-1.5 border-b border-border/30">
          <div className="flex items-center gap-1.5 bg-muted/40 border border-border/50 rounded px-2 py-1 focus-within:ring-1 focus-within:ring-ring transition-shadow">
            <Search className="w-3 h-3 text-muted-foreground shrink-0" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter..."
              className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground border-none shadow-none focus-visible:ring-0 h-4 p-0"
            />
          </div>
        </div>
      )}

      {/* Field List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 min-h-0">
        {fields.length > 0 ? (
          <>
            {renderFieldGroup(quantFields, 'Measures', 'text-emerald-500')}
            {renderFieldGroup(catFields, 'Dimensions', 'text-blue-500')}
            {renderFieldGroup(tempFields, 'Temporal', 'text-amber-500')}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-3 text-center">
            <Database className="w-5 h-5 mb-1 text-muted-foreground/25" />
              <p className="text-xs text-muted-foreground">
              {dataSource ? 'Run workflow to detect fields' : 'Select a data source'}
            </p>
          </div>
        )}

        {/* Manual field add */}
        {showManualAdd ? (
          <div className="mt-2 flex flex-col gap-1">
            <Input
              type="text"
              value={manualField}
              onChange={(e) => setManualField(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddManualField()}
              placeholder="field_name"
              className="w-full text-xs font-mono h-6"
              autoFocus
            />
            <div className="flex items-center gap-1 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowManualAdd(false)} className="h-5 px-1.5 text-[9px] text-muted-foreground">
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleAddManualField} className="h-5 px-1.5 text-[9px]">
                Add
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowManualAdd(true)}
            className="w-full mt-2 flex items-center justify-center gap-1 py-1 rounded border border-dashed border-border/50 text-[9px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-border transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Field
          </button>
        )}
      </div>
    </div>
  );
};

DataFieldPanel.propTypes = {
  queryResults: PropTypes.object,
  dataSource: PropTypes.string,
  onDataSourceChange: PropTypes.func,
  onFieldClick: PropTypes.func,
  workflow: PropTypes.object,
  className: PropTypes.string,
  compact: PropTypes.bool,
  stateTree: PropTypes.object,
  liveStateTree: PropTypes.object,
};
