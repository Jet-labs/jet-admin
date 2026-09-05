import React, { useMemo } from "react";
import PropTypes from "prop-types";

const statusColor = (status) => {
  switch (status) {
    case "success": return "hsl(142 76% 36%)";
    case "warning": return "hsl(38 92% 50%)";
    case "error": return "hsl(0 84% 60%)";
    default: return "hsl(var(--primary))";
  }
};

export const ProgressWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const label = widgetConfig?.label || "";
  const variant = widgetConfig?.variant || "bar";
  const showValue = widgetConfig?.showValue !== false;
  const status = widgetConfig?.status || "default";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const value = useMemo(() => {
    const raw = widgetConfig?.valueTemplate;
    const n = Number(raw);
    if (Number.isNaN(n)) return 0;
    return Math.min(100, Math.max(0, n));
  }, [widgetConfig?.valueTemplate]);

  const color = statusColor(status);
  const R = 44;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full h-full p-3 relative" onClick={() => fireWidgetEvent?.("onClick", { value })}>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {label && <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>}
      {variant === "ring" ? (
        <div className="relative" style={{ width: 110, height: 110 }}>
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r={R} stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
            <circle cx="55" cy="55" r={R} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C - (C * value) / 100} transform="rotate(-90 55 55)" style={{ transition: "stroke-dashoffset 0.4s ease" }} />
          </svg>
          {showValue && <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground tabular-nums">{Math.round(value)}%</span>}
        </div>
      ) : (
        <div className="w-full">
          <div className="h-2.5 w-full rounded bg-muted border border-border overflow-hidden">
            <div className="h-full rounded transition-all duration-300" style={{ width: `${value}%`, background: color }} />
          </div>
          {showValue && <div className="flex justify-between mt-1 text-xs text-muted-foreground tabular-nums"><span>Progress</span><span className="font-semibold text-foreground">{Math.round(value)}%</span></div>}
        </div>
      )}
    </div>
  );
};

ProgressWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default ProgressWidget;
