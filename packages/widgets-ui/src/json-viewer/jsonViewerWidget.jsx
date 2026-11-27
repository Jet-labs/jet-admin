import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { JsonViewer, Skeleton, WidgetSurface } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

export const JsonViewerWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const collapsed = !!widgetConfig?.collapsed;
  const maxHeight = Number(widgetConfig?.maxHeight || 0);
  const density = widgetConfig?.properties?.density || "comfortable";

  const data = useMemo(() => {
    const template = widgetConfig?.dataTemplate;
    if (template === undefined || template === "") return { message: "Bind dataTemplate to inspect a value" };
    return template;
  }, [widgetConfig?.dataTemplate]);

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full flex-col gap-1.5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface
      density={density}
      className="relative flex h-full w-full flex-col overflow-hidden"
      onClick={() => fireWidgetEvent?.("onClick", {})}
    >
      <div
        className="min-h-0 flex-1 rounded-card border border-border bg-card p-1"
        style={maxHeight > 0 ? { maxHeight, overflow: "auto" } : { overflow: "auto" }}
      >
        <JsonViewer
          data={data}
          collapsed={collapsed}
          searchable={widgetConfig?.searchable !== false}
          wrap={widgetConfig?.wrap !== false}
          maxDepth={Number(widgetConfig?.maxDepth) || 8}
        />
      </div>
    </WidgetSurface>
  );
};

JsonViewerWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default JsonViewerWidget;
