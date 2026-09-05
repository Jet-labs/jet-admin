import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Input, Label } from "@jet-admin/ui";
import { Search, X } from "lucide-react";

export const SearchInputWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const placeholder = widgetConfig?.placeholder || "Search...";
  const debounceMs = Number(widgetConfig?.debounceMs ?? 300);
  const disabled = widgetConfig?.disabled === true || widgetConfig?.disabled === "true";
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  const value = widgetState?.value ?? widgetConfig?.defaultValue ?? "";
  const [local, setLocal] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => { setLocal(value ?? ""); }, [value]);
  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        setLocal(v ?? "");
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: v ?? "" }));
        if (fireWidgetEvent) { fireWidgetEvent("onChange", { value: v ?? "" }); fireWidgetEvent("onSearch", { searchTerm: v ?? "" }); }
      },
      clear: () => {
        setLocal("");
        if (setWidgetState) setWidgetState((p) => ({ ...p, value: "" }));
        if (fireWidgetEvent) { fireWidgetEvent("onClear", { value: "" }); fireWidgetEvent("onSearch", { searchTerm: "" }); }
      },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  const push = (v) => {
    if (setWidgetState) setWidgetState((p) => ({ ...p, value: v }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (fireWidgetEvent) fireWidgetEvent("onSearch", { searchTerm: v });
    }, Number.isNaN(debounceMs) ? 300 : debounceMs);
  };

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
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/50" />
        <Input
          value={local ?? ""}
          disabled={disabled}
          onChange={(e) => { setLocal(e.target.value); push(e.target.value); }}
          onFocus={() => fireWidgetEvent?.("onFocus", { value: local })}
          onBlur={() => fireWidgetEvent?.("onBlur", { value: local })}
          placeholder={placeholder}
          className="h-8 text-xs pl-8 pr-8 bg-background"
        />
        {local && (
          <button type="button" onClick={() => methodsRef.current.clear()} className="absolute right-2 top-2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

SearchInputWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};
export default SearchInputWidget;
