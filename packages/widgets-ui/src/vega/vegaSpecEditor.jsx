import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";



import { getValueByPath } from "@jet-admin/expression-engine";
import { CodeEditor } from "@jet-admin/ui";
import { BarChart, Code, LineChart, PieChart, ScatterChart } from 'lucide-react';

/* ─────────────────────────────────────────────────────────── templates ── */
const VEGA_TEMPLATES = {
  empty: {
    name: "Empty",
    icon: Code,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Custom visualization",
      data: { values: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }] },
      mark: "point",
      encoding: {
        x: { field: "x", type: "quantitative" },
        y: { field: "y", type: "quantitative" },
      },
    },
  },
  bar: {
    name: "Bar",
    icon: BarChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { category: "Electronics", value: 450 },
          { category: "Clothing", value: 320 },
          { category: "Food", value: 280 },
          { category: "Books", value: 190 },
          { category: "Sports", value: 230 },
        ],
      },
      mark: "bar",
      encoding: {
        x: { field: "category", type: "nominal", axis: { labelAngle: -45 } },
        y: { field: "value", type: "quantitative", title: "Sales" },
        color: { field: "category", type: "nominal", legend: null },
      },
    },
  },
  line: {
    name: "Line",
    icon: LineChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { date: "2024-01-01", value: 100 },
          { date: "2024-02-01", value: 150 },
          { date: "2024-03-01", value: 120 },
          { date: "2024-04-01", value: 200 },
          { date: "2024-05-01", value: 180 },
          { date: "2024-06-01", value: 250 },
        ],
      },
      mark: { type: "line", point: true },
      encoding: {
        x: { field: "date", type: "temporal", title: "Date" },
        y: { field: "value", type: "quantitative", title: "Value" },
      },
    },
  },
  pie: {
    name: "Pie",
    icon: PieChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { category: "Desktop", value: 45 },
          { category: "Mobile", value: 35 },
          { category: "Tablet", value: 15 },
          { category: "Other", value: 5 },
        ],
      },
      mark: { type: "arc", innerRadius: 50 },
      encoding: {
        theta: { field: "value", type: "quantitative" },
        color: { field: "category", type: "nominal", title: "Device" },
      },
    },
  },
  scatter: {
    name: "Scatter",
    icon: ScatterChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { x: 10, y: 28, size: 5, category: "A" },
          { x: 25, y: 55, size: 8, category: "B" },
          { x: 40, y: 43, size: 12, category: "A" },
          { x: 55, y: 91, size: 6, category: "C" },
          { x: 70, y: 81, size: 10, category: "B" },
          { x: 85, y: 53, size: 15, category: "C" },
        ],
      },
      mark: "circle",
      encoding: {
        x: { field: "x", type: "quantitative", title: "X Axis" },
        y: { field: "y", type: "quantitative", title: "Y Axis" },
        size: { field: "size", type: "quantitative" },
        color: { field: "category", type: "nominal" },
      },
    },
  },
  heatmap: {
    name: "Heatmap",
    icon: BarChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { row: "Mon", column: "Morning", value: 10 },
          { row: "Mon", column: "Afternoon", value: 25 },
          { row: "Mon", column: "Evening", value: 15 },
          { row: "Tue", column: "Morning", value: 20 },
          { row: "Tue", column: "Afternoon", value: 30 },
          { row: "Tue", column: "Evening", value: 22 },
          { row: "Wed", column: "Morning", value: 15 },
          { row: "Wed", column: "Afternoon", value: 28 },
          { row: "Wed", column: "Evening", value: 18 },
        ],
      },
      mark: "rect",
      encoding: {
        x: { field: "column", type: "ordinal", title: "Time" },
        y: { field: "row", type: "ordinal", title: "Day" },
        color: {
          field: "value",
          type: "quantitative",
          scale: { scheme: "blues" },
          title: "Activity",
        },
      },
    },
  },
};

/* ───────────────────────────────────────────────────── context helpers ── */
const getNestedKeys = (obj, prefix = "", maxDepth = 4, depth = 0) => {
  if (!obj || typeof obj !== "object" || depth >= maxDepth) return [];
  const keys = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const full = prefix ? `${prefix}.${key}` : key;
    keys.push(full);
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys.push(
        ...(Array.isArray(obj[key]) && obj[key].length > 0
          ? getNestedKeys(obj[key][0], `${full}[0]`, maxDepth, depth + 1)
          : getNestedKeys(obj[key], full, maxDepth, depth + 1))
      );
    }
  }
  return keys;
};

