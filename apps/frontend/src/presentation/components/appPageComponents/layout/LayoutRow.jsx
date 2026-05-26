import React from "react";

export default function LayoutRow({ node, children, mode }) {
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
  }

  const sizingClass = `sizing-${node.sizing || "auto"}`;

  return (
    <div
      className={`layout-row ${sizingClass} ${mode === "edit" ? "layout-row-edit" : ""}`}
      id={node.id}
      style={rowStyle}
    >
      {children}
    </div>
  );
}
