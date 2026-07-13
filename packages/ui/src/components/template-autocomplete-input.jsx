/**
 * TemplateAutocompleteInput
 *
 * A CodeMirror 6 powered input that behaves like a plain text field, but provides
 * full JS + JSON-schema intellisense when the cursor is inside a {{ }} zone.
 *
 * Ported from the standalone mustache-editor, adapted for the @jet-admin/ui
 * design system (Tailwind tokens, compact sizing, single-line + multiline modes).
 *
 * Props:
 *   value          {string}   Controlled value
 *   onChange       {fn}       Called with new string on every change
 *   placeholder    {string}   Placeholder text
 *   context        {object}   JSON object; auto-derives all deep dot-paths (VS Code-style)
 *   jsonContext    {object}   Alias for context — use whichever you prefer
 *   liveStateTree  {object}   The live runtime state tree (wrapped as { state: … })
 *   mode           {string}   Expression-engine mode driving intellisense:
 *                             "js-template" (default) → object keys + JS built-ins,
 *                             "safe-path" → object keys only.
 *   isTextArea     {boolean}  Multiline mode
 *   isParagraph    {boolean}  Alias for isTextArea
 *   rows           {number}   Approximate visible rows for textarea mode (default: 4)
 *   readOnly       {boolean}  Read-only mode
 *   className      {string}   Extra class on the wrapper
 */

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete';

import { useMustacheCompletions, getCursorZone } from './template-autocomplete/useMustacheCompletions';
import { mustacheHighlighter } from './template-autocomplete/mustacheHighlighter';

