import * as React from "react";
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap, autocompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { getCompletions, MODES } from '@jet-admin/expression-engine';
import { cn } from "../lib/utils";
import { Maximize2, Minimize2, AlertTriangle, CheckCircle2, Code } from "lucide-react";

// For hot-swapping properties without remounting the editor
const languageCompartment = new Compartment();
const readOnlyCompartment = new Compartment();
const autocompleteCompartment = new Compartment();

const getLanguageExtension = (lang) => {
  switch (lang) {
    case 'javascript': return javascript();
    case 'sql': return sql();
    case 'json': return json();
    case 'html': return html();
    case 'css': return css();
    default: return javascript();
  }
};

function engineTypeToCmType(type) {
  switch (type) {
    case 'object':
    case 'array':
      return 'namespace';
    case 'method':
      return 'method';
    case 'function':
      return 'function';
    case 'property':
      return 'property';
    case 'snippet':
      return 'text';
    default:
      return 'variable';
  }
}

function toCmOption(s) {
  return {
    label: s.label,
    apply: s.value ?? s.label,
    detail: s.detail,
    type: engineTypeToCmType(s.type),
    boost: s.category === 'live-state' ? 2 : (typeof s.category === 'string' && s.category.endsWith('member')) ? 1 : 0,
    info: s.detail ? `Value: ${s.detail}` : undefined,
  };
}

