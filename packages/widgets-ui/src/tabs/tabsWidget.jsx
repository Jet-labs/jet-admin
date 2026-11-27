import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Skeleton, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const normalizeTabs = (tabs) => {
  const list = Array.isArray(tabs) && tabs.length ? tabs : [{ label: "Tab 1", value: "tab1" }, { label: "Tab 2", value: "tab2" }];
  return list.map((tab, index) => {
    if (tab && typeof tab === "object") {
      return {
        label: String(tab.label ?? tab.value ?? `Tab ${index + 1}`),
        value: String(tab.value ?? index),
        disabled: normalizeFieldBoolean(tab.disabled, false),
      };
    }
    return { label: String(tab), value: String(tab), disabled: false };
  });
};

export const TabsWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const tabs = normalizeTabs(widgetConfig?.tabs);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const orientation = widgetConfig?.orientation || "horizontal";
  const variant = widgetConfig?.variant || "underline";
  const density = widgetConfig?.properties?.density || "comfortable";
  const selected = widgetState?.value ?? widgetConfig?.defaultTab ?? tabs[0]?.value;
  const refs = useRef([]);

  useEffect(() => {
    if (widgetState?.value === undefined) {
      const initial = widgetConfig?.defaultTab ?? tabs[0]?.value;
      if (initial && setWidgetState) setWidgetState((prev) => ({ ...prev, value: initial }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultTab]);

  const liveRef = useRef(null);
  liveRef.current = { setWidgetState, fireWidgetEvent };
  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (value) => {
        const rt = liveRef.current;
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value });
      },
      setTab: (value) => {
        const rt = liveRef.current;
        if (rt.setWidgetState) rt.setWidgetState((prev) => ({ ...prev, value }));
        if (rt.fireWidgetEvent) rt.fireWidgetEvent("onChange", { value });
      },
    };
  }
  useEffect(() => {
    if (onWidgetInit) onWidgetInit(methodsRef.current);
  }, [onWidgetInit]);

  const select = (tab) => {
    if (tab.disabled) return;
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, value: tab.value }));
    if (fireWidgetEvent) fireWidgetEvent("onChange", { value: tab.value });
  };

  const handleKeyDown = (event, index) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
    else next = (index + 1) % tabs.length;
    let guard = 0;
    while (tabs[next]?.disabled && guard < tabs.length) {
      next = (next + 1) % tabs.length;
      guard += 1;
    }
    refs.current[next]?.focus();
    select(tabs[next]);
  };

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full items-center gap-1 p-1">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface density={density} className="flex h-full w-full overflow-auto p-1">
      <div
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          "flex w-full gap-1",
          orientation === "vertical" ? "flex-col" : "flex-row items-center overflow-x-auto",
          variant === "segmented" && "rounded-control border border-border bg-muted/30 p-0.5"
        )}
      >
        {tabs.map((tab, index) => {
          const active = String(selected) === tab.value;
          return (
            <button
              key={`${tab.value}-${index}`}
              ref={(node) => { refs.current[index] = node; }}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => select(tab)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "inline-flex h-7 shrink-0 items-center justify-center whitespace-nowrap px-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
                variant === "underline" && "rounded-none border-b-2",
                variant === "underline" && (active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"),
                variant === "pills" && "rounded-full border",
                variant === "pills" && (active ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"),
                variant === "segmented" && "rounded-[4px]",
                variant === "segmented" && (active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </WidgetSurface>
  );
};

TabsWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  onWidgetInit: PropTypes.func,
};

export default TabsWidget;
