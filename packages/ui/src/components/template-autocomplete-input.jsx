import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

// ─── Context crawler ──────────────────────────────────────────────────────────
export function deriveContextSuggestions(obj, prefix = "", depth = 0, maxDepth = 8) {
  if (depth > maxDepth || obj === null || obj === undefined) return [];
  const suggestions = [];

  if (Array.isArray(obj)) {
    if (prefix) {
      suggestions.push({ value: prefix, label: prefix, detail: `Array[${obj.length}]`, type: "array" });
      suggestions.push({ value: `${prefix}.length`, label: `${prefix}.length`, detail: "Number", type: "property" });
    }
    if (obj.length > 0 && typeof obj[0] === "object" && obj[0] !== null) {
      suggestions.push(...deriveContextSuggestions(obj[0], prefix ? `${prefix}[0]` : "[0]", depth + 1, maxDepth));
    }
    return suggestions;
  }

  if (typeof obj === "object") {
    if (prefix) suggestions.push({ value: prefix, label: prefix, detail: "Object", type: "object" });
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "function") continue;
      const childPath = prefix ? `${prefix}.${key}` : key;
      if (val === null || val === undefined) {
        suggestions.push({ value: childPath, label: childPath, detail: "null", type: "null" });
      } else if (Array.isArray(val)) {
        suggestions.push(...deriveContextSuggestions(val, childPath, depth + 1, maxDepth));
      } else if (typeof val === "object") {
        suggestions.push(...deriveContextSuggestions(val, childPath, depth + 1, maxDepth));
      } else {
        suggestions.push({ value: childPath, label: childPath, detail: inferType(val), type: "primitive" });
      }
    }
    return suggestions;
  }

  if (prefix) suggestions.push({ value: prefix, label: prefix, detail: inferType(obj), type: "primitive" });
  return suggestions;
}

