import React from "react";
import "./layout.css";
import { evaluateVisibilityCondition } from "../../../../../logic/evaluationEngine";

export function LayoutRow({ node, children, mode }) {
  const rowStyle = {
    gap: node.style?.gap ?? (typeof node.gap === "number" ? `${node.gap}px` : undefined),
    padding: node.style?.padding,
    margin: node.style?.margin,
    alignItems: node.style?.alignItems,
    borderRadius: node.style?.borderRadius,
    ...(node.style || {}),
  };
  if (node.sizing === "fixed" && node.fixedHeight) {
    rowStyle.height = `${node.fixedHeight}px`;
  } else if (node.sizing === "fill") {
    rowStyle.height = "100%";
  }

  const sizingClass = `sizing-${node.sizing || "auto"}`;
  const hiddenAttrs = node.__ariaHidden
    ? { "aria-hidden": true, "data-hidden-by-condition": true }
    : {};

  return (
    <div
      className={`layout-row grid grid-cols-12 w-full gap-2 items-stretch box-border ${sizingClass}`}
      id={node.id}
      style={rowStyle}
      {...hiddenAttrs}
    >
      {children}
    </div>
  );
}

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

export function LayoutWidgetSlot({
  node,
  renderWidget,
  mode,
  activeNodeId,
  onNodeClick,
  stateTree = null,
  isInRow = false,
  repeatPath = [],
}) {
  const spanClass = `col-span-${node.span || 6}`;
  const sizingClass = node.height != null && node.height !== "" ? "" : `sizing-${node.sizing || "fill"}`;
  const handleClick = (e) => {
    if (mode === "edit" && onNodeClick) {
      e.stopPropagation();
      onNodeClick(node);
    }
  };

  const slotStyle = {
    padding: node.style?.padding,
    margin: node.style?.margin,
    borderRadius: node.style?.borderRadius,
    ...(node.style || {}),
    ...resolveWidthStyle(node.width, isInRow),
    ...resolveHeightStyle(node.height, node.sizing, node.fixedHeight),
  };

  if (node.minHeight && (node.height == null || node.height === "")) slotStyle.minHeight = `${node.minHeight}px`;
  if (node.maxHeight) slotStyle.maxHeight = `${node.maxHeight}px`;

  const hiddenAttrs = node.__ariaHidden
    ? { "aria-hidden": true, "data-hidden-by-condition": true }
    : {};

  return (
    <div
      className={`flex flex-col relative ${isInRow ? "w-full" : "self-stretch"} min-w-0 box-border ${spanClass} ${sizingClass}`}
      style={slotStyle}
      onClick={handleClick}
      id={node.id}
      {...hiddenAttrs}
    >
      <div
        className="flex flex-col flex-1 min-h-0 w-full box-border pointer-events-auto"
        style={{
          borderRadius: node.style?.borderRadius,
          overflow: node.style?.borderRadius ? "hidden" : undefined,
        }}
      >
        {renderWidget(node.widgetKey, node.sizing, stateTree, { repeatPath })}
      </div>
    </div>
  );
}

export function LayoutContainer({
  node,
  children,
  mode,
  activeNodeId,
  onNodeClick,
}) {
  const spanClass = `col-span-${node.span || 12}`;
  const sizingClass = `sizing-${node.sizing || "auto"}`;

  const containerStyle = {
    overflow: node.style?.borderRadius ? "hidden" : undefined,
    ...(node.style || {}),
  };
  if (node.sizing === "fixed" && node.fixedHeight) {
    containerStyle["--fixed-height"] = `${node.fixedHeight}px`;
  }

  const handleClick = (e) => {
    if (mode === "edit" && onNodeClick) {
      e.stopPropagation();
      onNodeClick(node);
    }
  };

  const hiddenAttrs = node.__ariaHidden
    ? { "aria-hidden": true, "data-hidden-by-condition": true }
    : {};

  return (
    <div
      className={`flex flex-col bg-background border border-border rounded box-border transition-all ${spanClass} ${sizingClass}`}
      style={containerStyle}
      onClick={handleClick}
      id={node.id}
      {...hiddenAttrs}
    >
      {children}
    </div>
  );
}

