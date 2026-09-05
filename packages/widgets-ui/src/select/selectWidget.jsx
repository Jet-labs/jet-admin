import React, { useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";

const coerce = (v) => (v === null || v === undefined ? "" : String(v));

/**
 * SelectWidget — single-choice dropdown.
 * State: widgetState.value
 */
export const SelectWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const placeholder = widgetConfig?.placeholder || "Select option...";
  const disabled = widgetConfig?.disabled === true || widgetConfig?.disabled === "true";
  const required = !!widgetConfig?.required;
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const options = useMemo(() => {
    const staticOpts = Array.isArray(widgetConfig?.options) ? widgetConfig.options : [];
    const tpl = widgetConfig?.optionsTemplate;
    // optionsTemplate is already resolved by runtime into array when bound;
    // support both array and already-resolved arrays passed via widgetConfig
    if (Array.isArray(tpl)) {
      const lk = widgetConfig?.labelKey || "label";
      const vk = widgetConfig?.valueKey || "value";
      return tpl.map((o) => (typeof o === "object" && o !== null ? { label: String(o[lk] ?? o.value ?? ""), value: o[vk] ?? o.value } : { label: String(o), value: o }));
    }
    return staticOpts.map((o) => (typeof o === "object" && o !== null ? { label: String(o.label ?? o.value ?? ""), value: o.value } : { label: String(o), value: o }));
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
      setValue: (v) => {
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: v }));
        if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v });
      },
      clear: () => {
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: "" }));
        if (fireWidgetEvent) fireWidgetEvent("onClear", { value: "" });
      },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  return (
    <div className="flex flex-col gap-1.5 w-full p-2 relative">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      {label && <Label className="text-xs font-medium text-foreground">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</Label>}
      <Select value={coerce(value)} onValueChange={(v) => { if (setWidgetState) setWidgetState((p) => ({ ...p, value: v })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v }); }} disabled={disabled}>
        <SelectTrigger className="text-xs w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No options configured</div>}
          {options.map((o, i) => (
            <SelectItem key={`${coerce(o.value)}-${i}`} value={coerce(o.value)}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

SelectWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default SelectWidget;
