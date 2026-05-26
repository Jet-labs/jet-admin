import React from "react";

export default function LayoutContainer({
  node,
  children,
  mode,
  activeNodeId,
  onNodeClick,
}) {
  const spanClass = `col-span-${node.span || 12}`;
  const sizingClass = `sizing-${node.sizing || "auto"}`;
  const isActive = activeNodeId === node.id;

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
      className={`layout-container ${spanClass} ${sizingClass} ${
        mode === "edit" ? "layout-container-edit" : ""
      } ${isActive ? "active-node" : ""}`}
      style={containerStyle}
      onClick={handleClick}
      id={node.id}
    >
      {children}
    </div>
  );
}
