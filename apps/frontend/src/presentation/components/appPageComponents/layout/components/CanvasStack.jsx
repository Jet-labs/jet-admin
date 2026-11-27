/* eslint-disable react/prop-types */
/**
 * CanvasStack.jsx — Craft.js User Component
 *
 * Flexbox stack container (horizontal or vertical).
 */
import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useCraftEditorContext, useConditionHidden } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import LayoutResizeHandle from "../editor/LayoutResizeHandle.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";
import { useLayoutBreakpoint } from "../engine/LayoutViewportContext.jsx";
import {
  isResponsiveHidden,
  resolveResponsiveDirection,
  resolveResponsiveSpan,
} from "../engine/responsive.js";

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
  hideMode,
  keepMounted,
  fixedHeight,
  responsive,
}) {
  const { previewMode, editorLiveStateTree } = useCraftEditorContext();
  const breakpointTier = useLayoutBreakpoint();
  const responsiveHidden = isResponsiveHidden(responsive, breakpointTier);
  const effectiveSpan = resolveResponsiveSpan(span, responsive, breakpointTier);
  const effectiveDirection = resolveResponsiveDirection(direction, responsive, breakpointTier);
  const hiddenByCondition = useConditionHidden(condition, editorLiveStateTree);
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

  const { parentDisplayName, activeLayerIndex, childNodeIdsOfParent, layerOpacities } = useEditor((state) => {
    const node = state.nodes[id];
    const pId = node?.data?.parent;
    const pNode = pId ? state.nodes[pId] : null;
    return {
      parentDisplayName: pNode?.data?.displayName ?? null,
      activeLayerIndex: pNode?.data?.props?.activeLayerIndex ?? 0,
      childNodeIdsOfParent: pNode?.data?.nodes || [],
      layerOpacities: pNode?.data?.props?.layerOpacities || [],
    };
  });

  const isZStackLayer = parentDisplayName === "CanvasZStack";
  const layerIdx = isZStackLayer ? childNodeIdsOfParent.indexOf(id) : -1;
  const isLayerActive = !isZStackLayer || layerIdx === activeLayerIndex;
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

  const stackSpan = `col-span-${effectiveSpan}`;
  const stackSizing = `sizing-${sizing || "auto"}`;
  const stackDirection = effectiveDirection === "horizontal" ? "flex-row" : "flex-col";
  const stackWrap = wrap ? "flex-wrap" : "flex-nowrap";
  
  let stackAlign = "items-stretch";
  if (align === "flex-start") {
    stackAlign = "items-start";
  } else if (align === "flex-end") {
    stackAlign = "items-end";
  } else if (align === "center") {
    stackAlign = "items-center";
  } else if (align === "stretch") {
    stackAlign = "items-stretch";
  }

  const resolvedGap = typeof gap === "number" ? `${gap}px` : gap;
  const stackStyle = {
    ...(style || {}),
    ...(resolvedGap != null && resolvedGap !== "" ? { gap: resolvedGap } : {}),
    ...(previewMode && hiddenByCondition
      ? hideMode === "preserve-space"
        ? { visibility: "hidden", pointerEvents: "none" }
        : { display: "none", pointerEvents: "none" }
      : {}),
    ...(responsiveHidden && !previewMode ? { opacity: 0.45 } : {}),
  };
  if (!isZStackLayer || !previewMode) {
    stackStyle.gridColumn = `span ${effectiveSpan} / span ${effectiveSpan}`;
  }
  if (sizing === "fixed" && fixedHeight) {
    stackStyle["--fixed-height"] = `${fixedHeight}px`;
  }

  if (isZStackLayer) {
    if (previewMode) {
      stackStyle.gridColumn = "1 / -1";
      stackStyle.gridRow = "1 / -1";
      stackStyle.zIndex = layerIdx + 1;
      stackStyle.opacity = layerOpacities[layerIdx] ?? 1;
      stackStyle.position = "relative";
      stackStyle.width = "100%";
    } else {
      stackStyle.opacity = isLayerActive ? 1 : 0.15;
      stackStyle.pointerEvents = isLayerActive ? "auto" : "none";
      stackStyle.transition = "opacity 0.2s ease";
      stackStyle.position = "relative";
      stackStyle.borderLeft = isLayerActive
        ? "3px solid hsl(var(--primary))"
        : "3px solid transparent";
      stackStyle.paddingLeft = "4px";
    }
  }

  return (
    <div
      ref={(ref) => !previewMode && connect(drag(ref))}
      className={`flex ${stackDirection} ${stackWrap} ${stackAlign} self-stretch min-h-0 box-border craft-node craft-node-stack ${stackSpan} ${stackSizing} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      } ${hiddenByCondition && !previewMode ? "opacity-40 saturate-50" : ""}`}
      style={stackStyle}
      id={id}
      data-node-type="Stack"
      data-breakpoint={breakpointTier}
      title={
        hiddenByCondition && !previewMode
          ? "Hidden by condition in viewer"
          : responsiveHidden && !previewMode
            ? `Hidden on ${breakpointTier}`
            : undefined
      }
    >
      {!previewMode && isZStackLayer && (
        <span className="layout-z-stack-layer-badge">
          L{layerIdx + 1}{layerOpacities[layerIdx] != null && layerOpacities[layerIdx] < 1 ? ` ${Math.round(layerOpacities[layerIdx] * 100)}%` : ""}
        </span>
      )}
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
      {isEmpty && !previewMode ? (
        <div className="flex w-full items-center justify-center rounded border border-dashed border-muted-foreground/45 bg-transparent p-2 text-xs text-muted-foreground transition-all hover:border-primary/70 hover:bg-primary/5">
          <span className="select-none text-xs text-muted-foreground/70">
            Empty stack — drag a widget here
          </span>
        </div>
      ) : (
        children
      )}

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
    hideMode: null,
    keepMounted: false,
    responsive: null,
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) =>
        ["CanvasWidgetSlot", "CanvasContainer", "CanvasStack", "CanvasZStack"].includes(n.data.displayName)
      ),
  },
};
