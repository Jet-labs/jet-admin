import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Checkbox, Label } from "@jet-admin/ui";

export const CheckboxWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "Checkbox";
  const description = widgetConfig?.description || "";
  const disabled = widgetConfig?.disabled === true || widgetConfig?.disabled === "true";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const checked = widgetState?.value ?? widgetConfig?.defaultChecked ?? false;
  const boolChecked = checked === true || checked === "true";

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultChecked !== undefined) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: !!widgetConfig.defaultChecked }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultChecked]);

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const b = v === true || v === "true";
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: b }));
        if (fireWidgetEvent) fireWidgetEvent("onChange", { value: b });
      },
      clear: () => {
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: false }));
        if (fireWidgetEvent) fireWidgetEvent("onChange", { value: false });
      },
      toggle: () => {
        const next = !boolChecked;
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: next }));
        if (fireWidgetEvent) fireWidgetEvent("onChange", { value: next });
      },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  return (
    <div className="flex items-start gap-2 p-2 w-full relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <Checkbox checked={boolChecked} disabled={disabled} onCheckedChange={(c) => { const b = !!c; if (setWidgetState) setWidgetState((p) => ({ ...p, value: b })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: b }); }} id="cb-widget" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <Label htmlFor="cb-widget" className="text-xs font-medium text-foreground cursor-pointer leading-none">{label}</Label>
        {description && <span className="text-xs text-muted-foreground leading-snug">{description}</span>}
      </div>
    </div>
  );
};

CheckboxWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};
export default CheckboxWidget;
