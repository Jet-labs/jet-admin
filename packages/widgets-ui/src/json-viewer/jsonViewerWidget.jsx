import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { JsonViewer } from "@jet-admin/ui";

export const JsonViewerWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const collapsed = !!widgetConfig?.collapsed;
  const maxHeight = Number(widgetConfig?.maxHeight || 0);

  const data = useMemo(() => {
    const t = widgetConfig?.dataTemplate;
    if (t === undefined || t === "") return { message: "Bind dataTemplate to inspect a value" };
    return t;
  }, [widgetConfig?.dataTemplate]);

  return (
    <div className="w-full h-full overflow-auto p-2 relative bg-background" onClick={() => fireWidgetEvent?.("onClick", {})}>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <div className="rounded border border-border bg-card overflow-hidden" style={maxHeight > 0 ? { maxHeight, overflow: "auto" } : undefined}>
        <JsonViewer data={data} collapsed={collapsed} />
      </div>
    </div>
  );
};

JsonViewerWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default JsonViewerWidget;
