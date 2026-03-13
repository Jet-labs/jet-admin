import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { FaCode, FaChartBar, FaChartLine, FaChartPie, FaExpand, FaCompress, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { BiScatterChart } from "react-icons/bi";
import Editor from "@monaco-editor/react";
import { extractWorkflowSchema } from "./variableExplorer";

import { Button } from "@jet-admin/ui";
/**
 * Vega Spec Templates
 */
const VEGA_TEMPLATES = {
  'empty': {
    name: 'Empty Spec',
    icon: FaCode,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "Custom visualization",
      "data": {
        "values": [
          { "x": 1, "y": 10 },
          { "x": 2, "y": 20 },
          { "x": 3, "y": 15 }
        ]
      },
      "mark": "point",
      "encoding": {
        "x": { "field": "x", "type": "quantitative" },
        "y": { "field": "y", "type": "quantitative" }
      }
    }
  },
  'bar': {
    name: 'Bar Chart',
    icon: FaChartBar,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A bar chart with sample data",
      "data": {
        "values": [
          { "category": "Electronics", "value": 450 },
          { "category": "Clothing", "value": 320 },
          { "category": "Food", "value": 280 },
          { "category": "Books", "value": 190 },
          { "category": "Sports", "value": 230 }
        ]
      },
      "mark": "bar",
      "encoding": {
        "x": { "field": "category", "type": "nominal", "axis": { "labelAngle": -45 } },
        "y": { "field": "value", "type": "quantitative", "title": "Sales" },
        "color": { "field": "category", "type": "nominal", "legend": null }
      }
    }
  },
  'line': {
    name: 'Line Chart',
    icon: FaChartLine,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A line chart with sample time series data",
      "data": {
        "values": [
          { "date": "2024-01-01", "value": 100 },
          { "date": "2024-02-01", "value": 150 },
          { "date": "2024-03-01", "value": 120 },
          { "date": "2024-04-01", "value": 200 },
          { "date": "2024-05-01", "value": 180 },
          { "date": "2024-06-01", "value": 250 }
        ]
      },
      "mark": { "type": "line", "point": true },
      "encoding": {
        "x": { "field": "date", "type": "temporal", "title": "Date" },
        "y": { "field": "value", "type": "quantitative", "title": "Value" }
      }
    }
  },
  'pie': {
    name: 'Pie Chart',
    icon: FaChartPie,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A donut chart with sample data",
      "data": {
        "values": [
          { "category": "Desktop", "value": 45 },
          { "category": "Mobile", "value": 35 },
          { "category": "Tablet", "value": 15 },
          { "category": "Other", "value": 5 }
        ]
      },
      "mark": { "type": "arc", "innerRadius": 50 },
      "encoding": {
        "theta": { "field": "value", "type": "quantitative" },
        "color": { "field": "category", "type": "nominal", "title": "Device" }
      }
    }
  },
  'scatter': {
    name: 'Scatter Plot',
    icon: BiScatterChart,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A scatter plot with sample data",
      "data": {
        "values": [
          { "x": 10, "y": 28, "size": 5, "category": "A" },
          { "x": 25, "y": 55, "size": 8, "category": "B" },
          { "x": 40, "y": 43, "size": 12, "category": "A" },
          { "x": 55, "y": 91, "size": 6, "category": "C" },
          { "x": 70, "y": 81, "size": 10, "category": "B" },
          { "x": 85, "y": 53, "size": 15, "category": "C" }
        ]
      },
      "mark": "circle",
      "encoding": {
        "x": { "field": "x", "type": "quantitative", "title": "X Axis" },
        "y": { "field": "y", "type": "quantitative", "title": "Y Axis" },
        "size": { "field": "size", "type": "quantitative" },
        "color": { "field": "category", "type": "nominal" }
      }
    }
  },
  'heatmap': {
    name: 'Heatmap',
    icon: FaChartBar,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A heatmap with sample data",
      "data": {
        "values": [
          { "row": "Mon", "column": "Morning", "value": 10 },
          { "row": "Mon", "column": "Afternoon", "value": 25 },
          { "row": "Mon", "column": "Evening", "value": 15 },
          { "row": "Tue", "column": "Morning", "value": 20 },
          { "row": "Tue", "column": "Afternoon", "value": 30 },
          { "row": "Tue", "column": "Evening", "value": 22 },
          { "row": "Wed", "column": "Morning", "value": 15 },
          { "row": "Wed", "column": "Afternoon", "value": 28 },
          { "row": "Wed", "column": "Evening", "value": 18 }
        ]
      },
      "mark": "rect",
      "encoding": {
        "x": { "field": "column", "type": "ordinal", "title": "Time" },
        "y": { "field": "row", "type": "ordinal", "title": "Day" },
        "color": { "field": "value", "type": "quantitative", "scale": { "scheme": "blues" }, "title": "Activity" }
      }
    }
  }
};

/**
 * Get all nested keys from an object
 */