function inferType(val) {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return "Boolean";
  if (typeof val === "number") return Number.isInteger(val) ? "Integer" : "Float";
  if (typeof val === "string") return "String";
  return typeof val;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function typeIcon(type) {
  return { object: "{ }", array: "[ ]", primitive: "ab", null: "∅", property: "#", ctx: "⬟", form: "▣", widget: "◈" }[type] || "◆";
}

function highlightMatch(text, query) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-[2px] font-semibold px-[1px]">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

function getFilterAtCaret(el) {
  const pos = el.selectionStart ?? 0;
  const before = (el.value ?? "").substring(0, pos);
  const match = before.match(/\{\{([^}]*)$/);
  return match ? match[1] : null;
}

// ─── Shared dropdown ──────────────────────────────────────────────────────────
function SuggestionDropdown({ items, totalItems, filterText, activeIdx, onSelect, onActiveChange, style }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current || activeIdx < 0) return;
    listRef.current.querySelectorAll(".tpl-item")[activeIdx]?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  return (
    <div className="absolute left-0 right-0 z-[9999] bg-background border border-border rounded-md shadow-lg flex flex-col overflow-hidden" style={style}>
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border bg-muted/50 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-mono">Bindings</span>
        {filterText
          ? <span className="text-[10px] text-muted-foreground font-mono truncate ml-2">
            filtering <code className="font-mono text-[10px] bg-primary/10 px-1 py-[1.5px] rounded-[3px] border border-primary/20 text-primary">{filterText}</code>
            &nbsp;·&nbsp;{totalItems} result{totalItems !== 1 ? "s" : ""}
          </span>
          : <span className="text-[10px] text-muted-foreground font-mono">{totalItems} available</span>
        }
      </div>

      {/* List */}
      <div className="max-h-[200px] overflow-y-auto overflow-x-hidden" ref={listRef}>
        {items.length === 0
          ? <div className="p-3 text-[11px] text-center text-muted-foreground font-mono">No bindings match "{filterText}"</div>
          : items.map((s, i) => {
            const cleanVal = (s.value || "").replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
            const cleanLabel = (s.label || cleanVal).replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
            return (
              <div
                key={i}
                className={`tpl-item flex items-center gap-2 px-2.5 py-1.5 cursor-pointer border-b border-border last:border-0 transition-colors ${i === activeIdx ? "bg-primary/10" : "hover:bg-muted/50"}`}
                onMouseDown={(e) => { e.preventDefault(); onSelect(i); }}
                onMouseEnter={() => onActiveChange(i)}
              >
                <div className={`w-5 h-5 rounded-[3px] flex items-center justify-center shrink-0 text-[9px] font-bold tracking-tighter font-mono ${
                  s.type === 'object' ? 'bg-muted text-foreground border border-border/50' :
                  s.type === 'array' ? 'bg-muted/50 text-foreground border border-border/50' :
                  s.type === 'null' ? 'bg-transparent text-muted-foreground border border-dashed border-border/50' :
                  'bg-primary/10 text-primary border border-primary/20'
                }`}>{typeIcon(s.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{highlightMatch(cleanLabel, filterText)}</div>
                </div>
                {s.detail && <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap shrink-0">{s.detail}</span>}
                {s.type && <span className="text-[9px] font-semibold uppercase tracking-[0.04em] px-1.5 py-px rounded-[3px] border border-border text-muted-foreground bg-muted shrink-0">{s.type}</span>}
              </div>
            );
          })
        }
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-2.5 py-1 border-t border-border bg-muted/50 shrink-0">
        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5"><kbd className="inline-flex items-center px-1 h-4 text-[9px] font-mono bg-background border border-border rounded-[3px] text-muted-foreground">↑</kbd><kbd className="inline-flex items-center px-1 h-4 text-[9px] font-mono bg-background border border-border rounded-[3px] text-muted-foreground">↓</kbd> navigate</span>
        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5"><kbd className="inline-flex items-center px-1 h-4 text-[9px] font-mono bg-background border border-border rounded-[3px] text-muted-foreground">↵</kbd> select · <kbd className="inline-flex items-center px-1 h-4 text-[9px] font-mono bg-background border border-border rounded-[3px] text-muted-foreground">Esc</kbd> close</span>
      </div>
    </div>
  );
}

// CSS removed, utilizing Tailwind classes directly

// ─── Extract all {{tokens}} currently in value (for chip bar) ─────────────────
function extractTokens(value) {
  const matches = [...(value || "").matchAll(/\{\{([^}]+)\}\}/g)];
  const seen = new Set();
  return matches.reduce((acc, m) => {
    const key = m[1].trim();
    if (!seen.has(key)) { seen.add(key); acc.push(key); }
    return acc;
  }, []);
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * TemplateAutocompleteInput
 *
 * Props:
 *   value        {string}
 *   onChange     {fn}
 *   placeholder  {string}
 *   suggestions  {Array}   – explicit list; each: { value, label?, detail?, type? }
 *   context      {object}  – JSON object; auto-derives all deep dot-paths when
 *                            suggestions is empty/absent (VS Code-style)
 *   isTextArea   {boolean} – multiline mode
 *   isParagraph  {boolean} – alias for isTextArea
 *   rows         {number}  – initial visible rows for textarea
 *   className    {string}
 */
export const TemplateAutocompleteInput = ({
  value,
  onChange,
  placeholder,
  suggestions = [],
  context,
  isTextArea = false,
  isParagraph = false,
  rows = 4,
  className = "",
}) => {
  const multiline = isTextArea || isParagraph;

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  // For multiline: position the dropdown just below the caret line
  const [dropdownTop, setDropdownTop] = useState(null);

  const fieldRef = useRef(null); // the input or textarea element

  // ── Effective suggestions ─────────────────────────────────────────────────
  const effectiveSuggestions = useMemo(() => {
    if (suggestions?.length > 0) return suggestions;
    if (context && typeof context === "object") return deriveContextSuggestions(context);
    return [];
  }, [suggestions, context]);

  const filteredSuggestions = useMemo(() => {
    if (!filterText) return effectiveSuggestions;
    const lower = filterText.toLowerCase();
    return effectiveSuggestions.filter((s) => {
      const v = (s.value || "").replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
      const l = (s.label || v).replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
      return v.toLowerCase().includes(lower) || l.toLowerCase().includes(lower);
    });
  }, [effectiveSuggestions, filterText]);

  const displayedSuggestions = useMemo(() => filteredSuggestions.slice(0, 100), [filteredSuggestions]);

  // ── Chip tokens (multiline — show currently bound tokens below textarea) ──
  const boundTokens = useMemo(() => extractTokens(value), [value]);

  // ── Caret pixel position for multiline dropdown ───────────────────────────
  // We approximate vertical position using line height × current line number.
  const computeDropdownTop = useCallback(() => {
    const el = fieldRef.current;
    if (!el || !multiline) return null;
    const pos = el.selectionStart ?? 0;
    const textBefore = (el.value ?? "").substring(0, pos);
    const linesBefore = textBefore.split("\n").length;
    const lineH = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const paddingTop = parseFloat(getComputedStyle(el).paddingTop) || 8;
    // top of dropdown = bottom of current line
    return paddingTop + linesBefore * lineH;
  }, [multiline]);

  // ── Open / close helpers ──────────────────────────────────────────────────
  const openWith = useCallback((filter) => {
    setFilterText(filter);
    setActiveIdx(-1);
    setShowSuggestions(true);
    if (multiline) setDropdownTop(computeDropdownTop());
  }, [multiline, computeDropdownTop]);

  const close = useCallback(() => {
    setShowSuggestions(false);
    setActiveIdx(-1);
  }, []);

  // ── Selection logic ───────────────────────────────────────────────────────
  const handleSelect = useCallback((idx) => {
    const s = displayedSuggestions[idx];
    if (!s) return;
    const el = fieldRef.current;
    const pos = el?.selectionStart ?? (value || "").length;
    const before = (value || "").substring(0, pos);
    const after = (value || "").substring(pos);
    const match = before.match(/\{\{([^}]*)$/);
    const cleanVal = (s.value || "").replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");

    let newValue;
    if (match) {
      const strippedAfter = after.replace(/^\s*\}\}/, "");
      newValue = before.substring(0, match.index) + "{{" + cleanVal + "}}" + strippedAfter;
    } else {
      newValue = "{{" + cleanVal + "}}";
    }

    onChange(newValue);
    close();

    setTimeout(() => {
      if (el) {
        el.focus();
        const newPos = match ? match.index + 2 + cleanVal.length + 2 : newValue.length;
        el.setSelectionRange(newPos, newPos);
      }
    }, 0);
  }, [displayedSuggestions, value, onChange, close]);

  // ── Event handlers (shared between input and textarea) ───────────────────
  const handleChange = (e) => {
    onChange(e.target.value);
    const filter = getFilterAtCaret(e.target);
    if (filter !== null) openWith(filter);
    else close();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, displayedSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(activeIdx);
    } else if (e.key === "Escape") {
      close();
    }
  };

  const handleClick = () => {
    const el = fieldRef.current;
    if (!el) return;
    const filter = getFilterAtCaret(el);
    if (filter !== null) openWith(filter);
  };

  const handleBlur = () => {
    setTimeout(close, 150);
  };

  // Dropdown style: for single-line anchors to bottom of field wrapper;
  // for multiline anchors to caret position inside the textarea.
  const dropdownStyle = multiline && dropdownTop != null
    ? { top: dropdownTop }
    : { top: "calc(100% + 4px)" };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`relative w-full ${className}`}>
      <div className="bg-input-custom border border-input-custom rounded-sm overflow-hidden transition-shadow duration-150 focus-within:border-border/80 focus-within:ring-2 focus-within:ring-primary/30">
        {multiline ? (
          <>
            <textarea
              ref={fieldRef}
              className="block w-full p-2 text-xs leading-[1.6] font-mono text-foreground bg-transparent border-none outline-none resize-y min-h-[80px] placeholder:text-muted-foreground"
              value={value || ""}
              rows={rows}
              placeholder={placeholder}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onClick={handleClick}
              onBlur={handleBlur}
              autoComplete="off"
              spellCheck={false}
            />
            {/* Token chip bar — shows all {{bindings}} currently in the value */}
            {boundTokens.length > 0 && (
              <div className="flex items-center flex-wrap gap-1 px-2 py-1.5 border-t border-border bg-muted/50">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mr-0.5 shrink-0">bound</span>
                {boundTokens.map((tok, i) => {
                  const match = effectiveSuggestions.find(
                    (s) => s.value.replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "") === tok
                  );
                  return (
                    <span key={i} className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[3px] bg-primary/10 border border-primary/30 text-[10px] font-mono text-primary cursor-default max-w-full" title={match?.detail || ""}>
                      <span className="truncate min-w-0">{tok}</span>
                      {match?.detail && <span className="text-[9px] text-primary/70 shrink-0">{match.detail}</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <input
            ref={fieldRef}
            type="text"
            className="block w-full h-8 px-2 text-xs font-mono text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground"
            value={value || ""}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            onBlur={handleBlur}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </div>

      {showSuggestions && (
        <SuggestionDropdown
          items={displayedSuggestions}
          totalItems={filteredSuggestions.length}
          filterText={filterText}
          activeIdx={activeIdx}
          onSelect={handleSelect}
          onActiveChange={setActiveIdx}
          style={dropdownStyle}
        />
      )}
    </div>
  );
};