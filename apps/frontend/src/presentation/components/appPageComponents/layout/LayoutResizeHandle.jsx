import React, { useState } from "react";

export default function LayoutResizeHandle({ node, onResize }) {
  const [isResizing, setIsResizing] = useState(false);

  const handleStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startSpan = node.span || 6;
    let colWidth = 0;
    const element = document.getElementById(node.id);
    if (element) {
      const row = element.closest(".layout-row");
      if (row) {
        colWidth = row.getBoundingClientRect().width / 12;
      }
    }

    const onMouseMove = (moveEvent) => {
      if (colWidth === 0) return;
      const deltaX = moveEvent.clientX - startX;
      const deltaSpan = Math.round(deltaX / colWidth);
      const newSpan = Math.max(1, Math.min(12, startSpan + deltaSpan));
      onResize(node.id, newSpan);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      className={`layout-resize-handle ${isResizing ? "active" : ""}`}
      onMouseDown={handleStart}
      draggable={true}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    />
  );
}
