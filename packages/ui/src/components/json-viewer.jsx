import * as React from "react";
import { Check, ChevronDown, ChevronRight, Copy, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Input } from "./input";

const isObjectLike = (value) => value !== null && typeof value === "object";

const JsonValue = ({ value, wrap }) => {
  if (value === null) return <span className="italic text-muted-foreground">null</span>;
  if (typeof value === "boolean") {
    return <span className={value ? "text-success" : "text-destructive"}>{String(value)}</span>;
  }
  if (typeof value === "number") return <span className="tabular-nums text-info">{value}</span>;
  if (typeof value === "string") {
    return <span className={cn("text-foreground/80", wrap ? "break-all" : "whitespace-nowrap")}>&quot;{value}&quot;</span>;
  }
  return <span className="text-foreground">{String(value)}</span>;
};

const nodeMatches = (data, term) => {
  if (!term) return true;
  const query = term.toLowerCase();
  if (!isObjectLike(data)) {
    try {
      return String(data).toLowerCase().includes(query);
    } catch {
      return false;
    }
  }
  return Object.entries(data).some(([key, value]) => key.toLowerCase().includes(query) || nodeMatches(value, term));
};

const JsonNode = ({ data, depth = 0, label, path = "", defaultExpanded = false, maxDepth = 8, search = "", wrap = true, onCopyPath }) => {
  const isArray = Array.isArray(data);
  const isObject = isObjectLike(data);
  const entries = isObject ? Object.entries(data) : [];
  const isEmpty = entries.length === 0;
  const matches = !search || (label !== undefined && String(label).toLowerCase().includes(search.toLowerCase())) || nodeMatches(data, search);
  const [expanded, setExpanded] = React.useState(defaultExpanded || depth < 2);

  React.useEffect(() => {
    if (search && matches) setExpanded(true);
  }, [search, matches]);

  if (!matches) return null;

  if (!isObject) {
    return (
      <div style={{ paddingLeft: depth * 12 }} className="flex min-w-0 items-start gap-1">
        {label !== undefined && (
          <span className="group/path inline-flex shrink-0 items-center gap-0.5 font-mono text-primary/80">
            {typeof label === "number" ? label : `"${label}"`}
            <span className="text-muted-foreground">: </span>
            {onCopyPath && path && (
              <button
                type="button"
                onClick={() => onCopyPath(path)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-control text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/path:opacity-100"
                aria-label={`Copy path ${path}`}
                title={`Copy ${path}`}
              >
                <Copy className="h-2.5 w-2.5" />
              </button>
            )}
          </span>
        )}
        <span className={cn("min-w-0", wrap ? "break-all" : "overflow-x-auto")}>
          <JsonValue value={data} wrap={wrap} />
        </span>
      </div>
    );
  }

  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const canExpand = depth < maxDepth;

  return (
    <div style={{ paddingLeft: label !== undefined ? depth * 12 : 0 }} className="min-w-0">
      <button
        type="button"
        onClick={() => canExpand && setExpanded((value) => !value)}
        className="flex w-full items-center gap-1 rounded-control text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-expanded={canExpand ? expanded : undefined}
      >
        <span className="w-3 shrink-0 text-muted-foreground">
          {canExpand ? (expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />) : null}
        </span>
        {label !== undefined && (
          <span className="group/path inline-flex shrink-0 items-center gap-0.5 font-mono text-primary/80">
            {typeof label === "number" ? label : `"${label}"`}
            <span className="text-muted-foreground">: </span>
            {onCopyPath && path && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onCopyPath(path);
                }}
                className="inline-flex h-4 w-4 items-center justify-center rounded-control text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/path:opacity-100"
                aria-label={`Copy path ${path}`}
                title={`Copy ${path}`}
              >
                <Copy className="h-2.5 w-2.5" />
              </button>
            )}
          </span>
        )}
        <span className="font-mono text-muted-foreground">{openBracket}</span>
        {!expanded && (
          <>
            <span className="font-mono text-xs text-muted-foreground/60">
              {!isEmpty && (isArray ? `${entries.length} items` : `${entries.length} keys`)}
            </span>
            <span className="font-mono text-muted-foreground">{closeBracket}</span>
          </>
        )}
      </button>

      {expanded && canExpand && (
        <div className="min-w-0">
          {entries.map(([key, value], index) => {
            const childLabel = isArray ? index : key;
            const childPath = isArray ? `${path}[${index}]` : path ? `${path}.${key}` : key;
            return (
              <div key={`${key}-${index}`} className="min-w-0 pl-3">
                <JsonNode
                  data={value}
                  depth={depth + 1}
                  label={childLabel}
                  path={childPath}
                  defaultExpanded={defaultExpanded}
                  maxDepth={maxDepth}
                  search={search}
                  wrap={wrap}
                  onCopyPath={onCopyPath}
                />
                {index < entries.length - 1 && <span className="font-mono text-xs text-muted-foreground">,</span>}
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
 * A themed, collapsible JSON tree viewer with search and copy-path support.
 */
const JsonViewer = React.forwardRef(({
  data,
  className,
  collapsed = false,
  searchable = false,
  maxDepth = 8,
  wrap = true,
  onCopy,
  ...props
}, ref) => {
  const [copied, setCopied] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [copyPath, setCopyPath] = React.useState("");

  const copyText = React.useCallback(async (text, isPath = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isPath) {
        setCopyPath(text);
        setTimeout(() => setCopyPath(""), 1200);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
      onCopy?.(text);
    } catch {
      setCopied(false);
    }
  }, [onCopy]);

  if (data === null || data === undefined) {
    return (
      <div className={cn("p-2 text-xs italic text-muted-foreground", className)} ref={ref} {...props}>
        No data
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative min-w-0 w-full", className)} {...props}>
      <div className="flex items-center gap-1 pb-1">
        {searchable && (
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2 top-1.5 h-3 w-3 text-muted-foreground/60" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search keys or values…"
              aria-label="Search JSON"
              className="h-7 pl-7 text-[11px]"
            />
          </div>
        )}
        <button
          onClick={() => copyText(JSON.stringify(data, null, 2))}
          className="ml-auto inline-flex h-7 items-center gap-1 rounded-control border border-border bg-background px-2 text-[10px] text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          title="Copy JSON"
          type="button"
          aria-label="Copy JSON"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className={cn("w-full min-w-0 overflow-auto font-mono text-xs text-foreground", searchable ? "max-h-80 pr-1" : "pr-1")}>
        <JsonNode
          data={data}
          defaultExpanded={!collapsed}
          maxDepth={maxDepth}
          search={query}
          wrap={wrap}
          onCopyPath={(path) => copyText(path, true)}
        />
      </div>
    </div>
  );
});

JsonViewer.displayName = "JsonViewer";

export { JsonViewer };
