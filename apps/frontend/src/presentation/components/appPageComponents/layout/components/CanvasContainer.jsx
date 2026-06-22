/**
 * CanvasContainer.jsx — Craft.js User Component
 *
 * Wraps child rows in a styled card/grouping container.
 */
import React from "react";
import { useNode } from "@craftjs/core";
import { useCraftEditorContext } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import LayoutResizeHandle from "../editor/LayoutResizeHandle.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";

export function CanvasContainer({ children, span, sizing, style, condition, repeat, fixedHeight }) {
  const { previewMode } = useCraftEditorContext();
  const {
    connectors: { connect, drag },
    id,
    isSelected,
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
  }));

  const handleResize = (nodeId, newSpan) => {
    setProp((props) => { props.span = Math.max(1, Math.min(12, newSpan)); });
  };

  const containerSpan = `col-span-${span || 12}`;
  const containerSizing = `sizing-${sizing || "auto"}`;
  const containerStyle = {
    padding: style?.padding,
    margin: style?.margin,
    borderRadius: style?.borderRadius,
    overflow: style?.borderRadius ? "hidden" : undefined,
    ...(style || {}),
  };
  if (sizing === "fixed" && fixedHeight) {
    containerStyle["--fixed-height"] = `${fixedHeight}px`;
  }

  return (
    <div
      ref={(ref) => !previewMode && connect(drag(ref))}
      className={`flex flex-col bg-background border border-border rounded-md ${previewMode ? "" : "p-2"} self-stretch min-h-0 box-border transition-all craft-node craft-node-container ${containerSpan} ${containerSizing} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      }`}
      style={containerStyle}
      id={id}
      data-node-type="Container"
    >
      {!previewMode && (condition || repeat) && (
        <div className="absolute left-2 top-2 z-50 pointer-events-none">
          <LogicBadges condition={condition} repeat={repeat} />
        </div>
      )}
      {children}

      {!previewMode && isSelected && (
        <>
          <LayoutResizeHandle
            node={{ id, span: span || 12 }}
            onResize={handleResize}
          />
          <SelectParentButton />
        </>
      )}
    </div>
  );
}

CanvasContainer.craft = {
  displayName: "CanvasContainer",
  props: {
    span: 12,
    sizing: "auto",
    fixedHeight: null,
    style: {},
    condition: null,
    repeat: null,
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) => n.data.displayName === "CanvasRow"),
  },
};
