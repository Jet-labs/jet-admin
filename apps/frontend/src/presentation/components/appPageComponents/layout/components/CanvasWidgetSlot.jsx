/**
 * CanvasWidgetSlot.jsx — Craft.js User Component
 *
 * Leaf node that wraps a single Jet-Admin widget inside the Craft editor.
 *
 * Fixes:
 *  - Uses inline gridColumn style instead of col-span-* CSS class to
 *    guarantee 12-column grid placement (Tailwind purges dynamic classes).
 *  - Uses LayoutResizeHandle (span-based) for width when in a grid row,
 *    so width snaps to column boundaries instead of freehand pixels.
 *  - Uses WidgetResizeHandles (pixel-based) only for height, and for
 *    width when pixel width is explicitly set (free placement mode).
 */
import React from "react";
import { Lock } from "lucide-react";
import { useNode, useEditor } from "@craftjs/core";
import { useCraftEditorContext } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import WidgetResizeHandles from "../editor/WidgetResizeHandles.jsx";
import LayoutResizeHandle from "../editor/LayoutResizeHandle.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";

const resolveWidthStyle = (width, isInRow) => {
  if (width == null || width === "" || isInRow) return {};
  if (width === "grow") {
    return {
      flex: "1 1 0%",
    };
  }
  if (typeof width === "string" && width.endsWith("%")) {
    return {
      width: width,
    };
  }
  const pxVal = typeof width === "number" ? width : parseInt(width);
  if (!isNaN(pxVal)) {
    return {
      width: `${pxVal}px`,
      minWidth: `${pxVal}px`,
      maxWidth: `${pxVal}px`,
    };
  }
  return {};
};

const resolveHeightStyle = (height, sizing, fixedHeight) => {
  const style = {};
  if (height != null && height !== "") {
    if (height === "grow") {
      style.flex = "1 1 0%";
    } else if (typeof height === "string" && height.endsWith("%")) {
      style.height = height;
    } else {
      const pxVal = typeof height === "number" ? height : parseInt(height);
      if (!isNaN(pxVal)) {
        style.height = `${pxVal}px`;
        style.minHeight = `${pxVal}px`;
      }
    }
  } else if (sizing === "fixed" && fixedHeight) {
    style["--fixed-height"] = `${fixedHeight}px`;
    style.height = `${fixedHeight}px`;
    style.minHeight = `${fixedHeight}px`;
  }
  return style;
};

export function CanvasWidgetSlot({
  widgetKey,
  span,
  width,
  height,
  sizing,
  fixedHeight,
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

  // Check if this widget is a direct child of a CanvasRow (grid context)
  const { parentId, parentDisplayName } = useEditor((state) => {
    const node = state.nodes[id];
    const pId = node?.data?.parent;
    const pNode = pId ? state.nodes[pId] : null;
    return {
      parentId: pId,
      parentDisplayName: pNode?.data?.displayName ?? null,
    };
  });

  const isInRow = parentDisplayName === "CanvasRow";
  const isFixedPx = width != null && width !== "grow" && !(typeof width === "string" && width.endsWith("%"));
  const hasPixelWidth = isFixedPx && !isInRow;

  const handlePixelResize = (newW, newH) => {
    setProp((props) => {
      if (newW != null) props.width = Math.round(newW);
      if (newH != null) props.height = Math.round(newH);
    });
  };

  const handleSpanResize = (nodeId, newSpan) => {
    setProp((props) => {
      props.span = Math.max(1, Math.min(12, newSpan));
    });
  };

  const slotStyle = {
    ...(style || {}),
    ...resolveWidthStyle(width, isInRow),
    ...resolveHeightStyle(height, sizing, fixedHeight),
  };

  // Grid placement: use inline style for guaranteed 12-column grid participation.
  // Only apply when no pixel width is set (pixel width = free placement mode).
  if (!hasPixelWidth && isInRow) {
    const effectiveSpan = span || 6;
    slotStyle.gridColumn = `span ${effectiveSpan} / span ${effectiveSpan}`;
  }

  const sizingClass = height != null && height !== "" ? "" : `sizing-${sizing || "fill"}`;

  return (
    <div
      ref={(ref) => !previewMode && connect(locked ? ref : drag(ref))}
      className={`flex flex-col relative min-w-0 self-stretch min-h-0 box-border craft-node craft-node-widget ${sizingClass} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      } ${!previewMode ? "layout-widget-slot-edit" : ""} ${locked ? "layout-widget-locked" : ""}`}
      style={slotStyle}
      id={id}
      data-node-type="Widget"
    >
      {!previewMode && (condition || repeat || locked) && (
        <div className="absolute left-2 top-2 z-50 pointer-events-none flex gap-1 items-center">
          {locked && (
            <div className="flex items-center gap-1.5 rounded bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 shadow-sm leading-none uppercase tracking-wider">
              <Lock className="h-2.5 w-2.5" />
              <span>Locked</span>
            </div>
          )}
          <LogicBadges condition={condition} repeat={repeat} />
        </div>
      )}

      <div
        className={`flex flex-col flex-1 min-h-0 w-full box-border overflow-hidden ${
          (previewMode || locked) ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          borderRadius: style?.borderRadius,
          overflow: style?.borderRadius ? "hidden" : undefined,
        }}
      >
        {renderWidget?.(widgetKey, sizing)}
      </div>

      {!previewMode && isSelected && (
        <>
          {/* Span-based width resize when in a grid row (snaps to 12-col grid) */}
          {isInRow && !hasPixelWidth && !locked && (
            <LayoutResizeHandle
              node={{ id, span: span || 6 }}
              onResize={handleSpanResize}
            />
          )}

          {/* Pixel-based resize handles — height only when in a row,
              full 8-handle when in free placement (pixel width) mode */}
          {!locked && (
            <WidgetResizeHandles
              nodeId={id}
              width={width}
              height={height}
              onResize={handlePixelResize}
              heightOnly={isInRow && !hasPixelWidth}
            />
          )}

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
    span: 6,
    width: null,
    height: null,
    sizing: "fill",
    fixedHeight: null,
    style: {},
    condition: null,
    repeat: null,
    locked: false,
  },
  rules: {
    canDrag: (node) => !node.data.props.locked,
    canMoveIn: () => false,
  },
};
