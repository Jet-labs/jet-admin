import React, { useState, useEffect } from "react";

export default function LayoutResizeHandle({ node, onResize }) {
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    let startX = 0;
    let startSpan = node.span || 6;
    let colWidth = 0;

    const handleMouseDown = (e) => {
      startX = e.clientX;
      const element = document.getElementById(node.id);
      if (element) {
        // Find the parent row width to calculate column width
        const row = element.closest(".layout-row");
        if (row) {
          colWidth = row.getBoundingClientRect().width / 12;
        }
      }
    };

    const handleMouseMove = (e) => {
      if (colWidth === 0) return;
      const deltaX = e.clientX - startX;
      const deltaSpan = Math.round(deltaX / colWidth);
      const newSpan = Math.max(1, Math.min(12, startSpan + deltaSpan));
      if (newSpan !== node.span) {
        onResize(node.id, newSpan);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, node.id, node.span, onResize]);

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
    />
  );
}
