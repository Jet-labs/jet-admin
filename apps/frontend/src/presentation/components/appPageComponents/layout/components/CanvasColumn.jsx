/**
 * CanvasColumn.jsx — Craft.js User Component
 *
 * Root droppable column. Acts as the top-level canvas container.
 * Children are always CanvasRow nodes.
 */
import React from "react";
import { useNode } from "@craftjs/core";
import { useCraftEditorContext, useConditionHidden } from "./CraftEditorContext.js";

export function CanvasColumn({ children, style, condition, repeat, hideMode, keepMounted }) {
  const { previewMode, editorLiveStateTree } = useCraftEditorContext();
  const hiddenByCondition = useConditionHidden(condition, editorLiveStateTree);
  const {
    connectors: { connect },
  } = useNode();
  if (previewMode && hiddenByCondition) {
    if (hideMode !== "preserve-space" && !keepMounted) {
      return null;
    }
  }

  const previewHiddenStyle = previewMode && hiddenByCondition
    ? hideMode === "preserve-space"
      ? { visibility: "hidden", pointerEvents: "none" }
      : { display: "none", pointerEvents: "none" }
    : {};

  return (
    <div
      ref={connect}
      className="flex flex-col w-full gap-2 box-border"
      style={previewHiddenStyle}
      aria-hidden={previewMode && hiddenByCondition ? true : undefined}
    >
      {children}
    </div>
  );
}

CanvasColumn.craft = {
  displayName: "CanvasColumn",
  props: {
    style: {},
    condition: null,
    repeat: null,
    hideMode: null,
    keepMounted: false,
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) =>
        ["CanvasRow", "CanvasWidgetSlot", "CanvasContainer", "CanvasStack", "CanvasZStack"].includes(
          n.data.displayName
        )
      ),
    canDrag: () => false,
  },
};
