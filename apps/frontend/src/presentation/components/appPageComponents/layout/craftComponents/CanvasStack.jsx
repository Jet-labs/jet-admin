/**
 * CanvasStack.jsx — Craft.js User Component
 *
 * Flexbox stack container (horizontal or vertical).
 * Cleaned of all headers and badges.
 */
import React from "react";
import { useNode } from "@craftjs/core";
import { useCraftEditorContext } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import LayoutResizeHandle from "../LayoutResizeHandle.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";

export function CanvasStack({
  children,
  span,
  sizing,
  direction,
  wrap,
  gap,
  align,
  style,
  condition,
  repeat,
  fixedHeight,
}) {
  const { previewMode } = useCraftEditorContext();
  const {
    connectors: { connect, drag },
    id,
    isSelected,
    isEmpty,
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
    isEmpty: node.data.nodes.length === 0,
  }));

  const handleResize = (nodeId, newSpan) => {
    setProp((props) => { props.span = Math.max(1, Math.min(12, newSpan)); });
  };

  const stackSpan = `col-span-${span || 12}`;
  const stackSizing = `sizing-${sizing || "auto"}`;
  const stackDirection = direction === "horizontal" ? "flex-row" : "flex-col";
  const stackWrap = wrap ? "flex-wrap" : "flex-nowrap";
  const stackAlign = align ? `items-${align}` : "items-stretch";

  const stackStyle = {
    ...(style || {}),
  };
  if (sizing === "fixed" && fixedHeight) {
    stackStyle["--fixed-height"] = `${fixedHeight}px`;
  }

  return (
    <div
      ref={(ref) => !previewMode && connect(drag(ref))}
      className={`flex ${stackDirection} ${stackWrap} ${stackAlign} gap-2 ${previewMode ? "" : "p-2"} self-stretch min-h-0 box-border craft-node craft-node-stack ${stackSpan} ${stackSizing} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      }`}
      style={stackStyle}
      id={id}
      data-node-type="Stack"
    >
      {!previewMode && (condition || repeat) && (
        <div className="absolute left-2 top-2 z-50 pointer-events-none">
          <LogicBadges condition={condition} repeat={repeat} />
        </div>
      )}
      {isEmpty && !previewMode ? (
        <div className="w-full flex items-center justify-center py-6 border border-dashed border-muted-foreground/45 text-muted-foreground text-[11px] transition-all bg-transparent rounded-md hover:border-primary/70 hover:bg-primary/5">
          <span className="text-muted-foreground/40 text-[10px] uppercase font-mono select-none">
            Empty Stack (Drop components here)
          </span>
        </div>
      ) : (
        children
      )}

      {/* Span resize handle */}
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

CanvasStack.craft = {
  displayName: "CanvasStack",
  props: {
    span: 12,
    sizing: "auto",
    direction: "vertical",
    wrap: false,
    gap: 8,
    align: "stretch",
    fixedHeight: null,
    style: {},
    condition: null,
    repeat: null,
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) =>
        ["CanvasWidgetSlot", "CanvasContainer", "CanvasStack"].includes(n.data.displayName)
      ),
  },
};
