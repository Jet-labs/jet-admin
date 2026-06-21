/**
 * CanvasZStack.jsx — Craft.js User Component
 *
 * Z-Stack node: children overlap using CSS grid layout.
 * Cleaned of static grips, locks, and inner headers.
 */
import React from "react";
import { useNode } from "@craftjs/core";
import { useCraftEditorContext } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import LayoutResizeHandle from "../LayoutResizeHandle.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";

export function CanvasZStack({
  children,
  span,
  sizing,
  style,
  condition,
  repeat,
  fixedHeight,
  activeLayerIndex: activeLayerIndexProp,
}) {
  const { previewMode } = useCraftEditorContext();
  const {
    connectors: { connect, drag },
    id,
    isSelected,
    childNodeIds,
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
    childNodeIds: node.data.nodes || [],
  }));

  const handleResize = (nodeId, newSpan) => {
    setProp((props) => { props.span = Math.max(1, Math.min(12, newSpan)); });
  };

  const activeLayerIndex = Math.min(
    activeLayerIndexProp || 0,
    Math.max(0, childNodeIds.length - 1)
  );
  const hasLayers = childNodeIds.length > 0;

  const zStackSpan = `col-span-${span || 12}`;
  const zStackSizing = `sizing-${sizing || "fill"}`;
  const zStackStyle = {
    ...(style || {}),
  };
  if (sizing === "fixed" && fixedHeight) {
    zStackStyle["--fixed-height"] = `${fixedHeight}px`;
  }

  return (
    <div
      ref={(ref) => !previewMode && connect(drag(ref))}
      className={`relative box-border grid grid-cols-1 grid-rows-1 craft-node craft-node-zstack ${zStackSpan} ${zStackSizing} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      }`}
      style={zStackStyle}
      id={id}
      data-node-type="Z-Stack"
    >
      {!previewMode && (condition || repeat) && (
        <div className="absolute right-2 top-2 z-50 pointer-events-none">
          <LogicBadges condition={condition} repeat={repeat} />
        </div>
      )}
      {/* Visual layer picker shown inside canvas ONLY when selected and not in previewMode */}
      {!previewMode && isSelected && hasLayers && (
        <div className="absolute top-2 left-2 z-50 flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border p-2 rounded-md shadow-sm">
          <span className="text-[9px] font-mono text-muted-foreground px-1 uppercase">Layers:</span>
          {childNodeIds.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setProp((props) => { props.activeLayerIndex = idx; });
              }}
              className={`px-2 py-0.5 text-[10px] rounded transition-all select-none ${
                activeLayerIndex === idx
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              L{idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Stacked layer grid */}
      {hasLayers && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100%",
            gridTemplateRows: "100%",
            width: "100%",
            overflow: "visible",
            minHeight: 80,
          }}
        >
          {React.Children.map(children, (child, idx) => {
            const isLayerActive = idx === activeLayerIndex;
            return (
              <div
                key={idx}
                style={{
                  gridArea: "1 / 1 / 2 / 2",
                  width: "100%",
                  zIndex: isLayerActive ? 10 : 1,
                  opacity: isLayerActive ? 1 : 0.15,
                  pointerEvents: isLayerActive ? "auto" : "none",
                  transition: "opacity 0.2s ease",
                  position: "relative",
                  boxSizing: "border-box",
                }}
              >
                {!previewMode && (
                  <span className="layout-z-stack-layer-badge">Layer {idx + 1}</span>
                )}
                {child}
              </div>
            );
          })}
        </div>
      )}

      {/* Drop zone / Add Layer button */}
      {!previewMode && (
        <div className="flex justify-center items-center h-12 border border-dashed border-muted-foreground/45 text-muted-foreground text-[11px] transition-all bg-transparent rounded-md hover:border-primary/70 hover:bg-primary/5 flex-shrink-0" style={{ marginTop: hasLayers ? 8 : 0 }}>
          <span className="text-muted-foreground/40 text-[10px] uppercase font-mono select-none">
            {hasLayers ? "+ Drag/Drop inside to Stack another Layer" : "Drop widgets here to stack as layers"}
          </span>
        </div>
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

CanvasZStack.craft = {
  displayName: "CanvasZStack",
  props: {
    span: 12,
    sizing: "fill",
    fixedHeight: null,
    style: {},
    condition: null,
    repeat: null,
    activeLayerIndex: 0,
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) =>
        ["CanvasWidgetSlot", "CanvasContainer", "CanvasStack"].includes(n.data.displayName)
      ),
  },
};