const getNestedKeys = (obj, prefix = '', maxDepth = 4, currentDepth = 0) => {
  if (!obj || typeof obj !== 'object' || currentDepth >= maxDepth) {
    return [];
  }

  const keys = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      keys.push(fullPath);

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (Array.isArray(obj[key]) && obj[key].length > 0) {
          keys.push(...getNestedKeys(obj[key][0], `${fullPath}[0]`, maxDepth, currentDepth + 1));
        } else {
          keys.push(...getNestedKeys(obj[key], fullPath, maxDepth, currentDepth + 1));
        }
      }
    }
  }

  return keys;
};

/**
 * Get value by path
 */
const getValueByPath = (obj, path) => {
  if (!obj || !path) return undefined;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current?.[key]?.[parseInt(index)];
    } else {
      current = current?.[part];
    }

    if (current === undefined) break;
  }

  return current;
};

/**
 * Get value preview
 */
const getValuePreview = (obj, path) => {
  const value = getValueByPath(obj, path);

  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  const type = Array.isArray(value) ? 'array' : typeof value;

  switch (type) {
    case 'string':
      return `"${value.slice(0, 30)}${value.length > 30 ? '...' : ''}"`;
    case 'number':
    case 'boolean':
      return String(value);
    case 'array':
      return `Array(${value.length})`;
    case 'object':
      const keys = Object.keys(value).slice(0, 3);
      return `{${keys.join(', ')}${Object.keys(value).length > 3 ? '...' : ''}}`;
    default:
      return type;
  }
};

/**
 * VegaSpecEditor - Monaco Editor based
 * Uses scoped CSS classes for consistent light theming.
 */
