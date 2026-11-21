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
    // Radix Select.Item rejects an empty-string value. Drop unfinished/blank
    // option rows so live authoring previews render instead of crashing.
    const withValidValue = (opts) =>
      opts.map((o) => (typeof o === "object" && o !== null
        ? { label: String(o.label ?? o.value ?? ""), value: o.value }
        : { label: String(o), value: o }))
        .filter((o) => coerce(o.value) !== "");
    // optionsTemplate is already resolved by runtime into array when bound;
    // support both array and already-resolved arrays passed via widgetConfig
    if (Array.isArray(tpl)) {
      const lk = widgetConfig?.labelKey || "label";
      const vk = widgetConfig?.valueKey || "value";
      return withValidValue(tpl.map((o) => (typeof o === "object" && o !== null
        ? { label: String(o[lk] ?? o.value ?? ""), value: o[vk] ?? o.value }
        : { label: String(o), value: o })));
    }
    return withValidValue(staticOpts);
  }, [widgetConfig?.options, widgetConfig?.optionsTemplate, widgetConfig?.labelKey, widgetConfig?.valueKey]);

  const value = widgetState?.value ?? widgetConfig?.defaultValue ?? "";
  const clearable = widgetConfig?.clearable === true || widgetConfig?.clearable === "true";

  // Advertised open/close behavior (B17/E15): exactly one event per open and
  // per close through the live dispatcher.
  const handleOpenChange = (open) => {
    if (liveRef.current.fireWidgetEvent) {
      liveRef.current.fireWidgetEvent(open ? "onOpen" : "onClose", { value });
    }
  };

  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  // Live callbacks via ref (B05/F02): open/close/clear/change always use the
  // current dispatcher, never the first render's closure.
  const liveRef = useRef(null);
  liveRef.current = { setWidgetState, fireWidgetEvent };
  const emitChange = (v) => {
    const rt = liveRef.current;
    if (rt.setWidgetState) rt.setWidgetState((p) => ({ ...p, value: v }));
    if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: v });
  };
  const emitClear = () => {
    const rt = liveRef.current;
    if (rt.setWidgetState) rt.setWidgetState((p) => ({ ...p, value: "" }));
    if (rt.fireWidgetEvent) rt.fireWidgetEvent("onClear", { value: "" });
  };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => emitChange(v),
      clear: () => emitClear(),
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
      <Select value={coerce(value)} onValueChange={(v) => emitChange(v)} onOpenChange={handleOpenChange} disabled={disabled}>
        <div className="relative w-full">
          <SelectTrigger className="text-xs w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
          {clearable && value !== "" && value !== undefined && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); emitClear(); }}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear selection"
            >
              <span className="text-xs leading-none">×</span>
            </button>
          )}
        </div>
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