// ─── Context crawler (kept for legacy/external consumers) ─────────────────────
export function deriveContextSuggestions(obj, prefix = "", depth = 0, maxDepth = 5) {
  if (depth > maxDepth || obj === null || obj === undefined) return [];
  const suggestions = [];

  const addSuggestions = (newItems) => {
    for (let i = 0; i < newItems.length; i++) {
      suggestions.push(newItems[i]);
    }
  };

  if (Array.isArray(obj)) {
    if (prefix) {
      suggestions.push({ value: prefix, label: prefix, detail: `Array[${obj.length}]`, type: "array" });
      suggestions.push({ value: `${prefix}.length`, label: `${prefix}.length`, detail: "Number", type: "property" });
    }
    if (obj.length > 0 && typeof obj[0] === "object" && obj[0] !== null) {
      addSuggestions(deriveContextSuggestions(obj[0], prefix ? `${prefix}[0]` : "[0]", depth + 1, maxDepth));
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
        addSuggestions(deriveContextSuggestions(val, childPath, depth + 1, maxDepth));
      } else if (typeof val === "object") {
        addSuggestions(deriveContextSuggestions(val, childPath, depth + 1, maxDepth));
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
export const TemplateAutocompleteInput = ({
  value,
  onChange,
  placeholder,
  context,
  jsonContext,
  liveStateTree,
  mode,
  isTextArea = false,
  isParagraph = false,
  rows = 4,
  readOnly = false,
  size = "sm",
  className = "",
}) => {
  const multiline = isTextArea || isParagraph;
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const internalChange = useRef(false);
  // Each instance gets its own Compartments to avoid shared state conflicts
  const readOnlyCompartment = useRef(new Compartment()).current;
  const autocompleteCompartment = useRef(new Compartment()).current;

  // Merge context sources: jsonContext > context > liveStateTree > derive from suggestions
  const effectiveContext = useMemo(() => {
    if (jsonContext && typeof jsonContext === 'object') return jsonContext;
    if (context && typeof context === 'object') return context;
    if (liveStateTree && typeof liveStateTree === 'object') return liveStateTree;
    return {};
  }, [jsonContext, context, liveStateTree]);

  // Build the CodeMirror completion source.
  // We store it in a ref so the actual CM completion function has a stable
  // identity — it delegates to whatever mustacheSourceRef.current holds.
  const mustacheSource = useMustacheCompletions(effectiveContext, mode);
  const mustacheSourceRef = useRef(mustacheSource);
  mustacheSourceRef.current = mustacheSource;

  // Stable wrapper that delegates to the latest completion source ref.
  // This never changes identity, so it won't cause extension rebuilds.
  const stableCompletionSource = useCallback((ctx) => {
    return mustacheSourceRef.current(ctx);
  }, []);

  // Token chip bar for multiline — shows all {{bindings}} currently in value
  const boundTokens = useMemo(() => extractTokens(value), [value]);

  // Compute heights based on mode
  // We subtract 2px from the Tailwind height to account for the wrapper's 1px border.
  let singleLineHeight = '26px'; // h-7 (28px) - 2px
  let fontSize = '12px';
  let px = '8px';
  if (size === 'default') {
    singleLineHeight = '30px'; // h-8 (32px) - 2px
    fontSize = '14px';
    px = '10px';
  } else if (size === 'lg') {
    singleLineHeight = '38px'; // h-10 (40px) - 2px
    fontSize = '16px';
    px = '12px';
  }

  const lineHeightPx = 20; // approximate line height in px
  const paddingPx = multiline ? 12 : 0;
  const minContentH = multiline ? `${Math.max(rows * lineHeightPx + paddingPx * 2, 80)}px` : singleLineHeight;
  const maxContentH = multiline ? '400px' : singleLineHeight;

  // Build base extensions — the autocompletion config lives in a
  // Compartment so it can be hot-swapped when the completion source changes
  // without remounting the entire editor (which would steal focus).
  const baseExtensions = useMemo(() => {
    const exts = [
      history(),
      mustacheHighlighter,

      autocompleteCompartment.of(
        autocompletion({
          override: [stableCompletionSource],
          defaultKeymap: true,
          closeOnBlur: true,
          activateOnTyping: true,
          maxRenderedOptions: 50,
        })
      ),

      closeBrackets(),

      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...completionKeymap,
        ...closeBracketsKeymap,
      ]),

      // Update listener → propagate changes upward
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          internalChange.current = true;
          onChange?.(update.state.doc.toString());
        }
      }),

      // Theme — compact, blends with the @jet-admin/ui design system
      EditorView.theme({
        '&': {
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
          fontSize: fontSize,
          lineHeight: '1.6',
          outline: 'none',
          background: 'transparent',
          color: 'hsl(var(--foreground))',
        },
        '.cm-content': {
          padding: multiline ? `8px ${px}` : `0 ${px}`,
          minHeight: minContentH,
          maxHeight: maxContentH,
          caretColor: 'hsl(var(--foreground))',
          // Single-line: vertically center text
          ...(multiline ? {} : {
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
          }),
        },
        '.cm-line': {
          padding: '0',
          ...(multiline ? {} : {
            // Force single-line: don't allow wrapping
          }),
        },
        '.cm-scroller': {
          overflow: multiline ? 'auto' : 'hidden',
          maxHeight: maxContentH,
          scrollbarWidth: 'thin',
        },
        '.cm-focused': { outline: 'none' },
        '.cm-cursor': {
          borderLeftColor: 'hsl(var(--foreground))',
        },
        '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
          background: 'hsl(var(--primary) / 0.15)',
        },
        // {{ }} delimiter styling
        '.cm-mustache-delim': {
          color: 'hsl(var(--primary))',
          fontWeight: '600',
          opacity: '0.9',
        },
        // Zone interior background tint
        '.cm-mustache-zone': {
          background: 'hsl(var(--primary) / 0.06)',
          borderRadius: '2px',
        },
        // Autocomplete dropdown — match design system
        '.cm-tooltip.cm-tooltip-autocomplete': {
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          background: 'hsl(var(--background))',
          fontSize: '11px',
          overflow: 'hidden',
          maxHeight: '220px',
          zIndex: '9999',
        },
        '.cm-tooltip-autocomplete > ul': {
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
          maxHeight: '220px',
          scrollbarWidth: 'thin',
        },
        '.cm-tooltip-autocomplete > ul > li': {
          padding: '4px 10px',
          lineHeight: '1.5',
          color: 'hsl(var(--foreground))',
        },
        '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
          background: 'hsl(var(--primary) / 0.12)',
          color: 'hsl(var(--foreground))',
        },
        '.cm-completionLabel': {
          color: 'hsl(var(--foreground))',
          fontSize: '11px',
        },
        '.cm-completionDetail': {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '10px',
          marginLeft: '8px',
        },
        '.cm-completionIcon': {
          marginRight: '4px',
          opacity: '0.7',
        },
        // Placeholder
        '.cm-placeholder': {
          color: 'hsl(var(--muted-foreground))',
          fontStyle: 'normal',
          fontSize: fontSize,
        },
      }),
    ];

    // Line wrapping for multiline mode
    if (multiline) {
      exts.push(EditorView.lineWrapping);
    }

    // Single-line: block Enter key from inserting newlines
    if (!multiline) {
      exts.push(
        keymap.of([{
          key: 'Enter',
          run: () => true, // consume Enter — don't insert newline
        }])
      );
      // Prevent newlines via transaction filter
      exts.push(
        EditorState.transactionFilter.of(tr => {
          if (!tr.docChanged) return tr;
          let hasNewline = false;
          tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
            if (inserted.toString().includes('\n')) hasNewline = true;
          });
          if (hasNewline) {
            const newChanges = [];
            tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
              // Strip trailing newlines and convert internal ones to space
              const cleanedText = inserted.toString()
                .replace(/\r?\n$/, '')
                .replace(/\r?\n/g, ' ');
              newChanges.push({ from: fromA, to: toA, insert: cleanedText });
            });
            return {
              changes: newChanges,
              sequential: true
            };
          }
          return tr;
        })
      );
    }

    return exts;
  }, [multiline, minContentH, maxContentH, fontSize, px]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mount the editor once ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous content
    containerRef.current.innerHTML = '';

    const state = EditorState.create({
      doc: value || '',
      extensions: [
        ...baseExtensions,
        cmPlaceholder(placeholder || ''),
        readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [baseExtensions]); // re-mount when extensions change

  // ── Sync external value changes INTO the editor ──────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // Skip if this change originated inside the editor (we already have it)
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }

    const current = view.state.doc.toString();
    const incoming = value || '';
    if (current !== incoming) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: incoming },
      });
    }
  }, [value]);

  // ── Hot-swap readOnly ────────────────────────────────────────────────────
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`bg-input-custom border border-input-custom rounded transition-shadow duration-150 [&:has(.cm-focused)]:border-border/80 [&:has(.cm-focused)]:ring-2 [&:has(.cm-focused)]:ring-primary/30`}
      >
        {/* CodeMirror editor mount point */}
        <div
          ref={containerRef}
          className="tpl-cm-container"
          style={{ cursor: 'text' }}
        />

        {/* Token chip bar — shows all {{bindings}} currently in the value (multiline only) */}
        {multiline && boundTokens.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 px-2 py-1.5 border-t border-border bg-muted/50 rounded-b-[2px]">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mr-0.5 shrink-0">bound</span>
            {boundTokens.map((tok, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[3px] bg-primary/10 border border-primary/30 text-[10px] font-mono text-primary cursor-default max-w-full" title={tok}>
                <span className="truncate min-w-0">{tok}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};