export const VegaSpecEditor = ({
  value,
  onChange,
  onError,
  workflowContext = null,
  workflow = null,
  placeholder = "Enter Vega-Lite JSON spec...",
  disabled = false,
  theme = "light"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [parseError, setParseError] = useState(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const getJsonString = (val) => {
    if (!val) return '';
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return '';
    }
  };

  const [internalValue, setInternalValue] = useState(() => getJsonString(value));

  useEffect(() => {
    const newJsonString = getJsonString(value);
    if (editorRef.current && newJsonString !== internalValue) {
      setInternalValue(newJsonString);
      editorRef.current.setValue(newJsonString);
    }
  }, [value]);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  // Register custom completions
  useEffect(() => {
    if (!monacoRef.current) return;

    const monaco = monacoRef.current;
    const schema = workflow ? extractWorkflowSchema(workflow) : null;
    
    const disposable = monaco.languages.registerCompletionItemProvider('json', {
      triggerCharacters: ['.', '{'],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [];

        const bracketMatch = textUntilPosition.match(/\{\{([a-zA-Z0-9_]*)$/);
        if (bracketMatch) {
          const partial = bracketMatch[1].toLowerCase();
          
          if ('ctx'.startsWith(partial)) {
            suggestions.push({
              label: 'ctx',
              kind: monaco.languages.CompletionItemKind.Module,
              detail: 'Workflow Context (Runtime)',
              insertText: 'ctx.',
              range,
            });
          }

          if (schema) {
            const addSchemaItems = (items, kind, prefix) => {
              items.forEach(item => {
                const pathWithoutBraces = item.path.replace(/\{\{|\}\}/g, '');
                if (pathWithoutBraces.toLowerCase().includes(partial)) {
                  suggestions.push({
                    label: item.name,
                    kind,
                    detail: `${prefix}: ${item.type} ${item.nodeTitle ? `(from ${item.nodeTitle})` : ''}`,
                    insertText: pathWithoutBraces,
                    range,
                  });
                }
              });
            };

            addSchemaItems(schema.inputs, monaco.languages.CompletionItemKind.Property, 'Input');
            addSchemaItems(schema.nodeOutputs, monaco.languages.CompletionItemKind.Variable, 'Node Output');
            addSchemaItems(schema.workflowOutputs, monaco.languages.CompletionItemKind.Event, 'Workflow Output');
          }
        }

        if (workflowContext) {
          const ctxMatch = textUntilPosition.match(/\{\{ctx\.([a-zA-Z0-9_\[\]\.]*) $/);
          if (ctxMatch) {
            const partialKey = ctxMatch[1];
            const availableKeys = getNestedKeys(workflowContext, '', 4);

            availableKeys
              .filter(key => key.toLowerCase().includes(partialKey.toLowerCase()))
              .forEach(key => {
                suggestions.push({
                  label: key,
                  kind: monaco.languages.CompletionItemKind.Variable,
                  detail: getValuePreview(workflowContext, key),
                  insertText: key,
                  range: range,
                  documentation: `Value: ${getValuePreview(workflowContext, key)}`
                });
              });
          }
        }

        return { suggestions };
      },
    });

    return () => {
      disposable.dispose();
    };
  }, [workflowContext, workflow]);

  const handleEditorChange = useCallback((newValue) => {
    setInternalValue(newValue);

    if (!newValue || !newValue.trim()) {
      setParseError(null);
      onChange(null);
      return;
    }

    try {
      const parsed = JSON.parse(newValue);
      setParseError(null);
      onChange(parsed);
    } catch (err) {
      setParseError(err.message);
      if (onError) onError(err);
    }
  }, [onChange, onError]);

  const applyTemplate = useCallback((templateKey) => {
    const template = VEGA_TEMPLATES[templateKey];
    if (template) {
      onChange(template.spec);
      setShowTemplates(false);
      setParseError(null);
    }
  }, [onChange]);

  const formatDocument = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  }, []);

  return (
    <div className={`flex flex-col gap-3 ${isExpanded ? 'fixed inset-4 z-50 p-4' : ''}`}
      style={isExpanded ? {
        background: 'var(--we-bg-primary)',
        borderRadius: 'var(--we-radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      } : undefined}
    >
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--we-border)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FaCode style={{ color: 'var(--we-bg-accent)', fontSize: '16px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--we-text-primary)' }}>Vega-Lite Spec</span>
          </div>

          {/* Validation status */}
          {!parseError ? (
            <div className="flex items-center gap-1" style={{ color: '#16a34a' }}>
              <FaCheckCircle size={14} />
              <span style={{ fontSize: '11px', fontWeight: 500 }}>Valid</span>
            </div>
          ) : (
            <div className="flex items-center gap-1" style={{ color: '#dc2626' }}>
              <FaExclamationTriangle size={14} />
              <span style={{ fontSize: '11px', fontWeight: 500 }}>Invalid</span>
            </div>
          )}

          {/* Context indicator */}
          {workflowContext && Object.keys(workflowContext).length > 0 && (
            <div style={{
              padding: '2px 8px',
              background: 'var(--we-bg-accent-light)',
              border: '1px solid var(--we-border-accent)',
              borderRadius: 'var(--we-radius-sm)',
              fontSize: '11px',
              color: 'var(--we-text-accent)',
              fontWeight: 500,
            }}>
              {Object.keys(workflowContext).length} context vars
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={formatDocument}
            className="h-7 px-2 text-xs bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200"
            title="Format JSON (Shift+Alt+F)"
          >
            Format
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-7 px-2 text-xs bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200"
          >
            Templates
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200"
            title={isExpanded ? "Exit fullscreen" : "Fullscreen"}
          >
            {isExpanded ? <FaCompress size={12} /> : <FaExpand size={12} />}
          </Button>
        </div>
      </div>

      {/* Templates */}
      {showTemplates && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-3" style={{
          background: 'var(--we-bg-secondary)',
          borderRadius: 'var(--we-radius)',
          border: '1px solid var(--we-border)',
        }}>
          {Object.entries(VEGA_TEMPLATES).map(([key, template]) => {
            const Icon = template.icon;
            return (
              <Button
                key={key}
                type="button"
                variant="outline"
                onClick={() => applyTemplate(key)}
                className="h-auto py-3 flex-col gap-1.5 bg-white border-slate-200 hover:border-primary hover:bg-slate-50 transition-all font-normal"
              >
                <Icon className="text-xl text-slate-400" />
                <span className="text-[11px] font-medium text-slate-600">
                  {template.name}
                </span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="relative rounded-lg overflow-hidden" style={{
        border: `1px solid ${parseError ? '#fca5a5' : 'var(--we-border-strong)'}`,
        ...(parseError ? { boxShadow: '0 0 0 1px #fecaca' } : {}),
      }}>
        <Editor
          height={isExpanded ? 'calc(100vh - 200px)' : '400px'}
          defaultLanguage="json"
          defaultValue={internalValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs"
          options={{
            readOnly: disabled,
            minimap: { enabled: isExpanded },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            quickSuggestions: {
              "other": true,
              "comments": false,
              "strings": true
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'inline',
            padding: { top: 8, bottom: 8 },
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            bracketPairColorization: {
              enabled: true
            }
          }}
        />

        {/* Helper hint */}
        {workflowContext && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded pointer-events-none" style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--we-border)',
            boxShadow: 'var(--we-shadow-sm)',
            fontSize: '11px',
          }}>
            <span style={{ color: 'var(--we-text-muted)' }}>Type </span>
            <code style={{
              background: 'var(--we-bg-tertiary)',
              padding: '1px 4px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              color: 'var(--we-text-primary)',
            }}>{"{{ctx."}</code>
            <span style={{ color: 'var(--we-text-muted)' }}> for suggestions</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {parseError && (
        <div className="flex items-start gap-2 p-2.5 rounded" style={{
          fontSize: '12px',
          color: '#dc2626',
          background: '#fef2f2',
          border: '1px solid #fecaca',
        }}>
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          <div>
            <strong style={{ fontWeight: 600 }}>Parse Error:</strong> {parseError}
          </div>
        </div>
      )}
    </div>
  );
};

VegaSpecEditor.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
  workflowContext: PropTypes.object,
  workflow: PropTypes.object,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  theme: PropTypes.oneOf(['light', 'dark'])
};

export default VegaSpecEditor;