export function LayoutStack({
  node,
  children,
  mode,
  activeNodeId,
  onNodeClick,
}) {
  const spanClass = `col-span-${node.span || 12}`;
  const sizingClass = `sizing-${node.sizing || "auto"}`;
  const stackDirection = node.direction === "horizontal" ? "flex-row" : "flex-col";
  const stackWrap = node.wrap ? "flex-wrap" : "flex-nowrap";
  
  let stackAlign = "items-stretch";
  if (node.align === "flex-start") {
    stackAlign = "items-start";
  } else if (node.align === "flex-end") {
    stackAlign = "items-end";
  } else if (node.align === "center") {
    stackAlign = "items-center";
  } else if (node.align === "stretch") {
    stackAlign = "items-stretch";
  }

  const stackStyle = {
    ...(node.style || {}),
    gap: typeof node.gap === "number" ? `${node.gap}px` : node.gap,
  };

  if (node.sizing === "fixed" && node.fixedHeight) {
    stackStyle["--fixed-height"] = `${node.fixedHeight}px`;
  }

  const handleClick = (e) => {
    if (mode === "edit" && onNodeClick) {
      e.stopPropagation();
      onNodeClick(node);
    }
  };

  const hiddenAttrs = node.__ariaHidden
    ? { "aria-hidden": true, "data-hidden-by-condition": true }
    : {};

  return (
    <div
      className={`flex ${stackDirection} ${stackWrap} ${stackAlign} box-border ${spanClass} ${sizingClass}`}
      style={stackStyle}
      onClick={handleClick}
      id={node.id}
      {...hiddenAttrs}
    >
      {children}
    </div>
  );
}

const MAX_REPEAT_COUNT = 1000;

/**
 * Evaluate a visibility condition with industry-standard semantics:
 *   empty => visible, error => hidden (fail-closed) + warn, else !!value.
 * Uses the shared evaluateVisibilityCondition helper so viewer, editor
 * badge and dimming all agree. Falls back to injected resolveValue when
 * the helper is unavailable (tests).
 */
const evaluateCondition = (node, stateTree, resolveValue) => {
  if (typeof node.condition !== "string" || !node.condition.trim()) return true;
  if (!stateTree) return true;
  try {
    // Prefer shared helper (fail-closed + logging + non-boolean detection).
    const res = evaluateVisibilityCondition(node.condition, stateTree, { nodeId: node.id, silent: false });
    return res.visible;
  } catch {
    // Last-resort fallback for injected mocks: fail-closed.
    try {
      const errors = [];
      const raw = resolveValue
        ? resolveValue(node.condition, stateTree, { errors })
        : undefined;
      if (errors.length > 0) {
        console.warn(`[visibility] condition error on node ${node.id}:`, errors);
        return false;
      }
      return !!raw;
    } catch (e) {
      console.warn(`[visibility] condition error on node ${node.id}:`, e);
      return false;
    }
  }
};

const HIDE_MODES = ["collapse", "preserve-space"];

/**
 * When a hidden node uses preserve-space or keepMounted we must stay mounted
 * (to preserve widget state +/or layout space) and hide via CSS instead of
 * returning null. Returns null when the node should unmount (default).
 */
const getHiddenRenderMode = (node, visible) => {
  if (visible) return null;
  const hideMode = HIDE_MODES.includes(node.hideMode) ? node.hideMode : "collapse";
  if (hideMode === "preserve-space") return "preserve-space";
  if (node.keepMounted) return "keep-mounted";
  return "unmount";
};

const applyHiddenStyle = (node, renderMode) => {
  if (!renderMode || renderMode === "unmount") return node;
  if (renderMode === "preserve-space") {
    return {
      ...node,
      style: { ...(node.style || {}), visibility: "hidden", pointerEvents: "none" },
      __ariaHidden: true,
    };
  }
  // keep-mounted collapsed: no space, but stays mounted so widget state survives
  return {
    ...node,
    style: { ...(node.style || {}), display: "none", pointerEvents: "none" },
    __ariaHidden: true,
  };
};

const evaluateRepeatCollection = (node, stateTree, resolveValue) => {
  if (!node.repeat || !node.repeat.collection || !stateTree || !resolveValue) return null;
  try {
    const collection = resolveValue(node.repeat.collection, stateTree);
    if (!Array.isArray(collection)) return null;
    return collection.slice(0, MAX_REPEAT_COUNT);
  } catch {
    return null;
  }
};

const createScopedStateTree = (stateTree, repeat, item, index) => {
  return {
    ...stateTree,
    variables: {
      ...stateTree.variables,
      [repeat.itemAlias]: item,
      ...(repeat.indexAlias ? { [repeat.indexAlias]: index } : {}),
    },
  };
};

