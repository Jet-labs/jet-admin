import React, { useState } from "react";
import { useEditor } from "@craftjs/core";

export default function LayoutResizeHandle({ node, onResize }) {
  const [isResizing, setIsResizing] = useState(false);
  const { actions, query } = useEditor();

  const handleStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startSpan = node.span || 6;
    let colWidth = 0;
    const element = document.getElementById(node.id);
    if (element) {
      const row = element.closest(".craft-node-row") || element.closest(".layout-row");
      if (row) {
        const rowWidth = row.getBoundingClientRect().width;
        const computedGap = parseFloat(getComputedStyle(row).gap) || 8;
        // Account for 11 gaps between 12 columns
        colWidth = (rowWidth - 11 * computedGap) / 12;
      }
    }

    const onMouseMove = (moveEvent) => {
      if (colWidth === 0) return;
      const deltaX = moveEvent.clientX - startX;
      const deltaSpan = Math.round(deltaX / colWidth);
      const newSpan = Math.max(1, Math.min(12, startSpan + deltaSpan));
      onResize(node.id, newSpan);

      // Perform real-time row balancing if in a grid row
      const currentNode = query.node(node.id).get();
      const parentId = currentNode?.data?.parent;
      if (parentId) {
        const parentNode = query.node(parentId).get();
        if (parentNode?.data?.displayName === "CanvasRow") {
          const childIds = parentNode.data.nodes || [];
          const children = childIds.map((cid) => {
            const liveNode = query.node(cid).get();
            const currentSpan = cid === node.id ? newSpan : (liveNode?.data?.props?.span || 6);
            return { id: cid, span: currentSpan };
          });

          let sum = children.reduce((acc, c) => acc + c.span, 0);
          let excess = sum - 12;

          if (excess > 0) {
            // Shrink other children
            while (excess > 0) {
              let candidateIdx = -1;
              let maxScore = -9999;

              for (let i = 0; i < children.length; i++) {
                const c = children[i];
                if (c.span > 1 && c.id !== node.id) {
                  const score = c.span;
                  if (score > maxScore) {
                    maxScore = score;
                    candidateIdx = i;
                  }
                }
              }

              if (candidateIdx === -1) break;

              children[candidateIdx].span--;
              excess--;
            }

            // Apply the shrunk spans to the editor state
            children.forEach((c) => {
              if (c.id !== node.id) {
                const liveNode = query.node(c.id).get();
                if (liveNode?.data?.props?.span !== c.span) {
                  actions.setProp(c.id, (props) => {
                    props.span = c.span;
                  });
                }
              }
            });
          }
        }
      }
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
