import React, { useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Label, RadioGroup, RadioGroupItem } from "@jet-admin/ui";

export const RadioGroupWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const orientation = widgetConfig?.orientation || "vertical";
  const disabled = widgetConfig?.disabled === true || widgetConfig?.disabled === "true";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const options = useMemo(() => {
    const raw = Array.isArray(widgetConfig?.optionsTemplate) ? widgetConfig.optionsTemplate : (widgetConfig?.options || []);
    const lk = widgetConfig?.labelKey || "label";
    const vk = widgetConfig?.valueKey || "value";
    return raw.map((o) => (typeof o === "object" && o !== null ? { label: String(o.label ?? o[lk] ?? ""), value: String(o.value ?? o[vk] ?? "") } : { label: String(o), value: String(o) }));
  }, [widgetConfig?.options, widgetConfig?.optionsTemplate, widgetConfig?.labelKey, widgetConfig?.valueKey]);

  const value = widgetState?.value ?? widgetConfig?.defaultValue ?? "";

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => { if (setWidgetState) setWidgetState((p) => ({ ...p, value: v })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v }); },
      clear: () => { if (setWidgetState) setWidgetState((p) => ({ ...p, value: "" })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: "" }); },
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
      {label && <Label className="text-xs font-medium text-foreground">{label}</Label>}
      <RadioGroup value={String(value ?? "")} onValueChange={(v) => { if (setWidgetState) setWidgetState((p) => ({ ...p, value: v })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v }); }} disabled={disabled} className={orientation === "horizontal" ? "flex flex-row flex-wrap gap-4" : "flex flex-col gap-2"}>
        {options.length === 0 && <span className="text-xs text-muted-foreground">No options configured</span>}
        {options.map((o, i) => (
          <div key={`${o.value}-${i}`} className="flex items-center gap-2">
            <RadioGroupItem value={String(o.value)} id={`rg-${String(o.value)}-${i}`} />
            <Label htmlFor={`rg-${String(o.value)}-${i}`} className="text-xs text-foreground cursor-pointer font-normal">{o.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

RadioGroupWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};
export default RadioGroupWidget;
