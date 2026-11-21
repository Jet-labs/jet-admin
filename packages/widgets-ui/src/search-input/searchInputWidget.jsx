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
  const composingRef = useRef(false);

  useEffect(() => { setLocal(value ?? ""); }, [value]);
  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((p) => ({ ...p, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Live callbacks via ref (B05/F02): never initial closures.
  const liveRef = useRef(null);
  liveRef.current = { setWidgetState, fireWidgetEvent, debounceMs };

  // Cancel any pending debounced search so a cleared/overwritten term can
  // never emit a stale onSearch afterwards (B23/F02).
  const cancelPendingSearch = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => {
        const rt = liveRef.current;
        cancelPendingSearch();
        setLocal(v ?? "");
        if (rt.setWidgetState) rt.setWidgetState((p) => ({ ...p, value: v ?? "" }));
        if (rt.fireWidgetEvent) { rt.fireWidgetEvent("onChange", { value: v ?? "" }); rt.fireWidgetEvent("onSearch", { searchTerm: v ?? "" }); }
      },
      clear: () => {
        const rt = liveRef.current;
        cancelPendingSearch();
        setLocal("");
        if (rt.setWidgetState) rt.setWidgetState((p) => ({ ...p, value: "" }));
        if (rt.fireWidgetEvent) { rt.fireWidgetEvent("onClear", { value: "" }); rt.fireWidgetEvent("onSearch", { searchTerm: "" }); }
      },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  const push = (v) => {
    const rt = liveRef.current;
    if (rt.setWidgetState) rt.setWidgetState((p) => ({ ...p, value: v }));
    if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: v });
    cancelPendingSearch();
    const wait = Number(rt.debounceMs);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const latest = liveRef.current;
      if (latest.fireWidgetEvent) latest.fireWidgetEvent("onSearch", { searchTerm: v });
    }, Number.isNaN(wait) ? 300 : wait);
  };

  const liveWidgetEventSearch = (v) => {
    liveRef.current.fireWidgetEvent("onSearch", { searchTerm: v });
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
          onChange={(e) => {
            setLocal(e.target.value);
            // IME composition (CJK etc.): show keystrokes locally but do not
            // launch partial searches until the composition commits (B23).
            if (!composingRef.current) push(e.target.value);
          }}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={(e) => { composingRef.current = false; push(e.target.value); }}
          onKeyDown={(e) => {
            // Enter commits the current term immediately (cancels debounce).
            if (e.key === "Enter") {
              cancelPendingSearch();
              const v = e.target.value ?? "";
              const rt = liveRef.current;
              if (rt.setWidgetState) rt.setWidgetState((p) => ({ ...p, value: v }));
              if (rt.fireWidgetEvent) rt.fireWidgetEvent("onSearch", { searchTerm: v });
            }
          }}
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
