/**
 * CanvasRow.jsx — Craft.js User Component
 *
 * Implements the 12-column grid row.
 * Cleaned of all legacy visual clutter (headers/badges).
 */
import React from "react";
import { useNode } from "@craftjs/core";
import { useCraftEditorContext } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";

export function CanvasRow({ children, sizing, fixedHeight, style, condition, repeat }) {
  const { previewMode } = useCraftEditorContext();
  const {
    connectors: { connect, drag },
    id,
    isSelected,
    isEmpty,
  } = useNode((node) => ({
    isSelected: node.events.selected,
    isEmpty: node.data.nodes.length === 0,
  }));

  const rowSizingClass = `sizing-${sizing || "auto"}`;
  const rowStyle = { ...(style || {}) };
  if (sizing === "fixed" && fixedHeight) {
    rowStyle["--fixed-height"] = `${fixedHeight}px`;
    rowStyle.height = `${fixedHeight}px`;
  } else if (sizing === "fill") {
    rowStyle.height = "100%";
  }

  return (
    <div
      ref={(ref) => !previewMode && connect(drag(ref))}
      className={`grid grid-cols-12 w-full gap-2 items-stretch box-border craft-node craft-node-row ${rowSizingClass} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      }`}
      style={rowStyle}
      id={id}
      data-node-type="Row"
    >
      {!previewMode && (condition || repeat) && (
        <div className="absolute left-2 top-2 z-50 pointer-events-none">
          <LogicBadges condition={condition} repeat={repeat} />
        </div>
      )}
      {/* Children or empty drop zone */}
      {isEmpty && !previewMode ? (
        <div className="col-span-12 flex justify-center items-center h-12 border border-dashed border-muted-foreground/45 text-muted-foreground text-[11px] transition-all bg-transparent rounded-md hover:border-primary/70 hover:bg-primary/5">
          <span className="text-muted-foreground/40 text-[10px] uppercase font-mono select-none">
            Empty Row (Drop components here)
          </span>
        </div>
      ) : (
        children
      )}

      {!previewMode && isSelected && <SelectParentButton />}
    </div>
  );
}

CanvasRow.craft = {
  displayName: "CanvasRow",
  props: {
    sizing: "auto",
    fixedHeight: null,
    style: {},
    condition: null,
    repeat: null,
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) =>
        ["CanvasWidgetSlot", "CanvasContainer", "CanvasStack", "CanvasZStack"].includes(
          n.data.displayName
        )
      ),
  },
};
