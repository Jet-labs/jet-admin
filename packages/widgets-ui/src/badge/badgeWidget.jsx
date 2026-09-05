import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@jet-admin/ui";

export const BadgeWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const text = widgetConfig?.text ?? "Badge";
  const variant = widgetConfig?.variant || "default";
  const size = widgetConfig?.size || "default";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const sizeClass = size === "sm" ? "text-[11px] px-1.5 py-0" : size === "lg" ? "text-sm px-3 py-1" : "";

  return (
    <div className="flex items-center justify-center w-full h-full p-2 relative" onClick={() => fireWidgetEvent?.("onClick", { text })}>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <Badge variant={variant} className={sizeClass}>{String(text)}</Badge>
    </div>
  );
};

BadgeWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default BadgeWidget;
