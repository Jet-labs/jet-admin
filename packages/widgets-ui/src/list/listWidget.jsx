import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Input } from "@jet-admin/ui";
import { Search, ChevronRight } from "lucide-react";

export const ListWidget = ({ widgetConfig, fireWidgetEvent, widgetState, setWidgetState }) => {
  const emptyText = widgetConfig?.emptyText || "No items";
  const layout = widgetConfig?.layout || "rows";
  const searchable = !!widgetConfig?.searchable;
  const titleKey = widgetConfig?.titleKey || "title";
  const subtitleKey = widgetConfig?.subtitleKey || "subtitle";
  const metaKeys = Array.isArray(widgetConfig?.metaKeys) ? widgetConfig.metaKeys : [];
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const [filter, setFilter] = useState("");

  const items = useMemo(() => {
    const t = widgetConfig?.dataTemplate;
    if (Array.isArray(t)) return t;
    if (Array.isArray(widgetConfig?.items)) return widgetConfig.items;
    return [];
  }, [widgetConfig?.dataTemplate, widgetConfig?.items]);

  const visible = useMemo(() => {
    if (!filter) return items;
    const f = filter.toLowerCase();
    return items.filter((it) => JSON.stringify(it).toLowerCase().includes(f));
  }, [items, filter]);

  const handleClick = (item, index) => {
    if (setWidgetState) setWidgetState((p) => ({ ...p, selectedIndex: index, selectedItem: item }));
    if (fireWidgetEvent) fireWidgetEvent("onItemClick", { item, index });
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {searchable && (
        <div className="p-2 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter..." className="h-7 text-xs pl-8" />
          </div>
        </div>
      )}
      <div className={`flex-1 overflow-auto p-2 min-h-0 ${layout === "cards" ? "grid grid-cols-1 sm:grid-cols-2 gap-2 content-start" : "flex flex-col gap-1.5"}`}>
        {visible.length === 0 && <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">{emptyText}</div>}
        {visible.map((item, i) => {
          const title = item?.[titleKey] ?? item?.name ?? item?.title ?? `Item ${i + 1}`;
          const subtitle = item?.[subtitleKey] ?? item?.description ?? "";
          const selected = widgetState?.selectedIndex === i;
          return (
            <button key={i} type="button" onClick={() => handleClick(item, i)} className={`text-left rounded border p-2 transition-colors w-full ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted/50"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground truncate">{String(title)}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
              {subtitle ? <div className="text-xs text-muted-foreground truncate mt-0.5">{String(subtitle)}</div> : null}
              {metaKeys.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {metaKeys.map((k) => (
                    <span key={k} className="text-[11px] text-muted-foreground bg-muted/50 border border-border rounded px-1.5 py-0.5 font-mono truncate max-w-full">{k}: {String(item?.[k] ?? "—")}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

ListWidget.propTypes = {
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
};
export default ListWidget;
