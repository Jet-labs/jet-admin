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

  return (
    <div
      className={`flex flex-col relative ${isInRow ? "w-full" : "self-stretch"} min-w-0 box-border ${spanClass} ${sizingClass}`}
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

  return (
    <div
      className={`flex ${stackDirection} ${stackWrap} ${stackAlign} box-border ${spanClass} ${sizingClass}`}
      style={stackStyle}
      onClick={handleClick}
      id={node.id}
    >
      {children}
    </div>
  );
}

const MAX_REPEAT_COUNT = 1000;

const evaluateCondition = (node, stateTree, resolveValue) => {
  if (!node.condition || !stateTree || !resolveValue) return true;
  try {
    const result = resolveValue(node.condition, stateTree);
    return !!result;
  } catch {
    return true;
  }
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

  if (mode === "view" && node.condition && stateTree && resolveValue) {
    if (!evaluateCondition(node, stateTree, resolveValue)) {
      return null;
    }
  }

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
            <LayoutRenderer key={child.id} node={child} {...nodeProps} isInRow={true} />
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
          isInRow={isInRow}
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
          <LayoutRenderer node={node.children} {...nodeProps} isInRow={false} />
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
            <LayoutRenderer key={child.id} node={child} {...nodeProps} isInRow={false} />
          ))}
        </LayoutStack>
      );

    case "z-stack": {
      const sizingClass = `sizing-${node.sizing || "fill"}`;
      const layerOpacities = node.layerOpacities || [];
      const zStackStyle = {
        padding: node.style?.padding,
        margin: node.style?.margin,
        borderRadius: node.style?.borderRadius,
        ...(node.style || {}),
      };
      if (node.sizing === "fixed" && node.fixedHeight) {
        zStackStyle["--fixed-height"] = `${node.fixedHeight}px`;
      }

      return (
        <div
          key={node.id}
          id={node.id}
          className={`relative box-border col-span-${node.span || 12} ${sizingClass}`}
          style={zStackStyle}
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
