import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Label, Checkbox, Input, Button, Popover, PopoverTrigger, PopoverContent } from "@jet-admin/ui";
import { ChevronDown, X } from "lucide-react";

/**
 * MultiSelectWidget — pick N options. State: widgetState.value (array).
 */
export const MultiSelectWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const placeholder = widgetConfig?.placeholder || "Select options...";
  const disabled = widgetConfig?.disabled === true || widgetConfig?.disabled === "true";
  const maxSelected = widgetConfig?.maxSelected;
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const options = useMemo(() => {
    const staticOpts = Array.isArray(widgetConfig?.options) ? widgetConfig.options : [];
    const tpl = widgetConfig?.optionsTemplate;
    const raw = Array.isArray(tpl) ? tpl : staticOpts;
    const lk = widgetConfig?.labelKey || "label";
    const vk = widgetConfig?.valueKey || "value";
    return raw.map((o) => (typeof o === "object" && o !== null ? { label: String(o.label ?? o[lk] ?? o.value ?? ""), value: o.value ?? o[vk] } : { label: String(o), value: o }));
  }, [widgetConfig?.options, widgetConfig?.optionsTemplate, widgetConfig?.labelKey, widgetConfig?.valueKey]);

  const value = useMemo(() => {
    const v = widgetState?.value ?? widgetConfig?.defaultValue ?? [];
    return Array.isArray(v) ? v : [];
  }, [widgetState?.value, widgetConfig?.defaultValue]);

  useEffect(() => {
    if (widgetState?.value === undefined && Array.isArray(widgetConfig?.defaultValue)) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const arr = Array.isArray(v) ? v : [v];
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: arr }));
        if (fireWidgetEvent) fireWidgetEvent("onChange", { value: arr });
      },
      clear: () => {
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: [] }));
        if (fireWidgetEvent) fireWidgetEvent("onClear", { value: [] });
      },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  const toggle = (optVal) => {
    const s = String(optVal);
    const has = value.map(String).includes(s);
    let next;
    if (has) next = value.filter((v) => String(v) !== s);
    else {
      if (maxSelected && value.length >= maxSelected) return;
      next = [...value, optVal];
    }
    if (setWidgetState) setWidgetState((p) => ({ ...p, value: next }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value: next });
  };

  const filtered = filter ? options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase())) : options;
  const selectedLabels = value.map((v) => options.find((o) => String(o.value) === String(v))?.label ?? String(v));

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
      {label && <Label className="text-xs font-medium text-foreground">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" disabled={disabled} className="flex min-h-8 w-full items-center justify-between rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground hover:bg-muted/30 disabled:opacity-50">
            <span className="truncate text-left flex-1">{selectedLabels.length ? selectedLabels.join(", ") : <span className="text-muted-foreground/50">{placeholder}</span>}</span>
            <span className="flex items-center gap-1 shrink-0 ml-2">
              {value.length > 0 && (
                <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); methodsRef.current.clear(); }} onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); methodsRef.current.clear(); } }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter..." className="h-7 text-xs mb-1" />
          <div className="max-h-48 overflow-auto">
            {filtered.map((o, i) => {
              const checked = value.map(String).includes(String(o.value));
              return (
                <label key={`${String(o.value)}-${i}`} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted cursor-pointer">
                  <Checkbox checked={checked} onCheckedChange={() => toggle(o.value)} />
                  <span className="truncate">{o.label}</span>
                </label>
              );
            })}
            {filtered.length === 0 && <div className="px-2 py-2 text-xs text-muted-foreground">No options</div>}
          </div>
        </PopoverContent>
      </Popover>
      {maxSelected ? <span className="text-[11px] text-muted-foreground">{value.length}/{maxSelected} selected</span> : null}
    </div>
  );
};

MultiSelectWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default MultiSelectWidget;
