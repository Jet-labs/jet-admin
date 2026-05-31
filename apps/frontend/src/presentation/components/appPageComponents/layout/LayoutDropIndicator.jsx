import React, { useState } from "react";

export default function LayoutDropIndicator({ type, onDropNode, className: customClassName, ...rest }) {
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

  let baseClassName = "layout-drop-indicator-cell";
  if (type === "row") {
    baseClassName = "layout-drop-indicator-row";
  } else if (type === "cell-left") {
    baseClassName = "layout-drop-indicator-left";
  } else if (type === "cell-right") {
    baseClassName = "layout-drop-indicator-right";
  }

  const finalClassName = `${baseClassName} ${isOver ? "drag-over" : ""} ${customClassName || ""}`.trim();

  return (
    <div
      className={finalClassName}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...rest}
    />
  );
}
