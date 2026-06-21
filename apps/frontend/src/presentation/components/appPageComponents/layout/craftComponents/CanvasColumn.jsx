/**
 * CanvasColumn.jsx — Craft.js User Component
 *
 * Root droppable column. Acts as the top-level canvas container.
 * Children are always CanvasRow nodes.
 */
import React from "react";
import { useNode, useEditor } from "@craftjs/core";

export function CanvasColumn({ children, style, condition, repeat }) {
  const {
    connectors: { connect },
  } = useNode();

  return (
    <div
      ref={connect}
      className="flex flex-col w-full gap-2 box-border"
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
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) =>
        ["CanvasRow", "CanvasWidgetSlot", "CanvasContainer", "CanvasStack", "CanvasZStack"].includes(
          n.data.displayName
        )
      ),
    canDrag: () => false, // root cannot be dragged
  },
};
