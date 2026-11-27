/* eslint-disable react/prop-types */
/**
 * CanvasContainer.jsx — Craft.js User Component
 *
 * Wraps child rows in a styled card/grouping container.
 */
import React from "react";
import { useNode } from "@craftjs/core";
import { useCraftEditorContext, useConditionHidden } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import LayoutResizeHandle from "../editor/LayoutResizeHandle.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";
import { useLayoutBreakpoint } from "../engine/LayoutViewportContext.jsx";
import {
  isResponsiveHidden,
  resolveResponsiveSpan,
} from "../engine/responsive.js";

export function CanvasContainer({
  children,
  span,
  sizing,
  style,
  condition,
  repeat,
  fixedHeight,
  hideMode,
  keepMounted,
  responsive,
}) {
  const { previewMode, editorLiveStateTree } = useCraftEditorContext();
  const breakpointTier = useLayoutBreakpoint();
  const responsiveHidden = isResponsiveHidden(responsive, breakpointTier);
  const effectiveSpan = resolveResponsiveSpan(span, responsive, breakpointTier);
  const hiddenByCondition = useConditionHidden(condition, editorLiveStateTree);
  const {
    connectors: { connect, drag },
    id,
    isSelected,
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
  }));
  // Preview mimics viewer: collapse unmounts, preserve-space/keepMounted hide via CSS.
  if (
    previewMode &&
    ((hiddenByCondition && hideMode !== "preserve-space" && !keepMounted) || responsiveHidden)
  ) {
    return null;
  }

  const handleResize = (nodeId, newSpan) => {
    const nextSpan = Math.max(1, Math.min(12, newSpan));
    setProp((props) => {
      if (breakpointTier === "desktop") {
        props.span = nextSpan;
        return;
      }
      if (!props.responsive) props.responsive = {};
      props.responsive[breakpointTier] = {
        ...(props.responsive[breakpointTier] || {}),
        span: nextSpan,
      };
    });
  };

  const containerSpan = `col-span-${effectiveSpan}`;
  const containerSizing = `sizing-${sizing || "auto"}`;
  const previewHiddenStyle = previewMode && hiddenByCondition
    ? hideMode === "preserve-space"
      ? { visibility: "hidden", pointerEvents: "none" }
      : { display: "none", pointerEvents: "none" }
    : {};
  const containerStyle = {
    padding: style?.padding,
    margin: style?.margin,
    borderRadius: style?.borderRadius,
    overflow: style?.borderRadius ? "hidden" : undefined,
    ...(style || {}),
    ...previewHiddenStyle,
    gridColumn: `span ${effectiveSpan} / span ${effectiveSpan}`,
    ...(responsiveHidden && !previewMode ? { opacity: 0.45 } : {}),
  };
  if (sizing === "fixed" && fixedHeight) {
    containerStyle["--fixed-height"] = `${fixedHeight}px`;
  }

  return (
    <div
      ref={(ref) => !previewMode && connect(drag(ref))}
      className={`flex flex-col bg-background border border-border rounded self-stretch min-h-0 box-border transition-all craft-node craft-node-container ${containerSpan} ${containerSizing} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      } ${hiddenByCondition && !previewMode ? "opacity-40 saturate-50" : ""}`}
      style={containerStyle}
      id={id}
      data-node-type="Container"
      data-breakpoint={breakpointTier}
      title={
        hiddenByCondition && !previewMode
          ? "Hidden by condition in viewer"
          : responsiveHidden && !previewMode
            ? `Hidden on ${breakpointTier}`
            : undefined
      }
    >
      {!previewMode && (condition || repeat || responsiveHidden) && (
        <div className="absolute left-2 top-2 z-50 pointer-events-none flex gap-1">
          <LogicBadges condition={condition} repeat={repeat} />
          {responsiveHidden && (
            <span className="rounded border border-sky-500/30 bg-sky-500/10 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-sky-300">
              hidden · {breakpointTier}
            </span>
          )}
        </div>
      )}
      {children}

      {!previewMode && isSelected && (
        <>
          <LayoutResizeHandle
            node={{ id, span: effectiveSpan }}
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
    hideMode: null,
    keepMounted: false,
    responsive: null,
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) => n.data.displayName === "CanvasRow"),
  },
};
