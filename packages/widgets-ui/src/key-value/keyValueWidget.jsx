import React, { useMemo } from "react";
import PropTypes from "prop-types";

const prettify = (k) => String(k).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const stringify = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

export const KeyValueWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const emptyText = widgetConfig?.emptyText || "No data";
  const columns = Math.min(3, Math.max(1, Number(widgetConfig?.columns || 1)));
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const entries = useMemo(() => {
    const tpl = widgetConfig?.dataTemplate;
    if (tpl && typeof tpl === "object" && !Array.isArray(tpl)) {
      return Object.entries(tpl).map(([k, v]) => ({ label: prettify(k), value: stringify(v) }));
    }
    if (Array.isArray(widgetConfig?.items) && widgetConfig.items.length) {
      return widgetConfig.items.map((it) => ({ label: it.label || "", value: stringify(it.value) }));
    }
    return [];
  }, [widgetConfig?.dataTemplate, widgetConfig?.items]);

  return (
    <div className="w-full h-full overflow-auto p-2 relative" onClick={() => fireWidgetEvent?.("onClick", {})}>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {entries.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">{emptyText}</div>
      ) : (
        <dl className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {entries.map((e, i) => (
            <div key={i} className="rounded border border-border bg-card p-2 min-w-0">
              <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">{e.label}</dt>
              <dd className="text-sm text-foreground break-words mt-0.5">{e.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

KeyValueWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default KeyValueWidget;
