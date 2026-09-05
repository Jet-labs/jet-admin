import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Tabs, TabsList, TabsTrigger } from "@jet-admin/ui";

export const TabsWidget = ({ widgetConfig, widgetState, setWidgetState, fireWidgetEvent, onWidgetInit }) => {
  const tabs = Array.isArray(widgetConfig?.tabs) && widgetConfig.tabs.length ? widgetConfig.tabs : [{ label: "Tab 1", value: "tab1" }, { label: "Tab 2", value: "tab2" }];
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const selected = widgetState?.value ?? widgetConfig?.defaultTab ?? tabs[0]?.value;

  useEffect(() => {
    if (widgetState?.value === undefined) {
      const initial = widgetConfig?.defaultTab ?? tabs[0]?.value;
      if (initial && setWidgetState) setWidgetState((p) => ({ ...p, value: initial }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetConfig?.defaultTab]);

  const methodsRef = useRef(null);
  if (!methodsRef.current) {
    methodsRef.current = {
      setValue: (v) => { if (setWidgetState) setWidgetState((p) => ({ ...p, value: v })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v }); },
      setTab: (v) => { if (setWidgetState) setWidgetState((p) => ({ ...p, value: v })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v }); },
    };
  }
  useEffect(() => { if (onWidgetInit) onWidgetInit(methodsRef.current); }, [onWidgetInit]);

  return (
    <div className="flex items-center w-full h-full p-2 relative overflow-auto">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <Tabs value={String(selected)} onValueChange={(v) => { if (setWidgetState) setWidgetState((p) => ({ ...p, value: v })); if (fireWidgetEvent) fireWidgetEvent("onChange", { value: v }); }} className="w-full">
        <TabsList className="w-full justify-start overflow-auto">
          {tabs.map((t) => (
            <TabsTrigger key={String(t.value)} value={String(t.value)} className="text-xs whitespace-nowrap">{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
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
