import React from "react";

export default function LayoutWidgetSlot({
  node,
  renderWidget,
  mode,
  activeNodeId,
  onNodeClick,
}) {
  const spanClass = `col-span-${node.span || 6}`;
  const sizingClass = `sizing-${node.sizing || "fill"}`;
  const isActive = activeNodeId === node.id;

  const slotStyle = {};
  if (node.sizing === "fixed" && node.fixedHeight) {
    slotStyle["--fixed-height"] = `${node.fixedHeight}px`;
  }
  if (node.minHeight) slotStyle.minHeight = `${node.minHeight}px`;
  if (node.maxHeight) slotStyle.maxHeight = `${node.maxHeight}px`;

  const handleClick = (e) => {
    if (mode === "edit" && onNodeClick) {
      e.stopPropagation();
      onNodeClick(node);
    }
  };

  return (
    <div
      className={`layout-widget-slot ${spanClass} ${sizingClass} ${
        mode === "edit" ? "layout-widget-slot-edit" : ""
      } ${isActive ? "active-node" : ""}`}
      style={slotStyle}
      onClick={handleClick}
      id={node.id}
    >
      <div className="layout-widget-wrapper">
        {renderWidget(node.widgetKey, node.sizing)}
      </div>
    </div>
  );
}
