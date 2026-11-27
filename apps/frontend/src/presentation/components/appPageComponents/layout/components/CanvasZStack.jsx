/* eslint-disable react/prop-types */
/**
 * CanvasZStack.jsx — Craft.js User Component
 *
 * Z-Stack node: children overlap using CSS grid layout.
 * Each direct child must be a CanvasStack (one per "layer").
 *
 * Edit mode:  Layers are shown vertically for easy editing.
 *             Only the active layer is interactive; others are faded.
 * Preview mode: Layers are stacked (overlaid) using CSS grid.
 *             Each layer has its own opacity (from layerOpacities prop).
 */
import React from "react";
import { useNode, useEditor, Element } from "@craftjs/core";
import { useCraftEditorContext, useConditionHidden } from "./CraftEditorContext.js";
import { LogicBadges } from "./LogicBadges.jsx";
import LayoutResizeHandle from "../editor/LayoutResizeHandle.jsx";
import { SelectParentButton } from "./SelectParentButton.jsx";
import { Plus } from "lucide-react";
import { useLayoutBreakpoint } from "../engine/LayoutViewportContext.jsx";
import {
  isResponsiveHidden,
  resolveResponsiveSpan,
} from "../engine/responsive.js";

export function CanvasZStack({
  children,
  span,
  sizing,
  style,
  condition,
  repeat,
  hideMode,
  keepMounted,
  fixedHeight,
  activeLayerIndex: activeLayerIndexProp,
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
    childNodeIds,
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
    childNodeIds: node.data.nodes || [],
  }));

  const { actions: editorActions, query } = useEditor();
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

  const activeLayerIndex = Math.min(
    activeLayerIndexProp || 0,
    Math.max(0, childNodeIds.length - 1)
  );
  const hasLayers = childNodeIds.length > 0;

  const handleAddLayer = (e) => {
    e?.stopPropagation?.();
    try {
      const resolver = query.getOptions().resolver;
      const _CanvasStack = resolver["CanvasStack"];
      const layerTree = query
        .parseReactElement(
          <Element is={_CanvasStack} canvas span={12} sizing="fill" direction="vertical" gap={0} />
        )
        .toNodeTree();
      
      const currentLayerCount = childNodeIds.length;
      editorActions.addNodeTree(layerTree, id);
      
      setProp((props) => {
        props.activeLayerIndex = currentLayerCount;
        // Initialize opacity for the new layer
        if (!Array.isArray(props.layerOpacities)) props.layerOpacities = [];
        props.layerOpacities[currentLayerCount] = 1;
      });
    } catch (err) {
      console.error("[CanvasZStack] Failed to add layer:", err);
    }
  };

  const zStackSpan = `col-span-${effectiveSpan}`;
  const zStackSizing = `sizing-${sizing || "fill"}`;
  const zStackStyle = {
    ...(style || {}),
    ...(previewMode && hiddenByCondition
      ? hideMode === "preserve-space"
        ? { visibility: "hidden", pointerEvents: "none" }
        : { display: "none", pointerEvents: "none" }
      : {}),
    gridColumn: `span ${effectiveSpan} / span ${effectiveSpan}`,
    ...(responsiveHidden && !previewMode ? { opacity: 0.45 } : {}),
  };
  if (sizing === "fixed" && fixedHeight) {
    zStackStyle["--fixed-height"] = `${fixedHeight}px`;
  }

  return (
    <div
      ref={(ref) => !previewMode && connect(drag(ref))}
      className={`relative box-border craft-node craft-node-zstack ${zStackSpan} ${zStackSizing} ${
        isSelected && !previewMode ? "craft-node-selected" : ""
      } ${hiddenByCondition && !previewMode ? "opacity-40 saturate-50" : ""}`}
      style={zStackStyle}
      id={id}
      data-node-type="Z-Stack"
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
        <div className="absolute right-2 top-2 z-50 pointer-events-none flex gap-1">
          <LogicBadges condition={condition} repeat={repeat} />
          {responsiveHidden && (
            <span className="rounded border border-sky-500/30 bg-sky-500/10 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-sky-300">
              hidden · {breakpointTier}
            </span>
          )}
        </div>
      )}

      {/* Layer Switcher — shown when selected and has layers */}
      {!previewMode && isSelected && hasLayers && (
        <div className="absolute top-2 left-2 z-50 flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border rounded shadow-md px-1.5 py-1">
          <span className="text-[8px] font-mono text-muted-foreground px-1 uppercase tracking-widest">Layers</span>
          <div className="w-px h-4 bg-border/60" />
          {childNodeIds.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setProp((props) => { props.activeLayerIndex = idx; });
              }}
              className={`w-6 h-6 flex items-center justify-center text-xs rounded transition-all select-none font-mono ${
                activeLayerIndex === idx
                  ? "bg-primary text-primary-foreground font-bold shadow-sm ring-1 ring-primary/30"
                  : "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title={`Switch to Layer ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
          <div className="w-px h-4 bg-border/60" />
          <button
            type="button"
            onClick={handleAddLayer}
            className="w-6 h-6 flex items-center justify-center text-xs rounded bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
            title="Add new layer"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* ── PREVIEW MODE: Stack layers using CSS grid overlay ────────────── */}
      {previewMode && hasLayers && (
        <div
          className="zstack-overlay-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            width: "100%",
            minHeight: 40,
          }}
        >
          {children}
        </div>
      )}

      {/* ── EDIT MODE: Show layers vertically for easy editing ───────────── */}
      {!previewMode && hasLayers && (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 4, paddingTop: isSelected ? 36 : 0 }}>
          {children}
        </div>
      )}

      {/* Empty state / Add layer prompt */}
      {!previewMode && !hasLayers && (
        <button
          type="button"
          onClick={handleAddLayer}
          className="flex justify-center items-center h-16 border border-dashed border-muted-foreground/45 text-muted-foreground text-[11px] transition-all bg-transparent rounded hover:border-primary/70 hover:bg-primary/5 cursor-pointer w-full"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5 opacity-50" />
          <span className="text-muted-foreground/60 text-xs uppercase font-mono select-none">
            Add First Layer
          </span>
        </button>
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

CanvasZStack.craft = {
  displayName: "CanvasZStack",
  props: {
    span: 12,
    sizing: "fill",
    fixedHeight: null,
    style: {},
    condition: null,
    repeat: null,
    hideMode: null,
    keepMounted: false,
    activeLayerIndex: 0,
    layerOpacities: [],
    responsive: null,
  },
  isCanvas: true,
  rules: {
    canMoveIn: (nodes) =>
      nodes.every((n) => n.data.displayName === "CanvasStack"),
  },
};
