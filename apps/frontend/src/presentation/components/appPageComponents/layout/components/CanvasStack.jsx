/**
 * CanvasStack.jsx — Craft.js User Component
 *
 * Flexbox stack container (horizontal or vertical).
 */
import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useCraftEditorContext } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import LayoutResizeHandle from "../editor/LayoutResizeHandle.jsx";
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

  const handleResize = (nodeId, newSpan) => {
    setProp((props) => { props.span = Math.max(1, Math.min(12, newSpan)); });
  };

  const stackSpan = `col-span-${span || 12}`;
  const stackSizing = `sizing-${sizing || "auto"}`;
  const stackDirection = direction === "horizontal" ? "flex-row" : "flex-col";
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

  const stackStyle = {
    ...(style || {}),
    gap: typeof gap === "number" ? `${gap}px` : gap,
  };
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
      className={`flex ${stackDirection} ${stackWrap} ${stackAlign} ${previewMode ? "" : "p-2"} self-stretch min-h-0 box-border craft-node craft-node-stack ${stackSpan} ${stackSizing} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      }`}
      style={stackStyle}
      id={id}
      data-node-type="Stack"
    >
      {!previewMode && isZStackLayer && (
        <span className="layout-z-stack-layer-badge">
          L{layerIdx + 1}{layerOpacities[layerIdx] != null && layerOpacities[layerIdx] < 1 ? ` ${Math.round(layerOpacities[layerIdx] * 100)}%` : ""}
        </span>
      )}
      {!previewMode && (condition || repeat) && (
        <div className="absolute left-2 top-2 z-50 pointer-events-none">
          <LogicBadges condition={condition} repeat={repeat} />
        </div>
      )}
      {isEmpty && !previewMode ? (
        <div className="w-full flex items-center justify-center p-2 border border-dashed border-muted-foreground/45 text-muted-foreground text-[11px] transition-all bg-transparent rounded hover:border-primary/70 hover:bg-primary/5">
          <span className="text-muted-foreground/40 text-[10px] uppercase font-mono select-none">
            Empty Stack (Drop components here)
          </span>
        </div>
      ) : (
        children
      )}

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
        ["CanvasWidgetSlot", "CanvasContainer", "CanvasStack", "CanvasZStack"].includes(n.data.displayName)
      ),
  },
};