const CodeEditor = React.forwardRef(({
  value,
  defaultValue,
  onChange,
  language = "json",
  height = 300,
  disabled = false,
  readOnly = false,
  theme = "vs-dark",
  className,
  title,
  titleIcon,
  showHeader = true,
  showFormatButton = true,
  showExpandButton = true,
  showLineNumbers = true,
  headerExtra,
  headerLeft,
  status,
  statusMessage,
  footerHint,
  onMount,
  beforeMount,
  extensions = [],
  editorOptions = {},
  // Intellisense Props
  stateTree = null,
  templateMode,
  ...props
}, ref) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const containerRef = React.useRef(null);
  const viewRef = React.useRef(null);
  const internalChange = React.useRef(false);

  const isReadOnly = disabled || readOnly;

  const effectiveTemplateMode = React.useMemo(() => {
    if (templateMode) return templateMode;
    return language === 'javascript' ? MODES.JS_TEMPLATE : MODES.SAFE_PATH;
  }, [templateMode, language]);

  // Build the autocompletion extension
  const autocompletionExtension = React.useMemo(() => {
    const completionSource = (ctx) => {
      const isSql = language === 'sql';
      let inMustache = false;

      if (isSql) {
        // Check if inside {{ }}
        const doc = ctx.state.doc.toString();
        let searchFrom = 0;
        while (searchFrom < doc.length) {
          const open = doc.indexOf('{{', searchFrom);
          if (open === -1) break;
          const close = doc.indexOf('}}', open + 2);
          if (close === -1) break;
          if (ctx.pos > open + 1 && ctx.pos <= close) {
            inMustache = true;
            break;
          }
          searchFrom = close + 2;
        }

        if (!inMustache) {
          const sqlWord = ctx.matchBefore(/[\w.]*/);
          if (!sqlWord) return null;
          if (sqlWord.from === sqlWord.to && !ctx.explicit) return null;

          const text = sqlWord.text;
          const suggestions = [];

          const sqlKeywords = [
            "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN",
            "INNER JOIN", "ON", "GROUP BY", "ORDER BY", "ASC", "DESC",
            "AS", "DISTINCT", "LIMIT", "OFFSET", "INSERT INTO", "VALUES",
            "UPDATE", "SET", "DELETE", "CREATE TABLE", "ALTER TABLE",
            "DROP TABLE", "INDEX", "COUNT", "SUM", "AVG", "MAX", "MIN",
            "AND", "OR", "NOT", "NULL", "IS"
          ];
          sqlKeywords.forEach(kw => suggestions.push({ label: kw, type: 'keyword' }));

          const options = suggestions.filter(s => {
            if (!text) return true;
            const matchQuery = text.includes('.') ? text.split('.').pop().toLowerCase() : text.toLowerCase();
            return s.label.toLowerCase().includes(matchQuery);
          });

          if (options.length === 0 && !ctx.explicit) return null;

          return {
            from: text.includes('.') ? sqlWord.from + text.lastIndexOf('.') + 1 : sqlWord.from,
            options,
            validFor: /^[\w]*$/
          };
        }
      }

      const word = ctx.matchBefore(/[\w.[\]"']*/);
      if (!word) return null;
      if (word.from === word.to && !ctx.explicit) return null;

      const filter = word.text;
      const query = filter.toLowerCase();

      let engineSuggestions = [];

      if (stateTree) {
        engineSuggestions = getCompletions({ filter, stateTree, mode: effectiveTemplateMode });
      } else if (language === 'javascript') {
        // Fallback JS keywords if no stateTree
        const jsKeywords = [
          { label: 'return', detail: 'Return statement' },
          { label: 'const', detail: 'Constant declaration' },
          { label: 'let', detail: 'Variable declaration' },
          { label: 'ctx', detail: 'Workflow context object' },
          { label: 'console.log', detail: 'Log to console' },
          { label: 'JSON.stringify', detail: 'Convert to JSON string' },
          { label: 'JSON.parse', detail: 'Parse JSON string' },
          { label: 'Array.isArray', detail: 'Check if array' },
          { label: 'Object.keys', detail: 'Get object keys' },
          { label: 'Object.values', detail: 'Get object values' },
        ];
        engineSuggestions = jsKeywords.map(k => ({ ...k, type: 'keyword' }));
      }

      const options = engineSuggestions
        .filter(s => {
          if (!query) return true;
          const value = (s.value || s.label || '').toLowerCase();
          const label = (s.label || '').toLowerCase();
          return value.includes(query) || label.includes(query);
        })
        .map(toCmOption);

      if (options.length === 0 && !ctx.explicit) return null;

      return {
        from: word.from,
        options,
        validFor: /^[\w.[\]"']*$/
      };
    };

    return autocompletion({ override: [completionSource], activateOnTyping: true, maxRenderedOptions: 50 });
  }, [language, stateTree, effectiveTemplateMode, tablesMap]);

  // Toggle fullscreen mode
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isExpanded]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const baseExtensions = [
      history(),
      closeBrackets(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...closeBracketsKeymap,
      ]),
      languageCompartment.of(getLanguageExtension(language)),
      readOnlyCompartment.of(EditorState.readOnly.of(isReadOnly)),
      autocompleteCompartment.of(autocompletionExtension),
      oneDark,
      ...extensions,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          internalChange.current = true;
          onChange?.(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': {
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
          fontSize: '12px',
          height: '100%',
          backgroundColor: 'transparent',
          color: 'hsl(var(--foreground))',
        },
        '.cm-scroller': { overflow: 'auto', maxHeight: '100%', scrollbarWidth: 'thin' },
        '.cm-gutters': {
          backgroundColor: 'transparent',
          borderRight: '1px solid hsl(var(--border))',
          color: 'hsl(var(--muted-foreground))',
        },
        '.cm-content': {
          padding: '8px 0',
          caretColor: 'hsl(var(--foreground))',
        },
        '&.cm-focused': { outline: 'none' },
        '.cm-cursor': {
          borderLeftColor: 'hsl(var(--foreground))',
        },
        '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
          background: 'hsl(var(--primary) / 0.15) !important',
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
      }),
    ];

    if (showLineNumbers) {
      baseExtensions.push(lineNumbers());
    }

    const state = EditorState.create({
      doc: value !== undefined ? value : (defaultValue || ''),
      extensions: baseExtensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    if (typeof ref === "function") {
      ref({ editor: view, monaco: null });
    } else if (ref) {
      ref.current = { editor: view, monaco: null };
    }

    if (onMount) {
      onMount(view, null);
    }

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
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

  React.useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: [
          languageCompartment.reconfigure(getLanguageExtension(language)),
          readOnlyCompartment.reconfigure(EditorState.readOnly.of(isReadOnly)),
        ],
      });
    }
  }, [language, isReadOnly]);

  // Sync completion dependencies
  React.useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: autocompleteCompartment.reconfigure(autocompletionExtension),
      });
    }
  }, [autocompletionExtension]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded border text-sm shadow-sm transition-colors",
        status === "error" ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border hover:border-border/80",
        isExpanded
          ? "fixed inset-4 z-50 rounded shadow-2xl ring-1 ring-border/50 bg-background"
          : "relative bg-background",
        className
      )}
      {...props}
    >
      {/* Header Bar */}
      {showHeader && (
        <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            {(title || titleIcon) && (
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                {titleIcon ? titleIcon : <Code className="h-3.5 w-3.5 text-primary" />}
                {title && <span className="text-xs">{title}</span>}
              </div>
            )}
            
            {/* Status Pills */}
            {status && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                status === "valid" ? "bg-green-950/40 text-green-400 border border-green-800" :
                status === "error" ? "bg-red-950/40 text-red-400 border border-red-800" : ""
              )}>
                {status === "valid" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {status === "valid" ? "Valid" : "Invalid"}
              </span>
            )}

            {headerLeft}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5">
            {headerExtra}

            {showExpandButton && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                title={isExpanded ? "Exit fullscreen (Esc)" : "Fullscreen"}
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Main Area */}
      <div className="relative flex-1" style={{ height: isExpanded ? "calc(100vh - 80px)" : (typeof height === "number" ? `${height}px` : height) }}>
        <div ref={containerRef} className="h-full w-full" />

        {/* Footer Hint Overlay */}
        {footerHint && (
          <div className="absolute bottom-2 right-4 z-10 pointer-events-none rounded border border-border bg-background/95 px-2 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm">
            {footerHint}
          </div>
        )}
      </div>

      {/* Error Strip */}
      {status === "error" && statusMessage && (
        <div className="flex items-start gap-2 border-t border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="font-medium whitespace-pre-wrap leading-relaxed">{statusMessage}</span>
        </div>
      )}
    </div>
  );
});

CodeEditor.displayName = "CodeEditor";

export { CodeEditor };
