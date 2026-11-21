import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Switch, Label } from "@jet-admin/ui";

export const SwitchWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "Toggle";
  const description = widgetConfig?.description || "";
  const disabled = widgetConfig?.disabled === true || widgetConfig?.disabled === "true";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const checkedRaw = widgetState?.value ?? widgetConfig?.defaultChecked ?? false;
  const checked = checkedRaw === true || checkedRaw === "true";

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultChecked !== undefined) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: !!widgetConfig.defaultChecked }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultChecked]);

  // Current-state refs (B05/F02): methods must read the latest committed
  // value and live callbacks, never the first render's closure.
  const liveRef = useRef(null);
  liveRef.current = { checked, setWidgetState, fireWidgetEvent };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const rt = liveRef.current;
        const b = v === true || v === "true";
        if (rt.setWidgetState) rt.setWidgetState((p) => ({ ...p, value: b }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: b });
      },
      toggle: () => {
        const rt = liveRef.current;
        // Resolve against the latest committed state, not the creation closure.
        const next = !rt.checked;
        if (rt.setWidgetState) rt.setWidgetState(() => ({ value: next }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: next });
      },
      clear: () => {
        const rt = liveRef.current;
        if (rt.setWidgetState) rt.setWidgetState((p) => ({ ...p, value: false }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: false });
      },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  return (
    <div className="flex items-center justify-between gap-3 p-2 w-full relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <Label className="text-xs font-medium text-foreground leading-none">{label}</Label>
        {description && <span className="text-xs text-muted-foreground leading-snug">{description}</span>}
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={(c) => { const b = !!c; if (setWidgetState) setWidgetState((p) => ({ ...p, value: b })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: b }); }} />
    </div>
  );
};

SwitchWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};
export default SwitchWidget;
