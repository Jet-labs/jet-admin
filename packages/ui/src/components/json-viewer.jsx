import * as React from "react";
import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Renders a single JSON value with type-appropriate coloring using app design tokens.
 */
const JsonValue = ({ value }) => {
  if (value === null) {
    return <span className="text-muted-foreground italic">null</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-green-400" : "text-red-400"}>
        {String(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className="text-primary">{value}</span>;
  }
  if (typeof value === "string") {
    return (
      <span className="text-foreground/80 break-all">
        &quot;{value}&quot;
      </span>
    );
  }
  return <span className="text-foreground">{String(value)}</span>;
};

/**
 * Renders a collapsible JSON node (object or array).
 */
const JsonNode = ({ data, depth = 0, label }) => {
  const [expanded, setExpanded] = useState(depth < 2);

  const isArray = Array.isArray(data);
  const isObject = data !== null && typeof data === "object";
  const entries = isObject ? Object.entries(data) : [];
  const isEmpty = entries.length === 0;

  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  if (!isObject) {
    return (
      <div style={{ paddingLeft: depth * 12 }} className="flex items-start gap-1 min-w-0">
        {label !== undefined && (
          <span className="text-primary/80 shrink-0 font-mono">
            {typeof label === "number" ? label : `"${label}"`}
            <span className="text-muted-foreground">: </span>
          </span>
        )}
        <JsonValue value={data} />
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: label !== undefined ? depth * 12 : 0 }} className="min-w-0">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 text-left w-full hover:bg-muted/20 rounded transition-colors"
      >
        <span className="text-muted-foreground shrink-0 w-3">
          {expanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </span>
        {label !== undefined && (
          <span className="text-primary/80 font-mono shrink-0">
            {typeof label === "number" ? label : `"${label}"`}
            <span className="text-muted-foreground">: </span>
          </span>
        )}
        <span className="text-muted-foreground font-mono">{openBracket}</span>
        {!expanded && (
          <>
            <span className="text-muted-foreground/60 font-mono text-xs">
              {!isEmpty && (isArray ? `${entries.length} items` : `${entries.length} keys`)}
            </span>
            <span className="text-muted-foreground font-mono">{closeBracket}</span>
          </>
        )}
      </button>

      {expanded && (
        <div className="min-w-0">
          {entries.map(([key, val], idx) => {
            const childLabel = isArray ? idx : key;
            const isLeaf = val === null || typeof val !== "object";
            return (
              <div key={key} style={{ paddingLeft: 12 }} className="min-w-0">
                {isLeaf ? (
                  <div className="flex items-start gap-1 min-w-0 py-0.5">
                    <span className="text-primary/80 font-mono shrink-0 text-xs">
                      {isArray ? idx : `"${key}"`}
                      <span className="text-muted-foreground">: </span>
                    </span>
                    <span className="min-w-0 break-all">
                      <JsonValue value={val} />
                    </span>
                    {idx < entries.length - 1 && (
                      <span className="text-muted-foreground shrink-0">,</span>
                    )}
                  </div>
                ) : (
                  <div className="min-w-0">
                    <JsonNode data={val} depth={depth + 1} label={childLabel} />
                    {idx < entries.length - 1 && (
                      <span className="text-muted-foreground font-mono text-xs">,</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="font-mono text-muted-foreground">{closeBracket}</div>
        </div>
      )}
    </div>
  );
};

/**
 * A themed, collapsible JSON tree viewer.
 *
 * Uses the app design tokens exclusively — no external theme configuration needed.
 * String values use `break-all` so long values never overflow their container.
 *
 * @param {object}  props
 * @param {unknown} props.data      - The JSON value to display (object, array, primitive, or null).
 * @param {string}  [props.className] - Extra classes for the root wrapper.
 *
 * @example
 * <JsonViewer data={{ foo: "bar", count: 42 }} />
 */
const JsonViewer = React.forwardRef(({ data, className, ...props }, ref) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available — silently ignore
    }
  }, [data]);

  if (data === null || data === undefined) {
    return (
      <div className={cn("text-muted-foreground text-xs italic p-2", className)} ref={ref} {...props}>
        No data
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative min-w-0 w-full", className)} {...props}>
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border bg-background hover:bg-muted/30"
        title="Copy JSON"
        type="button"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-green-400" />
            <span className="text-green-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* JSON tree */}
      <div className="font-mono text-xs text-foreground overflow-auto w-full min-w-0 pr-16">
        <JsonNode data={data} depth={0} />
      </div>
    </div>
  );
});

JsonViewer.displayName = "JsonViewer";

export { JsonViewer };
