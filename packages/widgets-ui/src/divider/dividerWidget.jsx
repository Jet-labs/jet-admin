import React from "react";
import PropTypes from "prop-types";
import { Separator } from "@jet-admin/ui";

export const DividerWidget = ({ widgetConfig }) => {
  const label = widgetConfig?.label || "";
  const orientation = widgetConfig?.orientation || "horizontal";
  const spacing = widgetConfig?.spacing || "md";
  const thickness = widgetConfig?.thickness || "thin";

  const pad = spacing === "sm" ? "p-1" : spacing === "lg" ? "p-4" : "p-2";
  const weight = thickness === "thick" ? "border-t-2" : thickness === "medium" ? "border-t" : "border-t";

  if (orientation === "vertical") {
    return (
      <div className={`flex items-center justify-center w-full h-full ${pad}`}>
        <Separator orientation="vertical" className="h-full" />
      </div>
    );
  }

  if (!label) {
    return (
      <div className={`flex items-center w-full h-full ${pad}`}>
        <div className={`w-full ${weight} border-border`} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 w-full h-full ${pad}`}>
      <div className={`flex-1 ${weight} border-border`} />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{label}</span>
      <div className={`flex-1 ${weight} border-border`} />
    </div>
  );
};

DividerWidget.propTypes = { widgetConfig: PropTypes.object };
export default DividerWidget;
