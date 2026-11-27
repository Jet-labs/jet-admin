import React from "react";
import PropTypes from "prop-types";
import { cn } from "@jet-admin/ui";

const PADDING = { sm: "p-1", md: "p-2", lg: "p-4" };
const BORDER_WIDTH = { thin: "1px", medium: "2px", thick: "4px" };
const BORDER_STYLE = { solid: "solid", dashed: "dashed", dotted: "dotted" };

export const DividerWidget = ({ widgetConfig }) => {
  const label = widgetConfig?.label || "";
  const orientation = widgetConfig?.orientation || "horizontal";
  const spacing = widgetConfig?.spacing || "md";
  const thickness = widgetConfig?.thickness || "thin";
  const lineStyle = widgetConfig?.lineStyle || "solid";
  const color = widgetConfig?.color || "";
  const inset = !!widgetConfig?.inset;
  const labelAlign = widgetConfig?.labelAlign || "center";
  const pad = PADDING[spacing] || PADDING.md;
  const lineStyleObject = {
    borderColor: color || "hsl(var(--border))",
    borderStyle: BORDER_STYLE[lineStyle] || "solid",
  };
  const weight = BORDER_WIDTH[thickness] || BORDER_WIDTH.thin;

  if (orientation === "vertical") {
    return (
      <div className={cn("flex h-full w-full items-stretch justify-center", pad)}>
        <div role="separator" aria-orientation="vertical" className="h-full" style={{ ...lineStyleObject, borderLeftWidth: weight }} />
      </div>
    );
  }

  if (!label) {
    return (
      <div className={cn("flex w-full items-center", pad, inset && "px-4")}>
        <div role="separator" aria-orientation="horizontal" className="w-full" style={{ ...lineStyleObject, borderTopWidth: weight }} />
      </div>
    );
  }

  return (
    <div className={cn("flex w-full items-center gap-2", pad, inset && "px-4")}>
      {labelAlign !== "left" && <div className="flex-1" style={{ ...lineStyleObject, borderTopWidth: weight }} />}
      <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {labelAlign !== "right" && <div className="flex-1" style={{ ...lineStyleObject, borderTopWidth: weight }} />}
    </div>
  );
};

DividerWidget.propTypes = { widgetConfig: PropTypes.object };
export default DividerWidget;
