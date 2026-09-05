import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Label } from "@jet-admin/ui";

export const SliderWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const min = Number(widgetConfig?.min ?? 0);
  const max = Number(widgetConfig?.max ?? 100);
  const step = Number(widgetConfig?.step ?? 1);
  const showValue = widgetConfig?.showValue !== false;
  const disabled = widgetConfig?.disabled === true || widgetConfig?.disabled === "true";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const raw = widgetState?.value ?? widgetConfig?.defaultValue ?? min;
  const num = Number(raw);
  const value = Number.isNaN(num) ? min : Math.min(max, Math.max(min, num));
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: Number(widgetConfig.defaultValue) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const n = Math.min(max, Math.max(min, Number(v)));
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: n }));
        if (fireWidgetEvent) fireWidgetEvent("onChange", { value: n });
      },
      clear: () => {
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: min }));
        if (fireWidgetEvent) fireWidgetEvent("onChange", { value: min });
      },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  return (
    <div className="flex flex-col gap-2 p-2 w-full relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        {label && <Label className="text-xs font-medium text-foreground">{label}</Label>}
        {showValue && <span className="text-xs font-semibold text-foreground tabular-nums bg-muted/50 border border-border rounded px-1.5 py-0.5">{value}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (setWidgetState) setWidgetState((p) => ({ ...p, value: n }));
          if (fireWidgetEvent) fireWidgetEvent("onChange", { value: n });
        }}
        className="w-full h-1.5 cursor-pointer appearance-none rounded bg-muted border border-border disabled:opacity-50"
        style={{ background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)` }}
      />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
};

SliderWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};
export default SliderWidget;