export default function LayoutRenderer({
  node,
  renderWidget,
  mode = "view",
  activeNodeId = null,
  onNodeClick = null,
  stateTree = null,
  resolveValue = null,
  isInRow = false,
  repeatPath = [],
  ...rest
}) {
  if (!node) return null;

  const nodeProps = {
    renderWidget,
    mode,
    activeNodeId,
    onNodeClick,
    stateTree,
    resolveValue,
    isInRow,
    repeatPath,
    ...rest,
  };

  if (mode === "view" && node.repeat && stateTree && resolveValue) {
    const collection = evaluateRepeatCollection(node, stateTree, resolveValue);
    if (!collection || collection.length === 0) return null;

    return collection.map((item, index) => {
      const scopedStateTree = createScopedStateTree(
        stateTree,
        node.repeat,
        item,
        index
      );
      // F12/B24: accumulate the repeat trail so descendant widget placements
      // derive per-iteration runtime instance IDs (isolated state/methods).
      const childRepeatPath = [...(repeatPath || []), `${node.id}:${index}`];

      return (
        <LayoutRenderer
          key={`${node.id}_repeat_${index}`}
          node={{ ...node, repeat: undefined, id: `${node.id}_repeat_${index}` }}
          {...nodeProps}
          repeatPath={childRepeatPath}
          stateTree={scopedStateTree}
        />
      );
    });
  }

  // Visibility: empty => show, error => hide (fail-closed, logged inside helper).
  // preserve-space / keepMounted stay mounted via CSS so widget state survives.
  let effectiveNode = node;
  let hiddenRenderMode = null;
  if (mode === "view" && node.condition && stateTree && resolveValue) {
    const visible = evaluateCondition(node, stateTree, resolveValue);
    hiddenRenderMode = getHiddenRenderMode(node, visible);
    if (hiddenRenderMode === "unmount") return null;
    if (hiddenRenderMode) effectiveNode = applyHiddenStyle(node, hiddenRenderMode);
  }
  const hiddenAriaProps = hiddenRenderMode && hiddenRenderMode !== "unmount"
    ? { "aria-hidden": true, "data-hidden-by-condition": true, "data-hide-mode": hiddenRenderMode }
    : {};

  switch (effectiveNode.type) {
    case "column":
      return (
        <div className="flex flex-col w-full gap-2 box-border" id={effectiveNode.id} style={effectiveNode.style} {...hiddenAriaProps}>
          {effectiveNode.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} />
          ))}
        </div>
      );

    case "row":
      return (
        <LayoutRow key={effectiveNode.id} node={effectiveNode} mode={mode}>
          {effectiveNode.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} isInRow={true} />
          ))}
        </LayoutRow>
      );

    case "widget":
      return (
        <LayoutWidgetSlot
          key={effectiveNode.id}
          node={effectiveNode}
          renderWidget={renderWidget}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
          stateTree={stateTree}
          isInRow={isInRow}
          repeatPath={repeatPath}
        />
      );

    case "container":
      return (
        <LayoutContainer
          key={effectiveNode.id}
          node={effectiveNode}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
        >
          <LayoutRenderer node={effectiveNode.children} {...nodeProps} isInRow={false} />
        </LayoutContainer>
      );

    case "stack":
      return (
        <LayoutStack
          key={effectiveNode.id}
          node={effectiveNode}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
        >
          {effectiveNode.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} isInRow={false} />
          ))}
        </LayoutStack>
      );

    case "z-stack": {
      const sizingClass = `sizing-${effectiveNode.sizing || "fill"}`;
      const layerOpacities = effectiveNode.layerOpacities || [];
      const zStackStyle = {
        padding: effectiveNode.style?.padding,
        margin: effectiveNode.style?.margin,
        borderRadius: effectiveNode.style?.borderRadius,
        ...(effectiveNode.style || {}),
      };
      if (effectiveNode.sizing === "fixed" && effectiveNode.fixedHeight) {
        zStackStyle["--fixed-height"] = `${effectiveNode.fixedHeight}px`;
      }

      return (
        <div
          key={effectiveNode.id}
          id={effectiveNode.id}
          className={`relative box-border col-span-${effectiveNode.span || 12} ${sizingClass}`}
          style={zStackStyle}
          {...hiddenAriaProps}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              width: "100%",
              minHeight: 40,
            }}
          >
            {node.children?.map((child, idx) => (
              <div
                key={child.id}
                style={{
                  gridColumn: "1 / -1",
                  gridRow: "1 / -1",
                  zIndex: idx + 1,
                  opacity: layerOpacities[idx] ?? 1,
                  position: "relative",
                  width: "100%",
                }}
              >
                <LayoutRenderer node={child} {...nodeProps} isInRow={false} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
