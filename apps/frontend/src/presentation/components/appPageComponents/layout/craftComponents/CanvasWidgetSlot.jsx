/**
 * CanvasWidgetSlot.jsx — Craft.js User Component
 *
 * Leaf node that wraps a single Jet-Admin widget inside the Craft editor.
 * Supports free-placement resizing via pixel width/height props.
 * In design mode all pointer events on the widget content are blocked so
 * Craft.js owns selection and drag; in preview mode widgets are fully interactive.
 */
import React from "react";
import { useNode } from "@craftjs/core";
import { useCraftEditorContext } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import WidgetResizeHandles from "../WidgetResizeHandles.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";

export function CanvasWidgetSlot({
  widgetKey,
  width,   // pixel width, null = 100%
  height,  // pixel height, null = auto
  sizing,
  fixedHeight, // legacy — kept for migration compat
  style,
  condition,
  repeat,
  locked,
}) {
  const { renderWidget, previewMode } = useCraftEditorContext();

  const {
    connectors: { connect, drag },
    id,
    isSelected,
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
  }));

  const handleResize = (newW, newH) => {
    setProp((props) => {
      if (newW != null) props.width  = Math.round(newW);
      if (newH != null) props.height = Math.round(newH);
    });
  };

  // Build inline style — pixel dims take precedence over sizing class
  const slotStyle = {
    ...(style || {}),
  };

  if (width != null) {
    slotStyle.width = `${width}px`;
    slotStyle.minWidth = `${width}px`;
    slotStyle.maxWidth = `${width}px`;
  }

  if (height != null) {
    slotStyle.height = `${height}px`;
    slotStyle.minHeight = `${height}px`;
  } else if (sizing === "fixed" && fixedHeight) {
    // legacy compat
    slotStyle.height = `${fixedHeight}px`;
    slotStyle.minHeight = `${fixedHeight}px`;
  }

  if (sizing === "fixed" && fixedHeight && height == null) {
    slotStyle["--fixed-height"] = `${fixedHeight}px`;
  }

  const sizingClass = height != null ? "" : `sizing-${sizing || "fill"}`;

  return (
    <div
      ref={(ref) => !previewMode && connect(drag(ref))}
      className={`flex flex-col relative min-w-0 self-stretch min-h-0 box-border craft-node craft-node-widget ${sizingClass} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      }`}
      style={slotStyle}
      id={id}
      data-node-type="Widget"
    >
      {!previewMode && (condition || repeat) && (
        <div className="absolute left-2 top-2 z-50 pointer-events-none">
          <LogicBadges condition={condition} repeat={repeat} />
        </div>
      )}

      {/* Widget content — block pointer events in design mode so Craft.js owns selection/drag */}
      <div
        className={`flex flex-col flex-1 min-h-0 w-full box-border ${
          previewMode ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          borderRadius: style?.borderRadius,
          overflow: style?.borderRadius ? "hidden" : undefined,
        }}
      >
        {renderWidget?.(widgetKey, sizing)}
      </div>

      {/* 8-handle resize overlay — only in design mode when selected */}
      {!previewMode && isSelected && (
        <>
          <WidgetResizeHandles
            nodeId={id}
            width={width}
            height={height}
            onResize={handleResize}
          />
          <SelectParentButton />
        </>
      )}
    </div>
  );
}

CanvasWidgetSlot.craft = {
  displayName: "CanvasWidgetSlot",
  props: {
    widgetKey: "",
    width:     null,   // null = fill available width
    height:    null,   // null = auto height
    sizing:    "fill",
    fixedHeight: null, // legacy
    style:     {},
    condition: null,
    repeat:    null,
    locked:    false,
  },
  rules: {
    canDrag: (node) => !node.data.props.locked,
    canMoveIn: () => false,
  },
};