// getValueByPath is imported from @jet-admin/expression-engine

const getValuePreview = (obj, path) => {
  const v = getValueByPath(obj, path);
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === "object") {
    const k = Object.keys(v).slice(0, 3);
    return `{${k.join(", ")}${Object.keys(v).length > 3 ? "…" : ""}}`;
  }
  if (typeof v === "string") return `"${v.slice(0, 30)}${v.length > 30 ? "…" : ""}"`;
  return String(v);
};

/* ──────────────────────────────────────────────────────── style tokens ── */
const S = {
  // header bar
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    padding: "5px 8px",
    borderBottom: "1px solid var(--we-border)",
    background: "var(--we-bg-secondary, #f8f9fa)",
    borderRadius: "6px 6px 0 0",
    flexWrap: "wrap",
    minHeight: 34,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    minWidth: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  // tiny pill badges
  badge: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "1px 6px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.02em",
    lineHeight: 1.6,
    color: color === "green" ? "#15803d" : color === "red" ? "#dc2626" : "var(--we-text-accent)",
    background:
      color === "green" ? "#f0fdf4" : color === "red" ? "#fef2f2" : "var(--we-bg-accent-light)",
    border: `1px solid ${color === "green" ? "#bbf7d0" : color === "red" ? "#fecaca" : "var(--we-border-accent)"
      }`,
  }),
  // compressed icon button
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    padding: 0,
    border: "1px solid #d1d5db",
    borderRadius: 5,
    background: "#fff",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: 11,
    transition: "all 0.12s",
    flexShrink: 0,
  },
  // compressed text button
  textBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    padding: "0 8px",
    border: "1px solid transparent",
    borderRadius: 4,
    background: "transparent",
    color: "hsl(var(--muted-foreground))",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 500,
    transition: "all 0.12s",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  // template grid
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
    gap: 4,
    padding: "6px 8px",
    borderBottom: "1px solid var(--we-border)",
    background: "var(--we-bg-secondary, #f8f9fa)",
  },
  templateBtn: (active) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "5px 4px",
    border: `1px solid ${active ? "var(--we-bg-accent, #6366f1)" : "#e2e4e9"}`,
    borderRadius: 6,
    background: active ? "var(--we-bg-accent-light, #eef2ff)" : "#fff",
    color: active ? "var(--we-text-accent, #4f46e5)" : "#6b7280",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 500,
    transition: "all 0.12s",
    lineHeight: 1.2,
  }),
  // error strip
  errorStrip: {
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    padding: "5px 8px",
    background: "#fef2f2",
    borderTop: "1px solid #fecaca",
    fontSize: 11,
    color: "#dc2626",
    borderRadius: "0 0 6px 6px",
  },
  // ctx hint
  ctxHint: {
    position: "absolute",
    bottom: 6,
    right: 8,
    padding: "2px 7px",
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(4px)",
    border: "1px solid #e5e7eb",
    borderRadius: 5,
    fontSize: 10,
    color: "#9ca3af",
    pointerEvents: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    zIndex: 10,
  },
};

