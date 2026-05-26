import React, { useState } from "react";

export default function LayoutDropIndicator({ type, onDropNode, ...rest }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);

    const widgetKey = e.dataTransfer.getData("widget");
    const moveNodeId = e.dataTransfer.getData("moveNodeId");

    if (widgetKey) {
      onDropNode({ type: "new", widgetKey });
    } else if (moveNodeId) {
      onDropNode({ type: "move", nodeId: moveNodeId });
    }
  };

  let className = "layout-drop-indicator-cell";
  if (type === "row") {
    className = "layout-drop-indicator-row";
  } else if (type === "cell-left") {
    className = "layout-drop-indicator-left";
  } else if (type === "cell-right") {
    className = "layout-drop-indicator-right";
  }

  return (
    <div
      className={`${className} ${isOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...rest}
    />
  );
}
