/**
 * WidgetResizeHandles.jsx
 *
 * 8-handle pixel-based resize overlay for CanvasWidgetSlot.
 *
 * KEY: Craft.js sets draggable="true" on the outer widget div, which causes the
 * browser to start HTML5 DnD when the user drags — killing mousemove events
 * and breaking resize. We fix this by:
 *   1. Disabling draggable on the parent on mousedown (before any move)
 *   2. Re-enabling it on mouseup
 */
import React, { useEffect, useRef } from "react";

const HANDLE_SIZE = 8;

// [cursor, top%, left%, wDir, hDir]
// wDir: +1 = right edge grows, -1 = left edge (moves left = grows), 0 = no change
// hDir: +1 = bottom grows, -1 = top edge, 0 = no change
const HANDLES = [
  { id: "n",  cursor: "n-resize",  top: 0,   left: 50,  wDir:  0, hDir: -1 },
  { id: "s",  cursor: "s-resize",  top: 100, left: 50,  wDir:  0, hDir:  1 },
  { id: "e",  cursor: "e-resize",  top: 50,  left: 100, wDir:  1, hDir:  0 },
  { id: "w",  cursor: "w-resize",  top: 50,  left: 0,   wDir: -1, hDir:  0 },
  { id: "ne", cursor: "ne-resize", top: 0,   left: 100, wDir:  1, hDir: -1 },
  { id: "nw", cursor: "nw-resize", top: 0,   left: 0,   wDir: -1, hDir: -1 },
  { id: "se", cursor: "se-resize", top: 100, left: 100, wDir:  1, hDir:  1 },
  { id: "sw", cursor: "sw-resize", top: 100, left: 0,   wDir: -1, hDir:  1 },
];

function ResizeHandle({ cursor, top, left, wDir, hDir, width, height, onResize }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseDown = (e) => {
      e.stopPropagation();   // native capture — fires before Craft.js listeners
      e.preventDefault();

      // Disable draggable on the Craft.js-connected parent so HTML5 DnD
      // doesn't hijack mousemove events during the resize.
      let draggableEl = null;
      let node = el.parentElement;
      while (node) {
        if (node.getAttribute("draggable") === "true") { draggableEl = node; break; }
        node = node.parentElement;
      }
      if (draggableEl) draggableEl.setAttribute("draggable", "false");

      const startX = e.clientX;
      const startY = e.clientY;

      // If a dimension is null (CSS-driven), read the rendered pixel size
      // so we have a concrete baseline to delta from.
      const rect = draggableEl ? draggableEl.getBoundingClientRect() : el.parentElement?.getBoundingClientRect();
      const startW = width  != null ? width  : (rect ? Math.round(rect.width)  : 200);
      const startH = height != null ? height : (rect ? Math.round(rect.height) : 100);

      const onMouseMove = (mv) => {
        const dx = mv.clientX - startX;
        const dy = mv.clientY - startY;
        const newW = wDir !== 0 && startW != null ? Math.max(40,  startW + wDir * dx) : (wDir !== 0 ? null : startW);
        const newH = hDir !== 0 && startH != null ? Math.max(24,  startH + hDir * dy) : (hDir !== 0 ? null : startH);
        onResize(newW, newH);
      };

      const onMouseUp = () => {
        if (draggableEl) draggableEl.setAttribute("draggable", "true");
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    // Use capture:true so we intercept before Craft.js's bubble-phase listener
    el.addEventListener("mousedown", onMouseDown, { capture: true });
    return () => el.removeEventListener("mousedown", onMouseDown, { capture: true });
  }, [wDir, hDir, width, height, onResize]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        transform: "translate(-50%, -50%)",
        cursor,
        zIndex: 200,
        backgroundColor: "hsl(var(--primary))",
        border: "1.5px solid white",
        borderRadius: 2,
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        pointerEvents: "all",
      }}
    />
  );
}

export default function WidgetResizeHandles({ nodeId, width, height, onResize }) {
  return (
    <>
      {HANDLES.map(({ id, cursor, top, left, wDir, hDir }) => (
        <ResizeHandle
          key={id}
          cursor={cursor}
          top={top}
          left={left}
          wDir={wDir}
          hDir={hDir}
          width={width}
          height={height}
          onResize={onResize}
        />
      ))}
    </>
  );
}
