import React from "react";
import "./layout.css";

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

  return (
    <div
      className={`layout-row grid grid-cols-12 w-full gap-2 items-stretch box-border ${sizingClass}`}
      id={node.id}
      style={rowStyle}
    >
      {children}
    </div>
  );
}

export function LayoutWidgetSlot({
  node,
  renderWidget,
  mode,
  activeNodeId,
  onNodeClick,
  stateTree = null,
}) {
  const spanClass = `col-span-${node.span || 6}`;
  const sizingClass = `sizing-${node.sizing || "fill"}`;
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
  };
  if (node.sizing === "fixed" && node.fixedHeight) {
    slotStyle["--fixed-height"] = `${node.fixedHeight}px`;
  }
  if (node.minHeight) slotStyle.minHeight = `${node.minHeight}px`;
  if (node.maxHeight) slotStyle.maxHeight = `${node.maxHeight}px`;

  return (
    <div
      className={`flex flex-col relative w-full min-w-0 box-border ${spanClass} ${sizingClass}`}
      style={slotStyle}
      onClick={handleClick}
      id={node.id}
    >
      <div
        className="flex flex-col flex-1 min-h-0 w-full box-border pointer-events-auto"
        style={{
          borderRadius: node.style?.borderRadius,
          overflow: node.style?.borderRadius ? "hidden" : undefined,
        }}
      >
        {renderWidget(node.widgetKey, node.sizing, stateTree)}
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

  return (
    <div
      className={`flex flex-col bg-background border border-border rounded-md box-border transition-all ${spanClass} ${sizingClass}`}
      style={containerStyle}
      onClick={handleClick}
      id={node.id}
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
  const stackAlign = node.align ? `items-${node.align}` : "items-stretch";

  const stackStyle = {
    ...(node.style || {}),
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

  return (
    <div
      className={`flex ${stackDirection} ${stackWrap} ${stackAlign} gap-2 box-border ${spanClass} ${sizingClass}`}
      style={stackStyle}
      onClick={handleClick}
      id={node.id}
    >
      {children}
    </div>
  );
}

/**
 * Maximum number of iterations allowed for repeat nodes.
 * Prevents accidental DOM explosion from large datasets.
 */
const MAX_REPEAT_COUNT = 1000;

/**
 * Evaluates a node's condition expression against the state tree.
 * Returns true (render) if no condition is set, or if the expression is truthy.
 *
 * @param {object} node - Layout node
 * @param {object|null} stateTree - Runtime state tree
 * @param {function} resolveValue - Expression resolver function
 * @returns {boolean}
 */
const evaluateCondition = (node, stateTree, resolveValue) => {
  if (!node.condition || !stateTree || !resolveValue) return true;
  try {
    const result = resolveValue(node.condition, stateTree);
    return !!result;
  } catch {
    // If expression fails, default to visible (don't break page)
    return true;
  }
};

/**
 * Evaluates a node's repeat configuration and returns the collection array.
 * Returns null if no repeat is configured.
 *
 * @param {object} node - Layout node
 * @param {object|null} stateTree - Runtime state tree
 * @param {function} resolveValue - Expression resolver function
 * @returns {Array|null}
 */
const evaluateRepeatCollection = (node, stateTree, resolveValue) => {
  if (!node.repeat || !node.repeat.collection || !stateTree || !resolveValue) return null;
  try {
    const collection = resolveValue(node.repeat.collection, stateTree);
    if (!Array.isArray(collection)) return null;
    // Apply safety cap
    return collection.slice(0, MAX_REPEAT_COUNT);
  } catch {
    return null;
  }
};

/**
 * Creates a scoped state tree by injecting loop item/index as variables.
 *
 * @param {object} stateTree - Parent state tree
 * @param {object} repeat - Repeat config { itemAlias, indexAlias }
 * @param {*} item - Current iteration item
 * @param {number} index - Current iteration index
 * @returns {object} Scoped state tree
 */
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
    ...rest,
  };

  // ── Repeat (iteration) handling ──
  // In view mode, evaluate repeat config to produce N clones.
  // In edit mode, render a single instance (editor shows a badge instead).
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

      // Render the node without repeat (to prevent infinite recursion),
      // with a unique key/id for each iteration
      return (
        <LayoutRenderer
          key={`${node.id}_repeat_${index}`}
          node={{ ...node, repeat: undefined, id: `${node.id}_repeat_${index}` }}
          {...nodeProps}
          stateTree={scopedStateTree}
        />
      );
    });
  }

  // ── Condition (show/hide) handling ──
  // In view mode, evaluate condition expression.
  // In edit mode, always render (editor shows a badge instead).
  if (mode === "view" && node.condition && stateTree && resolveValue) {
    if (!evaluateCondition(node, stateTree, resolveValue)) {
      return null;
    }
  }

  // ── Standard node rendering ──
  switch (node.type) {
    case "column":
      return (
        <div className="flex flex-col w-full gap-2 box-border" id={node.id}>
          {node.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} />
          ))}
        </div>
      );

    case "row":
      return (
        <LayoutRow key={node.id} node={node} mode={mode}>
          {node.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} />
          ))}
        </LayoutRow>
      );

    case "widget":
      return (
        <LayoutWidgetSlot
          key={node.id}
          node={node}
          renderWidget={renderWidget}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
          stateTree={stateTree}
        />
      );

    case "container":
      return (
        <LayoutContainer
          key={node.id}
          node={node}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
        >
          <LayoutRenderer node={node.children} {...nodeProps} />
        </LayoutContainer>
      );

    case "stack":
      return (
        <LayoutStack
          key={node.id}
          node={node}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
        >
          {node.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} />
          ))}
        </LayoutStack>
      );

    case "z-stack": {
      const sizingClass = `sizing-${node.sizing || "fill"}`;
      const zStackStyle = {
        padding: node.style?.padding,
        margin: node.style?.margin,
        borderRadius: node.style?.borderRadius,
        ...(node.style || {}),
      };
      if (node.sizing === "fixed" && node.fixedHeight) {
        zStackStyle["--fixed-height"] = `${node.fixedHeight}px`;
      }

      const activeLayerIndex = node.activeLayerIndex || 0;

      return (
        <div
          key={node.id}
          id={node.id}
          className={`relative box-border grid grid-cols-1 grid-rows-1 col-span-${node.span || 12} ${sizingClass}`}
          style={zStackStyle}
        >
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
            {node.children?.map((child, idx) => {
              const isLayerActive = idx === activeLayerIndex;
              return (
                <div
                  key={child.id}
                  style={{
                    gridArea: "1 / 1 / 2 / 2",
                    width: "100%",
                    zIndex: isLayerActive ? 10 : 1,
                    opacity: isLayerActive ? 1 : 0,
                    pointerEvents: isLayerActive ? "auto" : "none",
                    transition: "opacity 0.2s ease",
                    position: "relative",
                    boxSizing: "border-box",
                  }}
                >
                  <LayoutRenderer node={child} {...nodeProps} />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
