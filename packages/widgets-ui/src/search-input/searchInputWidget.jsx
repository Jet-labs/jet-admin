import React, { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Search, X } from "lucide-react";
import { Input, Label, Spinner, WidgetBusy, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const parseShortcut = (shortcut) => {
  if (!shortcut || typeof shortcut !== "string") return null;
  const parts = shortcut.split("+").map((part) => part.trim().toLowerCase()).filter(Boolean);
  if (!parts.length) return null;
  return {
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    meta: parts.includes("cmd") || parts.includes("meta"),
    alt: parts.includes("alt") || parts.includes("option"),
    shift: parts.includes("shift"),
    key: parts[parts.length - 1],
  };
};

export const SearchInputWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const label = widgetConfig?.label || "";
  const placeholder = widgetConfig?.placeholder || "Search...";
  const debounceMs = Number(widgetConfig?.debounceMs ?? 300);
  const minChars = Math.max(0, Number(widgetConfig?.minChars) || 0);
  const disabled = normalizeFieldBoolean(widgetConfig?.disabled, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const clearable = widgetConfig?.clearable !== false;
  const submitOnEnter = widgetConfig?.submitOnEnter !== false;
  const size = widgetConfig?.size || "default";
  const density = widgetConfig?.properties?.density || "comfortable";
  const reactId = useId();
  const id = `search-${reactId.replace(/:/g, "")}`;
  const inputRef = useRef(null);
  const shortcut = parseShortcut(widgetConfig?.shortcut);

  const value = widgetState?.value ?? widgetConfig?.defaultValue ?? "";
  const [local, setLocal] = useState(value);
  const timerRef = useRef(null);
  const composingRef = useRef(false);

  useEffect(() => { setLocal(value ?? ""); }, [value]);
  useEffect(() => {
    if (widgetState?.value === undefined && widgetConfig?.defaultValue !== undefined) {
      if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: widgetConfig.defaultValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultValue]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!shortcut) return undefined;
    const handleKeyDown = (event) => {
      const target = event.target;
      const editable = target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (editable) return;
      if (
        shortcut.ctrl === event.ctrlKey &&
        shortcut.meta === event.metaKey &&
        shortcut.alt === event.altKey &&
        shortcut.shift === event.shiftKey &&
        event.key.toLowerCase() === shortcut.key
      ) {
        event.preventDefault();
        inputRef.current?.focus?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [widgetConfig?.shortcut, shortcut]);

  const liveRef = useRef(null);
  liveRef.current = { setWidgetState, fireWidgetEvent, debounceMs, minChars };
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
        const next = v ?? "";
        setLocal(next);
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: next }));
        if (rt.fireWidgetEvent) {
          rt.fireWidgetEvent("onChange", { value: next });
          if (next.length >= rt.minChars) rt.fireWidgetEvent("onSearch", { searchTerm: next });
        }
      },
      clear: () => {
        const rt = liveRef.current;
        cancelPendingSearch();
        setLocal("");
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: "" }));
        if (rt.fireWidgetEvent) {
          rt.fireWidgetEvent("onClear", { value: "" });
          rt.fireWidgetEvent("onSearch", { searchTerm: "" });
        }
      },
      focus: () => inputRef.current?.focus?.(),
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const push = (next) => {
    const rt = liveRef.current;
    if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: next }));
    if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value: next });
    cancelPendingSearch();
    if (next.length > 0 && next.length < rt.minChars) return;
    const wait = Number(rt.debounceMs);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      liveRef.current.fireWidgetEvent?.("onSearch", { searchTerm: next });
    }, Number.isNaN(wait) ? 300 : wait);
  };

  const sizeClass = size === "sm" ? "h-7 text-xs" : size === "lg" ? "h-10 text-sm" : "h-8 text-sm";
  return (
    <WidgetSurface density={density} className="relative flex h-full w-full flex-col justify-center gap-1.5" aria-busy={isLoading || undefined}>
      {isLoading && <WidgetBusy label="Searching…" />}
      {label && (
        <Label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
        </Label>
      )}
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
        <Input
          ref={inputRef}
          id={id}
          value={local ?? ""}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value;
            setLocal(next);
            if (!composingRef.current) push(next);
          }}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={(event) => { composingRef.current = false; push(event.target.value); }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && submitOnEnter) {
              cancelPendingSearch();
              const next = event.target.value ?? "";
              const rt = liveRef.current;
              if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value: next }));
              rt.fireWidgetEvent?.("onSearch", { searchTerm: next });
            }
            if (event.key === "Escape" && clearable && local) {
              methodsRef.current.clear();
            }
          }}
          onFocus={() => fireWidgetEvent?.("onFocus", { value: local })}
          onBlur={() => fireWidgetEvent?.("onBlur", { value: local })}
          placeholder={placeholder}
          aria-keyshortcuts={widgetConfig?.shortcut || undefined}
          className={cn("pl-8 bg-background", sizeClass, clearable && local ? "pr-9" : "pr-8")}
        />
        {isLoading && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <Spinner size={13} />
          </span>
        )}
        {!isLoading && clearable && local && (
          <button
            type="button"
            onClick={() => methodsRef.current.clear()}
            className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {minChars > 0 && String(local ?? "").length > 0 && String(local).length < minChars && (
        <p className="text-[10px] text-muted-foreground">Type at least {minChars} characters to search.</p>
      )}
    </WidgetSurface>
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
