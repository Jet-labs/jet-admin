import React from "react";

export default function LayoutStack({
  node,
  children,
  mode,
  activeNodeId,
  onNodeClick,
}) {
  const spanClass = `col-span-${node.span || 12}`;
  const sizingClass = `sizing-${node.sizing || "auto"}`;
  const isActive = activeNodeId === node.id;

  const stackStyle = {
    flexDirection: node.direction === "horizontal" ? "row" : "column",
    flexWrap: node.wrap ? "wrap" : "nowrap",
    gap: node.style?.gap ?? (typeof node.gap === "number" ? `${node.gap}px` : "16px"),
    alignItems: node.style?.alignItems ?? node.align ?? "stretch",
    padding: node.style?.padding,
    margin: node.style?.margin,
    borderRadius: node.style?.borderRadius,
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
      className={`layout-stack ${spanClass} ${sizingClass} ${
        mode === "edit" ? "layout-stack-edit" : ""
      } ${isActive ? "active-node" : ""}`}
      style={stackStyle}
      onClick={handleClick}
      id={node.id}
    >
      {children}
    </div>
  );
}