/* ══════════════════════════════════════════════════════ VegaSpecEditor ══ */
export const VegaSpecEditor = ({
  value,
  onChange,
  onError,
  workflowContext = null,
  workflow = null,
  disabled = false,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [parseError, setParseError] = useState(null);

  const monacoRef = useRef(null);
  const valueRef = useRef(value);
  const isInternalChange = useRef(false);

  useEffect(() => { valueRef.current = value; }, [value]);

  /* ── helpers ── */
  const toJson = (v) => {
    if (!v) return "";
    try { return JSON.stringify(v, null, 2); } catch { return ""; }
  };

  const valueString = useMemo(() => toJson(value), [value]);

  /* ── typing handler ── */
  const handleEditorChange = useCallback((newValue) => {
    isInternalChange.current = true;

    if (!newValue?.trim()) {
      setParseError(null);
      onChange(null);
      isInternalChange.current = false;
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

    // reset flag after the React paint cycle
    requestAnimationFrame(() => { isInternalChange.current = false; });
  }, [onChange, onError]);

  /* ── completions ── */
  useEffect(() => {
    if (!monacoRef.current) return;
    const monaco = monacoRef.current;

    const disposable = monaco.languages.registerCompletionItemProvider("json", {
      triggerCharacters: [".", "{"],
      provideCompletionItems: (model, position) => {
        const lineText = model.getValueInRange({
          startLineNumber: position.lineNumber, startColumn: 1,
          endLineNumber: position.lineNumber, endColumn: position.column,
        });
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
          startColumn: word.startColumn, endColumn: word.endColumn,
        };
        const suggestions = [];

        // After "{{" — offer "state." namespace root
        const bracketMatch = lineText.match(/\{\{([a-zA-Z0-9_]*)$/);
        if (bracketMatch) {
          const partial = bracketMatch[1].toLowerCase();
          if ("state".startsWith(partial)) {
            suggestions.push({
              label: "state", kind: monaco.languages.CompletionItemKind.Module,
              detail: "Global State Tree", insertText: "state.", range,
            });
          }
        }

        // After "{{state." — walk the stateTree and offer nested keys
        if (workflowContext) {
          const stateMatch = lineText.match(/\{\{state\.([a-zA-Z0-9_\[\].]*)$/);
          if (stateMatch) {
            const partial = stateMatch[1];
            getNestedKeys(workflowContext, "", 4)
              .filter((k) => k.toLowerCase().includes(partial.toLowerCase()))
              .forEach((k) =>
                suggestions.push({
                  label: k, kind: monaco.languages.CompletionItemKind.Variable,
                  detail: getValuePreview(workflowContext, k), insertText: k, range,
                  documentation: `Value: ${getValuePreview(workflowContext, k)}`,
                })
              );
          }
        }
        return { suggestions };
      },
    });
    return () => disposable.dispose();
  }, [workflowContext]);

  const applyTemplate = useCallback((key) => {
    const t = VEGA_TEMPLATES[key];
    if (t) { onChange(t.spec); setParseError(null); }
  }, [onChange]);

  /* ── derived ── */
  const contextVarCount = workflowContext ? Object.keys(workflowContext).length : 0;
  const hasError = Boolean(parseError);

  const headerExtra = (
    <button
      type="button"
      style={{
        ...S.textBtn,
        ...(showTemplates ? { background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" } : {}),
      }}
      className="hover:bg-muted hover:text-foreground"
      onClick={() => setShowTemplates((v) => !v)}
    >
      <BarChart size={9} />
      Templates
    </button>
  );

  const headerLeft = contextVarCount > 0 ? (
    <span style={S.badge("accent")}>
      {contextVarCount} ctx vars
    </span>
  ) : null;

  /* ══ render ══ */
  return (
    <div className="flex flex-col">
      {/* ── template strip ── */}
      {showTemplates && (
        <div style={S.templateGrid} className="border border-b-0 rounded-t-md">
          {Object.entries(VEGA_TEMPLATES).map(([key, tpl]) => {
            const Icon = tpl.icon;
            return (
              <button
                key={key}
                type="button"
                style={S.templateBtn(false)}
                onClick={() => { applyTemplate(key); setShowTemplates(false); }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--we-bg-accent, #6366f1)"; e.currentTarget.style.background = "var(--we-bg-accent-light, #eef2ff)"; e.currentTarget.style.color = "var(--we-text-accent, #4f46e5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e4e9"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#6b7280"; }}
              >
                <Icon size={14} />
                {tpl.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Monaco editor ── */}
      <CodeEditor
        value={valueString}
        onChange={handleEditorChange}
        language="json"
        disabled={disabled}
        title="Vega-Lite"
        titleIcon={<Code style={{ color: "var(--we-bg-accent, #6366f1)", fontSize: 13 }} />}
        status={hasError ? "error" : "valid"}
        statusMessage={parseError ? `Parse error: ${parseError}` : null}
        headerLeft={headerLeft}
        headerExtra={headerExtra}
        className={showTemplates ? "rounded-t-none" : ""}
        onMount={(e, m) => {
          monacoRef.current = m;
        }}
        footerHint={
          workflowContext ? (
            <>
              Type <code className="font-mono bg-muted px-1 rounded-sm">{"{{"}</code> to autocomplete data sources or context
            </>
          ) : null
        }
      />
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
  theme: PropTypes.oneOf(["light", "dark"]),
};

export default VegaSpecEditor;