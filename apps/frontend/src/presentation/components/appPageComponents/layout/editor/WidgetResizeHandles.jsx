/**
 * WidgetResizeHandles.jsx
 *
 * 8-handle pixel-based resize overlay for CanvasWidgetSlot.
 *
 * Supports heightOnly mode: when true, only renders the n/s handles
 * (for height resizing). Used when the widget is in a grid row and
 * width is controlled by column span, not pixels.
 *
 * Fix: Uses setPointerCapture on the handle element for reliable mouse
 * tracking, and toggles a CSS class on the parent to disable dragging
 * instead of directly manipulating the draggable DOM attribute.
 */
import React, { useEffect, useRef } from "react";

const HANDLE_SIZE = 8;

const ALL_HANDLES = [
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
      e.stopPropagation();
      e.preventDefault();

      let craftParent = null;
      let node = el.parentElement;
      while (node) {
        if (node.classList?.contains("craft-node")) {
          craftParent = node;
          break;
        }
        node = node.parentElement;
      }
      if (craftParent) {
        craftParent.classList.add("craft-node-resizing");
      }

      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // setPointerCapture not supported — fall back to window listeners
      }

      const startX = e.clientX;
      const startY = e.clientY;

      const rect = craftParent
        ? craftParent.getBoundingClientRect()
        : el.parentElement?.getBoundingClientRect();
      const startW = width != null ? width : (rect ? Math.round(rect.width) : 200);
      const startH = height != null ? height : (rect ? Math.round(rect.height) : 100);

      const onMouseMove = (mv) => {
        const dx = mv.clientX - startX;
        const dy = mv.clientY - startY;
        const newW = wDir !== 0 && startW != null ? Math.max(40, startW + wDir * dx) : (wDir !== 0 ? null : startW);
        const newH = hDir !== 0 && startH != null ? Math.max(24, startH + hDir * dy) : (hDir !== 0 ? null : startH);
        onResize(newW, newH);
      };

      const onMouseUp = () => {
        if (craftParent) {
          craftParent.classList.remove("craft-node-resizing");
        }
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // noop
        }
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

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

export default function WidgetResizeHandles({ nodeId, width, height, onResize, heightOnly = false }) {
  const handles = heightOnly
    ? ALL_HANDLES.filter((h) => h.wDir === 0)
    : ALL_HANDLES;

  return (
    <>
      {handles.map(({ id, cursor, top, left, wDir, hDir }) => (
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
