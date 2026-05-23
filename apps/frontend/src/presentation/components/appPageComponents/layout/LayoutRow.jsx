import React from "react";

export default function LayoutRow({ node, children, mode }) {
  const rowStyle = {};
  if (typeof node.gap === "number") {
    rowStyle.gap = `${node.gap}px`;
  }

  return (
    <div
      className={`layout-row ${mode === "edit" ? "layout-row-edit" : ""}`}
      id={node.id}
      style={rowStyle}
    >
      {children}
    </div>
  );
}
