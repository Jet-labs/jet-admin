import React, { useMemo } from "react";
import PropTypes from "prop-types";

export const TimelineWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const emptyText = widgetConfig?.emptyText || "No activity yet";
  const titleKey = widgetConfig?.titleKey || "title";
  const timeKey = widgetConfig?.timeKey || "time";
  const descKey = widgetConfig?.descriptionKey || "description";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const events = useMemo(() => {
    const t = widgetConfig?.dataTemplate;
    if (Array.isArray(t)) return t;
    return [];
  }, [widgetConfig?.dataTemplate]);

  return (
    <div className="w-full h-full overflow-auto p-3 relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {events.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">{emptyText}</div>
      ) : (
        <ol className="relative border-l border-border ml-1.5 space-y-3">
          {events.map((ev, i) => (
            <li key={i} className="ml-4 relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border border-background" />
              <button type="button" onClick={() => fireWidgetEvent?.("onItemClick", { item: ev, index: i })} className="text-left w-full rounded border border-border bg-card p-2 hover:bg-muted/50 transition-colors">
                <div className="text-xs font-semibold text-foreground leading-snug">{String(ev?.[titleKey] ?? ev?.title ?? `Event ${i + 1}`)}</div>
                {(ev?.[timeKey] || ev?.created_at || ev?.timestamp) && <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{String(ev?.[timeKey] ?? ev?.created_at ?? ev?.timestamp)}</div>}
                {(ev?.[descKey] || ev?.body) && <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{String(ev?.[descKey] ?? ev?.body)}</div>}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

TimelineWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default TimelineWidget;
